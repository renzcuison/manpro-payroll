import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'react-quill/dist/quill.snow.css';
import { useUpdateAllowance } from '../../../../hooks/useAllowances';

const AllowanceEdit = ({allowance, open, close }) => {
    const updateAllowance = useUpdateAllowance();

    const [allowanceNameError, setAllowanceNameError] = useState(false);
    const [allowanceAmountError, setAllowanceAmountError] = useState(false);
    const [allowancePercentageError, setAllowancePercentageError] = useState(false);
    const [paymentScheduleError, setPaymentScheduleError] = useState(false);

    const [allowanceName, setAllowanceName] = useState(allowance?.name);
    const [allowanceType, setAllowanceType] = useState(allowance?.type);
    const [allowanceAmount, setAllowanceAmount] = useState(allowance?.amount);
    const [allowancePercentage, setAllowancePercentage] = useState(allowance?.percentage);
    const [paymentSchedule, setPaymentSchedule] = useState(allowance?.payment_schedule || 1);


    const checkInput = (event) => {
        event.preventDefault();

        if (!allowanceName) {
            setAllowanceNameError(true);
        } else {
            setAllowanceNameError(false);
        }

        if ( allowanceType == "Amount" ) {
            checkInputAmount(event);
        }

        if ( allowanceType == "Percentage" ) {
            checkInputPercentage(event);
        }
    };
    const checkInputAmount = () => {

        if (!allowanceAmount) {
            setAllowanceAmountError(true);
        } else {
            setAllowanceAmountError(false);
        }

        if ( allowanceNameError == true || allowanceAmountError == true ) {
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
                text: "You want to Update this Allowance Type?",
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

        if (!allowancePercentage) {
            setAllowancePercentageError(true);
        } else {
            setAllowancePercentageError(false);
        }

        if ( allowanceNameError == true || allowancePercentageError == true ) {
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
                text: "You want to Update this Allowance Type?",
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

    const saveInput  = (event) => {
        event.preventDefault();
        const amount = parseFloat(allowanceAmount.replace(/,/g, "")) || 0;
        const percentage = parseFloat(allowancePercentage.replace(/,/g, "")) || 0;

        const data = {
            allowance_id: allowance.id,
            name: allowanceName,
            type: allowanceType,
            amount: amount,
            percentage: percentage,
            payment_schedule: paymentSchedule,
        };
        updateAllowance.mutate({data: data, onSuccessCallback: () => close(true)});
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
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Edit Allowance </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">

                        <FormGroup row={true} className="d-flex justify-content-between">
                            <FormControl sx={{ marginBottom: 3, width: '69%',
                            }}>
                                <TextField
                                    required
                                    id="allowanceName"
                                    label="Allowance Name"
                                    variant="outlined"
                                    value={allowanceName}
                                    error={allowanceNameError}
                                    onChange={(e) => setAllowanceName(e.target.value)}
                                />  
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '29%',
                            }}>
                                <TextField
                                    required
                                    select
                                    id="allowanceType"
                                    label="Type"
                                    value={allowanceType}
                                    onChange={(event) => setAllowanceType(event.target.value)}
                                >
                                    <MenuItem key="Amount" value="Amount"> Amount </MenuItem>
                                    <MenuItem key="Percentage" value="Percentage"> Percentage </MenuItem>
                                    {/* <MenuItem key="Bracket" value="Bracket"> Bracket </MenuItem> */}
                                </TextField>
                            </FormControl>
                        </FormGroup>
                        
                        <FormGroup row={true} className="d-flex justify-content-between" >
                            {allowanceType && (
                                <FormControl sx={{ marginBottom: 3, width: '69%', }}>
                                    <TextField
                                        required
                                        select
                                        id="paymentSchedule"
                                        label="Payment Schedule"
                                        value={paymentSchedule}
                                        error={paymentScheduleError}
                                        onChange={(event) => setPaymentSchedule(event.target.value)}
                                    >
                                        <MenuItem key={1} value={1}> One Time - First Cutoff</MenuItem>
                                        <MenuItem key={2} value={2}> One Time - Second Cutoff</MenuItem>
                                        <MenuItem key={3} value={3}> Split - First & Second Cutoff</MenuItem>
                                    </TextField>
                                </FormControl>
                            )}
                            {allowanceType === "Amount" && (
                                <FormControl sx={{ marginBottom: 3, width: '29%' }}>
                                    <InputLabel>Amount</InputLabel>
                                    <OutlinedInput
                                        required
                                        id="allowanceAmount"
                                        label="Amount"
                                        value={allowanceAmount}
                                        error={allowanceAmountError}
                                        startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                        onChange={(e) => handleInputChange(e, setAllowanceAmount)}
                                    />
                                </FormControl>       
                            )}
                            {allowanceType === "Percentage" && (
                                <FormControl sx={{ marginBottom: 3, width: '29%' }}>
                                    <InputLabel>Percentage</InputLabel>
                                    <OutlinedInput
                                        required
                                        id="allowancePercentage"
                                        label="Percentage"
                                        value={allowancePercentage}
                                        error={allowancePercentageError}
                                        startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                        onChange={(e) => handleInputChange(e, setAllowancePercentage)}
                                    />
                                </FormControl>
                            )}
                        </FormGroup>

                        {allowanceType && (
                            <>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Allowance </p>
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

export default AllowanceEdit;