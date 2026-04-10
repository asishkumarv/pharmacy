import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const OrderStatus = () => {
  const [orderNo, setOrderNo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!orderNo) {
      alert("Enter Order Number");
      return;
    }

    const apiKey = localStorage.getItem("apiKey");

    if (!apiKey) {
      alert("Generate token first");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/order-status?order_no=${orderNo}&apikey=${apiKey}`
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar active="order-status" />

      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9" }}>
        <Typography variant="h4">Order Status</Typography>
        <Typography mb={3}>
          Check sales order status using Order ID
        </Typography>

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Order No"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Checking..." : "Search"}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {data && (
          <>
            {/* Order Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">
                  Order ID: {data.orderId}
                </Typography>

                <Typography>
                  Customer Code: {data.custCode}
                </Typography>

                <Typography>
                  Customer Type: {data.customerType}
                </Typography>

                <Typography>
                  Doctor: {data.doctorName || "-"}
                </Typography>
              </CardContent>
            </Card>

            {/* Invoices */}
            {data.invoices?.map((inv, idx) => (
              <Card key={idx} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    Invoice: {inv.docNo}
                  </Typography>

                  <Typography>
                    Date: {inv.docDate} | Status: {inv.docStatus}
                  </Typography>

                  <Typography>
                    Total: ₹{inv.docTotal} | Discount: {inv.docDiscount}
                  </Typography>

                  {/* Products Table */}
                  <Table sx={{ mt: 2 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>MRP</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {inv.detail.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.mrp}</TableCell>
                          <TableCell>{item.saleRate}</TableCell>
                          <TableCell>{item.itemTotal}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default OrderStatus;