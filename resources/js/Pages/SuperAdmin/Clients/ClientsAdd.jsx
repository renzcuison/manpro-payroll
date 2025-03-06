import React, {  useState, useEffect } from 'react'
import { Box, Button, Typography, CircularProgress, Card, CardContent, FormGroup, TextField, MenuItem, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, RadioGroup, FormControl, FormControlLabel,  Divider } from '@mui/material';



import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import moment from 'moment';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ClientsAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loading, setLoading] = useState(true);

    const [clientNameError, setClientNameError] = useState(false);
    const [selectedPackageError, setSelectedPackageError] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [emailAddressError, setEmailAddressError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmError, setConfirmError] = useState(false);

    const [clientName, setClientName] = useState('');
    const [selectedPackage, setSelectedPackage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [userName, setUserName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        console.log("checkInput");

        if (!clientName) {
            setClientNameError(true);
        } else {
            setClientNameError(false);
        }

        if (!selectedPackage) {
            setSelectedPackageError(true);
        } else {
            setSelectedPackageError(false);
        }

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

        if (!userName) {
            setUserNameError(true);
        } else {
            setUserNameError(false);
        }

        if (!emailAddress) {
            setEmailAddressError(true);
        } else {
            setEmailAddressError(false);
        }

        if (!password) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }

        if (!confirm) {
            setConfirmError(true);
        } else {
            setConfirmError(false);
        }

        if (!clientName || !selectedPackage || !firstName || !lastName || !userName || !emailAddress || !password || !confirm) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            if ( confirm != password ){
                setConfirmError(true);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Password does not match!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            } else {
                new Swal({
                    customClass: { container: "my-swal" },
                    title: "Are you sure?",
                    text: "You want to save this client?",
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
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            clientName: clientName,
            selectedPackage: selectedPackage,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            suffix: suffix,
            userName: userName,
            emailAddress: emailAddress,
            phoneNumber: phoneNumber,
            address: address,
            password: password,
        };

        axiosInstance.post('/clients/saveClient', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Client and Admin created successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/clients`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"EvaluateCreateForm"}>
            <Box sx={{ mx: 10, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Create Client </Typography>
                        <Typography sx={{ mt: 3, ml: 1 }}> Client Information </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="clientName"
                                    label="Client Name"
                                    variant="outlined"
                                    value={clientName}
                                    error={clientNameError}
                                    onChange={(e) => setClientName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    required
                                    id="package"
                                    label="Package"
                                    value={selectedPackage}
                                    error={selectedPackageError}
                                    onChange={(event) => setSelectedPackage(event.target.value)}
                                >
                                    <MenuItem key="Basic" value="Basic"> Basic </MenuItem>
                                    <MenuItem key="Standard" value="Standard"> Standard </MenuItem>
                                    <MenuItem key="Professional" value="Professional"> Professional </MenuItem>
                                    <MenuItem key="Enterprise" value="Enterprise"> Enterprise </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <Typography sx={{ mt: 3, ml: 1 }}> Admin Account</Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="clientName"
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
                                    id="clientName"
                                    label="Middle Name"
                                    variant="outlined"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="clientName"
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
                                    required
                                    id="clientName"
                                    label="Suffix"
                                    variant="outlined"
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)}
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
                                    value={userName}
                                    error={userNameError}
                                    onChange={(e) => setUserName(e.target.value)}
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
                                    value={emailAddress}
                                    error={emailAddressError}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="phoneNumber"
                                    label="Phone Number"
                                    variant="outlined"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
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
                                    value={password}
                                    error={passwordError}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                    value={confirm}
                                    error={confirmError}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Client </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </div> 

            </Box>
        </Layout >
    )
}

export default ClientsAdd
