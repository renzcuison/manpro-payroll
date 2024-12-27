import React, {  useState, useEffect } from 'react'
import { Box, Button, Typography, FormGroup, TextField, FormControl } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EmployeesAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [emailAddressError, setEmailAddressError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmError, setConfirmError] = useState(false);

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

    // const [birthdate, setBirthdate] = React.useState<Dayjs | null>(dayjs('2022-04-17'));
    const [birthdate, setBirthdate] = ('');

    const checkInput = (event) => {
        event.preventDefault();

        console.log("checkInput");

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

        if ( !firstName || !lastName || !userName || !emailAddress || !password || !confirm) {
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

        axiosInstance.post('/employees/saveEmployee', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Evaluation form saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/hr/performance-evaluation-review/${response.data.formId}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"AddEmployee"}>
            <Box sx={{ mx: 10, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Add Employee </Typography>
                        {/* <Typography sx={{ mt: 3, ml: 1 }}> Basic Information </Typography> */}

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
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
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
                                    required
                                    id="suffix"
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
                            <FormControl sx={{ marginBottom: 3, width: '70%', '& label.Mui-focused': { color: '#97a5ba' },
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

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="birthdate"
                                        label="Birth Date"
                                        variant="outlined"
                                        value={birthdate}
                                        onChange={(newValue) => setBirthdate(newValue)}
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
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Employee </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </div> 

            </Box>
        </Layout >
    )
}

export default EmployeesAdd
