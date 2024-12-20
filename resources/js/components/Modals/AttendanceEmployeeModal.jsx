import React, { useEffect, useRef, useState } from 'react'
import { Typography, IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Box, FormGroup, FormControl, InputLabel, Grid, FormControlLabel, Switch } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router-dom'
import moment from 'moment';

const AttendanceEmployeeModal = ({ open, close, attendance, workShift, workHours }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    
    const [workHour, setWorkHour] = useState([]);
    const [date, setDate] = useState();
    const [updateStatus, setUpdateStatus] = useState({
        regular_time_in: '',
        regular_time_out: '',
        split_first_time_in: '',
        split_first_time_out: '',
        split_second_time_in: '',
        split_second_time_out: '',
    });

    const formatTime = (datetimeStr) => {
        if (!datetimeStr) return '';
        const date = new Date(datetimeStr);
        return date.toTimeString().split(' ')[0];
    };

    useEffect(() => {    

        setWorkHour(workHours);
        setDate(attendance.start_date);
        
        setUpdateStatus({
            regular_time_in: formatTime(attendance.morning_in),
            regular_time_out: formatTime(attendance.afternoon_out),
            split_first_time_in: formatTime(attendance.morning_in),
            split_first_time_out: formatTime(attendance.morning_out),
            split_second_time_in: formatTime(attendance.afternoon_in),
            split_second_time_out: formatTime(attendance.afternoon_out)
        });

    }, [attendance, workShift, workHours]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = {
            workHour: workHour,
            updateStatus: updateStatus,
            attendanceId: attendance.attdn_id,
        }

        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to update this attendance?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                axiosInstance.post('/updateAttendance', data, { headers })
                .then(response => {
                    Swal.fire({
                        customClass: {
                            container: 'my-swal'
                        },
                        text: "Attendance has been edited successfully",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true
                    }).then(() => {
                        location.reload();
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                console.log('User cancelled the delete action.');
            }
        });
    };

    const handleDelete = (event) => {

        const data = {
            attendanceId: attendance.attdn_id,
        }

        Swal.fire({
            customClass: {
                container: 'my-swal'
            },
            text: "Are you sure you want to delete this attendance?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#ff6042',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                axiosInstance.post('/deleteAttendance', data, { headers })
                .then(response => {
                    Swal.fire({
                        customClass: {
                            container: 'my-swal'
                        },
                        text: "Attendance has been deleted successfully",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true
                    }).then(() => {
                        location.reload();
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                console.log('User cancelled the delete action.');
            }
        });
    }

    const formatDate = (datetime) => {
        if (!datetime) return '';
        return datetime.split(' ')[0];
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Attendance </Typography>
                    <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ padding: 4, paddingBottom: 1 }}>
                <Box component="form" sx={{ minWidth: 120, pt: 2 }} onSubmit={handleSubmit} noValidate autoComplete="off" encType="multipart/form-data" >

                    <FormGroup row={true} className="d-flex justify-content-between" sx={{ '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                        },
                    }}>
                        <React.Fragment key="splitHours">
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' }
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Date</InputLabel>
                                <input type="date" className="form-control" value={formatDate(attendance.start_date)} style={{ width: '100%', height: '40px', backgroundColor: '#ffffff', border: '1px solid #97a5ba' }} readOnly/>
                            </FormControl>

                        </React.Fragment>
                    </FormGroup>

                    {workHours.noon_break === "Yes" && (
                        <>
                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <React.Fragment key="splitHours">
                                    <FormControl sx={{
                                        marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>{workHours.morning_label} Time in</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_first_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_in: e.target.value })} />
                                    </FormControl>

                                    <FormControl sx={{
                                        marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>{workHours.morning_label} Time out</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_first_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_out: e.target.value })} />
                                    </FormControl>
                                </React.Fragment>
                            </FormGroup>

                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <React.Fragment key="splitHours">
                                    <FormControl sx={{
                                        marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> {workHours.afternoon_label}Time in</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_second_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_in: e.target.value })} />
                                    </FormControl>

                                    <FormControl sx={{
                                        marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> {workHours.afternoon_label}Time out</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_second_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_out: e.target.value })} />
                                    </FormControl>
                                </React.Fragment>
                            </FormGroup>
                        </>
                    )}

                    <Box id="buttons" sx={{ paddingTop: 1, paddingBottom: 2, textAlign: 'center', '& .MuiButton-root': { margin: 1 }, }} >
                        <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} type="submit" > Save </Button>
                        <Button variant="contained" sx={{ backgroundColor: '#E74C3C', color: 'white' }} type="button" onClick={handleDelete}> Delete </Button>
                    </Box>

                </Box>
            </DialogContent>

        </Dialog>
    )
}

export default AttendanceEmployeeModal
