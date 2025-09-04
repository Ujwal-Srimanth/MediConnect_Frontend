import {Routes,Route, Navigate} from 'react-router-dom'
import LoadingButton from '@mui/lab/LoadingButton';
import React, { use, useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  MenuItem
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginImage from '../Static/LoginImage.jpg'; 
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Signup() {
      const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [showPassword,setShowPassword] = useState(false);
    const [confirmPassword,setConfirmPassword] = useState("");
    const [showConfirmPassword,setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [mobile, setMobile] = useState("");
    const [role, setRole] = useState("Patient");
    const [doctorId, setDoctorId] = useState("");
    const [doctorIdErrros,setDoctorIDErrros] = useState("");
    const [RecIdErrros,setRecIDErrros] = useState("");
    const [receptionistId, setReceptionistId] = useState("");
    const [loading,setLoading] = useState(false);
    const [loadingVerify,setloadingVerify] = useState(false);
    const [isVerified,setIsVerified] = useState(false);


    const VerifyReceptionist = async (id) => {
  try {
    console.log(id);
    setloadingVerify(true);

    // 1️⃣ Check if receptionist exists in the system
    const resReceptionist = await fetch(`http://127.0.0.1:8000/doctors/receptionist/${id}`, {
      method: "GET",
    });

    if (!resReceptionist.ok) {
      setIsVerified(false);
      setloadingVerify(false);
      const errData = await resReceptionist.json();
      console.error("Error:", errData.detail);
      alert(errData.detail);
      return false;
    }

    const receptionistData = await resReceptionist.json();
    if (!receptionistData) {
      setIsVerified(false);
      setloadingVerify(false);
      return false;
    }

    console.log(resReceptionist);

    // 2️⃣ Check if receptionistID is already registered in your users collection
    const resRegistered = await fetch(`http://127.0.0.1:8000/api/auth/verify-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ID: id }),
    });

    console.log(resRegistered);

    if (!resRegistered.ok) {
      setIsVerified(false);
      setloadingVerify(false);
      setRecIDErrros("Not verified");
      return false;
    }

    const registeredData = await resRegistered.json();
    console.log(registeredData);

    const alreadyRegistered = registeredData.exists;

    if (alreadyRegistered) {
      setRecIDErrros("Already Registered Please login");
      setIsVerified(false);
      setloadingVerify(false);
      return false;
    }

    setRecIDErrros("");
    setIsVerified(true);
    setloadingVerify(false);
    alert("Verified! Please Go Ahead and Signup");
    return true;
  } catch (err) {
    setloadingVerify(false);
    console.error("Error verifying receptionist:", err);
    return false;
  }
};

    const VerifyDoctor = async (id) => {
  try {
    console.log(id)
    setloadingVerify(true);

    // 1️⃣ Check if doctor exists in the system
    const resDoctor = await fetch(`http://127.0.0.1:8000/doctors/${id}`, { method: "GET" });
    if (!resDoctor.ok) {
      setIsVerified(false);
      setloadingVerify(false);
      const errData = await resDoctor.json();
      console.error("Error:", errData.detail);
      alert(errData.detail);  
      return false;
    }
    const doctorData = await resDoctor.json();
    if (!doctorData) {
      setIsVerified(false);
      setloadingVerify(false);
      return false;
    }

    console.log(resDoctor);

    // 2️⃣ Check if doctorID is already registered in your users collection
    const resRegistered = await fetch(`http://127.0.0.1:8000/api/auth/verify-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ID: id })
    });

    console.log(resRegistered);

    if (!resRegistered.ok) {
      setIsVerified(false);
      setloadingVerify(false);
       setDoctorIDErrros("Not verified");
      return false;
    }

    const registeredData = await resRegistered.json();
    console.log(registeredData);
    // registeredData.exists === true means doctor already registered
    const alreadyRegistered = registeredData.exists;

    console.log(alreadyRegistered)

    if (alreadyRegistered) {
      setDoctorIDErrros("Already Registered Please login");
      setIsVerified(false);
      setloadingVerify(false);
      return false;
    }

    setDoctorIDErrros("");
    setIsVerified(true);
    setloadingVerify(false);
    alert("Verified Please Go Ahead and Signup")
    return true;

  } catch (err) {
    setloadingVerify(false);
    console.error("Error verifying doctor:", err);
    return false;
  }
};



    const handleSubmit = async (e) => {
        
        e.preventDefault();
        if(role !== "Patient" && !isVerified)
        {
            alert("Please verify your ID")
            return;
        }
        setLoading(true);
        let ID = "";
        if (role === "Doctor") {
            ID = doctorId;
        } else if (role === "Receptionist") {
            ID = receptionistId;
        }

        const signupData = {
            "email":email,
            "password":password,
            "mobile":mobile,
            "role":role,
            "ID":ID
    }

    try {
        const response = await axios.post("http://127.0.0.1:8000/api/auth/signup", signupData);
        setLoading(false);
        navigate("/");
    } catch (error) {
        setLoading(false);
        if (error.response) {
        alert(error.response.data.detail);
    } else {
      alert("Something went wrong. Please try again.");
    }
  }
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        const newPassword = e.target.value;
        let errors = [];
        if (newPassword.length < 8) {
            errors.push("Password must be at least 8 characters long.");
        }
        if (!/[A-Z]/.test(newPassword)) {
            errors.push("Password must contain at least one uppercase letter.");
        }
        if (!/[a-z]/.test(newPassword)) {
            errors.push("Password must contain at least one lowercase letter.");
        }
        if (!/[0-9]/.test(newPassword)) {
            errors.push("Password must contain at least one number.");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            errors.push("Password must contain at least one special character.");
        }
        setPasswordErrors(errors);
    }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${LoginImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        pl : {xs:2,sm:4,md:6}
      }}
    >
    <Container component="main"  maxWidth="xs" sx = {{display:"flex",justifyContent:"flex-start",ml : 1}}> 
        <Paper elevation={6} sx = {{padding : 4, mt:4 ,backgroundColor: "rgba(240,248,255,0.85)",width:{xs:"90%",sm:"400px",md:"480px"},boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    backdropFilter: "blur(6px)"}}>
            <Box sx = {{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <Avatar sx={{ m: 1, bgcolor: 'grey' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
                <Box component="form" sx={{mt : 1}} onSubmit={handleSubmit}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value = {email}
                        onChange = {(e)=>setEmail(e.target.value)}
                        autoFocus
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        name="password"
                        autoComplete="password"
                        type={showPassword ? "text" : "password"}
                        value ={password}
                        InputProps={{
                            endAdornment:(
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={()=>setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOff/>: <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        onChange = {handlePasswordChange}
                        error = {passwordErrors.length > 0}
                        helperText={passwordErrors.length > 0 ? passwordErrors.join(' ') : ""}
                        autoFocus
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="Confirm Password"
                        label="Confirm Password"
                        name="password"
                        autoComplete="password"
                        type={showConfirmPassword ? "text" : "password"}
                        value ={confirmPassword}
                        InputProps={{
                            endAdornment:(
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <VisibilityOff/>: <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        onChange = {handleConfirmPasswordChange}
                        error = {confirmPassword !== password && confirmPassword.length > 0}
                        helperText={confirmPassword !== password && confirmPassword.length > 0 ? "Passwords do not match" : ""}
                        autoFocus
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="mobile"
                        label="Mobile Number With Country Code"
                        name="mobile"
                        type = "text"
                        value ={mobile}
                        onChange = {(e)=>setMobile(e.target.value)}
                        error = {mobile.length < 13 && mobile.length > 0}
                        helperText={mobile.length && mobile.length > 0? "Enter A Valid Mobile Number" : ""}
                        autoFocus
                    />

                    <TextField
                        select
                        label = "Select Role"
                        value = {role}
                        onChange = {(e)=>setRole(e.target.value)}
                        fullWidth
                        margin="normal"
                        SelectProps = {{
                            MenuProps:{
                                MenuListProps : {
                                    sx:{
                                        textAlign:"center",
                                    }
                                }
                            }
                        }}
                        sx = {{textAlign:"left"}}
                    >
                    
                            <MenuItem value="Patient">Patient</MenuItem>
                            <MenuItem value="Receptionist">Receptionist</MenuItem>
                            <MenuItem value="Doctor">Doctor</MenuItem>
                    </TextField>

                    {role === "Doctor" && (
                        <TextField
                            label="Doctor ID"
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                            error={!!doctorIdErrros} // true if there's an error
                            helperText={doctorIdErrros}
                            InputProps={{
                            endAdornment:(
                                <InputAdornment position="end">
                                    <LoadingButton
                                        onClick={(e)=>VerifyDoctor(doctorId)}
                                        loading = {loadingVerify}
                                    >
                                        Verify
                                    </LoadingButton>
                                </InputAdornment>
                            )
                        }}
                            fullWidth
                            margin="normal"
                        />
                    )}

                    {role === "Receptionist" && (
                    <TextField
                        label="Receptionist ID"
                        value={receptionistId}
                        onChange={(e) => setReceptionistId(e.target.value)}
                        error={!!RecIdErrros} // true if there's an error
                            helperText={RecIdErrros}
                            InputProps={{
                            endAdornment:(
                                <InputAdornment position="end">
                                    <LoadingButton
                                        onClick={(e)=>VerifyReceptionist(receptionistId)}
                                        loading = {loadingVerify}
                                    >
                                        Verify
                                    </LoadingButton>
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                        margin="normal"
                    />
                    )}


                    <LoadingButton
                        type="submit"
                        fullWidth
                        loading={loading}
                        variant = "contained"
                        sx = {{mt:3,mb:2}}
                    >Signup</LoadingButton>

                </Box>
            </Box>
        </Paper>
    </Container>
    </Box>
  );
}

export default Signup;
