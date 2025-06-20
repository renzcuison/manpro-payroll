import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'react-quill/dist/quill.snow.css';
import { useSaveAllowance } from '../../../../hooks/useAllowances';

const AllowanceAdd = ({ open, close }) => {
    const saveAllowance = useSaveAllowance();
    const [allowanceNameError, setAllowanceNameError] = useState(false);
    const [paymentScheduleError, setPaymentScheduleError] = useState(false);

    const [allowanceName, setAllowanceName] = useState('');
    const [paymentSchedule, setPaymentSchedule] = useState(1);

    const checkInput = (event) => {
        event.preventDefault();

        if (!allowanceName) {
            setAllowanceNameError(true);
        } else {
            setAllowanceNameError(false);
        }

        if (!paymentSchedule) {
            setPaymentScheduleError(true);
        } else {
            setPaymentScheduleError(false);
        }

        if ( allowanceNameError == true || paymentScheduleError == true ) {
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
                text: "You want to save this Allowance Type?",
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

        const data = { name: allowanceName, payment_schedule: paymentSchedule };
        saveAllowance.mutate({data: data, onSuccessCallback: () => close(true)});
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Allowance </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">

                        <FormGroup row={true} className="d-flex justify-content-between">
                            <FormControl sx={{ marginBottom: 3, width: '64%'}}>
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

                            <FormControl sx={{ marginBottom: 3, width: '34%'}}>
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
                        </FormGroup>  

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Allowance </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default AllowanceAdd;