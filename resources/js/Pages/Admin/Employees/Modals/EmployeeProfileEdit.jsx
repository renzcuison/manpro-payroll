import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Avatar, Stack } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import moment from 'moment';
import dayjs from 'dayjs';

const EmploymentDetailsEdit = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [email, setEmail] = useState(employee.email || '');
    const [contact, setContact] = useState(employee.contact_number || '');
    const [address, setAddress] = useState(employee.address || '');
    const [profilePic, setProfilePic] = useState(employee.profilePic || "../../../../../images/avatarpic.jpg");

    // Form Errors
    const [emailError, setEmailError] = useState(false);
    const [contactError, setContactError] = useState(false);
    const [addressError, setAddressError] = useState(false);
    const [profilePicError, setProfilePicError] = useState(false);


    // useEffect(() => {
    //     console.log("hello")
    // }, []);

    const handleUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setProfilePic('../../../../../images/avatarpic.jpg');
    };

    const checkInput = (event) => {
        event.preventDefault();
    }

    // const saveInput = (event) => {
    //     event.preventDefault();

    //     const data = {
    //         id: employee.id,
    //         selectedRole: selectedRole,
    //         selectedBranch: selectedBranch,
    //         selectedJobTitle: selectedJobTitle,
    //         selectedDepartment: selectedDepartment,
    //         selectedWorkGroup: selectedWorkGroup,
    //         selectedType: selectedType,
    //         selectedStatus: selectedStatus,
    //         startDate: startDate,
    //         endDate: endDate,
    //     };

    //     axiosInstance.post('/employee/editEmmployeeDetails', data, { headers })
    //         .then(response => {
    //             if (response.data.status === 200) {
    //                 Swal.fire({
    //                     customClass: { container: 'my-swal' },
    //                     text: "Employment Details updated successfully!",
    //                     icon: "success",
    //                     timer: 1000,
    //                     showConfirmButton: true,
    //                     confirmButtonText: 'Proceed',
    //                     confirmButtonColor: '#177604',
    //                 }).then(() => {
    //                     if (onUpdateEmployee) {
    //                         onUpdateEmployee();
    //                     }
    //                 });
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //         });
    // };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Employee </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <Box display="flex" sx={{ justifyContent: "space-between" }}>
                            {/* Profile Picture */}
                            <FormGroup className="d-flex justify-content-between" sx={{
                                width: "39%",
                                '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5f5' } },
                            }}>
                                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                                    <Box sx={{ width: "39%" }}>
                                        <Avatar src={profilePic} sx={{ height: "128px", width: "128px" }} />
                                    </Box>
                                    <Box sx={{ width: "59%", display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                        <Stack spacing={1}>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "64%", backgroundColor: '#42a5f5', color: 'white' }}
                                                className="m-1"
                                                component="label"
                                            >
                                                <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Upload </p>
                                                <input type="file" hidden onChange={handleUpload} accept="image/*" />
                                            </Button>
                                            <Button
                                                variant="contained"
                                                sx={{ width: "64%", backgroundColor: '#f44336', color: 'white' }}
                                                className="m-1"
                                                onClick={handleRemove}
                                            >
                                                <p className='m-0'><i className="fa fa-trash mr-2 mt-1"></i> Remove </p>
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </FormGroup>

                            {/* Contact Information */}
                            <FormGroup className="d-flex justify-content-between" sx={{
                                width: "59%",
                                '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <FormControl sx={{
                                    marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <TextField
                                        required
                                        id="email"
                                        label="Email Address"
                                        variant="outlined"
                                        type="email"
                                        value={email}
                                        error={emailError}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl sx={{
                                    marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <TextField
                                        required
                                        id="contact"
                                        label="Phone Number"
                                        variant="outlined"
                                        type="number"
                                        value={contact}
                                        error={contactError}
                                        onChange={(e) => setContact(e.target.value)}
                                    />
                                </FormControl>
                            </FormGroup>
                        </Box>

                        {/* Address */}
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    value={address}
                                    error={addressError}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Changes </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default EmploymentDetailsEdit;
