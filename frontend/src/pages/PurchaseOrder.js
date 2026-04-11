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

const PurchaseOrder = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Select dates");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        c2Code: "03B000",
        storeId: "001",
        prodCode: "02",
       
        fromDate,
        toDate,
      };

      const res = await axios.post(
        "http://localhost:5000/api/purchase-order",
        payload
      );

      // API may return array OR concatenated objects → normalize
      const responseData = Array.isArray(res.data)
        ? res.data
        : [res.data];

      setData(responseData);
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar active="purchase" />

      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9", minHeight: "100vh" }}>
        <Typography variant="h4" mb={1}>
          Purchase Order
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          View purchase orders between specific dates
        </Typography>

        {/* Filter */}
        <Card sx={{ p: 2, mb: 3 }}>
          <CardContent sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption">FROM DATE</Typography>
              <TextField
                type="date"
                fullWidth
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption">TO DATE</Typography>
              <TextField
                type="date"
                fullWidth
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ mt: 2, height: 40, background: "#2563eb" }}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {data.length > 0 &&
          data.map((order, index) => (
            <Card key={index} sx={{ mb: 3 }}>
              <CardContent>
                {/* Order Info */}
                <Typography variant="h6" mb={1}>
                  {order.prefix}-{order.srno} | {order.custname}
                </Typography>

                <Typography variant="body2" mb={2}>
                  Ref: {order.refname} | Total: ₹{order.total}
                </Typography>

                {/* Items Table */}
                {order.details && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Scheme</TableCell>
                        <TableCell>Rate</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {order.details.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.Qty}</TableCell>
                          <TableCell>{item.schemeQty}</TableCell>
                          <TableCell>{item.rate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
      </Box>
    </Box>
  );
};

export default PurchaseOrder;