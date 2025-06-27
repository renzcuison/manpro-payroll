import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, Typography, Divider, Tab, TextField, MenuItem } from '@mui/material';
import { TabContext, TabList, TabPanel } from "@mui/lab";
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AddAttendanceModal = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Dynamic Field View
    const [overtimeView, setOvertimeView] = useState(false);
    const [addType, setAddType] = useState("1");

    // Date
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedDateError, setSelectedDateError] = useState(false);

    // Batch Log Fields
    const [firstTimeIn, setFirstTimeIn] = useState(null);
    const [firstTimeOut, setFirstTimeOut] = useState(null);
    const [firstTimeInError, setFirstTimeInError] = useState(false);
    const [firstTimeOutError, setFirstTimeOutError] = useState(false);

    const [secondTimeIn, setSecondTimeIn] = useState(null);
    const [secondTimeOut, setSecondTimeOut] = useState(null);
    const [secondTimeInError, setSecondTimeInError] = useState(false);
    const [secondTimeOutError, setSecondTimeOutError] = useState(false);

    const [overtimeIn, setOvertimeIn] = useState(null);
    const [overtimeOut, setOvertimeOut] = useState(null);
    const [overtimeInError, setOvertimeInError] = useState(false);
    const [overtimeOutError, setOvertimeOutError] = useState(false);

    // Individual Log Fields
    const [selectedType, setSelectedType] = useState('Duty In');
    const [selectedTypeError, setSelectedTypeError] = useState(false);

    const [logTimestamp, setLogTimestamp] = useState(dayjs());
    const [logTimestampError, setLogTimestampError] = useState(false);

    useEffect(() => {
        getAttendanceAdderLogs();
    }, [selectedDate]);

    const getAttendanceAdderLogs = () => {
        let data = { employee: employee.id, date: selectedDate.format('YYYY-MM-DD') };
        axiosInstance.get(`/attendance/getAttendanceAdderLogs`, { params: data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    const attendance = response.data.attendance;
                    setFirstTimeIn(attendance.first_in ? dayjs(attendance.first_in) : null);
                    setFirstTimeOut(attendance.first_out ? dayjs(attendance.first_out) : null);
                    setSecondTimeIn(attendance.second_in ? dayjs(attendance.second_in) : null);
                    setSecondTimeOut(attendance.second_out ? dayjs(attendance.second_out) : null);
                    setOvertimeIn(attendance.overtime_in ? dayjs(attendance.overtime_in) : null);
                    setOvertimeOut(attendance.overtime_out ? dayjs(attendance.overtime_out) : null);
                    setOvertimeView(attendance.overtime_in || attendance.overtime_out);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    };

    const formatTimestamp = (timestamp, selectedDate) => {
        const formattedTS = timestamp ? selectedDate
            .set("hour", timestamp.hour())
            .set("minute", timestamp.minute())
            .set("second", timestamp.second())
            .format("YYYY-MM-DD HH:mm:ss")
            : null;
        return formattedTS;
    }

    // Batch Logs
    const checkInput = (event) => {
        event.preventDefault();

        const requiresSecondShift = employee.shift_type === "Shift" || secondTimeIn || secondTimeOut;
        const requiresOvertime = overtimeView || overtimeIn || overtimeOut;

        const emptyFields = !selectedDate || !firstTimeIn || !firstTimeOut || (requiresSecondShift && (!secondTimeIn || !secondTimeOut)) || (requiresOvertime && (!overtimeIn || !overtimeOut));

        const invalidFields =
            (selectedDate && !dayjs(selectedDate).isValid()) ||
            (firstTimeIn && !dayjs(firstTimeIn).isValid()) ||
            (firstTimeOut && !dayjs(firstTimeOut).isValid()) ||
            (requiresSecondShift &&
                ((secondTimeIn && !dayjs(secondTimeIn).isValid()) || (secondTimeOut && !dayjs(secondTimeOut).isValid()))) ||
            (requiresOvertime &&
                ((overtimeIn && !dayjs(overtimeIn).isValid()) || (overtimeOut && !dayjs(overtimeOut).isValid())));

        const timeOrderErrors =
            (firstTimeIn && firstTimeOut && dayjs(firstTimeOut).isBefore(dayjs(firstTimeIn))) ||
            (requiresSecondShift && secondTimeIn && secondTimeOut && dayjs(secondTimeOut).isBefore(dayjs(secondTimeIn))) ||
            (requiresOvertime && overtimeIn && overtimeOut && dayjs(overtimeOut).isBefore(dayjs(overtimeIn))) ||
            (requiresSecondShift && firstTimeIn && secondTimeIn && dayjs(secondTimeIn).isBefore(dayjs(firstTimeIn))) ||
            (requiresOvertime &&
                overtimeIn &&
                ((secondTimeOut && dayjs(overtimeIn).isBefore(dayjs(secondTimeOut))) ||
                    (!secondTimeOut && firstTimeOut && dayjs(overtimeIn).isBefore(dayjs(firstTimeOut))))) ||
            (requiresSecondShift && firstTimeOut && secondTimeIn && dayjs(secondTimeIn).isBefore(dayjs(firstTimeOut)));

        setSelectedDateError( !selectedDate || (selectedDate && !dayjs(selectedDate).isValid()) || dayjs(selectedDate).isAfter(dayjs().startOf('day')) );
        setFirstTimeInError( !firstTimeIn || (firstTimeIn && !dayjs(firstTimeIn).isValid()) );
        setFirstTimeOutError( !firstTimeOut ||(firstTimeOut && !dayjs(firstTimeOut).isValid()) ||(firstTimeIn && firstTimeOut && dayjs(firstTimeOut).isBefore(dayjs(firstTimeIn))) );
        setSecondTimeInError( requiresSecondShift && (!secondTimeIn || (secondTimeIn && !dayjs(secondTimeIn).isValid()) || (firstTimeOut && secondTimeIn && dayjs(secondTimeIn).isBefore(dayjs(firstTimeOut)))) );
        setSecondTimeOutError( requiresSecondShift && (!secondTimeOut || (secondTimeOut && !dayjs(secondTimeOut).isValid()) || (secondTimeIn && secondTimeOut && dayjs(secondTimeOut).isBefore(dayjs(secondTimeIn)))) );
        setOvertimeInError( requiresOvertime && (!overtimeIn || (overtimeIn && !dayjs(overtimeIn).isValid()) || (overtimeIn && ((secondTimeOut && dayjs(overtimeIn).isBefore(dayjs(secondTimeOut))) || (!secondTimeOut && firstTimeOut && dayjs(overtimeIn).isBefore(dayjs(firstTimeOut)))))) );
        setOvertimeOutError( requiresOvertime && (!overtimeOut || (overtimeOut && !dayjs(overtimeOut).isValid()) || (overtimeIn && overtimeOut && dayjs(overtimeOut).isBefore(dayjs(overtimeIn)))) );

        document.activeElement.blur();

        if (selectedDateError) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Enter a valid date!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
            return;
        }

        if (emptyFields) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All required fields must be filled!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else if (invalidFields) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Some fields contain invalid inputs!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else if (timeOrderErrors) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Time entries must be in the correct order!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to record this attendance? This will overwrite any existing attendance for this date.",
                icon: "warning",
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            employee: employee.id,
            date: selectedDate.format("YYYY-MM-DD"),
            first_in: formatTimestamp(firstTimeIn, selectedDate),
            first_out: formatTimestamp(firstTimeOut, selectedDate),
            second_in: formatTimestamp(secondTimeIn, selectedDate),
            second_out: formatTimestamp(secondTimeOut, selectedDate),
            overtime_in: formatTimestamp(overtimeIn, selectedDate),
            overtime_out: formatTimestamp(overtimeOut, selectedDate),
        };

        axiosInstance.post("/attendance/recordEmployeeAttendance", data, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Attendance successfully recorded`,
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        if (res.isConfirmed) {
                            close(true);
                            document.body.setAttribute("aria-hidden", "true");
                        } else {
                            document.body.setAttribute("aria-hidden", "true");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    }

    // Individual Logs
    const checkAddLog = () => {
        setSelectedTypeError(!selectedType);
        setLogTimestampError(!logTimestamp);
        if (!selectedType || !logTimestamp) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All required fields must be filled!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else if (!dayjs(logTimestamp).isValid()) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Use a valid time!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to save this attendance log?",
                icon: "warning",
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveAddLog();
                }
            });
        }
    }

    const saveAddLog = () => {
        const data = {
            employee: employee.id,
            date: selectedDate.format("YYYY-MM-DD"),
            action: selectedType,
            timestamp: formatTimestamp(logTimestamp, selectedDate),
        };

        axiosInstance
            .post("/attendance/addAttendanceLog", data, {
                headers,
            })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Attendance successfully recorded`,
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        if (res.isConfirmed) {
                            close(true);
                            document.body.setAttribute("aria-hidden", "true");
                        } else {
                            document.body.setAttribute("aria-hidden", "true");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: 1, backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', maxWidth: '600px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 3, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 'bold' }}> Add Attendance </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <TabContext value={addType}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={(event, newValue) => setAddType(newValue)} aria-label="Acknowledgement Tabs">
                                <Tab label="Day" value="1" />
                                <Tab label="Individual" value="2" />
                            </TabList>
                        </Box>

                        <TabPanel value="1" sx={{ px: 0 }}>
                            <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                                <Grid container spacing={2}>

                                    <Grid size={12}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Date"
                                                value={selectedDate}
                                                views={['year', 'month', 'day']}
                                                onChange={(newValue) => setSelectedDate(newValue,)}
                                                slotProps={{
                                                    textField: { error: selectedDateError, helperText: selectedDateError ? "Enter a valid date" : "" }
                                                }}
                                                sx={{ width: "100%" }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>

                                    {/* First Time In */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker
                                                label="First In"
                                                value={firstTimeIn}
                                                views={['hours', 'minutes', 'seconds']}
                                                onChange={(newValue) => setFirstTimeIn(newValue)}
                                                slotProps={{
                                                    textField: { error: firstTimeInError, helperText: firstTimeInError ? "Enter a valid time" : "" },
                                                }}
                                                sx={{ width: "100%" }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    {/* First Time Out */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker
                                                label="First Out"
                                                value={firstTimeOut}
                                                views={['hours', 'minutes', 'seconds']}
                                                onChange={(newValue) => setFirstTimeOut(newValue)}
                                                slotProps={{
                                                    textField: {
                                                        error: firstTimeOutError,
                                                        helperText: firstTimeOutError ? "Enter a valid time" : "",
                                                    },
                                                }}
                                                sx={{ width: "100%" }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    {/* Second Time In */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker
                                                label="Second In"
                                                value={secondTimeIn}
                                                views={['hours', 'minutes', 'seconds']}
                                                onChange={(newValue) => setSecondTimeIn(newValue)}
                                                slotProps={{
                                                    textField: {
                                                        error: secondTimeInError,
                                                        helperText: secondTimeInError ? "Enter a valid time" : "",
                                                    },
                                                }}
                                                sx={{ width: "100%" }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    {/* Second Time Out */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker
                                                label="Second Out"
                                                value={secondTimeOut}
                                                views={['hours', 'minutes', 'seconds']}
                                                onChange={(newValue) => setSecondTimeOut(newValue)}
                                                slotProps={{
                                                    textField: {
                                                        error: secondTimeOutError,
                                                        helperText: secondTimeOutError ? "Enter a valid time" : "",
                                                    },
                                                }}
                                                sx={{ width: "100%" }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    
                                    <Grid size={12}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: 'auto' }}
                                            onClick={() => setOvertimeView(!overtimeView)}
                                        >
                                            <p className="m-0">
                                                <i className="fa fa-plus"></i> {`${overtimeView ? 'Hide' : 'Show'} Overtime Fields`}
                                            </p>
                                        </Button>
                                    </Grid>
                                    {/* Overtime Fields */}
                                    {overtimeView && (
                                        <>
                                            {/* Overtime In */}
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <TimePicker
                                                        label="Overtime In"
                                                        value={overtimeIn}
                                                        views={['hours', 'minutes', 'seconds']}
                                                        onChange={(newValue) => setOvertimeIn(newValue)}
                                                        slotProps={{
                                                            textField: {
                                                                error: overtimeInError,
                                                                helperText: overtimeInError ? "Enter a valid time" : "",
                                                            },
                                                        }}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>

                                            {/* Overtime Out */}
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <TimePicker
                                                        label="Overtime Out"
                                                        value={overtimeOut}
                                                        views={['hours', 'minutes', 'seconds']}
                                                        onChange={(newValue) => setOvertimeOut(newValue)}
                                                        slotProps={{
                                                            textField: {
                                                                error: overtimeOutError,
                                                                helperText: overtimeOutError ? "Enter a valid time" : "",
                                                            },
                                                        }}
                                                        sx={{ width: "100%" }}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                        </>
                                    )}
                                    <Grid size={12}>
                                        <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Attendance </p>
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </TabPanel>

                        {/* Individual Logs */}
                        <TabPanel value="2" sx={{ px: 0 }}>
                            <Grid container spacing={2}>
                                {/* Date */}
                                <Grid size={12}>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <DatePicker
                                            label="Date"
                                            value={selectedDate}
                                            views={['year', 'month', 'day']}
                                            onChange={(newValue) => setSelectedDate(newValue,)}
                                            slotProps={{
                                                textField: {
                                                    error: selectedDateError,
                                                    helperText: selectedDateError ? "Enter a valid date" : "",
                                                }
                                            }}
                                            sx={{ width: "100%" }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                {/* Type */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        required
                                        select
                                        id="attendance-type"
                                        label="Attendance Type"
                                        value={selectedType}
                                        error={selectedTypeError}
                                        onChange={(event) => setSelectedType(event.target.value)}
                                        sx={{ width: "100%" }}
                                        helperText={selectedTypeError ? "Enter a valid attendance type" : ''}
                                    >
                                        <MenuItem value="Duty In">Duty In</MenuItem>
                                        <MenuItem value="Duty Out">Duty Out</MenuItem>
                                        <MenuItem value="Overtime In">Overtime In</MenuItem>
                                        <MenuItem value="Overtime Out">Overtime Out</MenuItem>
                                    </TextField>
                                </Grid>
                                {/* Timestamp */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            label="Time"
                                            value={logTimestamp}
                                            views={['hours', 'minutes', 'seconds']}
                                            onChange={(newValue) => setLogTimestamp(newValue)}
                                            slotProps={{
                                                textField: {
                                                    error: logTimestampError,
                                                    helperText: logTimestampError ? "Enter a valid time" : "",
                                                },
                                            }}
                                            sx={{ width: "100%" }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid size={12}>
                                    <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                                        <Button variant="contained" onClick={checkAddLog} sx={{ backgroundColor: '#177604', color: 'white' }} >
                                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Attendance </p>
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </TabContext>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default AddAttendanceModal;