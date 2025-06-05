import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, MenuItem, TextField, Grid, Avatar, CircularProgress, Chip, } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import DateRangePicker from '../../../components/DateRangePicker';

import { useApplications } from "./hooks/useApplications";

import ApplicationManage from "./Modals/ApplicationManage";

const ApplicationsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const { data, isLoading, error, refetch } = useApplications();
    const applications = data?.applications || [];

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [searchName, setSearchName] = useState("");
    const [filterByStatus, setFilterByStatus] = useState("");
    const [filterByBranch, setFilterByBranch] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");

    const [rangeStartDate, setRangeStartDate] = useState(null);
    const [rangeEndDate, setRangeEndDate] = useState(null);

    useEffect(() => {
        axiosInstance.get("/settings/getDepartments", { headers })
            .then((response) => {
                const fetchedDepartments = response.data.departments;
                setDepartments(fetchedDepartments);
            }).catch((error) => {
                console.error("Error fetching departments:", error);
            });

        axiosInstance.get("/settings/getBranches", { headers })
            .then((response) => {
                const fetchedBranches = response.data.branches;
                setBranches(fetchedBranches);
            }).catch((error) => {
                console.error("Error fetching branches:", error);
            });
    }, []);


    const [openApplicationManage, setOpenApplicationManage] = useState(null);
    const handleOpenApplicationManage = (appId) => {
        setOpenApplicationManage(appId);
    };
    const handleCloseApplicationManage = () => {
        setOpenApplicationManage(null);
    };

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

    const filteredApplications = applications.filter((application) => {
        const fullName = application.emp_name?.toLowerCase() || "";
        const matchedName = fullName.includes(searchName.toLowerCase());

        const matchedBranch = filterByBranch === "" || application.emp_branch === filterByBranch;
        const matchedDepartment = filterByDepartment === "" || application.emp_department === filterByDepartment;
        const matchedStatus = filterByStatus === "" || application.app_status === filterByStatus;

        const appDate = dayjs(application.app_date_requested);
        const matchedDateRange = (!rangeStartDate || !rangeEndDate) || (appDate.isSameOrAfter(rangeStartDate, 'day') && appDate.isSameOrBefore(rangeEndDate, 'day'));

        return matchedName && matchedBranch && matchedDepartment && matchedStatus && matchedDateRange;
    });

    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap", }} >
                <Box sx={{ mx: "auto", width: "100%", maxWidth: "1500px" }}>

                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Applications</Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
                        <Grid container sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid container size={12} spacing={2}>
                                <Grid size={2}>
                                    <TextField sx={{ width: "100%" }} id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value) } />
                                </Grid>

                                <Grid size={2}></Grid>
                                
                                <Grid size={2}>
                                    <TextField select id="column-view-select" sx={{ width: "100%" }} label="Filter by Branch" value={filterByBranch} onChange={(event) => { setFilterByBranch( event.target.value ) }}>
                                        <MenuItem value="">All Branches</MenuItem>
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.id} value={branch.name}>{" "}{branch.name}{" "}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <TextField select id="column-view-select" sx={{ width: "100%" }} label="Filter by Department" value={filterByDepartment} onChange={(event) => { setFilterByDepartment( event.target.value ) }}>
                                        <MenuItem value="">All Departments</MenuItem>
                                        {departments.map((department) => (
                                            <MenuItem key={department.id} value={department.name} > {" "} {department.name}{" "} </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <TextField select id="column-view-select" sx={{ width: "100%" }} label="Filter by Status" value={filterByStatus} onChange={(event) => { setFilterByStatus( event.target.value ) }}>
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Declined">Declined</MenuItem>
                                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <DateRangePicker 
                                        label="Filter by Date of Applications"
                                        onRangeChange={(start, end) => {
                                            setRangeStartDate(start);
                                            setRangeEndDate(end);
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }} >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center"> Employee </TableCell>
                                                <TableCell align="center"> Branch </TableCell>
                                                <TableCell align="center"> Department </TableCell>
                                                <TableCell align="center"> Application Type </TableCell>
                                                <TableCell align="center"> Date of Application </TableCell>
                                                <TableCell align="center"> Duration </TableCell>
                                                <TableCell align="center"> Status </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredApplications.length > 0 ? (filteredApplications.map(
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
                                                                    <Avatar alt={`${application.emp_first_name}_Avatar`} src={renderProfile(application.emp_user_name)} sx={{ mr: 1, height: "36px", width: "36px" }} />{application.emp_name}
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell align="center">{application.emp_branch || "-"}</TableCell>
                                                            <TableCell align="center">{application.emp_department || "-"}</TableCell>

                                                            <TableCell align="center">{application.app_type_name || "-"}</TableCell>
                                                            <TableCell align="center">{createDate || "-"}</TableCell>
                                                            <TableCell align="center">{startDate || "-"} - {endDate || "-"}</TableCell>
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
                                                <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", p: 1 }}> No Applications Found </TableCell>
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
