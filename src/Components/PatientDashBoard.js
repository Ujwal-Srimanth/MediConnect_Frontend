import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "./PatientNavbar"; // Reusable Navbar
import Image from "../Static/image.jpg";
import Image1 from "../Static/image1.jpg";
import Image2 from "../Static/upcoming.jpg";
import Image3 from "../Static/profile.jpg";
import axios from "axios";

// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PatientDashBoard() {
  const navigate = useNavigate();
  const isProfileFilled = localStorage.getItem("is_profile_filled") === "true";
  const [popupOpen, setPopupOpen] = useState(!isProfileFilled);

  // Rotating Quotes
  const quotes = [
    "Your Health, Our Priority",
    "Prevention is better than cure",
    "A healthy outside starts from the inside",
    "An early check-up keeps worries away",
    "Stay active, eat well, live long",
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Analytics state
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [aiAdvice, setAiAdvice] = useState("Your personalized health advice will appear here.");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const handleOk = () => {
    setPopupOpen(false);
    navigate("/profile");
  };

  // Dashboard Options
  const filterOptions = [
    { title: "Filter by Doctor", image: Image, route: "/filter-by-doctor" },
    { title: "Filter by Hospital", image: Image1, route: "/filter-by-hospital" },
    { title: "Upcoming Appointments", image: Image2, route: "/patient-upcoming-events" },
    { title: "View Profile", image: Image3, route: "/view-profile" },
  ];

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        const res = await axios.get(`${BASE_URL}/patients/?email_address=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.length > 0) setPatient(res.data[0]);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      }
    };

    const fetchAppointments = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");

        const res = await axios.get(`${BASE_URL}/appointments/all/patients/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched Appointments:", res.data);

        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };
    fetchAppointments();
    fetchPatientData();
    
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!patient) return;

      const prompt = `
        Patient Info:
        - Name: ${patient.first_name} ${patient.last_name}
        - Age: ${patient.date_of_birth ? calculateAge(patient.date_of_birth) : "N/A"}
        - Height: ${patient.height_cm} cm
        - Weight: ${patient.weight_kg} kg
        - Allergies: ${patient.allergies || "None"}

        Upcoming Appointments Count: ${appointments?.length || 0}

        Please provide health insights, dietary advice, and any suggestions based on the above info.
        Give the answer in max 6-8 bullet points.  
        Each point should be short (1-2 lines).  
        Use the format: **Heading:** text (bold heading, then explanation in same line).  
        Do not include extra markdown, disclaimers, or long paragraphs.  
        Write the response as if you are talking directly to me. 
      `;

      try {
        const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"
        const res = await axios.post(
          `${BASE_URL}/patients/api/patient-analytics`,
          { prompt }
        );
        setAiAdvice(res.data.response || "No insights available");
        setLoadingAnalytics(false);
      } catch (err) {
        setLoadingAnalytics(false);
        console.error(err);
        setAiAdvice("Failed to fetch AI insights");
      }
    };

    fetchAnalytics();
  }, [patient, appointments]);

  // Chart data
  const chartData = appointments.reduce((acc, appt) => {
    const date = new Date(appt.date).toLocaleDateString();
    const existing = acc.find((d) => d.date === date);
    if (existing) existing.count += 1;
    else acc.push({ date, count: 1 });
    return acc;
  }, []);

  // Format AI advice into lines
  const adviceLines = aiAdvice.split(/[\n•-]+/).map((line) => line.trim()).filter((line) => line);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <PatientNavbar />

      {/* Main Content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
            👋 Welcome back
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 4 }}>
            Manage your health seamlessly with MediConnect
          </Typography>
        </Box>

        {/* Quote Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            key={currentQuoteIndex}
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1565c0", mb: 1, transition: "all 0.5s ease-in-out" }}
          >
            “{quotes[currentQuoteIndex]}”
          </Typography>
          <Divider sx={{ width: "80px", mx: "auto", borderBottomWidth: 2, borderColor: "#1976d2", mb: 2 }} />
        </Box>

        {/* Dashboard Options */}
        <Grid container spacing={4} justifyContent="center">
          {filterOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.75)",
                  borderRadius: 4,
                  boxShadow: 6,
                  transition: "0.3s",
                  "&:hover": { transform: "translateY(-10px)", boxShadow: 10 },
                  height: "100%",
                }}
              >
                <CardActionArea onClick={() => navigate(option.route)} sx={{ height: "100%" }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={option.image}
                    alt={option.title}
                    sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, objectFit: "cover" }}
                  />
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Analytics Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, textAlign: "center" }}>
            Patient Analytics
          </Typography>

          {loadingAnalytics ? (
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography>Loading analytics...</Typography>
            </Stack>
          ) : (
            <>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, mb: 4 }}>
  <Typography variant="h6" fontWeight="bold">Personalized Advice</Typography>
  <Divider sx={{ my: 2 }} />
  <Box sx={{ textAlign: "left" }}>
    <ReactMarkdown>{aiAdvice}</ReactMarkdown>
  </Box>
</Paper>


              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" fontWeight="bold">Appointments Overview</Typography>
                <Divider sx={{ my: 2 }} />
                {chartData.length === 0 ? (
                  <Typography>No appointments to display</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </>
          )}
        </Box>
      </Box>

      {/* Profile Incomplete Popup */}
      <Dialog open={popupOpen} disableEscapeKeyDown>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", color: "#1976d2" }}>
          Profile Incomplete
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", px: 4, py: 2 }}>
          <Typography variant="body1">
            Please fill your profile to continue. Completing your details helps us serve you better.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="contained" sx={{ bgcolor: "#1976d2", px: 4 }} onClick={handleOk}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
