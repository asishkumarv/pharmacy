import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import axios from "axios";
import Sidebar from "../components/Sidebar";

const PurchaseOrder = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleFetch = async () => {
    try {
      setLoading(true);
      const res = await axios.post("https://pharmacy-qbfr.onrender.com/api/purchase-order", {
        fromDate,
        toDate
      });
      setData(res.data.data || []);
      setLastUpdated(res.data.lastUpdated);
      setPage(0);
    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const displayedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh", bgcolor: "var(--bg-color)" }}>
      <Sidebar active="purchase" />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Purchase Orders
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Track purchase orders and details.
              {lastUpdated && ` Last sync: ${new Date(lastUpdated).toLocaleString()}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleFetch}
              disabled={loading}
              className="animated-button"
              sx={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', textTransform: 'none', px: 3, py: 1, borderRadius: 2 }}
            >
              {loading ? "Syncing..." : "Manual Sync"}
            </Button>
          </Box>
        </Box>

        <Card className="glass-card" sx={{ borderRadius: 4, mb: 4, overflow: 'visible' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 300, bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500, pl: 1 }}>From Date</Typography>
                  <TextField
                    size="small"
                    type="date"
                    inputProps={{ onClick: (e) => e.target.showPicker?.() }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500, pl: 1 }}>To Date</Typography>
                  <TextField
                    size="small"
                    type="date"
                    inputProps={{ onClick: (e) => e.target.showPicker?.() }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { border: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  />
                </Box>
              </Box>
            </Box>

            {loading && data.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Items Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedData.length > 0 ? displayedData.map((item, index) => (
                      <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.br_code || '-'}</TableCell>
                        <TableCell>{item.refname || '-'}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>₹{item.total || '0.00'}</TableCell>
                        <TableCell>{item.createDateTime ? new Date(item.createDateTime).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{item.details ? item.details.length : 0}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>No orders found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[10]}
                  sx={{ borderTop: '1px solid var(--border-color)' }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PurchaseOrder;