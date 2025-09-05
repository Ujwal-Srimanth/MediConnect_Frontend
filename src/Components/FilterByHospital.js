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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "./PatientNavbar"; // optional, if you want navbar

export default function FilterByHospitalPage() {
  const [hospitalList, setHospitalList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); 

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitalData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/hospital/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setHospitalList(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };
    fetchHospitalData();
  }, []);

  const hospitals = hospitalList.sort((a, b) => a.name.localeCompare(b.name));

  const filteredHospitals = hospitals.filter(
    (hosp) =>
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDoctors = (id) => {
    navigate(`/filter-by-doctor/${id}`);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {/* Navbar */}
      <PatientNavbar />

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
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              mb: 4,
              borderBottom: "3px solid #1976d2",
              pb: 2,
            }}
          >
            Hospital Directory
          </Typography>

          {/* Search */}
          <TextField
            label="Search by Hospital Name or Location"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 4,
              "& .MuiOutlinedInput-root": { borderRadius: 3 },
            }}
          />

          {/* Table */}
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f4f8" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Hospital</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>View Doctors</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredHospitals.length > 0 ? (
                  filteredHospitals
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((hospital, index) => (
                      <TableRow
                        key={hospital._id}
                        hover
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                          "&:hover": { backgroundColor: "#eaf4ff" },
                        }}
                      >
                        <TableCell>{hospital.name}</TableCell>
                        <TableCell>{hospital.location}</TableCell>
                        <TableCell>{hospital.mobile}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleViewDoctors(hospital._id)}
                            sx={{ borderRadius: 3, textTransform: "none", px: 3, py: 1, fontWeight: "bold" }}
                          >
                            View Doctors
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        {loading ? "Loading..." : "No Hospitals found"}</Typography>
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
              count={filteredHospitals.length}
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
