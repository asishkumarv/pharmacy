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
        const payload = { "c2Code": "03C000", "storeId": "001", "prodCode": "02", "securityKey": "TUVVek1EQXhNalE9" };
        const res = await axios.post("http://117.211.64.158:41000/ws_c2_services_generate_token", payload, {timeout: 10000});
        cache.set("default_token", res.data.apiKey);
        return res.data;
    } catch(err) {
        console.error("fetchToken failed:", err.message);
        throw err;
    }
}

async function fetchMasterData(apiKey) {
    try {
        const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "inputDateTime": new Date().toISOString().slice(0, 19).replace("T", " "), "apiKey": apiKey };
        const res = await axios.post("http://117.211.64.158:41000/ws_c2_services_get_master_data", payload, {timeout: 10000});
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
        const payload = { "c2Code": "03B000", "storeId": "001", "prodCode": "02", "itemCodes": ["711291","254229"], "apiKey": apiKey };
        const res = await axios.post("http://localhost:45000/ws_c2_services_get_stock_data", payload, {timeout: 10000});
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
        const payload = { "c2Code": "03B000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": "2025-06-12", "toDate": "2025-06-12" };
        const res = await axios.post("http://localhost:45000/ws_c2_services_so_refno_fetch", payload, {timeout: 10000});
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
        const payload = { "c2Code": "P00000", "storeId": "001", "prodCode": "02", "apiKey": apiKey, "fromDate": "2025-06-12", "toDate": "2025-06-12" };
        const res = await axios.post("http://117.211.64.158:41000/ws_c2_services_po_fetch", payload, {timeout: 10000});
        if (res.data && res.data.details) {
            db.po = [res.data];
            lastUpdated.po = new Date().toISOString();
        }
    } catch(err) {
        console.error("fetchPOData failed:", err.message);
    }
}

async function fetchOrderStatusData(apiKey, orderNo) {
    if (!orderNo) return; // Cannot fetch status without an order number
    try {
        const res = await axios.get(`http://localhost:45000/ws_c2_services_sale_order_status?order_no=${orderNo}&apikey=${apiKey}`, {timeout: 10000});
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
        let todayCount = 0;
        let weekCount = 0;
        arr.forEach(item => {
            const d = new Date(item[dateField] || new Date());
            if (d.toDateString() === today.toDateString()) todayCount++;
            const diffTime = Math.abs(today - d);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if(diffDays <= 7) weekCount++;
        });
        return { today: todayCount || arr.length, week: weekCount || arr.length, total: arr.length };
    };

    res.json({
        items: { stats: calcStats(db.items, 'itemUpdatedDate'), lastUpdated: lastUpdated.items },
        stock: { stats: calcStats(db.stock, 'expiryDate'), lastUpdated: lastUpdated.stock },
        customers: { stats: calcStats(db.customers, 'addedDate'), lastUpdated: lastUpdated.customers },
        po: { stats: calcStats(db.po, 'createDateTime'), lastUpdated: lastUpdated.po },
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
        const apiRes = await axios.post("http://localhost:45000/ws_c2_services_create_sale_order", payload, {timeout: 10000});
        
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
            const apiRes = await axios.post("http://117.211.64.158:41000/ws_c2_services_get_master_data", payload, {timeout: 10000});
            return res.json({ data: apiRes.data.data || [], lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.items, lastUpdated: lastUpdated.items });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/stock", async (req, res) => {
    try {
        const { itemCodes } = req.body;
        if (itemCodes && itemCodes.length > 0) {
            const token = cache.get("default_token") || (await fetchToken()).apiKey;
            const payload = { "c2Code": "03B000", "storeId": "001", "prodCode": "02", "itemCodes": itemCodes, "apiKey": token };
            const apiRes = await axios.post("http://localhost:45000/ws_c2_services_get_stock_data", payload, {timeout: 10000});
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
            const payload = { "c2Code": "03B000", "storeId": "001", "prodCode": "02", "apiKey": token, "fromDate": fromDate, "toDate": toDate };
            const apiRes = await axios.post("http://localhost:45000/ws_c2_services_so_refno_fetch", payload, {timeout: 10000});
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
            const apiRes = await axios.post("http://117.211.64.158:41000/ws_c2_services_po_fetch", payload, {timeout: 10000});
            return res.json({ data: apiRes.data.details ? [apiRes.data] : [], lastUpdated: new Date().toISOString() });
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
             const apiRes = await axios.get(`http://localhost:45000/ws_c2_services_sale_order_status?order_no=${order_no}&apikey=${token}`, {timeout: 10000});
             return res.json({ data: apiRes.data.invoices ? [apiRes.data] : [], lastUpdated: new Date().toISOString() });
        }
        res.json({ data: db.orderStatus, lastUpdated: lastUpdated.orderStatus });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/webhooks", async (req, res) => { res.json({ data: db.webhooks, lastUpdated: lastUpdated.webhooks }); });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));