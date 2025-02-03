import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

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

const EmployeeAddBenefit = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [benefitError, setBenefitError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const [benefits, setBenefits] = useState([]);
    const [benefit, setBenefit] = useState('');
    const [number, setNumber] = useState('');
    
    useEffect(() => {
        axiosInstance.get(`/benefits/getBenefits`, { headers })
            .then((response) => {
                if ( response.data.status === 200 ) {
                    setBenefits(response.data.benefits);
                }
            }).catch((error) => {
                console.error('Error fetching benefits:', error);
            });
    }, []);

    const checkInput = (event) => {
        event.preventDefault();

        if (!benefit) {
            setBenefitError(true);
        } else {
            setBenefitError(false);
        }

        if (!number) {
            setNumberError(true);
        } else {
            setNumberError(false);
        }

        if ( benefit == '' || number == '' ) {
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
                text: "You want to add this benefit?",
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
            employee: employee.id,
            benefit: benefit,
            number: number
        };
        
        console.log(data);

        axiosInstance.post('/benefits/addEmployeeBenefit', data, { headers })
            .then(response => {
                if (response.data.status === 200) {

                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Benefit added successfully!",
                        icon: "success",
                        timer: 1000,
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
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Benefit </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '29%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    select
                                    id="benefit"
                                    label="Benefit"
                                    value={benefit}
                                    error={benefitError}
                                    onChange={(event) => setBenefit(event.target.value)}
                                >
                                    {benefits.map((benefit) => (
                                        <MenuItem key={benefit.id} value={benefit.id}> {benefit.name} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '69%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="number"
                                    label="Number"
                                    variant="outlined"
                                    value={number}
                                    error={numberError}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                            </FormControl>

                            
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Benefit </p>
                            </Button>
                        </Box>



                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default EmployeeAddBenefit;