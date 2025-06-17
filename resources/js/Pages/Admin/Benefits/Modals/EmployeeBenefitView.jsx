import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Typography, TableContainer, TableHead, TableBody, TableRow, TableCell, Table } from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import EmployeeBenefitAdd from "../Components/EmployeeBenefitAdd";
import EmployeeBenefitList from "../Components/EmployeeBenefitList";
import EmployeeBenefitEdit from "../Components/EmployeeBenefitEdit";
import { useBenefits } from "../../../../hooks/useBenefits";

const EmployeeBenefitView = ({ open, close, userName }) => {
    const {employeeBenefits} = useBenefits({userName: userName});
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const benefits = employeeBenefits.data?.benefits || [];
    
    const [benefitsAddOpen, setBenefitsAddOpen] = useState(false);
    const [benefitEditOpen, setBenefitEditOpen] = useState(false);
    const [benefitsListOpen, setBenefitsListOpen] = useState(false);
    const [employee, setEmployee] = useState([]);
    const [selectedBenefit, setSelectedBenefit] = useState(null);

    useEffect(() => {
        getEmployeeDetails();
        setBenefitsListOpen(true);
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

    const handleOpenAddEmployeeBenefits = () => {
        setBenefitsListOpen(false);
        setBenefitsAddOpen(true);
    }

    const handleCloseAddEmployeeBenefits = (reload) => {
        setBenefitsAddOpen(false);
        setBenefitsListOpen(true);
        if(reload){
            employeeBenefits.refetch();
        }
    }

    const handleOpenEditEmployeeBenefits = (index) => {
        setSelectedBenefit(index);
        setBenefitsListOpen(false);
        setBenefitEditOpen(true);
    }

    const handleCloseEditEmployeeBenefits = (reload) => {
        setBenefitsListOpen(true);
        setBenefitEditOpen(false);
        if(reload){
            employeeBenefits.refetch();
        }
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", maxHeight: "600px", minWidth: { xs: "100%", sm: "750px" }, maxWidth: "1000px" }}}>
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}> Employee Benefits </Typography>
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
                    
                    {benefitsListOpen && (
                        <EmployeeBenefitList benefits={benefits} isLoading={employeeBenefits.isLoading} onAdd={() => handleOpenAddEmployeeBenefits()} 
                        onEdit={(index) => handleOpenEditEmployeeBenefits(index)} />
                    )}
                    {benefitEditOpen && (
                        <EmployeeBenefitEdit benefits={benefits[selectedBenefit]} onClose={handleCloseEditEmployeeBenefits}/>
                    )}
                    {benefitsAddOpen && (
                        <EmployeeBenefitAdd userName={userName} headers={headers} onClose={handleCloseAddEmployeeBenefits} />
                    )}
                </DialogContent>
            </Dialog >
        </>
    );
};

export default EmployeeBenefitView;
