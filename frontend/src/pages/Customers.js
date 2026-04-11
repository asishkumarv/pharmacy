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

const Customers = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
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
        "http://localhost:5000/api/customers",
        payload
      );

      // response may be array directly
      setData(res.data || []);
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
      <Sidebar active="customers" />

      {/* Main */}
      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9", minHeight: "100vh" }}>
        <Typography variant="h4" mb={1}>
          Customers
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Manage customer records
        </Typography>

        {/* Search Section */}
        <Card sx={{ p: 2, mb: 3 }}>
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            
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
        {data.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Results
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    {Object.keys(data[0]).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val, j) => (
                        <TableCell key={j}>
                          {val !== null ? val.toString() : "-"}
                        </TableCell>
                      ))}
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

export default Customers;