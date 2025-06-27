import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, TextField, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

import AttendanceSummaryDetails from "./Modals/AttendanceSummaryDetails";
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';
import OvertimeApplication from "./Modals/OvertimeApplication";

const AttendanceRestDay = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendances, setAttendances] = useState([]);

    useEffect(() => {
        getAttendanceOvertime();
    }, []);

    const getAttendanceOvertime = () => {
        axiosInstance.get('/attendance/getAttendanceRestDay', { headers })
            .then((response) => {
                // Fetch Return here:

            setAttendances(response.data.attendances);

                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clients:', error);
                setIsLoading(false);
            });
    }

    const formatMinutes = (minutes) => {
        const roundedMinutes = Math.round(minutes);
        const hours = Math.floor(roundedMinutes / 60);
        const min = roundedMinutes % 60;
        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (min > 0 || hours > 0) result += `${min}m `;
        return result.trim();
    };

    const [openOTAppModal, setOpenOTAppModal] = useState(false);
    const [loadOvertime, setLoadOvertime] = useState(false);
    const handleOpenOTAppModal = (overtime) => {
        setLoadOvertime(overtime);
        setOpenOTAppModal(true);
    }
    const handleCloseOTAppModal = (reload) => {
        setOpenOTAppModal(false);
        if (reload) {
            getAttendanceOvertime();
        }
    }

    return (
        <Layout title={"AttendanceSummary"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "95%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}Rest Day Summary{" "}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer sx={{ minHeight: 400, maxHeight: 500 }}>
                                    <Table stickyHeader aria-label="attendance summary table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left">Day Type</TableCell>
                                                <TableCell align="left">Date</TableCell>
                                                <TableCell align="left">Time In</TableCell>
                                                <TableCell align="left">Time Out</TableCell>
                                                <TableCell align="left">Total Hours</TableCell>
                                                <TableCell align="left">OT In</TableCell>
                                                <TableCell align="left">OT Out</TableCell>
                                                <TableCell align="left">Total OT</TableCell>
                                                <TableCell align="left">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                       <TableBody>
                                            {attendances.length > 0 ? (
                                                attendances.map((attendance, index) => (
                                                    <TableRow key={attendance.id} onClick={() => handleOpenOTAppModal(attendance)}>
                                                        <TableCell align="left">{attendance.day_type}</TableCell>
                                                        <TableCell align="left">{dayjs(attendance.date).format('MMM D, YYYY')}</TableCell>
                                                        <TableCell align="left">{attendance.time_in ? dayjs(attendance.time_in).format('hh:mm A') : 'N/A'}</TableCell>
                                                        <TableCell align="left">{attendance.time_out ? dayjs(attendance.time_out).format('hh:mm A') : 'N/A'}</TableCell>
                                                        <TableCell align="left">{attendance.total_hours ? formatMinutes(attendance.total_hours) : 'N/A'}</TableCell>
                                                        <TableCell align="left">{attendance.ot_in ? dayjs(attendance.ot_in).format('hh:mm A') : 'N/A'}</TableCell>
                                                        <TableCell align="left">{attendance.ot_out ? dayjs(attendance.ot_out).format('hh:mm A') : 'N/A'}</TableCell>
                                                        <TableCell align="left">{attendance.total_ot ? formatMinutes(attendance.total_ot) : 'N/A'}</TableCell>
                                                        <TableCell align="left">{attendance.status}</TableCell>
                                                    </TableRow>
                                                    
                                                ))
                                            ) : (
                                              <TableRow>
                                                    <TableCell colSpan={9} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                        No Rest Day Attendance Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
            {openOTAppModal && (
                <OvertimeApplication
                    open={openOTAppModal}
                    close={handleCloseOTAppModal}
                    overtime={loadOvertime}
                />
            )}
        </Layout>
    );
};

export default AttendanceRestDay;
