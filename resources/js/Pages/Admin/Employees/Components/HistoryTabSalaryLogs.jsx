import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

import LoadingSpinner from '../../../../components/LoadingStates/LoadingSpinner';


const HistoryTabSalaryLogs = ({ userName, headers }) => {

    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState([]);

    const data = { username: userName };

    useEffect(() => {
        axiosInstance.get(`/getSalaryLogs`, { params: data, headers })
            .then((response) => {
                setLogs(response.data.salaryLogs);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching salary logs:', error);
            }); 
    }, []);
    
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
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Changed by</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Changed on</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Old Salary Grade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Old Amount</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>New Salary Grade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>New Amount</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {(Array.isArray(logs) ? logs : []).map((log) => (
                                    <TableRow key={log.salaryLog} >
                                        <TableCell align="center">{log.adminFirstName} {log.adminLastName}</TableCell>
                                        <TableCell align="center">{dayjs(log.createdAt).format('MMM D, YYYY h:mm A')}</TableCell>
                                        <TableCell align="center">{log.oldSalaryGrade}</TableCell>
                                        <TableCell align="center">₱ {Number(log.oldAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="center">{log.newSalaryGrade}</TableCell>
                                        <TableCell align="center">₱ {Number(log.newAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default HistoryTabSalaryLogs;
