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

const AttendanceSummary = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    // ---------------- Attendance Logs API
    const [summaryFromDate, setSummaryFromDate] = useState(
        dayjs().startOf("month")
    );
    const [summaryToDate, setSummaryToDate] = useState(dayjs());
    const [summaryData, setSummaryData] = useState([]);

    const fetchAttendanceSummary = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(
                "/attendance/getEmployeeAttendanceSummary",
                {
                    headers,
                    params: {
                        summary_from_date: summaryFromDate.format("YYYY-MM-DD"),
                        summary_to_date: summaryToDate.format("YYYY-MM-DD"),
                    },
                }
            );
            setSummaryData(response.data.summary);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching attendance summary:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceSummary();
    }, []);

    return (
        <Layout title={"EmployeesList"}>
            <Box
                sx={{
                    overflowX: "auto",
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
                            Attendance Summary{" "}
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
                                {" "}
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="From Date"
                                        value={summaryFromDate}
                                        onChange={(newValue) =>
                                            setSummaryFromDate(newValue)
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                    <DatePicker
                                        label="To Date"
                                        value={summaryToDate}
                                        onChange={(newValue) =>
                                            setSummaryToDate(newValue)
                                        }
                                        minDate={summaryFromDate}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                    <Button
                                        onClick={fetchAttendanceSummary}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Loading..."
                                            : "Fetch Summary"}
                                    </Button>
                                </LocalizationProvider>
                                <TableContainer>
                                    <Table aria-label="attendance summary table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Time In</TableCell>
                                                <TableCell>Time Out</TableCell>
                                                <TableCell>
                                                    Overtime In
                                                </TableCell>
                                                <TableCell>
                                                    Overtime Out
                                                </TableCell>
                                                <TableCell>
                                                    Total Hours
                                                </TableCell>
                                                <TableCell>Total OT</TableCell>
                                                <TableCell>Late</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {summaryData.map(
                                                (summary, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {dayjs(
                                                                summary.date
                                                            ).format(
                                                                "MMMM D, YYYY"
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {summary.time_in
                                                                ? dayjs(
                                                                      summary.time_in
                                                                  ).format(
                                                                      "hh:mm:ss A"
                                                                  )
                                                                : "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {summary.time_out
                                                                ? dayjs(
                                                                      summary.time_out
                                                                  ).format(
                                                                      "hh:mm:ss A"
                                                                  )
                                                                : "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {summary.overtime_in
                                                                ? dayjs(
                                                                      summary.overtime_in
                                                                  ).format(
                                                                      "hh:mm:ss A"
                                                                  )
                                                                : "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {summary.overtime_out
                                                                ? dayjs(
                                                                      summary.overtime_out
                                                                  ).format(
                                                                      "hh:mm:ss A"
                                                                  )
                                                                : "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                summary.total_hours
                                                            }{" "}
                                                            hours
                                                        </TableCell>
                                                        <TableCell>
                                                            {summary.total_ot}{" "}
                                                            hours
                                                        </TableCell>
                                                        <TableCell>
                                                            {summary.is_late}
                                                        </TableCell>
                                                    </TableRow>
                                                )
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

export default AttendanceSummary;
