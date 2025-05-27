import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

import LoadingSpinner from '../../../../components/LoadingStates/LoadingSpinner';

import PayslipView from '../../../../Modals/Payroll/PayslipView';

const HistoryTabPayroll = ({ userName, headers }) => {

    const [openViewPayrollModal, setOpenViewPayrollModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState([]);
    
    const data = { username: userName };

    useEffect(() => {
        axiosInstance.get(`/employee/getMyPayrollHistory`, { params: data, headers })
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
        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <TableContainer style={{ overflowX: 'auto' }}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Payroll Date</TableCell>
                                    <TableCell align="center">Cut-Off</TableCell>
                                    <TableCell align="center">Days</TableCell>
                                    {/* <TableCell align="center">Total Earnings</TableCell> */}
                                    {/* <TableCell align="center">Total Deductions</TableCell> */}
                                    {/* <TableCell align="center">Net Pay</TableCell> */}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.record} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }} onClick={() => handleOpenViewPayrollModal(record.record)} >
                                        <TableCell align="center">{dayjs(record.payrollStartDate).format("MMM D, YYYY")} - {dayjs(record.payrollEndDate).format("MMM D, YYYY")}</TableCell>
                                        <TableCell align="center">{record.payrollCutOff}</TableCell>
                                        <TableCell align="center">{record.payrollWorkingDays}</TableCell>
                                        {/* <TableCell align="center">{record.payrollEarnings}</TableCell> */}
                                        {/* <TableCell align="center">{record.payrollDeductions}</TableCell> */}
                                        {/* <TableCell align="center">{record.payrollEarnings - record.payrollDeductions}</TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {openViewPayrollModal &&
                <PayslipView open={openViewPayrollModal} close={handleCloseViewPayrollModal} selectedPayroll={selectedPayroll} />
            }
        </Box>
    );
};

export default HistoryTabPayroll;
