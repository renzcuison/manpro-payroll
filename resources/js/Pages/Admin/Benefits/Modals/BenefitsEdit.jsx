import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

import Swal from 'sweetalert2';

import 'react-quill/dist/quill.snow.css';
import { useBenefits } from '../../../../hooks/useBenefits';

const BenefitsEdit = ({ benefit, open, close }) => {
    const {updateBenefits} = useBenefits();
    const [benefitNameError, setBenefitNameError] = useState(false);
    const [employeeAmountShareError, setEmployeeAmountShareError] = useState(false);
    const [employerAmountShareError, setEmployerAmountShareError] = useState(false);
    const [employeePercentageShareError, setEmployeePercentageShareError] = useState(false);
    const [employerPercentageShareError, setEmployerPercentageShareError] = useState(false);

    const [benefitName, setBenefitName] = useState(benefit?.name);
    const [benefitType, setBenefitType] = useState(benefit?.type);
    const [employeeAmountShare, setEmployeeAmountShare] = useState(benefit?.employee_amount);
    const [employerAmountShare, setEmployerAmountShare] = useState(benefit?.employer_amount);
    const [employeePercentageShare, setEmployeePercentageShare] = useState(benefit?.employee_percentage);
    const [employerPercentageShare, setEmployerPercentageShare] = useState(benefit?.employer_percentage);

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
                text: "You want to save this Benefits Type?",
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
                text: "You want to save this Benefits Type?",
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
            benefit_id: benefit.id,
            benefitName: benefitName,
            benefitType: benefitType,
            employeeAmount: employeeAmount,
            employerAmount: employerAmount,
            employeePercentage: employeePercentage,
            employerPercentage: employerPercentage,
        };
        updateBenefits.mutate({data: data, onSuccessCallback: () => close(true)})
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

                        <FormGroup row={true} className="d-flex justify-content-between">
                            <FormControl sx={{ marginBottom: 3, width: '69%',
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

                            <FormControl sx={{ marginBottom: 3, width: '29%',
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
                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{ marginBottom: 3, width: '49%' }}>
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

                                    <FormControl sx={{ marginBottom: 3, width: '49%'}}>
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
                                <FormGroup row={true} className="d-flex justify-content-between" >
                                    <FormControl sx={{ marginBottom: 3, width: '49%' }}>
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

                                    <FormControl sx={{ marginBottom: 3, width: '49%' }}>
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

export default BenefitsEdit;