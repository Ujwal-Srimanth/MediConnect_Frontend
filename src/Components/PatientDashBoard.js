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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "./PatientNavbar"; // Reusable Navbar
import Image from "../Static/image.jpg";
import Image1 from "../Static/image1.jpg";
import Image2 from "../Static/upcoming.jpg"
import Image3 from "../Static/profile.jpg"
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

  // Dashboard Options (added more for fullness)
  const filterOptions = [
    { title: "Filter by Doctor", image: Image, route: "/filter-by-doctor" },
    { title: "Filter by Hospital", image: Image1, route: "/filter-by-hospital" },
    { title: "Upcoming Appointments", image: Image2, route: "/patient-upcoming-events" },
    { title: "View Profile", image: Image3, route: "/view-profile" },
  ];

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
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography
            key={currentQuoteIndex}
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#1565c0",
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
              borderColor: "#1976d2",
              mb: 2,
            }}
          />
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
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: 10,
                  },
                  height: "100%",
                }}
              >
                <CardActionArea onClick={() => navigate(option.route)} sx={{ height: "100%" }}>
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
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Profile Incomplete Popup */}
      <Dialog open={popupOpen} disableEscapeKeyDown>
        <DialogTitle
          sx={{ fontWeight: "bold", textAlign: "center", color: "#1976d2" }}
        >
          Profile Incomplete
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", px: 4, py: 2 }}>
          <Typography variant="body1">
            Please fill your profile to continue. Completing your details helps
            us serve you better.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            sx={{ bgcolor: "#1976d2", px: 4 }}
            onClick={handleOk}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
