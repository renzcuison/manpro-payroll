import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import { useIncentives } from '../../../hooks/useIncentives';
import { useAllowances } from '../../../hooks/useAllowances';
import { useBenefits } from '../../../hooks/useBenefits';
import { useDeductions } from '../../../hooks/useDeductions';

import EmployeeDetailsEdit from '../../../Modals/Employees/EmployeeDetailsEdit';
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
    const {employeeBenefits} = useBenefits(user);
    const {employeeDeductions} = useDeductions(user);
    const {employeeIncentives} = useIncentives(user);
    const {employeeAllowances} = useAllowances(user);

    const benefits = employeeBenefits.data?.benefits || [];
    const deductions = employeeDeductions.data?.deductions || [];
    const incentives = employeeIncentives.data?.incentives || [];
    const allowances = employeeAllowances.data?.allowances || [];

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState('');
    const [educations, setEducations] = useState([]);
    const [imagePath, setImagePath] = useState('');

    const [openEmployeeDetailsEditModal, setOpenEmployeeDetailsEditModal] = useState(false);

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
            employeeAllowances.refetch();
            employeeBenefits.refetch();
            employeeIncentives.refetch();
            employeeDeductions.refetch();
            getEducationalBackground();
        }
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
                        </Menu>

                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 4, sm: 4, md: 4, lg: 4 }}> 
                            <EmployeeInformation employee={employee} imagePath={imagePath}/>
                            <EmployeeBenefits userName={user} benefits={benefits} onRefresh={employeeBenefits.refetch}/>
                            <EmployeeAllowances userName={user} allowances={allowances} onRefresh={employeeAllowances.refetch}/>
                            <EmployeeIncentives userName={user} incentives={incentives} onRefresh={employeeIncentives.refetch}/>
                            <EmployeeDeductions userName={user} deductions={deductions} onRefresh={employeeDeductions.refetch} />
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

            </Box>
        </Layout >
    )
}

export default EmployeeView
