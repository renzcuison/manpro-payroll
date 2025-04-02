import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { useNavigate } from 'react-router-dom';
import LoanForm from "./Modals/LoanForm";
import LoanDetails from "./Modals/LoanDetails"; 

const LoanList = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('nasya_user');
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [loans, setLoans] = useState([]);
    const [openLoanDetails, setOpenLoanDetails] = useState(false); // State for LoanDetails modal
    const [selectedLoanId, setSelectedLoanId] = useState(null); // State for selected loan ID

    // State for LoanForm modal
    const [openLoanForm, setOpenLoanForm] = useState(false);

    const handleOpenLoanForm = () => {
        setOpenLoanForm(true);
    };

    const handleCloseLoanForm = () => {
        setOpenLoanForm(false);
        fetchLoanApplications(); // Refresh the list after closing the form
    };

    const handleOpenLoanDetails = (loanId) => {
        setSelectedLoanId(loanId);
        setOpenLoanDetails(true);
    };

    const handleCloseLoanDetails = () => {
        setOpenLoanDetails(false);
        setSelectedLoanId(null);
    };

    useEffect(() => {
        fetchLoanApplications();
    }, []);

    const fetchLoanApplications = () => {
        axiosInstance
            .get('/loans/getLoanApplications', { headers })
            .then((response) => {
                setLoans(response.data.loans || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching loan applications:', error);
                setIsLoading(false);
            });
    };

    return (
        <Layout title={'LoanManagement'}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Loan Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenLoanForm}
                        >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Create
                            </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 3, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: '100px', padding: '6px', fontSize: '14px' }}>
                                                    Loan Amount
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: '80px', padding: '6px', fontSize: '14px' }}>
                                                    Status
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: '80px', padding: '6px', fontSize: '14px' }}>
                                                    Payment Term
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: '120px', padding: '6px', fontSize: '14px' }}>
                                                    Date Created
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loans.length > 0 ? (
                                                loans.map((loan) => (
                                                    <TableRow
                                                        key={loan.id}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                                                        onClick={() => handleOpenLoanDetails(loan.id)}
                                                    >
                                                        <TableCell align="center" sx={{ width: '100px', padding: '6px', fontSize: '14px' }}>
                                                            ₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ width: '80px', padding: '6px', fontSize: '14px' }}>
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color:
                                                                        loan.status === 'Approved'
                                                                            ? '#177604'
                                                                            : loan.status === 'Declined'
                                                                            ? '#f44336'
                                                                            : loan.status === 'Pending'
                                                                            ? '#e9ae20'
                                                                            : loan.status === 'Released'
                                                                            ? '#42a5f5'
                                                                            : loan.status === 'Paid'
                                                                            ? '#4caf50'
                                                                            : '#000000',
                                                                }}
                                                            >
                                                                {loan.status || '-'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ width: '80px', padding: '6px', fontSize: '14px' }}>
                                                            {loan.payment_term ? `${loan.payment_term} months` : '-'}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ width: '120px', padding: '6px', fontSize: '14px' }}>
                                                            {loan.created_at ? new Date(loan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', p: 1 }}>
                                                        No Loan Applications Found
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

            {openLoanForm && <LoanForm open={openLoanForm} close={handleCloseLoanForm} />}
            {openLoanDetails && <LoanDetails open={openLoanDetails} close={handleCloseLoanDetails} loanId={selectedLoanId} />}
        </Layout>
    );
};

export default LoanList;