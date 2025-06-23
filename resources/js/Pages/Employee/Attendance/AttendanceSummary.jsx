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
    Divider,
    TablePagination
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import DateRangePicker from '../../../components/DateRangePicker';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
    const [selectedRange, setSelectedRange] = useState("today");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Attendance Lists
    const [summaryData, setSummaryData] = useState([]);
    const currentDate = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        fetchAttendanceSummary();
    }, [summaryFromDate, summaryToDate]);

    // Summary API
    const fetchAttendanceSummary = () => {
        console.log("fetchAttendanceSummary:", {
            summaryFromDate,
            summaryToDate,
            isFromValid: dayjs(summaryFromDate).isValid(),
            isToValid: dayjs(summaryToDate).isValid(),
            fromType: typeof summaryFromDate,
            toType: typeof summaryToDate,
        });

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

    const setPredefinedDates = (range) => {
        const today = dayjs();
        switch (range) {
            case "today":
                handleFilterChange("range", today, today);
                break;
            case "yesterday":
                handleFilterChange("range", today.subtract(1, "day"), today.subtract(1, "day"));
                break;
            case "last7days":
                handleFilterChange("range", today.subtract(6, "day"), today);
                break;
            case "last30days":
                handleFilterChange("range", today.subtract(29, "day"), today);
                break;
            case "thisMonth":
                handleFilterChange("range", today.startOf("month"), today);
                break;
            case "lastMonth":
                handleFilterChange("range", today.subtract(1, "month").startOf("month"), today.subtract(1, "month").endOf("month"));
                break;
            case "custom":
                break;
            default:
                break;
        }
        setSelectedRange(range);
    };

    const handleFilterChange = (type, newDate, rangeEnd = null) => {
        console.log("handleFilterChange", { type, newDate, rangeEnd });
        if (type === "from") {
            setSummaryFromDate(newDate);
            if (newDate.isAfter(summaryToDate)) {
                setSummaryToDate(newDate);
            }
        } else if (type === "to") {
            setSummaryToDate(newDate);
        } else if (type === "range") {
            setSummaryFromDate(newDate);
            setSummaryToDate(rangeEnd);
        }
    };

    const filteredAttendance = summaryData.filter((attendance) => {
        // Use the correct date field for summary data
        const attendanceDate = dayjs(attendance.date);

        const isInDateRange =
            (!summaryFromDate || attendanceDate.isSameOrAfter(summaryFromDate, 'day')) &&
            (!summaryToDate || attendanceDate.isSameOrBefore(summaryToDate, 'day'));

        return isInDateRange;
    });

    const handleDateRangeChange = (start, end) => {
        console.log("handleDateRangeChange", { start, end });
        if (!start && !end) {
            setSummaryFromDate(dayjs("1900-01-01"));
            setSummaryToDate(dayjs());
            setSelectedRange("all");
        } else {
            setSummaryFromDate(start);
            setSummaryToDate(end);
            setSelectedRange("custom");
        }
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedAttendance = filteredAttendance.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


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
                            <Box display="flex" gap={2} sx={{ pb: 2, width: "20%", justifyContent: "flex-start", flexDirection: { xs: "column", md: "row" } }} >
                                <DateRangePicker
                                    summaryFromDate={summaryFromDate}
                                    summaryToDate={summaryToDate}
                                    defaultRange={[dayjs().startOf("month"), dayjs().endOf("month")]}
                                    onRangeChange={(start, end) => handleFilterChange("range", start, end)}
                                />
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
                                        {paginatedAttendance.length > 0 ? (
                                            paginatedAttendance.map((summary, index) => (
                                                <TableRow
                                                    key={index}
                                                    onClick={() => handleOpenAttendanceDetails(summary)}
                                                    sx={{
                                                        backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff",
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
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                    No Attendance Found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredAttendance.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                ".MuiTablePagination-actions": { mb: 2 },
                                ".MuiInputBase-root": { mb: 2 },
                                bgcolor: "#ffffff",
                                borderRadius: "8px"
                            }}
                        />
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
