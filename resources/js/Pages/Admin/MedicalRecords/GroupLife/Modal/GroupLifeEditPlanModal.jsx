import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  FormGroup,
  FormControl,
  MenuItem,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import axiosInstance, { getJWTHeader } from "@/utils/axiosConfig";
import Swal from 'sweetalert2';

const GroupLifeEditGroupLifePlanModal = ({ open, onClose, plan, user, onSave }) => {

    const [paymentType, setPaymentType] = useState('');
    const [employeeAmountShareError, setEmployeeAmountShareError] = useState(false);
    const [employerAmountShareError, setEmployerAmountShareError] = useState(false);
    const [formData, setFormData] = useState({
        plan_name: plan?.plan_name || "",
        type: plan?.type || "",
        employer_share: plan?.employer_share || "",
        employee_share: plan?.employee_share || ""
    });

    useEffect(() => {
        if (plan) {
        setFormData({
            plan_name: plan.plan_name,
            type: plan.type,
            employer_share: plan.employer_share,
            employee_share: plan.employee_share
        });
        }
        }, [plan]);

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
            return `${integerPart}.${decimalPart}`;
        }

        return integerPart;
    };

    const handleFormattedChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatCurrency(value);

    setFormData(prev => ({
        ...prev,
        [name]: formatted
    }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (
            name === "employee_share" ||
            name === "employer_share"
        ) {
            formattedValue = formatCurrency(value);
        }
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const cleanNumber = (value) => Number(String(value).replace(/[^\d.]/g, "")) || 0;

    const handleSubmit = async () => {
        const payload = {
            plan_name: formData.plan_name,
            type: paymentType,
        };

        if (paymentType === "Amount") {
            payload.employer_share = cleanNumber(formData.employer_share);
            payload.employee_share = cleanNumber(formData.employee_share);
        } else if (paymentType === "Percentage") {
            payload.employer_share = cleanNumber(formData.employer_percentage);
            payload.employee_share = cleanNumber(formData.employee_percentage);
        }

        try {
            const res = await axiosInstance.post(`/medicalRecords/editGroupLifePlan/${plan.id}`, payload, {
            headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.data.status === 200) {
            onSave(res.data.plan);
            }
        } catch (err) {
            console.error("Edit failed", err);
            Swal.fire("Error", "Failed to update plan.", "error");
        }
    };

  return (
        <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', marginBottom: '5%' }}}>
                    <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Edit Group Life Plan</Typography>
                            <IconButton onClick={() => onClose(false)}><i className="si si-close"></i></IconButton>
                        </Box>

                        <DialogContent sx={{ padding: 1, paddingBottom: 1 }}>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{ p: 1, '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } } }}>
                            <FormControl sx={{ width: '49%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                <TextField
                                label="Plan Name"
                                name="plan_name"
                                fullWidth
                                margin="normal"
                                value={formData.plan_name}
                                onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl sx={{ width: '49%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                <TextField
                                fullWidth
                                    required
                                    select
                                    margin="normal"
                                    id="paymentType"
                                    label="Payment Type"
                                    value={paymentType}
                                    onChange={(event) => setPaymentType(event.target.value)}>
                                    <MenuItem key="Amount" value="Amount"> Amount </MenuItem>
                                    <MenuItem key="Percentage" value="Percentage"> Percentage </MenuItem>
                                </TextField>
                            </FormControl>
                                        {paymentType === "Amount" && (
                                        <>
                                            <FormControl sx={{marginTop: 2, marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } }}}>
                                                <InputLabel htmlFor="employerAmountShare">Employer Share</InputLabel>
                                                <OutlinedInput
                                                required
                                                id="employer_share"
                                                name="employer_share"
                                                label="Employer Share"
                                                value={formData.employer_share || ""}
                                                startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                                onChange={handleFormattedChange}/>
                                            </FormControl>
                                            <FormControl sx={{marginTop: 2, marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },'& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } } }}>
                                                <InputLabel htmlFor="employeeAmountShare">Employee Share</InputLabel>
                                                <OutlinedInput
                                                required
                                                id="employee_share"
                                                name="employee_share"
                                                label="Employee Share"
                                                value={formData.employee_share || ""}
                                                startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                                onChange={handleFormattedChange}/>
                                            </FormControl>
                                        </>
                                        )}
                                            {paymentType === "Percentage" && (
                                            <>

                                            <FormControl sx={{
                                                marginTop: 2, marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                                }}>
                                                <InputLabel htmlFor="employeePercentageShare">Employee Share</InputLabel>
                                                <OutlinedInput
                                                required
                                                id="employer_percentage"
                                                name="employer_percentage"
                                                label="Employer Share (%)"
                                                value={formData.employer_percentage || ""}
                                                startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                                onChange={handleFormattedChange}
                                                />
                                            </FormControl>
        
                                            <FormControl sx={{
                                                marginTop: 2, marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                                }}>
                                                <InputLabel htmlFor="employerPercentageShare">Employer Share</InputLabel>
                                                <OutlinedInput
                                                required
                                                id="employee_percentage"
                                                name="employee_percentage"
                                                label="Employee Share (%)"
                                                value={formData.employee_percentage || ""}
                                                startAdornment={<InputAdornment position="start">%</InputAdornment>}
                                                onChange={handleFormattedChange}
                                                />
                                            </FormControl>
                                            </>
                                            )}   
                                    </FormGroup> 

                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>

                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: "#7a7a7a" }}
                                    onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </Box>
                </DialogContent>
            </DialogTitle>
        </Dialog>
    );
};

export default GroupLifeEditGroupLifePlanModal;
