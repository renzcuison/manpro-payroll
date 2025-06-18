import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

import 'react-quill/dist/quill.snow.css';
import { useDeductions } from '../../../../hooks/useDeductions';

const DeductionsAdd = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const {saveDeductions} = useDeductions();

    const [deductionsNameError, setDeductionsNameError] = useState(false);
    const [deductionsAmountError, setDeductionsAmountError] = useState(false);
    const [deductionsPercentageError, setDeductionsPercentageError] = useState(false);

    const [deductionsName, setDeductionsName] = useState('');
    const [deductionsType, setDeductionsType] = useState('');
    const [deductionsAmount, setDeductionsAmount] = useState('');
    const [deductionsPercentage, setDeductionsPercentage] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        if (!deductionsName) {
            setDeductionsNameError(true);
        } else {
            setDeductionsNameError(false);
        }

        if ( deductionsType == "Amount" ) {
            checkInputAmount(event);
        }

        if ( deductionsType == "Percentage" ) {
            checkInputPercentage(event);
        }
    };

    const checkInputAmount = () => {

        if (!deductionsAmount) {
            setDeductionsAmountError(true);
        } else {
            setDeductionsAmountError(false);
        }

        if ( deductionsNameError == true || deductionsAmountError == true ) {
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
                text: "You want to save this Deductions Type?",
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
        if (!deductionsPercentage) {
            setDeductionsPercentageError(true);
        } else {
            setDeductionsPercentageError(false);
        }

        if ( deductionsNameError == true || deductionsPercentageError == true ) {
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
                text: "You want to save this Deductions Type?",
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

        const amount = parseFloat(deductionsAmount.replace(/,/g, "")) || 0;
        const percentage = parseFloat(deductionsPercentage.replace(/,/g, "")) || 0;

        const data = {
            name: deductionsName,
            type: deductionsType,
            amount: amount,
            percentage: percentage,
        };
        saveDeductions.mutate({data: data, onSuccessCallback: () => close(true)});
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
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">

                        <FormGroup row={true} className="d-flex justify-content-between">
                            <FormControl sx={{ marginBottom: 3, width: '69%' }}>
                                <TextField
                                    required
                                    id="deductionsName"
                                    label="Deductions Name"
                                    variant="outlined"
                                    value={deductionsName}
                                    error={deductionsNameError}
                                    onChange={(e) => setDeductionsName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '29%'}}>
                                <TextField
                                    required
                                    select
                                    id="deductionsType"
                                    label="Type"
                                    value={deductionsType}
                                    onChange={(event) => setDeductionsType(event.target.value)}
                                >
                                    <MenuItem key="Amount" value="Amount"> Amount </MenuItem>
                                    <MenuItem key="Percentage" value="Percentage"> Percentage </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        {deductionsType === "Amount" && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%'}}>
                                        <InputLabel>Amount</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="deductionsAmount"
                                            label="Amount"
                                            value={deductionsAmount}
                                            error={deductionsAmountError}
                                            startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setDeductionsAmount)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {deductionsType === "Percentage" && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%'}}>
                                        <InputLabel>Percentage</InputLabel>
                                        <OutlinedInput
                                            required
                                            id="deductionsPercentage"
                                            label="Percentage"
                                            value={deductionsPercentage}
                                            error={deductionsPercentageError}
                                            startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                            onChange={(e) => handleInputChange(e, setDeductionsPercentage)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {deductionsType && (
                            <>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Deduction </p>
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

export default DeductionsAdd;