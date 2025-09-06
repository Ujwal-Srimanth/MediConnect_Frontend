import {Routes,Route, Navigate} from 'react-router-dom'
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
  IconButton
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginImage from '../Static/LoginImage.jpg'; 
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import { useNavigate } from "react-router-dom";
import axios from 'axios';



function Login() {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [showPassword,setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token:token, role:role, email: userEmail,is_profile_filled:is_profile_filled,id:id } = response.data;
      console.log(response.data);

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("is_profile_filled", is_profile_filled);
      localStorage.setItem("user_id",id);


      if (role === "Patient") {
        navigate("/patient-dashboard");
      } else if (role === "Doctor") {
        navigate("/doctor-dashboard");
      } else if (role === "Receptionist") {
        navigate("/receptionist-dashboard");
      } 
      else if (role === "Admin") {
        navigate("/admin");
      }
      else {
        navigate("/"); 
      }
      setLoading(false);
    } catch (error) {
        setLoading(false);
      if (error.response) {
        alert(error.response.data.detail);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };
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
        <Paper elevation={6} sx = {{padding : 4, mt:8 ,backgroundColor: "rgba(240,248,255,0.85)",width:{xs:"90%",sm:"400px",md:"480px"},boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    backdropFilter: "blur(6px)"}}>
            <Box sx = {{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <Avatar sx={{ m: 1, bgcolor: 'grey' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
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
                        onChange = {(e)=>setPassword(e.target.value)}
                        autoFocus
                    />

                    <LoadingButton
                        type="submit"
                        fullWidth
                        loading={loading}
                        onSubmit = {handleSubmit}
                        variant = "contained"
                        sx = {{mt:3,mb:2}}
                    >Submit</LoadingButton>

                    <Grid container direction="column" alignItems="center" spacing={1}>
                        <Grid item xs>
                            <Link href = "/forgot-password" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Typography variant = "body2" component="span">
                                Dont Have an account? 
                            </Typography>   
                            <Link href="/signup" sx={{ml:0.1}}>Signup</Link>
                        </Grid>
                    </Grid>

                </Box>
            </Box>
        </Paper>
    </Container>
    </Box>
  );
}

export default Login;
