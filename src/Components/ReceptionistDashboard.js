import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Check, Close, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import ReceptionistNavbar from "./ReceptionistNavbar";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApprove,setLoadingApprove] = useState(false);
  const [loadingReject,setLoadingReject] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [loadingActions, setLoadingActions] = useState({}); // track per-appointment loading
  const [loadingApproveId, setLoadingApproveId] = useState(null);
  const [loadingRejectId, setLoadingRejectId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const email = localStorage.getItem("email");
        const res = await fetch(
          `http://127.0.0.1:8000/doctors/receptionist/${email}/appointments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        // Only future appointments
        const now = new Date();
        const futureAppointments = (data.appointments || []).filter(
          (appt) => new Date(appt.start_datetime) > now
        );

        setAppointments(futureAppointments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleAction = async (id, action) => {
    action === "approve" ? setLoadingApproveId(id) : setLoadingRejectId(id);
    setLoadingActions((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`http://127.0.0.1:8000/appointments/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to update appointment status");

      const data = await res.json();

      // Update appointment status in UI
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: data.status } : appt
        )
      );
      alert(`Appointment ${action}ed successfully`);
      action === "approve" ? setLoadingApproveId(null) : setLoadingRejectId(null);
    } catch (err) {
     action === "approve" ? setLoadingApproveId(null) : setLoadingRejectId(null);
      console.error(err);
      alert("Error updating appointment status");
    } finally {
      action === "approve" ? setLoadingApproveId(null) : setLoadingRejectId(null);
      setLoadingActions((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
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

  return (
    <>
      <ReceptionistNavbar />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd", p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Receptionist Dashboard
        </Typography>

        {appointments.length === 0 ? (
          <Typography>No appointments found</Typography>
        ) : (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Doctor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appt) => (
                  <React.Fragment key={appt._id}>
                    <TableRow>
                      <TableCell>
                        <IconButton onClick={() => toggleExpand(appt._id)}>
                          {expanded[appt._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{appt.doctor_name}</TableCell>
                      <TableCell>{appt.date}</TableCell>
                      <TableCell>{new Date(appt.start_datetime).toLocaleTimeString()}</TableCell>
                      <TableCell>{new Date(appt.end_datetime).toLocaleTimeString()}</TableCell>
                      <TableCell>{appt.purpose || "-"}</TableCell>
                      <TableCell>{appt.status}</TableCell>
                      <TableCell>
                        <LoadingButton
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ mr: 1 }}
                          startIcon={<Check />}
                          onClick={() => handleAction(appt._id, "approve")}
                          disabled={appt.status === "approved"|| appt.status === "rejected"}
                        >
                         {loadingApproveId === appt._id ? "loading" : "Approve"}
                        </LoadingButton>

                        <LoadingButton
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<Close />}
                          onClick={() => handleAction(appt._id, "reject")}
                          disabled={appt.status === "rejected"}
                        >
                          {loadingRejectId === appt._id ? "loading" : "Reject"}
                        </LoadingButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expanded[appt._id]} timeout="auto" unmountOnExit>
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
                                Appointment Details
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography><b>Doctor:</b> {appt.doctor_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography><b>Purpose:</b> {appt.purpose || "-"}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography><b>Status:</b> {appt.status}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography><b>Start Time:</b> {new Date(appt.start_datetime).toLocaleTimeString()}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography><b>End Time:</b> {new Date(appt.end_datetime).toLocaleTimeString()}</Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </>
  );
}
