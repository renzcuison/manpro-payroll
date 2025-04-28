import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, IconButton } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { useNavigate } from 'react-router-dom';
import LoanForm from "./Modals/LoanForm";
import LoanDetails from "./Modals/LoanDetails"; 
import LoanEdit from "./Modals/LoanEdit";
import Swal from 'sweetalert2';

const LoanList = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('nasya_user');
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [loans, setLoans] = useState([]);
    const [openLoanDetails, setOpenLoanDetails] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);

    const [openLoanForm, setOpenLoanForm] = useState(false);
    const [openLoanEdit, setOpenLoanEdit] = useState(null);
    const [menuStates, setMenuStates] = useState({});

    const handleOpenLoanForm = () => {
        setOpenLoanForm(true);
    };

    const handleCloseLoanForm = () => {
        setOpenLoanForm(false);
        fetchLoanApplications();
    };

    const handleOpenLoanDetails = (loanId) => {
        setSelectedLoanId(loanId);
        setOpenLoanDetails(true);
    };

    const handleCloseLoanDetails = () => {
        setOpenLoanDetails(false);
        setSelectedLoanId(null);
    };

    const handleOpenLoanEdit = (loan) => {
        setOpenLoanEdit(loan);
    };

    const handleCloseLoanEdit = () => {
        setOpenLoanEdit(null);
        fetchLoanApplications();
    };

    const handleMenuOpen = (event, id) => {
        setMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: true,
                anchorEl: event.currentTarget,
            },
        }));
    };

    const handleMenuClose = (id) => {
        setMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: false,
                anchorEl: null,
            },
        }));
    };

    const handleCancelLoan = (loanId) => {
        Swal.fire({
            customClass: { container: 'my-swal' },
            title: 'Cancel Loan?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showConfirmButton: true,
            confirmButtonText: 'Cancel',
            confirmButtonColor: '#E9AE20',
            showCancelButton: true,
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance
                    .post(`/loans/cancelLoanApplication/${loanId}`, {}, { headers })
                    .then((response) => {
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            title: 'Success!',
                            text: 'Your loan application has been cancelled.',
                            icon: 'success',
                            showConfirmButton: true,
                            confirmButtonText: 'Okay',
                            confirmButtonColor: '#177604',
                        }).then(() => {
                            fetchLoanApplications();
                        });
                    })
                    .catch((error) => {
                        console.error('Error cancelling loan:', error);
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            title: 'Error',
                            text: 'Failed to cancel loan application.',
                            icon: 'error',
                            showConfirmButton: true,
                            confirmButtonText: 'Okay',
                            confirmButtonColor: '#177604',
                        });
                    });
            }
        });
    };

    useEffect(() => {
        fetchLoanApplications();
    }, []);

    const fetchLoanApplications = () => {
        axiosInstance
            .get('/loans/getLoanApplications', { headers })
            .then((response) => {
                const sortedLoans = (response.data.loans || []).sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setLoans(sortedLoans);
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
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
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

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: 200,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Loan Amount</TableCell>
                                            <TableCell align="center">Payment Term</TableCell>
                                            <TableCell align="center">Paid Amount</TableCell>
                                            <TableCell align="center">Remaining Amount</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                            <TableCell align="center">Date Created</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loans.length > 0 ? (
                                            loans.map((loan, index) => {
                                                if (!menuStates[loan.id]) {
                                                    menuStates[loan.id] = { open: false, anchorEl: null };
                                                }

                                                return (
                                                    <TableRow
                                                        key={loan.id}
                                                        onClick={() => handleOpenLoanDetails(loan.id)}
                                                        sx={{
                                                            p: 1,
                                                            backgroundColor: index % 2 === 0 ? '#f8f8f8' : '#ffffff',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                                cursor: 'pointer',
                                                            },
                                                        }}
                                                    >
                                                        <TableCell align="center">
                                                            ₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {loan.payment_term ? `${loan.payment_term} months` : '-'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            ₱{loan.paid_amount ? parseFloat(loan.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            ₱{loan.remaining_amount ? parseFloat(loan.remaining_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell align="center">
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
                                                                            : loan.status === 'Cancelled'
                                                                            ? '#9e9e9e'
                                                                            : '#000000',
                                                                }}
                                                            >
                                                                {loan.status || '-'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {loan.created_at ? new Date(loan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {loan.status === 'Pending' ? (
                                                                <>
                                                                    <IconButton
                                                                        aria-label="more"
                                                                        aria-controls={menuStates[loan.id]?.open ? `loan-menu-${loan.id}` : undefined}
                                                                        aria-haspopup="true"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleMenuOpen(event, loan.id);
                                                                        }}
                                                                    >
                                                                        <MoreVert />
                                                                    </IconButton>
                                                                    <Menu
                                                                        id={`loan-menu-${loan.id}`}
                                                                        anchorEl={menuStates[loan.id]?.anchorEl}
                                                                        open={menuStates[loan.id]?.open || false}
                                                                        onClose={(event) => {
                                                                            event.stopPropagation();
                                                                            handleMenuClose(loan.id);
                                                                        }}
                                                                        MenuListProps={{
                                                                            'aria-labelledby': `loan-menu-${loan.id}`,
                                                                        }}
                                                                    >
                                                                        <MenuItem
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleOpenLoanEdit(loan);
                                                                                handleMenuClose(loan.id);
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </MenuItem>
                                                                        <MenuItem
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleCancelLoan(loan.id);
                                                                                handleMenuClose(loan.id);
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </MenuItem>
                                                                    </Menu>
                                                                </>
                                                            ) : null}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', p: 1 }}>
                                                    No Loan Applications Found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Box>
            </Box>

            {openLoanForm && <LoanForm open={openLoanForm} close={handleCloseLoanForm} />}
            {openLoanDetails && <LoanDetails open={openLoanDetails} close={handleCloseLoanDetails} loanId={selectedLoanId} />}
            {openLoanEdit && <LoanEdit open={true} close={handleCloseLoanEdit} loanDetails={openLoanEdit} />}
        </Layout>
    );
};

export default LoanList;