import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { useManageAllowance } from '../../../../hooks/useAllowances';

const AllowanceAdd = ({ open, close }) => {
    const {allowanceName, paymentSchedule,
        allowanceNameError, setAllowanceName, setPaymentSchedule, checkInput,
    } = useManageAllowance({onSuccess: () => close(true)});

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