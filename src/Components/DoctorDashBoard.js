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
import { AddCircle, Delete, KeyboardArrowDown, KeyboardArrowUp, UploadFile } from "@mui/icons-material";
import DoctorNavbar from "./DoctorNavbar";
import { Check, Close} from "@mui/icons-material";

// Calendar imports
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, set } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { TabList } from "@mui/lab";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function DoctorDashboard() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctorExists, setDoctorExists] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [schedule, setSchedule] = useState({
    day_off: "",
    start_time: "",
    end_time: "",
  });
  const [breaks, setBreaks] = useState([{ start: "", end: "", reason: "" }]);
  const [appointments, setAppointments] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [patientData, setPatientData] = useState({});
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [upload, setUpload] = useState(false);


  // Fetch user ID and check doctor
  useEffect(() => {
    const fetchUserIdAndCheckDoctor = async () => {
      try {
        setLoadingAppointments(true); 
        const email = localStorage.getItem("email");

        // 1️⃣ Fetch user ID
        const resUser = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/auth/get-id/${email}`,
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
            `${process.env.REACT_APP_API_BASE_URL}/schedules/check-doctor/${userData.ID}`,
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

          // 3️⃣ Fetch appointments
          if (doctorData.exists) {
            const resAppointments = await fetch(
              `${process.env.REACT_APP_API_BASE_URL}/appointments/all/${userData.ID}`,
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
            console.log("All Appointments:", data);
            const approvedAppointments = data.filter((appt) => appt.status === "approved" || appt.status === "pending");
setAppointments(approvedAppointments);
setFilteredAppointments(approvedAppointments);
          }
        } else {
          setDoctorExists(false);
        }
      } catch (err) {
        console.error("Failed:", err);
        setDoctorExists(false);
      } finally
      {
        setLoadingAppointments(false);
      }
    };
    fetchUserIdAndCheckDoctor();
  }, []);


  const [loadingApproveId, setLoadingApproveId] = useState(null);
const [loadingRejectId, setLoadingRejectId] = useState(null);

const handleAction = async (id, action) => {
  action === "approve" ? setLoadingApproveId(id) : setLoadingRejectId(id);
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/appointments/${id}/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action }),
      }
    );

    if (!res.ok) throw new Error("Failed to update appointment status");

    const data = await res.json();
    console.log("Status update response:", data);

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.appointment_id === data.appointment_id ? { ...appt, status: data.status } : appt
      )
    );

    setFilteredAppointments((prev) =>
  prev.map((appt) =>
    appt.appointment_id === data.appointment_id ? { ...appt, status: data.status } : appt
  )
);
    console.log("Updated Appointments:", appointments);
  } catch (err) {
    console.error(err);
    alert("Error updating appointment status");
  } finally {
    action === "approve" ? setLoadingApproveId(null) : setLoadingRejectId(null);
  }
};


  // Fetch patient demographics
  const fetchPatientDemographics = async (email, apptId) => {
    try {
      if (patientData[email]) return;
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/patients/?email_address=${email}`,
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
  const addBreak = () => setBreaks([...breaks, { start: "", end: "", reason: "" }]);
  const removeBreak = (index) => setBreaks(breaks.filter((_, i) => i !== index));

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
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/schedules/`, {
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

  // File Upload Handlers
  const openUploadDialog = (appt) => {
    setSelectedAppointment(appt);
    setUploadDialogOpen(true);
  };
  const handleFileChange = (e) => {
 
  const newFiles = Array.from(e.target.files);
  setSelectedFiles((prev) => [...prev, ...newFiles]); // append
};

  const handleUpload = async () => {
  setUpload(true);
  if (!selectedFiles.length || !selectedAppointment) return;

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("files", file)); // note "files" instead of "file"
  formData.append("appointment_id", selectedAppointment.appointment_id);

  try {
    const res = await fetch(` ${process.env.REACT_APP_API_BASE_URL}/patients/update_medical_record`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (res.ok) {
      setUpload(false);
      alert("Files uploaded successfully!");
      setUploadDialogOpen(false);
      setSelectedFiles([]);
    } else {
      setUpload(false);
      alert("Upload failed");
    }
  } catch (err) {
    setUpload(false);
    console.error(err);
    alert("Upload failed");
  }
};


  // Calendar Events
  const futureAppointments = appointments.filter((appt) => new Date(appt.start_datetime) >= new Date());
  const pastAppointments = appointments.filter((appt) => new Date(appt.end_datetime) < new Date());

  const [calendarView, setCalendarView] = useState("month");

  const appointmentCounts = appointments.reduce((acc, appt) => {
  const dateKey = new Date(appt.start_datetime).toDateString();
  acc[dateKey] = (acc[dateKey] || 0) + 1;
  return acc;
}, {});

const aggregatedEvents = Object.entries(appointmentCounts).map(([dateKey, count]) => {
  const date = new Date(dateKey);
  return {
    title: `${count} Appointments`,
    start: date,
    end: date,
    allDay: true,
  };
});

const detailedEvents = appointments.map((appt) => ({
  title: `${appt.patient_email} (${appt.purpose})`,
  start: new Date(appt.start_datetime),
  end: new Date(appt.end_datetime),
  appointmentId: appt.appointment_id,
}));


  const events = Object.entries(appointmentCounts).map(([dateKey, count]) => {
  const date = new Date(dateKey);
  return {
    title: `${count} Appointments`, // show count
    start: date,
    end: date,
    allDay: true,
  };
});

  const handleSelectEvent = (event) => {
    const appt = appointments.find((a) => a.appointment_id === event.appointmentId);
    setFilteredAppointments([appt]);
  };
  const handleSelectSlot = (slotInfo) => {
    const selectedDate = slotInfo.start;
    const filtered = appointments.filter(
      (appt) =>
        new Date(appt.start_datetime).toDateString() === selectedDate.toDateString()
    );
    setFilteredAppointments(filtered);
  };

  if (doctorExists === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (doctorExists) {
    return (
      <>
        <DoctorNavbar />
        <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd", p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome Doctor!
          </Typography>

        {loadingAppointments ? (
  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
    <CircularProgress />
  </Box>
) : (
  <>
          {/* Calendar */}
          <Paper sx={{ p: 3, mb: 4 ,   "& .rbc-time-slot": {
      minHeight: "60px",   // make each row taller
    },}}>
            <Typography variant="h6" gutterBottom>
              Monthly Appointments Calendar
            </Typography>
            <Calendar
  localizer={localizer}
  events={calendarView === "month" ? aggregatedEvents : detailedEvents}
  startAccessor="start"
  endAccessor="end"
  style={{ height: 500, marginTop: 16 }}
  selectable
  onSelectEvent={handleSelectEvent}
  onSelectSlot={handleSelectSlot}
  onView={(view) => {setCalendarView(view) 
    console.log(view)}}   // 👈 track view
   step={15}         // each slot = 60 minutes
  timeslots={1}  
/>
          </Paper>

          {/* Appointment Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appointments for Selected Day
            </Typography>
            {filteredAppointments.length === 0 ? (
              <Typography color="textSecondary">No appointments</Typography>
            ) : (
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((appt) => {
                    const isPast = new Date(appt.end_datetime) < new Date();
                    return (
                      <React.Fragment key={appt.appointment_id}>
                         <TableRow
        sx={{
          backgroundColor:
            isPast
              ? appt.medical_records?.length > 0
                ? "#c8e6c9" // ✅ green
                : "#ffe0b2" // 🟧 orange
              : "inherit",
        }}
      >
                          <TableCell>
                            <IconButton onClick={() => handleExpandClick(appt)}>
                              {expanded[appt.appointment_id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </TableCell>
                          <TableCell>{appt.patient_email}</TableCell>
                          <TableCell>{new Date(appt.start_datetime).toDateString()}</TableCell>
                          <TableCell>{new Date(appt.start_datetime).toLocaleTimeString()}</TableCell>
                          <TableCell>{new Date(appt.end_datetime).toLocaleTimeString()}</TableCell>
                          <TableCell>{appt.status}</TableCell>
                          <TableCell>{appt.purpose}</TableCell>
                          <TableCell>
                            {isPast && (
                              <Button
                                variant="contained"
                                startIcon={<UploadFile />}
                                onClick={() => openUploadDialog(appt)}
                              >
                                Upload Records
                              </Button>
                            )}
  {new Date(appt.start_datetime) >= new Date() && (
    <>
      <LoadingButton
        variant="contained"
        color="success"
        size="small"
        sx={{ mr: 1 }}
        startIcon={<Check />}
        onClick={() => handleAction(appt.appointment_id, "approve")}
        disabled={appt.status === "approved" || appt.status === "rejected"}
        loading={loadingApproveId === appt.appointment_id}
      >
        Approve
      </LoadingButton>

      <LoadingButton
        variant="contained"
        color="error"
        size="small"
        startIcon={<Close />}
        onClick={() => handleAction(appt.appointment_id, "reject")}
        disabled={appt.status === "rejected"}
        loading={loadingRejectId === appt.appointment_id}
      >
        Cancel
      </LoadingButton>
    </>
  )}
</TableCell>

                        </TableRow>

                        <TableRow>
                          <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                            <Collapse in={expanded[appt.appointment_id]} timeout="auto" unmountOnExit>
                              <Card variant="outlined" sx={{ my: 2, backgroundColor: "#fafcff", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                                <CardContent>
                                  <Typography variant="h6" gutterBottom sx={{ color: "#0d47a1", fontWeight: 700, borderBottom: "2px solid #e3f2fd", pb: 1, mb: 2 }}>
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
                                            <b>Emergency Contact:</b> {patientData[appt.patient_email].emergency_contact?.contact_name} ({patientData[appt.patient_email].emergency_contact?.relation}) – {patientData[appt.patient_email].emergency_contact?.phone}
                                          </Typography>
                                        </Grid>
                                      </Grid>

                                      {/* Files Section */}
                                      {patientData[appt.patient_email].medical_records?.length > 0 && (
                                        <>
                                          <Divider sx={{ my: 3 }} />
                                          <Typography variant="h6" gutterBottom sx={{ color: "#0d47a1", fontWeight: 600 }}>
                                            Patient Files
                                          </Typography>

                                          <Grid container spacing={1}>
                                            {patientData[appt.patient_email].medical_records.map((file, idx) => (
                                              <Grid item key={idx}>
                                                <Chip
                                                  icon={<InsertDriveFileIcon />}
                                                  label={file.filename}
                                                  component="a"
                                                  href={file.url} 
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  clickable
                                                  sx={{ borderRadius: 2, backgroundColor: "#f0f7ff", color: "#0d47a1", border: "1px solid #bbdefb", "&:hover": { backgroundColor: "#e3f2fd" } }}
                                                />
                                              </Grid>
                                            ))}
                                          </Grid>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <Typography color="textSecondary">Loading demographics...</Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Paper>
</>
          )}

          {/* Upload Dialog */}
          <Dialog
  open={uploadDialogOpen}
  onClose={() => setUploadDialogOpen(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: 3,
      p: 2,
      backgroundColor: "#f5f7ff",
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 700, color: "#0d47a1", textAlign: "center" }}>
    Upload Medical Records
  </DialogTitle>

  <DialogContent>
    <Box
      sx={{
        border: "2px dashed #90caf9",
        borderRadius: 2,
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        backgroundColor: "#e3f2fd",
      }}
    >
      <UploadFile sx={{ fontSize: 50, color: "#42a5f5" }} />
      <Typography variant="subtitle1" color="#0d47a1" align="center">
        Drag & drop files here, or click to select
      </Typography>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="medical-file-input"
      />
      <label htmlFor="medical-file-input">
        <Button variant="contained" component="span" sx={{ mt: 2, backgroundColor: "#1976d2" }}>
          Choose Files
        </Button>
      </label>

      {selectedFiles && selectedFiles.length > 0 && (
        <Box sx={{ mt: 2, width: "100%" }}>
          <Typography variant="subtitle2" color="#0d47a1">
            Selected Files:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {Array.from(selectedFiles).map((file, idx) => (
              <Chip
                key={idx}
                icon={<InsertDriveFileIcon />}
                label={file.name}
                sx={{ backgroundColor: "#bbdefb", color: "#0d47a1" }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  </DialogContent>

  <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
    <Button onClick={() => setUploadDialogOpen(false)} color="error" variant="outlined">
      Cancel
    </Button>
    <LoadingButton
      variant="contained"
      onClick={handleUpload}
      loading={upload}
      sx={{ backgroundColor: "#1976d2" }}
    >
      Upload
    </LoadingButton>
  </DialogActions>
</Dialog>

        </Box>
      </>
    );
  } else {
    // If doctor doesn’t exist → show schedule popup
    return (
      <>
        <DoctorNavbar />
        <Dialog open fullWidth maxWidth="md" PaperProps={{ sx: { backgroundColor: "#f0f8ff" } }}>
          <DialogTitle>Set Your Schedule</DialogTitle>
          <DialogContent dividers>
            {/* Schedule Form */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h6" gutterBottom>Working Schedule</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField select label="Day Off" name="day_off" value={schedule.day_off} onChange={handleScheduleChange} fullWidth>
                    {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Start Time" type="time" name="start_time" value={schedule.start_time} onChange={handleScheduleChange} InputLabelProps={{ shrink: true }} fullWidth />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="End Time" type="time" name="end_time" value={schedule.end_time} onChange={handleScheduleChange} InputLabelProps={{ shrink: true }} fullWidth />
                </Grid>
              </Grid>
            </Paper>

            {/* Breaks Section */}
            <Paper sx={{ p: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h6" gutterBottom>Breaks</Typography>
              {breaks.map((brk, index) => (
                <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={3}><TextField label="Break Start" type="time" value={brk.start} onChange={(e) => handleBreakChange(index, "start", e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={3}><TextField label="Break End" type="time" value={brk.end} onChange={(e) => handleBreakChange(index, "end", e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={4}><TextField label="Reason" value={brk.reason} onChange={(e) => handleBreakChange(index, "reason", e.target.value)} fullWidth /></Grid>
                  <Grid item xs={2}><IconButton color="error" onClick={() => removeBreak(index)}><Delete /></IconButton></Grid>
                </Grid>
              ))}
              <Button startIcon={<AddCircle />} variant="outlined" onClick={addBreak}>Add Break</Button>
            </Paper>
          </DialogContent>
          <DialogActions>
            <LoadingButton variant="contained" color="primary" onClick={handleSubmit} loading={loading}>Save Schedule</LoadingButton>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
