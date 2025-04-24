import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
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
import { TimePicker } from '@mui/x-date-pickers';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const EditAttendanceModal = ({ open, close, date, attendanceInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [selectedType, setSelectedType] = useState(attendanceInfo.action);
    const [selectedTypeError, setSelectedTypeError] = useState(false);

    const [timestamp, setTimestamp] = useState(dayjs(attendanceInfo.timestamp));
    const [timestampError, setTimestampError] = useState(false);

    // Delete Logs
    const handleDeleteLog = () => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Delete Log?",
            text: "This action is irreversible!",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                const data = {
                    log_id: attendanceInfo.id
                };
                axiosInstance
                    .post("/attendance/deleteEmployeeAttendance", data, {
                        headers,
                    })
                    .then((response) => {
                        if (response.data.status == 200) {
                            document.activeElement.blur();
                            document.body.removeAttribute("aria-hidden");
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: `Attendance successfully deleted!`,
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
        });
    }

    // Update Logs
    const checkInput = (event) => {
        event.preventDefault();

        const emptyFields = !selectedType || !timestamp;
        const invalidTimeStamp = !dayjs(timestamp).isValid();

        setSelectedTypeError(!selectedType);
        setTimestampError(!timestamp || !dayjs(timestamp).isValid());

        if (emptyFields) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All required fields must be filled!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else if (invalidTimeStamp) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Enter a valid time!",
                icon: "error",
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to update this attendance log?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    }

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            attendance_id: attendanceInfo.id,
            new_type: selectedType,
            timestamp: timestamp.format("YYYY-MM-DD HH:mm:ss"),
        }

        axiosInstance
            .post("/attendance/editEmployeeAttendance", data, {
                headers,
            })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Attendance successfully updated`,
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
                        <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 'bold' }}> Edit Attendance </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
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
                            <Grid size={{ xs: 12, md: 8 }}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <TimePicker
                                        label="Time"
                                        value={timestamp}
                                        error={timestampError}
                                        views={['hours', 'minutes', 'seconds']}
                                        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                        minDate={date}
                                        maxDate={date}
                                        onChange={(newValue) => {
                                            setTimestamp(newValue);
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: timestampError,
                                                helperText: timestampError ? "Enter a valid time" : "",
                                            },
                                        }}
                                        sx={{ width: "100%" }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid size={6}>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Log </p>
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                                    <Button onClick={handleDeleteLog} variant="contained" sx={{ backgroundColor: '#f44336', color: 'white' }} >
                                        <p className='m-0'><i className="fa fa-trash mr-2 mt-1"></i> Delete Log </p>
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default EditAttendanceModal;