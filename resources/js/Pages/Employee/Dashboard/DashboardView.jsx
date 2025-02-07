import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import "../../../../../resources/css/calendar.css";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    CircularProgress,
    Grid,
    TableHead,
} from "@mui/material";
import { AccessTime, CheckCircle, Info } from "@mui/icons-material";
import PageHead from "../../../components/Table/PageHead";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";
import Swal from "sweetalert2";
import { useMediaQuery } from "@mui/material";
import dayjs from "dayjs";

import Attendance from "../Dashboard/Modals/Attendance";

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20))
        .fill("")
        .map((v, idx) => now - idx);
};

const isToday = (someDate) => {
    const today = new Date();
    return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
    );
};

const Dashboard = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
    const [isApplicationLoading, setIsApplicationLoading] = useState(false);

    const [openAttedanceModal, setOpenAttendanceModal] = useState(false);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // const formattedDateTime = currentDateTime.toLocaleString();
    const formattedDateTime = currentDateTime.toLocaleTimeString();


    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        axiosInstance.get('/attendance/getEmployeeDashboardAttendance', { headers })
            .then((response) => {
                setRecentAttendances(response.data.attendances);
                setIsAttendanceLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching attendances:', error);
                setIsAttendanceLoading(false);
            });
    }, [openAttedanceModal]);

    useEffect(() => {
        axiosInstance.get('/applications/getDashboardApplications', { headers })
            .then((response) => {
                setRecentApplications(response.data.applications);
                setIsApplicationLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching applications:', error);
                setIsApplicationLoading(false);
            });
    }, []);

    const handleOpenAttendanceModal = () => {
        setOpenAttendanceModal(true);
    };

    const handleCloseAttendanceModal = () => {
        setOpenAttendanceModal(false);
    };



    return (
        <Layout>
            <Box sx={{
                overflowX: "scroll",
                width: "100%",
                whiteSpace: "nowrap",
            }}>
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
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Dashboard</Typography>
                        <Typography variant="h5"
                            sx={{
                                marginLeft: 2,
                                paddingTop: 1,
                                flexGrow: 1,
                                textAlign: "right",
                                color: "#777777"
                            }}>
                            {" "}{formattedDateTime}{" "}
                        </Typography>
                    </Box>

                    {/* Header Content */}
                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        <Grid item xs={12} lg={4}>
                            <Box sx={{
                                backgroundColor: "white",
                                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                padding: 4,
                                borderRadius: "16px"
                            }}>
                                <Link onClick={handleOpenAttendanceModal}
                                    sx={{
                                        color: "#777777",
                                        textDecoration: "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%"
                                    }}>
                                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: "#2a800f",
                                            borderRadius: "50%",
                                            width: { xs: 40, sm: 50 },
                                            height: { xs: 40, sm: 50 },
                                        }}>
                                            <AccessTime sx={{ color: "white", fontSize: 30 }} />
                                        </Box>
                                        <Typography variant="h5"
                                            sx={{
                                                marginLeft: 2,
                                                paddingTop: 1,
                                                flexGrow: 1,
                                                textAlign: "right",
                                                color: "#777777",
                                            }}>
                                            {" "}Time In/Out{" "}
                                        </Typography>
                                    </Box>
                                </Link>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Box sx={{
                                backgroundColor: "white",
                                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                padding: 4,
                                borderRadius: "16px",
                            }}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                }}>
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: "#2a800f",
                                        borderRadius: "50%",
                                        width: { xs: 40, sm: 50 },
                                        height: { xs: 40, sm: 50 },
                                    }}>
                                        <CheckCircle sx={{
                                            color: "white",
                                            fontSize: 30,
                                        }} />
                                    </Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            marginLeft: 2,
                                            paddingTop: 1,
                                            flexGrow: 1,
                                            textAlign: "right",
                                            color: "#777777",
                                        }}>
                                        {" "}Announcements{" "}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Box sx={{
                                backgroundColor: "white",
                                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                padding: 4,
                                borderRadius: "16px",
                            }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: "#2a800f",
                                            borderRadius: "50%",
                                            width: { xs: 40, sm: 50 },
                                            height: { xs: 40, sm: 50 },
                                        }}>
                                        <Info
                                            sx={{
                                                color: "white",
                                                fontSize: 30,
                                            }} />
                                    </Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            marginLeft: 2,
                                            paddingTop: 1,
                                            flexGrow: 1,
                                            textAlign: "right",
                                            color: "#777777",
                                        }}>
                                        {" "}Trainings{" "}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid container direction="row" spacing={4} sx={{ mt: 1 }}>
                        {/* Attendance Table */}
                        <Grid item xs={12} lg={8}>
                            <Box sx={{
                                backgroundColor: "white",
                                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                padding: 2,
                                borderRadius: "16px",
                            }}>
                                <div style={{ marginLeft: 10 }}>
                                    <Box component={"div"} className="d-flex justify-content-between">
                                        <div className="font-size-h5 font-w600"
                                            style={{
                                                marginTop: 12,
                                                marginBottom: 10,
                                            }}
                                        >
                                            {" "}Your Attendance{" "}
                                        </div>
                                    </Box>

                                    <div
                                        style={{
                                            height: "560px",
                                            overflow: "auto",
                                        }}>
                                        {isAttendanceLoading ? (
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                minHeight: "200px",
                                            }}>
                                                <CircularProgress />
                                            </div>
                                        ) : (
                                            <TableContainer>
                                                <Table className="table table-md table-striped table-vcenter">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="center">Date</TableCell>
                                                            <TableCell align="center">Time In</TableCell>
                                                            <TableCell align="center">Time Out</TableCell>
                                                            <TableCell align="center">Overtime In</TableCell>
                                                            <TableCell align="center">Overtime Out</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {recentAttendances.length > 0 ? (recentAttendances.map((attendance, index) => (

                                                            <TableRow key={index} sx={{
                                                                backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff"
                                                            }}>
                                                                <TableCell align="center">
                                                                    {dayjs(
                                                                        attendance.date
                                                                    ).format(
                                                                        "MMMM D, YYYY"
                                                                    )}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attendance.time_in
                                                                        ? dayjs(attendance.time_in).format("hh:mm:ss A")
                                                                        : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attendance.time_out
                                                                        ? dayjs(attendance.time_out).format("hh:mm:ss A")
                                                                        : attendance.time_in ? "Failed to Time Out"
                                                                            : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attendance.overtime_in
                                                                        ? dayjs(attendance.overtime_in).format("hh:mm:ss A")
                                                                        : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attendance.overtime_out
                                                                        ? dayjs(attendance.overtime_out).format("hh:mm:ss A")
                                                                        : "-"}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))) :
                                                            <TableRow>
                                                                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1, }}>
                                                                    No Attendance Found
                                                                </TableCell>
                                                            </TableRow>}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </div>
                                </div>
                            </Box>
                        </Grid>
                        {/* Applications Table */}
                        <Grid item xs={12} lg={4}>
                            <Box sx={{
                                backgroundColor: "white",
                                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                padding: 2,
                                borderRadius: "16px",
                            }}>
                                <div style={{ marginLeft: 10 }}>
                                    <Box component={"div"} className="d-flex justify-content-between">
                                        <div className="font-size-h5 font-w600"
                                            style={{
                                                marginTop: 12,
                                                marginBottom: 10,
                                            }}
                                        >
                                            {" "}Your Applications{" "}
                                        </div>
                                    </Box>

                                    <div
                                        style={{
                                            height: "560px",
                                            overflow: "auto",
                                        }}>
                                        {isApplicationLoading ? (
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                minHeight: "200px",
                                            }}>
                                                <CircularProgress />
                                            </div>
                                        ) : (
                                            <TableContainer>
                                                <Table className="table table-md table-striped table-vcenter">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="center">Application</TableCell>
                                                            <TableCell align="center">Status</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {recentApplications.length > 0 ? (recentApplications.map((application, index) => (

                                                            <TableRow key={index} sx={{
                                                                backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff"
                                                            }}>
                                                                <TableCell align="center">
                                                                    {application.app_type || "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight:
                                                                                "bold",
                                                                            color:
                                                                                application.app_status === "Approved"
                                                                                    ? "#177604"
                                                                                    : application.app_status === "Declined"
                                                                                        ? "#f44336"
                                                                                        : application.app_status === "Pending"
                                                                                            ? "#e9ae20"
                                                                                            : application.app_status === "Withdrawn"
                                                                                                ? "#f57c00"
                                                                                                : "#000000",
                                                                        }}>
                                                                        {application.app_status || "-"}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))) :
                                                            <TableRow>
                                                                <TableCell colSpan={2} align="center" sx={{ color: "text.secondary", p: 1, }}>
                                                                    No Applications Found
                                                                </TableCell>
                                                            </TableRow>}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </div>
                                </div>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {openAttedanceModal && (
                    <Attendance
                        open={openAttedanceModal}
                        close={handleCloseAttendanceModal}
                    // employee={employee} onUpdateEmployee={getEmployeeDetails}
                    />
                )}
            </Box>
        </Layout>
    );
};

export default Dashboard;
