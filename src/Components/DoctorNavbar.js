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
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useNavigate } from "react-router-dom";

export default function DoctorNavbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEditSchedule = () => {
    handleMenuClose();
    navigate("/doctor-dashboard"); // 👈 or "/doctor-schedule" if separate page
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#1565c0", // darker blue for doctors
        boxShadow: 3,
        px: 2,
      }}
    >
      <Toolbar>
        {/* Logo / Brand */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            letterSpacing: 1,
            textAlign: "left",
            cursor: "pointer",
          }}
          onClick={() => navigate("/doctor-dashboard")}
        >
          MediConnect Doctor
        </Typography>

        {/* Profile Menu */}
        <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
          <Avatar sx={{ bgcolor: "#fff", color: "#1565c0" }}>
            <EventNoteIcon />
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
