import React, {  useState, useEffect, useRef } from 'react'

import { Box, Button, Typography, FormGroup, TextField, FormControl } from '@mui/material';

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
        <Box sx={{ mx: 10, pt: 12 }}>
            <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }}
                    // onSubmit={checkInput}
                    noValidate autoComplete="off" encType="multipart/form-data" >

                    <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Employee Registration Form </Typography>

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

                    <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Employee </p>
                        </Button>
                    </Box>
                    
                </Box>
            </div> 

        </Box>
    );
}
