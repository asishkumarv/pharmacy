const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// 🔥 Replace with actual API URL
const API_URL = "https://your-api-url.com/generate-token";

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

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "API call failed" });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const response = await axios.post(
      "YOUR_REAL_API_URL_HERE",
      req.body
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Items API failed" });
  }
});

app.post("/api/stock", async (req, res) => {
  try {
    const response = await axios.post(
      "https://your-real-api-url.com/stock", // replace
      req.body
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Stock API failed" });
  }
});

app.post("/api/purchase-order", async (req, res) => {
  try {
    const response = await axios.post(
      "https://your-api-url.com/purchase-order",
      req.body
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Purchase API failed" });
  }
});
app.post("/api/create-order", async (req, res) => {
  try {
    const response = await axios.post(
      "https://your-api-url.com/create-order",
      req.body
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Create Order Failed" });
  }
});
app.get("/api/order-status", async (req, res) => {
  try {
    const { order_no, apikey } = req.query;

    const response = await axios.get(
      `http://localhost:45000/ws_c2_services_sale_order_status?order_no=${order_no}&apikey=${apikey}`
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Order Status API failed" });
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

app.listen(5000, () => console.log("Server running on port 5000"));