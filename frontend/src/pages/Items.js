import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Items = () => {
  const [itemCode, setItemCode] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!itemCode) {
      alert("Enter item code");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        c2Code: "03B000",
        storeId: "001",
        prodCode: "02",
        itemCodes: itemCode.split(",").map((i) => i.trim()),
        apiKey: "YOUR_API_KEY_HERE", // replace dynamically later
      };

      const res = await axios.post(
        "http://localhost:5000/api/items", // backend route
        payload
      );

      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar active="items" />

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9", minHeight: "100vh" }}>
        <Typography variant="h4" mb={1}>
          Items
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Look up item details by item code
        </Typography>

        {/* Search Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              ITEM CODE
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  placeholder="e.g. MED001"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ height: "100%", background: "#2563eb" }}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results Table */}
        {data.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Results
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Code</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Batch No</TableCell>
                    <TableCell>Qty/Box</TableCell>
                    <TableCell>Stock Qty</TableCell>
                    <TableCell>Expiry</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.c_item_code}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.batchNo}</TableCell>
                      <TableCell>{item.itemQtyPerBox}</TableCell>
                      <TableCell>{item.stockBalQty}</TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Items;