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

const Items = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [inputDateTime, setInputDateTime] = useState("");

  const handleFetch = async () => {
    try {
      setLoading(true);
      // Ensure the datetime is formatted as "YYYY-MM-DD HH:mm:ss" if provided
      let formattedDate = inputDateTime;
      if (inputDateTime) {
        formattedDate = inputDateTime.replace("T", " ");
        if (formattedDate.length === 16) formattedDate += ":00";
      }
      const res = await axios.post("https://pharmacy-qbfr.onrender.com/api/items", { inputDateTime: formattedDate });
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
      <Sidebar active="items" />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Item Master Data
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Browse and manage items synced from the backend. 
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
                placeholder="Search items by code, name..."
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
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500, pl: 1 }}>Input Date/Time</Typography>
                  <TextField
                    size="small"
                    type="datetime-local"
                    inputProps={{ onClick: (e) => e.target.showPicker?.() }}
                    value={inputDateTime}
                    onChange={(e) => setInputDateTime(e.target.value)}
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
                      <TableCell sx={{ fontWeight: 600 }}>Item Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>HSN/SAC</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Qty/Box</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Updated Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedData.length > 0 ? displayedData.map((item, index) => (
                      <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500, color: 'var(--primary)' }}>{item.itemCode || '-'}</TableCell>
                        <TableCell>{item.itemName || '-'}</TableCell>
                        <TableCell>{item.categoryName || item.categoryCode || '-'}</TableCell>
                        <TableCell>{item.hsnSacCode || '-'}</TableCell>
                        <TableCell>{item.itemQtyPerBox || '-'}</TableCell>
                        <TableCell>{item.itemUpdatedDate ? new Date(item.itemUpdatedDate).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No items found</TableCell>
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

export default Items;