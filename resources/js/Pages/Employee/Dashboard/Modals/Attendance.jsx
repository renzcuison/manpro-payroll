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
                //console.log(response.data);
                setWorkShift(response.data.workShift);
                setWorkHour(response.data.workHours);
            })
            .catch((error) => {
                // console.error("Error fetching employee:", error);
            });
    }, [refreshTrigger]);

    //--------------------- Work Shift Expiration Checks
    useEffect(() => {
        //console.log(exactTime);
        //console.log(workHour.first_time_out);
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
            .get(`attendance/getEmployeeWorkDayAttendance`, { headers })
            .then((response) => {
                // console.log(response.data);
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
                    if (latestAttendance.action == "Duty In") {
                        setOnDuty(true);
                    } else {
                        setOnDuty(false);
                    }
                    setlatestAttendanceTime(latestAttendance.timestamp);
                } else {
                    // console.log("No attendance records found.");
                }
            })
            .catch((error) => {
                // console.error("Error fetching employee:", error);
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
            //(title, text, icon, confButton, confButtonText, confButtonColor, cancelButton, cancelButtonText, cancelButtonColor)
            handleInvalidAction(
                "Invalid Action",
                "The Second Shift is not yet available.",
                "warning",
                true,
                "Okay",
                "#177604"
            );
            // The employee attempts to 'Time Out' when they are not timed in yet -------------------------------
        } else if (!onDuty && !timeIn) {
            handleInvalidAction(
                "Invalid Action",
                "You have to Time In first.",
                "warning",
                true,
                "Okay",
                "#177604"
            );
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
                    // console.log(formattedDateTime);
                    const data = {
                        datetime: formattedDateTime,
                        action: `${timeIn ? "Duty In" : "Duty Out"}`,
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

    const handleInvalidAction = (
        title,
        text,
        icon,
        cancelButton,
        cancelButtonText,
        cancelButtonColor
    ) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: title,
            text: text,
            icon: icon,
            showConfirmButton: false,
            showCancelButton: cancelButton,
            cancelButtonText: cancelButtonText,
            cancelButtonColor: cancelButtonColor,
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
                        padding: "1px",
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "400px" },
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
                            sx={{ marginLeft: 1, fontWeight: "bold" }}
                        >
                            {" "}
                            Attendance{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 4, paddingBottom: 5 }}>
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
                            direction={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "flex-start", sm: "flex-start" }}
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={12} sm={4}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "medium",
                                    }}
                                >
                                    Date:
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: { xs: "left", sm: "right" },
                                    }}
                                >
                                    {formattedDate}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "medium",
                                    }}
                                >
                                    Time:
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <Typography
                                    variant="h6" // Adjusts font size
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: { xs: "left", sm: "right" },
                                    }}
                                >
                                    {formattedTime}
                                </Typography>
                            </Grid>
                        </Grid>
                        {/*Current Duty Status-------------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1, borderBottom: "1px solid #e0e0e0" }}
                        >
                            <Grid item xs={7}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    Status:
                                </Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography
                                    variant="h6"
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
                                timeInLabel="Time In"
                                timeOutLabel="Time Out"
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
                                    timeInLabel="Time In"
                                    timeOutLabel="Time Out"
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
                                    timeInLabel="Time In"
                                    timeOutLabel="Time Out"
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
                                timeInLabel="Time In"
                                timeOutLabel="Time Out"
                                onTimeIn={handleTimeInOut}
                                onTimeOut={handleTimeInOut}
                                disableTimeIn={onDuty}
                                disableTimeOut={false}
                                shiftType="Overtime"
                            />
                        ) : null}
                    </Grid>
                    {/*Attendance Logs------------------------------*/}
                    <Grid
                        container
                        direction="column"
                        sx={{
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            borderTop: "1px solid #e0e0e0",
                            mt: 1,
                            pt: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: "medium", mb: 1 }}
                        >
                            Today's Attendance
                        </Typography>
                        <Grid
                            container
                            direction="column"
                            sx={{
                                maxHeight: {
                                    xs: "150px",
                                    lg: "200px",
                                },
                                overflowY: "auto",
                                overflowX: "hidden",
                                flexWrap: "nowrap",
                            }}
                        >
                            {employeeAttendance.length > 0 ? (
                                employeeAttendance.map((log, index) => (
                                    <Grid
                                        key={index}
                                        container
                                        direction="row"
                                        alignItems="center"
                                        sx={{
                                            p: 1,
                                            backgroundColor:
                                                index % 2 === 0
                                                    ? "#f5f5f5"
                                                    : "#e0e0e0",
                                        }}
                                    >
                                        <Grid item xs={6}>
                                            <Typography>
                                                {log.action}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={6}
                                            sx={{
                                                textAlign: "right",
                                            }}
                                        >
                                            <Typography>
                                                {log.timestamp}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ))
                            ) : (
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    sx={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "text.secondary",
                                            p: 1,
                                            textAlign: "center",
                                        }}
                                    >
                                        You have no attendance logs for this
                                        shift
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Attendance;
