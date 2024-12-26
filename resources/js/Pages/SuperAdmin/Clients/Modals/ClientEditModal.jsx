import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css'; // Import styles

const ClientEditModal = ({ open, close, client }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

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

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> {client.name} </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    required
                                    id="package"
                                    label="Package"
                                    // value={selectedPackage}
                                    // error={selectedPackageError}
                                    // onChange={(event) => setSelectedPackage(event.target.value)}
                                >
                                    <MenuItem key="Basic" value="Basic"> Basic </MenuItem>
                                    <MenuItem key="Standard" value="Standard"> Standard </MenuItem>
                                    <MenuItem key="Professional" value="Professional"> Professional </MenuItem>
                                    <MenuItem key="Enterprise" value="Enterprise"> Enterprise </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    required
                                    id="package"
                                    label="Package"
                                    // value={selectedPackage}
                                    // error={selectedPackageError}
                                    // onChange={(event) => setSelectedPackage(event.target.value)}
                                >
                                    <MenuItem key="Basic" value="Basic"> Basic </MenuItem>
                                    <MenuItem key="Standard" value="Standard"> Standard </MenuItem>
                                    <MenuItem key="Professional" value="Professional"> Professional </MenuItem>
                                    <MenuItem key="Enterprise" value="Enterprise"> Enterprise </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="status"
                                    label="Status"
                                    variant="outlined"
                                    // value={clientName}
                                    // error={clientNameError}
                                    // onChange={(e) => setClientName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker label="Basic date picker" />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Client </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default ClientEditModal;
