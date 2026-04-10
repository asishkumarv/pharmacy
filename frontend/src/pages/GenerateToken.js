import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const GenerateToken = () => {
  const [form, setForm] = useState({
    c2Code: "",
    storeId: "",
    prodCode: "",
    securityKey: "",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { c2Code, storeId, prodCode, securityKey } = form;

    if (!c2Code || !storeId || !prodCode || !securityKey) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/generate-token",
        form
      );

      setResponse(res.data);
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
      <Sidebar active="generate" />
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9", minHeight: "100vh" }}>
        <Typography variant="h4" mb={1}>
          Generate Token
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Generate authentication token using credentials
        </Typography>

        <Card sx={{ width: 420, p: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" mb={2}>
              🔑 Token Generator
            </Typography>

            <TextField
              fullWidth
              label="C2 Code"
              name="c2Code"
              margin="normal"
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Store ID"
              name="storeId"
              margin="normal"
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Product Code"
              name="prodCode"
              margin="normal"
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Security Key"
              name="securityKey"
              margin="normal"
              onChange={handleChange}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, background: "#2563eb" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Token"}
            </Button>

            {response && (
              <Box mt={3}>
                <Typography variant="body2">
                  <strong>API Key:</strong> {response.apiKey}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default GenerateToken;