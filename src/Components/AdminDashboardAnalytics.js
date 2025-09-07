import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboardAnalytics() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  const token = localStorage.getItem("token");
  const API = `${process.env.REACT_APP_API_BASE_URL}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, doctorRes, userRes, hospRes] = await Promise.all([
          fetch(`${API}/appointments/ball/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/doctors/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/auth/all/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/hospital/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [apptData, doctorData, userData, hospData] = await Promise.all([
          apptRes.json(),
          doctorRes.json(),
          userRes.json(),
          hospRes.json(),
        ]);

        setAppointments(apptData?.appointments || []);
        setDoctors(doctorData || []);
        setUsers(userData?.users || []);
        setHospitals(hospData || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [API, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // Derived analytics
  const registeredDoctors = users.filter((u) => u.role === "Doctor").length;
  const totalDoctors = doctors.length;
  const totalHospitals = hospitals.length;
  const totalAppointments = appointments.length;

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(roleCounts).map(([role, count]) => ({
    name: role,
    value: count,
  }));

  const doctorComparison = [
    { name: "Doctors", value: totalDoctors },
    { name: "Registered Doctors", value: registeredDoctors },
  ];

  const apptByDate = appointments.reduce((acc, appt) => {
    const date = appt.date?.split("T")[0];
    if (date) acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const apptData = Object.entries(apptByDate).map(([date, count]) => ({
    date,
    count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
        📊 Admin Analytics Dashboard
      </Typography>

      {/* Top Cards */}
      <Grid container spacing={3} mb={6} justifyContent="center">
        {[
          { label: "Total Users", value: users.length },
          { label: "Total Doctors", value: totalDoctors },
          { label: "Registered Doctors", value: registeredDoctors },
          { label: "Hospitals", value: totalHospitals },
          { label: "Appointments", value: totalAppointments },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={2.2} key={i}>
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="textSecondary">
                  {card.label}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={4}>
  {/* Doctors vs Registered Doctors */}
  <Grid item xs={12} md={4}>
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: 380 }}>
      <Typography variant="h6" mb={2} fontWeight="bold">
        Doctors vs Registered Doctors
      </Typography>
      <ResponsiveContainer width="100%" height="85%" minWidth={360}>
        <BarChart data={doctorComparison}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>

  {/* Appointments by Date */}
  <Grid item xs={12} md={4}>
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: 380 }}>
      <Typography variant="h6" mb={2} fontWeight="bold">
        Appointments by Date
      </Typography>
      <ResponsiveContainer width="100%" height="85%" minWidth={360}>
        <LineChart data={apptData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#388e3c" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>

  {/* Users by Role */}
  <Grid item xs={12} md={4}>
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: 380 }}>
      <Typography variant="h6" mb={2} fontWeight="bold">
        Users by Role
      </Typography>
      <ResponsiveContainer width="100%" height="85%" minWidth={360}>
        <PieChart>
          <Pie
            data={roleData}
            cx="50%"
            cy="50%"
            outerRadius="80%"   // <-- Responsive radius
            fill="#8884d8"
            dataKey="value"
            label
          >
            {roleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>
</Grid>


    </Box>
  );
}
