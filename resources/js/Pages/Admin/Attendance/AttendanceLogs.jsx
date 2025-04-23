import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, CircularProgress, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const AttendanceLogs = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendances, setAttendances] = useState([]);

    const [searchName, setSearchName] = useState('');
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    const [selectedRange, setSelectedRange] = useState("today");

    useEffect(() => {
        getAttendanceLogs();
    }, [fromDate, toDate, selectedRange]);

    const getAttendanceLogs = () => {
        axiosInstance.get('/attendance/getAttendanceLogs', {
            headers, params: {
                from_date: fromDate.format("YYYY-MM-DD"),
                to_date: toDate.format("YYYY-MM-DD"),
            },
        })
            .then((response) => {
                console.log('API Response:', response.data);
                setAttendances(response.data.attendances || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching attendance logs:', error);
                setIsLoading(false);
                setAttendances([]);
            });
    }

    const handleFilterChange = (type, newDate, rangeEnd = null) => {
        // Control variables
        let newFromDate = fromDate;
        let newToDate = toDate;

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
        }
    };

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

    const filteredAttendance = attendances.filter((attendance) => {
        return attendance.name.toLowerCase().includes(searchName.toLowerCase());
    });

    return (
        <Layout title={"AttendanceLogs"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Attendance Logs </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {/* Filters */}
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid container direction="row" justifyContent="flex-start" size={8} spacing={2}>
                                <FormControl sx={{ width: { xs: "100%", md: "180px" }, mr: 2 }}>
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
                                <LocalizationProvider dateAdapter={AdapterDayjs} >
                                    <DatePicker
                                        label="From Date"
                                        value={fromDate}
                                        onChange={(newValue) => {
                                            setSelectedRange("custom");
                                            handleFilterChange("from", newValue);
                                        }}
                                        maxDate={dayjs()}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                        sx={{ mr: 2, minWidth: { xs: "100%", md: "200px" }, maxWidth: { xs: "100%", md: "30%" } }}
                                    />
                                    <DatePicker
                                        label="To Date"
                                        value={toDate}
                                        onChange={(newValue) => {
                                            setSelectedRange("custom");
                                            handleFilterChange("to", newValue);
                                        }}
                                        minDate={fromDate}
                                        maxDate={dayjs()}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                        sx={{ minWidth: { xs: "100%", md: "200px" }, maxWidth: { xs: "100%", md: "30%" } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid container direction="row" justifyContent="flex-end" size={{ xs: 2 }} spacing={2}>
                                <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } } }}>
                                    <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                </FormControl>
                            </Grid>
                        </Grid>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400, maxHeight: 500 }}>
                                <Table stickyHeader aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Name</TableCell>
                                            <TableCell align="center">Branch</TableCell>
                                            <TableCell align="center">Department</TableCell>
                                            <TableCell align="center">Role</TableCell>
                                            <TableCell align="center">Timestamp</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {!Array.isArray(filteredAttendance) || filteredAttendance.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAttendance.map((attendance) => (
                                                <TableRow key={attendance.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }} >
                                                    <TableCell align="left">{attendance.name || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.branch || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.department || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.role || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.timeStamp || '-'}</TableCell>
                                                    <TableCell align="center">{attendance.action || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout>
    );
};

export default AttendanceLogs;