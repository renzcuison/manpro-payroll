import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'
import dayjs from 'dayjs';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const AttendanceSummary = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [month, setMonth] = useState(dayjs());

    useEffect(() => {
        axiosInstance.get('/attendance/getAttendanceSummary', {
            headers,
            params: {
                month: dayjs(month).month() + 1,
                year: dayjs(month).year(),
            }
        }).then((response) => {
            setAttendanceSummary(response.data.summary || []);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching summary:', error);
            setIsLoading(false);
        });
    }, [month]);

    // ---------------- Summary Details
    const formatTime = (time) => {
        if (!time) return '-';

        const absTime = Math.abs(time);

        const hours = Math.floor(absTime / 60);
        const minutes = absTime % 60;

        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else {
            return `${minutes}m`;
        }
    }

    return (
        <Layout title={"AttendanceLogs"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Attendance Summary </Typography>
                        <></>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid container direction="row" justifyContent="flex-start" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                                        <DatePicker
                                            label="Filter Month"
                                            value={month}
                                            views={['year', 'month']}
                                            onChange={(newValue) => {
                                                setMonth(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} />
                                            )}
                                            slotProps={{
                                                textField: {
                                                    readOnly: true,
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Hours</TableCell>
                                                <TableCell align="center">Tardiness</TableCell>
                                                <TableCell align="center">Absences</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {!Array.isArray(attendanceSummary) || attendanceSummary.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        No attendance records found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                attendanceSummary.map((attendance) => (
                                                    <TableRow
                                                        key={attendance.emp_id}
                                                        onClick={() => navigate(`/admin/attendance/${attendance.emp_user_name}`)}
                                                        sx={{
                                                            '&:last-child td, &:last-child th': { border: 0 },
                                                            textDecoration: 'none', color: 'inherit',
                                                            "&:hover": {
                                                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                                                cursor: "pointer",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell align="left"> {attendance.emp_first_name} {attendance.emp_middle_name || ''} {attendance.emp_last_name} {attendance.emp_suffix || ''} </TableCell>
                                                        <TableCell align="center">{attendance.emp_branch || '-'}</TableCell>
                                                        <TableCell align="center">{attendance.emp_department || '-'}</TableCell>
                                                        <TableCell align="center">{attendance.emp_role || '-'}</TableCell>
                                                        <TableCell align="center">{formatTime(attendance.total_rendered)}</TableCell>
                                                        <TableCell align="center">{formatTime(attendance.total_late)}</TableCell>
                                                        <TableCell align="center">{`${attendance.total_absences} days`}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout >
    )
}

export default AttendanceSummary