import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent,TextField, Typography, FormGroup, FormControl, InputLabel, MenuItem } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { useManageBenefits } from '../../../../hooks/useBenefits';
import BenefitsBracketField from './BenefitsBracketField';

const BenefitsEdit = ({ benefit, open, close }) => {

    const { 
        
        benefitName, benefitType, employeeAmountShare, employerAmountShare, employeePercentageShare,
        employerPercentageShare, paymentSchedule, benefitNameError, employeeAmountShareError, employerAmountShareError,
        employeePercentageShareError, employerPercentageShareError,bracketsList, bracketListErrors,

        setBenefitName, setBenefitType, setEmployeeAmountShare,
        setEmployerAmountShare, setEmployeePercentageShare, 
        setEmployerPercentageShare, setPaymentSchedule, checkInput, handleInputChange,
        handleAddBracketsField, handleBracketChanges, handleRemoveBracketsField

    } = useManageBenefits({benefit: benefit, onSuccess: () => close(true)});

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Edit Benefit </Typography>
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
                                    <MenuItem key="Bracket Amount" value="Bracket Amount"> Bracket Amount </MenuItem>
                                    <MenuItem key="Bracket Percentage" value="Bracket Percentage"> Bracket Percentage </MenuItem>

                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between">
                            {benefitType && (
                                    <FormControl sx={{ marginBottom: 3, 
                                    width: benefitType !== "Amount" && benefitType !== "Percentage" ? '100%': '50%' }}>
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

                            {benefitType === "Amount" && (
                                <>
                                    <FormControl sx={{ marginBottom: 3, width: '23%' }}>
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

                                    <FormControl sx={{ marginBottom: 3, width: '23%'}}>
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
                                </>
                            )}

                            {benefitType === "Percentage" && (
                                <>
                                    <FormControl sx={{ marginBottom: 3, width: '23%' }}>
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

                                    <FormControl sx={{ marginBottom: 3, width: '23%' }}>
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
                                </>   
                            )}

                            {(benefitType === "Bracket Amount" || benefitType === "Bracket Percentage") && (
                                <BenefitsBracketField type={benefitType} bracketsList={bracketsList} 
                                onAdd={handleAddBracketsField} onChange={handleBracketChanges}
                                onRemove={handleRemoveBracketsField} bracketListErrors={bracketListErrors}/>
                            )} 
                        </FormGroup>

                        {benefitType && (
                            <>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Benefit </p>
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