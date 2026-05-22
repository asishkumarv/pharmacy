import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import API_BASE from "../config";

const GenerateToken = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/generate-token`, {});
      const data = res.data;
      setResponse(data);
      if (data.apiKey) {
        localStorage.setItem("authData", JSON.stringify({ apiKey: data.apiKey }));
      }
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh", bgcolor: "var(--bg-color)" }}>
      <Sidebar active="generate" />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
          Generate Token
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Generate and sync authentication token automatically from the backend.
        </Typography>

        <Card className="glass-card" sx={{ width: 420, p: 2, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 600, mb: 3 }}>
              🔑 Automatic Token Generator
            </Typography>

            <Button
              fullWidth
              variant="contained"
              className="animated-button"
              sx={{ py: 1.5, background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', textTransform: 'none', fontSize: '1rem', borderRadius: 2 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Generate New Token"}
            </Button>

            {response && (
              <Box mt={4} p={2} sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Typography variant="body2" sx={{ color: 'var(--success)', fontWeight: 600, mb: 1 }}>
                  Success! Token Generated:
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {response.apiKey}
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