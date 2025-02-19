import React, {  useState, useEffect, useRef } from 'react'

import { Box, Button, Typography, FormGroup, TextField, FormControl, List, ListItem, ListItemIcon, ListItemText, Link, Checkbox } from '@mui/material';

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

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Swal from "sweetalert2";

export default function SignInCard() {

    const navigate = useNavigate()
    const { login } = useAuth();

    const { user, isFetching } = useUser();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '0 2rem' }} >
            <Box sx={{ display: 'flex', width: '100%', maxWidth: '1500px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden' }} >

                {/* Left Section */}
                <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2, maxWidth: '35%', p: 4, backgroundColor: '#f7f7f7' }}  >
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
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, backgroundColor: 'white', maxWidth: '65%' }} >
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 2 }}
                        // onSubmit={checkInput}
                        noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" component="h1" sx={{ mb: 4, color: '#177604' }}> <strong>Employee Registration Form</strong> </Typography>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="firstName"
                                    label="First Name"
                                    variant="outlined"
                                    // value={firstName}
                                    // error={firstNameError}
                                    // onChange={(e) => setFirstName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="middleName"
                                    label="Middle Name"
                                    variant="outlined"
                                    // value={middleName}
                                    // onChange={(e) => setMiddleName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="lastName"
                                    label="Last Name"
                                    variant="outlined"
                                    // value={lastName}
                                    // error={lastNameError}
                                    // onChange={(e) => setLastName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '10%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="suffix"
                                    label="Suffix"
                                    variant="outlined"
                                    // value={suffix}
                                    // onChange={(e) => setSuffix(e.target.value)}
                                />
                            </FormControl>
                        
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="userName"
                                    label="User Name"
                                    variant="outlined"
                                    // value={userName}
                                    // error={userNameError}
                                    // onChange={(e) => setUserName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="emailAddress"
                                    label="Email Address"
                                    variant="outlined"
                                    // value={emailAddress}
                                    // error={emailAddressError}
                                    // onChange={(e) => setEmailAddress(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="phoneNumber"
                                    label="Phone Number"
                                    variant="outlined"
                                    // value={phoneNumber}
                                    // onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '70%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    // value={address}
                                    // onChange={(e) => setAddress(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="birthdate"
                                        label="Birth Date"
                                        variant="outlined"
                                        // onChange={(newValue) => setBirthdate(newValue)}
                                        // slotProps={{
                                            // textField: { required: true, error: birthdateError }
                                        // }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="Password"
                                    label="Password"
                                    variant="outlined"
                                    type="password"
                                    // value={password}
                                    // error={passwordError}
                                    // onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="confirmPassword"
                                    label="Confirm Password"
                                    variant="outlined"
                                    type="password"
                                    // value={confirm}
                                    // error={confirmError}
                                    // onChange={(e) => setConfirm(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center">
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Submit </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </Box>

            </Box>
        </Box>

        
    );
}
