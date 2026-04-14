const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://pharmacyerp-6224a.web.app"
  ]
}));


const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// 🔥 Replace with actual API URL
const API_URL = "http://117.211.64.158:41000/ws_c2_services_generate_token";

app.post("/api/generate-token", async (req, res) => {
  const payload = req.body;

  try {
    // 🔁 Call external API
    const apiResponse = await axios.post(API_URL, payload);

    const data = apiResponse.data;

    // ✅ Save in cache
    const cacheKey = `${payload.c2Code}_${payload.storeId}_${payload.prodCode}`;

    cache.set(cacheKey, {
      request: payload,
      apiKey: data.apiKey,
    });
 // ✅ Confirm saved
    console.log("💾 Saved in Cache with key:", cacheKey);

    // 🔍 Immediately verify cache
    const cachedData = cache.get(cacheKey);
    console.log("🧠 Cache Value:", cachedData);

    console.log("=====================================");
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "API call failed" });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const { c2Code, storeId, prodCode } = req.body;

    const cacheKey = `${c2Code}_${storeId}_${prodCode}`;
    const cached = cache.get(cacheKey);

    if (!cached) {
      return res.status(400).json({
        error: "API key not found. Generate token first.",
      });
    }

    // 🔥 Inject API KEY from cache
    const payload = {
      ...req.body,
      apiKey: cached.apiKey,
    };

    const response = await axios.post(
      "YOUR_REAL_API_URL_HERE",
      payload
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Items API failed" });
  }
});

app.post("/api/stock", async (req, res) => {
  try {
    const { c2Code, storeId, prodCode } = req.body;

    const cacheKey = `${c2Code}_${storeId}_${prodCode}`;
    const cached = cache.get(cacheKey);

    if (!cached) {
      return res.status(400).json({
        error: "API key not found. Generate token first.",
      });
    }

    // 🔥 Inject API KEY from cache
    const payload = {
      ...req.body,
      apiKey: cached.apiKey,
    };

    const response = await axios.post(
      "https://your-real-api-url.com/stock",
      payload
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Stock API failed" });
  }
});

app.post("/api/purchase-order", async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: "API key is required",
      });
    }

    const payload = req.body;

    const response = await axios.post(
      "http://117.211.64.158:41000/ws_c2_services_po_fetch",
      payload
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Purchase API failed" });
  }
});
app.post("/api/create-order", async (req, res) => {
  try {
    const { c2Code, storeId, prodCode } = req.body;

    const cacheKey = `${c2Code}_${storeId}_${prodCode}`;
    const cached = cache.get(cacheKey);

    if (!cached) {
      return res.status(400).json({
        error: "API key not found. Generate token first.",
      });
    }

    // 🔥 Inject API KEY automatically
    const payload = {
      ...req.body,
      apiKey: cached.apiKey,
    };

    const response = await axios.post(
      "https://your-api-url.com/create-order",
      payload
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Create Order Failed" });
  }
});
app.get("/api/order-status", async (req, res) => {
  try {
    console.log("=====================================");
    console.log("📌 Incoming Query:", req.query);

    const { order_no, apikey } = req.query;

    if (!apikey) {
      return res.status(400).json({
        error: "API key is required",
      });
    }

    const url = `http://117.211.64.158:41000/ws_c2_services_sale_order_status?order_no=${order_no}&apikey=${apikey}`;

    console.log("🌐 Calling External API:", url);

    const response = await axios.get(url);

    console.log("📥 External API Response:", response.data);
    console.log("=====================================");

    res.json(response.data);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Order Status API failed" });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { c2Code, storeId, prodCode } = req.body;

    const cacheKey = `${c2Code}_${storeId}_${prodCode}`;
    const cached = cache.get(cacheKey);

    if (!cached) {
      return res.status(400).json({
        error: "API key not found. Generate token first.",
      });
    }

    // 🔥 Inject API KEY from cache
    const payload = {
      ...req.body,
      apiKey: cached.apiKey,
    };

    const response = await axios.post(
      "YOUR_CUSTOMERS_API_URL",
      payload
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Customers API failed" });
  }
});
// 🔍 Optional: Get from cache
app.get("/api/cache/:key", (req, res) => {
  const data = cache.get(req.params.key);

  if (!data) {
    return res.status(404).json({ message: "Not found in cache" });
  }

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});