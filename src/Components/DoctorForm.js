import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Paper,
  Divider,
  Box,
  Alert,
} from "@mui/material";
import AdminNavbar from "./AdminNavbar";

export default function DoctorForm() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    age: "",
    gender: "",
    specialization: "",
    hospital_id: "",
    fee: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login as admin.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add doctor");
      }

      const data = await response.json();
      console.log("Doctor Created:", data);
      alert("Doctor added successfully!");
      setFormData({
        id: "",
        name: "",
        age: "",
        gender: "",
        specialization: "",
        hospital_id: "",
        fee: "",
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
          backgroundColor: "#e8f5e9", // soft green
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: 4,
        }}
      >

        <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", my: 2, my: 2 , mt: -4, // 👈 push it slightly up
    backgroundColor: "#f1f8f6", // 👈 subtle green for contrast
    boxShadow: 3, // slight shadow for depth
    borderRadius: 3, // smoother corners
}}>
          <form onSubmit={handleSubmit}>
            {/* 👨‍⚕️ Doctor Info */}
            <Typography variant="h6" gutterBottom>
              👨‍⚕️ Doctor Information
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
              {/* Row 1 → Doctor ID & Name */}
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Doctor ID"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 2 → Gender & Specialization */}
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  select
                  required
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 3 → Age & Fee */}
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  type="number"
                  required
                  label="Age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  type="number"
                  required
                  label="Consultation Fee"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 4 → Hospital ID (full width) */}
              <Grid item xs={12} sx={{ width: "92%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Hospital ID"
                  name="hospital_id"
                  value={formData.hospital_id}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* ✅ Submit */}
            <Grid container sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
  <Grid item>
    <Button
      type="submit"
      variant="contained"
      color="success" // 👈 MUI green theme
      sx={{
        px: 4, // padding left-right
        py: 1.5,
        borderRadius: 2,
        fontWeight: "bold",
        fontSize: "1rem",
      }}
      disabled={loading}
    >
      {loading ? "Saving..." : "Save Doctor"}
    </Button>
  </Grid>
</Grid>
          </form>
        </Paper>
      </Box>
    </>
  );
}
