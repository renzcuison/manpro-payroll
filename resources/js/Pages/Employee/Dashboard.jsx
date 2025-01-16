import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import "../../../../resources/css/calendar.css";
import { Table, TableBody, TableCell, TableContainer, TableRow, Box, Typography, CircularProgress, Grid } from "@mui/material";
import { AccessTime, CheckCircle, Info } from '@mui/icons-material';
import PageHead from "../../components/Table/PageHead";
import { getComparator, stableSort } from "../../components/utils/tableUtils";
import Swal from "sweetalert2";
import { useMediaQuery } from '@mui/material';

const headCells = [
    { id: " ", sortable: false, label: "Date" },
    { id: " ", sortable: false, label: "Time Arrived" },
    { id: " ", sortable: false, label: "Time Out" },
];

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20)).fill("").map((v, idx) => now - idx);
};

const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() && someDate.getMonth() === today.getMonth() && someDate.getFullYear() === today.getFullYear();
};

const Dashboard = () => {
    const [isDisabled, setIsDisabled] = useState(true);
    const [getTimeAttendance, setGetTimeAttendance] = useState([]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [recentApplication, setRecentApplication] = useState([]);
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
    const [isApplicationLoading, setIsApplicationLoading] = useState(false);

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - recentAttendances.length) : 0;
    // const formattedDateTime = currentDateTime.toLocaleString();
    const formattedDateTime = currentDateTime.toLocaleTimeString();

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    useEffect(() => {

        // axiosInstance.get(`/dashboard_recentMemberAttendance`, { headers }).then((response) => {
        //     setRecentAttendances(response.data.attendances);
        //     setIsAttendanceLoading(false);
        // });

        // axiosInstance.get(`/dashboard_recentMemberApplication`, { headers }).then((response) => {
        //     setRecentApplication(response.data.applications);
        //     setIsApplicationLoading(false);
        // });

        // axiosInstance.get('/get_time', { headers }).then((response) => {
        //     setGetTimeAttendance(response.data.attendance);
        //     setIsDisabled(false);
        // });
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const handleTimein = () => {
        new Swal({
            customClass: { container: "my-swal", },
            title: "Are you sure?",
            text: "Confirm Morning Time in?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');
                const end = moment(end).format('YYYY-MM-DD');
                const time_in = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeIn = start + " " + time_in;
                axiosInstance.post('/add_timein', {
                    timeIn: timeIn,
                    start: start,
                    end: end,
                    color: color,
                    add_time_in: 1
                }, { headers }).then((response) => {
                    Swal.fire({
                        customClass: { container: "my-swal", },
                        icon: 'success',
                        title: 'Successfully time in',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    const handleTimeout = () => {
        new Swal({
            customClass: { container: "my-swal", },
            title: "Are you sure?",
            text: "Confirm Morning Time out?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_out = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeOut = start + " " + time_out;
                axiosInstance.post('/add_timeout', {
                    timeOut: timeOut,
                    start: start,
                    end: end,
                    color: color,
                    morning_time_out: 1
                }, { headers }).then((response) => {
                    Swal.fire({
                        customClass: { container: "my-swal", },
                        icon: 'success',
                        title: 'Successfully time out',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    const handleTimeinAfternoon = () => {
        new Swal({
            customClass: { container: "my-swal", },
            title: "Are you sure?",
            text: "Confirm Afternoon Time in?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_in = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeIn = start + " " + time_in;
                axiosInstance.post('/add_timeinAfternoon', {
                    timeIn: timeIn,
                    start: start,
                    end: end,
                    color: color,
                    afternoon_time_in: 1
                }, { headers }).then((response) => {
                    Swal.fire({
                        customClass: { container: "my-swal", },
                        icon: 'success',
                        title: 'Successfully time in',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    const handleTimeoutAfternoon = () => {
        new Swal({
            customClass: { container: "my-swal", },
            title: "Are you sure?",
            text: "Confirm Afternoon Time out?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_out = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeOut = start + " " + time_out;
                axiosInstance.post('/add_timeoutAfternoon', {
                    timeOut: timeOut,
                    start: start,
                    end: end,
                    color: color,
                    afternoon_time_out: 1
                }, { headers }).then((response) => {
                    Swal.fire({
                        customClass: { container: "my-swal", },
                        icon: 'success',
                        title: 'Successfully time out',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    const handleRowClick = (path) => {
        navigate(path);
    };

    const checkAttendance = () => {
        console.log(isDisabled);

        if (isDisabled == false) {
            if (getTimeAttendance.length === 0) {
                handleTimein();
            } else {
                const attendance = getTimeAttendance[0];
        
                if ( attendance.morning_in !== null && attendance.morning_out === null ) {
                    handleTimeout();
                } else if ( attendance.morning_in !== null && attendance.morning_out !== null && attendance.afternoon_in === null ) {
                    handleTimeinAfternoon();
                } else if ( attendance.morning_in !== null && attendance.morning_out !== null && attendance.afternoon_in !== null  && attendance.afternoon_out === null  ) {
                    handleTimeoutAfternoon();
                }
            }
        }
    }

    return (
        <Layout>

            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}} >

                    <Box sx={{ mt: 5}}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        <Grid item xs={12} lg={4}>
                            <Box sx={{ backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', padding: 4, borderRadius: '16px' }}>
                                <Link onClick={checkAttendance} sx={{ color: '#777777', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a800f', borderRadius: '50%', width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 } }}>
                                            <AccessTime sx={{ color: 'white', fontSize: 30 }} />
                                        </Box>
                                        <Typography variant="h5" sx={{ marginLeft: 2, paddingTop: 1, flexGrow: 1, textAlign: 'right', color: '#777777' }}> {formattedDateTime} </Typography>
                                    </Box>
                                </Link>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Box sx={{ backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', padding: 4, borderRadius: '16px'}}>
                                <Link to="/member/announcements" sx={{ color: '#777777', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a800f', borderRadius: '50%', width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 } }}>
                                            <CheckCircle sx={{ color: 'white', fontSize: 30 }} />
                                        </Box>
                                        <Typography variant="h5" sx={{ marginLeft: 2, paddingTop: 1, flexGrow: 1, textAlign: 'right', color: '#777777' }}> Announcements </Typography>
                                    </Box>
                                </Link>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Box sx={{ backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', padding: 4, borderRadius: '16px'}}>
                                <Link to="/member/trainings" sx={{ color: '#777777', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a800f', borderRadius: '50%', width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 } }}>
                                            <Info sx={{ color: 'white', fontSize: 30 }} />
                                        </Box>
                                        <Typography variant="h5" sx={{ marginLeft: 2, paddingTop: 1, flexGrow: 1, textAlign: 'right', color: '#777777' }}> Trainings </Typography>
                                    </Box>
                                </Link>
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid container spacing={4}>
                        <Grid item xs={12} lg={8}>
                            <Box sx={{ backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', padding: 2, borderRadius: '16px'}}>
                                <div style={{ marginLeft: 10 }}>
                                    <Box component={"div"} className="d-flex justify-content-between" >
                                        <div className="font-size-h5 font-w600" style={{ marginTop: 12, marginBottom: 10, }} > Your Attendance </div>
                                    </Box>

                                    <div style={{ height: "560px", overflow: "auto" }}>
                                        {isAttendanceLoading && isApplicationLoading ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                <CircularProgress />
                                            </div>
                                        ) : (
                                            <TableContainer>
                                                <Table className="table table-md table-striped table-vcenter">
                                                    <PageHead order={order} orderBy={orderBy} onRequestSort={ handleRequestSort } headCells={headCells} />
                                                    <TableBody sx={{ cursor: "pointer" }} >
                                                        {recentAttendances.length !=
                                                            0 ? (
                                                            stableSort(
                                                                recentAttendances,
                                                                getComparator( order, orderBy )
                                                            )
                                                                .slice( page * rowsPerPage, page * rowsPerPage + rowsPerPage )
                                                                .map(
                                                                    ( attendance, index ) => {
                                                                        return (
                                                                            <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleRowClick(`/member/member-attendance`)} >
                                                                                <TableCell>
                                                                                    {new Date(attendance.start_date).toLocaleDateString()}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <div className="d-flex justify-content-end">
                                                                                        <Typography variant="subtitle2" className="p-1 ml-2 text-center text-white rounded-lg" style={{ backgroundColor: "#2a800f", }} >
                                                                                            {moment( attendance.morning_in ).format( "hh:mm a" )}
                                                                                        </Typography>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <div className="d-flex justify-content-start">
                                                                                        {" "}
                                                                                        {attendance.afternoon_out ? (
                                                                                            <Typography variant="subtitle2" className="p-1 px-2 ml-2 text-center text-white rounded-lg" style={{ backgroundColor: "#2a800f", }} > {moment( attendance.afternoon_out ).format( "hh:mm a" )} </Typography>
                                                                                        ) : isToday(new Date(attendance.start_date)) ? (
                                                                                            <Typography variant="subtitle2" className="p-1 px-2 ml-2 text-center text-white rounded-lg" style={{ backgroundColor: "#e9ab13" }} > Ongoing.. </Typography>
                                                                                        ) : (
                                                                                            <Typography variant="subtitle2" className="p-1 px-2 ml-2 text-center text-white rounded-lg" style={{ backgroundColor: "#e24e45" }} > Failed to Timeout </Typography>
                                                                                        )}
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    }
                                                                )
                                                        ) : (
                                                            <TableRow hover role="checkbox" tabIndex={-1} >
                                                                <TableCell colSpan={4}>
                                                                    {" "}
                                                                    {"No Data Found"}
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                        {emptyRows > 0 && (
                                                            <TableRow style={{ height: 53 * emptyRows, }} >
                                                                <TableCell colSpan={6} />
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </div>
                                </div>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Box sx={{ backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', padding: 2, borderRadius: '16px'}}>
                                <div style={{ marginLeft: 10 }}>
                                    <div className="font-size-h5 font-w600" style={{ paddingTop: 5, marginBottom: 10, }} > New Applications </div>
                                    <div style={{ height: "560px", overflow: "auto", }} >
                                        {isAttendanceLoading && isApplicationLoading ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                <CircularProgress />
                                            </div>
                                        ) : (
                                            <TableContainer>
                                                <Table className="table table-md table-striped table-vcenter">
                                                    <TableBody sx={{ cursor: "pointer" }} >
                                                        {recentApplication.length != 0 ? (
                                                            recentApplication.map(
                                                                ( application, index ) => {
                                                                    return (
                                                                        <TableRow key={ index } hover role="checkbox" tabIndex={ -1 } >
                                                                            <TableCell> { application.leave_type } </TableCell>
                                                                            <TableCell>
                                                                                <Typography  variant="subtitle2"  className="p-1 ml-2 text-center text-white rounded-lg"  style={{ backgroundColor: application.AppColor }} >
                                                                                    { application.AppStatus }
                                                                                </Typography>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                }
                                                            )
                                                        ) : (
                                                            <TableRow hover role="checkbox" tabIndex={-1} >
                                                                <TableCell colSpan={3} >
                                                                    {" "}
                                                                    { "No Data Found" }
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
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
            </Box>

        </Layout>
    );
};

export default Dashboard;
