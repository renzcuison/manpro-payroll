import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem, FormControl, InputLabel, Select, TextField } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead';
import PageToolbar from '../../../components/Table/PageToolbar';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import EastIcon from '@mui/icons-material/East';
import EmploymentDetailsEdit from '../../../Modals/Employees/EmployeeDetailsEdit';
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import AttendanceViewDetails from "./Modals/AttendanceViewDetails";
import AddAttendanceModal from './Modals/AddAttendanceModal';

import DateRangePicker from '../../../components/DateRangePicker';

const AttendanceView = () => {
    const { user } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [summaryFromDate, setSummaryFromDate] = useState(dayjs().startOf("month"));
    const [selectedRange, setSelectedRange] = useState("thisMonth");
    const [summaryToDate, setSummaryToDate] = useState(dayjs());
    const [summaryData, setSummaryData] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const currentDate = dayjs().format("YYYY-MM-DD");
    const selectedEmployeeId = employeeList.find((emp) => emp.emp_user_name === user)?.emp_id || employee?.emp_id || "";
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    
    const navigate = useNavigate();

    const getEmployeeList = () => {
        axiosInstance.get("/attendance/getAttendanceSummary", { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setEmployeeList(response.data.summary);
                }
            }).catch((error) => {
                console.error('Error fetching employee list:', error);
            });
    };

    useEffect(() => {
        getEmployeeDetails();
        getEmployeeList();
    }, [user]);

    useEffect(() => {
        if (employee) {
            getEmployeeAttendance();
        }
    }, [employee, summaryFromDate, summaryToDate]);



    const [openAttendanceDetails, setOpenAttendanceDetails] = useState(null);

    const handleOpenAttendanceDetails = (summary) => {
        const ongoing = summary.date === currentDate;
        const viewInfo = {
            date: summary.date,
            ongoing: ongoing,
            total_rendered: summary.total_rendered,
            total_overtime: summary.total_overtime,
            total_late: summary.late_time,
        };
        setOpenAttendanceDetails(viewInfo);
    };

    const handleCloseAttendanceDetails = (reload) => {
        setOpenAttendanceDetails(null);
        if (reload) {
            getEmployeeAttendance();
        }
    };

    const [openAddAttendance, setOpenAddAttendance] = useState(false);

    const handleOpenAddAttendance = () => {
        setOpenAddAttendance(true);
    };

    const handleCloseAddAttendance = (reload) => {
        setOpenAddAttendance(false);
        if (reload) {
            getEmployeeAttendance();
        }
    };

    const getEmployeeDetails = () => {
        const data = { username: user };
        setIsLoading(true);

        axiosInstance
            .get(`/employee/getEmployeeShortDetails`, {
                params: data,
                headers,
            })
            .then((response) => {
                if (response.data.status === 200) {
                    const foundEmployee = response.data.employee;
                    if (foundEmployee) {
                        setEmployee(foundEmployee);
                    } else {
                        console.warn('Employee not found in the list.');
                    }
                } else {
                    console.warn('Unexpected status code:', response.data.status);
                }
            })
            .catch((error) => {
                console.error('Error fetching employee:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getEmployeeAttendance = () => {

        if (!summaryFromDate || !summaryToDate || !employee) return;

        setIsLoading(true);
        axiosInstance.get("/attendance/getEmployeeAttendanceSummary", { headers, params: { employee: employee?.emp_id || employee.id, summary_from_date: summaryFromDate.format("YYYY-MM-DD"), summary_to_date: summaryToDate.format("YYYY-MM-DD") } })
            .then((response) => {
                setSummaryData(response.data.summary);
                setIsLoading(false);
            }).catch((error) => {
                console.error('Error fetching employee attendance:', error);
                setIsLoading(false);
            });
    };

    const formatTime = (time) => {
        if (!time) return '-';
        const absTime = Math.abs(time);
        const hours = Math.floor(absTime / 60);
        const minutes = absTime % 60;
        return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
    };
    
    const handleDateRangeChange = (start, end) => {
        console.log("Selected range in AttendanceView:", start?.format(), end?.format());
        if (!start && !end) {
            setSummaryFromDate(dayjs("1900-01-01"));
            setSummaryToDate(dayjs());
            setSelectedRange("all");
        } else if (start && end) {
            setSummaryFromDate(start);
            setSummaryToDate(end);
            setSelectedRange("custom");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [rangeStartDate, setRangeStartDate] = useState(null);
    const [rangeEndDate, setRangeEndDate] = useState(null);

    const filteredSummaryData = summaryData.filter((record) => {
        const attendanceDate = dayjs(record.date_attended);
        const matchedDateRange = (!rangeStartDate || !rangeEndDate) ||
            (attendanceDate.isSameOrAfter(rangeStartDate, 'day') &&
            attendanceDate.isSameOrBefore(rangeEndDate, 'day'));

        return matchedDateRange;
    });

    return (
        <Layout title={"EmployeeView"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Attendance Summary </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddAttendance}>
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add
                            </p>
                        </Button>
                    </Box>
                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
                                    <Box>
                                        <FormControl fullWidth sx={{ width: '400px', mr: 2 }}>
                                            <InputLabel id="employee-select-label">Employees</InputLabel>
                                            <Select
                                                labelId="employee-select-label"
                                                id="employees"
                                                value={selectedEmployeeId}
                                                label="Employees"
                                                onChange={(e) => {
                                                    const selected = employeeList.find(emp => emp.emp_id === e.target.value);
                                                    setEmployee(selected);

                                                    if (selected) {
                                                        navigate(`/admin/attendance/${selected.emp_user_name}`)
                                                    }
                                                }}
                                            >
                                                {employeeList && Array.isArray(employeeList) && employeeList.length > 0 ? (
                                                    employeeList.map((emp) => (
                                                        <MenuItem key={emp.emp_id} value={emp.emp_id}>
                                                            {`${emp.emp_first_name} ${emp.emp_middle_name || ''} ${emp.emp_last_name} ${emp.emp_suffix || ''}`}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>No employees found</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Grid container direction="row" justifyContent="flex-end" spacing={2} sx={{ pb: 4}}>
                                        <Grid item xs={4}>
                                            <DateRangePicker onRangeChange={handleDateRangeChange} />
                                        </Grid>
                                    </Grid>
                                </Box>
                                <TableContainer>
                                    <Table aria-label="attendance summary table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>Date</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>Time In</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>Time Out</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>Total Hours</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>OT In</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>OT Out</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>Total OT</TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}>Late/Absences</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredSummaryData.length > 0 ? (
                                                filteredSummaryData
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((summary, index) => (
                                                        <TableRow
                                                            key={index}
                                                            onClick={() => handleOpenAttendanceDetails(summary)}
                                                            sx={{ backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" } }}
                                                        >
                                                            <TableCell align="center">{dayjs(summary.date).format("MMMM D, YYYY")}</TableCell>
                                                            <TableCell align="center">{summary.time_in ? dayjs(summary.time_in).format("hh:mm:ss A") : "-"}</TableCell>
                                                            <TableCell align="center">
                                                                {summary.time_out ? dayjs(summary.time_out).format("hh:mm:ss A") : (summary.time_in && summary.date !== currentDate) ? "Failed to Time Out" : "-"}
                                                            </TableCell>
                                                            <TableCell align="center">{formatTime(summary.total_rendered)}</TableCell>
                                                            <TableCell align="center">{summary.overtime_in ? dayjs(summary.overtime_in).format("hh:mm:ss A") : "-"}</TableCell>
                                                            <TableCell align="center">
                                                                {summary.overtime_out ? dayjs(summary.overtime_out).format("hh:mm:ss A") : summary.overtime_in ? "Failed to Time Out" : "-"}
                                                            </TableCell>
                                                            <TableCell align="center">{formatTime(summary.total_overtime)}</TableCell>
                                                            <TableCell align="center">
                                                                <Typography sx={{ color: summary.date === currentDate ? "#177604" : summary.late_time > 0 ? "#f44336" : null }}>
                                                                    {summary.date === currentDate ? "Day Ongoing" : formatTime(summary.late_time)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center" sx={{ color: "text.secondary", p: 1 }}>No Attendance Found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={summaryData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
            {openAttendanceDetails && <AttendanceViewDetails open={true} close={handleCloseAttendanceDetails} viewInfo={openAttendanceDetails} employee={employee?.id} />}
            {openAddAttendance && <AddAttendanceModal open={true} close={handleCloseAddAttendance} employee={employee} />}
        </Layout>
    );
};

export default AttendanceView;