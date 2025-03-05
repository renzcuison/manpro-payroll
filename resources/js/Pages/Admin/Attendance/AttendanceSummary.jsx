import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'
import dayjs from 'dayjs';

const AttendanceSummary = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceSummary, setAttendanceSummary] = useState([]);

    useEffect(() => {

        axiosInstance.get('/attendance/getAttendanceSummary', {
            headers,
            params: {
                month: dayjs().month() + 1,
                year: dayjs().year(),
            }
        }).then((response) => {
            setAttendanceSummary(response.data.attendance_summary);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching summary:', error);
            setIsLoading(false);
        });
    }, []);

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
                                            {attendanceSummary.map((attendance) => (
                                                <TableRow
                                                    key={attendance.emp_id}
                                                    component={Link}
                                                    to={`/admin/attendance/${attendance.emp_user_name}`}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    <TableCell align="left"> {attendance.emp_first_name} {attendance.emp_middle_name || ''} {attendance.emp_last_name} {attendance.emp_suffix || ''} </TableCell>
                                                    <TableCell align="center">{attendance.emp_branch || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.emp_department || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.emp_role || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.total_minutes || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.total_late || '-'}</TableCell>
                                                    <TableCell align="center">{`${attendance.total_absences} days`}</TableCell>
                                                </TableRow>
                                            ))}
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