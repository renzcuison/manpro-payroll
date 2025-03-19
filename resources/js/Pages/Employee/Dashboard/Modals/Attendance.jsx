import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import AttendanceButton from "./Components/AttendanceButton";
import Swal from "sweetalert2";
import moment from "moment";
import { AccessTime } from "@mui/icons-material";
import dayjs from "dayjs";
import AttendanceTable from "./Components/AttendanceTable";

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
    const [latestAction, setLatestAction] = useState('');

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
                    setLatestAction(latestAttendance.action);
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
            const momentTime = moment(
                latestAttendanceTime,
                "YYYY-MM-DD HH:mm:ss"
            );
            const timePart = momentTime.format("HH:mm:ss");
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
        if (shift == "Second" && (!firstShiftExpired || (onDuty && latestTime < workHour.first_time_out))) {
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
                text: `Are you sure you want to ${timeIn ? "time in" : "time out"
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
                        action: `${shift == "Overtime"
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
                        title: `${timeIn ? "Timed In" : "Timed Out"
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
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}Attendance{" "}
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
                                <Typography sx={{ fontWeight: "bold", textAlign: { xs: "left", sm: "right" }, }}>
                                    {formattedDate}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                Time:
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <Typography
                                    sx={{ fontWeight: "bold", textAlign: { xs: "left", sm: "right" } }}>
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

                        {workShift.shift_type === "Regular" ? (
                            <>
                                {/* Regular Shift */}
                                {(!firstShiftExpired || (firstShiftExpired && onDuty && latestTime < workHour?.first_time_out)) && (
                                    <AttendanceButton
                                        label="Attendance"
                                        onDuty={onDuty}
                                        shiftType="Regular"
                                        onTimeInOut={handleTimeInOut}
                                    />
                                )}
                            </>
                        ) : null}

                        {workShift.shift_type === "Split" ? (
                            <>
                                {/* Top: First Shift, Bottom: Second Shift */}
                                {(!firstShiftExpired || (firstShiftExpired && onDuty && latestTime < workHour?.first_time_out)) ? (
                                    <AttendanceButton
                                        label={workShift.first_label}
                                        onDuty={onDuty}
                                        shiftType="First"
                                        onTimeInOut={handleTimeInOut}
                                    />
                                ) : (!secondShiftExpired || (secondShiftExpired && onDuty && latestTime < workHour?.second_time_out)) ? (
                                    <AttendanceButton
                                        label={workShift.second_label}
                                        onDuty={onDuty}
                                        shiftType="Second"
                                        onTimeInOut={handleTimeInOut}
                                    />
                                ) : null
                                }
                            </>
                        ) : null}

                        {/* Overtime and End of Day*/}
                        {((workShift?.shift_type == "Regular" && firstShiftExpired && !(onDuty && latestTime < workHour?.first_time_out))
                            || (workShift?.shift_type == "Split" && secondShiftExpired && !(onDuty && latestTime < workHour?.second_time_out))) ? (
                            firstDutyFinished ? (
                                (() => {
                                    if (exactTime < workHour?.over_time_in) {
                                        return (
                                            <Box sx={{ pt: 2, width: "100%", textAlign: "center", }} >
                                                Overtime Available at{" "}
                                                {dayjs(`2023-01-01 ${workHour.over_time_in}`).format("hh:mm:ss A")}
                                            </Box>
                                        );
                                    } else if (exactTime >= workHour?.over_time_in && exactTime <= workHour?.over_time_out) {
                                        return (
                                            <AttendanceButton
                                                label="Overtime"
                                                onDuty={onDuty}
                                                shiftType="Overtime"
                                                onTimeInOut={handleTimeInOut}
                                            />
                                        );
                                    } else {
                                        return (
                                            <Box sx={{ pt: 2, width: "100%", textAlign: "center", }} >
                                                Day has ended
                                            </Box>
                                        );
                                    }
                                })()
                            ) : (
                                <Box sx={{ pt: 2, width: "100%", textAlign: "center", }} >
                                    Day has ended
                                </Box>
                            )
                        ) : null}
                    </Grid>
                    {/*Attendance Logs------------------------------*/}
                    {employeeAttendance.length > 0 ? (
                        <>
                            <Divider sx={{ my: 1 }} />
                            <Box>
                                Today's Attendance:
                            </Box>
                            {(() => {
                                const timeToSeconds = (timeStr) => {
                                    if (!timeStr) return 0;
                                    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
                                    return hours * 3600 + minutes * 60 + seconds;
                                };

                                const firstTimeIn = timeToSeconds(workHour?.first_time_in);
                                const firstTimeOut = timeToSeconds(workHour?.first_time_out);
                                const secondTimeIn = timeToSeconds(workHour?.second_time_in);
                                const secondTimeOut = timeToSeconds(workHour?.second_time_out);
                                const overTimeIn = timeToSeconds(workHour?.over_time_in);
                                const overTimeOut = timeToSeconds(workHour?.over_time_out);

                                // Initialize log arrays
                                const regularLogs = [];
                                const splitFirstLogs = [];
                                const splitSecondLogs = [];
                                const overtimeLogs = [];

                                // Track the active session
                                let currentShift = null; // "First Shift", "Second Shift", or null
                                let inOvertimeSession = false;

                                employeeAttendance.forEach((log, index) => {
                                    const logTimeStr = log.timestamp.split(" ")[1];
                                    const logTime = timeToSeconds(logTimeStr);

                                    // Overtime Logs
                                    if (log.action === "Overtime In") {
                                        inOvertimeSession = true;
                                        overtimeLogs.push(log);
                                    } else if (log.action === "Overtime Out") {
                                        inOvertimeSession = false;
                                        overtimeLogs.push(log);
                                        return;
                                    } else if (inOvertimeSession) {
                                        overtimeLogs.push(log);
                                        return;
                                    }
                                    if (log.action.includes("Overtime")) return;

                                    // Regular Shifts
                                    if (workShift?.shift_type === "Regular") {
                                        regularLogs.push(log);
                                        return;
                                    }

                                    // Split Shifts
                                    if (workShift?.shift_type === "Split") {
                                        // Duty In Handling
                                        if (log.action === "Duty In") {
                                            if (logTime <= firstTimeOut) {
                                                currentShift = "First Shift";
                                                splitFirstLogs.push(log);
                                            } else if (logTime >= secondTimeIn || (logTime > firstTimeOut && logTime <= secondTimeOut)) {
                                                currentShift = "Second Shift";
                                                splitSecondLogs.push(log);
                                            }
                                        } else if (log.action === "Duty Out") {
                                            if (currentShift === "First Shift") {
                                                splitFirstLogs.push(log);
                                                currentShift = null;
                                            } else if (currentShift === "Second Shift") {
                                                splitSecondLogs.push(log);
                                                currentShift = null;
                                            }
                                        }
                                    }
                                });

                                return (
                                    <>
                                        {regularLogs.length > 0 && <AttendanceTable title="Attendance" logs={regularLogs} />}
                                        {splitFirstLogs.length > 0 && <AttendanceTable title={workShift.first_label} logs={splitFirstLogs} />}
                                        {splitSecondLogs.length > 0 && <AttendanceTable title={workShift.second_label} logs={splitSecondLogs} />}
                                        {overtimeLogs.length > 0 && <AttendanceTable title="Overtime" logs={overtimeLogs} />}
                                    </>
                                );
                            })()}
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
