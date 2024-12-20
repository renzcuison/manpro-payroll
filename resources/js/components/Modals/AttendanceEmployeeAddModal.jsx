import React, { useEffect, useRef, useState } from 'react'
import { Typography, IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Box, FormGroup, FormControl, InputLabel, Grid, FormControlLabel, Switch } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router-dom'
import moment from 'moment';

const AttendanceEmployeeAddModal = ({ open, close, employeeId, workHours, workShift }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [date, setDate] = useState('');
    const [updateStatus, setUpdateStatus] = useState({
        regular_time_in: '',
        regular_time_out: '',
        split_first_time_in: '',
        split_first_time_out: '',
        split_second_time_in: '',
        split_second_time_out: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = {
            employeeId: employeeId,
            date: date,
            workHour: workHours,
            workShift: workShift,
            updateStatus: updateStatus,
        }

        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to add this attendance?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                axiosInstance.post('/addEmployeeAttendance', data, { headers })
                .then(response => {

                    if ( response.data.status === "Success" ) {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            text: "Attendance has been added successfully",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true
                        }).then(() => {
                            location.reload();
                        });
                    }
                    
                    if ( response.data.status === "Attendance Exist" ) {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            text: "Attendance already exists",
                            icon: "error",
                            timer: 1000,
                            showConfirmButton: true
                        })
                    }

                    if ( response.data.status === "No Workday" ) {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            text: "No Workday on Selected Date",
                            icon: "error",
                            timer: 1000,
                            showConfirmButton: true
                        })
                    }
                    
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                console.log('User cancelled the delete action.');
            }
        });
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Attendance </Typography>
                    <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ padding: 4, paddingBottom: 1 }}>
                <Box component="form" sx={{ minWidth: 120, pt: 2 }} onSubmit={handleSubmit} noValidate autoComplete="off" encType="multipart/form-data" >

                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                        '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                        },
                    }}>
                        <React.Fragment key="splitHours">
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Date</InputLabel>
                                <input type="date" className="form-control" style={{ width: '100%', height: '40px', backgroundColor: '#ffffff', border: '1px solid #97a5ba' }} onChange={(e) => setDate(e.target.value)} />
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
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> {workHours.morning_label} Time in</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_in: e.target.value })}/>
                                    </FormControl>

                                    <FormControl sx={{
                                        marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> {workHours.morning_label} Time out</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_out: e.target.value })}/>
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
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> {workHours.afternoon_label} Time in</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_in: e.target.value })}/>
                                    </FormControl>

                                    <FormControl sx={{
                                        marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> {workHours.afternoon_label} Time out</InputLabel>
                                        <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_out: e.target.value })}/>
                                    </FormControl>
                                </React.Fragment>
                            </FormGroup>
                        </>
                    )}

                    <Box id="buttons" sx={{ paddingTop: 1, paddingBottom: 2, textAlign: 'center', '& .MuiButton-root': { margin: 1 }, }} >
                        <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} type="submit" > Save </Button>
                        <Button variant="contained" sx={{ backgroundColor: '#E74C3C', color: 'white' }} type="button" onClick={close}> Cancel </Button>
                    </Box>

                </Box>
            </DialogContent>

        </Dialog>
    )
}

export default AttendanceEmployeeAddModal
