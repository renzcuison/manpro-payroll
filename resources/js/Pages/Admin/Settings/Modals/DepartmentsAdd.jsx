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

const DepartmentsAdd = ({ open, close, client }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    
    const [name, setName] = useState('');
    const [acronym, setAcronym] = useState('');
    const [description, setDescription] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        console.log("checkInput");

        if (!name) {
            setNameError(true);
        } else {
            setNameError(false);
        }

        if (!acronym) {
            setAcronymError(true);
        } else {
            setAcronymError(false);
        }

        if (!name || !acronym) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            saveInput(event);
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = { name: name, acronym: acronym, description: description };

        axiosInstance.post('/settings/saveDepartment', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Department saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        // navigate(`/hr/performance-evaluation-review/${response.data.formId}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Department </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
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
                            
                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={acronym}
                                    error={acronymError}
                                    onChange={(e) => setAcronym(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Department </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default DepartmentsAdd;
