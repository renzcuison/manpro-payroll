import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import EmployeeDetailsEdit from '../../../Modals/Employees/EmployeeDetailsEdit';
import AllowanceView from '../Allowance/Modals/EmployeeAllowanceView';
import LeaveCreditView from '../LeaveCredits/Modals/LeaveCreditView';
import EmployeeEducationBackground from './Components/EmployeeEducationBackground';

import EmployeeHistory from './Components/EmployeeHistory';
import EmployeeBenefits from './Components/EmployeeBenefits';
import EmployeeDeductions from './Components/EmployeeDeductions';

const EmployeeView = () => {
    const { user } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState('');
    const [education, setEducation] = useState([]);
    const [imagePath, setImagePath] = useState('');

    const [openEmployeeBenefitsModal, setOpenEmployeeBenefitsModal] = useState(false);
    const [openEmployeeAllowanceModal, setOpenEmployeeAllowanceModal] = useState(false);
    const [openEmployeeDetailsEditModal, setOpenEmployeeDetailsEditModal] = useState(false);
    const [openEmployeeLeaveCreditsModal, setOpenEmployeeLeaveCreditsModal] = useState(false);

    useEffect(() => {
        getEmployeeDetails();
        getEducationalBackground();
    }, []);

    const getEducationalBackground = () => {
        const data = { username: user };

        axiosInstance.get(`/employee/getEmployeeEducationBackground`, { params:data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    const educationBackgrounds = response.data.educations
                    setEducation(educationBackgrounds);             
                }
            })
            .catch((error) => {
                console.error("Error fetching education background:", error);
                setEducation(null);
        })
    }

    const getEmployeeDetails = () => {
        const data = { username: user };

        setOpenEmployeeDetailsEditModal(false);
        setAnchorEl(null);

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    const empDetails = response.data.employee;
                    setEmployee(empDetails);
                    if (empDetails.avatar && empDetails.avatar_mime) {
                        const byteCharacters = window.atob(empDetails.avatar);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: empDetails.avatar_mime });

                        const newBlob = URL.createObjectURL(blob);
                        setImagePath(newBlob);
                    } else {
                        setImagePath(null);
                    }
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    };
    // Image Cleanup
    useEffect(() => {
        return () => {
            if (imagePath && imagePath.startsWith('blob:')) {
                URL.revokeObjectURL(imagePath);
            }
        }
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

    const formattedBirthDate = employee.birth_date ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.birth_date)) : '';
    const formattedStartDate = employee.date_start ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.date_start)) : '';
    const formattedEndDate = employee.date_end ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.date_end)) : '';

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseActions = () => {
        setAnchorEl(null);
    };

    // Employment Details
    const handleOpenEmployeeDetailsEditModal = () => {
        setOpenEmployeeDetailsEditModal(true);
    }
    const handleCloseEmployeeDetailsEditModal = (reload) => {
        setOpenEmployeeDetailsEditModal(false);
        if (reload) {
            getEmployeeDetails();
            getEducationalBackground();
        }
    }

    // Benefits
    const handleOpenEmployeeBenefitsModal = () => {
        setOpenEmployeeBenefitsModal(true);
    }
    const handleCloseEmployeeBenefitsModal = () => {
        setOpenEmployeeBenefitsModal(false);
    }

    // Allowance
    const handleOpenEmployeeAllowanceModal = () => {
        setOpenEmployeeAllowanceModal(true);
    }
    const handleCloseEmployeeAllowanceModal = () => {
        setOpenEmployeeAllowanceModal(false);
    }

    // Leave Credits
    const handleOpenEmployeeLeaveCreditsModal = () => {
        setOpenEmployeeLeaveCreditsModal(true);
    }
    const handleCloseEmployeeLeaveCreditsModal = () => {
        setOpenEmployeeLeaveCreditsModal(false);
    }

    return (
        <Layout title={"EmployeeView"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1500px' } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/employees" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Employee Profile
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenActions}> Actions </Button>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions} >
                            <MenuItem onClick={handleOpenEmployeeDetailsEditModal}> Employee Details</MenuItem>
                            {/* <MenuItem onClick={handleOpenEmployeeBenefitsModal}> View Benefits </MenuItem> */}
                            {/* <MenuItem onClick={handleOpenEmployeeAllowanceModal}> View Allowance </MenuItem> */}
                            {/* <MenuItem onClick={handleOpenEmployeeLeaveCreditsModal}> View Leave Credits </MenuItem> */}
                        </Menu>

                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                <Grid container sx={{ pt: 1, pb: 4, justifyContent: 'center', alignItems: 'center' }}>
                                    <Avatar alt={`${employee.user_name} Profile Pic`} src={imagePath || null} sx={{ width: '50%', height: 'auto', aspectRatio: '1 / 1', objectFit: 'cover', boxShadow: 3 }} />
                                </Grid>

                                {/* <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}></Grid> */}

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                                        <Typography> <i className="fa fa-id-card"></i> </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                                        {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                                        <Typography> <i className="fa fa-envelope"></i> </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                                        <Typography> {employee.email} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                                        <Typography> <i className="fa fa-mobile"></i> </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                                        <Typography> {employee.contact_number || ''} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                                        <Typography> <i className="fa fa-globe"></i> </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                                        <Typography> {employee.address || ''} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                                        <Typography> <i className="fa fa-birthday-cake"></i> </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                                        <Typography> {employee.birth_date ? `${formattedBirthDate} (${calculateAge(employee.birth_date)} Years Old)` : 'Not Indicated'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                                        <Typography> <i className="fa fa-venus-mars"></i> </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                                        <Typography> {employee.gender || 'Not Indicated'} </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <EmployeeBenefits userName={user} headers={headers} />
                            <EmployeeDeductions userName={user} headers={headers} />
                        </Grid>

                        <Grid item size={{ xs: 8, sm: 8, md: 8, lg: 8 }}>
                            <Box sx={{ mb: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }} > Summary </Typography>

                                <Grid container spacing={4}>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                            <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 114, height: 114, bgcolor: '#7eb73d' }}> {employee.total_payroll || "0"} </Avatar>
                                            </Grid>
                                            <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="h6"> Signed Payroll </Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>

                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                            <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 114, height: 114, bgcolor: '#eab000' }}> {employee.total_attendance || "0"} </Avatar>
                                            </Grid>
                                            <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="h6"> Attendance </Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>

                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                                            <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 114, height: 114, bgcolor: '#de5146' }}> {employee.total_applications || "0"} </Avatar>
                                            </Grid>
                                            <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="h6"> Applications </Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} > Employment Details </Typography>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Role </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.role || '-'} </Typography>
                                    </Grid>

                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Job Title </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.jobTitle || '-'} </Typography>
                                    </Grid>
                                </Grid>   

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Department </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.department || '-'} </Typography>
                                    </Grid>

                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Branch </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.branch || '-'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Type </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.employment_type || '-'} </Typography>
                                    </Grid>

                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Status </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.employment_status || '-'} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Team </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.work_group || '-'} </Typography>
                                    </Grid>

                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Date Hired </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        <Typography> {employee.date_start ? `${formattedStartDate}` : '-'} {employee.date_end ? `- ${formattedEndDate}` : ''} </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Bank Name </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        {/* <Typography> {employee.role || '-'} </Typography> */}
                                    </Grid>

                                    {/* <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}> */}
                                        {/* <Typography sx={{ fontWeight: 'bold' }}> Bank Account </Typography> */}
                                    {/* </Grid> */}
                                    {/* <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}> */}
                                        {/* <Typography> {employee.jobTitle || '-'} </Typography> */}
                                    {/* </Grid> */}
                                </Grid>

                                <Grid container spacing={4} sx={{ py: 1 }}>
                                    <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}> Bank Account </Typography>
                                    </Grid>
                                    <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                                        {/* <Typography> {employee.role || '-'} </Typography> */}
                                    </Grid>

                                    {/* <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}> */}
                                        {/* <Typography sx={{ fontWeight: 'bold' }}> Bank Account </Typography> */}
                                    {/* </Grid> */}
                                    {/* <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}> */}
                                        {/* <Typography> {employee.jobTitle || '-'} </Typography> */}
                                    {/* </Grid> */}
                                </Grid>
                            </Box>

                            <EmployeeEducationBackground education={education}></EmployeeEducationBackground>

                            <EmployeeHistory userName={user} headers={headers} />

                        </Grid>
                    </Grid>   
                </Box>

                {openEmployeeDetailsEditModal &&
                    <EmployeeDetailsEdit open={openEmployeeDetailsEditModal} close={handleCloseEmployeeDetailsEditModal} employee={employee} userName={user} />
                }

                {openEmployeeAllowanceModal &&
                    <AllowanceView open={openEmployeeAllowanceModal} close={handleCloseEmployeeAllowanceModal} userName={user} />
                }

                {openEmployeeLeaveCreditsModal &&
                    <LeaveCreditView open={openEmployeeLeaveCreditsModal} close={handleCloseEmployeeLeaveCreditsModal} userName={user} />
                }

            </Box>
        </Layout >
    )
}

export default EmployeeView
