import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, InputLabel, FormControl, Box, CircularProgress, Typography, ButtonGroup, Button } from '@mui/material'
import Layout from '../../components/Layout/Layout'
import PageHead from '../../components/Table/PageHead'
import PageToolbar from '../../components/Table/PageToolbar'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import moment from 'moment';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useUser } from '../../hooks/useUser';
import Swal from "sweetalert2";

import AttendanceEmployeeModal from '../../components/Modals/AttendanceEmployeeModal';
import AttendanceEmployeeAddModal from '../../components/Modals/AttendanceEmployeeAddModal';

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20)).fill('').map((v, idx) => now - idx);
}

const HrAttendanceEmployee = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const queryParameters = new URLSearchParams(window.location.search)

    const navigate = useNavigate();
    const allYears = years();

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');

    const [openAttendanceEmployee, setOpenAttendanceEmployee] = useState(false)
    const [openAttendanceAddEmployee, setOpenAttendanceAddEmployee] = useState(false)

    const [searchParams, setSearchParams] = useSearchParams()
    const [selectMonth, setSelectMonth] = useState(searchParams.get('month') || '');
    const [selectYear, setSelectYear] = useState(searchParams.get('year') || '');
    
    const { month, year, employeeId } = useParams();
    const { user } = useUser();
    
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState([]);
    const [workShift, setWorkShift] = useState([]);
    const [workHours, setWorkHours] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {    
        const queryParams = new URLSearchParams({
            month: month,
            year: year,
            employeeId: employeeId
        }).toString();

        setSelectMonth(month);
        setSelectYear(year);

        axiosInstance.get(`/getEmployeeAttendance?${queryParams}`, { headers })
            .then((response) => {
                setEmployee(response.data.employee);
                setWorkShift(response.data.workShift);
                setWorkHours(response.data.workHours);
                setAttendances(response.data.attendances);
                
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [month, year, employeeId]);

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const date = new Date(timeStr);
        return date.getHours() * 60 + date.getMinutes();
    };

    const calculateDuration = (start, end) => {
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);
        return endMinutes - startMinutes;
    };

    const formatDuration = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} Hrs ${minutes} Min`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatAttendance = (timeStr) => {
        if (!timeStr) return 'N/A';
        
        const date = new Date(timeStr);
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return date.toLocaleTimeString([], options);
    };
    
    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
    
        const timePart = timeStr.split(' ')[1];
    
        const [hours, minutes, seconds] = timePart.split(':');
    
        const paddedHours = hours.padStart(2, '0');
        const paddedMinutes = minutes.padStart(2, '0');
        const paddedSeconds = seconds.padStart(2, '0');
    

        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    };
    
    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangeMonth = (e) => {
        const newMonth = e.target.value
        setSelectMonth(newMonth)

        navigate(`/hr/attendance-employee/${newMonth}/${selectYear}/${employeeId}`)
    }

    const handleChangeYear = (e) => {
        const newYear = e.target.value
        setSelectYear(newYear)

        navigate(`/hr/attendance-employee/${selectMonth}/${newYear}/${employeeId}`)
    }

    const handleOpenAttendance = (attendanceId) => {

        const data = { attendanceId: attendanceId };

        axiosInstance.get(`/getAttendance`, { params: data, headers })
            .then((response) => {
                setAttendance(response.data.attendance);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
                setLoading(false);
            });

        setOpenAttendanceEmployee(true);
    };

    const handleCloseAttendance = () => {
        setOpenAttendanceEmployee(false)
    }

    const handleOpenAddAttendance = () => {
        setOpenAttendanceAddEmployee(true)
    }

    const handleCloseAddAttendance = () => {
        setOpenAttendanceAddEmployee(false)
    }

    const hourToMinutes = (timeStr) => {
        if (!timeStr) return 0;
    
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
    
    const timeStampToMinutes = (timestampStr) => {
        if (!timestampStr) return 0;
    
        const date = new Date(timestampStr);
        
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        return hours * 60 + minutes;
    };
    

    return (
        <Layout title={"employeeAttendance"}>
            <Box sx={{ mx: 12 }}>
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 3, alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ pt: 1 }}> Employee Attendance </Typography>

                    <ButtonGroup variant="text" aria-label="month and year selector" sx={{ gap: 1 }}>
                        <FormControl size="small" sx={{ mr: 1 }}>
                            <InputLabel id="month-select-label">Month</InputLabel>
                            <Select labelId="month-select-label" id="month_attendance" value={selectMonth} label="Month" onChange={handleChangeMonth} sx={{ width: 120 }} >
                                <MenuItem value={'01'}>January</MenuItem>
                                <MenuItem value={'02'}>February</MenuItem>
                                <MenuItem value={'03'}>March</MenuItem>
                                <MenuItem value={'04'}>April</MenuItem>
                                <MenuItem value={'05'}>May</MenuItem>
                                <MenuItem value={'06'}>June</MenuItem>
                                <MenuItem value={'07'}>July</MenuItem>
                                <MenuItem value={'08'}>August</MenuItem>
                                <MenuItem value={'09'}>September</MenuItem>
                                <MenuItem value={'10'}>October</MenuItem>
                                <MenuItem value={'11'}>November</MenuItem>
                                <MenuItem value={'12'}>December</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ ml: 1 }}>
                            <InputLabel id="year-select-label">Year</InputLabel>
                            <Select labelId="year-select-label" id="year_attendance" value={selectYear} label="Year" onChange={handleChangeYear} sx={{ width: 120 }} >
                                {allYears.map((year, index) => (
                                    <MenuItem key={index} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ButtonGroup>
                </Box>

                <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ overflowX: 'auto', mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', }} >
                                <Typography variant="h5" sx={{ pt: 1 }}> {employee.fname} {employee.lname} </Typography>

                                <Button onClick={handleOpenAddAttendance} variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>


                            {workHours.noon_break === "Yes" && (
                                <TableContainer style={{ overflowX: 'auto' }}>
                                    <Table className="table table-md table-striped table-vcenter" style={{ minWidth: 'auto' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Date</TableCell>
                                                <TableCell align="center">{workHours.morning_label} Time In </TableCell>
                                                <TableCell align="center">{workHours.morning_label} Time Out </TableCell>
                                                <TableCell align="center">{workHours.afternoon_label} Time In</TableCell>
                                                <TableCell align="center">{workHours.afternoon_label} Time Out</TableCell>
                                                <TableCell align="center">Total Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attendances.map((attendance) => {

                                                let morningInMinutes = 0;
                                                let morningOutMinutes = 0;
                                                let afternoonInMinutes = 0;
                                                let afternoonOutMinutes = 0;

                                                const attendanceMorningInMinutes = timeStampToMinutes(attendance.morning_in);
                                                const attendanceMorningOutMinutes = timeStampToMinutes(attendance.morning_out);
                                                const attendanceAfternoonInMinutes = timeStampToMinutes(attendance.afternoon_in);
                                                const attendanceAfternoonOutMinutes = timeStampToMinutes(attendance.afternoon_out);

                                                const workHoursMorningInMinutes = hourToMinutes(workHours.hours_morning_in);
                                                const workHoursMorningOutMinutes = hourToMinutes(workHours.hours_morning_out);
                                                const workHoursAfternoonInMinutes = hourToMinutes(workHours.hours_afternoon_in);
                                                const workHoursAfternoonOutMinutes = hourToMinutes(workHours.hours_afternoon_out);
                                                
                                                if ( attendanceMorningInMinutes < workHoursMorningInMinutes ) {
                                                    morningInMinutes = workHoursMorningInMinutes;
                                                } else {
                                                    morningInMinutes = attendanceMorningInMinutes;
                                                }

                                                if ( attendanceMorningOutMinutes > workHoursMorningOutMinutes ) {
                                                    morningOutMinutes = workHoursMorningOutMinutes;
                                                } else {
                                                    morningOutMinutes = attendanceMorningOutMinutes;
                                                }


                                                if ( attendanceAfternoonInMinutes < workHoursAfternoonInMinutes ) {
                                                    afternoonInMinutes = workHoursAfternoonInMinutes;
                                                } else {
                                                    afternoonInMinutes = attendanceAfternoonInMinutes;
                                                }

                                                if ( attendanceAfternoonOutMinutes > workHoursAfternoonOutMinutes ) {
                                                    afternoonOutMinutes = workHoursAfternoonOutMinutes;
                                                } else {
                                                    afternoonOutMinutes = attendanceAfternoonOutMinutes;
                                                }

                                                const morningDuration = Math.max(0, morningOutMinutes - morningInMinutes);
                                                const afternoonDuration = Math.max(0, afternoonOutMinutes - afternoonInMinutes);
                                                const totalMinutes = morningDuration + afternoonDuration;
                    
                                                return (
                                                    <TableRow key={attendance.attdn_id} onClick={() => handleOpenAttendance(attendance.attdn_id)} sx={{ '&:hover': { cursor: 'pointer' } }}>
                                                        <TableCell>{formatDate(attendance.start_date)}</TableCell>                                                        
                                                        <TableCell align="center" style={(formatTime(attendance.morning_in) < workHours.hours_morning_in) ? {} : { color: '#FF6F6F' }}> {formatAttendance(attendance.morning_in)}</TableCell>
                                                        <TableCell align="center" style={(formatTime(attendance.morning_out) > workHours.hours_morning_out) ? {} : { color: '#FF6F6F' }}> {formatAttendance(attendance.morning_out)}</TableCell>
                                                        <TableCell align="center" style={(formatTime(attendance.afternoon_in) < workHours.hours_afternoon_in) ? {} : { color: '#FF6F6F' }}> {formatAttendance(attendance.afternoon_in)}</TableCell>
                                                        <TableCell align="center" style={(formatTime(attendance.afternoon_out) > workHours.hours_afternoon_out) ? {} : { color: '#FF6F6F' }}> {formatAttendance(attendance.afternoon_out)}</TableCell>
                                                        <TableCell align="center">{totalMinutes < 0 ? "0 Hrs 0 Min" : formatDuration(totalMinutes)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {workHours.noon_break === "No" && (
                                <TableContainer style={{ overflowX: 'auto' }}>
                                    <Table className="table table-md table-striped table-vcenter" style={{ minWidth: 'auto' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Date</TableCell>
                                                <TableCell align="center">{workHours.morning_label} Time In</TableCell>
                                                <TableCell align="center">{workHours.afternoon_label} Time Out</TableCell>
                                                <TableCell align="center">Total Time</TableCell>
                                                <TableCell align="center"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attendances.map((attendance) => {
                                                
                                                let morningInMinutes = 0;
                                                let afternoonOutMinutes = 0;

                                                const attendanceMorningInMinutes = timeStampToMinutes(attendance.morning_in);
                                                const attendanceAfternoonOutMinutes = timeStampToMinutes(attendance.afternoon_out);

                                                const workHoursMorningInMinutes = hourToMinutes(workHours.hours_morning_in);
                                                const workHoursAfternoonOutMinutes = hourToMinutes(workHours.hours_afternoon_out);

                                                if ( attendanceMorningInMinutes < workHoursMorningInMinutes ) {
                                                    morningInMinutes = workHoursMorningInMinutes;
                                                } else {
                                                    morningInMinutes = attendanceMorningInMinutes;
                                                }

                                                if ( attendanceAfternoonOutMinutes > workHoursAfternoonOutMinutes ) {
                                                    afternoonOutMinutes = workHoursAfternoonOutMinutes;
                                                } else {
                                                    afternoonOutMinutes = attendanceAfternoonOutMinutes;
                                                }

                                                const totalMinutes = afternoonOutMinutes - morningInMinutes;
                    
                                                return (
                                                    <TableRow key={attendance.attdn_id} onClick={() => handleOpenAttendance(attendance.attdn_id)} sx={{ '&:hover': { cursor: 'pointer' } }}>
                                                        <TableCell>{formatDate(attendance.start_date)}</TableCell>                                                        
                                                        <TableCell align="center" style={(formatTime(attendance.morning_in) < workHours.hours_morning_in) ? {} : { color: '#FF6F6F' }}> {formatAttendance(attendance.morning_in)}</TableCell>
                                                        <TableCell align="center" style={(formatTime(attendance.afternoon_out) > workHours.hours_afternoon_out) ? {} : { color: '#FF6F6F' }}> {formatAttendance(attendance.afternoon_out)}</TableCell>
                                                        <TableCell align="center">{totalMinutes < 0 ? "0 Hrs 0 Min" : formatDuration(totalMinutes)}</TableCell>
                                                        <TableCell></TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            <AttendanceEmployeeModal open={openAttendanceEmployee} close={handleCloseAttendance} attendance={attendance} workShift={workShift} workHours={workHours} />
            <AttendanceEmployeeAddModal open={openAttendanceAddEmployee} close={handleCloseAddAttendance} employeeId={employeeId} workShift={workShift} workHours={workHours} />
        </Layout>
    );
};

export default HrAttendanceEmployee;
