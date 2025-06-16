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
            InputAdornment,
            Autocomplete,
            Select  
        } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import axiosInstance, { getJWTHeader } from '../../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

const GroupLifeAddModal = ({ open, close, onAddRow, refreshPlans }) => {

    const navigate = useNavigate();

    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const [groupLifeNameError, setGroupLifeNameError] = useState(false);
    const [employeeAmountShareError, setEmployeeAmountShareError] = useState(false);
    const [employerAmountShareError, setEmployerAmountShareError] = useState(false);
    const [employeePercentageShareError, setEmployeePercentageShareError] = useState(false);
    const [employerPercentageShareError, setEmployerPercentageShareError] = useState(false);

    const [groupLifeName, setGroupLifeName] = useState('');
    const [planType, setPlanType] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [employeeAmountShare, setEmployeeAmountShare] = useState('');
    const [employerAmountShare, setEmployerAmountShare] = useState('');
    const [employeePercentageShare, setEmployeePercentageShare] = useState('');
    const [employerPercentageShare, setEmployerPercentageShare] = useState('');

    const [companies, setCompanies] = useState([]);

    const [groupLifeCompanyId, setGroupLifeCompanyId] = useState("");
    

    useEffect(() => {
        if (!open || !user) return;
        fetchCompanies();
    }, [open]);

    const fetchCompanies = async () => {
        try {
            const res = await axiosInstance.get('/medicalRecords/getGroupLifeCompanies', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            const companyList = res.data.companies || [];
            setCompanies(companyList);
            if (companyList.length > 0) {
                setGroupLifeCompanyId(companyList[0].id);
                
            }
                } catch (error) {
                    console.error("Error fetching companies:", error);
                    setCompanies([]);
                }
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

    const listOfPlanTypes = [
        { planTypeMenuItem: 'Prepaid Funeral Plan'},
        { planTypeMenuItem: 'Final Expense Insurance'}
    ];

    const handleSave = async () => {
        const cleanNumber = (value) =>
            Number(value.replace(/[^\d.]/g, "")) || 0;

        const payload = {
            group_life_company_id: groupLifeCompanyId,
            plan_name: planType,
            type: paymentType,
            employee_share: paymentType === "Amount"
                ? cleanNumber(employeeAmountShare)
                : cleanNumber(employeePercentageShare),
            employer_share: paymentType === "Amount"
                ? cleanNumber(employerAmountShare)
                : cleanNumber(employerPercentageShare),
        };

        try {
            await axiosInstance.post("/medicalRecords/saveGroupLifePlans", payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
        if (typeof refreshPlans === "function") {
            refreshPlans();
        }

        Swal.fire({
            icon: 'success',
            text: 'Group Life Plan saved successfully!',
            timer: 2000,
            showConfirmButton: false
        });
        

        if (typeof close === "function") close();

        } 
        catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error saving Group Life Plan!',
        });
    }

    setGroupLifeCompanyId("");
    setPlanType("");
    setPaymentType("Amount");
    setEmployeeAmountShare("");
    setEmployerAmountShare("");
    setEmployeePercentageShare("");
    setEmployerPercentageShare("");
};

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Group Life Plan</Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} noValidate autoComplete="off" encType="multipart/form-data">

                        <FormGroup 
                            row={true} 
                            className="d-flex justify-content-between" 
                            sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>

                            <FormControl sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                }}>

                                <FormControl>
                                    <InputLabel id="group-life-company-label">Group Life Company</InputLabel>
                                    <Select
                                        labelId="group-life-company-label"
                                        label="Group Life Company"
                                        value={groupLifeCompanyId}
                                        onChange={(e) => setGroupLifeCompanyId(e.target.value)}
                                        >
                                        {companies.map((company) => (
                                            <MenuItem key={company.id} value={company.id}>
                                                {company.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>                                
                            </FormControl>

                            <FormControl  sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                }}>
                                <Autocomplete
                                freeSolo
                                disabled={!groupLifeCompanyId}
                                value={planType}
                                options={listOfPlanTypes.map(option => option.planTypeMenuItem)}
                                onChange={(event, newValue) => setPlanType(newValue || "")}
                                renderInput={params => (
                                    <TextField
                                    {...params}
                                    label="Plan Type"
                                    onBlur={e => {
                                        if (e.target.value && e.target.value !== planType) {
                                        setPlanType(e.target.value);
                                        }
                                    }}
                                    />
                                )}
                                />
                            </FormControl>                            
                            <FormControl sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                }}>
                                <TextField
                                    disabled={!groupLifeCompanyId}
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
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={handleSave}>
                                    <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save </p>
                                </Button>
                            </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}


export default GroupLifeAddModal;
