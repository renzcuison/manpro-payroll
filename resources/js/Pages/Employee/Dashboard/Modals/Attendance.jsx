import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";
import { AccessTime } from "@mui/icons-material";

const Attendance = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    //--------------------- Work Shift API
    const [workShift, setWorkShift] = useState([]);
    const [workHour, setWorkHour] = useState([]);
    useEffect(() => {
        axiosInstance
            .get(`/workshedule/getWorkShift`, { headers })
            .then((response) => {
                console.log(response.data);
                setWorkShift(response.data.workShift);
                setWorkHour(response.data.workHours);
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }, []);

    //---------------------- Attendance API
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    useEffect(() => {
        axiosInstance
            .get(`attendance/getEmployeeLatestAttendance`, { headers })
            .then((response) => {
                console.log(response.data);
                setEmployeeAttendance(response.data.latest_attendance);
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }, []);

    //---------------------- Date and Time
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const formattedDate = currentDateTime.toDateString();
    const formattedTime = currentDateTime.toLocaleTimeString();
    const formattedDateTime = currentDateTime.toString();
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // button states
    {
        /*const [regularTimeIn, setRegularTimeIn] = useState(null);
    const [regularTimeOut, setRegularTimeOut] = useState(null);

    const [splitFirstTimeIn, setSplitFirstTimeIn] = useState(null);
    const [splitFirstTimeOut, setSplitFirstTimeOut] = useState(null);
    const [splitSecondTimeIn, setSplitSecondTimeIn] = useState(null);
    const [splitSecondTimeOut, setSplitSecondTimeOut] = useState(null);

    const [overTimeIn, setOverTimeIn] = useState(null);
    const [overTimeOut, setOverTimeOut] = useState(null);

    const handleTimeOutError = () => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Invalid Action",
            text: "You have to Time In first!",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#177604",
        });
    }; */
    }

    // ---------------------- Time In/Out
    const handleTimeInOut = (shift, timeIn) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: `${timeIn ? "Time in" : "Time out"}`,
            text: `Are you sure you want to ${
                timeIn ? "time in" : "time out"
            }?`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: `${timeIn ? "Time in" : "Time out"}`,
            confirmButtonColor: `${timeIn ? "#177604" : "#f44336"}`,
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                console.log(formattedDateTime);
                const data = {
                    datetime: formattedDateTime,
                    action: `${timeIn ? "Duty In" : "Duty Out"}`,
                };
                axiosInstance
                    .post("/attendance/saveEmployeeAttendance", data, {
                        headers,
                    })
                    .then((response) => {})
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }
        });
    };

    // ----------------------- Modal Rendering
    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: "5px",
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: "400px",
                        maxWidth: "450px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, paddingBottom: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{ marginLeft: 2, fontWeight: "bold" }}
                        >
                            {" "}
                            Attendance{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 4, paddingBottom: 1 }}>
                    <Grid
                        container
                        direction="column"
                        sx={{
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                        }}
                    >
                        {/*Current Date and Time-------------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={5}>
                                <Typography sx={{ fontWeight: "regular" }}>
                                    Date/Time:
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "right",
                                    }}
                                >
                                    {formattedDate + ", " + formattedTime}
                                </Typography>
                            </Grid>
                        </Grid>
                        {/*Regular Shift-------------------------------*/}
                        {workShift.shift_type == "Regular" ? (
                            <Grid
                                container
                                direction="row"
                                alignItems="flex-start"
                                sx={{ my: 1 }}
                            >
                                <Grid item xs={4}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        Attendance
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: "#177604" }}
                                        startIcon={<AccessTime />}
                                        onClick={() =>
                                            handleTimeInOut("Regular", true)
                                        }
                                    >
                                        Time In
                                    </Button>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<AccessTime />}
                                        onClick={() =>
                                            handleTimeInOut("Regular", false)
                                        }
                                    >
                                        Time Out
                                    </Button>
                                </Grid>
                            </Grid>
                        ) : (
                            /*Split-First Shift---------------------------*/
                            <Grid
                                container
                                direction="row"
                                alignItems="flex-start"
                                sx={{ my: 1 }}
                            >
                                <Grid item xs={4}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        {workShift.first_label}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: "#177604" }}
                                        startIcon={<AccessTime />}
                                        onClick={() =>
                                            handleTimeInOut("First", true)
                                        }
                                    >
                                        Time In
                                    </Button>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<AccessTime />}
                                        onClick={() =>
                                            handleTimeInOut("First", false)
                                        }
                                    >
                                        Time Out
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                        {/*Split Second Shift--------------------------*/}
                        {workShift.shift_type == "Split" ? (
                            <Grid
                                container
                                direction="row"
                                alignItems="flex-start"
                                sx={{ my: 1 }}
                            >
                                <Grid item xs={4}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        {workShift.second_label}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: "#177604" }}
                                        startIcon={<AccessTime />}
                                        onClick={() =>
                                            handleTimeInOut("Second", true)
                                        }
                                    >
                                        Time In
                                    </Button>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<AccessTime />}
                                        onClick={() =>
                                            handleTimeInOut("Second", false)
                                        }
                                    >
                                        Time Out
                                    </Button>
                                </Grid>
                            </Grid>
                        ) : null}

                        {/*Overtime Shift------------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={4}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    Overtime
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: "#177604" }}
                                    startIcon={<AccessTime />}
                                    onClick={() =>
                                        handleTimeInOut("Overtime", true)
                                    }
                                >
                                    Time In
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<AccessTime />}
                                    onClick={() =>
                                        handleTimeInOut("Overtime", true)
                                    }
                                >
                                    Time Out
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/*Attendance Logs------------------------------*/}
                    {/*
                    <Grid
                        container
                        direction="column"
                        sx={{
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            borderTop: "1px solid #e0e0e0",
                            mt: 2,
                            pt: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: "medium", mb: 1 }}
                        >
                            Attendance Logs
                        </Typography>

                        {attendanceLogs.length > 0 ? (
                            attendanceLogs.map((log, index) => (
                                <Grid
                                    key={index}
                                    container
                                    direction="row"
                                    alignItems="center"
                                    sx={{ my: 1 }}
                                >
                                    <Grid item xs={6}>
                                        <Typography>
                                            {log.type === "IN"
                                                ? "Time In"
                                                : "Time Out"}
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        sx={{ textAlign: "right" }}
                                    >
                                        <Typography>
                                            {log.time || "N/A"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ))
                        ) : (
                            <Typography sx={{ color: "text.secondary", m: 1 }}>
                                -- no attendance logs for this shift --
                            </Typography>
                        )}
                    </Grid>
                     */}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Attendance;
