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
    const [recentApplication, setRecentApplication] = useState([]);
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
    const [isApplicationLoading, setIsApplicationLoading] = useState(false);

    const [openAttedanceModal, setOpenAttendanceModal] = useState(false);

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - recentAttendances.length)
            : 0;
    // const formattedDateTime = currentDateTime.toLocaleString();
    const formattedDateTime = currentDateTime.toLocaleTimeString();

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        axiosInstance.get('/attendance/getEmployeeDashboardAttendance', { headers })
            .then((response) => {
                console.log("attendance data:");
                console.log(response.data);
                setRecentAttendances(response.data.attendances);
                setIsAttendanceLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching attendances:', error);
                setIsAttendanceLoading(false);
            });
    }, [openAttedanceModal]);

    const handleRowClick = (path) => {
        navigate(path);
    };

    const handleOpenAttendanceModal = () => {
        setOpenAttendanceModal(true);
    };

    const handleCloseAttendanceModal = () => {
        setOpenAttendanceModal(false);
    };



    return (
        <Layout>
            <Box
                sx={{
                    overflowX: "scroll",
                    width: "100%",
                    whiteSpace: "nowrap",
                }}
            >
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
                                <Link
                                    to="/member/announcements"
                                    sx={{
                                        color: "#777777",
                                        textDecoration: "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
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
                                <Link
                                    to="/member/trainings"
                                    sx={{
                                        color: "#777777",
                                        textDecoration: "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
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
                                </Link>
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid container spacing={4} sx={{ mt: 1 }}>
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
                                        {isAttendanceLoading &&
                                            isApplicationLoading ? (
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
                                                            <TableCell align="center" sx={{ width: "20%" }}>Date</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Time In</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Time Out</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Overtime In</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Overtime Out</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        { }
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </div>
                                </div>
                            </Box>
                        </Grid>


                    </Grid>

                    <Grid container spacing={4} sx={{ mt: 1 }}>
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
                                            {" "}Your Applications{" "}
                                        </div>
                                    </Box>

                                    <div
                                        style={{
                                            height: "560px",
                                            overflow: "auto",
                                        }}>
                                        {isAttendanceLoading &&
                                            isApplicationLoading ? (
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
                                                            <TableCell align="center" sx={{ width: "20%" }}>Date</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Time In</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Time Out</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Overtime In</TableCell>
                                                            <TableCell align="center" sx={{ width: "20%" }}>Overtime Out</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        { }
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
