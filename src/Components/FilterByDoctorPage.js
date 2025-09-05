import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  TablePagination,
  Tooltip
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PatientNavbar from "./PatientNavbar"; // ✅ import navbar

export default function FilterByDoctorPage() {
  const { id } = useParams();
  const [doctorList, setDoctorsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); 

  // pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        let url = "https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/doctors/";
        if (id) {
          url = `https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/doctors/hospital/${id}`;
        }

        console.log(id);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        console.log(data)
        setDoctorsList(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };
    fetchPatientData();
  }, [id]);

  const doctors = doctorList.sort((a, b) => a.name.localeCompare(b.name));

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCheckSchedule = (doctorId, doctorName, specialty, fee) => {
    navigate(`/doctor/${doctorId}/schedule`, {
      state: { doctorName, specialty, fee },
    });
  };

  return (
    <>
      {/* ✅ Reusable Navbar */}
      <PatientNavbar />

      {/* Page Content */}
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#e8f5f9",
          py: 5,
          px: 2,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            maxWidth: "1100px",
            mx: "auto",
            borderRadius: 4,
            p: 4,
            backgroundColor: "white",
          }}
        >
          {/* Heading */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 4,
              borderBottom: "3px solid #1976d2",
              pb: 2,
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#1976d2" }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              Doctor Directory
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            label="Search by Name, Hospital, or Specialty"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 4,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          {/* Doctor Table */}
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f1f9fc" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Hospital</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Specialty</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Approx. Fee</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Free Schedule
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((doctor, index) => (
                      <TableRow
                        key={doctor._id}
                        hover
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "white" : "#f9fcfd",
                          "&:hover": { backgroundColor: "#eaf4ff" },
                        }}
                      >
                        <TableCell>{doctor.name}</TableCell>
                        <TableCell>{doctor.hospital}</TableCell>
                        <TableCell>{doctor.specialization}</TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#2e7d32" }}
                        >
                          ₹{doctor.fee}
                        </TableCell>
                        <TableCell>{doctor.gender}</TableCell>
                        <TableCell align="center">
                          <Tooltip
  title={!doctor.registered ? "Doctor is Not Available at the moment" : "Click to book appointment"}
  arrow
>
                        <span>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={!doctor.registered}
                            onClick={() =>
                              handleCheckSchedule(
                                doctor._id,
                                doctor.name,
                                doctor.specialization,
                                doctor.fee
                              )
                            }
                            sx={{
                              borderRadius: 3,
                              textTransform: "none",
                              px: 3,
                              py: 1,
                              fontWeight: "bold",
                            }}
                          >
                            Check Schedule
                          </Button>
                          </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                       {loading ? "Loading....." : "Doctors Not Found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <TablePagination
              component="div"
              count={filteredDoctors.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </Box>
        </Paper>
      </Box>
    </>
  );
}
