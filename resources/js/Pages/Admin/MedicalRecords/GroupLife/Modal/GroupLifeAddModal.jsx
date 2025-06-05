import {    Box, 
            Button, 
            Dialog, 
            DialogTitle, 
            DialogContent, 
            FormControl, 
            TextField, 
            Typography,  
            IconButton, 
            FormGroup,  
            InputLabel, 
            MenuItem, 
            OutlinedInput,
            InputAdornment  
        } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';

const GroupLifeAddModal = ({ open, close }) => {

    const navigate = useNavigate();

    const [groupLifeNameError, setGroupLifeNameError] = useState(false);
    const [employeeAmountShareError, setEmployeeAmountShareError] = useState(false);
    const [employerAmountShareError, setEmployerAmountShareError] = useState(false);
    const [employeePercentageShareError, setEmployeePercentageShareError] = useState(false);
    const [employerPercentageShareError, setEmployerPercentageShareError] = useState(false);

    const [groupLifeName, setGroupLifeName] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [employeeAmountShare, setEmployeeAmountShare] = useState('');
    const [employerAmountShare, setEmployerAmountShare] = useState('');
    const [employeePercentageShare, setEmployeePercentageShare] = useState('');
    const [employerPercentageShare, setEmployerPercentageShare] = useState('');

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
                                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Group Life</Typography>
                                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                                    </Box>
                                </DialogTitle>

                        <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                            <Box component="form" sx={{ mt: 3, my: 6 }} 
                            // onSubmit={checkInput}
                            noValidate autoComplete="off" encType="multipart/form-data">

                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                <FormControl sx={{ marginBottom: 3, width: '69%', '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                }}>
                                <TextField
                                    required
                                    id="groupLifeName"
                                    label="Group Life Name"
                                    variant="outlined"
                                    value={groupLifeName}
                                    error={groupLifeNameError}
                                    onChange={(e) => setGroupLifeName(e.target.value)}
                                />
                                </FormControl>                            
                                <FormControl sx={{ marginBottom: 3, width: '29%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                    }}>
                                    <TextField
                                        required
                                        select
                                        id="paymentType"
                                        label="Payment Type"
                                        value={paymentType}
                                        onChange={(event) => setPaymentType(event.target.value)}
                                    >
                                        <MenuItem key="Amount" value="Amount"> Amount </MenuItem>
                                        <MenuItem key="Percentage" value="Percentage"> Percentage </MenuItem>
                                    </TextField>
                                    </FormControl>
                                    </FormGroup>
                                        {paymentType === "Amount" && (
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

                                        {paymentType === "Percentage" && (
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
                                

                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                    <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Group Life </p>
                                </Button>
                                </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}


export default GroupLifeAddModal;
