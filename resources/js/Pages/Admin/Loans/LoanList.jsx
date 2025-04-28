import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material';
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
import LoanApplication from './Modals/LoanApplication';   

const LoanList = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [dataUpdated, setDataUpdated] = useState(false);

    const [openLoanApplicationModal, setOpenLoanApplicationModal] = useState(false);
    const [selectedLoan, setSelectedLoanId] = useState('');

    const [loans, setLoans] = useState([]);

    useEffect(() => {
        axiosInstance.get('/loans/getAllLoanApplications', { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setLoans(response.data.loans);
                } else if (response.data.status === 403) {
                    Swal.fire({
                        title: 'Unauthorized',
                        text: 'You do not have permission to view loan applications. Please log in as an admin.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || 'Failed to fetch loan applications.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching loan applications:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to fetch loan applications. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#177604',
                });
                setIsLoading(false);
            });
    }, []);

    const handleOpenLoanApplicationModal = (id) => {
        setSelectedLoanId(id);
        setOpenLoanApplicationModal(true);
    };

    const handleCloseLoanApplicationModal = () => {
        setOpenLoanApplicationModal(false);
    };

    return (
        <Layout title={"LoanManagement"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'left' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Loan Management</Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="loan table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Loan Amount</TableCell>
                                                <TableCell align="center">Payment Terms</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Date Created</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loans.length > 0 ? (
                                                loans.map((loan) => (
                                                    <TableRow
                                                        key={loan.loan_id}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }}
                                                        onClick={() => handleOpenLoanApplicationModal(loan.loan_id)}
                                                    >
                                                        <TableCell align="left">
                                                            {`${loan.emp_first_name} ${loan.emp_middle_name ? loan.emp_middle_name + ' ' : ''}${loan.emp_last_name}${loan.emp_suffix ? ' ' + loan.emp_suffix : ''}`}
                                                        </TableCell>
                                                        <TableCell align="center">₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align="center">{loan.payment_term} months</TableCell>
                                                        <TableCell align="center">{loan.status}</TableCell>
                                                        <TableCell align="center">{loan.date_created}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        No loan applications found.
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

                {openLoanApplicationModal && (
                    <LoanApplication open={openLoanApplicationModal} close={handleCloseLoanApplicationModal} selectedLoan={selectedLoan} />
                )}
            </Box>
        </Layout>
    );
};

export default LoanList;