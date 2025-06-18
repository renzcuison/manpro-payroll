import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Typography, TableContainer, TableHead, TableBody, TableRow, TableCell, Table } from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import EmployeeIncentiveAdd from "../Components/EmployeeIncentiveAdd";
import EmployeeIncentivesList from "../Components/EmployeeIncentiveList";
import EmployeeIncentiveEdit from "../Components/EmployeeIncentiveEdit";
import { useIncentives } from "../../../../hooks/useIncentives";

const EmployeeIncentiveView = ({ open, close, userName, incentive}) => {
    const { employeeIncentives } = useIncentives({userName: userName, filters: {incentiveId: incentive}});
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const incentives = employeeIncentives.data?.incentives || [];

    const [incentivesAddOpen, setIncentivesAddOpen] = useState(false);
    const [incentivesEditOpen, setEditIncentivesOpen] = useState(false);
    const [incentivesListOpen, setIncentivesListOpen] = useState(false);
    const [employee, setEmployee] = useState([]);
    const [selectedIncentive, setSelectedIncentive] = useState('');

    useEffect(() => {
        getEmployeeDetails();
        setIncentivesListOpen(true);
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

    const handleOpenAddEmployeeIncentive = () => {
        setIncentivesListOpen(false);
        setIncentivesAddOpen(true);
    }

    const handleCloseAddEmployeeIncentive = (reload) => {
        setIncentivesAddOpen(false);
        setIncentivesListOpen(true);
        if(reload){
            employeeIncentives.refetch();
        }
    }

    const handleOpenEditEmployeeIncentives = (index) => {
        setSelectedIncentive(index);
        setIncentivesListOpen(false);
        setEditIncentivesOpen(true);
    }

    const handleCloseEditEmployeeIncentives = (reload) => {
        setIncentivesListOpen(true);
        setEditIncentivesOpen(false);
        if(reload){
            employeeIncentives.refetch();
        }
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", maxHeight: "600px", minWidth: { xs: "100%", sm: "750px" }, maxWidth: "800px" }}}>
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}> Employee Incentive </Typography>
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
                    
                    {incentivesListOpen && (
                        <EmployeeIncentivesList incentives={incentives} isLoading={employeeIncentives.isLoading} onAdd={() => handleOpenAddEmployeeIncentive()} 
                        onEdit={(index) => handleOpenEditEmployeeIncentives(index)}/>
                    )}

                    {incentivesEditOpen && (
                        <EmployeeIncentiveEdit incentives={incentives[selectedIncentive]} onClose={handleCloseEditEmployeeIncentives}/>
                    )}

                    {incentivesAddOpen && (
                        <EmployeeIncentiveAdd userName={userName} headers={headers} onClose={handleCloseAddEmployeeIncentive} />
                    )}

                </DialogContent>
            </Dialog >
        </>
    );
};

export default EmployeeIncentiveView;
