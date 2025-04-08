import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import PreviewProposal from './Modal/PreviewProposal.jsx';

const LoanApplication = ({ selectedLoan }) => {
    const storedUser = localStorage.getItem("nasya_user");  
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};

    const [isLoading, setIsLoading] = useState(true);
    const [loan, setLoan] = useState(null);
    const [status, setStatus] = useState('');
    const [monthlyInterestRate, setMonthlyInterestRate] = useState('');
    const [proposedLoanAmount, setProposedLoanAmount] = useState('');
    const [proposedPaymentTerm, setProposedPaymentTerm] = useState('');
    const [openPreview, setOpenPreview] = useState(false);
    const [loanProposal, setLoanProposal] = useState(null);
    const [proposalStatus, setProposalStatus] = useState(null);

    useEffect(() => {
        axiosInstance.get(`/loans/getLoanDetails/${selectedLoan}`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setLoan(response.data.loan);
                    setStatus(response.data.loan.status);
                    setLoanProposal(response.data.loan.proposal); // Set existing proposal
                    setProposalStatus(response.data.loan.proposal_status); // Set proposal status
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || 'Failed to fetch loan details.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching loan details:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to fetch loan details.',
                    icon: 'error',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#177604',
                });
                setIsLoading(false);
            });
    }, [selectedLoan]);

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setStatus(newStatus);
        axiosInstance.post(`/loans/updateLoanStatus/${selectedLoan}`, { status: newStatus }, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        title: 'Success',
                        text: 'Loan status updated successfully!',
                        icon: 'success',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                    setLoan({ ...loan, status: newStatus });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || 'Failed to update loan status.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch((error) => {
                console.error('Error updating loan status:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update loan status.',
                    icon: 'error',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#177604',
                });
            });
    };

    const canCreateProposal = () => {
        return !loanProposal && !proposalStatus;
    };

    const isProposalComplete = () => {
        return proposedLoanAmount && proposedPaymentTerm && monthlyInterestRate;
    };

    const handlePreviewProposal = () => {
        setOpenPreview(true);
    };

    if (isLoading) return <CircularProgress />;
    if (!loan) return <Typography>No loan data available.</Typography>;

    return (
        <Box sx={{ mt: 3, py: 6, bgcolor: '#ffffff' }}>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Loan Application</Typography>
                <Typography sx={{ mt: 1 }}>Loan ID: {loan.id}</Typography>
            </Box>

            <Grid container spacing={4} sx={{ px: 8, mt: 4 }}>
                <Grid item xs={12}>
                    <div className="row">
                        <div className="col-6">
                            <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                <InputLabel shrink>Employee Name</InputLabel>
                                <TextField value={loan.employee_name} InputProps={{ readOnly: true }} />
                            </FormControl>
                            <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                <InputLabel shrink>Loan Amount</InputLabel>
                                <TextField
                                    value={`₱${parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    InputProps={{ readOnly: true }}
                                />
                            </FormControl>
                            <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                <InputLabel shrink>Payment Term</InputLabel>
                                <TextField value={`${loan.payment_term} months`} InputProps={{ readOnly: true }} />
                            </FormControl>
                        </div>
                        <div className="col-6">
                            <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                <InputLabel shrink>Status</InputLabel>
                                <Select value={status} onChange={handleStatusChange}>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Approved">Approved</MenuItem>
                                    <MenuItem value="Declined">Declined</MenuItem>
                                    <MenuItem value="Released">Released</MenuItem>
                                    <MenuItem value="Paid">Paid</MenuItem>
                                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                <InputLabel shrink>Date Created</InputLabel>
                                <TextField value={loan.created_at} InputProps={{ readOnly: true }} />
                            </FormControl>
                        </div>
                    </div>

                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Proposal</Typography>
                    {canCreateProposal() ? (
                        <>
                            <div className="row">
                                <div className="col-4">
                                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                        <InputLabel shrink>New Loan Amount</InputLabel>
                                        <TextField
                                            value={proposedLoanAmount}
                                            onChange={(e) => setProposedLoanAmount(e.target.value)}
                                            placeholder="Enter new loan amount"
                                        />
                                    </FormControl>
                                </div>
                                <div className="col-4">
                                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                        <InputLabel shrink>New Payment Term (months)</InputLabel>
                                        <TextField
                                            type="number"
                                            value={proposedPaymentTerm}
                                            onChange={(e) => setProposedPaymentTerm(e.target.value)}
                                            placeholder="Enter new payment term"
                                        />
                                    </FormControl>
                                </div>
                                <div className="col-4">
                                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                                        <InputLabel shrink>Monthly Interest Rate (%)</InputLabel>
                                        <TextField
                                            type="number"
                                            value={monthlyInterestRate}
                                            onChange={(e) => setMonthlyInterestRate(e.target.value)}
                                            placeholder="e.g., 2 for 2%"
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            {isProposalComplete() && (
                                <div className="row">
                                    <div className="col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button variant="contained" color="primary" onClick={handlePreviewProposal}>
                                            Preview Proposal
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <Typography>Proposal already created and {proposalStatus || 'pending'}.</Typography>
                    )}
                </Grid>
            </Grid>

            <PreviewProposal
                open={openPreview}
                onClose={() => {
                    setOpenPreview(false);
                    // Refresh loan details after proposal creation
                    axiosInstance.get(`/loans/getLoanDetails/${selectedLoan}`, { headers })
                        .then((response) => {
                            if (response.data.status === 200) {
                                setLoan(response.data.loan);
                                setLoanProposal(response.data.loan.proposal);
                                setProposalStatus(response.data.loan.proposal_status);
                            }
                        });
                }}
                proposedLoanAmount={proposedLoanAmount}
                proposedPaymentTerm={proposedPaymentTerm}
                monthlyInterestRate={monthlyInterestRate}
                selectedLoan={selectedLoan}
                isAdmin={true}
            />
        </Box>
    );
};

export default LoanApplication;