import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API_BASE from "../config";

const CreateOrder = () => {
  const navigate = useNavigate();
  
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const localTime = now.toTimeString().split(' ')[0];

  const [form, setForm] = useState({
    apiKey: "",
    ipNo: "",
    mobileNo: "",
    patientName: "",
    patientAddress: "",
    patientEmail: "",
    counterSale: "",
    ordDate: localDate,
    ordTime: localTime,
    userId: "",
    actCode: "",
    actName: "",
    drCode: "",
    drName: "",
    drAddress: "",
    drRegNo: "",
    drOfficeCode: "",
    dmanCode: "",
    orderTotal: "",
    orderDiscPer: "",
    refNo: "",
    orderId: "",
    ordRefNo: "",
    sysName: "",
    sysIp: "",
    sysUser: "",
    remark: "",
    urgentFlag: 0,
    ordConversionFlag: 0,
    dcConversionFlag: 0,
  });

  const [materials, setMaterials] = useState([
    {
      itemSeq: 1,
      itemcode: "",
      totalLooseQty: "",
      totalLooseSchQty: "",
      serviceQty: "",
      saleRate: "",
      discPer: "",
      schDiscPer: "",
    },
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateOrderTotal = (materialRows) => {
    return materialRows
      .reduce((sum, row) => {
        const saleRate = parseFloat(row.saleRate) || 0;
        const serviceQty = parseFloat(row.serviceQty) || 0;
        return sum + saleRate * serviceQty;
      }, 0)
      .toFixed(2);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    const orderTotal = calculateOrderTotal(updated);
    setMaterials(updated);
    setForm({ ...form, orderTotal });
  };

  const addRow = () => {
    const updated = [
      ...materials,
      {
        itemSeq: materials.length + 1,
        itemcode: "",
        totalLooseQty: "",
        totalLooseSchQty: "",
        serviceQty: "",
        saleRate: "",
        discPer: "",
        schDiscPer: "",
      },
    ];
    setMaterials(updated);
    setForm({ ...form, orderTotal: calculateOrderTotal(updated) });
  };

  const removeRow = (index) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
    setForm({ ...form, orderTotal: calculateOrderTotal(updated) });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        c2Code: "03B000",
        storeId: "001",
        prodCode: "02",
        apiKey: form.apiKey,
        ...form,
        materialInfo: materials,
      };

      const res = await axios.post(`${API_BASE}/api/create-order`, payload);
      alert("Order Created");
      
      // Attempt to extract order ID from response or use the one from form
      const orderNoToTrack = res.data?.orderId || form.orderId;
      if (orderNoToTrack) {
        navigate(`/order-status?order_no=${orderNoToTrack}`);
      }
    } catch (err) {
      console.error(err);
      alert("API Error");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh", bgcolor: "var(--bg-color)" }}>
      <Sidebar active="create" />

      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>Create Order</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Fill in patient, doctor, and material details
        </Typography>

        {/* Patient Info */}
        <Card className="glass-card" sx={{ mb: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 600, mb: 2 }}>Patient Information</Typography>

            <Grid container spacing={2} mt={1}>
              {[
                ["ipNo", "IP No"],
                ["mobileNo", "Mobile No"],
                ["patientName", "Patient Name"],
                ["patientAddress", "Patient Address"],
                ["patientEmail", "Patient Email"],
                ["counterSale", "Counter Sale"],
                ["userId", "User ID"],
                ["actCode", "Act Code"],
              ].map(([name, label]) => (
                <Grid item xs={12} sm={6} md={3} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Act Name"
                  name="actName"
                  value={form.actName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500, pl: 1 }}>Order Date</Typography>
                <TextField
                  type="date"
                  fullWidth
                  inputProps={{ onClick: (e) => e.target.showPicker?.() }}
                  name="ordDate"
                  value={form.ordDate}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500, pl: 1 }}>Order Time</Typography>
                <TextField
                  type="time"
                  fullWidth
                  inputProps={{ step: 1, onClick: (e) => e.target.showPicker?.() }}
                  name="ordTime"
                  value={form.ordTime}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Doctor Info */}
        <Card className="glass-card" sx={{ mb: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 600, mb: 2 }}>Doctor Information</Typography>

            <Grid container spacing={2} mt={1}>
              {[
                ["drCode", "Dr Code"],
                ["drName", "Dr Name"],
                ["drAddress", "Dr Address"],
                ["drRegNo", "Dr Reg No"],
                ["drOfficeCode", "Dr Office Code"],
                ["dmanCode", "DMAN Code"],
              ].map(([name, label]) => (
                <Grid item xs={12} sm={6} md={3} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="glass-card" sx={{ mb: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 600, mb: 2 }}>Order Details</Typography>

            <Grid container spacing={2} mt={1}>
              {[
                ["orderTotal", "Order Total"],
                ["orderDiscPer", "Order Disc %"],
                ["refNo", "Ref No"],
                ["orderId", "Order ID"],
                ["ordRefNo", "Order Ref No"],
                ["sysName", "Sys Name"],
                ["sysIp", "Sys IP"],
                ["sysUser", "Sys User"],
              ].map(([name, label]) => (
                <Grid item xs={12} sm={6} md={3} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    InputProps={name === "orderTotal" ? { readOnly: true } : undefined}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="API Key"
                  name="apiKey"
                  value={form.apiKey}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remark"
                  name="remark"
                  value={form.remark}
                  multiline
                  rows={2}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
<FormControlLabel
  control={
    <Switch
      checked={form.urgentFlag === 1}
      onChange={(e) =>
        setForm({
          ...form,
          urgentFlag: e.target.checked ? 1 : 0,
        })
      }
    />
  }
  label="Urgent"
/>
 <FormControlLabel
  control={
    <Switch
      checked={form.ordConversionFlag === 1}
      onChange={(e) =>
        setForm({
          ...form,
          ordConversionFlag: e.target.checked ? 1 : 0,
        })
      }
    />
  }
  label="Ord Conversion"
/>
<FormControlLabel
  control={
    <Switch
      checked={form.dcConversionFlag === 1}
      onChange={(e) =>
        setForm({
          ...form,
          dcConversionFlag: e.target.checked ? 1 : 0,
        })
      }
    />
  }
  label="DC Conversion"
/>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Material Info */}
        <Card className="glass-card" sx={{ mb: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 600, mb: 2 }}>Material Information</Typography>

            {materials.map((row, index) => (
              <Grid container spacing={2} key={index} mt={1} alignItems="center">
                {Object.keys(row).map((field) => (
                  <Grid item xs={12} sm={6} md={1.3} key={field}>
                    <TextField
                      fullWidth
                      label={field}
                      value={row[field]}
                      onChange={(e) =>
                        handleMaterialChange(
                          index,
                          field,
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                ))}

                <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
                  <IconButton onClick={() => removeRow(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addRow}
              sx={{ mt: 2 }}
            >
              Add Item
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          className="animated-button"
          sx={{ mt: 2, background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', fontSize: '1.1rem' }}
          onClick={handleSubmit}
        >
          Submit Order
        </Button>
      </Box>
    </Box>
  );
};

export default CreateOrder;