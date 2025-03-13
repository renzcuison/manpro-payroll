import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem, FormControl, InputLabel, Select } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import EmployeeAddBenefit from '../Employees/Modals/EmployeeAddBenefit';
import EmploymentDetailsEdit from '../Employees/Modals/EmploymentDetailsEdit';

import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import AttendanceViewDetails from "./Modals/AttendanceViewDetails";
import AddAttendanceModal from './Modals/AddAttendanceModal';

const AttendanceView = () => {
    const { user } = useParams();

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // ---------------- Attendance Dates
    const [summaryFromDate, setSummaryFromDate] = useState(
        dayjs().startOf("month")
    );
    const [selectedRange, setSelectedRange] = useState("thisMonth");
    const [summaryToDate, setSummaryToDate] = useState(dayjs());
    const [summaryData, setSummaryData] = useState([]);
    const currentDate = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        getEmployeeDetails();
    }, []);

    useEffect(() => {
        if (employee) {
            getEmployeeAttendance();
        }
    }, [employee, summaryFromDate, summaryToDate]);

    // ---------------- Attendance Details
    const [openAttendanceDetails, setOpenAttendanceDetails] = useState(null);

    const handleOpenAttendanceDetails = (date) => {
        setOpenAttendanceDetails(date);
    };

    const handleCloseAttendanceDetails = () => {
        setOpenAttendanceDetails(null);
    };

    // ---------------- Add Attendance
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

    // ---------------- Employee API
    const getEmployeeDetails = () => {
        let data = { username: user };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setEmployee(response.data.employee);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
                setIsLoading(false);
            });
    };

    //--------------- Attendance API
    const getEmployeeAttendance = () => {
        axiosInstance.get( "/attendance/getEmployeeAttendanceSummary", { headers, params: { employee: employee.id, summary_from_date: summaryFromDate.format("YYYY-MM-DD"), summary_to_date: summaryToDate.format("YYYY-MM-DD")}})
            .then((response) => {
                setSummaryData(response.data.summary);
                setIsLoading(false);
            }).catch((error) => {
                console.error('Error fetching employee attendance:', error);
                setIsLoading(false);
            });
    }

    // ---------------- Summary Details
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
                setSummaryFromDate(today);
                setSummaryToDate(today);
                break;
            case "yesterday":
                setSummaryFromDate(today.subtract(1, "day"));
                setSummaryToDate(today.subtract(1, "day"));
                break;
            case "last7days":
                setSummaryFromDate(today.subtract(6, "day"));
                setSummaryToDate(today);
                break;
            case "last30days":
                setSummaryFromDate(today.subtract(29, "day"));
                setSummaryToDate(today);
                break;
            case "thisMonth":
                setSummaryFromDate(today.startOf("month"));
                setSummaryToDate(today);
                break;
            case "lastMonth":
                setSummaryFromDate(today.subtract(1, "month").startOf("month"));
                setSummaryToDate(today.subtract(1, "month").endOf("month"));
                break;
            case "custom":

            default:
                break;
        }
        setSelectedRange(range);
    };

    return (
        <Layout title={"EmployeeView"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Attendance - {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddAttendance} >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add {" "}
                            </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid container direction="row" justifyContent="flex-start" spacing={2} sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                                    <Grid item xs={2}>
                                        <FormControl fullWidth>
                                            <InputLabel id="date-range-select-label"> Date Range </InputLabel>

                                            <Select labelId="date-range-select-label" id="date-range-select" value={selectedRange} label="Date Range" onChange={(event) => setPredefinedDates(event.target.value)} >
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
                                    <Grid item xs={4}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                                            <DatePicker
                                                label="From Date"
                                                value={summaryFromDate}
                                                onChange={(newValue) => {
                                                    setSummaryFromDate(newValue);
                                                    if (newValue.isAfter(summaryToDate)) {
                                                        setSummaryToDate(newValue);
                                                    }
                                                    setSelectedRange("custom");
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
                                                    setSelectedRange("custom");
                                                }}
                                                minDate={summaryFromDate}
                                                renderInput={(params) => (
                                                    <TextField {...params} />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                                <TableContainer>
                                    <Table aria-label="attendance summary table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> Date </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> Time In </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> Time Out </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> Total Hours </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> OT In </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> OT Out </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> Total OT </TableCell>
                                                <TableCell align="center" sx={{ width: "12.5%" }}> Late/Absences </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {summaryData.length > 0 ? (
                                                summaryData.map(
                                                    (summary, index) => (
                                                        <TableRow
                                                            key={index}
                                                            onClick={() => handleOpenAttendanceDetails(summary.date)}
                                                            sx={{ backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer", }, }}
                                                        >
                                                            <TableCell align="center"> {dayjs(summary.date).format("MMMM D, YYYY")} </TableCell>
                                                            <TableCell align="center"> {summary.time_in ? dayjs(summary.time_in).format("hh:mm:ss A") : "-"} </TableCell>
                                                            <TableCell align="center"> {summary.time_out ? dayjs(summary.time_out).format("hh:mm:ss A") : (summary.time_in && summary.date != currentDate) ? "Failed to Time Out" : "-"} </TableCell>
                                                            <TableCell align="center"> {formatTime(summary.total_rendered)} </TableCell>
                                                            <TableCell align="center"> {summary.overtime_in ? dayjs(summary.overtime_in).format("hh:mm:ss A") : "-"} </TableCell>
                                                            <TableCell align="center"> {summary.overtime_out ? dayjs(summary.time_out).format("hh:mm:ss A") : summary.overtime_in ? "Failed to Time Out" : "-"} </TableCell>
                                                            <TableCell align="center"> {formatTime(summary.total_ot)} </TableCell>
                                                            <TableCell align="center">
                                                                <Typography sx={{ color: summary.date === currentDate ? "#177604" : summary.late_time > 0 ? "#f44336" : null }} >
                                                                    {summary.date == currentDate ? "Day Ongoing" : formatTime(summary.late_time)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center" sx={{ color: "text.secondary", p: 1, }}> No Attendance Found </TableCell>
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

            { openAttendanceDetails && ( <AttendanceViewDetails open={true} close={handleCloseAttendanceDetails} date={openAttendanceDetails} employee={employee.id} /> ) }
            { openAddAttendance && ( <AddAttendanceModal open={true} close={handleCloseAddAttendance} employee={employee.id} /> ) }
        </Layout>
    )
}

export default AttendanceView
