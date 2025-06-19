import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

const IncentivesAdd = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [incentivesNameError, setIncentivesNameError] = useState(false);
    const [incentivesAmountError, setIncentivesAmountError] = useState(false);
    const [incentivesPercentageError, setIncentivesPercentageError] = useState(false);

    const [incentivesName, setIncentivesName] = useState('');
    const [incentivesType, setIncentivesType] = useState('');
    const [incentivesAmount, setIncentivesAmount] = useState('');
    const [incentivesPercentage, setIncentivesPercentage] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        if (!incentivesName) {
            setIncentivesNameError(true);
        } else {
            setIncentivesNameError(false);
        }

        if ( incentivesType == "Amount" ) {
            checkInputAmount(event);
        }

        if ( incentivesType == "Percentage" ) {
            checkInputPercentage(event);
        }
    };

    const checkInputAmount = () => {

        if (!incentivesAmount) {
            setIncentivesAmountError(true);
        } else {
            setIncentivesAmountError(false);
        }

        if ( incentivesNameError == true || incentivesAmountError == true ) {
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
                text: "You want to save this Incentives Type?",
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
        if (!incentivesPercentage) {
            setIncentivesPercentageError(true);
        } else {
            setIncentivesPercentageError(false);
        }

        if ( incentivesNameError == true || incentivesPercentageError == true ) {
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
                text: "You want to save this Incentives Type?",
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

        const amount = parseFloat(incentivesAmount.replace(/,/g, "")) || 0;
        const percentage = parseFloat(incentivesPercentage.replace(/,/g, "")) || 0;

        const data = {
            name: incentivesName,
            type: incentivesType,
            amount: amount,
            percentage: percentage,
        };

        axiosInstance.post('/compensation/saveIncentives', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Role saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close(true);
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
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Incentives </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
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
                                    id="incentivesName"
                                    label="Incentives Name"
                                    variant="outlined"
                                    value={incentivesName}
                                    error={incentivesNameError}
                                    onChange={(e) => setIncentivesName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '29%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    select
                                    id="incentivesType"
                                    label="Type"
                                    value={incentivesType}
                                    onChange={(event) => setIncentivesType(event.target.value)}
                                >
                                    <MenuItem key="Amount" value="Amount"> Amount </MenuItem>
                                    <MenuItem key="Percentage" value="Percentage"> Percentage </MenuItem>
                                    {/* <MenuItem key="Bracket" value="Bracket"> Bracket </MenuItem> */}
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        {incentivesType === "Amount" && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <InputLabel>Amount</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="incentivesAmount"
                                            label="Amount"
                                            value={incentivesAmount}
                                            error={incentivesAmountError}
                                            startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setIncentivesAmount)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {incentivesType === "Percentage" && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <InputLabel>Percentage</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="incentivesPercentage"
                                            label="Percentage"
                                            value={incentivesPercentage}
                                            error={incentivesPercentageError}
                                            startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setIncentivesPercentage)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {incentivesType && (
                            <>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save incentives </p>
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

export default IncentivesAdd;