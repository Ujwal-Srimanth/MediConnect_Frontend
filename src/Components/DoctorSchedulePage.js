import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PatientNavbar from "./PatientNavbar";
import LoadingButton from '@mui/lab/LoadingButton';
const purposes = {
  Consultation: 15,
  "Follow-up": 30,
  "Minor Procedure": 45,
  "Major Procedure": 60,
};

export default function DoctorSchedulePage() {
  const { id } = useParams();
  const location = useLocation();
  const { doctorName, specialty, fee } = location.state || {};
  const doctor = { name: doctorName, specialty, fee };

  const [doctorHolidays, setDoctorHolidays] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch schedules/holidays
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);

        const res = await fetch(`http://127.0.0.1:8000/schedules/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch schedules");
        const data = await res.json();

        const defaultHolidays = data.length ? data.map((sched) => sched.day_off) : [];
        setDoctorHolidays({ defaultHolidays });
      } catch (err) {
        console.error(err);
        setDoctorHolidays({ defaultHolidays: [] });
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [id]);

  // Compute next 7 available dates excluding holidays
  useEffect(() => {
    if (loadingSchedules || !doctorHolidays) return;

    const defaultHolidays = doctorHolidays.defaultHolidays || [];
    const today = new Date();
    const next7Days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const formattedDate = date.toISOString().split("T")[0];

      if (!defaultHolidays.includes(dayName)) {
        next7Days.push({ date: formattedDate, day: dayName });
      }
    }
    setAvailableDates(next7Days);
  }, [doctorHolidays, loadingSchedules]);

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);

        const res = await fetch(
          `http://127.0.0.1:8000/doctors/${id}/${selectedDate}/slots`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();

        const mappedSlots = data.slots.map((slot, index) => ({
          slotId: index + 1,
          date: slot.date,
          startDateTime: slot.start_datetime,
          endDateTime: slot.end_datetime,
          isBooked: slot.status !== "available",
          status: slot.status,
        }));

        setSlots(mappedSlots);
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, id]);

  const slotsForDay = selectedDate && slots.filter((s) => s.date === selectedDate);

  function toLocalISOString(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  }

  const bookSlot = async (slot, purpose) => {
    try {
      setLoading(true);
      if (!purpose) return alert("Please select purpose");

      const patientId = localStorage.getItem("user_id");
      if (!patientId) return alert("Patient not logged in!");

      const duration = purposes[purpose];

      const startDate = new Date(slot.startDateTime);
      const endDate = new Date(startDate.getTime() + duration * 60000);

      const body = {
        patient_id: patientId,
        start_datetime: toLocalISOString(startDate),
        end_datetime: toLocalISOString(endDate),
        purpose,
      };

      const res = await fetch(`http://127.0.0.1:8000/appointments/${id}/book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setLoading(false);
        const errData = await res.json();
        throw new Error(errData.detail || "Booking failed");
      }

      const data = await res.json();
      alert("Appointment booked successfully!");

      // Update slots after booking
      setSlots((prev) =>
        prev.map((s) => {
          const sStart = new Date(s.startDateTime);
          const sEnd = new Date(s.endDateTime);
          const bStart = new Date(data.slot.start_datetime);
          const bEnd = new Date(data.slot.end_datetime);
          const overlaps = sStart < bEnd && sEnd > bStart;
          return overlaps ? { ...s, isBooked: true, status: data.status } : s;
        })
      );
      setLoading(false);
      setOpenDialog(false);
    } catch (err) {
      setOpenDialog(false)
      setLoading(false);
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Box sx={{ background: "#e3f2fd", minHeight: "100vh" }}>
      <PatientNavbar />

      <Box sx={{ p: 4, maxWidth: "1000px", mx: "auto" }}>
        {doctor ? (
          <>
            {/* Doctor Info */}
            <Card sx={{ mb: 4, p: 2, boxShadow: 4, borderRadius: 3, backgroundColor: "#ffffff" }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }} gutterBottom>
                  {doctor.name}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, color: "text.secondary" }}>
                  {doctor.specialty}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1">
                  <b>Consultation Fee:</b> ₹{doctor.fee}
                </Typography>
              </CardContent>
            </Card>

            {/* Date Selector */}
            <Typography variant="h6" gutterBottom>
              Select a Date
            </Typography>
            <Box display="grid"
  gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
  gap={2}
  mb={4}>
              {availableDates.map((d) => (
                <Button
                  key={d.date}
                  variant={selectedDate === d.date ? "contained" : "outlined"}
                  color={selectedDate === d.date ? "primary" : "inherit"}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                  onClick={() => setSelectedDate(d.date)}
                >
                  {d.day} ({d.date})
                </Button>
              ))}
            </Box>

            {/* Slots */}
            {selectedDate && (
              <>
                <Typography variant="h6" gutterBottom>
                  Available Slots on {selectedDate}
                </Typography>

                {loadingSlots ? (
                  <Typography>Loading slots...</Typography>
                ) : slotsForDay.length > 0 ? (
                   <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))"
        gap={2}
        mb={4}
      >
                    {slotsForDay.map((slot) => (
                      <Grid item xs={6} sm={4} md={3} key={slot.slotId}>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            minWidth:"130px",
                            borderRadius: 2,
                            fontWeight: "bold",
                            py: 1.5,
                            bgcolor: slot.isBooked ? "#e57373" : "#64b5f6",
                            "&:hover": {
                              bgcolor: slot.isBooked ? "#ef5350" : "#42a5f5",
                            },
                          }}
                          onClick={() => {
                            if (!slot.isBooked) {
                              setOpenDialog(true);
                              setSelectedSlot(slot);
                            }
                          }}
                          disabled={slot.isBooked}
                        >
                          {slot.startDateTime.split("T")[1].slice(0, 5)} -{" "}
                          {slot.endDateTime.split("T")[1].slice(0, 5)}
                        </Button>
                      </Grid>
                    ))}
                  </Box>
                ) : (
                  <Typography>No slots available</Typography>
                )}
              </>
            )}
          </>
        ) : (
          <Typography variant="body1">Doctor not found.</Typography>
        )}

        {/* Booking Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>Book Appointment</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel id="purpose-label">Select Purpose</InputLabel>
              <Select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
              >
                {Object.keys(purposes).map((purpose, idx) => (
                  <MenuItem key={idx} value={purpose}>
                    {purpose}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              sx={{ bgcolor: "#1976d2", textTransform: "none" }}
              onClick={() => {
                bookSlot(selectedSlot, selectedPurpose);
              }}
              disabled={!selectedPurpose}
              loading={loading}
            >
              Confirm Booking
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
