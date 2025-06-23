import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText,  } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { useManageIncentives } from '../../../../hooks/useIncentives';

const IncentivesAdd = ({ open, close }) => {
    const {
        //values
        incentivesName, incentivesType, incentivesAmount, incentivesPercentage, paymentSchedule,
        //errors
        incentivesNameError, incentivesAmountError, incentivesPercentageError,
        //function
        setIncentivesName, setIncentivesType, setIncentivesAmount, setIncentivesPercentage,
        setPaymentSchedule, handleInputChange, checkInput,

    } = useManageIncentives({onSuccess: () => close(true)});

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

                        <FormGroup row={true} className="d-flex justify-content-between">
                            <FormControl sx={{ marginBottom: 3, width: '69%', }}>
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

                            <FormControl sx={{ marginBottom: 3, width: '29%' }}>
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

                        <FormGroup row={true} className="d-flex justify-content-between">
                            {incentivesType && (
                                <FormControl sx={{ marginBottom: 3, width: '69%', }}>
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
                            )}

                            {incentivesType === "Amount" && (
                                <FormControl sx={{
                                    marginBottom: 3, width: '29%',
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
                            )}

                            {incentivesType === "Percentage" && (
                                <FormControl sx={{ marginBottom: 3, width: '29%', }}>
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
                            )}
                        </FormGroup>

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