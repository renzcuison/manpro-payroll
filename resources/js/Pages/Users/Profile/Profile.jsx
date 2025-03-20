import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import ProfileEdit from './Modals/ProfileEdit';

const EmployeeView = () => {
    const { user } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState('');

    const [openProfileEditModal, setOpenProfileEditModal] = useState(false);


    useEffect(() => {
        getMyDetails();
    }, []);

    const getMyDetails = () => {
        setAnchorEl(null);
        axiosInstance.get(`/employee/getMyDetails`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setEmployee(response.data.employee);
                }
            }).catch((error) => {
                console.error('Error fetching details:', error);
            });
    };

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

    const formattedBirthDate = employee.birth_date ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.birth_date)) : '';
    const formattedStartDate = employee.date_start ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.date_start)) : '';
    const formattedEndDate = employee.date_end ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.date_end)) : '';

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseActions = () => {
        setAnchorEl(null);
    };

    // Employee Profile
    const handleOpenProfileEditModal = () => {
        setOpenProfileEditModal(true);
    }
    const handleCloseProfileEditModal = (reload) => {
        setOpenProfileEditModal(false);
        if (reload) {
            getMyDetails();
        }
    }

    return (
        <Layout title={"EmployeeView"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Employee Profile </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenActions} >
                            Actions
                        </Button>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions} >
                            <MenuItem onClick={handleOpenProfileEditModal}> Edit Profile </MenuItem>
                        </Menu>

                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>

                        <Grid item xs={4}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                <Grid container sx={{ pt: 1, pb: 4, justifyContent: 'center', alignItems: 'center' }}>
                                    <Avatar
                                        alt={`${employee.user_name} Profile Pic`}
                                        src={employee.profile_pic ? `${location.origin}/storage/${employee.profile_pic}` : "../../../../../images/admin.jpg"}
                                        sx={{
                                            width: '50%',
                                            height: 'auto',
                                            aspectRatio: '1 / 1',
                                            objectFit: 'cover',
                                            boxShadow: 3,
                                        }}
                                    />
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={1}>
                                        <Typography> <i className="fa fa-id-card"></i> </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={1}>
                                        <Typography> <i className="fa fa-envelope"></i> </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography> {employee.email} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={1}>
                                        <Typography> <i className="fa fa-mobile"></i> </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography> {employee.contact_number || ''} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={1}>
                                        <Typography> <i className="fa fa-globe"></i> </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography> {employee.address || ''} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={1}>
                                        <Typography> <i className="fa fa-birthday-cake"></i> </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography> {employee.birth_date ? `${formattedBirthDate} (${calculateAge(employee.birth_date)} Years Old)` : 'Not Indicated'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={1}>
                                        <Typography> <i className="fa fa-venus-mars"></i> </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography> {employee.gender || 'Not Indicated'} </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={8}>
                            {employee.user_type == "Employee" ?
                                <Box sx={{ mb: 3, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }} > Summary </Typography>

                                    <Grid container spacing={4}>
                                        <Grid item xs={4}>
                                            <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                                <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 114, height: 114, bgcolor: '#7eb73d' }}>100,000</Avatar>
                                                </Grid>
                                                <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant="h6"> Signed Payroll </Typography>
                                                </Grid>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={4}>
                                            <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                                <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 114, height: 114, bgcolor: '#eab000' }}>100,000</Avatar>
                                                </Grid>
                                                <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant="h6"> Attendance </Typography>
                                                </Grid>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={4}>
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
                                </Box> : null
                            }

                            <Box sx={{ py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} > Employment Details </Typography>
                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Role </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.role || '-'} </Typography>
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Job Title </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.jobTitle || '-'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Department </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.department || '-'} </Typography>
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Branch </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.branch || '-'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Type </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.employment_type || '-'} </Typography>
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Status </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.employment_status || '-'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Work Group </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.work_group || '-'} </Typography>
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Typography variant="h6"> Employment Date </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography> {employee.date_start ? `${formattedStartDate}` : '-'} {employee.date_end ? `- ${formattedEndDate}` : ''} </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {openProfileEditModal &&
                    <ProfileEdit
                        open={openProfileEditModal}
                        close={handleCloseProfileEditModal}
                        employee={employee}
                    />}

            </Box>
        </Layout >
    )
}

export default EmployeeView
