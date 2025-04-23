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

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AddAttendanceModal = ({ open, close, employee, fixedDate = null }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [selectedAction, setSelectedAction] = useState("");
    const [timestamp, setTimestamp] = useState(fixedDate ? dayjs(fixedDate) : dayjs());

    const [selectedActionError, setSelectedActionError] = useState(false);
    const [timestampError, setTimestampError] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();

        if (!selectedAction) {
            setSelectedActionError(true);
        } else {
            setSelectedActionError(false);
        }
        if (!timestamp) {
            setTimestampError(true);
        } else {
            setTimestampError(false);
        }

        if (!selectedAction || !timestamp) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to record this attendance?",
                icon: "warning",
                showConfirmButton: true,
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
    }

    const saveInput = (event) => {
        event.preventDefault();


        const data = {
            employee: employee,
            action: selectedAction,
            timestamp: timestamp.format("YYYY-MM-DD HH:mm:ss")
        }

        console.log(data);


        axiosInstance
            .post("/attendance/recordEmployeeAttendance", data, {
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

    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: 1, backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', maxWidth: '600px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 3, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 2, fontWeight: 'bold' }}> Add Attendance </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 2, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    select
                                    id="attendance-type"
                                    label="Attendance Type"
                                    value={selectedAction}
                                    error={selectedActionError}
                                    onChange={(event) =>
                                        setSelectedAction(event.target.value)
                                    }
                                >
                                    <MenuItem value="Duty In">
                                        Time In
                                    </MenuItem>
                                    <MenuItem value="Duty Out">
                                        Time Out
                                    </MenuItem>
                                    <MenuItem value="Overtime In">
                                        Overtime In
                                    </MenuItem>
                                    <MenuItem value="Overtime Out">
                                        Overtime Out
                                    </MenuItem>
                                </TextField>
                            </FormControl>
                            <FormControl>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        label="Time"
                                        value={timestamp}
                                        error={timestampError}
                                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                                        onChange={(newValue) => {
                                            setTimestamp(newValue);
                                        }}
                                        minDate={fixedDate ? dayjs(fixedDate).startOf('day') : undefined}
                                        maxDate={fixedDate ? dayjs(fixedDate).endOf('day') : undefined}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Submit </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default AddAttendanceModal;