import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, IconButton, TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import axios from "axios";
import Sidebar from "../components/Sidebar";

const DashboardCard = ({ title, stats, lastUpdated }) => (
  <Card className="glass-card" sx={{ height: '100%', borderRadius: 4 }}>
    <CardContent>
      <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography variant="body2" color="text.secondary">Today</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats?.today || 0}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2" color="text.secondary">This Week</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats?.week || 0}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary)' }}>{stats?.total || 0}</Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://pharmacy-qbfr.onrender.com/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualFetch = async () => {
    setLoading(true);
    try {
      await axios.post("https://pharmacy-qbfr.onrender.com/api/manual-fetch");
      await fetchDashboard();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const filterCards = (title) => {
    return title.toLowerCase().includes(search.toLowerCase());
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh", bgcolor: "var(--bg-color)" }}>
      <Sidebar active="dashboard" />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Overview of all pharmacy operations and webhook events.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search Modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton onClick={handleManualFetch} disabled={loading} sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <SyncIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Box>
        </Box>

        {loading && !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filterCards("Item Master") && (
              <Grid item xs={12} md={6} lg={4}>
                <DashboardCard title="📦 Item Master" stats={data?.items?.stats} lastUpdated={data?.items?.lastUpdated} />
              </Grid>
            )}
            {filterCards("Stock Details") && (
              <Grid item xs={12} md={6} lg={4}>
                <DashboardCard title="📊 Stock Details" stats={data?.stock?.stats} lastUpdated={data?.stock?.lastUpdated} />
              </Grid>
            )}
            {filterCards("Local Customers") && (
              <Grid item xs={12} md={6} lg={4}>
                <DashboardCard title="👥 Local Customers" stats={data?.customers?.stats} lastUpdated={data?.customers?.lastUpdated} />
              </Grid>
            )}
            {filterCards("Purchase Orders") && (
              <Grid item xs={12} md={6} lg={4}>
                <DashboardCard title="🛒 Purchase Orders" stats={data?.po?.stats} lastUpdated={data?.po?.lastUpdated} />
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
