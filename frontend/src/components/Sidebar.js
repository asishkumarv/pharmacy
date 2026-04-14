import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        background: "#f8fafc",
        borderRight: "1px solid #e5e7eb",
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, color: "#000409" }}>
        PharmERP
      </Typography>

      <Button fullWidth  
      variant={active === "create" ? "contained" : "text"}
  onClick={() => navigate("/")}
   sx={{ justifyContent: "flex-start", mb: 1 }}>
        Create Order
      </Button>

      <Button
  fullWidth
  variant={active === "stock" ? "contained" : "text"}
  onClick={() => navigate("/stock")}
  sx={{ justifyContent: "flex-start", mb: 1 }}
>
  Item info
</Button>

<Button
  fullWidth
  variant={active === "purchase" ? "contained" : "text"}
  onClick={() => navigate("/purchase-order")}
  sx={{ justifyContent: "flex-start", mb: 1 }}
>
  Purchase Order
</Button>

      <Button
        fullWidth
        variant={active === "items" ? "contained" : "text"}
        onClick={() => navigate("/items")}
        sx={{ justifyContent: "flex-start", mb: 1 }}
      >
        Stock Info
      </Button>

<Button
  fullWidth
  variant={active === "customers" ? "contained" : "text"}
  onClick={() => navigate("/customers")}
  sx={{ justifyContent: "flex-start", mb: 1 }}
>
  Customers
</Button>
<Button
  fullWidth
  variant={active === "order-status" ? "contained" : "text"}
  onClick={() => navigate("/order-status")}
  sx={{ justifyContent: "flex-start", mb: 1 }}
>
  Order Status
</Button>
<Button
  fullWidth
  variant={active === "generate" ? "contained" : "text"}
  onClick={() => navigate("/generatetoken")}
  sx={{ justifyContent: "flex-start", mb: 1 }}
>
  Generate Token
</Button>
    </Box>
  );
};

export default Sidebar;