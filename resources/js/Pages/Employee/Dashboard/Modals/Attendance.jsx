import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import AttendanceButtons from "./Components/AttendanceButtons";
import Swal from "sweetalert2";
import moment from "moment";
import { AccessTime } from "@mui/icons-material";
import dayjs from "dayjs";

const Attendance = ({ open, close }) => {
    //const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    //--------------------- Work Shift API
    const [workShift, setWorkShift] = useState([]);
    const [workHour, setWorkHour] = useState([]);
    const [firstShiftExpired, setFirstShiftExpired] = useState(false);
    const [secondShiftExpired, setSecondShiftExpired] = useState(false);

    useEffect(() => {
        axiosInstance
            .get(`/workshedule/getWorkShift`, { headers })
            .then((response) => {
                setWorkShift(response.data.workShift);
                setWorkHour(response.data.workHours);
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }, [refreshTrigger]);

    //--------------------- Work Shift Expiration Checks
    useEffect(() => {
        // Ends First Shift Period
        if (exactTime > workHour.first_time_out) {
            setFirstShiftExpired(true);
        }
        // End Second Shift Period for Split
        if (exactTime > workHour.second_time_out) {
            setSecondShiftExpired(true);
        }
    }, [workHour]);

    //---------------------- Attendance API
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [onDuty, setOnDuty] = useState(false);
    const [firstDutyFinished, setFirstDutyFinished] = useState(false);
    const [latestAttendanceTime, setlatestAttendanceTime] = useState();

    useEffect(() => {
        axiosInstance
            .get(`attendance/getEmployeeWorkDayAttendance`, {
                headers,
                params: { work_date: dayjs().format("YYYY-MM-DD") },
            })
            .then((response) => {
                setEmployeeAttendance(response.data.attendance);
                if (response.data.attendance.length > 0) {
                    // Check if a 'Duty Out' entry exists ---------------------------------
                    const dutyOutEntry = response.data.attendance.find(
                        (log) => log.action === "Duty Out"
                    );
                    if (dutyOutEntry) {
                        setFirstDutyFinished(true);
                    }
                    // Check the Latest Log Entry ----------------------------------------
                    const latestAttendance =
                        response.data.attendance[
                            response.data.attendance.length - 1
                        ];

                    if (
                        ["Duty In", "Overtime In"].includes(
                            latestAttendance.action
                        )
                    ) {
                        setOnDuty(true);
                    } else {
                        setOnDuty(false);
                    }

                    setlatestAttendanceTime(latestAttendance.timestamp);
                } else {
                    console.error("No attendance records found.");
                }
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }, [refreshTrigger]);

    //---------------------- Date and Time
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const formattedDate = currentDateTime.toDateString();
    const formattedTime = currentDateTime.toLocaleTimeString();
    const formattedDateTime = currentDateTime.toString();

    //--------------------- Exact Time
    const hours = String(currentDateTime.getHours()).padStart(2, "0");
    const minutes = String(currentDateTime.getMinutes()).padStart(2, "0");
    const seconds = String(currentDateTime.getSeconds()).padStart(2, "0");

    const exactTime = `${hours}:${minutes}:${seconds}`;

    //--------------------- Latest Attendance Time
    const [latestTime, setLatestTime] = useState();

    useEffect(() => {
        if (latestAttendanceTime) {
            // Parse the string into a moment object
            const momentTime = moment(
                latestAttendanceTime,
                "YYYY-MM-DD HH:mm:ss"
            );
            // Format the time to extract only the time part
            const timePart = momentTime.format("HH:mm:ss");
            // Set the extracted time to latestTime
            setLatestTime(timePart);
        }
    }, [latestAttendanceTime]);

    //--------------------- Time Interval (second)
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // ---------------------- Time In/Out
    const handleTimeInOut = (shift, timeIn) => {
        // The employee attempts to 'Time In' for the second shift when the first shift is still available --
        if (
            shift == "Second" &&
            (!firstShiftExpired ||
                (onDuty && latestTime < workHour.first_time_out))
        ) {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Invalid Action",
                text: "The Second Shift is not yet available.",
                icon: "warning",
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: "Okay",
                cancelButtonColor: "#177604",
            });

            // The employee attempts to 'Time Out' when they are not timed in yet -------------------------------
        } else if (!onDuty && !timeIn) {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Invalid Action",
                text: "You have to Time In first.",
                icon: "warning",
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: "Okay",
                cancelButtonColor: "#177604",
            });

            // The user makes a valid Time In/Out attempt -------------------------------------------------------
        } else {
            document.activeElement.blur();

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
                    const data = {
                        datetime: formattedDateTime,
                        action: `${
                            shift == "Overtime"
                                ? timeIn
                                    ? "Overtime In"
                                    : "Overtime Out"
                                : timeIn
                                ? "Duty In"
                                : "Duty Out"
                        }`,
                    };

                    axiosInstance
                        .post("/attendance/saveEmployeeAttendance", data, {
                            headers,
                        })
                        .then((response) => {
                            // Trigger refresh by toggling refreshTrigger
                            setRefreshTrigger((prev) => !prev);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });

                    document.activeElement.blur();

                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: `${
                            timeIn ? "Timed In" : "Timed Out"
                        } Successfully!`,
                        text: "Your attendance has been recorded",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    });
                }
            });
        }
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
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: "400px",
                        maxWidth: "450px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            {" "}
                            Attendance{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 2, paddingBottom: 3 }}>
                    <Grid
                        container
                        direction="column"
                        sx={{
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                        }}
                    >
                        <Grid
                            container
                            direction={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "flex-start", sm: "flex-start" }}
                            sx={{ pb: 1, borderBottom: "1px solid #e0e0e0" }}
                            rowSpacing={1}
                        >
                            <Grid item xs={12} sm={4}>
                                Date:
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: { xs: "left", sm: "right" },
                                    }}
                                >
                                    {formattedDate}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                Time:
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: { xs: "left", sm: "right" },
                                    }}
                                >
                                    {formattedTime}
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                Status:
                            </Grid>
                            <Grid item xs={5}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "right",
                                        color: onDuty ? "#177604" : "#f44336",
                                    }}
                                >
                                    {onDuty ? "On Duty" : "Off Duty"}
                                </Typography>
                            </Grid>
                        </Grid>

                        {/*Regular Shift-------------------------------*/}
                        {workShift.shift_type == "Regular" ? (
                            <AttendanceButtons
                                label="Attendance"
                                onTimeIn={handleTimeInOut}
                                onTimeOut={handleTimeInOut}
                                disableTimeIn={onDuty}
                                disableTimeOut={false}
                                shiftType="Regular"
                            />
                        ) : null}

                        {/*Split Shift--------------------------*/}
                        {workShift.shift_type == "Split" ? (
                            <>
                                {/*First Shift */}
                                <AttendanceButtons
                                    label={workShift.first_label}
                                    onTimeIn={handleTimeInOut}
                                    onTimeOut={handleTimeInOut}
                                    disableTimeIn={onDuty || firstShiftExpired}
                                    disableTimeOut={
                                        (!onDuty && firstShiftExpired) ||
                                        latestTime > workHour.first_time_out
                                    }
                                    shiftType="First"
                                />

                                {/*Second Shift */}
                                <AttendanceButtons
                                    label={workShift.second_label}
                                    onTimeIn={handleTimeInOut}
                                    onTimeOut={handleTimeInOut}
                                    disableTimeIn={
                                        (firstShiftExpired && onDuty) ||
                                        secondShiftExpired
                                    }
                                    disableTimeOut={
                                        (!onDuty && secondShiftExpired) ||
                                        latestTime > workHour.second_time_out
                                    }
                                    shiftType="Second"
                                />
                            </>
                        ) : null}

                        {/*Overtime Shift------------------------------*/}
                        {firstDutyFinished &&
                        ((workShift.shift_type == "Regular" &&
                            firstShiftExpired) ||
                            (workShift.shift_type == "Split" &&
                                secondShiftExpired)) ? (
                            <AttendanceButtons
                                label="Overtime"
                                onTimeIn={handleTimeInOut}
                                onTimeOut={handleTimeInOut}
                                disableTimeIn={onDuty}
                                disableTimeOut={false}
                                shiftType="Overtime"
                            />
                        ) : null}
                    </Grid>

                    {/*Attendance Logs------------------------------*/}
                    {employeeAttendance.length > 0 ? (
                        // If there are attendance records
                        <>
                            {/* Header Row */}
                            <Grid
                                container
                                direction="row"
                                alignItems="center"
                                sx={{
                                    mt: 2,
                                    p: 1,
                                    borderTop: "1px solid #e0e0e0",
                                    borderBottom: "1px solid #e0e0e0",
                                }}
                            >
                                <Grid item xs={6} align="center">
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        Action
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} align="center">
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        Timestamp
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                direction="column"
                                sx={{
                                    maxHeight: { xs: "150px", lg: "200px" },
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    flexWrap: "nowrap",
                                }}
                            >
                                {/* Attendance Records */}
                                {employeeAttendance.map((log, index) => (
                                    <Grid
                                        key={index}
                                        container
                                        direction="row"
                                        alignItems="center"
                                        sx={{
                                            p: 1,
                                            backgroundColor:
                                                index % 2 === 0
                                                    ? "#efefef"
                                                    : "#f8f8f8",
                                        }}
                                    >
                                        <Grid item xs={6} align="left">
                                            {log.action}
                                        </Grid>
                                        <Grid item xs={6} align="right">
                                            {log.timestamp}
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    ) : (
                        <Box
                            sx={{
                                mt: 2,
                                pt: 2,
                                borderTop: "1px solid #e0e0e0",
                                width: "100%",
                                textAlign: "center",
                            }}
                        >
                            No Attendance For Today
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Attendance;
