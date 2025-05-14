import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Grid, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material'
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

import LoadingSpinner from '../../../../components/LoadingStates/LoadingSpinner';

const EmployeeHistory = ({ userName, headers }) => {

    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState([]);
    
    const data = { username: userName };

    useEffect(() => {
        axiosInstance.get(`/employee/getMyPayrollHistory`, { params: data, headers })
            .then((response) => {
                setRecords(response.data.records);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching payroll calculations:', error);
            }); 
    }, []);

    const [activeTab, setActiveTab] = useState('1');

    const handleTabChange = (event, newActiveTab) => {
        setActiveTab(newActiveTab);
    };

    const renderPayrollContent = () => (
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <TableContainer style={{ overflowX: 'auto' }}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Payroll Date</TableCell>
                                    <TableCell align="center">Cut-Off</TableCell>
                                    <TableCell align="center">Days</TableCell>
                                    <TableCell align="center">Total Earnings</TableCell>
                                    <TableCell align="center">Total Deductions</TableCell>
                                    <TableCell align="center">Net Pay</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.record} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }} onClick={() => handleOpenViewPayrollModal(record.record)} >
                                        <TableCell align="center">{dayjs(record.payrollStartDate).format("MMM D, YYYY")} - {dayjs(record.payrollEndDate).format("MMM D, YYYY")}</TableCell>
                                        <TableCell align="center">{record.payrollCutOff}</TableCell>
                                        <TableCell align="center">{record.payrollWorkingDays}</TableCell>
                                        <TableCell align="center">{record.payrollEarnings}</TableCell>
                                        <TableCell align="center">{record.payrollDeductions}</TableCell>
                                        <TableCell align="center">{record.payrollEarnings - record.payrollDeductions}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );

    const renderApplicationsContent = () => (
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Typography variant="body1">Applications Information will be displayed here</Typography>
        </Box>
    );

    const renderAttendanceContent = () => (
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Typography variant="body1">Attendance Information will be displayed here</Typography>
        </Box>
    );

    return (
        <Grid container spacing={4} sx={{ mt: 4, mb: 12 }}>
            <Grid item size={12}>
                <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>

                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }} > History </Typography>

                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Payroll" value="1" />
                        <Tab label="Applications" value="2" />
                        <Tab label="Attendance" value="3" />
                    </Tabs>

                    {activeTab === '1' && renderPayrollContent()}
                    {activeTab === '2' && renderApplicationsContent()}
                    {activeTab === '3' && renderAttendanceContent()}
                </Box>
            </Grid>
        </Grid>
    );
};

export default EmployeeHistory;
