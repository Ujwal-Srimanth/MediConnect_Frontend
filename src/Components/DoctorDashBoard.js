import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { Chip } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LoadingButton from "@mui/lab/LoadingButton";
import { AddCircle, Delete, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import DoctorNavbar from "./DoctorNavbar";

export default function DoctorDashboard() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctorExists, setDoctorExists] = useState(null);
  const [schedule, setSchedule] = useState({
    day_off: "",
    start_time: "",
    end_time: "",
  });
  const [breaks, setBreaks] = useState([{ start: "", end: "", reason: "" }]);
  const [appointments, setAppointments] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [patientData, setPatientData] = useState({}); // cache patient details

  // Fetch user ID and check doctor
  useEffect(() => {
    const fetchUserIdAndCheckDoctor = async () => {
      try {
        const email = localStorage.getItem("email");

        // 1️⃣ Fetch user ID
        const resUser = await fetch(
          `https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/api/auth/get-id/${email}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const userData = await resUser.json();
        setUserId(userData.ID);

        // 2️⃣ Check doctor exists
        if (userData.ID.startsWith("DOC")) {
          const resDoctor = await fetch(
            `https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/schedules/check-doctor/${userData.ID}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
          );
          const doctorData = await resDoctor.json();
          setDoctorExists(doctorData.exists);

          // 3️⃣ Fetch appointments (only if doctor exists)
          if (doctorData.exists) {
            const resAppointments = await fetch(
              `https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/appointments/${userData.ID}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const data = await resAppointments.json();
            setAppointments(data);
          }
        } else {
          setDoctorExists(false);
        }
      } catch (err) {
        console.error("Failed:", err);
        setDoctorExists(false);
      }
    };
    fetchUserIdAndCheckDoctor();
  }, []);

  // Fetch patient demographics by email (called when expanding row)
  const fetchPatientDemographics = async (email, apptId) => {
    try {
      if (patientData[email]) return; // already cached
      const res = await fetch(
        `https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/patients/?email_address=${email}`,
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
        setPatientData((prev) => ({ ...prev, [email]: data[0] }));
      }
    } catch (err) {
      console.error("Failed to fetch patient demographics:", err);
    }
  };

  // Toggle expand for a given appointment
  const handleExpandClick = (appt) => {
    setExpanded((prev) => ({ ...prev, [appt.appointment_id]: !prev[appt.appointment_id] }));
    if (appt.patient_email) {
      fetchPatientDemographics(appt.patient_email, appt.appointment_id);
    }
  };

  // Schedule form handlers
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setSchedule((prev) => ({ ...prev, [name]: value }));
  };
  const handleBreakChange = (index, field, value) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[index][field] = value;
    setBreaks(updatedBreaks);
  };
  const addBreak = () =>
    setBreaks([...breaks, { start: "", end: "", reason: "" }]);
  const removeBreak = (index) =>
    setBreaks(breaks.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const payload = {
      doctor_id: userId,
      day_off: schedule.day_off,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      breaks: breaks.map((brk) => ({
        start_time: brk.start,
        end_time: brk.end,
        reason: brk.reason,
      })),
    };
    setLoading(true);
    try {
      const res = await fetch("https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/schedules/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Schedule saved successfully!");
        setDoctorExists(true);
      } else {
        const err = await res.json();
        alert("Error: " + err.detail);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading state
  if (doctorExists === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 🔹 If doctor exists → dashboard with appointments
  if (doctorExists) {
    return (
      <>
        <DoctorNavbar />
        <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd", p: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome Doctor!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments (Next 24h)
            </Typography>

            {appointments.filter(appt => appt.status === "approved").length > 0  ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Patient Email</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Purpose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.filter(appt => appt.status === "approved").map((appt) => (
                    <React.Fragment key={appt.appointment_id}>
                      <TableRow>
                        <TableCell>
                          <IconButton onClick={() => handleExpandClick(appt)}>
                            {expanded[appt.appointment_id] ? (
                              <KeyboardArrowUp />
                            ) : (
                              <KeyboardArrowDown />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>{appt.patient_email}</TableCell>
                        <TableCell>{appt.date}</TableCell>
                        <TableCell>
                          {new Date(appt.start_datetime).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          {new Date(appt.end_datetime).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{appt.status}</TableCell>
                        <TableCell>{appt.purpose}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
<Collapse
  in={expanded[appt.appointment_id]}
  timeout="auto"
  unmountOnExit
>
  <Card
    variant="outlined"
    sx={{
      my: 2,
      backgroundColor: "#fafcff",
      borderRadius: 3,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}
  >
    <CardContent>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: "#0d47a1",
          fontWeight: 700,
          borderBottom: "2px solid #e3f2fd",
          pb: 1,
          mb: 2,
        }}
      >
        Patient Demographics
      </Typography>

      {appt.patient_email && patientData[appt.patient_email] ? (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography><b>Name:</b> {patientData[appt.patient_email].first_name} {patientData[appt.patient_email].last_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><b>DOB:</b> {patientData[appt.patient_email].date_of_birth}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><b>Gender:</b> {patientData[appt.patient_email].gender}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><b>Blood Group:</b> {patientData[appt.patient_email].blood_group}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><b>Contact:</b> {patientData[appt.patient_email].contact_number}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><b>Address:</b> {patientData[appt.patient_email].address}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><b>Allergies:</b> {patientData[appt.patient_email].allergies}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><b>Conditions:</b> {patientData[appt.patient_email].existing_conditions}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><b>Medications:</b> {patientData[appt.patient_email].current_medications}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <b>Emergency Contact:</b>{" "}
                {patientData[appt.patient_email].emergency_contact?.contact_name}{" "}
                ({patientData[appt.patient_email].emergency_contact?.relation}) –{" "}
                {patientData[appt.patient_email].emergency_contact?.phone}
              </Typography>
            </Grid>
          </Grid>

          {/* Files Section */}
          {patientData[appt.patient_email].medical_records &&
          patientData[appt.patient_email].medical_records.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#0d47a1", fontWeight: 600 }}
              >
                Patient Files
              </Typography>

              <Grid container spacing={1}>
                {patientData[appt.patient_email].medical_records.map((file, idx) => (
                  <Grid item key={idx}>
                    <Chip
                      icon={<InsertDriveFileIcon />}
                      label={file.filename}
                      component="a"
                      href={file.url} // ✅ backend URL
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      sx={{
                        borderRadius: 2,
                        backgroundColor: "#f0f7ff",
                        color: "#0d47a1",
                        border: "1px solid #bbdefb",
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      ) : (
        <Typography color="textSecondary">
          Loading demographics...
        </Typography>
      )}
    </CardContent>
  </Card>
</Collapse>


                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="textSecondary">
                No upcoming appointments
              </Typography>
            )}
          </Paper>
        </Box>
      </>
    );
  } else {
    // 🔹 If doctor doesn’t exist → show schedule popup
    return (
      <>
        <DoctorNavbar />
        <Dialog
          open
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { backgroundColor: "#f0f8ff" } }}
        >
          <DialogTitle>Set Your Schedule</DialogTitle>
          <DialogContent dividers>
            {/* Schedule Form */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h6" gutterBottom>
                Working Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    select
                    label="Day Off"
                    name="day_off"
                    value={schedule.day_off}
                    onChange={handleScheduleChange}
                    fullWidth
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Start Time"
                    type="time"
                    name="start_time"
                    value={schedule.start_time}
                    onChange={handleScheduleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="End Time"
                    type="time"
                    name="end_time"
                    value={schedule.end_time}
                    onChange={handleScheduleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Breaks Section */}
            <Paper sx={{ p: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h6" gutterBottom>
                Breaks
              </Typography>
              {breaks.map((brk, index) => (
                <Grid
                  container
                  spacing={2}
                  key={index}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Grid item xs={3}>
                    <TextField
                      label="Break Start"
                      type="time"
                      value={brk.start}
                      onChange={(e) =>
                        handleBreakChange(index, "start", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Break End"
                      type="time"
                      value={brk.end}
                      onChange={(e) =>
                        handleBreakChange(index, "end", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Reason"
                      value={brk.reason}
                      onChange={(e) =>
                        handleBreakChange(index, "reason", e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton color="error" onClick={() => removeBreak(index)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AddCircle />}
                variant="outlined"
                onClick={addBreak}
              >
                Add Break
              </Button>
            </Paper>
          </DialogContent>
          <DialogActions>
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              Save Schedule
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
