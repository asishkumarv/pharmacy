import React from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import GroupIcon from '@mui/icons-material/Group';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const Sidebar = ({ active }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { id: 'create', label: 'Create Order', path: '/', icon: <AddShoppingCartIcon /> },
    { id: 'stock', label: 'Item Master', path: '/stock', icon: <InventoryIcon /> },
    { id: 'items', label: 'Stock Info', path: '/items', icon: <InventoryIcon /> },
    { id: 'purchase', label: 'Purchase Order', path: '/purchase-order', icon: <ShoppingBagIcon /> },
    { id: 'customers', label: 'Customers', path: '/customers', icon: <GroupIcon /> },
    { id: 'order-status', label: 'Order Status', path: '/order-status', icon: <AutorenewIcon /> },
    { id: 'generate', label: 'Generate Token', path: '/generatetoken', icon: <VpnKeyIcon /> },
  ];

  return (
    <Box
      sx={{
        width: 260,
        height: "100vh",
        background: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid var(--border-color)",
        p: 3,
        display: "flex",
        flexDirection: "column",
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 20 }}>
          P
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--text-main)", letterSpacing: '-0.5px' }}>
          Pharm<span className="gradient-text">ERP</span>
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
        {navItems.map((item) => (
          <Button
            key={item.id}
            fullWidth
            variant={active === item.id ? "contained" : "text"}
            onClick={() => navigate(item.path)}
            startIcon={item.icon}
            className="animated-button"
            sx={{
              justifyContent: "flex-start",
              mb: 1.5,
              py: 1.5,
              px: 2,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: active === item.id ? 600 : 500,
              color: active === item.id ? 'white' : 'var(--text-muted)',
              background: active === item.id ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'transparent',
              '&:hover': {
                background: active === item.id ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(79, 70, 229, 0.08)',
                color: active === item.id ? 'white' : 'var(--primary)',
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default Sidebar;