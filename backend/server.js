const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

const cache = new NodeCache({ stdTTL: 3600 * 3 }); // 3 hours cache

// In-memory data store for dashboard
let db = {
    items: [],
    stock: [],
    customers: [],
    po: [],
    orderStatus: [],
    webhooks: [] // Webhooks are populated differently, keeping empty array for now
};
let lastUpdated = {
    items: null,
    stock: null,
    customers: null,
    po: null,
    orderStatus: null,
    webhooks: null
};

let latestOrderNo = null; // Track the most recently created order for dashboard stats

const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getFormattedDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function parseConcatenatedJson(str) {
    if (!str) return [];
    if (typeof str !== 'string') return [];
    const results = [];
    let braceCount = 0;
    let startIdx = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (!inString) {
            if (char === '{') {
                if (braceCount === 0) {
                    startIdx = i;
                }
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    const jsonStr = str.substring(startIdx, i + 1);
                    try {
                        results.push(JSON.parse(jsonStr));
                    } catch (e) {
                        // ignore malformed chunks
                    }
                }
            }
        }
    }
    return results;
}

let dashboardDataCache = {
    items: { stats: { today: 0, week: 0, total: 0 }, lastUpdated: null },
    stock: { stats: { today: 0, week: 0, total: 0 }, lastUpdated: null },
    customers: { stats: { today: 0, week: 0, total: 0 }, lastUpdated: null },
    po: { stats: { today: 0, week: 0, total: 0 }, lastUpdated: null },
    lastUpdated: null
};

async function fetchDashboardStats(apiKey) {
    try {
        console.log("🔄 Fetching dashboard stats with custom date/time parameters...");
        const today = new Date();
        
        // Format dates for Master & Stock
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayStr = getFormattedDateTime(todayStart);

        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);
        const oneWeekAgoStr = getFormattedDateTime(oneWeekAgo);

        const totalStr = "2018-01-01 00:00:00";

        // Format dates for Customers & PO
        const todayYMD = getLocalDateString(today);
        const oneWeekAgoYMD = getLocalDateString(oneWeekAgo);
        const totalYMD = "2018-01-01";

        // 1. Fetch Item Master stats
        let itemsToday = 0;
        let itemsWeek = 0;
        let itemsTotal = 0;
        try {
            const resToday = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_master_data", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": todayStr, "apiKey": apiKey
            }, { timeout: 15000 });
            itemsToday = (resToday.data && resToday.data.data) ? resToday.data.data.length : 0;
        } catch(e) { console.error("Error fetching itemsToday stats:", e.message); }

        try {
            const resWeek = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_master_data", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": oneWeekAgoStr, "apiKey": apiKey
            }, { timeout: 15000 });
            itemsWeek = (resWeek.data && resWeek.data.data) ? resWeek.data.data.length : 0;
        } catch(e) { console.error("Error fetching itemsWeek stats:", e.message); }

        try {
            const resTotal = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_master_data", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": totalStr, "apiKey": apiKey
            }, { timeout: 30000 });
            itemsTotal = (resTotal.data && resTotal.data.data) ? resTotal.data.data.length : 0;
        } catch(e) { console.error("Error fetching itemsTotal stats:", e.message); }

        // 2. Fetch Stock Details stats
        let stockToday = 0;
        let stockWeek = 0;
        let stockTotal = 0;
        try {
            const resToday = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_stock_data", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": todayStr, "itemCodes": [], "apiKey": apiKey
            }, { timeout: 15000 });
            stockToday = (resToday.data && resToday.data.data) ? resToday.data.data.length : 0;
        } catch(e) { console.error("Error fetching stockToday stats:", e.message); }

        try {
            const resWeek = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_stock_data", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": oneWeekAgoStr, "itemCodes": [], "apiKey": apiKey
            }, { timeout: 15000 });
            stockWeek = (resWeek.data && resWeek.data.data) ? resWeek.data.data.length : 0;
        } catch(e) { console.error("Error fetching stockWeek stats:", e.message); }

        try {
            const resTotal = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_stock_data", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": totalStr, "itemCodes": [], "apiKey": apiKey
            }, { timeout: 45000 });
            stockTotal = (resTotal.data && resTotal.data.data) ? resTotal.data.data.length : 0;
        } catch(e) { console.error("Error fetching stockTotal stats:", e.message); }

        // 3. Fetch Local Customers stats
        let customersToday = 0;
        let customersWeek = 0;
        let customersTotal = 0;
        try {
            const resToday = await axios.post("http://117.211.64.158:21000/ws_c2_services_fetch_local_customer", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": todayYMD, "toDate": todayYMD
            }, { timeout: 15000 });
            const data = resToday.data;
            const parsed = Array.isArray(data) ? data : (data.data || []);
            customersToday = parsed.length;
        } catch(e) { console.error("Error fetching customersToday stats:", e.message); }

        try {
            const resWeek = await axios.post("http://117.211.64.158:21000/ws_c2_services_fetch_local_customer", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": oneWeekAgoYMD, "toDate": todayYMD
            }, { timeout: 15000 });
            const data = resWeek.data;
            const parsed = Array.isArray(data) ? data : (data.data || []);
            customersWeek = parsed.length;
        } catch(e) { console.error("Error fetching customersWeek stats:", e.message); }

        try {
            const resTotal = await axios.post("http://117.211.64.158:21000/ws_c2_services_fetch_local_customer", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": totalYMD, "toDate": todayYMD
            }, { timeout: 30000 });
            const data = resTotal.data;
            const parsed = Array.isArray(data) ? data : (data.data || []);
            customersTotal = parsed.length;
        } catch(e) { console.error("Error fetching customersTotal stats:", e.message); }

        // 4. Fetch Purchase Orders stats
        let poToday = 0;
        let poWeek = 0;
        let poTotal = 0;
        try {
            const resToday = await axios.post("http://117.211.64.158:21000/ws_c2_services_po_fetch", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": todayYMD, "toDate": todayYMD
            }, { responseType: 'text', timeout: 15000 });
            poToday = parseConcatenatedJson(resToday.data).length;
        } catch(e) { console.error("Error fetching poToday stats:", e.message); }

        try {
            const resWeek = await axios.post("http://117.211.64.158:21000/ws_c2_services_po_fetch", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": oneWeekAgoYMD, "toDate": todayYMD
            }, { responseType: 'text', timeout: 15000 });
            poWeek = parseConcatenatedJson(resWeek.data).length;
        } catch(e) { console.error("Error fetching poWeek stats:", e.message); }

        try {
            const resTotal = await axios.post("http://117.211.64.158:21000/ws_c2_services_po_fetch", {
                "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": totalYMD, "toDate": todayYMD
            }, { responseType: 'text', timeout: 30000 });
            poTotal = parseConcatenatedJson(resTotal.data).length;
        } catch(e) { console.error("Error fetching poTotal stats:", e.message); }

        const timestamp = new Date().toISOString();
        dashboardDataCache = {
            items: { stats: { today: itemsToday, week: itemsWeek, total: itemsTotal }, lastUpdated: timestamp },
            stock: { stats: { today: stockToday, week: stockWeek, total: stockTotal }, lastUpdated: timestamp },
            customers: { stats: { today: customersToday, week: customersWeek, total: customersTotal }, lastUpdated: timestamp },
            po: { stats: { today: poToday, week: poWeek, total: poTotal }, lastUpdated: timestamp },
            lastUpdated: timestamp
        };
        console.log("✅ Dashboard stats successfully updated!");
    } catch(err) {
        console.error("fetchDashboardStats failed:", err.message);
    }
}

// Auto fetch every 3 hours (10800000 ms)
setInterval(() => {
    console.log("⏰ Running scheduled auto-fetch every 3 hours...");
    autoFetchAll();
}, 10800000);

async function autoFetchAll() {
    try {
        const tokenData = await fetchToken();
        const apiKey = tokenData?.apiKey;
        if(apiKey) {
            await fetchDashboardStats(apiKey);
            await fetchMasterData(apiKey);
            await fetchStockData(apiKey);
            await fetchCustomersData(apiKey);
            await fetchPOData(apiKey);
            await fetchOrderStatusData(apiKey, latestOrderNo);
        }
    } catch(err) {
        console.error("Auto fetch error:", err.message);
    }
}

// Automatically fetch on startup
setTimeout(autoFetchAll, 2000);

async function fetchToken() {
    try {
        const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "securityKey": "VURBd01ESXdNakU9" };
        const res = await axios.post("http://117.211.64.158:21000/ws_c2_services_generate_token", payload, {timeout: 10000});
        cache.set("default_token", res.data.apiKey);
        return res.data;
    } catch(err) {
        console.error("fetchToken failed:", err.message);
        throw err;
    }
}

async function fetchMasterData(apiKey) {
    try {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const oneWeekAgoStr = d.toISOString().slice(0, 19).replace("T", " ");
        const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": oneWeekAgoStr, "apiKey": apiKey };
        const res = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_master_data", payload, {timeout: 10000});
        if (res.data && res.data.data) {
            db.items = res.data.data;
            lastUpdated.items = new Date().toISOString();
        }
    } catch(err) {
        console.error("fetchMasterData failed:", err.message);
    }
}

async function fetchStockData(apiKey) {
    try {
        const payload = { 
            "c2Code": "P00000", 
            "storeId": "001", 
            "prodCode": "02", 
            "inputDateTime": new Date().toISOString().slice(0, 19).replace("T", " "),
            "itemCodes": [], 
            "apiKey": apiKey 
        };
        const res = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_stock_data", payload, {timeout: 10000});
        if (res.data && res.data.data) {
            db.stock = res.data.data;
            lastUpdated.stock = new Date().toISOString();
        }
    } catch(err) {
        console.error("fetchStockData failed:", err.message);
    }
}

async function fetchCustomersData(apiKey) {
    try {
        const todayStr = getLocalDateString(new Date());
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = getLocalDateString(oneWeekAgo);

        const payload = { 
            "c2Code": "P00000", 
            "storeId": "001", 
            "prodCode": "02", 
            "apiKey": apiKey, 
            "fromDate": oneWeekAgoStr, 
            "toDate": todayStr 
        };
        const res = await axios.post("http://117.211.64.158:21000/ws_c2_services_fetch_local_customer", payload, {timeout: 10000});
        if (res.data && Array.isArray(res.data)) {
            db.customers = res.data;
            lastUpdated.customers = new Date().toISOString();
        } else if (res.data && res.data.data) {
            db.customers = res.data.data;
            lastUpdated.customers = new Date().toISOString();
        }
    } catch(err) {
        console.error("fetchCustomersData failed:", err.message);
    }
}

async function fetchPOData(apiKey) {
    try {
        const todayStr = getLocalDateString(new Date());
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = getLocalDateString(oneWeekAgo);

        const payload = { 
            "c2Code": "P00000", 
            "storeId": "001", 
            "prodCode": "02", 
            "apiKey": apiKey, 
            "fromDate": oneWeekAgoStr, 
            "toDate": todayStr 
        };
        const res = await axios.post("http://117.211.64.158:21000/ws_c2_services_po_fetch", payload, {responseType: 'text', timeout: 10000});
        const parsedList = parseConcatenatedJson(res.data);
        db.po = parsedList;
        lastUpdated.po = new Date().toISOString();
    } catch(err) {
        console.error("fetchPOData failed:", err.message);
    }
}

async function fetchOrderStatusData(apiKey, orderNo) {
    if (!orderNo) return; // Cannot fetch status without an order number
    try {
        const res = await axios.get(`http://117.211.64.158:21000/ws_c2_services_sale_order_status?order_no=${orderNo}&apikey=${apiKey}`, {timeout: 10000});
        if (res.data && res.data.invoices) {
            db.orderStatus = [res.data];
            lastUpdated.orderStatus = new Date().toISOString();
        }
    } catch(err) {
        console.error("fetchOrderStatusData failed:", err.message);
    }
}

app.get("/api/dashboard", (req, res) => {
    const calcStats = (arr, dateField) => {
        if(!arr || arr.length === 0) return { today: 0, week: 0, total: 0 };
        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        let todayCount = 0;
        let weekCount = 0;
        arr.forEach(item => {
            if (!item[dateField]) return;
            const d = new Date(item[dateField]);
            if (isNaN(d.getTime())) return;
            
            if (d.toDateString() === today.toDateString()) todayCount++;
            if (d >= oneWeekAgo && d <= today) weekCount++;
        });
        return { today: todayCount, week: weekCount, total: arr.length };
    };

    res.json({
        items: dashboardDataCache.items,
        stock: dashboardDataCache.stock,
        customers: dashboardDataCache.customers,
        po: dashboardDataCache.po,
        orderStatus: { stats: calcStats(db.orderStatus, 'docDate'), lastUpdated: lastUpdated.orderStatus },
        webhooks: { stats: calcStats(db.webhooks, 'receivedAt'), lastUpdated: lastUpdated.webhooks }
    });
});

app.post("/api/manual-fetch", async (req, res) => {
    await autoFetchAll();
    res.json({ message: "Fetched successfully", lastUpdated });
});

app.post("/api/generate-token", async (req, res) => {
    try {
        const data = await fetchToken();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to generate token" });
    }
});

app.post("/api/create-order", async (req, res) => {
    try {
        const payload = req.body;
        const token = cache.get("default_token") || (await fetchToken()).apiKey;
        payload.apiKey = token;
        const apiRes = await axios.post("http://117.211.64.158:21000/ws_c2_services_create_sale_order", payload, {timeout: 10000});
        
        // Track this order number for background dashboard fetching
        const orderNoToTrack = apiRes.data?.orderId || payload.orderId;
        if (orderNoToTrack) {
            latestOrderNo = orderNoToTrack;
            await fetchOrderStatusData(token, latestOrderNo);
        }
        
        res.json(apiRes.data);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/items", async (req, res) => {
    try {
        const { inputDateTime } = req.body;
        if (inputDateTime) {
            const token = cache.get("default_token") || (await fetchToken()).apiKey;
            const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": inputDateTime, "apiKey": token };
            const apiRes = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_master_data", payload, {timeout: 10000});
            return res.json({ data: apiRes.data.data || [], lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.items, lastUpdated: lastUpdated.items });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/stock", async (req, res) => {
    try {
        const { itemCodes, inputDateTime } = req.body;
        if ((itemCodes && itemCodes.length > 0) || inputDateTime) {
            const token = cache.get("default_token") || (await fetchToken()).apiKey;
            const payload = { 
                "c2Code": "P00000", 
                "storeId": "001", 
                "prodCode": "02", 
                "inputDateTime": inputDateTime || "",
                "itemCodes": (itemCodes && itemCodes.length > 0) ? itemCodes : [],
                "apiKey": token 
            };

            const apiRes = await axios.post("http://117.211.64.158:21000/ws_c2_services_get_stock_data", payload, {timeout: 10000});
            return res.json({ data: apiRes.data.data || [], lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.stock, lastUpdated: lastUpdated.stock });
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

app.post("/api/customers", async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;
        if (fromDate && toDate) {
            const token = cache.get("default_token") || (await fetchToken()).apiKey;
            const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": token, "fromDate": fromDate, "toDate": toDate };
            const apiRes = await axios.post("http://117.211.64.158:21000/ws_c2_services_fetch_local_customer", payload, {timeout: 10000});
            let parsedData = Array.isArray(apiRes.data) ? apiRes.data : (apiRes.data.data || []);
            return res.json({ data: parsedData, lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.customers, lastUpdated: lastUpdated.customers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/purchase-order", async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;
        if (fromDate && toDate) {
            const token = cache.get("default_token") || (await fetchToken()).apiKey;
            const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": token, "fromDate": fromDate, "toDate": toDate };
            const apiRes = await axios.post("http://117.211.64.158:21000/ws_c2_services_po_fetch", payload, {responseType: 'text', timeout: 30000});
            const parsedList = parseConcatenatedJson(apiRes.data);
            return res.json({ data: parsedList, lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.po, lastUpdated: lastUpdated.po });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/order-status", async (req, res) => {
    try {
        const { order_no } = req.query;
        if (order_no) {
             const token = cache.get("default_token") || (await fetchToken()).apiKey;
             const apiRes = await axios.get(`http://117.211.64.158:21000/ws_c2_services_sale_order_status?order_no=${order_no}&apikey=${token}`, {timeout: 10000});
             return res.json({ data: apiRes.data.invoices ? [apiRes.data] : [], lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.orderStatus, lastUpdated: lastUpdated.orderStatus });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/webhooks", async (req, res) => { res.json({ data: db.webhooks, lastUpdated: lastUpdated.webhooks }); });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));