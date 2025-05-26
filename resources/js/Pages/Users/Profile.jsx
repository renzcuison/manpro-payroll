import React, { useEffect, useState } from "react";
import {Box,Typography,Grid,Paper,Avatar,Button,Menu,MenuItem,useMediaQuery,useTheme,IconButton,Stack,Divider,
TableContainer,Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useUser } from "../../hooks/useUser";
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'



import UserSummary from "./Components/UserSummary";
import UserInformation from "./Components/UserInformation";
import UserEmploymentDetails from "./Components/UserEmploymentDetails";


import EmployeeHistory from "../Admin/Employees/Components/EmployeeHistory";
import EmployeeDeductions from "../Admin/Employees/Components/EmployeeDeductions";
import EmploymentDetails from "../Admin/Employees/Components/EmployeeDetails";
import ProfileBenefits from "./Profile/ProfileBenefits";
import ProfileEdit from "./Modals/ProfileEdit";

const Profile = () => {
    const theme = useTheme();
    const medScreen = useMediaQuery(theme.breakpoints.up("md"));
    const { user, isLoading } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [openProfileEditModal, setOpenProfileEditModal] = useState(false);

    //the sidebar toggle i guess
    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseActions = () => {
        setAnchorEl(null);
    };

    // Employee Profile
    const handleOpenProfileEditModal = () => {
        setOpenProfileEditModal(true);
    };
    const handleCloseProfileEditModal = (reload) => {
        setOpenProfileEditModal(false);
        if (reload) {
            getMyDetails();
        }
    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    return (
        <Layout title={"ProfileView"}>
            {/*<--Main Box-->*/}
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1500px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; User Profile
                        </Typography>
                        <Button variant="contained" color="primary" onClick={handleOpenActions}> Actions </Button>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions} >
                            <MenuItem onClick={handleOpenProfileEditModal}> Edit Profile </MenuItem>
                        </Menu>
                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        {/*<----Left side---->*/}
                        <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                            <UserInformation user={user}></UserInformation>
                            <ProfileBenefits userName={user.user_name} headers={headers}></ProfileBenefits>
                            <EmployeeDeductions userName={user.user_name} headers={headers}></EmployeeDeductions>
                        </Grid>
                        
                        {/*<---Right Side---->*/}
                        <Grid item size={{ xs: 8, sm: 8, md: 8, lg: 8 }}>
                            <UserSummary user={user}></UserSummary>
                            <UserEmploymentDetails user={user}></UserEmploymentDetails>
                        </Grid>    
                    </Grid>
                </Box>
            </Box>

            {openProfileEditModal &&
                <ProfileEdit open={openProfileEditModal} close={handleCloseProfileEditModal} employee={user} avatar={user?.media[0]?.original_url} medScreen={medScreen} />
            }
        </Layout>
    );
};

export default Profile;
