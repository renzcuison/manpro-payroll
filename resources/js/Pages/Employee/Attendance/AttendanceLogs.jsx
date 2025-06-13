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
    MenuItem,
    TextField,
    Grid,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    useMediaQuery,
    useTheme,
    Button,
    TablePagination,
} from "@mui/material";
import moment from "moment";
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

const AttendanceLogs = () => {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const theme = useTheme();
    const medScreen = useMediaQuery(theme.breakpoints.up('md'));

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [filterView, setFilterView] = useState(medScreen);

    // Date Filter States
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    const [selectedRange, setSelectedRange] = useState("today");
    const [selectedAttendanceType, setSelectedAttendanceType] = useState("All");

    // Fetch Attendance Logs on Mount
    useEffect(() => {
        fetchAttendanceLogs();
    }, [fromDate, toDate, selectedRange, selectedAttendanceType]);

    // API Functions
    const fetchAttendanceLogs = () => {
        setIsLoading(true);
        axiosInstance.get('/attendance/getEmployeeAttendanceLogs', {
            headers,
            params: {
                from_date: fromDate.format("YYYY-MM-DD"),
                to_date: toDate.format("YYYY-MM-DD"),
                action: selectedAttendanceType,
            },
        })
            .then((response) => {
                console.log("Initial fetch:", response.data);
                setAttendanceLogs(response.data.attendances || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching initial attendance logs:", error);
                setAttendanceLogs([]);
                setIsLoading(false);
            });
    };

    // Filter Handlers
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
                setFromDate(today.subtract(6, "day"));
                setToDate(today);
                break;
            case "last30days":
                handleFilterChange("range", today.subtract(29, "day"), today);
                break;
            case "thisMonth":
                handleFilterChange("range", today.startOf("month"), today);
                setFromDate(today.startOf("month"));
                setToDate(today);
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

    const setAttendanceType = (type) => {
        switch (type) {
            case "All":
                handleFilterChange("type", null, null, "All");
                break;
            case "Duty In":
                handleFilterChange("type", null, null, "Duty In");
                break;
            case "Duty Out":
                handleFilterChange("type", null, null, "Duty Out");
                break;
            case "Overtime In":
                handleFilterChange("type", null, null, "Overtime In");
                break;
            case "Overtime Out":
                handleFilterChange("type", null, null, "Overtime Out");
                break;
            default:
                break;
        }
    };

    const handleFilterChange = (type, newDate, rangeEnd = null, newSelectType = null) => {
        // Control variables
        let newFromDate = fromDate;
        let newToDate = toDate;
        let newType = selectedAttendanceType;

        //Filter Change Type
        if (type == "from") {
            newFromDate = newDate;
            setFromDate(newDate);
            if (newDate.isAfter(toDate)) {
                newToDate = newDate;
                setToDate(newDate);
            }
        } else if (type == "to") {
            newToDate = newDate;
            setToDate(newDate);
        } else if (type == "range") {
            newFromDate = newDate;
            setFromDate(newDate);
            newToDate = rangeEnd;
            setToDate(rangeEnd);
        } else if (type == "type") {
            newType = newSelectType;
            setSelectedAttendanceType(newType);
            console.log(newType);
        }
    };

    const filteredAttendance = attendanceLogs.filter((attendance) => {
        const attendanceDate = dayjs(attendance.timestamp || attendance.timeStamp);

        const isInDateRange =
            (!fromDate || attendanceDate.isSameOrAfter(fromDate, 'day')) &&
            (!toDate || attendanceDate.isSameOrBefore(toDate, 'day'));

        const matchesType =
            selectedAttendanceType === "All" ||
            attendance.action === selectedAttendanceType;

        return isInDateRange && matchesType;
    });

    const handleDateRangeChange = (start, end) => {
        if (!start && !end) {
            setFromDate(dayjs("1900-01-01"));
            setToDate(dayjs());
            setSelectedRange("all");
        } else {
            setFromDate(start);
            setToDate(end);
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
        <Layout title={"AttendanceLogs"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "95%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Attendance Logs{" "}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        <Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 4, px: 1, borderBottom: "1px solid #e0e0e0" }}>
                            {filterView && (
                                <>
                                    <Grid item xs={12} md={3} sx={{ mb: { xs: 2, md: 0 } }}>
                                        <FormControl sx={{ width: { xs: "100%", md: "180px" } }} >
                                            <InputLabel id="attendance-type-select-label"> Attendance Type </InputLabel>
                                            <Select
                                                labelId="attendance-type-select-label"
                                                id="attendance-type-select"
                                                value={selectedAttendanceType}
                                                label="Attendance Type"
                                                onChange={(event) => setAttendanceType(event.target.value)}
                                            >
                                                <MenuItem value="All"> All </MenuItem>
                                                <MenuItem value="Duty In"> Duty In </MenuItem>
                                                <MenuItem value="Duty Out"> Duty Out </MenuItem>
                                                <MenuItem value="Overtime In"> Overtime In </MenuItem>
                                                <MenuItem value="Overtime Out"> Overtime Out </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs />
                                    <Grid item xs="auto">
                                        <Box display="flex" justifyContent="flex-end">
                                            <DateRangePicker onRangeChange={handleDateRangeChange} />
                                        </Box>
                                    </Grid>
                                </>
                            )}
                            {!medScreen && (
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setFilterView(!filterView)}
                                    >
                                        <p className="m-0">
                                            {filterView ? (
                                                <><i className="fa fa-minus"></i> Hide Filters </>
                                            ) : (
                                                <><i className="fa fa-plus"></i> Show Filters </>
                                            )}
                                        </p>
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400, maxHeight: 500 }} >
                                <Table stickyHeader aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ width: "33%" }}> Date </TableCell>
                                            <TableCell align="center" sx={{ width: "33%" }}> Time </TableCell>
                                            <TableCell align="center" sx={{ width: "34%" }}> Action </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {paginatedAttendance.length > 0 ? (
                                            paginatedAttendance.map((log, index) => (
                                                <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff" }}>
                                                    <TableCell align="center">
                                                        {moment(log.timestamp, "YYYY-MM-DD HH:mm:ss").format("MMMM D, YYYY") || "-"}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {moment(log.timestamp, "YYYY-MM-DD HH:mm:ss").format("hh:mm:ss A") || "-"}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color:
                                                                    log.action === "Duty In" ? "#177604" :
                                                                    log.action === "Duty Out" ? "#f44336" :
                                                                    log.action === "Overtime In" ? "#e9ae20" :
                                                                    log.action === "Overtime Out" ? "#f57c00" :
                                                                    "#000000",
                                                            }}
                                                        >
                                                            {log.action || "-"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                    No Attendance Data Found
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
        </Layout>
    );
};

export default AttendanceLogs;
