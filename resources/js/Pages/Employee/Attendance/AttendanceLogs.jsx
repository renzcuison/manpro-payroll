import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
} from "@mui/material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";

const AttendanceLogs = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceLogs, setAttendanceLogs] = useState([]);

    // ---------------- Attendance Logs API
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axiosInstance.get(
                    `/attendance/getEmployeeAttendanceLogs`,
                    {
                        headers,
                        params: {
                            from_date: fromDate.format("YYYY-MM-DD"),
                            to_date: toDate.format("YYYY-MM-DD"),
                            action: "All",
                        },
                    }
                );
                console.log("Initial fetch:", response.data);
                setAttendanceLogs(response.data.attendances);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching initial attendance logs:", error);
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // ---------------- Date Filter
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    const [selectedRange, setSelectedRange] = useState("today");
    const [selectedAttendanceType, setSelectedAttendanceType] = useState("All");

    // Date Filter: Preset Filters
    const setPredefinedDates = (range) => {
        const today = dayjs();
        switch (range) {
            case "today":
                handleFilterChange("range", today, today);
                break;
            case "yesterday":
                handleFilterChange(
                    "range",
                    today.subtract(1, "day"),
                    today.subtract(1, "day")
                );
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
        }
    };

    // Filters: Update Handler
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

        // New API Fetch
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(
                    `/attendance/getEmployeeAttendanceLogs`,
                    {
                        headers,
                        params: {
                            from_date: newFromDate.format("YYYY-MM-DD"),
                            to_date: newToDate.format("YYYY-MM-DD"),
                            action: newType,
                        },
                    }
                );
                //console.log("Fetch after date change:", response.data);
                setAttendanceLogs(response.data.attendances);
                setIsLoading(false);
            } catch (error) {
                console.error(
                    "Error fetching attendance logs after date change:",
                    error
                );
                setIsLoading(false);
            }
        };

        setTimeout(fetchData, 0);
    };

    return (
        <Layout title={"AttendanceLogs"}>
            <Box sx={{ overflowX: "scroll", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Attendance Logs{" "}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid container direction="row" columnGap={1} justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                                    <Grid item xs={2}>
                                        <FormControl sx={{ mr: 2, width: "80%" }} >
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

                                    <Grid container item xs={8} direction="row" justifyContent="flex-end" >
                                        <Grid item xs={3} sx={{ mr: 2 }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="date-range-select-label"> Date Range </InputLabel>

                                                <Select
                                                    labelId="date-range-select-label"
                                                    id="date-range-select"
                                                    value={selectedRange}
                                                    label="Date Range"
                                                    onChange={(event) => setPredefinedDates(event.target.value)}
                                                >
                                                    <MenuItem value="today"> Today </MenuItem>
                                                    <MenuItem value="yesterday"> Yesterday </MenuItem>
                                                    <MenuItem value="last7days"> Last 7 Days </MenuItem>
                                                    <MenuItem value="last30days"> Last 30 Days </MenuItem>
                                                    <MenuItem value="thisMonth"> This Month </MenuItem>
                                                    <MenuItem value="lastMonth"> Last Month </MenuItem>
                                                    <MenuItem value="custom"> Custom Range </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={8}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <DatePicker
                                                            label="From Date"
                                                            value={fromDate}
                                                            onChange={(newValue) => {
                                                                setSelectedRange("custom");
                                                                handleFilterChange("from", newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField {...params} />
                                                            )}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={6}>
                                                        <DatePicker
                                                            label="To Date"
                                                            value={toDate}
                                                            onChange={(newValue) => {
                                                                setSelectedRange("custom");
                                                                handleFilterChange("to", newValue);
                                                            }}
                                                            minDate={fromDate}
                                                            renderInput={(params) => (
                                                                <TextField {...params} />
                                                            )}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </LocalizationProvider>
                                        </Grid>
                                    </Grid>

                                </Grid>

                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }} >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "33%" }}> Date </TableCell>
                                                <TableCell align="center" sx={{ width: "33%" }}> Time </TableCell>
                                                <TableCell align="center" sx={{ width: "34%" }}> Action </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {attendanceLogs.length > 0 ? (
                                                attendanceLogs.map(
                                                    (log, index) => (
                                                        <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff" }} >
                                                            <TableCell align="center"> {moment(log.timestamp, "YYYY-MM-DD HH:mm:ss").format("MMMM D, YYYY") || "-"} </TableCell>
                                                            <TableCell align="center"> {moment(log.timestamp, "YYYY-MM-DD HH:mm:ss").format("hh:mm:ss A") || "-"} </TableCell>
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
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                                        No Attendance Data Found
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
        </Layout>
    );
};

export default AttendanceLogs;
