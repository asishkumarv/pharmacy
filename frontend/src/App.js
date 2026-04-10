import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GenerateToken from "./pages/GenerateToken";
import Items from "./pages/Items";
import Stock from "./pages/Stock";
import Customers from "./pages/Customers";
import PurchaseOrder from "./pages/PurchaseOrder";
import CreateOrder from "./pages/CreateOrder";
import OrderStatus from "./pages/OrderStatus";
function App() {
  return (
    <Router>
      <Routes>
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