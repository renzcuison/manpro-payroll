import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import EmploymentDetailsEdit from '../../../Modals/Employees/EmployeeDetailsEdit';

const BenefitView = () => {
    const { benefitID } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [benefit, setBenefit] = useState(''); 
    const [employee, setEmployee] = useState(''); 


    useEffect(() => {
        const data = { id: benefitID };

        axiosInstance.get(`/benefits/getBenefit`, { params: data, headers })
            .then((response) => {
                if ( response.data.status === 200 ) {
                    console.log(response);
                    setBenefit(response.data.benefit);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.error('Error fetching getBenefit:', error);
            });
    }, []);

    // const getEmployeeDetails = () => {
        
    // };

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleCloseActions = () => {
        setAnchorEl(null);
    };
    
    return (
        <Layout title={"BenefitView"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }} > View Benefit </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenActions} >
                            Actions
                        </Button>
                        
                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions} >
                            {/* <MenuItem onClick={handleCloseActions}>Edit Employee Information</MenuItem> */}
                            {/* <MenuItem onClick={handleOpenEmploymentDetailsEditModal}>Edit Employment Details</MenuItem> */}
                        </Menu>
                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>

                        <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px'}}>

                                {isLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <>
                                        <Grid container spacing={4} sx={{ p: 1 }}>
                                            <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Name </Grid>
                                            <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> {benefit.name} </Grid>
                                        </Grid>

                                        <Grid container spacing={4} sx={{ p: 1 }}>
                                            <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Type </Grid>
                                            <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> {benefit.type} </Grid>
                                        </Grid>

                                        {benefit?.type === "Percentage" && (
                                            <>
                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Employee Share</Grid>
                                                    <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> {benefit.employee_percentage}% </Grid>
                                                </Grid>
                                            
                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Employeer Share</Grid>
                                                    <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> {benefit.employer_percentage}% </Grid>
                                                </Grid>

                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Total </Grid>
                                                    <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> {benefit.employee_percentage} + {benefit.employer_percentage}% </Grid>
                                                </Grid>
                                            </>
                                        )}

                                        {benefit?.type === "Amount" && (
                                            <>
                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Employee Share</Grid>
                                                    <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> ₱{benefit.employee_amount} </Grid>
                                                </Grid>
                                            
                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Employeer Share</Grid>
                                                    <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> ₱{benefit.employer_amount} </Grid>
                                                </Grid>

                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}> Total </Grid>
                                                    <Grid size={{ xs: 8, sm: 8, md: 8, lg: 4 }}> ₱{benefit.employee_amount} + {benefit.employer_amount} </Grid>
                                                </Grid>
                                            </>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 8, sm: 8, md: 8, lg: 8 }}>
                            <Box sx={{ mb: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }} > Summary </Typography>

                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                            <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 114, height: 114, bgcolor: '#7eb73d' }}>100,000</Avatar>
                                            </Grid>
                                            <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="h6"> Signed Payroll </Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                            <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 114, height: 114, bgcolor: '#eab000' }}>100,000</Avatar>
                                            </Grid>
                                            <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="h6"> Attendance </Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                            <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 114, height: 114, bgcolor: '#de5146' }}>100,000</Avatar>
                                            </Grid>
                                            <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="h6"> Applications </Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} > Employement Details </Typography>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Role </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.role || '-' } </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Job Title </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.jobTitle || '-' } </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Department </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.department || '-' } </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Branch </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.branch || '-' } </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Type </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.employment_type || '-' } </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Status </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.employment_status || '-' } </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Team </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.work_group || '-' } </Typography>                                    
                                    </Grid>

                                    <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography> Employment Date </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4}}>
                                        <Typography> {employee.date_start ? `${formattedStartDate}` : '-'} {employee.date_end ? `- ${formattedEndDate}` : ''} </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                    </Grid>
                
                </Box>
            </Box>
        </Layout >
    )
}

export default BenefitView
