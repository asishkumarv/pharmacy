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
  TablePagination,
} from "@mui/material";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Items = () => {
  const [apiKey, setApiKey] = useState("");
  const [itemCodes, setItemCodes] = useState("");
  const [inputDateTime, setInputDateTime] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleFetch = async () => {
    if (!apiKey) {
      alert("Enter API Key");
      return;
    }

    try {
      setLoading(true);

      const formattedDateTime = inputDateTime ? `${inputDateTime.replace("T", " ")}:00` : "";
      const payload = {
        c2Code: "P00000",
        storeId: "001",
        prodCode: "02",
        inputDateTime: formattedDateTime,
        itemCodes: itemCodes ? itemCodes.split(",").map((i) => i.trim()) : [],
        apiKey,
      };

      console.log("Stock request payload:", payload);

      const res = await axios.post(
        "http://localhost:5000/api/items",
        payload
      );

      const responseData = res.data.data || [];
      setData(responseData);
      setTotalRecords(responseData.length);
      setPage(0);
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "expiryDate") {
      const aDate = new Date(a.expiryDate);
      const bDate = new Date(b.expiryDate);
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (sortField === "stockBalQty") {
      const aValue = Number(a.stockBalQty) || 0;
      const bValue = Number(b.stockBalQty) || 0;
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const displayedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar active="items" />

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9", minHeight: "100vh" }}>
        <Typography variant="h4" mb={1}>
          Stock Information
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          View stock details with pagination
        </Typography>

        {/* Search Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              API KEY & ITEM CODES
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  placeholder="Enter API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  placeholder="Enter Item Codes (comma separated) - optional"
                  value={itemCodes}
                  onChange={(e) => setItemCodes(e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  // label="Input Date Time (optional)"
                  InputLabelProps={{ shrink: true }}
                  value={inputDateTime}
                  onChange={(e) => setInputDateTime(e.target.value || "")}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ height: "100%", background: "#2563eb" }}
                  onClick={handleFetch}
                  disabled={loading}
                >
                  {loading ? "Fetching..." : "Fetch Data"}
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
                Stock Data
              </Typography>

              <Grid container spacing={2} mb={2}>
                <Grid item>
                  <Button
                    variant={sortField === "expiryDate" ? "contained" : "outlined"}
                    onClick={() => handleSort("expiryDate")}
                  >
                    Expiry Date {sortField === "expiryDate" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={sortField === "stockBalQty" ? "contained" : "outlined"}
                    onClick={() => handleSort("stockBalQty")}
                  >
                    Stock Qty {sortField === "stockBalQty" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </Button>
                </Grid>
              </Grid>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Code</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Batch No</TableCell>
                    <TableCell>Qty/Box</TableCell>
                    <TableCell>Stock Qty</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell>Mrp</TableCell>
                    <TableCell>MrpBox</TableCell>
                    <TableCell>Sale rate</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {displayedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.c_item_code}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.batchNo}</TableCell>
                      <TableCell>{item.itemQtyPerBox}</TableCell>
                      <TableCell>{item.stockBalQty}</TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                      <TableCell>{item.mrp}</TableCell>
                      <TableCell>{item.mrpbox}</TableCell>
                      <TableCell>{item.saleRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={totalRecords}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[100]}
              />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Items;