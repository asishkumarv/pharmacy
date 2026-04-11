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
import Sidebar from "../components/Sidebar";

const CreateOrder = () => {
  const [form, setForm] = useState({
    ipNo: "",
    mobileNo: "",
    patientName: "",
    patientAddress: "",
    patientEmail: "",
    counterSale: "",
    ordDate: "",
    ordTime: "",
    userId: "",
    actCode: "",
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
    urgentFlag: false,
    ordConversionFlag: false,
    dcConversionFlag: false,
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

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const addRow = () => {
    setMaterials([
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
    ]);
  };

  const removeRow = (index) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        c2Code: "03B000",
        storeId: "001",
        prodCode: "02",
        
        ...form,
        materialInfo: materials,
      };

      await axios.post("http://localhost:5000/api/create-order", payload);
      alert("Order Created");
    } catch (err) {
      console.error(err);
      alert("API Error");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar active="create" />

      <Box sx={{ flex: 1, p: 4, background: "#f1f5f9" }}>
        <Typography variant="h4">Create Order</Typography>
        <Typography mb={3}>
          Fill in patient, doctor, and material details
        </Typography>

        {/* Patient Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Patient Information</Typography>

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
                <Grid item xs={3} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    onChange={handleChange}
                  />
                </Grid>
              ))}

              <Grid item xs={3}>
                <TextField
                  type="date"
                  fullWidth
                //   label="Order Date"
                  InputLabelProps={{ shrink: true }}
                  name="ordDate"
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  type="time"
                  fullWidth
                 // label="Order Time"
                  InputLabelProps={{ shrink: true }}
                  name="ordTime"
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Doctor Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Doctor Information</Typography>

            <Grid container spacing={2} mt={1}>
              {[
                ["drCode", "Dr Code"],
                ["drName", "Dr Name"],
                ["drAddress", "Dr Address"],
                ["drRegNo", "Dr Reg No"],
                ["drOfficeCode", "Dr Office Code"],
                ["dmanCode", "DMAN Code"],
              ].map(([name, label]) => (
                <Grid item xs={3} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Order Details</Typography>

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
                <Grid item xs={3} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    onChange={handleChange}
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remark"
                  name="remark"
                  multiline
                  rows={2}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
<FormControlLabel
  control={
    <Switch
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
        <Card>
          <CardContent>
            <Typography variant="h6">Material Information</Typography>

            {materials.map((row, index) => (
              <Grid container spacing={2} key={index} mt={1}>
                {Object.keys(row).map((field) => (
                  <Grid item xs={1.5} key={field}>
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

                <Grid item xs={1}>
                  <IconButton onClick={() => removeRow(index)}>
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
          sx={{ mt: 3 }}
          onClick={handleSubmit}
        >
          Submit Order
        </Button>
      </Box>
    </Box>
  );
};

export default CreateOrder;