import React, {  useState, useEffect, useRef } from 'react'

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControlLabel from '@mui/material/FormControlLabel';
import BuildIcon from '@mui/icons-material/Build';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axiosInstance, { getJWTHeader } from '../utils/axiosConfig';
import { NavLink, useNavigate } from "react-router-dom";
import manProLogo from '../../images/ManPro.png'

import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";

import Swal from "sweetalert2";
import { CodeOffOutlined, MarkEmailReadOutlined } from '@mui/icons-material';

import { useMediaQuery } from '@mui/material';

export default function SignInCard() {

    const navigate = useNavigate()
    const { login } = useAuth();

    const { user, isFetching } = useUser();
    const [email, setEmail] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [code, setCode] = useState('');

    const [userError, setUserError] = useState(false);
    const [passError, setPassError] = useState(false);
    const [codeError, setCodeError] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showSignInForm, setShowSignInForm] = useState(true);
    const [showVerifyForm, setShowVerifyForm] = useState(false);

    const [disableOTP, setDisableOTP] = useState(false);
    const [disableSignIn, setDisableSignIn] = useState(false);

    // const isMdUp = useMediaQuery('(min-width: 768px)');
    const isMdUp = useMediaQuery('(min-width: 1440px)');
    
    useEffect(() => {
        if (!isFetching) {
            if (user) {
                navigate('/dashboard');
            }
        }
    }, [isFetching, user, navigate]);

    const checkInput = (event) => {
        event.preventDefault();
        
        setDisableSignIn(true);

        if (!username) {
            setUserError(true);
        } else {
            setUserError(false);
        }

        if (!password) {
            setPassError(true);
        } else {
            setPassError(false);
        }

        if ( !username || !password ) {
            setDisableSignIn(false);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            setShowPassword(false);
            saveInput(event);
        }
    }

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('user', username);
        formData.append('pass', password);
    
        axiosInstance.post('/checkUser', formData)
            .then(response => {
                if (response.data.success === 1) {

                    setEmail(response.data.email);

                    // Show the loading alert
                    Swal.fire({
                        title: "Sending OTP",
                        text: "Sending OTP to your Email",
                        icon: "info",
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        willOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Make the API call
                    axiosInstance.get(`/sendVerifyCode/${response.data.user}`)
                        .then(response => {
                            
                            if ( response.data.code != "Email" ) {
                                console.log( "Code: " + response.data.code );
                                setEmail(response.data.code);
                            }

                            Swal.fire({
                                title: "Success",
                                text: "OTP sent successfully!",
                                icon: "success",
                                confirmButtonText: 'Proceed',
                                confirmButtonColor: '#177604',
                            });

                            setShowSignInForm(false);
                            setShowVerifyForm(true);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            // Handle error
                            Swal.fire({
                                title: "Error",
                                text: "Failed to send OTP. Please try again.",
                                icon: "error",
                                confirmButtonText: 'Close',
                                confirmButtonColor: '#d33',
                            });
                        });

                } else {

                    setUserError(true);
                    setPassError(true);
                    setDisableSignIn(false);

                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        title: "Error",
                        text: "Wrong Username or Password!",
                        icon: "error",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    })
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const checkOTP = (event) => {
        event.preventDefault();

        setDisableOTP(true);

        if (!code) {
            setCodeError(true);
        } else {
            setCodeError(false);
        }

        if ( !code ) {
            setDisableOTP(false);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "OTP must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            submitOTP(event);
        }
    }

    const submitOTP = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('passcode', code);

        axiosInstance.post('/login', formData)
            .then(response => {
                if (response.data.success === 1) {
                    login(formData).then(response => {
                        setTimeout(() => {
                            if (response.user.user_type === 'SuperAdmin') {
                                navigate('/dashboard');
                            } else if (response.user.user_type === 'Admin') {
                                navigate('/dashboard');
                            } else if (response.user.user_type === 'Employee') {
                                navigate('/dashboard');
                            }
                        }, 1000);
                    }).catch(error => {
                        console.error('Login failed:', error);
                    });
                    
                } else {
                    setCodeError(true);
                    setDisableOTP(false);
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        title: "Error",
                        text: "OTP Did Not Match!",
                        icon: "error",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    })
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    return (
        <>
            {isMdUp && (
                <>
                    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '0 2rem' }} >
                        <Box sx={{ display: 'flex', width: '100%', maxWidth: '1200px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden' }} >

                            {/* Left Section */}
                            <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2, maxWidth: '60%', p: 4, backgroundColor: '#f7f7f7' }}  >
                                <img src={manProLogo} style={{ maxWidth: '300px' }} />

                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <BuildIcon sx={{ color: '#177604' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Adaptable performance"
                                            secondary="Boost your efficiency and simplify your tasks with our platform."
                                            primaryTypographyProps={{ color: '#1f2937' }}
                                            secondaryTypographyProps={{ color: '#6b7280' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <BuildIcon sx={{ color: '#177604' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Built to last"
                                            secondary="Enjoy unmatched durability with lasting investment."
                                            primaryTypographyProps={{ color: '#1f2937' }}
                                            secondaryTypographyProps={{ color: '#6b7280' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <ThumbUpIcon sx={{ color: '#177604' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Great user experience"
                                            secondary="Intuitive interface for a smooth and easy-to-use experience."
                                            primaryTypographyProps={{ color: '#1f2937' }}
                                            secondaryTypographyProps={{ color: '#6b7280' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <BuildIcon sx={{ color: '#177604' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Innovative functionality"
                                            secondary="Stay ahead with features that adapt to your needs."
                                            primaryTypographyProps={{ color: '#1f2937' }}
                                            secondaryTypographyProps={{ color: '#6b7280' }}
                                        />
                                    </ListItem>
                                </List>
                            </Box>

                            {/* Right Section (Sign-in form) */}

                            {showSignInForm && (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, backgroundColor: 'white', maxWidth: '40%' }} >
                                    
                                    <Typography variant="h4" component="h1" sx={{ mb: 2, color: '#177604' }}>
                                        <strong>Sign In</strong>
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Username or Email"
                                        type="email"
                                        placeholder="your@email.com"
                                        sx={{ mb: 2, mt: 2 }}
                                        InputLabelProps={{ style: { color: '#1f2937' } }}
                                        InputProps={{ style: { color: '#1f2937' } }}
                                        error={userError}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') checkInput(e); }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••"
                                        sx={{ my: 1 }}
                                        InputLabelProps={{ style: { color: '#1f2937' } }}
                                        InputProps={{ 
                                            style: { color: '#1f2937' },
                                            endAdornment: (
                                                <Button onClick={() => setShowPassword(!showPassword)} sx={{ color: '#1f2937' }}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </Button>
                                            )
                                        }}
                                        error={passError}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') checkInput(e); }}
                                    />
                                    <FormControlLabel
                                        control={<Checkbox defaultChecked sx={{ color: '#177604' }} />}
                                        label="Remember me"
                                        sx={{ my: 2, color: '#1f2937' }}
                                    />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ backgroundColor: '#177604', mb: 2, color: 'white', '&:hover': { backgroundColor: '#145d03' } }}
                                        onClick={checkInput}
                                        disabled={disableSignIn}
                                    >
                                        Sign in
                                    </Button>
                                    <Link 
                                        href="/forgot-password" 
                                        variant="body2" 
                                        sx={{ textAlign: 'center', display: 'block', color: '#177604', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Forgot Password?
                                    </Link>
                                </Box>
                            )}

                            {showVerifyForm && (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, backgroundColor: 'white', maxWidth: '40%' }} >
                                    
                                    <Typography variant="h4" component="h1" sx={{ mb: 2, color: '#177604' }}>
                                        <strong>OTP Verification</strong>
                                    </Typography>
                                    <Typography sx={{ mb: 2, color: '#177604' }}>
                                        We've sent a verification code to your email: {email ? email : ''}
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="One Time Password (OTP)"
                                        type="text"
                                        placeholder="One Time Password"
                                        sx={{ mb: 2, mt: 2 }}
                                        InputLabelProps={{ style: { color: '#1f2937' } }}
                                        InputProps={{ style: { color: '#1f2937' } }}
                                        error={codeError}
                                        onChange={(e) => setCode(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') checkOTP(e); }}
                                    />

                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ backgroundColor: '#177604', mb: 2, color: 'white', '&:hover': { backgroundColor: '#145d03' } }}
                                        onClick={checkOTP}
                                        disabled={disableOTP}
                                    >
                                        Verify OTP
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </>
            )}

            {!isMdUp && (
                <>
                    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '0 2rem' }} >
                        <Box sx={{ display: 'flex', width: '100%', maxWidth: '1200px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden' }} >

                            {/* Right Section (Sign-in form) */}
                            {showSignInForm && (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, backgroundColor: 'white' }} >
                                    
                                    <Typography variant="h4" component="h1" sx={{ mb: 2, color: '#177604' }}>
                                        <strong>Sign In</strong>
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Username or Email"
                                        type="email"
                                        placeholder="your@email.com"
                                        sx={{ mb: 2, mt: 2 }}
                                        InputLabelProps={{ style: { color: '#1f2937' } }}
                                        InputProps={{ style: { color: '#1f2937' } }}
                                        error={userError}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') checkInput(e); }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••"
                                        sx={{ my: 1 }}
                                        InputLabelProps={{ style: { color: '#1f2937' } }}
                                        InputProps={{ 
                                            style: { color: '#1f2937' },
                                            endAdornment: (
                                                <Button onClick={() => setShowPassword(!showPassword)} sx={{ color: '#1f2937' }}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </Button>
                                            )
                                        }}
                                        error={passError}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') checkInput(e); }}
                                    />
                                    <FormControlLabel
                                        control={<Checkbox defaultChecked sx={{ color: '#177604' }} />}
                                        label="Remember me"
                                        sx={{ my: 2, color: '#1f2937' }}
                                    />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ backgroundColor: '#177604', mb: 2, color: 'white', '&:hover': { backgroundColor: '#145d03' } }}
                                        onClick={checkInput}
                                        disabled={disableSignIn}
                                    >
                                        Sign in
                                    </Button>
                                    <Link 
                                        href="/forgot-password" 
                                        variant="body2" 
                                        sx={{ textAlign: 'center', display: 'block', color: '#177604', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Forgot Password?
                                    </Link>
                                </Box>
                            )}

                            {showVerifyForm && (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, backgroundColor: 'white' }} >
                                    
                                    <Typography variant="h4" component="h1" sx={{ mb: 2, color: '#177604' }}>
                                        <strong>OTP Verification</strong>
                                    </Typography>
                                    <Typography sx={{ mb: 2, color: '#177604' }}>
                                        We've sent a verification code to your email: {email ? email : ''}
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="One Time Password (OTP)"
                                        type="text"
                                        placeholder="One Time Password"
                                        sx={{ mb: 2, mt: 2 }}
                                        InputLabelProps={{ style: { color: '#1f2937' } }}
                                        InputProps={{ style: { color: '#1f2937' } }}
                                        error={codeError}
                                        onChange={(e) => setCode(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') checkOTP(e); }}
                                    />

                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ backgroundColor: '#177604', mb: 2, color: 'white', '&:hover': { backgroundColor: '#145d03' } }}
                                        onClick={checkOTP}
                                        disabled={disableOTP}
                                    >
                                        Verify OTP
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </>
            )}
        </>
    );
}
