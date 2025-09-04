import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

export default function PatientNavbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEditProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem("token"); // optional: clear token
    navigate("/"); // redirect to login
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#1976d2",
        boxShadow: 3,
        px: 2,
      }}
    >
      <Toolbar>
        {/* Brand/Logo */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            letterSpacing: 1,
            textAlign:"left",
            cursor: "pointer",
          }}
          onClick={() => navigate("/patient-dashboard")}
        >
          MediConnect
        </Typography>

        {/* Profile Menu */}
        <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
          <Avatar sx={{ bgcolor: "#fff", color: "#1976d2" }}>
            <AccountCircle />
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              boxShadow: 3,
              minWidth: 200,
            },
          }}
        >
          <MenuItem
            onClick={handleEditProfile}
            sx={{ "&:hover": { backgroundColor: "#f1f9fc" } }}
          >
            Edit Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/patient-upcoming-events");
            }}
            sx={{ "&:hover": { backgroundColor: "#f1f9fc" } }}
          >
            Upcoming Appointments
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ "&:hover": { backgroundColor: "#f1f9fc" } }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
