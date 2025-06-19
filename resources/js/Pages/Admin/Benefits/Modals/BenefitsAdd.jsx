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

const BenefitsAdd = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [benefitNameError, setBenefitNameError] = useState(false);
    const [employeeAmountShareError, setEmployeeAmountShareError] = useState(false);
    const [employerAmountShareError, setEmployerAmountShareError] = useState(false);
    const [employeePercentageShareError, setEmployeePercentageShareError] = useState(false);
    const [employerPercentageShareError, setEmployerPercentageShareError] = useState(false);

    const [benefitName, setBenefitName] = useState('');
    const [benefitType, setBenefitType] = useState('');
    const [employeeAmountShare, setEmployeeAmountShare] = useState('');
    const [employerAmountShare, setEmployerAmountShare] = useState('');
    const [employeePercentageShare, setEmployeePercentageShare] = useState('');
    const [employerPercentageShare, setEmployerPercentageShare] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        if ( benefitType == "Amount" ) {
            checkInputAmount(event);
        }

        if ( benefitType == "Percentage" ) {
            checkInputPercentage(event);
        }
    };

    const checkInputAmount = () => {
        
        if (!benefitName) {
            setBenefitNameError(true);
        } else {
            setBenefitNameError(false);
        }

        if (!employeeAmountShare) {
            setEmployeeAmountShareError(true);
        } else {
            setEmployeeAmountShareError(false);
        }

        if (!employerAmountShare) {
            setEmployerAmountShareError(true);
        } else {
            setEmployerAmountShareError(false);
        }

        if ( benefitName == '' || employeeAmountShare == '' || employerAmountShare == '' ) {
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
    }

    const checkInputPercentage = () => {

        if (!benefitName) {
            setBenefitNameError(true);
        } else {
            setBenefitNameError(false);
        }

        if (!employeePercentageShare) {
            setEmployeePercentageShareError(true);
        } else {
            setEmployeePercentageShareError(false);
        }

        if (!employerPercentageShare) {
            setEmployerPercentageShareError(true);
        } else {
            setEmployerPercentageShareError(false);
        }

        if ( benefitName == '' || employeePercentageShare == '' || employerPercentageShare == '' ) {
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
    }

    const saveInput = (event) => {
        event.preventDefault();

        const employeeAmount = parseFloat(employeeAmountShare.replace(/,/g, "")) || 0;
        const employerAmount = parseFloat(employerAmountShare.replace(/,/g, "")) || 0;
        const employeePercentage = parseFloat(employeePercentageShare.replace(/,/g, "")) || 0;
        const employerPercentage = parseFloat(employerPercentageShare.replace(/,/g, "")) || 0;

        const data = {
            benefitName: benefitName,
            benefitType: benefitType,
            employeeAmount: employeeAmount,
            employerAmount: employerAmount,
            employeePercentage: employeePercentage,
            employerPercentage: employerPercentage,
        };

        axiosInstance.post('compensation/saveBenefits', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Benefit saved successfully!",
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

    const formatCurrency = (value) => {
        if (!value) return "";

        let sanitizedValue = value.replace(/[^0-9.]/g, "");

        const parts = sanitizedValue.split(".");
        if (parts.length > 2) {
            sanitizedValue = parts[0] + "." + parts.slice(1).join("");
        }

        let [integerPart, decimalPart] = sanitizedValue.split(".");
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (decimalPart !== undefined) {
            decimalPart = decimalPart.slice(0, 2);
            return decimalPart.length > 0 ? `${integerPart}.${decimalPart}` : integerPart + ".";
        }

        return integerPart;
    };

    const handleInputChange = (e, setValue) => {
        const formattedValue = formatCurrency(e.target.value);
        setValue(formattedValue);
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
                            <FormControl sx={{ marginBottom: 3, width: '69%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="benefitName"
                                    label="Benefit Name"
                                    variant="outlined"
                                    value={benefitName}
                                    error={benefitNameError}
                                    onChange={(e) => setBenefitName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '29%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    select
                                    id="benefitType"
                                    label="Type"
                                    value={benefitType}
                                    onChange={(event) => setBenefitType(event.target.value)}
                                >
                                    <MenuItem key="Amount" value="Amount"> Amount </MenuItem>
                                    <MenuItem key="Percentage" value="Percentage"> Percentage </MenuItem>
                                    {/* <MenuItem key="Bracket" value="Bracket"> Bracket </MenuItem> */}
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        {benefitType === "Amount" && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <InputLabel htmlFor="employeeAmountShare">Employee Share</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="employeeAmountShare"
                                            label="Employee Share"
                                            value={employeeAmountShare}
                                            error={employeeAmountShareError}
                                            startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setEmployeeAmountShare)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{
                                        marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <InputLabel htmlFor="employerAmountShare">Employer Share</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="employerAmountShare"
                                            label="Employer Share"
                                            value={employerAmountShare}
                                            error={employerAmountShareError}
                                            startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setEmployerAmountShare)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {benefitType === "Percentage" && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <InputLabel htmlFor="employeePercentageShare">Employee Share</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="employeePercentageShare"
                                            label="Employee Share"
                                            value={employeePercentageShare}
                                            error={employeePercentageShareError}
                                            startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setEmployeePercentageShare)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{
                                        marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <InputLabel htmlFor="employerPercentageShare">Employer Share</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="employerPercentageShare"
                                            label="Employer Share"
                                            value={employerPercentageShare}
                                            error={employerPercentageShareError}
                                            startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setEmployerPercentageShare)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {benefitType && (
                            <>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Benefit </p>
                                    </Button>
                                </Box>
                            </>
                        )}

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default BenefitsAdd;