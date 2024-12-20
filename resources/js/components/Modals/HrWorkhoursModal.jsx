import React, { useEffect, useRef, useState } from 'react'
import { Typography, IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Box, FormGroup, FormControl, InputLabel, Grid, FormControlLabel, Switch } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router-dom'
import moment from 'moment';

const HrWorkhoursModal = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [workdayID, setWorkdayID] = useState([]);
    const startDate = moment().format('YYYY-MM-DD HH:mm:mm');
    const [updateStatus, setUpdateStatus] = useState({
        morning_time_in: '',
        morning_time_out: '',
        afternoon_time_in: '',
        afternoon_time_out: ''
    });
    const hours_morning_in = (updateStatus.morning_time_in != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.morning_time_in + ':00' : '';
    const hours_morning_out = (updateStatus.morning_time_out != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.morning_time_out + ':00' : '';
    const hours_afternoon_in = (updateStatus.afternoon_time_in != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.afternoon_time_in + ':00' : '';
    const hours_afternoon_out = (updateStatus.afternoon_time_out != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.afternoon_time_out + ':00' : '';
    const [isNoonBreakRequired, setIsNoonBreakRequired] = useState(false);

    useEffect(() => {
        axiosInstance.post('/getWorkdayFuture', { startDate: startDate }, { headers })
            .then((response) => {
                setWorkdayID(response.data.message);
                // location.reload();
            })
            .catch((error) => {
                console.log('error', error.response)
            })
        console.log(startDate);
    }, [startDate])

    const handleClose = () => {
        close()
    }
    const handleSubmitAttendance = (e) => {
        e.preventDefault();

        if (workdayID != '') {
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
                        axiosInstance.post('/updateHrWorkhours', {
                            start_date: startDate, hours_morning_in: hours_morning_in, hours_morning_out: hours_morning_out,
                            hours_afternoon_in: hours_afternoon_in, hours_afternoon_out: hours_afternoon_out, noon_break: isNoonBreakRequired ? 'Yes' : 'No'
                        }, { headers })
                            .then((response) => {
                                close()
                                let title = '';
                                let text = '';
                                let icon = '';
                                if (response.data.message === 'Updated Workhours') {
                                    title = 'Successfully';
                                    text = response.data.message;
                                    icon = 'success';
                                } else if (response.data.message === 'Fail to update') {
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
            alert('You did not set a workday today or in future dates.')
        }

    }

    const handleToggleChange = () => {
        setIsNoonBreakRequired((prev) => !prev);
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle className='d-flex justify-content-between'>
                <Typography variant="h6" sx={{ paddingTop: 1 }}>Set Work Hours</Typography>
                <IconButton sx={{ color: 'red' }} onClick={handleClose}><i className="si si-close" ></i></IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="block-content my-20">
                    <div className='row'>
                        <div className="col-lg-12">
                            <Box component="form"
                                sx={{ minWidth: 120 }}
                                noValidate
                                autoComplete="off"
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
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }}
                                            value={updateStatus.morning_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, morning_time_in: e.target.value })}
                                            min={1} max={8} />

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
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }}
                                            value={updateStatus.morning_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, morning_time_out: e.target.value })}
                                        />

                                    </FormControl>
                                    <Grid container direction="row" alignItems="center" justifyContent="space-between">
                                        <Grid item>
                                            <Typography>Afternoon Attendance</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Grid container direction="row">
                                                <Typography>Straight Shift:
                                                    <FormControlLabel
                                                        sx={{ marginLeft: 1, marginRight: -1.25 }}
                                                        control={
                                                            <Switch
                                                                checked={isNoonBreakRequired}
                                                                onChange={handleToggleChange}
                                                            />
                                                        }
                                                    /></Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
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
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }}
                                            value={updateStatus.afternoon_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, afternoon_time_in: e.target.value })}
                                            min={1} max={8} />

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
                                            type="time" className='form-control' style={{ width: '100%', height: '40px' }}
                                            value={updateStatus.afternoon_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, afternoon_time_out: e.target.value })}
                                        />

                                    </FormControl>
                                </FormGroup>
                                <div className="d-flex justify-content-center">
                                    <Button
                                        // disabled={(updateStatus.selectedDate != '') ? false : true}
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

export default HrWorkhoursModal
