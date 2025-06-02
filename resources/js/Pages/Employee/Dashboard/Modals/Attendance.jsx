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
    TableCell
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import AttendanceButton from "./Components/AttendanceButton";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";
import AttendanceTable from "./Components/AttendanceTable";
import { AccessTime } from "@mui/icons-material";

const Attendance = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Date and Time Management
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const formattedDate = currentDateTime.toDateString();
    const formattedTime = currentDateTime.toLocaleTimeString();
    const formattedDateTime = currentDateTime.toString();

    // Exact Time
    const hours = String(currentDateTime.getHours()).padStart(2, "0");
    const minutes = String(currentDateTime.getMinutes()).padStart(2, "0");
    const seconds = String(currentDateTime.getSeconds()).padStart(2, "0");
    const exactTime = `${hours}:${minutes}:${seconds}`;

    // Time Interval (second)
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Work Shift API and State
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [workShift, setWorkShift] = useState([]);
    const [workHour, setWorkHour] = useState([]);
    const [firstShiftExpired, setFirstShiftExpired] = useState(false);
    const [secondShiftExpired, setSecondShiftExpired] = useState(false);
    const [overtimeExpired, setOvertimeExpired] = useState(false);

    const [firstNightShift, setFirstNightShift] = useState(false);
    const [secondNightShift, setSecondNightShift] = useState(false);
    const [overtimeNightShift, setOvertimeNightShift] = useState(false);

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

    // Night Shift, Expiry Checks
    useEffect(() => {
        const currentDate = dayjs().format(`YYYY-MM-DD`);
        const currentTime = dayjs(`${currentDate} ${exactTime}`);

        if (workHour.first_time_in && workHour.first_time_out) {
            const firstIn = dayjs(`${currentDate} ${workHour.first_time_in}`);
            const firstOut = dayjs(`${currentDate} ${workHour.first_time_out}`);

            const isFirstNightShift = firstIn.isAfter(firstOut);
            setFirstNightShift(isFirstNightShift);

            if (isFirstNightShift) { // Night Shift Handling
                /*
                Night Shift Expiry Period
                - Current Time is after previous day's Shift Period (uses current day as shift passes through midnight), AND
                - Current Time is before the current day's shift starts + with 2 hour offset for Early Time-Ins
                 */
                const firstInOffset = firstIn.subtract(2, 'hour');
                setFirstShiftExpired(currentTime.isAfter(firstOut) && currentTime.isBefore(firstInOffset));
            } else { // Same Day Comparison
                setFirstShiftExpired(currentTime.isAfter(firstOut));
            }
        }

        if (workHour.second_time_in && workHour.second_time_out) {
            const secondIn = dayjs(`${currentDate} ${workHour.second_time_in}`);
            const secondOut = dayjs(`${currentDate} ${workHour.second_time_out}`);

            const isSecondNightShift = secondIn.isAfter(secondOut);
            setSecondNightShift(isSecondNightShift);

            if (isSecondNightShift) {
                const secondInOffset = secondIn.subtract(2, 'hour');
                setSecondShiftExpired(currentTime.isAfter(secondOut) && currentTime.isBefore(secondInOffset));
            } else {
                setSecondShiftExpired(currentTime.isAfter(secondOut));
            }
        }

        if (workHour.over_time_in && workHour.over_time_out) {
            const overtimeIn = dayjs(`${currentDate} ${workHour.over_time_in}`);
            const overtimeOut = dayjs(`${currentDate} ${workHour.over_time_out}`);

            const isOvertimeNightShift = overtimeIn.isAfter(overtimeOut);
            setOvertimeNightShift(isOvertimeNightShift);

            if (isOvertimeNightShift) {
                const overtimeInOffset = overtimeIn.subtract(2, 'hour');
                setOvertimeNightShift(currentTime.isAfter(overtimeOut) && currentTime.isBefore(overtimeInOffset));
            } else {
                setOvertimeNightShift(currentTime.isAfter(overtimeOut));
            }
        }

    }, [workHour, exactTime]);

    // Attendance API and State
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [onDuty, setOnDuty] = useState(false);
    const [firstDutyFinished, setFirstDutyFinished] = useState(false);
    const [latestAttendanceTime, setlatestAttendanceTime] = useState();
    const [latestAction, setLatestAction] = useState('');
    const [latestTime, setLatestTime] = useState();

    useEffect(() => {
        axiosInstance
            .get(`attendance/getEmployeeWorkDayAttendance`, {
                headers,
                params: { work_date: dayjs().format("YYYY-MM-DD") },
            })
            .then((response) => {
                setEmployeeAttendance(response.data.attendance);
                if (response.data.attendance.length > 0) {
                    // Check if a 'Duty Out' entry exists
                    const dutyOutEntry = response.data.attendance.find((log) => log.action === "Duty Out");
                    if (dutyOutEntry) {
                        setFirstDutyFinished(true);
                    }
                    // Check the Latest Log Entry
                    const latestAttendance = response.data.attendance[response.data.attendance.length - 1];

                    if (["Duty In", "Overtime In"].includes(latestAttendance.action)) {
                        setOnDuty(true);
                    } else {
                        setOnDuty(false);
                    }
                    setLatestAction(latestAttendance.action);
                    setlatestAttendanceTime(latestAttendance.timestamp);
                }
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }, [refreshTrigger]);

    // Latest Attendance Time Formatting
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

    // Time In/Out Handler
    const handleTimeInOut = (shift, timeIn) => {
        // The employee attempts to 'Time In' for the second shift when the first shift is still available
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
            // The employee attempts to 'Time Out' when they are not timed in yet
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
            // The user makes a valid Time In/Out attempt
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: `${timeIn ? "Time in" : "Time out"}`,
                text: `Are you sure you want to ${timeIn ? "time in" : "time out"}?`,
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
                        action: `${shift == "Overtime" ? timeIn ? "Overtime In" : "Overtime Out" : timeIn ? "Duty In" : "Duty Out" }`,
                    };

                    axiosInstance.post("/attendance/saveEmployeeAttendance", data, { headers })
                        .then((response) => {
                            if (response.data.status == 200) {
                                document.activeElement.blur();
                                Swal.fire({
                                    customClass: { container: "my-swal" },
                                    title: `${timeIn ? "Timed In" : "Timed Out"} Successfully!`,
                                    text: "Your attendance has been recorded",
                                    icon: "success",
                                    showConfirmButton: true,
                                    confirmButtonText: "Okay",
                                    confirmButtonColor: "#177604",
                                });
                            }
                            setRefreshTrigger((prev) => !prev);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });
                }
            });
        }
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                slotProps={{
                    paper: {
                        sx: {
                            py: "16px",
                            px: { xs: "4px", md: "16px" },
                            backgroundColor: "#f8f9fa",
                            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                            borderRadius: { xs: 0, md: "20px" },
                            minWidth: { xs: "100%", md: "450px" },
                            maxWidth: { xs: "100%", md: "500px" },
                            marginBottom: "5%",
                        },
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
                        spacing={1}
                    >
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            rowSpacing={1}
                            size={{ xs: 12 }}
                        >
                            <Grid size={5}>
                                <Typography>
                                    Date
                                </Typography>
                            </Grid>
                            <Grid size={7}>
                                <Typography sx={{ fontWeight: "bold", textAlign: "right", }}>
                                    {formattedDate}
                                </Typography>
                            </Grid>
                            <Grid size={5}>
                                <Typography>
                                    Time
                                </Typography>
                            </Grid>
                            <Grid size={7}>
                                <Typography
                                    sx={{ fontWeight: "bold", textAlign: "right" }}>
                                    {formattedTime}
                                </Typography>
                            </Grid>
                            <Grid size={5}>
                                <Typography>
                                    Status
                                </Typography>
                            </Grid>
                            <Grid size={7}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "right",
                                        color: onDuty ? "#177604" : "#f44336",
                                    }}
                                >
                                    {onDuty ? "ON DUTY" : "OFF DUTY"}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid size={12} sx={{ my: 0 }}>
                            <Divider />
                        </Grid>
                        {workShift.shift_type == "Regular" && (
                            <>
                                {/* Regular Shift Attendance */}
                                {/* Shift has not yet expired*/}
                                {/* Shift has expired, but the user is On Duty and the Time In occured before the shift ended*/}
                                {(!firstShiftExpired || (firstShiftExpired && onDuty && latestTime < workHour?.first_time_out)) && (
                                    <AttendanceButton
                                        label="Attendance"
                                        onDuty={onDuty}
                                        shiftType="Regular"
                                        onTimeInOut={handleTimeInOut}
                                    />
                                )}
                            </>
                        )}
                        {workShift.shift_type == "Split" && (
                            <>
                                {/* Second Shift Attendance */}
                                {/* Top: First Shift */}
                                {/* First Shift has not yet expired */}
                                {/* First shift has expired, but the user is On Duty and the Time In occured before the first shift ended */}
                                {/* Bottom: Second Shift */}
                                {/* Second Shift has not yet expired */}
                                {/* Second shift has expired, but the user is On Duty and the Time In occured before the second time out */}
                                {(!firstShiftExpired || (firstShiftExpired && onDuty && latestTime < workHour?.first_time_out)) ? (
                                    <AttendanceButton label={workShift.first_label} onDuty={onDuty} shiftType="First" onTimeInOut={handleTimeInOut} />
                                ) : (!secondShiftExpired || (secondShiftExpired && onDuty && latestTime < workHour?.second_time_out)) ? (
                                    <AttendanceButton label={workShift.second_label} onDuty={onDuty} shiftType="Second" onTimeInOut={handleTimeInOut} />
                                ) : null
                                }
                            </>
                        )}
                        {/* Overtime and End of Day Functions */}
                        {((workShift?.shift_type == "Regular" && firstShiftExpired && !(onDuty && latestTime < workHour?.first_time_out))
                            || (workShift?.shift_type == "Split" && secondShiftExpired && !(onDuty && latestTime < workHour?.second_time_out))) && (
                                firstDutyFinished ? (
                                    (() => {
                                        if (exactTime < workHour?.over_time_in) {
                                            return (
                                                <Grid size={12}>
                                                    <Box sx={{ py: 1, width: "100%", textAlign: "center", }}>
                                                        <Typography>
                                                            Overtime Available at{" "}{dayjs(`2023-01-01 ${workHour.over_time_in}`).format("hh:mm:ss A")}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            );
                                        } else if (!overtimeExpired || (overtimeExpired && onDuty && latestTime < workHour?.over_time_out)) {
                                            return (
                                                <AttendanceButton label="Overtime" onDuty={onDuty} shiftType="Overtime" onTimeInOut={handleTimeInOut} />
                                            );
                                        } else {
                                            return (
                                                <Grid size={12}>
                                                    <Box sx={{ py: 1, width: "100%", textAlign: "center", }} >
                                                        <Typography> The Day Has Ended </Typography>
                                                    </Box>
                                                </Grid>
                                            );
                                        }
                                    })()
                                ) : (
                                    <Grid size={12}>
                                        <Box sx={{ pt: 1, width: "100%", textAlign: "center", }} >
                                            <Typography> {firstNightShift ? `Time In Period for Next Shift Opens at ${dayjs(`2023-01-01 ${workHour.first_time_in}`).subtract(2, 'hour').format('hh:mm:ss A')}` : "The Day Has Ended"} </Typography>
                                        </Box>
                                    </Grid>
                                )
                            )}
                    </Grid>

                    {/*Attendance Logs------------------------------*/}
                    {employeeAttendance.length > 0 ? (
                        <>
                            <Divider sx={{ mt: 1, mb: 2 }} />
                            <Box>
                                <Typography sx={{ mb: 1 }}>
                                    Today's Attendance
                                </Typography>
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
                        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0", width: "100%", textAlign: "center" }} >
                            No Attendance For Today
                        </Box>
                    )}
                    <Divider sx={{ mt: 1, mb: 2 }} />
                    <Box>
                        <Typography sx={{ mb: 1 }}>
                            Your Schedule
                        </Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: "350px", overflowY: "auto", border: "solid 1px #e0e0e0" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 1, width: "40%" }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                                Shift
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ pl: 0, width: "30%" }}>
                                        <Box >
                                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                                Start
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ pl: 0, width: "30%" }}>
                                        <Box >
                                            <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                                                End
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell align="left" sx={{ pl: 1, width: "40%" }} >
                                        {workShift ? workShift.first_label : "Shift"}
                                    </TableCell>
                                    <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                        {workHour.first_time_in ? dayjs(`2023-01-01 ${workHour.first_time_in}`).format("hh:mm:ss A") : "-"}
                                    </TableCell>
                                    <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                        {workHour.first_time_out ? dayjs(`2023-01-01 ${workHour.first_time_out}`).format("hh:mm:ss A") : "-"}
                                    </TableCell>
                                </TableRow>
                                {workShift?.shift_type == "Split" ? (
                                    <TableRow>
                                        <TableCell align="left" sx={{ pl: 1, width: "40%" }} >
                                            {workShift ? workShift.second_label : "Second Shift"}
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                            {workHour.second_time_in ? dayjs(`2023-01-01 ${workHour.second_time_in}`).format("hh:mm:ss A") : "-"}
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                            {workHour.second_time_out ? dayjs(`2023-01-01 ${workHour.second_time_out}`).format("hh:mm:ss A") : "-"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell align="left" sx={{ pl: 1, width: "40%" }} >
                                            Break
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                            {workHour.break_start ? dayjs(`2023-01-01 ${workHour.break_start}`).format("hh:mm:ss A") : "-"}
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                            {workHour.break_end ? dayjs(`2023-01-01 ${workHour.break_end}`).format("hh:mm:ss A") : "-"}
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell align="left" sx={{ pl: 1, width: "40%" }} >
                                        Overtime
                                    </TableCell>
                                    <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                        {workHour.over_time_in ? dayjs(`2023-01-01 ${workHour.over_time_in}`).format("hh:mm:ss A") : "-"}
                                    </TableCell>
                                    <TableCell align="left" sx={{ pl: 0, width: "30%" }}>
                                        {workHour.over_time_out ? dayjs(`2023-01-01 ${workHour.over_time_out}`).format("hh:mm:ss A") : "-"}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Attendance;
