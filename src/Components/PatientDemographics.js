import React, { useState , useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Divider,
  Box,
  Alert
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { Navigate } from "react-router-dom";
import { Chip, Stack } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PatientNavbar from "./PatientNavbar";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";


export default function PatientForm() {

  const navigate = useNavigate();

  const [existingFiles, setExistingFiles] = useState([]); // files from backend
  const [newFiles, setNewFiles] = useState([]);   
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    contact: "",
    email: localStorage.getItem("email"),
    address: "",
    height: "",
    weight: "",
    disability: false,
    allergies: "",
    conditions: "",
    medications: "",
    bloodGroup: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    insurance: "",
  });


  useEffect(() => {
  const fetchPatientData = async () => {
    try {
      const email = localStorage.getItem("email");  

const res = await fetch(`https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/patients/?email_address=${email}`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }
});
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      

      const data = await res.json();
      console.log(data);
      if (data && data.length > 0) {
        const patient = data[0]; // assuming API returns a list
        setFormData({
          firstName: patient.first_name || "",
          lastName: patient.last_name || "",
          dob: patient.date_of_birth || "",
          gender: patient.gender || "",
          contact: patient.contact_number || "",
          email: patient.email_address || "",
          address: patient.address || "",
          height: patient.height_cm || "",
          weight: patient.weight_kg || "",
          disability: patient.any_disability || false,
          allergies: patient.allergies || "",
          conditions: patient.existing_conditions || "",
          medications: patient.current_medications || "",
          bloodGroup: patient.blood_group || "",
          emergencyName: patient.emergency_contact?.contact_name || "",
          emergencyRelation: patient.emergency_contact?.relation || "",
          emergencyPhone: patient.emergency_contact?.phone || "",
          insurance: patient.insurance.insurance_details ? patient.insurance.insurance_details : "",
        });
        setExistingFiles(patient.medical_records || []);
      }
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
    }
  };

  fetchPatientData();
}, []);


  const calculateProgress = () => {
  const requiredFields = [
    "firstName", "lastName", "dob", "gender", "contact", "email",
    "address", "height", "weight", "allergies", "conditions",
    "medications", "bloodGroup", "emergencyName", "emergencyRelation",
    "emergencyPhone"
  ];

  let filled = requiredFields.filter((field) => formData[field]?.toString().trim() !== "").length;
  return Math.round((filled / requiredFields.length) * 100);
};


  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;
  if (type === "checkbox") {
    setFormData({ ...formData, [name]: checked });
  } else if (type === "file") {
    setNewFiles(prev => [...prev, ...Array.from(files)]);
  } else {
    setFormData({ ...formData, [name]: value });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("first_name", formData.firstName);
    data.append("last_name", formData.lastName);
    data.append("date_of_birth", formData.dob);
    data.append("gender", formData.gender);
    data.append("contact_number", formData.contact);
    data.append("email_address", formData.email);
    data.append("height_cm", formData.height);
    data.append("address", formData.address);
    data.append("weight_kg", formData.weight);
    data.append("any_disability", formData.disability);
    data.append("allergies", formData.allergies);
    data.append("existing_conditions", formData.conditions);
    data.append("current_medications", formData.medications);
    data.append("blood_group", formData.bloodGroup);
    data.append("emergency_contact_name", formData.emergencyName);
    data.append("emergency_relation", formData.emergencyRelation);
    data.append("emergency_phone", formData.emergencyPhone);
    data.append("insurance_details", formData.insurance);
    if (newFiles.length > 0) {
      newFiles.forEach(f => {
      data.append("medical_records", f);  
    });
    }
    try {

const res = await fetch("https://mediconnect-backend-g7g9gjaxeacxbtd2.centralindia-01.azurewebsites.net/patients/", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: data
});

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const result = await res.json();
    console.log("✅ Patient Created:", result);
    alert("Patient Created Successfully!");
    localStorage.setItem("is_profile_filled", "true");
    setLoading(false);
    navigate("/patient-dashboard")
  } catch (error) {
    setLoading(false);
    console.error("", error);
    alert("Failed to submit form.");
  }
};


  const fieldProps = {
    fullWidth: true,
    size: "small",
    variant: "outlined",
  };

  return (
    <>
      <PatientNavbar />
    <Box 
  sx={{ 
    minHeight: "100vh", 
    backgroundColor: "#e3f2fd",   // soft gray-blue
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    flexDirection:"column",
    p: 4 
  }}
>
   <Alert severity="info" sx={{ mb: 1, borderRadius: 2, width: "700px" , backgroundColor:"lightblue" }}>
    Please make sure all details are correct. Doctors will use this information to provide better care.
  </Alert>
    
    <Paper sx={{ p: 4, maxWidth: 1200, mx: "auto", my: 4 }}>
      <form onSubmit={handleSubmit}>
        {/* 🧑‍⚕️ Patient Info */}
        <Typography variant="h6" gutterBottom>
          🧑‍⚕️ Patient Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          Profile Completion: {calculateProgress()}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={calculateProgress()}
          sx={{ 
            mb: 3, 
            height: 16,          
            width: "60%",        
            borderRadius: 5, 
            mx: "auto"          
          }}
        />

        <Grid container rowSpacing={2} sx={{display: "flex" , justifyContent:"space-evenly",alignItems:"center"}}>
          {/* Row 1 → 3 fields */}
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx ={{width:"30%"}}>
            <TextField {...fieldProps} required label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx ={{width:"30%"}}>
            <TextField {...fieldProps} required label="Contact Number" name="contact" value={formData.contact} onChange={handleChange} />
          </Grid>

          {/* Row 2 → 3 fields */}
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required type="date" label="Date of Birth" name="dob" InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} select required label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>

          {/* Row 3 → 1 field full width */}
          <Grid item xs={12} sx={{width:"96%"}}>
            <TextField {...fieldProps} required label="Address" name="address" multiline rows={3} value={formData.address} onChange={handleChange} />
          </Grid>
        </Grid>

        {/* 🩺 Medical Information */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          🩺 Medical Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container rowSpacing={2} sx={{display: "flex" , justifyContent:"space-evenly",alignItems:"center"}}>
          {/* Row 1 → 3 fields */}
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} display="flex" required alignItems="center" sx={{width:"30%"}}>
            <FormControlLabel control={<Checkbox checked={formData.disability} onChange={handleChange} name="disability" />} label="Any Disability Please Check This Box" />
          </Grid>

          {/* Row 2 → 3 fields */}
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Existing Conditions" name="conditions" value={formData.conditions} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required select label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
              {bloodGroups.map((bg) => (
                <MenuItem key={bg} value={bg}>{bg}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Row 3 → 1 field full width */}
          <Grid item xs={12} sx={{width:"96%"}}>
            <TextField {...fieldProps} required label="Current Medications" name="medications" multiline rows={2} value={formData.medications} onChange={handleChange} />
          </Grid>
        </Grid>

        {/* 🚨 Emergency Contact */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          🚨 Emergency Contact
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} sx={{display: "flex" , justifyContent:"space-evenly",alignItems:"center"}}>
          {/* Row → 3 fields */}
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Contact Name" name="emergencyName" value={formData.emergencyName} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Relation" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4} sx={{width:"30%"}}>
            <TextField {...fieldProps} required label="Phone" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
          </Grid>
        </Grid>

        {/* 🛡 Insurance */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          🛡 Insurance Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} sx={{display: "flex" , justifyContent:"space-evenly",alignItems:"center"}}>
          {/* Row → 1 field full width */}
          <Grid item xs={12} sx={{width:"96%"}}>
            <TextField {...fieldProps} label="Insurance Details" name="insurance" value={formData.insurance} onChange={handleChange} />
          </Grid>
        </Grid>

        {/* 📂 Medical Records */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          📂 Medical Records
        </Typography>
        <Divider sx={{ mb: 2 }} />

       <Grid container spacing={2}>
  <Grid item xs={12}>
    <Button variant="outlined" component="label" fullWidth>
      Upload Medical Documents
      <input 
        type="file" 
        name="files" 
        hidden 
        multiple 
        onChange={handleChange} 
      />
    </Button>

    {/* File list styled as chips */}
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
      {existingFiles.map((f, idx) => (
        <Chip
          key={`existing-${idx}`}
          icon={<InsertDriveFileIcon />}
          component="a"
          href={f.url} 
          label={f.filename}
          variant="outlined"
          clickable
          target="_blank"
          rel="noopener noreferrer"
          sx={{ borderRadius: 2, mb: 1 }}
        />
      ))}

      {newFiles.map((f, idx) => (
        <Chip
          key={`new-${idx}`}
          icon={<InsertDriveFileIcon />}
          label={f.name}
          variant="outlined"
          sx={{ borderRadius: 2, mb: 1 , "&:hover": {
                          backgroundColor: "#e3f2fd",
                        }}}
        />
      ))}
    </Stack>
  </Grid>
</Grid>

        {/* ✅ Submit */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
  <Grid item xs={6}>
    <Button 
      variant="outlined" 
      fullWidth 
      onClick={() => navigate("patient-dashboard")} // 👈 simple back
    >
      Back
    </Button>
  </Grid>
  <Grid item xs={6}>
    <LoadingButton type="submit" variant="contained" loading={loading} fullWidth>
      Submit Form
    </LoadingButton>
  </Grid>
</Grid>
      </form>
    </Paper>
    </Box>
    </>
  );
}
