import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Avatar,
    Button,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    IconButton,
    Stack,
    Divider,
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";

import ProfileEdit from "./Modals/ProfileEdit";
import { useUser } from "../../../hooks/useUser";
import CompanyDetails from "./CompanyDetails";
import EmploymentDetails from "./EmploymentDetails";
import PackageDetails from "./PackageDetails";
import PersonalDetails from "./PersonalDetails";
import { MoreVert } from "@mui/icons-material";
import EmployeeSummary from "./EmployeeSummary";

const EmployeeView = () => {
    const theme = useTheme();
    const medScreen = useMediaQuery(theme.breakpoints.up("md"));
    const { user, isLoading } = useUser();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [openProfileEditModal, setOpenProfileEditModal] = useState(false);

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
        <Layout title={"EmployeeView"}>
            <Box>
                <Box
                    sx={{
                        mt: 5,
                        display: "flex",
                        justifyContent: "space-between",
                        px: 1,
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Profile
                    </Typography>

                    <IconButton variant="contained" onClick={handleOpenActions}>
                        <MoreVert />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleCloseActions}
                    >
                        <MenuItem onClick={handleOpenProfileEditModal}>
                            {" "}
                            Edit Profile{" "}
                        </MenuItem>
                    </Menu>
                </Box>
                <Divider sx={{ borderStyle: "dashed", mt: 2, mb: 3 }} />
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {/* Profile card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PersonalDetails user={user} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={2}>
                            {user.user_type == "Employee" ? (
                                <EmployeeSummary user={user} />
                            ) : null}
                            {user.user_type == "Admin" ? (
                                <>
                                    <CompanyDetails company={user?.company} />
                                    <PackageDetails
                                        packageData={user?.company?.package}
                                    />
                                </>
                            ) : (
                                <EmploymentDetails user={user} />
                            )}
                        </Stack>
                    </Grid>
                </Grid>

                {openProfileEditModal && user && (
                    <ProfileEdit
                        open={openProfileEditModal}
                        close={handleCloseProfileEditModal}
                        employee={user}
                        avatar={user?.media?.[0]?.original_url}
                        medScreen={medScreen}
                    />
                )}
            </Box>
        </Layout>
    );
};

export default EmployeeView;
