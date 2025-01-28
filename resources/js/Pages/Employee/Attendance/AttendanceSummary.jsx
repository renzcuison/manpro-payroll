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
        console.log("oh hi");
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
        console.log("Updated summaryFromDate:", summaryFromDate);
        console.log("Updated summaryToDate:", summaryToDate);
        fetchAttendanceSummary();
    }, [summaryFromDate, summaryToDate]);

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
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="flex-end"
                                >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <DatePicker
                                            label="From Date"
                                            value={summaryFromDate}
                                            onChange={(newValue) => {
                                                setSummaryFromDate(newValue);
                                                if (
                                                    newValue.isAfter(
                                                        summaryToDate
                                                    )
                                                ) {
                                                    setSummaryToDate(newValue);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} />
                                            )}
                                            sx={{ mr: 2 }}
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
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <TableContainer>
                                    <Table aria-label="attendance summary table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Time In</TableCell>
                                                <TableCell>Time Out</TableCell>
                                                <TableCell>
                                                    Total Hours
                                                </TableCell>
                                                <TableCell>OT In</TableCell>
                                                <TableCell>OT Out</TableCell>
                                                <TableCell>Total OT</TableCell>
                                                <TableCell>
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
                                                            onClick={() =>
                                                                console.log(
                                                                    `${summary.date} entry clicked!`
                                                                )
                                                            }
                                                        >
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
                                                                {(() => {
                                                                    const totalMinutes =
                                                                        summary.total_time;
                                                                    const hours =
                                                                        Math.floor(
                                                                            totalMinutes /
                                                                                60
                                                                        );
                                                                    const minutes =
                                                                        totalMinutes %
                                                                        60;
                                                                    if (
                                                                        hours >
                                                                            0 &&
                                                                        minutes >
                                                                            0
                                                                    ) {
                                                                        return `${hours} hour${
                                                                            hours >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }, ${minutes} minute${
                                                                            minutes >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    } else if (
                                                                        hours >
                                                                        0
                                                                    ) {
                                                                        return `${hours} hour${
                                                                            hours >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    } else {
                                                                        return `${minutes} minute${
                                                                            minutes >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    }
                                                                })()}
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
                                                                {(() => {
                                                                    const totalOT =
                                                                        summary.total_ot;
                                                                    const hoursOT =
                                                                        Math.floor(
                                                                            totalOT /
                                                                                60
                                                                        );
                                                                    const minutesOT =
                                                                        totalOT %
                                                                        60;
                                                                    if (
                                                                        hoursOT >
                                                                            0 &&
                                                                        minutesOT >
                                                                            0
                                                                    ) {
                                                                        return `${hoursOT} hour${
                                                                            hoursOT >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }, ${minutesOT} minute${
                                                                            minutesOT >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    } else if (
                                                                        hoursOT >
                                                                        0
                                                                    ) {
                                                                        return `${hoursOT} hour${
                                                                            hoursOT >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    } else {
                                                                        return `${minutesOT} minute${
                                                                            minutesOT >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    }
                                                                })()}
                                                            </TableCell>
                                                            <TableCell>
                                                                {(() => {
                                                                    const totalLate =
                                                                        summary.late_time;
                                                                    const hoursLate =
                                                                        Math.floor(
                                                                            totalLate /
                                                                                60
                                                                        );
                                                                    const minutesLate =
                                                                        totalLate %
                                                                        60;
                                                                    if (
                                                                        hoursLate >
                                                                            0 &&
                                                                        minutesLate >
                                                                            0
                                                                    ) {
                                                                        return `${hoursLate} hour${
                                                                            hoursLate >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }, ${minutesLate} minute${
                                                                            minutesLate >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    } else if (
                                                                        hoursLate >
                                                                        0
                                                                    ) {
                                                                        return `${hoursLate} hour${
                                                                            hoursLate >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    } else {
                                                                        return `${minutesLate} minute${
                                                                            minutesLate >
                                                                            1
                                                                                ? "s"
                                                                                : ""
                                                                        }`;
                                                                    }
                                                                })()}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={8}
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

export default AttendanceSummary;
