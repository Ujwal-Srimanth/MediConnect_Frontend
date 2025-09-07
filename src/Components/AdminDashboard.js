import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminDashboardAnalytics from "./AdminDashboardAnalytics"; // ✅ analytics page
import Image from "../Static/image.jpg";
import Image1 from "../Static/image1.jpg";
import Image2 from "../Static/receptionist.jpg";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Rotating Quotes / Tips
  const quotes = [
    "Empower your hospital with streamlined management",
    "A good admin makes healthcare smoother",
    "Connecting patients, doctors, and receptionists with ease",
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Admin Options
  const options = [
    { title: "Add Doctor", image: Image, route: "/add-doctor" },
    { title: "Add Hospital", image: Image1, route: "/add-hospital" },
    { title: "Add Receptionist", image: Image2, route: "/add-receptionist" },
  ];

  // Loader for analytics
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate API fetch for analytics
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f1f8e9, #c8e6c9)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ✅ Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1b5e20" }}>
            ⚙️ Welcome Admin
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 4 }}>
            Manage your hospitals, doctors, and receptionists effortlessly
          </Typography>
        </Box>

        {/* Quote Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            key={currentQuoteIndex}
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#2e7d32",
              mb: 1,
              transition: "all 0.5s ease-in-out",
            }}
          >
            “{quotes[currentQuoteIndex]}”
          </Typography>
          <Divider
            sx={{
              width: "80px",
              mx: "auto",
              borderBottomWidth: 2,
              borderColor: "#388e3c",
              mb: 2,
            }}
          />
        </Box>

        {/* Dashboard Options */}
        <Grid container spacing={4} justifyContent="center">
          {options.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 4,
                  boxShadow: 6,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: 10,
                  },
                  height: "100%",
                }}
              >
                <CardActionArea
                  onClick={() => navigate(option.route)}
                  sx={{ height: "100%" }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={option.image}
                    alt={option.title}
                    sx={{
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      objectFit: "cover",
                    }}
                  />
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#2e7d32" }}
                    >
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Analytics Section - below all option cards */}
<Box
  sx={{
    mt: 6,
    p: 4,
    borderRadius: 4,
    backgroundColor: "#F0FFF0",
    boxShadow: 6,
  }}
>
  <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
    📊 Analytics Overview
  </Typography>

  {loading ? (
    <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
      <CircularProgress />
    </Box>
  ) : (
    <AdminDashboardAnalytics />
  )}
</Box>
      </Box>
    </Box>
  );
}
