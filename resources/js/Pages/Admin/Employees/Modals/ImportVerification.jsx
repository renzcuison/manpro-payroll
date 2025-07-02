import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const ImportVerification = ({ open, close, data }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [birthdateError, setBirthdateError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const [firstName, setFirstName] = useState();
    const [middleName, setMiddleName] = useState();
    const [lastName, setLastName] = useState();
    const [suffix, setSuffix] = useState();
    const [email, setEmail] = useState();
    const [birthdate, setBirthdate] = useState();

    const [password, setPassword] = useState();

    useEffect(() => {
        if (data) {
            const fName = data["First Name"] || "";
            const lName = data["Last Name"] || "";
            const bDate = data["Birthdate"] || "";

            setFirstName(fName);
            setMiddleName(data["Middle Name"] || "");
            setLastName(lName);
            setSuffix(data["Suffix"] || "");
            setEmail(data["Email"] || "");
            setBirthdate(bDate);

            // Generate password
            const firstPart = fName ? fName.charAt(0).toUpperCase() + fName.slice(1, 3) : "";
            const lastPart = lName ? lName.charAt(0).toUpperCase() + lName.slice(1, 3) : "";
            const generatedPassword = `${firstPart}${lastPart}@${bDate}`;
            setPassword(generatedPassword);
        }
    }, [data]);

        const checkInput = (event) => {
            event.preventDefault();
    
            if (!firstName) {
                setFirstNameError(true);
            } else {
                setFirstNameError(false);
            }
    
            if (!lastName) {
                setLastNameError(true);
            } else {
                setLastNameError(false);
            }
    
            if (!email) {
                setEmailError(true);
            } else {
                setEmailError(false);
            }
    
            if (!birthdate) {
                setBirthdateError(true);
            } else {
                setBirthdateError(false);
            }
    
            if (!password) {
                setPasswordError(true);
            } else {
                setPasswordError(false);
            }
    
            if (!firstName || !lastName || !email || !birthdate || !password ) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "All fields must be filled!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            } else {
                new Swal({
                    customClass: { container: "my-swal" },
                    title: "Are you sure?",
                    text: "You want to save this employee?",
                    icon: "warning",
                    showConfirmButton: true,
                    confirmButtonText: 'Save',
                    confirmButtonColor: '#177604',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                }).then((res) => {
                    if (res.isConfirmed) {
                        saveInput(event);
                    }
                });
            }
        };

        const saveInput = (event) => {
            event.preventDefault();
    
            const data = {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                suffix: suffix,
                userName: email,
                emailAddress: email,
                birthdate: birthdate,
                phoneNumber: "",
                address: "",
                password: password,
            };
    
            axiosInstance.post('/employee/saveEmployee', data, { headers })
                .then(response => {
                    if (response.data.status === 200) {
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Employee saved successfully!",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true,
                            confirmButtonText: 'Proceed',
                            confirmButtonColor: '#177604',
                        }).then(() => {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Employee saved successfully!",
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonColor: '#177604',
                            });
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }} >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}>
                            Import Employee
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{ '& label.Mui-focused': {color: '#97a5ba'}, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}}, }}>
                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="firstName"
                                    label="First Name"
                                    variant="outlined"
                                    value={firstName}
                                    error={firstNameError}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="middleName"
                                    label="Middle Name"
                                    variant="outlined"
                                    value={middleName ?? ''}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="lastName"
                                    label="Last Name"
                                    variant="outlined"
                                    value={lastName}
                                    error={lastNameError}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '10%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="suffix"
                                    label="Suffix"
                                    variant="outlined"
                                    value={suffix ?? ''}
                                    onChange={(e) => setSuffix(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{ '& label.Mui-focused': {color: '#97a5ba'}, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}}, }}>
                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="email"
                                    label="Email"
                                    variant="outlined"
                                    value={email}
                                    error={emailError}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="birthDate"
                                    label="Birth Date"
                                    variant="outlined"
                                    value={birthdate ?? ''}
                                    error={birthdateError}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="password"
                                    label="Password"
                                    variant="outlined"
                                    value={password ?? ''}
                                    error={passwordError}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Employee </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default ImportVerification;