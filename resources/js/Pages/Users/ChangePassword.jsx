import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, Menu, MenuItem, useMediaQuery, useTheme, TextField } from "@mui/material";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import { useUser } from "../../hooks/useUser";
import { useNavigate, useParams, useSearchParams, Link, } from "react-router-dom";
import Swal from "sweetalert2";

import manProLogo from '../../../images/ManPro.png'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';


const ChangePassword = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const isMdUp = useMediaQuery('(min-width: 1440px)');

    const [currentPassError, setCurrentPassError] = useState(false);
    const [newPassError, setNewPassError] = useState(false);
    const [confirmNewPassError, setConfirmNewPassError] = useState(false);

    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState(''); 
    const [confirmNewPass, setConfirmNewPass] = useState(''); 

    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

    const [disableChangePass, setDisableChangePass] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();
        
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmNewPass(false);
        setDisableChangePass(true);

        if (!currentPass) {
            setCurrentPassError(true);
        } else {
            setCurrentPassError(false);
        }

        if (!newPass) {
            setNewPassError(true);
        } else {
            setNewPassError(false);
        }

        if (!confirmNewPass) {
            setConfirmNewPassError(true);
        } else {
            setConfirmNewPassError(false);
        }

        if ( !currentPass || !newPass || !confirmNewPass ) {
            setDisableChangePass(false);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            saveInput();
        }
    }

    const saveInput = () => {
        const data = { currentPass, newPass, confirmNewPass };

        axiosInstance.post(`/changePass`, data, { headers })
            .then((response) => {
                console.log(response.data.status);

                if ( response.data.status != 200 ) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: response.data.message,
                        icon: "error",
                        showConfirmButton: true,
                        confirmButtonColor: '#177604',
                    });
                } else {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: response.data.message,
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonColor: '#177604',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "/dashboard"; 
                        }
                    });
                }
                setDisableChangePass(false);
            })
            .catch((error) => {
                console.error("Error saving new password:", error);

                setDisableChangePass(false);
            });
    };

    return (
        <Layout title={"ProfileView"}>
            <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '0 2rem' }} >
                <Box sx={{ display: 'flex', width: '100%', maxWidth: '1200px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden' }} >

                    <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2, maxWidth: '60%', p: 4, backgroundColor: '#f7f7f7' }}  >
                        <img src={manProLogo} style={{ maxWidth: '300px' }} />

                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <LockIcon sx={{ color: '#177604' }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Use a mix of characters" 
                                    secondary="Ensure your password contains a mix of uppercase, lowercase letters, numbers, and special characters." 
                                    primaryTypographyProps={{ color: '#1f2937' }} 
                                    secondaryTypographyProps={{ color: '#6b7280' }} 
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <LockIcon sx={{ color: '#177604' }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Avoid common words" 
                                    secondary="Do not use easily guessable words like 'password', your name, or common phrases." 
                                    primaryTypographyProps={{ color: '#1f2937' }} 
                                    secondaryTypographyProps={{ color: '#6b7280' }} 
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <LockIcon sx={{ color: '#177604' }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Make it long" 
                                    secondary="The longer your password, the harder it is to crack. Aim for at least 8 characters." 
                                    primaryTypographyProps={{ color: '#1f2937' }} 
                                    secondaryTypographyProps={{ color: '#6b7280' }} 
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <LockIcon sx={{ color: '#177604' }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Use different passwords" 
                                    secondary="Don’t use the same password for multiple accounts. Use a unique password for each service." 
                                    primaryTypographyProps={{ color: '#1f2937' }} 
                                    secondaryTypographyProps={{ color: '#6b7280' }} 
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <LockIcon sx={{ color: '#177604' }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Change your passwords regularly" 
                                    secondary="It's a good practice to update your passwords every few months." 
                                    primaryTypographyProps={{ color: '#1f2937' }} 
                                    secondaryTypographyProps={{ color: '#6b7280' }} 
                                />
                            </ListItem>

                        </List>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, backgroundColor: 'white', maxWidth: "40%" }} >
                        
                        <Typography variant="h4" component="h1" sx={{ mb: 4, color: '#177604' }}>
                            <strong>Change Password</strong>
                        </Typography>

                        <TextField
                            fullWidth
                            label="Current Password"
                            type={showCurrentPass ? 'text' : 'password'}
                            sx={{ mt: 3, mb: 1 }}
                            InputLabelProps={{ style: { color: '#1f2937' } }}
                            InputProps={{ 
                                style: { color: '#1f2937' },
                                endAdornment: (
                                    <Button onClick={() => setShowCurrentPass(!showCurrentPass)} sx={{ color: '#1f2937' }}>
                                        {showCurrentPass ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                )
                            }}
                            error={currentPassError}
                            onChange={(e) => setCurrentPass(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            type={showNewPass ? 'text' : 'password'}
                            placeholder="••••••"
                            sx={{ my: 2 }}
                            InputLabelProps={{ style: { color: '#1f2937' } }}
                            InputProps={{ 
                                style: { color: '#1f2937' },
                                endAdornment: (
                                    <Button onClick={() => setShowNewPass(!showNewPass)} sx={{ color: '#1f2937' }}>
                                        {showNewPass ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                )
                            }}
                            error={newPassError}
                            onChange={(e) => setNewPass(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showConfirmNewPass ? 'text' : 'password'}
                            placeholder="••••••"
                            sx={{ mt: 1, mb: 3 }}
                            InputLabelProps={{ style: { color: '#1f2937' } }}
                            InputProps={{ 
                                style: { color: '#1f2937' },
                                endAdornment: (
                                    <Button onClick={() => setShowConfirmNewPass(!showConfirmNewPass)} sx={{ color: '#1f2937' }}>
                                        {showConfirmNewPass ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                )
                            }}
                            error={confirmNewPassError}
                            onChange={(e) => setConfirmNewPass(e.target.value)}
                        />

                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            sx={{ backgroundColor: '#177604', mt: 4, color: 'white', '&:hover': { backgroundColor: '#145d03' } }}
                            onClick={checkInput}
                            disabled={disableChangePass}
                        >
                            Change Password
                        </Button>
                    </Box>

                </Box>
            </Box>
        </Layout>
    );
};

export default ChangePassword;
