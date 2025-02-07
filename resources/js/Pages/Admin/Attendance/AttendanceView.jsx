import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import EmployeeAddBenefit from '../Employees/Modals/EmployeeAddBenefit';
import EmploymentDetailsEdit from '../Employees/Modals/EmploymentDetailsEdit';

const AttendanceView = () => {
    const { user } = useParams();

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState(''); 

    useEffect(() => {
        getEmployeeDetails();
    }, []);

    const getEmployeeDetails = () => {
        const data = { username: user };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if ( response.data.status === 200 ) {
                    setEmployee(response.data.employee);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    };

    return (
        <Layout title={"EmployeeView"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Attendance - {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </Typography>

                        <></>
                    </Box>
            
                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}></Box>

                </Box>
            </Box>
        </Layout >
    )
}

export default AttendanceView
