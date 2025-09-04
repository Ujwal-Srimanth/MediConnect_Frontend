import React, { useState } from 'react';
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
import LoginImage from '../Static/LoginImage.jpg'; 
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';

function ForgotPasswordPage() {
    const [email,setEmail] = useState("")
    const [error,setError] = useState([])
    const [error1,setError1] = useState([])
    const [otp , setOTP] = useState("")
    const [otpInput, setOtpInput] = useState("");
    const [verifiedOTP, setVerifiedOTP] = useState(false);
    const [password,setPassword] = useState("");
    const [showPassword,setShowPassword] = useState(false);
    const [confirmPassword,setConfirmPassword] = useState("");
    const [showConfirmPassword,setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);

    const [loadingEmail,setLoadingEmail] = useState(false);
    const [loadingOTP,setLoadingOTP] = useState(false);
    const [loadingPassword,setLoadingPassword] = useState(false);

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

    const verifyOTP = async (e) => {
        try{
        setLoadingOTP(true);
        const response = await axios.post("http://127.0.0.1:8000/api/auth/verify-otp",{
            email:email,
            otp:otpInput
        })
        if(response.data.valid)
        {
            setVerifiedOTP(true);
            alert(response.data.message);
        }
        else{
            setError1(["Invalid OTP"])
        }
        setLoadingOTP(true);
    }
    catch(err)
    {
        setLoadingOTP(true);
        console.log(err);
        setError1(["Something went wrong"]);
    }
    }

    const VerifyEmail = async () => {
    setLoadingEmail(true);
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/auth/verify-user-email", {
      params: { email },
    });

    if (response.data.exists) {
      alert(response.data.message || "OTP sent to your email");
      setOTP("SENT");   // ✅ now otp && !verifiedOTP will be true
      setError([]);
    } else {
      setError(["Email not registered"]);
    }
    setLoadingEmail(false);
  } catch (err) {
    setLoadingEmail(false);
    setError(["Something went wrong"]);
  }
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        try{
            const response = await axios.post("http://127.0.0.1:8000/api/auth/forgot-password",{
            email:email,
            new_password:password
        })
        if(response.data.status)
        {
            alert(response.data.message);
            window.location.href = "/";
        }
        else{
            setError(["Could not reset password"]);
        }
         setLoadingPassword(true);
        }catch(err){
             setLoadingPassword(true);
             setError(["Something went wrong"]);
        }
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
     <Container component="main" maxWidth="xs" sx={{display:"flex",justifyContent:"flex-start",ml:1}}>
        <Paper elevation={6} sx={{ padding: 4, mt: 8, backgroundColor: "rgba(240,248,255,0.85)", width: { xs: "90%", sm: "400px", md: "480px" }, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", backdropFilter: "blur(6px)" }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {!verifiedOTP && <TextField
                    margin = "normal"
                    required
                    fullWidth
                    id = "email"
                    label = "Email Address"
                    name = "email"
                    autoComplete="email"
                    autoFocus
                    value = {email}
                    onChange = {(e) => setEmail(e.target.value)}
                    InputProps={{
                         endAdornment:(
                                <InputAdornment position="end">
                                    <LoadingButton loading = {loadingEmail} onClick={VerifyEmail}>Verify</LoadingButton>
                                </InputAdornment>
                            )
                    }}
                    error = {error.length > 0}
                    helperText = {error.length > 0 ? error.join(", ") : ""}
                />
        }

                {otp && !verifiedOTP && (
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="otp"
                        label="OTP"
                        name="otp"
                        autoComplete="otp"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        InputProps={{
                         endAdornment:(
                                <InputAdornment position="end">
                                    <LoadingButton loading = {loadingOTP} onClick={verifyOTP}>Verify</LoadingButton>
                                </InputAdornment>
                            )
                        }}
                        error = {error1.length > 0}
                        helperText = {error1.length > 0 ? error.join(", ") : ""}
                    />
                )}

                {verifiedOTP && (
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
                )}
                {verifiedOTP && (
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
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
                )}

                {verifiedOTP && (
                    <LoadingButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleSubmit}
                        loading={loadingPassword}
                    >
                        Submit
                    </LoadingButton>
                )}
            </Box>
        </Paper>
     </Container>
     </Box>
   );
 }


 export default ForgotPasswordPage;