import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Avatar, Stack, Tooltip, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import moment from 'moment';
import dayjs from 'dayjs';
import { Edit } from '@mui/icons-material';

const EmploymentDetailsEdit = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [contact, setContact] = useState(employee.contact_number || '');
    const [address, setAddress] = useState(employee.address || '');
    const [profilePic, setProfilePic] = useState(`../../../../../../../storage/${employee.profile_pic}` || "../../../../../images/avatarpic.jpg");
    const [newProfilePic, setNewProfilePic] = useState('');

    // Form Errors
    const [contactError, setContactError] = useState(false);
    const [addressError, setAddressError] = useState(false);
    const [profilePicError, setProfilePicError] = useState(false);

    const handleUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5242880) {
                document.activeElement.blur();
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "File Too Large!",
                    text: `The file size limit is 5 MB.`,
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: "#177604",
                });
            } else {
                // Save
                setNewProfilePic(file);
                // Render
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfilePic(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const checkInput = (event) => {
        event.preventDefault();

        const validateContact = employee.contact_number ? employee.contact_number : '';
        const validateAddress = employee.address ? employee.address : '';

        if (validateContact == contact && validateAddress == address && !newProfilePic) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Invalid Action!",
                text: `There is nothing to update.`,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to update this employee?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    }

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('id', employee.id);
        formData.append('contact_number', contact);
        formData.append('address', address);
        formData.append('profile_pic', newProfilePic ?? null);

        axiosInstance.post('/employee/editEmployeeProfile', formData, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Employee Profile updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then((res) => {
                        close(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Employee </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        {/* Profile Picture */}
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '39%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <Box display="flex" sx={{ width: "100%", justifyContent: "center" }}>
                                    <Box sx={{ position: "relative", mr: "10%" }}>
                                        <Avatar src={profilePic} sx={{ height: "160px", width: "160px", boxShadow: 3 }} />
                                        <Box sx={{ backgroundColor: "#ffffff", border: "2px solid #e0e0e0", borderRadius: "50%", position: "absolute", right: "0px", bottom: "0px" }}>
                                            <Tooltip title="Upload Profile Picture (5 MB Limit)">
                                                <IconButton size="small" component="label">
                                                    <Edit />
                                                    <input type="file" hidden onChange={handleUpload} accept=".png, .jpg, .jpeg"></input>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            </FormControl>
                            <Box sx={{ width: "59%" }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        Name
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        Birth Date
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {employee.birth_date ? dayjs(employee.birth_date).format('MMM DD YYYY') : 'Not Indicated'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        Gender
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {employee.gender || 'Not Indicated'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        Email
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {employee.email}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </FormGroup>
                        <Divider sx={{ mb: 3 }} />
                        {/* Editable Fields */}
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '39%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="contact"
                                    label="Phone Number"
                                    variant="outlined"
                                    type="number"
                                    value={contact}
                                    error={contactError}
                                    onChange={(e) => setContact(e.target.value)}
                                />
                            </FormControl>
                            <FormControl sx={{
                                marginBottom: 3, width: '59%', '& label.Mui-focused': { color: '#97a5ba' },
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
