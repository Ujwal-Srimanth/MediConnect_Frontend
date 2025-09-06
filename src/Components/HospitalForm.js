import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Box,
  MenuItem,
} from "@mui/material";
import AdminNavbar from "./AdminNavbar";

export default function HospitalForm() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Validation: Hospital ID must start with HSP
    if (!formData.id.startsWith("HSP")) {
      alert("Hospital ID must start with 'HSP'");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login as admin.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/hospitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add hospital");
      }

      const data = await response.json();
      console.log("Hospital Created:", data);
      alert("Hospital added successfully!");

      setFormData({
        id: "",
        name: "",
        location: "",
        mobile: "",
      });
    } catch (err) {
      console.error("Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = {
    fullWidth: true,
    size: "small",
    variant: "outlined",
  };

  return (
    <>
      <AdminNavbar />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#e8f5e9", // ✅ same soft green as DoctorForm
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: 4,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 900,
            mx: "auto",
            my: 2,
            mt: -4,
            backgroundColor: "#f1f8f6", // ✅ subtle green for contrast
            boxShadow: 3,
            borderRadius: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* 🏥 Hospital Info */}
            <Typography variant="h6" gutterBottom>
              🏥 Hospital Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid
              container
              rowSpacing={3}
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              {/* Row 1 → Hospital ID & Name */}
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Hospital ID"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Hospital Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 2 → Location & Mobile */}
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* ✅ Submit aligned right */}
            <Grid
              container
              sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
            >
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Hospital"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </>
  );
}
