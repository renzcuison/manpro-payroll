import React, { useEffect, useState } from 'react'
import { useMediaQuery, Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'
const EmployeeView = () => {
    const { user } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const isAbove1080 = useMediaQuery('(min-width:1080px)');

    const [employee, setEmployee] = useState(''); 

    useEffect(() => {
        const data = { username: user };

        axiosInstance.get(`/employees/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if ( response.data.status === 200 ) {
                    setEmployee(response.data.employee);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    }, []);

    const calculateAge = (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
    
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
    
        return age;
    };

    const formattedDate = employee.birth_date ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.birth_date)) : '';
    
    const [activeTab, setActiveTab] = useState('1');

    const handleTabChange = (event, newActiveTab) => {
      setActiveTab(newActiveTab);
    };

    const renderEmploymentContent = () => (
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ px: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            
                <Grid container spacing={4} sx={{ py: 1 }}>
                    <Grid item xs={2}>
                        <Typography> Department </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography> Role </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ py: 1 }}>
                    <Grid item xs={2}>
                        <Typography> Branch </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography> Status </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ py: 1 }}>
                    <Grid item xs={2}>
                        <Typography> Start Date </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography> End Date </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                    </Grid>
                </Grid>

            </Box>
        </Box>
    );
    
    const renderAttendanceContent = () => (
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Typography variant="body1">Attendance Information will be displayed here</Typography>
        </Box>
    );

    const renderPayrollContent = () => (
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Typography variant="body1">Payroll Information will be displayed here</Typography>
        </Box>
    );
    
    return (
        <Layout title={"Clients"}>
            <Box sx={isAbove1080 ? { mx: 12 } : {}}>
    
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Employee Profile </Typography>
                </Box>
        
                <Grid container spacing={4} sx={{ mt: 2 }}>

                    <Grid item xs={4}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                            
                            <Grid container sx={{ pt: 1, pb: 4, justifyContent: 'center', alignItems: 'center' }}>
                                <Avatar
                                    alt="Remy Sharp"
                                    src="../../../../../images/admin.png"
                                    sx={{ width: '50%', height: 'auto' }}
                                />
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={1}>
                                    <Typography> <i className="fa fa-id-card"></i> </Typography>
                                </Grid>
                                <Grid item xs={11}>
                                    <Typography> {employee.first_name} {employee.middle_name ? employee.middle_name : ''} {employee.last_name} {employee.suffix ? employee.suffix : ''} </Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={1}>
                                    <Typography> <i className="fa fa-envelope"></i> </Typography>
                                </Grid>
                                <Grid item xs={11}>
                                    <Typography> {employee.email} </Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={1}>
                                    <Typography> <i className="fa fa-mobile"></i> </Typography>
                                </Grid>
                                <Grid item xs={11}>
                                    <Typography> {employee.contact_number ? employee.contact_number : '' } </Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={1}>
                                    <Typography> <i className="fa fa-globe"></i> </Typography>
                                </Grid>
                                <Grid item xs={11}>
                                    <Typography> {employee.address ? employee.address : '' } </Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={1}>
                                    <Typography> <i className="fa fa-birthday-cake"></i> </Typography>
                                </Grid>
                                <Grid item xs={11}>
                                    <Typography> {employee.birth_date ? `${formattedDate} (${calculateAge(employee.birth_date)} Years Old)` : 'Not Indicated'} </Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={1}>
                                    <Typography> <i className="fa fa-venus-mars"></i> </Typography>
                                </Grid>
                                <Grid item xs={11}>
                                    <Typography> {employee.gender ? employee.gender : 'Not Indicated' } </Typography>
                                </Grid>
                            </Grid>

                        </Box>
                    </Grid>

                    <Grid item xs={8}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>

                            <Typography variant="h5" sx={{ fontWeight: 'bold' }} > Employement Details </Typography>
                            
                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={2}>
                                    <Typography> Department </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                                </Grid>

                                <Grid item xs={2}>
                                    <Typography> Branch </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                                </Grid>
                            </Grid>


                        </Box>
                    </Grid>

                    
                </Grid>

                <Grid container spacing={4} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        {/* Put Tabs in Here */}
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                <Tab label="Employment" value="1"/>
                                <Tab label="Attendance" value="2"/>
                                <Tab label="Payroll" value="3"/>
                            </Tabs>
                            {activeTab === '1' && renderEmploymentContent()}
                            {activeTab === '2' && renderAttendanceContent()}
                            {activeTab === '3' && renderPayrollContent()}
                        </Box>
                    </Grid>
                </Grid>

            </Box>
        </Layout >
    )
}

export default EmployeeView
