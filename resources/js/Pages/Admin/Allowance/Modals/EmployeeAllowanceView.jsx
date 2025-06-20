import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Typography, TableContainer, TableHead, TableBody, TableRow, TableCell, Table } from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import EmployeeAllowanceAdd from "../Components/EmployeeAllowanceAdd";
import EmployeeAllowanceList from "../Components/EmployeeAllowanceList";
import EmployeeAllowanceEdit from "../Components/EmployeeAllowanceEdit";
import { useEmployeeAllowances } from "../../../../hooks/useAllowances";

const EmployeeAllowanceView = ({ open, close, userName, allowance }) => {
    const {employeeAllowances, isEmployeeAllowancesLoading, refetchEmployeeAllowances} = useEmployeeAllowances(userName, allowance);
    const allowances = employeeAllowances?.allowances || [];
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [allowanceAddOpen, setAllowanceAddOpen] = useState(false);
    const [allowanceEditOpen, setAllowanceEditOpen] = useState(false);
    const [allowanceListOpen, setAllowanceListOpen] = useState(false);
    const [employee, setEmployee] = useState([]);
    const [selectedAllowance, setSelectedAllowance] = useState(null);

    useEffect(() => {
        getEmployeeDetails();
        setAllowanceListOpen(true);
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

    const handleOpenAddEmployeeAllowance = () => {
        setAllowanceListOpen(false);
        setAllowanceAddOpen(true);
    }

    const handleCloseAddEmployeeAllowance = (reload) => {
        setAllowanceAddOpen(false);
        setAllowanceListOpen(true);
        if(reload){
            refetchEmployeeAllowances();
        }
    }

    const handleOpenEditEmployeeAllowance = (index) => {
        setSelectedAllowance(index);
        setAllowanceListOpen(false);
        setAllowanceEditOpen(true);
    }

    const handleCloseEditEmployeeAllowance = (reload) => {
        setAllowanceListOpen(true);
        setAllowanceEditOpen(false);
        if(reload){
            refetchEmployeeAllowances();
        }
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", maxHeight: "600px", minWidth: { xs: "100%", sm: "750px" }, maxWidth: "800px" }}}>
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}> Employee Allowance </Typography>
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
                    
                    {allowanceListOpen && (
                        <EmployeeAllowanceList allowances={allowances} isLoading={isEmployeeAllowancesLoading} onAdd={() => handleOpenAddEmployeeAllowance()} onEdit={(index) => handleOpenEditEmployeeAllowance(index)}/>
                    )}

                    {allowanceEditOpen && (
                        <EmployeeAllowanceEdit allowances={allowances[selectedAllowance]} onClose={handleCloseEditEmployeeAllowance}/>
                    )}

                    {allowanceAddOpen && (
                        <EmployeeAllowanceAdd userName={userName} onClose={handleCloseAddEmployeeAllowance} />
                    )}

                </DialogContent>
            </Dialog >
        </>
    );
};

export default EmployeeAllowanceView;
