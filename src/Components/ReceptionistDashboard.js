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
  const [expanded, setExpanded] = useState({});
  const [loadingApproveId, setLoadingApproveId] = useState(null);
  const [loadingRejectId, setLoadingRejectId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const email = localStorage.getItem("email");
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/doctors/receptionist/${email}/appointments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

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
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/appointments/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to update appointment status");

      const data = await res.json();

      setAppointments((prev) =>
        prev.map((appt) => (appt._id === id ? { ...appt, status: data.status } : appt))
      );
      alert(`Appointment ${action}ed successfully`);
    } catch (err) {
      console.error(err);
      alert("Error updating appointment status");
    } finally {
      action === "approve" ? setLoadingApproveId(null) : setLoadingRejectId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTable = (list, showActions = false) => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
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
            {showActions && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((appt) => (
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
                {showActions && (
                  <TableCell>
                    <LoadingButton
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      startIcon={<Check />}
                      onClick={() => handleAction(appt._id, "approve")}
                      disabled={appt.status !== "pending"}
                      loading={loadingApproveId === appt._id}
                    >
                      Approve
                    </LoadingButton>

                    <LoadingButton
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Close />}
                      onClick={() => handleAction(appt._id, "reject")}
                      disabled={appt.status !== "pending"}
                      loading={loadingRejectId === appt._id}
                    >
                      Cancel
                    </LoadingButton>
                  </TableCell>
                )}
              </TableRow>

              <TableRow>
                <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
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
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const approvedAppointments = appointments.filter((a) => a.status === "approved");
  const rejectedAppointments = appointments.filter((a) => a.status === "rejected");

  return (
    <>
      <ReceptionistNavbar />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd", p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Receptionist Dashboard
        </Typography>

        {/* Note for pending */}
        {pendingAppointments.length > 0 && (
          <Typography sx={{ mb: 2, color: "orange", fontWeight: "bold" }}>
            ⚠️ Please check with the doctor before approving or cancelling any appointment.
          </Typography>
        )}

        {pendingAppointments.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, color: "#1565c0" }}>
              Pending Appointments
            </Typography>
            {renderTable(pendingAppointments, true)}
          </>
        )}

        {approvedAppointments.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, color: "green" }}>
              Approved Appointments
            </Typography>
            {renderTable(approvedAppointments)}
          </>
        )}

        {rejectedAppointments.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, color: "red" }}>
              Rejected Appointments
            </Typography>
            {renderTable(rejectedAppointments)}
          </>
        )}
      </Box>
    </>
  );
}
