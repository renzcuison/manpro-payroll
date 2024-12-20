import React, { useState } from 'react'
import { FormControl, Typography, Button, Stack, Grid, TextField, FormHelperText, InputLabel } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import HomeLogo from '../../../images/ManPro.png'
import Layout from '../../components/Layout/Layout'
import { useUser } from '../../hooks/useUser';
import { useNavigate } from "react-router-dom";

const HrEmployeeCreate = () => {
    const { user } = useUser();
    const urlParams = new URLSearchParams(window.location.search);
    const teamValue = urlParams.get("team");
    const typeValue = urlParams.get("user_type");
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate()
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [fnameError, setFnameError] = useState('');
    const [contactError, setContactError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [lnameError, setLnameError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [bdayError, setBdayError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [companyError, setCompanyError] = useState('');
    const [newEmployee, setNewEmployee] = useState({
        fname: '',
        mname: '',
        lname: '',
        bdate: '',
        address: '',
        contact_number: '',
        email: '',
        username: '',
        password: '',
        confirmPass: '',
        team: '',
        user_type: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({
            ...newEmployee,
            [name]: value,
        });

        setPasswordError('');
        setConfirmError('');
        setFnameError('');
        setContactError('');
        setEmailError('');
        setLnameError('');
        setUsernameError('');
        setBdayError('');
        setAddressError('');
        setCompanyError('');

    };

    const handleNewEmployee = (e) => {
        e.preventDefault();

        let isError = false;

        if (!newEmployee.password) {
            setPasswordError('Please enter password.');
            isError = true;
        } else {
            if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(newEmployee.password)) {
                setPasswordError('Password must contain at least one letter, one number, and one special character.');
                isError = true;
            }
        }

        if (!newEmployee.confirmPass) {
            setConfirmError('Please enter confirm password.');
            isError = true;
        } else {
            if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(newEmployee.confirmPass)) {
                setConfirmError('Password must contain at least one letter, one number, and one special character.');
                isError = true;
            }
        }

        if (!newEmployee.fname) {
            setFnameError('Please enter first name.');
            isError = true;
        }

        if (!newEmployee.contact_number) {
            setContactError('Please enter contact number.');
            isError = true;
        }

        if (!newEmployee.email) {
            setEmailError('Please enter email.');
            isError = true;
        }

        if (!newEmployee.lname) {
            setLnameError('Please enter last name.');
            isError = true;
        }

        if (!newEmployee.username) {
            setUsernameError('Please enter username.');
            isError = true;
        }

        if (!newEmployee.bdate) {
            setBdayError('Please enter birthdate.');
            isError = true;
        }

        if (!newEmployee.address) {
            setAddressError('Please enter address.');
            isError = true;
        }

        if (!newEmployee.team && user.user_type === 'Super Admin' && typeValue !== 'Member') {
            setCompanyError('Please enter company.');
            isError = true;
        }

        if (isError) {
            return;
        }

        const formData = new FormData();

        // Append form data
        formData.append('fname', newEmployee.fname);
        formData.append('mname', newEmployee.mname);
        formData.append('lname', newEmployee.lname);
        formData.append('bdate', newEmployee.bdate);
        formData.append('address', newEmployee.address);
        formData.append('contact_number', newEmployee.contact_number);
        formData.append('email', newEmployee.email);
        formData.append('username', newEmployee.username);
        formData.append('password', newEmployee.password);
        formData.append('confirm', newEmployee.confirmPass);
        formData.append('team', newEmployee.team || teamValue || user.team);
        formData.append('user_type', typeValue || user.user_type);

        if (newEmployee.password === newEmployee.confirmPass && newEmployee.password.length >= 6) {

            new Swal({
                customClass: {
                    container: "my-swal",
                },
                title: "Are you sure?",
                text: "You want to create new employee?",
                icon: "warning",
                dangerMode: true,
                showCancelButton: true,
            }).then(res => {
                if (res.isConfirmed) {
                    axiosInstance.post('/create_employee', formData, { headers }).then((response) => {
                        if (response.data.msg === 'Success') {
                            axiosInstance.get(`/sendNewEmployeeMail/${response.data.user_id}`, { headers })
                                .then((response) => {
                                    if (response.data.userData === 'Success') {
                                        Swal.fire({
                                            customClass: {
                                                container: 'my-swal'
                                            },
                                            title: "Success!",
                                            text: "Email has been Sent!",
                                            icon: "success",
                                            timer: 1000,
                                            showConfirmButton: false
                                        }).then(function () {
                                            navigate('/hr/employees')
                                        });
                                    } else {
                                        // alert("Something went wrong")
                                        console.log(response)
                                    }
                                })
                                .catch((error) => {
                                    console.log('error', error.response)
                                })
                        } else {
                            if (response.data.msg) {
                                alert("Something went wrong")
                                console.log(response)
                            } else {
                                alert("Email already existed!")
                                console.log(response)
                            }
                        }
                    })
                        .catch((error) => {
                            console.log(error)
                            location.reload();
                        })

                } else {
                    console.log(error)
                    location.reload();
                }
            });

        } else {
            Swal.fire({
                customClass: {
                    container: "my-swal",
                },
                icon: 'warning',
                title: 'Error',
                text: 'The password and confirm password must match and at least 6 characters long.',
            });
            return;
        }

    };

    return (
        <Layout>
            <div className='block'>
                <div className=" block-content col-lg-12 col-sm-12 ">
                    <>
                        <Grid item sx={{ marginTop: 4 }}>
                            <img className="d-flex justify-content-center" src={HomeLogo} style={{
                                height: 50, width: 200, margin: '0 auto', display: 'block'
                            }} />
                            <Typography variant={'h5'} className='text-center' sx={{ marginBottom: '20px', marginTop: '5px' }}>Add Member</Typography>
                        </Grid>
                        <Stack>
                            <Grid container spacing={4}>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='fname'
                                            name='fname'
                                            label={
                                                <div>
                                                    First Name{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginLeft: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline', marginLeft: 10 }}>{fnameError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='contact_number'
                                            name='contact_number'
                                            label={
                                                <div>
                                                    Contact Number{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginRight: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{contactError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='mname'
                                            name='mname'
                                            label="Middle Name"
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginLeft: 10 }}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='email'
                                            name='email'
                                            label={
                                                <div>
                                                    Email{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginRight: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{emailError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='lname'
                                            name='lname'
                                            label={
                                                <div>
                                                    Last Name{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginLeft: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline', marginLeft: 10 }}>{lnameError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='username'
                                            name='username'
                                            label={
                                                <div>
                                                    Username{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginRight: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{usernameError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='bdate'
                                            name='bdate'
                                            label={
                                                <div>
                                                    Birthdate{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            sx={{ marginTop: 2, marginLeft: 10 }}
                                            type='date'
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline', marginLeft: 10 }}>{bdayError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='password'
                                            name='password'
                                            label={
                                                <div>
                                                    Password{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginRight: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{passwordError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='address'
                                            name='address'
                                            label={
                                                <div>
                                                    Address{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginLeft: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline', marginLeft: 10 }}>{addressError}</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            id='confirmPass'
                                            name='confirmPass'
                                            label={
                                                <div>
                                                    Confirm Password{' '}
                                                    <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                </div>
                                            }
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            sx={{ marginTop: 2, marginRight: 10 }}
                                        />
                                    </div>
                                    <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{confirmError}</FormHelperText>
                                </Grid>
                            </Grid>
                            {user.user_type === 'Super Admin' && typeValue !== 'Member' ? <>
                                <Grid container spacing={4} sx={{ marginBottom: 2 }}>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <TextField
                                                id='team'
                                                name='team'
                                                label={
                                                    <div>
                                                        Company Name{' '}
                                                        <Typography sx={{ color: '#FF0000', display: 'inline' }}>(required)</Typography>
                                                    </div>
                                                }
                                                variant="outlined"
                                                fullWidth
                                                onChange={handleChange}
                                                sx={{ marginTop: 2, marginLeft: 10 }}
                                            />
                                        </div>
                                        <FormHelperText sx={{ color: '#FF0000', display: 'inline', marginLeft: 10 }}>{companyError}</FormHelperText>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 9.25, paddingLeft: 10, paddingRight: 10 }}>
                                        <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleNewEmployee}>
                                            <i className="fa fa-plus" style={{ marginRight: '8px' }} /> Create
                                        </Button>
                                    </Grid>
                                </Grid>
                            </> : <>
                                <Grid container spacing={4} sx={{ marginBottom: 2, paddingLeft: 10, paddingRight: 10 }}>
                                    <Grid item xs={12} sm={4} sx={{ marginTop: 4 }}></Grid>
                                    <Grid item xs={12} sm={4} sx={{ marginTop: 4 }}>
                                        <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleNewEmployee}>
                                            <i className="fa fa-plus" style={{ marginRight: '8px' }} /> Create
                                        </Button>
                                    </Grid>
                                </Grid>
                            </>}
                        </Stack>
                    </>
                </div>
            </div>
        </Layout >
    )
}

export default HrEmployeeCreate

