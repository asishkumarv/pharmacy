import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import Dashboard from "./pages/Dashboard";
import GenerateToken from "./pages/GenerateToken";
import Items from "./pages/Items";
import Stock from "./pages/Stock";
import Customers from "./pages/Customers";
import PurchaseOrder from "./pages/PurchaseOrder";
import CreateOrder from "./pages/CreateOrder";
import OrderStatus from "./pages/OrderStatus";

function App() {
  useEffect(() => {
    const fetchAndSetToken = async () => {
      try {
        const res = await axios.post("https://pharmacy-qbfr.onrender.com/api/generate-token", {});
        if (res.data && res.data.apiKey) {
          localStorage.setItem("authData", JSON.stringify({ apiKey: res.data.apiKey }));
        }
      } catch (err) {
        console.error("Failed to fetch initial token", err);
      }
    };

    fetchAndSetToken();

    // Axios interceptor to automatically attach the apiKey to every request
    const reqInterceptor = axios.interceptors.request.use((config) => {
      // Don't intercept the token generation itself
      if (config.url && config.url.includes("generate-token")) return config;
      
      const authData = JSON.parse(localStorage.getItem("authData") || "{}");
      if (authData.apiKey) {
        if (config.method === "post" || config.method === "put") {
          config.data = { ...config.data, apiKey: authData.apiKey };
        } else if (config.method === "get") {
          config.params = { ...config.params, apikey: authData.apiKey };
        }
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generatetoken" element={<GenerateToken />} />
        <Route path="/items" element={<Items />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/purchase-order" element={<PurchaseOrder />} />
        <Route path="/" element={<CreateOrder />} />
        <Route path="/order-status" element={<OrderStatus />} />
      </Routes>
    </Router>
  );
}

export default App;