import { Table, TableBody, TableCell, TableContainer, TableRow, Box, FormControl, Typography, TablePagination, TextField, TableHead, Avatar, Tab, CircularProgress } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const Present = ({ attendanceLoading, paginatedAttendance, filteredAttendance, rowsPerPage, page, handleChangePage, handleChangeRowsPerPage }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const renderProfile = (id) => {
        if (blobMap[id]) {
            return blobMap[id];
        }
        return "../../../../images/avatarpic.jpg";
    };

    return (
        <>
            <TabPanel value="1" sx={{ px: 0 }}>
                <Box sx={{ overflow: "auto" }}>
                    <TableContainer>
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
                                        paginatedAttendance.map((attend, index) => {

                                            console.log("attend: " + attend);

                                            const isRegular = attend.shift_type == "Regular";
                                            const currentTime = dayjs();
                                            const currentDate = currentTime.format('YYYY-MM-DD');

                                            const firstIn = attend.first_time_in ? dayjs(attend.first_time_in).format("hh:mm:ss A") : "-";
                                            const firstOut = attend.first_time_out ? dayjs(attend.first_time_out).format("hh:mm:ss A") : attend.first_time_in ? "Ongoing" : "-";

                                            const secondIn = attend.second_time_in ? dayjs(attend.second_time_in).format("hh:mm:ss A") : "-";
                                            const secondOut = attend.second_time_out ? dayjs(attend.second_time_out).format("hh:mm:ss A") : attend.second_time_in ? "Ongoing" : "-";

                                            const breakStart = attend.break_start ? dayjs(`${currentDate} ${attend.break_start}`) : null;
                                            const breakEnd = attend.break_end ? dayjs(`${currentDate} ${attend.break_end}`) : null;

                                            return (
                                                <TableRow key={index} sx={{ color: attend.is_late ? "error.main" : "inherit", '& td': { color: attend.is_late ? 'error.main' : 'inherit' } }}>
                                                    <TableCell align="left">
                                                        <Box display="flex" sx={{ alignItems: "center" }}>
                                                            <Avatar alt={`${attend.first_name}_Avatar`} src={renderProfile(attend.id)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                            {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {firstIn}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {isRegular ? currentTime.isBefore(breakStart) ? attend.first_time_in ? "Ongoing" : "-" : breakStart.add(1, 'm').format('hh:mm:ss A') : firstOut }
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {isRegular ? currentTime.isAfter(breakEnd) ? breakEnd.subtract(1, 'm').format('hh:mm:ss A') : "-" : secondIn }
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {isRegular ? currentTime.isBefore(breakEnd) ? "-" : firstOut : secondOut }
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
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
        </>
    )
}

export default Present;