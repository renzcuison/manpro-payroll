import React, { useState, useEffect } from 'react'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material'
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

import PayslipView from '../../../Modals/Payroll/PayslipView';

const PayrollSummary = () => {
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

    useEffect(() => {
        axiosInstance.get('/payroll/getPayrollSummary', { headers })
            .then((response) => {
                setRecords(response.data.records);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching payroll calculations:', error);
            }); 
    }, []);
    
    const handleOpenViewPayrollModal = (id) => {
        setSelectedPayroll(id);
        setOpenViewPayrollModal(true);
    }

    const handleCloseViewPayrollModal = () => {
        setOpenViewPayrollModal(false);
    }

    return (
        <Layout title={"PayrollProcess"}>
            <Box sx={{ width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '95%' }}} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'left' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Summary of Payroll </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table className="table table-md  table-striped  table-vcenter table-bordered">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" rowSpan={2}>Employee Name</TableCell>
                                                <TableCell align="center" colSpan={2}>Monthly Base</TableCell>
                                                <TableCell align="center" colSpan={2}>Overtime</TableCell>
                                                <TableCell align="center" colSpan={2}>Paid Leave</TableCell>
                                                <TableCell align="center" colSpan={2}>Deduction</TableCell>
                                                <TableCell align="center" rowSpan={2}>Allowance</TableCell>
                                                <TableCell align="center" rowSpan={2}>Gross Pay</TableCell>
                                                <TableCell align="center" rowSpan={2}>Net Pay</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="center">Hours</TableCell>
                                                <TableCell align="center">Pay</TableCell>

                                                <TableCell align="center">Hours</TableCell>
                                                <TableCell align="center">Pay</TableCell>

                                                <TableCell align="center">Days</TableCell>
                                                <TableCell align="center">Pay</TableCell>

                                                <TableCell align="center">Absences</TableCell>
                                                <TableCell align="center">Tardiness</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {records.map((record) => (
                                                <TableRow key={record.record} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }} onClick={() => handleOpenViewPayrollModal(record.record)} >
                                                    <TableCell align="left">{record.employeeName}</TableCell>
                                                    <TableCell align="center">{record.monthlyBaseHours}</TableCell>
                                                    <TableCell align="center">{record.monthlyBasePay}</TableCell>

                                                    <TableCell align="center">{record.overTimeHours}</TableCell>
                                                    <TableCell align="center">{record.overTimePay}</TableCell>

                                                    <TableCell align="center">{record.paidLeaveDays}</TableCell>
                                                    <TableCell align="center">{record.paidLeaveAmount}</TableCell>

                                                    <TableCell align="center">{record.absences}</TableCell>
                                                    <TableCell align="center">{record.tardiness}</TableCell>

                                                    <TableCell align="center">{record.totalAllowance}</TableCell>
                                                    <TableCell align="center">{record.payrollGrossPay}</TableCell>
                                                    <TableCell align="center">{record.payrollNetPay}</TableCell>
                                                </TableRow>
                                            ))}
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

export default PayrollSummary
