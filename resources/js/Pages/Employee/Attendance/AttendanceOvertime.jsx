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

const AttendanceSummary = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [overtimeData, setOvertimeData] = useState([]);

    useEffect(() => {
        getAttendanceOvertime();
    }, []);

    const getAttendanceOvertime = () => {
        axiosInstance.get('/attendance/getAttendanceOvertime', { headers })
            .then((response) => {
                setOvertimeData(response.data.overtime);
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
                            {" "}Overtime Summary{" "}
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
                                                <TableCell align="left">Date</TableCell>
                                                <TableCell align="center">Overtime In</TableCell>
                                                <TableCell align="center">Overtime Out</TableCell>
                                                <TableCell align="center">Total Overtime</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {overtimeData.length > 0 ? (
                                                overtimeData.map((overtime, index) => (
                                                    <TableRow
                                                        key={index}
                                                        onClick={() => handleOpenOTAppModal(overtime)}
                                                        sx={{
                                                            backgroundColor:
                                                                index % 2 === 0
                                                                    ? "#f8f8f8"
                                                                    : "#ffffff",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                                                cursor: "pointer",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell align="left">
                                                            {dayjs(overtime.date).format('MMMM D, YYYY')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(`${overtime.date}T${overtime.timeIn}`).format('hh:mm:ss A')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(`${overtime.date}T${overtime.timeOut}`).format('hh:mm:ss A')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {formatMinutes(overtime.minutes)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                sx={{
                                                                    fontWeight:
                                                                        "bold",
                                                                    color:
                                                                        ["Approved", "Paid"].includes(overtime.status)
                                                                            ? "#177604"
                                                                            : overtime.status === "Declined"
                                                                                ? "#f44336"
                                                                                : overtime.status === "Pending"
                                                                                    ? "#e9ae20"
                                                                                    : ["Cancelled", "Unapplied"].includes(overtime.status)
                                                                                        ? "#f57c00"
                                                                                        : "#000000",
                                                                }}
                                                            >
                                                                {overtime.status.toUpperCase() || "-"}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        align="center"
                                                        sx={{ color: "text.secondary", p: 1, }}>
                                                        No Overtime Found
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

export default AttendanceSummary;
