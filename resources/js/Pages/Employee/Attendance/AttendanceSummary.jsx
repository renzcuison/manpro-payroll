import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    TextField,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Button,
    Divider
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

import AttendanceSummaryDetails from "./Modals/AttendanceSummaryDetails";

const AttendanceSummary = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const theme = useTheme();
    const medScreen = useMediaQuery(theme.breakpoints.up('md'));

    const [isLoading, setIsLoading] = useState(true);
    const [filterView, setFilterView] = useState(medScreen);

    // Attendance Filters
    const [summaryFromDate, setSummaryFromDate] = useState(dayjs().startOf("month"));
    const [summaryToDate, setSummaryToDate] = useState(dayjs());

    // Attendance Lists
    const [summaryData, setSummaryData] = useState([]);
    const currentDate = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        fetchAttendanceSummary();
    }, [summaryFromDate, summaryToDate]);

    // Summary API
    const fetchAttendanceSummary = () => {
        setIsLoading(true);
        const data = {
            summary_from_date: summaryFromDate.format("YYYY-MM-DD"),
            summary_to_date: summaryToDate.format("YYYY-MM-DD"),
        };
        axiosInstance.get(`/attendance/getEmployeeAttendanceSummary`, { params: data, headers })
            .then((response) => {
                if (response.data.status == 200) {
                    setSummaryData(response.data.summary);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.error("Error fetching attendance summary:", error);
                setIsLoading(false);
            });
    }

    // Summary Detail
    const [openAttendanceDetails, setOpenAttendanceDetails] = useState(false);
    const [loadAttendance, setLoadAttendance] = useState(null);
    const handleOpenAttendanceDetails = (summary) => {
        const ongoing = summary.date == currentDate;
        const viewInfo = {
            date: summary.date,
            ongoing: ongoing,
            total_rendered: summary.total_rendered,
            total_overtime: summary.total_overtime,
            total_late: summary.late_time,
        };
        setOpenAttendanceDetails(true);
        setLoadAttendance(viewInfo);
    };

    const handleCloseAttendanceDetails = () => {
        setOpenAttendanceDetails(false);
    };

    // Time Formatter
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
        <Layout title={"AttendanceSummary"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "95%" } }}>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}
                            Attendance Summary{" "}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        {filterView && (
                            <Box display="flex" gap={2} sx={{ pb: 2, width: "100%", justifyContent: "flex-start", flexDirection: { xs: "column", md: "row" } }} >
                                <LocalizationProvider dateAdapter={AdapterDayjs} >
                                    <DatePicker
                                        label="From Date"
                                        value={summaryFromDate}
                                        onChange={(newValue) => {
                                            setSummaryFromDate(newValue);
                                            if (newValue.isAfter(summaryToDate)) {
                                                setSummaryToDate(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                        sx={{ minWidth: { xs: "100%", md: "200px" }, maxWidth: { xs: "100%", md: "30%" } }}
                                    />
                                    <DatePicker
                                        label="To Date"
                                        value={summaryToDate}
                                        onChange={(newValue) => {
                                            setSummaryToDate(newValue);
                                        }}
                                        minDate={summaryFromDate}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                        sx={{ minWidth: { xs: "100%", md: "200px" }, maxWidth: { xs: "100%", md: "30%" } }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        )}
                        {!medScreen && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setFilterView(!filterView)}
                                sx={{ mb: 2 }}
                            >
                                <p className="m-0">
                                    {filterView ? (
                                        <><i className="fa fa-minus"></i> Hide Filters </>
                                    ) : (
                                        <><i className="fa fa-plus"></i> Show Filters </>
                                    )}
                                </p>
                            </Button>
                        )}
                        <Divider />
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer sx={{ minHeight: 400, maxHeight: 500 }}>
                                <Table stickyHeader aria-label="attendance summary table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                Date
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                Time In
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                Time Out
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                Total Hours
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                OT In
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                OT Out
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                Total OT
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "12.5%" }}>
                                                Late/Absences
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {summaryData.length > 0 ? (
                                            summaryData.map(
                                                (summary, index) => (
                                                    <TableRow
                                                        key={index}
                                                        onClick={() => handleOpenAttendanceDetails(summary)}
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
                                                        <TableCell align="center">
                                                            {dayjs(summary.date).format("MMMM D, YYYY")}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {summary.time_in
                                                                ? dayjs(summary.time_in).format("hh:mm:ss A")
                                                                : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {summary.time_out
                                                                ? dayjs(summary.time_out).format("hh:mm:ss A")
                                                                : (summary.time_in && summary.date != currentDate) ? "Failed to Time Out"
                                                                    : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {formatTime(summary.total_rendered)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {summary.overtime_in
                                                                ? dayjs(summary.overtime_in).format("hh:mm:ss A")
                                                                : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {summary.overtime_out
                                                                ? dayjs(summary.overtime_out).format("hh:mm:ss A")
                                                                : summary.overtime_in ? "Failed to Time Out"
                                                                    : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {formatTime(summary.total_overtime)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                sx={{
                                                                    color:
                                                                        summary.date === currentDate
                                                                            ? "#177604"
                                                                            : summary.late_time > 0 ? "#f44336"
                                                                                : null,
                                                                }}
                                                            >
                                                                {summary.date == currentDate ? "Day Ongoing" : formatTime(summary.late_time)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    align="center"
                                                    sx={{ color: "text.secondary", p: 1, }}>
                                                    No Attendance Found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Box>
            </Box>
            {
                openAttendanceDetails && (
                    <AttendanceSummaryDetails
                        open={openAttendanceDetails}
                        close={handleCloseAttendanceDetails}
                        viewInfo={loadAttendance}
                        medScreen={medScreen}
                    />
                )
            }
        </Layout >
    );
};

export default AttendanceSummary;
