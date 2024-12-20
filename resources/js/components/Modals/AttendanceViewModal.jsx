import React, { useEffect, useReducer, useState } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import moment from 'moment';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const getTime = (minutes) => {

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h}hrs ${m}min`
}

const AttendanceViewModal = ({ open, close, attendance_data }) => {
    const [attendanceData, setAttendanceData] = useState([])
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
    const user_id = attendance_data.user_id
    const month_val = attendance_data.month
    const year_val = attendance_data.year
    useEffect(() => {
        getAttendanceData(month_val, year_val, user_id)
    }, [month_val, year_val, user_id, reducerValue])

    const getAttendanceData = async (month_val, year_val, user_id) => {
        let dates = []
        dates = [month_val, year_val, user_id]
        await axiosInstance.get(`/getModalAttendanceView/${dates.join(',')}`, { headers })
            .then((response) => {
                setAttendanceData(response.data.attendanceData);
            })
    }
    const handleDelete = (data) => {
        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "You want to Delete this Attendance?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/deleteAttendanceView', {
                    attdn_id: data.attdn_id
                }, { headers })
                    .then((response) => {
                        forceUpdate();
                        location.reload();
                    })
            }
        })
    }


    return (
        <Dialog open={open} sx={{
            "& .MuiDialog-container": {
                justifyContent: "flex-center",
                alignItems: "flex-start"
            }
        }} fullWidth maxWidth="lg">
            <DialogTitle>
                <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} onClick={close}><i className="si si-close" ></i></IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="block block-themed block-transparent mb-0 mt-2 ">
                    <input type="text" className="form-control" id="register_ais_deleted" readOnly hidden value="0" name="is_deleted" />
                    <div className="block-content my-10">
                        <div className='row'>
                            <div className="col-lg-12">
                                <div className='row'>
                                    <div className="col-lg-5">
                                        <h6 className='text-center'>Morning Schedule</h6>
                                        <div className='d-flex justify-content-between'>
                                            <table className='table table-striped table-borderless'>
                                                <tbody>
                                                    {attendanceData?.map((list, index) => (
                                                        <tr key={index + 1}>
                                                            <td>{(list.morning_in == null ? 'Halfday' : moment(list.morning_in).format('MMMM Do Y'))}</td>
                                                            <td>{(list.morning_in != null) ? moment(list.morning_in).format('h:mma') : 'TBA'} - {(list.morning_out != null) ? moment(list.morning_out).format('h:mma') : 'TBA'}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-lg-5">
                                        <h6 className='text-center'>Afternoon Schedule</h6>
                                        <div className='d-flex justify-content-between'>
                                            <table className='table table-striped table-borderless'>
                                                <tbody>
                                                    {attendanceData?.map((list, index) => (
                                                        <tr key={index + 1}>
                                                            <td>{(list.afternoon_in == null ? 'Halfday' : moment(list.afternoon_in).format('MMMM Do Y'))}</td>
                                                            <td>{(list.afternoon_in != null) ? moment(list.afternoon_in).format('h:mma') : 'TBA'} - {(list.afternoon_out != null) ? moment(list.afternoon_out).format('h:mma') : 'TBA'}</td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-lg-2">
                                        <h6 className='text-center'>Total</h6>
                                        <div className='d-flex justify-content-between text-center'>
                                            <table className='table table-borderless table-striped'>
                                                <tbody>
                                                    {attendanceData?.map((list, index) => {
                                                        const morningStartDate = new Date(list.morning_in)
                                                        const morningEndDate = new Date(list.morning_out)
                                                        const afternoonStartDate = new Date(list.afternoon_in)
                                                        const afternoonEndDate = new Date(list.afternoon_out)
                                                        const expectedWorkTimeMorning = 240;
                                                        const expectedWorkTimeAfternoon = 240;
                                                        let lateMorningMinutes = 0;
                                                        let undertimeMorningMinutes = 0;
                                                        let lateAfternoonMinutes = 0;
                                                        let undertimeAfternoonMinutes = 0;

                                                        if (list.morning_out) {
                                                            const morning_in = new Date();
                                                            morning_in.setHours(parseInt(list.hours_morning_in.split(':')[0], 10), 0, 0, 0);
                                                            morning_in.setMonth(morningStartDate.getMonth())
                                                            morning_in.setDate(morningStartDate.getDate());
                                                            morning_in.setFullYear(morningStartDate.getFullYear())

                                                            const morning_out = new Date();
                                                            morning_out.setHours(parseInt(list.hours_morning_out.split(':')[0], 10), 0, 0, 0);
                                                            morning_out.setMonth(morningEndDate.getMonth())
                                                            morning_out.setDate(morningEndDate.getDate());
                                                            morning_out.setFullYear(morningEndDate.getFullYear())

                                                            const arrivalMorningDiff = (morningStartDate - morning_in) / (1000 * 60);
                                                            if (arrivalMorningDiff > 0) {
                                                                lateMorningMinutes = Math.floor(arrivalMorningDiff);
                                                            }

                                                            const leaveMorningDiff = (morningEndDate - morning_out) / (1000 * 60);
                                                            if (leaveMorningDiff < 0) {
                                                                undertimeMorningMinutes = Math.round(Math.abs(leaveMorningDiff));
                                                            }
                                                        }

                                                        if (list.afternoon_out) {
                                                            const afternoon_in = new Date();
                                                            afternoon_in.setHours(parseInt(list.hours_afternoon_in.split(':')[0], 10), 0, 0, 0);
                                                            afternoon_in.setMonth(afternoonStartDate.getMonth())
                                                            afternoon_in.setDate(afternoonStartDate.getDate());
                                                            afternoon_in.setFullYear(afternoonStartDate.getFullYear())

                                                            const afternoon_out = new Date();
                                                            afternoon_out.setHours(parseInt(list.hours_afternoon_out.split(':')[0], 10), 0, 0, 0);
                                                            afternoon_out.setMonth(afternoonEndDate.getMonth())
                                                            afternoon_out.setDate(afternoonEndDate.getDate());
                                                            afternoon_out.setFullYear(afternoonEndDate.getFullYear())

                                                            const arrivalafternoonDiff = (afternoonStartDate - afternoon_in) / (1000 * 60);
                                                            if (arrivalafternoonDiff > 0) {
                                                                lateAfternoonMinutes = Math.floor(arrivalafternoonDiff);
                                                            }

                                                            const leaveafternoonDiff = (afternoonEndDate - afternoon_out) / (1000 * 60);
                                                            if (leaveafternoonDiff < 0) {
                                                                undertimeAfternoonMinutes = Math.round(Math.abs(leaveafternoonDiff));
                                                            }
                                                        }

                                                        const morningMinutes = lateMorningMinutes + undertimeMorningMinutes
                                                        const afternoonlMinutes = lateAfternoonMinutes + undertimeAfternoonMinutes
                                                        const totalMorningMinutes = list.morning_out ? expectedWorkTimeMorning - morningMinutes : 0
                                                        const totalAfternoonMinutes = list.afternoon_out ? expectedWorkTimeAfternoon - afternoonlMinutes : 0
                                                        return (
                                                            <tr key={index + 1}>
                                                                <td>{getTime(Math.max(0, totalMorningMinutes + totalAfternoonMinutes))}</td>
                                                                <td className='p-0 m-0'><IconButton onClick={() => handleDelete(list)} sx={{ color: 'red' }}><i className="fa fa-trash-o" ></i></IconButton></td>
                                                            </tr>
                                                        )
                                                    }

                                                    )}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AttendanceViewModal
