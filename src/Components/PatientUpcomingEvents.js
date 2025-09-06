import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  TablePagination,
} from "@mui/material";
import PatientNavbar from "./PatientNavbar";
import LoadingButton from '@mui/lab/LoadingButton';

export default function PatientUpcomingEvents() {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  // Cancel appointment
  async function Cancel(appointmentId) {
    const token = localStorage.getItem("token");

    if (!token) return alert("User not logged in");

    try {
      setCanceling(appointmentId); 
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/appointments/patients/cancel/${appointmentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to cancel appointment");
      }
      setBookedSlots((prev) =>
        prev.filter((slot) => slot.appointment_id !== appointmentId)
      );
      setCanceling(null);
      alert("Appointment cancelled successfully");
    } catch (err) {
      setCanceling(null);
      console.error(err);
      alert(err.message);
    }
  }

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const patientId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!patientId || !token) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/appointments/patients/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setBookedSlots(data.appointments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSlots = bookedSlots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      {/* Navbar */}
      <PatientNavbar />

      <Box
        sx={{
          minHeight: "100vh",
          py: 5,
          px: 2,
          background: "linear-gradient(120deg, #e3f2fd, #bbdefb, #90caf9)",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: 4,
            borderRadius: 5,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 4,
              borderBottom: "3px solid #1976d2",
              pb: 1,
              textAlign: "center",
            }}
          >
            Upcoming Appointments
          </Typography>

          {loading ? (
            <Typography sx={{ textAlign: "center", py: 5 }}>Loading...</Typography>
          ) : bookedSlots.length === 0 ? (
            <Typography sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
              No upcoming appointments found.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {paginatedSlots.map((slot) => (
                <Paper
                  key={slot.appointment_id}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                    {slot.date} - {slot.status}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: "text.secondary" }}>
                    Time: {new Date(slot.start_datetime).toLocaleTimeString()} -{" "}
                    {new Date(slot.end_datetime).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: "text.secondary" }}>
                    Purpose: {slot.purpose || "Not specified"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
                    Doctor: {slot.doctor?.name} ({slot.doctor?.specialization}) @{" "}
                    {slot.doctor?.hospital}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <LoadingButton
                      variant="contained"
                      color="error"
                      onClick={() => Cancel(slot.appointment_id)}
                      sx={{ borderRadius: 3, textTransform: "none", px: 3 }}
                      loading={canceling === slot.appointment_id}   // ✅ only loading one
                      disabled={slot.status === "rejected"}
                    >
                      Cancel
                    </LoadingButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {bookedSlots.length > rowsPerPage && (
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <TablePagination
                component="div"
                count={bookedSlots.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[3,5, 10, 20]}
              />
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{ mt: 4, fontStyle: "italic", color: "text.secondary", textAlign: "center" }}
          >
            * Please note: Appointments may be canceled by the doctor in case of emergencies.
          </Typography>
        </Paper>
      </Box>
    </>
  );
}
