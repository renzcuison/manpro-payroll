import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, CircularProgress, Grid, TextField, FormControl } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';

const AttendanceLogs = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendances, setAttendances] = useState([]);

    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        axiosInstance.get('/attendance/getAttendanceLogs', { headers })
            .then((response) => {
                console.log('API Response:', response.data); // Debugging: Log the response
                setAttendances(response.data.attendances || []); // Fallback to an empty array
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching attendance logs:', error);
                setIsLoading(false);
                setAttendances([]); // Fallback to an empty array on error
            });
    }, []);

    const filteredAttendance = attendances.filter((attendance) => {
        return attendance.name.toLowerCase().includes(searchName.toLowerCase());
    });

    return (
        <Layout title={"AttendanceLogs"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Attendance Logs </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {/* Filters */}
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid size={8}>
                            </Grid>
                            <Grid container direction="row" justifyContent="flex-end" size={{ xs: 2 }} spacing={2}>
                                <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } } }}>
                                    <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                </FormControl>
                            </Grid>
                        </Grid>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400, maxHeight: 500 }}>
                                <Table stickyHeader aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Name</TableCell>
                                            <TableCell align="center">Branch</TableCell>
                                            <TableCell align="center">Department</TableCell>
                                            <TableCell align="center">Role</TableCell>
                                            <TableCell align="center">Timestamp</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {!Array.isArray(filteredAttendance) || filteredAttendance.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAttendance.map((attendance) => (
                                                <TableRow key={attendance.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }} >
                                                    <TableCell align="left">{attendance.name || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.branch || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.department || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.role || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.timeStamp || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.action || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout>
    );
};

export default AttendanceLogs;