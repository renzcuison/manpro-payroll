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

const AddAttendanceModal = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [selectedAction, setSelectedAction] = useState("");
    const [timestamp, setTimestamp] = useState(dayjs());


    const [selectedActionError, setSelectedActionError] = useState(false);
    const [timestampError, setTimestampError] = useState(false);

    useEffect(() => {
        console.log(employee);
    }, []);

    const checkInput = () => {
        console.log("submit attendance?");
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: 1, backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', maxWidth: '600px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 3, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 2, fontWeight: 'bold' }}> Add Attendance </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <Typography sx={{ mb: 2 }}>Employee: {employee.id}</Typography>
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
                                        handleTypeChange(event.target.value)
                                    }
                                >
                                    <MenuItem value="Time In">
                                        Time In
                                    </MenuItem>
                                    <MenuItem value="Time Out">
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
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="Time"
                                        value={timestamp}
                                        error={timestampError}
                                        minDate={dayjs()}
                                        onChange={(newValue) => {
                                            setTimestamp(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
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