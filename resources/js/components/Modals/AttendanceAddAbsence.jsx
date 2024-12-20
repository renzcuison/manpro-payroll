import React, { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormGroup,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import moment from 'moment';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
import Swal from 'sweetalert2';
import '../../../../resources/css/calendar.css'

const AttendanceAddAbsence = ({ open, close, attendance_data }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const attendanceData = attendance_data['attdn']
    const [workdayID, setWorkdayID] = useState(0);
    const [updateStatus, setUpdateStatus] = useState({
        selectedDate: '',
        morning_time_in: '',
        morning_time_out: '',
        afternoon_time_in: '',
        afternoon_time_out: ''
    });
    const datess = new Date(updateStatus.selectedDate);
    datess.setDate(datess.getDate() + 1);
    const morning_in = (updateStatus.morning_time_in != '') ? updateStatus.selectedDate + ' ' + updateStatus.morning_time_in + ':00' : '';
    const morning_out = (updateStatus.morning_time_out != '') ? updateStatus.selectedDate + ' ' + updateStatus.morning_time_out + ':00' : '';
    const afternoon_in = (updateStatus.afternoon_time_in != '') ? updateStatus.selectedDate + ' ' + updateStatus.afternoon_time_in + ':00' : '';
    const afternoon_out = (updateStatus.afternoon_time_out != '') ? updateStatus.selectedDate + ' ' + updateStatus.afternoon_time_out + ':00' : '';
    const startDate = moment(updateStatus.selectedDate).format('YYYY-MM-DD HH:mm:mm');
    const endDate = moment(datess).format('YYYY-MM-DD') + ' ' + '00:00:00';

    useEffect(() => {
        axiosInstance.post('/getWorkday', { startDate: startDate }, { headers })
            .then((response) => {
                setWorkdayID(response.data.message);
                // location.reload();
            })
            .catch((error) => {
                console.log('error', error.response)
            })
    }, [startDate])
    console.log(workdayID);
    const handleSubmitAttendance = (e) => {
        e.preventDefault();

        if (workdayID) {
            if (updateStatus.morning_time_in != '' || updateStatus.morning_time_out != '' || updateStatus.afternoon_time_in != '' || updateStatus.afternoon_time_out != '') {
                new Swal({
                    customClass: {
                        container: 'my-swal'
                    },
                    title: "Are you sure?",
                    text: "You want to Submit this details?",
                    icon: "warning",
                    dangerMode: true,
                    showCancelButton: true,
                }).then(res => {
                    if (res.isConfirmed) {
                        axiosInstance.post('/updateHrAttendance', { morning_in: morning_in, morning_out: morning_out, afternoon_in: afternoon_in, afternoon_out: afternoon_out, start_date: startDate, end_date: endDate, type: 1, user_id: attendanceData['user_id'], allattendance: attendanceData['attendances'], workday_id: workdayID, status: 'attendance' }, { headers })
                            .then((response) => {
                                close()
                                let title = '';
                                let text = '';
                                let icon = '';
                                if (response.data.message === 'Updated Attendance') {
                                    title = 'Successfully';
                                    text = response.data.message;
                                    icon = 'success';
                                } else if (response.data.message === 'Fail to update') {
                                    title = 'Something went wrong';
                                    text = response.data.message;
                                    icon = 'warning';
                                } else if (response.data.message === 'Added Attendance') {
                                    title = 'Successfully';
                                    text = response.data.message;
                                    icon = 'success';
                                } else if (response.data.message === 'Fail to add') {
                                    title = 'Something went wrong';
                                    text = response.data.message;
                                    icon = 'warning';
                                }
                                Swal.fire({
                                    customClass: {
                                        container: 'my-swal'
                                    },
                                    title: title,
                                    text: text,
                                    icon: icon,
                                    timer: 1000,
                                    showConfirmButton: false
                                }).then(function () {
                                    location.reload();
                                });
                            })
                            .catch((error) => {
                                alert('error', error.response)
                                // location.reload();
                            })
                    }
                })
            } else {
                alert('Please Add a time')
            }

        } else {
            alert('You did not set a workday to this selected date.')
        }

    }

    return (
        <Dialog open={open} sx={{
            "& .MuiDialog-container": {
                justifyContent: "flex-center",
                alignItems: "flex-start"
            }
        }} fullWidth maxWidth="sm">
            <DialogContent>
                <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} onClick={close} data-dismiss="modal" aria-label="Close" ><i className="si si-close" ></i></IconButton>
                <input type="text" className="form-control" id="register_ais_deleted" readOnly hidden value="0" name="is_deleted" />
                <Typography className='text-center' style={{ marginTop: '10px', }}>Update/Add Attendance</Typography>
                <div className="block-content my-20">
                    <div className='row'>
                        <div className="col-lg-12">
                            <Box component="form"
                                sx={{ minWidth: 120 }}
                                noValidate
                                autoComplete="off"
                                // onSubmit={showEdit != true ? handleSubmit : handleEdit}
                                encType="multipart/form-data"
                            >
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': {
                                        color: '#97a5ba',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#97a5ba',
                                        },
                                    },
                                }}>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {

                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}>
                                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Date</InputLabel>
                                        <input id="demo-simple-select"
                                            type="date" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.selectedDate} onChange={(e) => setUpdateStatus({ ...updateStatus, selectedDate: e.target.value })} />

                                    </FormControl>
                                    <Typography className='text-center'>Morning Attendance</Typography>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {

                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}>
                                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                        <input id="demo-simple-select"
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.morning_time_in}
                                            onChange={(e) => setUpdateStatus({ ...updateStatus, morning_time_in: e.target.value })} min={1} max={8} />

                                    </FormControl>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {

                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}>
                                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                        <input id="demo-simple-select"
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.morning_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, morning_time_out: e.target.value })} />

                                    </FormControl>

                                    <Typography>Afternoon Attendance</Typography>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {

                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}>
                                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                        <input id="demo-simple-select"
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.afternoon_time_in}
                                            onChange={(e) => setUpdateStatus({ ...updateStatus, afternoon_time_in: e.target.value })} min={1} max={8} />

                                    </FormControl>
                                    <FormControl sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {

                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}>
                                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                        <input id="demo-simple-select"
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.afternoon_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, afternoon_time_out: e.target.value })} />

                                    </FormControl>
                                </FormGroup>
                                <div className="d-flex justify-content-center">
                                    <Button
                                        disabled={(updateStatus.selectedDate != '') ? false : true}
                                        type="submit"
                                        variant="contained"
                                        onClick={handleSubmitAttendance}
                                    >
                                        <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Submit</p>

                                    </Button>
                                </div>
                            </Box>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AttendanceAddAbsence
