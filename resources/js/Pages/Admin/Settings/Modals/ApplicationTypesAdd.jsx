import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

const ApplicationTypesAdd = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [name, setName] = useState('');
    const [tenureship, setTenureship] = useState('');
    const [requireFiles, setRequireFiles] = useState(false);

    const [nameError, setNameError] = useState(false);
    const [tenureshipError, setTenureshipError] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!name);
        setTenureshipError(!tenureship);

        if (!name || !tenureship) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All Required fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This Application Type will be added",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Add",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
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
            name: name,
            tenureship_required: tenureship,
            require_files: requireFiles
        };

        console.log(data);

        axiosInstance.post('/settings/saveApplicationType', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Application Type saved successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Application Type </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                mt: 1,
                                marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                mt: 1,
                                marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="tenureship"
                                    label="Tenureship Requirement (months)"
                                    variant="outlined"
                                    value={tenureship}
                                    error={tenureshipError}
                                    type="number"
                                    inputProps={{
                                        min: 0,
                                        step: 1
                                    }}
                                    onChange={(e) => setTenureship(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 2, width: '100%',
                                '& .MuiOutlinedInput-root': { borderColor: requireFiles ? "#42a5f5" : "" }
                            }}>
                                <Box display="flex" sx={{ width: "100%", justifySelf: "center", justifyContent: "center", alignItems: "center" }}>
                                    <Typography align='right' sx={{ color: "text.secondary" }}>
                                        Require Files when Applying?
                                    </Typography>
                                    <Checkbox
                                        checked={requireFiles}
                                        onChange={(e) => setRequireFiles(e.target.checked)}
                                        sx={{ ml: 1, '&.Mui-checked': { color: '#42a5f5', }, }}
                                    />
                                </Box>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Application Type </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default ApplicationTypesAdd;
