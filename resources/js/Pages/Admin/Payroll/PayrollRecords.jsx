import React, { useState, useEffect } from 'react'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material'
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";
import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

import PayslipView from '../../../Modals/Payroll/PayslipView';

const PayrollRecords = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [dataUpdated, setDataUpdated] = useState(false);

    const [openViewPayrollModal, setOpenViewPayrollModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState('');

    const [records, setRecords] = useState([]);

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [cutOff, setCutOff] = useState('');
    const [searchName, setSearchName] = useState('');


    const today = dayjs();
    const currentYear = today.year().toString();
    const currentMonth = today.format('MMMM');
    const currentCutOff = today.date() <= 15 ? 'First' : 'Second';

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedCutOff, setSelectedCutOff] = useState(currentCutOff);
    const years = useMemo(() => Array.from({ length: today.year() - 2014 }, (_, i) => (2025 - i).toString()), []);
    const [months, setMonths] = useState([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]);


    useEffect(() => {
        getRecords();
    }, []);

    const getRecords = () => {
        axiosInstance.get('/payroll/getEmployeesPayrollRecords', { headers })
        .then((response) => {
            setRecords(response.data.records);
            setIsLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching payroll calculations:', error);
        }); 
    }
    
    const handleOpenViewPayrollModal = (id) => {
        setSelectedPayroll(id);
        setOpenViewPayrollModal(true);
    }

    const handleCloseViewPayrollModal = () => {
        getRecords();
        setOpenViewPayrollModal(false);
    }

    const filteredRecords = records.filter((record) => {
        const recordDate = dayjs(record.payrollEndDate);

        const matchesYear = selectedYear ? recordDate.year().toString() === selectedYear : true;
        const matchesMonth = selectedMonth ? recordDate.format('MMMM') === selectedMonth : true;
        const matchesCutoff = selectedCutOff ? record.payrollCutOff === selectedCutOff : true;
        const matchesName = searchName ? record.employeeName.toLowerCase().includes(searchName.toLowerCase()) : true;

        return matchesYear && matchesMonth && matchesCutoff && matchesName;
    });


    return (
        <Layout title={"PayrollProcess"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'left' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Payroll Records </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Box sx={{display: 'flex', justifyContent:'space-between'}}>
                            <TextField
                                label="Search name"
                                variant="outlined"
                                size="small"
                                sx={{ mb: 2 }}
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />

                            <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'end', }}>
                                <FormControl size="small" sx={{ minWidth: 120, backgroundColor: '#ffffff' }}>
                                    <InputLabel>Year</InputLabel>
                                    <Select
                                        value={selectedYear}
                                        label="Year"
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {years.map((year) => (
                                            <MenuItem key={year} value={year}>
                                                {year}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 120, backgroundColor: '#ffffff' }}>
                                    <InputLabel>Month</InputLabel>
                                    <Select
                                        value={selectedMonth}
                                        label="Month"
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {[
                                            'January', 'February', 'March', 'April', 'May', 'June',
                                            'July', 'August', 'September', 'October', 'November', 'December'
                                        ].map((month) => (
                                            <MenuItem key={month} value={month}>{month}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 120, backgroundColor: '#ffffff' }}>
                                    <InputLabel>Cutoff</InputLabel>
                                    <Select
                                        value={selectedCutOff}
                                        label="Cutoff"
                                        onChange={(e) => setSelectedCutOff(e.target.value)}
                                    >
                                        <MenuItem value="First">First</MenuItem>
                                        <MenuItem value="Second">Second</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                        
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table" className="table table-md table-striped table-vcenter table-bordered">
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Payroll Date</TableCell>
                                                <TableCell align="center">Cut-Off</TableCell>
                                                <TableCell align="center">Gross Pay</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredRecords.length > 0 ? (
                                                filteredRecords.map((record) => (
                                                <TableRow key={record.record} onClick={() => handleOpenViewPayrollModal(record.record)} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }}>
                                                    <TableCell align="left">{record.employeeName}</TableCell>
                                                    <TableCell align="center">{record.employeeBranch}</TableCell>
                                                    <TableCell align="center">{record.employeeDepartment}</TableCell>
                                                    <TableCell align="center">{record.role}</TableCell>
                                                    <TableCell align="center">{dayjs(record.payrollStartDate).format("MMM D, YYYY")} - {dayjs(record.payrollEndDate).format("MMM D, YYYY")}</TableCell>
                                                    <TableCell align="center">{record.payrollCutOff}</TableCell>
                                                    <TableCell align="center">{record.payrollGrossPay}</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ fontStyle: 'italic', color: '#888', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                    No records found for the selected filters.
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

                {openViewPayrollModal &&
                    <PayslipView open={openViewPayrollModal} close={handleCloseViewPayrollModal} selectedPayroll={selectedPayroll} />
                }

            </Box>
        </Layout >
    )
}

export default PayrollRecords
