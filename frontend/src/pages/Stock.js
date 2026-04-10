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

const Stock = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!date || !time) {
      alert("Date and Time required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        c2Code: "03B000",
        storeId: "001",
        prodCode: "02",
        inputDateTime: `${date} ${time}`,
        apiKey: "MDNCMDAwMDAxXjIwMjYtMDItMTIgMTE6NTI=",
      };

      const res = await axios.post(
        "http://localhost:5000/api/stock",
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
      <Sidebar active="stock" />

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9", minHeight: "100vh" }}>
        <Typography variant="h4" mb={1}>
          Stock
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Check stock details and expiry dates
        </Typography>

        {/* Search Section */}
        <Card sx={{ p: 2, mb: 3 }}>
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            
            {/* Date */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption">DATE</Typography>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Box>

            {/* Time */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption">TIME</Typography>
              <TextField
                type="time"
                fullWidth
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Box>

            {/* Button */}
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ mt: 2, height: 40, background: "#2563eb" }}
              disabled={loading}

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

export default Stock;