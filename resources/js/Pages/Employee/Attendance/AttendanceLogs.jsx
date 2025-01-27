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

    // Date Filter: Preset Filters
    const setPredefinedDates = (range) => {
        const today = dayjs();
        switch (range) {
            case "today":
                handleDateChange("", today, today);
                break;
            case "yesterday":
                handleDateChange(
                    "",
                    today.subtract(1, "day"),
                    today.subtract(1, "day")
                );
                break;
            case "last7days":
                handleDateChange("", today.subtract(6, "day"), today);
                setFromDate(today.subtract(6, "day"));
                setToDate(today);
                break;
            case "last30days":
                handleDateChange("", today.subtract(29, "day"), today);
                break;
            case "thisMonth":
                handleDateChange("", today.startOf("month"), today);
                setFromDate(today.startOf("month"));
                setToDate(today);
                break;
            case "lastMonth":
                handleDateChange(
                    "",
                    today.subtract(1, "month").startOf("month"),
                    today.subtract(1, "month").endOf("month")
                );
                break;
            case "custom":
            default:
                // Custom range will be handled by the DatePickers directly
                break;
        }
        setSelectedRange(range);
    };

    // Date Filter: Update Handler
    const handleDateChange = (type, newDate, rangeEnd = null) => {
        let newFromDate = fromDate;
        let newToDate = toDate;
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
        } else {
            newFromDate = newDate;
            setFromDate(newDate);
            newToDate = rangeEnd;
            setToDate(rangeEnd);
        }
        //console.log(`new date set!`);
        //console.log(`from date: ${newFromDate.format("YYYY-MM-DD")}`);
        //console.log(`to date: ${newToDate.format("YYYY-MM-DD")}`);
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(
                    `/attendance/getEmployeeAttendanceLogs`,
                    {
                        headers,
                        params: {
                            from_date: newFromDate.format("YYYY-MM-DD"),
                            to_date: newToDate.format("YYYY-MM-DD"),
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
        <Layout title={"EmployeesList"}>
            <Box
                sx={{
                    overflowX: "scroll",
                    width: "100%",
                    whiteSpace: "nowrap",
                }}
            >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
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
                            Attendance Logs{" "}
                        </Typography>

                        <Link to="/admin/employees-add">
                            <Button variant="contained" color="primary">
                                <p className="m-0">
                                    <i className="fa fa-plus"></i> Add{" "}
                                </p>
                            </Button>
                        </Link>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 200,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <FormControl
                                    sx={{ mb: 2, mr: 2, width: "15%" }}
                                >
                                    <InputLabel id="date-range-select-label">
                                        Date Range
                                    </InputLabel>
                                    <Select
                                        labelId="date-range-select-label"
                                        id="date-range-select"
                                        value={selectedRange}
                                        label="Date Range"
                                        onChange={(event) =>
                                            setPredefinedDates(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <MenuItem value="today">Today</MenuItem>
                                        <MenuItem value="yesterday">
                                            Yesterday
                                        </MenuItem>
                                        <MenuItem value="last7days">
                                            Last 7 Days
                                        </MenuItem>
                                        <MenuItem value="last30days">
                                            Last 30 Days
                                        </MenuItem>
                                        <MenuItem value="thisMonth">
                                            This Month
                                        </MenuItem>
                                        <MenuItem value="lastMonth">
                                            Last Month
                                        </MenuItem>
                                        <MenuItem value="custom">
                                            Custom Range
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="From Date"
                                        value={fromDate}
                                        disabled={selectedRange !== "custom"}
                                        onChange={(newValue) => {
                                            handleDateChange("from", newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                        sx={{ mr: 2 }}
                                    />
                                    <DatePicker
                                        label="To Date"
                                        value={toDate}
                                        disabled={selectedRange !== "custom"}
                                        onChange={(newValue) => {
                                            handleDateChange("to", newValue);
                                        }}
                                        minDate={fromDate}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                                <TableContainer
                                    style={{ overflowX: "auto" }}
                                    sx={{ minHeight: 400 }}
                                >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    align="left"
                                                    sx={{ width: "40%" }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        Date
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="left"
                                                    sx={{ width: "40%" }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        Time
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="left"
                                                    sx={{ width: "20%" }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        Action
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {attendanceLogs.length > 0 ? (
                                                attendanceLogs.map(
                                                    (log, index) => (
                                                        <TableRow
                                                            key={index}
                                                            sx={{
                                                                p: 1,
                                                                backgroundColor:
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "#f9f9f9"
                                                                        : "#f0f0f0",
                                                            }}
                                                        >
                                                            <TableCell align="left">
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight:
                                                                            "medium",
                                                                    }}
                                                                >
                                                                    {moment(
                                                                        log.timestamp,
                                                                        "YYYY-MM-DD HH:mm:ss"
                                                                    ).format(
                                                                        "MMMM D, YYYY"
                                                                    )}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="left">
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight:
                                                                            "medium",
                                                                    }}
                                                                >
                                                                    {moment(
                                                                        log.timestamp,
                                                                        "YYYY-MM-DD HH:mm:ss"
                                                                    ).format(
                                                                        "hh:mm:ss A"
                                                                    )}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="left">
                                                                {" "}
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight:
                                                                            "bold",
                                                                        color:
                                                                            log.action ===
                                                                            "Duty In"
                                                                                ? "#177604"
                                                                                : log.action ===
                                                                                  "Duty Out"
                                                                                ? "#f44336"
                                                                                : log.action ===
                                                                                  "Overtime Start"
                                                                                ? "#e9ae20"
                                                                                : log.action ===
                                                                                  "Overtime End"
                                                                                ? "#f57c00"
                                                                                : "#000000",
                                                                    }}
                                                                >
                                                                    {log.action}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        align="center"
                                                        sx={{
                                                            color: "text.secondary",
                                                            p: 1,
                                                        }}
                                                    >
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
