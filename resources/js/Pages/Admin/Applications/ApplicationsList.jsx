import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";

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
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    // ---------------- Application List
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = () => {
        axiosInstance
            .get("/applications/getApplications", { headers })
            .then((response) => {
                setApplications(response.data.applications);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching applications:", error);
                setIsLoading(false);
            });
    };

    // ---------------- Application Details
    const [openApplicationManage, setOpenApplicationManage] = useState(null);
    const handleOpenApplicationManage = (appDetails) => {
        setOpenApplicationManage(appDetails);
    };
    const handleCloseApplicationManage = () => {
        setOpenApplicationManage(null);
        fetchApplications();
    };

    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap", }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
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
                            {" "}Applications{" "}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 200,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {" "}
                                <TableContainer
                                    style={{ overflowX: "auto" }}
                                    sx={{ minHeight: 400 }}
                                >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Employee
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Application Type
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Start Date/Time
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    End Date/Time
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Date of Application
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>{
                                            applications.length > 0 ? (applications.map(
                                                (application, index) => {
                                                    const createDate = dayjs(application.app_date_requested).format("MMM D, YYYY    h:mm A");

                                                    const startDate = dayjs(application.app_duration_start).format("MMM D, YYYY    h:mm A");

                                                    const endDate = dayjs(application.app_duration_end).format("MMM D, YYYY    h:mm A");

                                                    return (
                                                        <TableRow
                                                            key={application.app_id}
                                                            onClick={() => handleOpenApplicationManage(application)}
                                                            sx={{
                                                                p: 1,
                                                                backgroundColor:
                                                                    index % 2 === 0
                                                                        ? "#f8f8f8"
                                                                        : "#ffffff",
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        "rgba(0, 0, 0, 0.1)",
                                                                    cursor: "pointer",
                                                                },
                                                            }}
                                                        >
                                                            <TableCell align="left">
                                                                {" "}
                                                                {application.emp_first_name}{" "}
                                                                {application.emp_middle_name || ""}{" "}
                                                                {application.emp_last_name}{" "}
                                                                {application.emp_suffix || ""}{" "}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {application.app_type || "-"}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {startDate || "-"}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {endDate || "-"}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {createDate || "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )) : <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    align="center"
                                                    sx={{
                                                        color: "text.secondary",
                                                        p: 1,
                                                    }}
                                                >
                                                    No Applications Found
                                                </TableCell>
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
                <ApplicationManage
                    open={true}
                    close={handleCloseApplicationManage}
                    appDetails={openApplicationManage}
                />
            )}
        </Layout>
    );
};

export default ApplicationsList;
