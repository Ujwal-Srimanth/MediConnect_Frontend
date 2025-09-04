import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Box,
} from "@mui/material";
import AdminNavbar from "./AdminNavbar";

export default function ReceptionistForm() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    age: "",
    hospital_id: "",
    mobile: "",
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

      const response = await fetch("http://localhost:8000/admin/receptionists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to add receptionist");
      }

      const data = await response.json();
      console.log("Receptionist added:", data);
      alert("Receptionist added successfully!");
      setFormData({
        id: "",
        name: "",
        age: "",
        hospital_id: "",
        mobile: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
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
            {/* 👩‍💼 Receptionist Info */}
            <Typography variant="h6" gutterBottom>
              👩‍💼 Receptionist Information
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
              {/* Row 1 → Receptionist ID & Name */}
              <Grid item xs={12} sm={6} sx={{ width: "45%" }}>
                <TextField
                  {...fieldProps}
                  required
                  label="Receptionist ID"
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

              {/* Row 2 → Age & Mobile */}
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
                  required
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 3 → Hospital ID (full width) */}
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
                  {loading ? "Saving..." : "Save Receptionist"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </>
  );
}
