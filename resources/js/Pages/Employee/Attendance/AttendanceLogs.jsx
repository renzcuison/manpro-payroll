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
        axiosInstance
            .get(`/attendance/getEmployeeAttendanceLogs`, { headers })
            .then((response) => {
                console.log(response.data);
                console.log(response.data.attendances[0]);
                setAttendanceLogs(response.data.attendances);
                setIsLoading(false);
            })
            .catch((error) => {
                // console.error("Error fetching employee:", error);
            });
    }, []);

    // ---------------- Date Filter
    const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
    const filteredLogs = attendanceLogs.filter(
        (log) => dayjs(log.timestamp).format("YYYY-MM-DD") === filterDate
    );

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
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="Filter by Date"
                                        value={dayjs(filterDate)}
                                        onChange={(newValue) =>
                                            setFilterDate(
                                                newValue.format("YYYY-MM-DD")
                                            )
                                        }
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
                                            {filteredLogs.length > 0 ? (
                                                filteredLogs.map(
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
