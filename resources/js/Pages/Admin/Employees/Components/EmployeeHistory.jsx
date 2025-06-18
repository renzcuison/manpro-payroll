import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Grid, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material'
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

import HistoryTabPayroll from './HistoryTabPayroll';
import HistoryTabSalaryLogs from './HistoryTabSalaryLogs';

const EmployeeHistory = ({ userName, headers }) => {

    const [activeTab, setActiveTab] = useState('1');

    const handleTabChange = (event, newActiveTab) => {
        setActiveTab(newActiveTab);
    };

    const renderPayrollContent = () => (
        <>
            <HistoryTabPayroll userName={userName} headers={headers} />
        </>
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

    const renderSalaryLogsContent = () => (
        <>
            <HistoryTabSalaryLogs userName={userName} headers={headers} />
        </>
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
                        <Tab label="Salary Logs" value="4" />
                    </Tabs>

                    {activeTab === '1' && renderPayrollContent()}
                    {activeTab === '2' && renderApplicationsContent()}
                    {activeTab === '3' && renderAttendanceContent()}
                    {activeTab ==='4' && renderSalaryLogsContent()}
                </Box>
            </Grid>
        </Grid>
    );
};

export default EmployeeHistory;
