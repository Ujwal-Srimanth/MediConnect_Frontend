import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  CircularProgress,
  Chip,
  CardHeader,
  Avatar,
} from "@mui/material";
import axios from "axios";
import PatientNavbar from "./PatientNavbar";

export default function PastAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`; // local testing
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");

        const res = await axios.get(`${BASE_URL}/appointments/all/patients/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.appointments) {
          const pastWithRecords = res.data.appointments.filter(
            (appt) =>
              new Date(appt.start_datetime) < new Date() &&
              appt.medical_records?.length > 0
          );
          setAppointments(pastWithRecords);
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        pb: 6,
      }}
    >
      <PatientNavbar />

      <Box sx={{ px: { xs: 2, md: 6 }, pt: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#0d47a1", mb: 4, textAlign: "center" }}
        >
          📝 Past Appointments with Medical Records
        </Typography>

        {loading ? (
          <Stack spacing={2} alignItems="center" sx={{ mt: 6 }}>
            <CircularProgress />
            <Typography>Loading appointments...</Typography>
          </Stack>
        ) : appointments.length === 0 ? (
          <Typography sx={{ textAlign: "center", mt: 6, color: "#555" }}>
            No past appointments with medical records found.
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {appointments.map((appt, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 4,
                    transition: "all 0.3s",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* Card Header */}
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                        {appt.doctor.name[0]}
                      </Avatar>
                    }
                    title={appt.purpose || "Consultation"}
                    titleTypographyProps={{ fontWeight: "bold", color: "#1565c0" }}
                    subheader={`${appt.doctor.name} • ${appt.doctor.specialization}`}
                  />

                  <Divider sx={{ mx: 2, mb: 1 }} />

                  <CardContent sx={{ flex: 1 }}>
                    {/* Hospital & Date/Time */}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Hospital:</strong> {appt.doctor.hospital}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Date & Time:</strong>{" "}
                      {new Date(appt.date).toLocaleDateString()} •{" "}
                      {new Date(appt.start_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {new Date(appt.end_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>

                    {/* Medical Records */}
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Medical Records:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {appt.medical_records.map((file, i) => (
                        <Chip
                          key={i}
                          label={file.filename}
                          component="a"
                          href={file.url}
                          target="_blank"
                          clickable
                          sx={{
                            mb: 1,
                            textDecoration: "none",
                            bgcolor: "#e3f2fd",
                            "&:hover": { bgcolor: "#bbdefb" },
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
