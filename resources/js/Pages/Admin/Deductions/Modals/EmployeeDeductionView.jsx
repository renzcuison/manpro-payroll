import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Typography, TableContainer, TableHead, TableBody, TableRow, TableCell, Table } from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
import EmployeeDeductionAdd from "../Components/EmployeeDeductionAdd";
import EmployeeDeductionList from "../Components/EmployeeDeductionList";
import EmployeeDeductionEdit from "../Components/EmployeeDeductionEdit";

import { useDeductions } from "../../../../hooks/useDeductions";

const EmployeeDeductionView = ({ open, close, userName }) => {
    const { employeeDeductions } = useDeductions({userName: userName});
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const deductions = employeeDeductions.data?.deductions || [];
    
    const [deductionsAddOpen, setDeductionsAddOpen] = useState(false);
    const [deductionEditOpen, setDeductionEditOpen] = useState(false);
    const [deductionsListOpen, setDeductionsListOpen] = useState(false);
    const [employee, setEmployee] = useState([]);
    const [selectedDeduction, setSelectedDeduction] = useState(null);

    useEffect(() => {
        getEmployeeDetails();
        setDeductionsListOpen(true);
    }, []);

    const getEmployeeDetails = () => {
        const data = { username: userName };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                setEmployee(response.data.employee);
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    };

    const handleOpenAddEmployeeDeductions = () => {
        setDeductionsListOpen(false);
        setDeductionsAddOpen(true);
    }

    const handleCloseAddEmployeeDeductions = (reload) => {
        setDeductionsAddOpen(false);
        setDeductionsListOpen(true);
        if(reload){
            employeeDeductions.refetch();
        }
    }

    const handleOpenEditEmployeeDeductions = (index) => {
        setSelectedDeduction(index);
        setDeductionsListOpen(false);
        setDeductionEditOpen(true);
    }

    const handleCloseEditEmployeeDeductions = (reload) => {
        setDeductionsListOpen(true);
        setDeductionEditOpen(false);
        if(reload){
            employeeDeductions.refetch();
        }
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", maxHeight: "600px", minWidth: { xs: "100%", sm: "750px" }, maxWidth: "1000px" }}}>
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}> Employee Deductions </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 4 }}>
                    <Box sx={{ mb: 2, textAlign: 'left' }}>
                        <Typography variant="body1">
                            <strong>Employee Name:</strong> {employee.last_name}, {employee.first_name} {employee.middle_name || ''} {employee.suffix || ''}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Branch:</strong> {employee.branch || '-'}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Department:</strong> {employee.department || '-'}
                        </Typography>
                    </Box>
                    
                    {deductionsListOpen && (
                        <EmployeeDeductionList deductions={deductions} isLoading={employeeDeductions.isLoading} onAdd={() => handleOpenAddEmployeeDeductions()} 
                        onEdit={(index) => handleOpenEditEmployeeDeductions(index)} />
                    )}
                    {deductionEditOpen && (
                        <EmployeeDeductionEdit deductions={deductions[selectedDeduction]} onClose={handleCloseEditEmployeeDeductions}/>
                    )}
                    {deductionsAddOpen && (
                        <EmployeeDeductionAdd userName={userName} headers={headers} onClose={handleCloseAddEmployeeDeductions} />
                    )}
                </DialogContent>
            </Dialog >
        </>
    );
};

export default EmployeeDeductionView;
