import React, { useEffect, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Box, FormControl, Typography, TablePagination, TextField, TableHead, Avatar, Tab, CircularProgress } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AttendanceToday = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [attendance, setAttendance] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchName, setSearchName] = useState('');

    const [attendanceTab, setAttendanceTab] = useState('1');
    const [attendanceLoading, setAttendanceLoading] = useState(true);

    useEffect(() => {
        getAttendance(1);
    }, []);

    const getAttendance = (type) => {
        /* types: 1 - Present, 2 - Late, 3 - Absent, 4 - On Leave */
        setAttendanceLoading(true);
        axiosInstance
            .get(`adminDashboard/getAttendance`, { headers, params: { type: type } })
            .then((response) => {
                const attendanceData = response.data.attendance || [];
                setAttendance(attendanceData);
                setAttendanceLoading(false);
                getAvatar(attendanceData);
            })
            .catch((error) => {
                console.error('Error fetching attendance:', error);
                setAttendance([]);
                setAttendanceLoading(false);
            });
    };

    // Attendance Pagination Controls
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredAttendance = useMemo(() => {
        if (!searchName) return attendance;
        return attendance.filter((attend) => {
            const fullName = `${attend.first_name} ${attend.middle_name || ''} ${attend.last_name} ${attend.suffix || ''}`.toLowerCase();
            return fullName.includes(searchName.toLowerCase());
        });
    }, [searchName, attendance]);
    
    const paginatedAttendance = useMemo(() => {
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAttendance.slice(startIndex, endIndex);
    }, [filteredAttendance, page, rowsPerPage]);

    // Tab Controls
    const handleAttendanceTabChange = (event, newValue) => {
        event.preventDefault();
        setAttendanceTab(newValue);
        setAttendanceLoading(true);
        getAttendance(newValue);
    }

    // Late Time Formatter
    const formatLateTime = (seconds) => {
        if (!seconds && seconds !== 0) return '-';

        const absSeconds = Math.abs(seconds);

        const hours = Math.floor(absSeconds / 3600);
        const minutes = Math.floor((absSeconds % 3600) / 60);
        const sec = absSeconds % 60;

        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else if (minutes > 0) {
            return `${minutes}m${sec > 0 ? ` ${sec}s` : ''}`;
        } else {
            return `${sec}s`;
        }
    };

    const [blobMap, setBlobMap] = useState({});

    const getAvatar = (attendanceData) => {
        const userIds = attendanceData.map((attend) => attend.id);
        if (userIds.length === 0) return;

        axiosInstance
            .post(`adminDashboard/getEmployeeAvatars`, { user_ids: userIds }, { headers })
            .then((avatarResponse) => {
                const avatars = avatarResponse.data.avatars || {};
                setBlobMap((prev) => {
                    // Old blob cleanup
                    Object.values(prev).forEach((url) => {
                        if (url.startsWith('blob:')) {
                            URL.revokeObjectURL(url);
                        }
                    });

                    // New blobs
                    const newBlobMap = {};
                    Object.entries(avatars).forEach(([id, data]) => {
                        if (data.avatar && data.avatar_mime) {
                            const byteCharacters = atob(data.avatar);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: data.avatar_mime });
                            newBlobMap[id] = URL.createObjectURL(blob);
                        }
                    });
                    return newBlobMap;
                });
            })
            .catch((error) => {
                console.error('Error fetching avatars:', error);
            });
    };

    const renderProfile = (id) => {
        if (blobMap[id]) {
            return blobMap[id];
        }
        return "../../../images/avatarpic.jpg";
    };

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

    return (
        <Layout title={"AttendanceLogs"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Attendance Today </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <TabContext value={attendanceTab}>
                            <Box display="flex" sx={{ justifyContent: "space-between" }}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleAttendanceTabChange} aria-label="Acknowledgement Tabs">
                                        <Tab label="Present" value="1" />
                                        <Tab label="Late" value="2" />
                                        <Tab label="Absent" value="3" />
                                        <Tab label="On Leave" value="4" />
                                    </TabList>
                                </Box>

                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                        <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                    </FormControl>
                                </Box>
                            </Box>
                            
                            <TabPanel value="1" sx={{ px: 0 }}>
                                <Box sx={{ height: "450px", overflow: "auto" }}>
                                    <TableContainer sx={{ maxHeight: "450px" }}>
                                        <Table stickyHeader className="table table-md table-striped table-vcenter">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ width: "40%" }}>Employee</TableCell>
                                                    <TableCell align="center" sx={{ width: "15%" }}>First Time In</TableCell>
                                                    <TableCell align="center" sx={{ width: "15%" }}>First Time Out</TableCell>
                                                    <TableCell align="center" sx={{ width: "15%" }}>Second Time In</TableCell>
                                                    <TableCell align="center" sx={{ width: "15%" }}>Second Time Out</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {attendanceLoading ? (
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                                                <CircularProgress />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            ) : (
                                                <TableBody>
                                                    {paginatedAttendance.length > 0 ? (
                                                        paginatedAttendance.map((attend, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell align="left">
                                                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                                                        <Avatar alt={`${attend.first_name}_Avatar`} src={renderProfile(attend.id)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                        {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.first_time_in ? dayjs(attend.first_time_in).format("hh:mm:ss A") : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.first_time_out ? dayjs(attend.first_time_out).format("hh:mm:ss A") : attend.first_time_in ? "Ongoing" : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.shift_type == "Regular" ? "-" : attend.second_time_in ? dayjs(attend.first_time_in).format("hh:mm:ss A") : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.shift_type == "Regular" ? "-" : attend.second_time_out ? dayjs(attend.first_time_out).format("hh:mm:ss A") : "Ongoing"}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}> No Attendance Found </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            )}
                                        </Table>
                                        <TablePagination rowsPerPageOptions={[5, 10, 20]} component="div" count={filteredAttendance.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ alignItems: "center" }} />
                                    </TableContainer>
                                </Box>
                            </TabPanel>

                            <TabPanel value="2" sx={{ px: 0 }}>
                                <Box sx={{ height: "450px", overflow: "auto" }}>
                                    <TableContainer sx={{ maxHeight: "450px" }}>
                                        <Table stickyHeader className="table table-md table-striped table-vcenter">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ width: "24%" }}>Employee</TableCell>
                                                    <TableCell align="center" sx={{ width: "10%" }}>Schedule</TableCell>
                                                    <TableCell align="center" sx={{ width: "14%" }}>First Time In</TableCell>
                                                    <TableCell align="center" sx={{ width: "14%" }}>First Time Out</TableCell>
                                                    <TableCell align="center" sx={{ width: "14%" }}>Second Time In</TableCell>
                                                    <TableCell align="center" sx={{ width: "14%" }}>Second Time Out</TableCell>
                                                    <TableCell align="center" sx={{ width: "10%" }}>Late By</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {attendanceLoading ? (
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell colSpan={7}>
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                                                <CircularProgress />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            ) : (
                                                <TableBody>
                                                    {paginatedAttendance.length > 0 ? (
                                                        paginatedAttendance.map((attend, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell align="left">
                                                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                                                        <Avatar alt={`${attend.first_name}_Avatar`} src={renderProfile(attend.id)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                        {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.start_time ? dayjs(attend.start_time).format('hh:mm:ss A') : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.first_time_in ? dayjs(attend.first_time_in).format("hh:mm:ss A") : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.first_time_out ? dayjs(attend.first_time_out).format("hh:mm:ss A") : attend.first_time_out ? "Ongoing" : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.shift_type == "Regular" ? "-" : attend.second_time_in ? dayjs(attend.second_time_in).format("hh:mm:ss A") : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.shift_type == "Regular" ? "-" : attend.second_time_out ? dayjs(attend.second_time_out).format("hh:mm:ss A") : "Ongoing"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {attend.late_by !== undefined ? formatLateTime(attend.late_by) : "-"}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}> No Late Employees Found </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            )}
                                        </Table>
                                        <TablePagination rowsPerPageOptions={[5, 10, 20]} component="div" count={filteredAttendance.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ alignItems: "center" }} />
                                    </TableContainer>
                                </Box>
                            </TabPanel>

                            <TabPanel value="3" sx={{ px: 0 }}>
                                <Box sx={{ height: "450px", overflow: "auto" }}>
                                    <TableContainer sx={{ maxHeight: "450px" }}>
                                        <Table stickyHeader className="table table-md table-striped table-vcenter">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ width: "100%" }}>Employee</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {attendanceLoading ? (
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell colSpan={1}>
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                                                <CircularProgress />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            ) : (
                                                <TableBody>
                                                    {paginatedAttendance.length > 0 ? (
                                                        paginatedAttendance.map((attend, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell align="left">
                                                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                                                        <Avatar alt={`${attend.first_name}_Avatar`} src={renderProfile(attend.id)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                        {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}> No Absent Employees Found </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            )}
                                        </Table>

                                        <TablePagination rowsPerPageOptions={[5, 10, 20]} component="div" count={filteredAttendance.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ alignItems: "center" }} />
                                    </TableContainer>
                                </Box>
                            </TabPanel>

                            <TabPanel value="4" sx={{ px: 0 }}>
                                <Box sx={{ height: "450px", overflow: "auto" }}>
                                    <TableContainer sx={{ maxHeight: "450px" }}>
                                        <Table stickyHeader className="table table-md table-striped table-vcenter">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ width: "40%" }}>Employee</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Leave Type</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Start Date</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>End Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {attendanceLoading ? (
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                                                <CircularProgress />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            ) : (
                                                <TableBody>
                                                    {paginatedAttendance.length > 0 ? (
                                                        paginatedAttendance.map((attend, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell align="left">
                                                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                                                        <Avatar alt={`${attend.first_name}_Avatar`} src={renderProfile(attend.id)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                        {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="center"> {attend.type_name} </TableCell>
                                                                <TableCell align="center"> {dayjs(attend.leave_start).format('MMM DD YYYY')} </TableCell>
                                                                <TableCell align="center"> {dayjs(attend.leave_end).format('MMM DD YYYY')} </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}> No Employees on Leave Found </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            )}
                                        </Table>
                                        <TablePagination rowsPerPageOptions={[5, 10, 20]} component="div" count={filteredAttendance.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ alignItems: "center" }} />
                                    </TableContainer>
                                </Box>
                            </TabPanel>
                        </TabContext>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default AttendanceToday;