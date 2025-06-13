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

import EmployeeInformation from './Components/EmployeeInformation';
import EmployeeHistory from './Components/EmployeeHistory';
import EmployeeBenefits from './Components/EmployeeBenefits';
import EmployeeDeductions from './Components/EmployeeDeductions';
import EmployeeAllowances from './Components/EmployeeAllowances';
import EmployeeIncentives from './Components/EmployeeIncentives';
import EmployeeSummary from './Components/EmployeeSummary';
import EmploymentDetails from './Components/EmploymentDetails';

const EmployeeView = () => {
    const { user } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState('');
    const [educations, setEducations] = useState([]);
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
                    setEducations(educationBackgrounds);             
                }
            })
            .catch((error) => {
                console.error("Error fetching education background:", error);
                setEducations(null);
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
                        <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4 }}> 
                            <EmployeeInformation employee={employee} imagePath={imagePath}/>
                            <EmployeeBenefits userName={user}/>
                            <EmployeeAllowances userName={user}/>
                            <EmployeeIncentives userName={user}/>
                            <EmployeeDeductions userName={user} headers={headers} />
                        </Grid>

                        <Grid size={{ xs: 8, sm: 8, md: 8, lg: 8 }}>
                            <EmployeeSummary employee={employee}/>
                            <EmploymentDetails employee={employee}/>
                            <EmployeeEducationBackground education={educations}/>
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
