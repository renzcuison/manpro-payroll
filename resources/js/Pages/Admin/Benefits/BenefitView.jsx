import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import EmploymentDetailsEdit from '../Employees/Modals/EmploymentDetailsEdit';

const BenefitView = () => {
    const { benefit } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState(''); 

    const [openEmploymentDetailsEditModal, setOpenEmploymentDetailsEditModal] = useState(false);
    const [openEmploymentBenefitsEditModal, setOpenEmploymentBenefitsEditModal] = useState(false);

    useEffect(() => {
        console.log("BenefitView");
        console.log("Benefit: " + benefit);
        // getEmployeeDetails();
    }, []);

    // const getEmployeeDetails = () => {
        
    // };
    
    const [activeTab, setActiveTab] = useState('1');

    const handleTabChange = (event, newActiveTab) => {
      setActiveTab(newActiveTab);
    };

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleCloseActions = () => {
        setAnchorEl(null);
    };
    
    return (
        <Layout title={"EmployeeView"}>
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
                </Box>
            </Box>
        </Layout >
    )
}

export default BenefitView
