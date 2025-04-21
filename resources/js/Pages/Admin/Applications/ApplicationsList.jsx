import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, CircularProgress, Chip, Avatar } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import ApplicationManage from "./Modals/ApplicationManage";

const ApplicationsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    // Application List
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = () => {
        axiosInstance.get("/applications/getApplications", { headers })
            .then((response) => {
                const applicationData = response.data.applications;
                setApplications(applicationData);
                getAvatars(applicationData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching applications:", error);
                setIsLoading(false);
            });
    };

    // Application Details
    const [openApplicationManage, setOpenApplicationManage] = useState(null);
    const handleOpenApplicationManage = (appId) => {
        setOpenApplicationManage(appId);
    };
    const handleCloseApplicationManage = () => {
        setOpenApplicationManage(null);
        fetchApplications();
    };

    // Employee Avatars
    const [blobMap, setBlobMap] = useState({});

    const getAvatars = (applicationData) => {
        const userNames = applicationData.map((application) => application.emp_user_name);
        if (userNames.length === 0) return;

        axiosInstance.post(`adminDashboard/getEmployeeAvatars`, { user_list: userNames, type: 2 }, { headers })
            .then((avatarResponse) => {
                const avatars = avatarResponse.data.avatars || {};
                setBlobMap((prev) => {
                    // Old blob cleanup
                    Object.values(prev).forEach((url) => {
                        if (url.startsWith('blob:')) {
                            URL.revokeObjectURL(url);
                        }
                    });
                    // New blobs
                    const newBlobMap = {};
                    Object.entries(avatars).forEach(([user_name, data]) => {
                        if (data.avatar && data.avatar_mime) {
                            const byteCharacters = atob(data.avatar);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: data.avatar_mime });
                            newBlobMap[user_name] = URL.createObjectURL(blob);
                        }
                    });
                    return newBlobMap;
                });
            })
            .catch((error) => {
                console.error('Error fetching avatars:', error);
            });
    };

    const renderProfile = (uName) => {
        if (blobMap[uName]) {
            return blobMap[uName];
        }
        return "../../../images/avatarpic.jpg";
    };

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [blobMap]);


    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap", }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}Applications{" "}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {" "}
                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }} >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "18%" }}> Employee </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}> Application Type </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}> Start Date/Time </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}> End Date/Time </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}> Date of Application </TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}> Status </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>{
                                            applications.length > 0 ? (applications.map(
                                                (application, index) => {
                                                    const createDate = dayjs(application.app_date_requested).format("MMM D, YYYY h:mm A");
                                                    const startDate = dayjs(application.app_duration_start).format("MMM D, YYYY h:mm A");
                                                    const endDate = dayjs(application.app_duration_end).format("MMM D, YYYY h:mm A");

                                                    return (
                                                        <TableRow
                                                            key={application.app_id}
                                                            onClick={() => handleOpenApplicationManage(application.app_id)}
                                                            sx={{ p: 1, backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" }, }}
                                                        >
                                                            <TableCell align="left">
                                                                <Box display="flex" sx={{ alignItems: "center" }}>
                                                                    <Avatar alt={`${application.emp_first_name}_Avatar`} src={renderProfile(application.emp_user_name)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                    {application.emp_first_name}{" "}{application.emp_middle_name || ""}{" "}{application.emp_last_name}{" "}{application.emp_suffix || ""}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center">{application.app_type_name || "-"}</TableCell>
                                                            <TableCell align="center">{startDate || "-"}</TableCell>
                                                            <TableCell align="center">{endDate || "-"}</TableCell>
                                                            <TableCell align="center">{createDate || "-"}</TableCell>
                                                            <TableCell align="center">
                                                                {application.app_status ? (
                                                                    <Chip label={application.app_status}
                                                                        sx={{
                                                                            backgroundColor: application.app_status === "Approved" ? "#177604" : application.app_status === "Declined" ? "#f44336" : application.app_status === "Pending" ? "#e9ae20" : application.app_status === "Cancelled" ? "#f57c00" : "#000000",
                                                                            color: "#fff",
                                                                            fontWeight: "bold",
                                                                            borderRadius: "999px",
                                                                            px: 1.5,
                                                                            height: "24px",
                                                                            fontSize: "0.75rem"
                                                                        }}
                                                                    />
                                                                ) : ("-")}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )) : <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}> No Applications Found </TableCell>
                                            </TableRow>}

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {openApplicationManage && (
                <ApplicationManage open={true} close={handleCloseApplicationManage} appId={openApplicationManage} />
            )}
        </Layout>
    );
};

export default ApplicationsList;
