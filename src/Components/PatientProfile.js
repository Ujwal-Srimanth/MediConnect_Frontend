import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  Button,
  Stack,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import SecurityIcon from "@mui/icons-material/Security";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "./PatientNavbar"; // <-- import the navbar

export default function PatientViewProfile() {
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const email = localStorage.getItem("email");
        const res = await fetch(
          `http://127.0.0.1:8000/patients?email_address=${email}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setPatient(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
      }
    };

    fetchPatientData();
  }, []);

  if (!patient) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(120deg, #e3f2fd, #bbdefb, #90caf9)" }}>
      {/* Navbar */}
      <PatientNavbar />

      {/* Profile Content */}
      <Box sx={{ p: { xs: 2, md: 6 }, display: "flex", justifyContent: "center" }}>
        <Paper
          sx={{
            p: 4,
            maxWidth: 1000,
            width: "100%",
            borderRadius: 5,
            boxShadow: 8,
            mt: 4, // spacing from navbar
          }}
        >
          {/* Header with avatar */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 64, height: 64, fontSize: 28, fontWeight: "bold" }}>
                {patient.first_name?.[0]}
                {patient.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {patient.first_name} {patient.last_name}
                </Typography>
                <Typography color="text.secondary">{patient.email_address}</Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate("/profile")}
            >
              Edit Profile
            </Button>
          </Box>

          {/* Sections */}
          <Stack spacing={4}>
            {/* Personal Info */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon color="primary" /> Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><b>DOB:</b> {patient.date_of_birth}</Grid>
                  <Grid item xs={12} sm={6}><b>Gender:</b> {patient.gender}</Grid>
                  <Grid item xs={12} sm={6}><b>Contact:</b> {patient.contact_number}</Grid>
                  <Grid item xs={12} sm={6}><b>Address:</b> {patient.address}</Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Medical Info */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <LocalHospitalIcon color="error" /> Medical Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><b>Height:</b> {patient.height_cm} cm</Grid>
                  <Grid item xs={12} sm={6}><b>Weight:</b> {patient.weight_kg} kg</Grid>
                  <Grid item xs={12} sm={6}><b>Blood Group:</b> {patient.blood_group}</Grid>
                  <Grid item xs={12} sm={6}><b>Disability:</b> {patient.any_disability ? "Yes" : "No"}</Grid>
                  <Grid item xs={12} sm={6}><b>Allergies:</b> {patient.allergies}</Grid>
                  <Grid item xs={12} sm={6}><b>Conditions:</b> {patient.existing_conditions}</Grid>
                  <Grid item xs={12}><b>Medications:</b> {patient.current_medications}</Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <ContactEmergencyIcon color="warning" /> Emergency Contact
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}><b>Name:</b> {patient.emergency_contact?.contact_name}</Grid>
                  <Grid item xs={12} sm={4}><b>Relation:</b> {patient.emergency_contact?.relation}</Grid>
                  <Grid item xs={12} sm={4}><b>Phone:</b> {patient.emergency_contact?.phone}</Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <SecurityIcon color="success" /> Insurance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography>{patient.insurance?.insurance_details || "Not Provided"}</Typography>
              </CardContent>
            </Card>

            {/* Medical Records */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <InsertDriveFileIcon color="info" /> Medical Records
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {patient.medical_records && patient.medical_records.length > 0 ? (
                    patient.medical_records.map((f, idx) => (
                      <Chip
                        key={idx}
                        component={"a"}
                        icon={<InsertDriveFileIcon />}
                        label={f.filename}
                        href={f.url}
                        clickable
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        sx={{ borderRadius: 2, mb: 1, boxShadow: 1, backgroundColor: "#f5f5f5" }}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">No medical records uploaded</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
