import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import API_BASE from "../config";

const OrderStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [searchParams] = useSearchParams();
  const [orderNoInput, setOrderNoInput] = useState(searchParams.get("order_no") || "");

  const handleFetch = async (overrideOrderNo = null) => {
    const orderToFetch = overrideOrderNo || orderNoInput;
    try {
      setLoading(true);
      const url = orderToFetch ? `${API_BASE}/api/order-status?order_no=${orderToFetch}` : `${API_BASE}/api/order-status`;
      const res = await axios.get(url);
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
    if (orderNoInput) {
       handleFetch(orderNoInput);
    } else {
       handleFetch();
    }
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
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh", bgcolor: "var(--bg-color)", maxWidth: "100vw", overflowX: "hidden" }}>
      <Sidebar active="order-status" />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Sales Order Status
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Track sales order status and invoice details.
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
                <TextField
                  size="small"
                  label="Order No"
                  value={orderNoInput}
                  onChange={(e) => setOrderNoInput(e.target.value)}
                  sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                />
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
                      <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Invoice Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedData.length > 0 ? displayedData.map((item, index) => {
                      const invoice = item.invoices && item.invoices.length > 0 ? item.invoices[0] : null;
                      return (
                        <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{item.orderId || '-'}</TableCell>
                          <TableCell>{item.custCode || '-'}</TableCell>
                          <TableCell>{item.customerType || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{
                              display: 'inline-block', px: 2, py: 0.5, borderRadius: 4,
                              bgcolor: invoice?.docStatus === 'Invoice Created' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: invoice?.docStatus === 'Invoice Created' ? 'var(--success)' : 'var(--warning)',
                              fontWeight: 500, fontSize: '0.875rem'
                            }}>
                              {invoice ? invoice.docStatus : 'Pending'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>₹{invoice ? invoice.docTotal : '0.00'}</TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>No statuses found</TableCell>
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

export default OrderStatus;