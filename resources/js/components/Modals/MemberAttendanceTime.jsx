import { Box, Button, IconButton, Typography, Dialog, DialogTitle, DialogContent, Grid, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import moment from 'moment';

const MemberAttendanceTime = ({ open, close }) => {
    const [getWorkdaysCalendar, setGetWorkdaysCalendar] = useState([]);
    const [getTimeAttendance, setGetTimeAttendance] = useState([]);
    const [workHour, setWorkHour] = useState(null);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    useEffect(() => {
        axiosInstance.get('/get_time', { headers }).then((response) => {
            setGetTimeAttendance(response.data.attendance);
        });
    }, [])

    useEffect(() => {
        axiosInstance.get(`/getEmployeeWorkShift`, { headers })
            .then((response) => {
                console.log(response.data.workHours);
                setWorkHour(response.data.workHours);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
            });
    }, []);

    const handleTimein = () => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Confirm to Time in?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_in = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeIn = start + " " + time_in;
                axiosInstance.post('/add_timein', {
                    timeIn: timeIn,
                    start: start,
                    end: end,
                    color: color,
                    add_time_in: 1
                }, { headers }).then((response) => {
                    console.log(response);
                    Swal.fire({
                        customClass: {
                            container: "my-swal",
                        },
                        icon: 'success',
                        title: 'Successfully timed in',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(() => {
                        axiosInstance.get('/get_attendance', { headers }).then((response) => {
                            window.location.reload();
                            // setGetWorkdaysCalendar(response.data.events);
                        }).catch((error) => {
                            console.error("Error fetching attendance data: ", error);
                        });
                    });

                }).catch((error) => {
                    console.error("Error adding time in: ", error);
                });
            }
        })
    }

    const handleTimeout = () => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Confirm to Time out?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_out = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeOut = start + " " + time_out;
                axiosInstance.post('/add_timeout', {
                    timeOut: timeOut,
                    start: start,
                    end: end,
                    color: color,
                    morning_time_out: 1
                }, { headers }).then((response) => {
                    console.log(response);
                    Swal.fire({
                        customClass: {
                            container: "my-swal",
                        },
                        icon: 'success',
                        title: 'Successfully time out',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    const handleTimeinAfternoon = () => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Confirm to Time in?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_in = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeIn = start + " " + time_in;
                axiosInstance.post('/add_timeinAfternoon', {
                    timeIn: timeIn,
                    start: start,
                    end: end,
                    color: color,
                    afternoon_time_in: 1
                }, { headers }).then((response) => {
                    console.log(response);
                    Swal.fire({
                        customClass: {
                            container: "my-swal",
                        },
                        icon: 'success',
                        title: 'Successfully time in',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    const handleTimeoutAfternoon = () => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Confirm to Time out?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                const start = moment(start).format('YYYY-MM-DD');;
                const end = moment(end).format('YYYY-MM-DD');
                const time_out = moment().format('HH:mm:ss');
                const color = 'rgb(250, 34, 34)';
                const timeOut = start + " " + time_out;
                axiosInstance.post('/add_timeoutAfternoon', {
                    timeOut: timeOut,
                    start: start,
                    end: end,
                    color: color,
                    afternoon_time_out: 1
                }, { headers }).then((response) => {
                    console.log(response);
                    Swal.fire({
                        customClass: {
                            container: "my-swal",
                        },
                        icon: 'success',
                        title: 'Successfully time out',
                        showConfirmButton: false,
                        timer: 1000
                    }).then(function () {
                        window.location.reload();
                    })
                });
            }
        })
    }

    return (
        <>
            <Dialog sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-center",
                    alignItems: "flex-start"
                }
            }}
                open={open} fullWidth maxWidth="sm">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle>
                        <Typography className="text-center"></Typography>
                    </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, marginTop: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>

                    {workHour ? (
                        <Typography variant="h6">{workHour.morning_label}</Typography>
                    ) : (
                        <Typography variant="h6">Loading...</Typography>
                    )}

                    <Grid item xs={12} sx={{ marginTop: 4 }}>
                        <Button type="submit" variant="contained" sx={{ background: '#9acbf3' }} fullWidth onClick={handleTimein} disabled={getTimeAttendance.some(item => item.morning_in !== null)} >
                            {getTimeAttendance.length != 0 ? getTimeAttendance.map((item, a) => {
                                if (item.morning_in) {
                                    const morningIn = new Date(item.morning_in);
                                    const formattedMorningIn = morningIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <>
                                            <div key={a}>
                                                <i className="fa fa-check" /> {formattedMorningIn}
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            Time In
                                        </>
                                    );
                                }
                            }) :
                                <>
                                    Time In
                                </>
                            }
                        </Button>
                    </Grid>

                    <Grid item xs={12} sx={{ marginTop: 4 }}>
                        <Button type="submit" variant="contained" sx={{
                            background: '#f1c1be',
                            '&:hover': {
                                background: '#d5463d',
                            },
                        }} fullWidth
                            onClick={handleTimeout}
                            disabled={getTimeAttendance.some(item => item.morning_out !== null)}
                        >
                            {getTimeAttendance.length != 0 ? getTimeAttendance.map((item, b) => {
                                if (item.morning_out) {
                                    const morningOut = new Date(item.morning_out);
                                    const formattedMorningOut = morningOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <>
                                            <div key={b}>
                                                <i className="fa fa-check" /> {formattedMorningOut}
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            Time Out
                                        </>
                                    );
                                }
                            }) :
                                <>
                                    Time Out
                                </>
                            }
                        </Button>
                    </Grid>

                    <Divider variant="middle" sx={{ marginTop: 4, marginBottom: 4 }} />

                    {workHour ? (
                        <Typography variant="h6">{workHour.afternoon_label}</Typography>
                    ) : (
                        <Typography variant="h6">Loading...</Typography>
                    )}

                    <Grid item xs={12} sx={{ marginTop: 4 }}>
                        <Button type="submit" variant="contained" sx={{ background: '#9acbf3' }} fullWidth
                            onClick={handleTimeinAfternoon}
                            disabled={getTimeAttendance.some(item => item.afternoon_in !== null)}
                        >
                            {getTimeAttendance.length != 0 ? getTimeAttendance.map((item, c) => {
                                if (item.afternoon_in) {
                                    const afternoonIn = new Date(item.afternoon_in);
                                    const formattedAfterIn = afternoonIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <>
                                            <div key={c}>
                                                <i className="fa fa-check" /> {formattedAfterIn}
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            Time In
                                        </>
                                    );
                                }
                            }) :
                                <>
                                    Time In
                                </>
                            }
                        </Button>
                    </Grid>
                    <Grid item xs={12} sx={{ marginTop: 4, marginBottom: 4 }}>
                        <Button type="submit" variant="contained" sx={{
                            background: '#f1c1be',
                            '&:hover': {
                                background: '#d5463d',
                            },
                        }} fullWidth
                            onClick={handleTimeoutAfternoon}
                            disabled={getTimeAttendance.some(item => item.afternoon_out !== null)}
                        >
                            {getTimeAttendance.length != 0 ? getTimeAttendance.map((item, d) => {
                                if (item.afternoon_out) {
                                    const afternoonOut = new Date(item.afternoon_out);
                                    const formattedAfterOut = afternoonOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <>
                                            <div key={d}>
                                                <i className="fa fa-check" /> {formattedAfterOut}
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            Time Out
                                        </>
                                    );
                                }
                            }) :
                                <>
                                    Time Out
                                </>
                            }
                        </Button>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default MemberAttendanceTime
