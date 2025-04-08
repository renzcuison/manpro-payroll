import React, { useState, useEffect } from 'react';
import {
    Modal, Box, Typography, TextField, FormControl, InputLabel, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const PreviewProposal = ({ open, onClose, proposedLoanAmount, proposedPaymentTerm, monthlyInterestRate, selectedLoan, isAdmin, existingProposal, onProposalSent }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser) || {}) : {};
    const [amortizationSchedule, setAmortizationSchedule] = useState([]);
    const [proposalData, setProposalData] = useState(null);

    useEffect(() => {
        if (open) {
            const schedule = calculateAmortizationSchedule();
            setAmortizationSchedule(schedule);
            setProposalData(existingProposal || {
                proposed_loan_amount: proposedLoanAmount || 0,
                proposed_payment_term: proposedPaymentTerm || 0,
                monthly_interest_rate: monthlyInterestRate || 0,
            });
        }
    }, [open, proposedLoanAmount, proposedPaymentTerm, monthlyInterestRate, existingProposal]);

    const calculateAmortizationSchedule = () => {
        const loanAmount = existingProposal?.proposed_loan_amount || proposedLoanAmount || 0;
        const paymentTerm = existingProposal?.proposed_payment_term || proposedPaymentTerm || 0;
        const interestRate = existingProposal?.monthly_interest_rate || monthlyInterestRate || 0;

        if (!loanAmount || !paymentTerm || !interestRate) return [];

        const r = interestRate / 100;
        const pv = parseFloat(loanAmount);
        const n = parseInt(paymentTerm);
        const monthlyPayment = (r * pv) / (1 - Math.pow(1 + r, -n));

        let balance = pv;
        const schedule = [];
        for (let month = 1; month <= n; month++) {
            const interest = balance * r;
            const principal = monthlyPayment - interest;
            balance -= principal;
            schedule.push({
                month,
                payment: monthlyPayment.toFixed(2),
                principal: principal.toFixed(2),
                interest: interest.toFixed(2),
                balance: balance > 0 ? balance.toFixed(2) : '0.00',
            });
        }
        return schedule;
    };

    const handleCreateProposal = () => {
        const data = {
            proposed_loan_amount: parseFloat(proposalData?.proposed_loan_amount || proposedLoanAmount || 0),
            proposed_payment_term: parseInt(proposalData?.proposed_payment_term || proposedPaymentTerm || 0),
            monthly_interest_rate: parseFloat(proposalData?.monthly_interest_rate || monthlyInterestRate || 0),
        };

        if (isNaN(data.proposed_loan_amount) || isNaN(data.proposed_payment_term) || isNaN(data.monthly_interest_rate) || data.proposed_loan_amount <= 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please provide valid numeric values for the proposal.',
                icon: 'error',
                confirmButtonText: 'Okay',
                confirmButtonColor: '#177604',
            });
            return;
        }

        axiosInstance.post(`/loans/createProposal/${selectedLoan}`, data, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setProposalData(response.data.proposal);
                    if (onProposalSent) onProposalSent(response.data.proposal); // Notify parent
                    Swal.fire({
                        title: 'Success',
                        text: 'Proposal sent to employee for approval!',
                        icon: 'success',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                    onClose();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || 'Failed to send proposal.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch((error) => {
                console.error('Error sending proposal:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || error.message || 'Failed to send proposal.',
                    icon: 'error',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#177604',
                });
            });
    };

    const handleRespondToProposal = (action) => {
        if (!selectedLoan || !proposalData) {
            Swal.fire({
                title: 'Error',
                text: 'No loan or proposal data available.',
                icon: 'error',
                confirmButtonText: 'Okay',
                confirmButtonColor: '#177604',
            });
            return;
        }

        const data = {
            action,
            proposed_loan_amount: parseFloat(proposalData.proposed_loan_amount),
            proposed_payment_term: parseInt(proposalData.proposed_payment_term),
        };

        axiosInstance.post(`/loans/respondToProposal/${selectedLoan}`, data, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        title: 'Success',
                        text: `Loan terms ${action === 'approve' ? 'updated' : 'declined'} successfully!`,
                        icon: 'success',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                    setProposalData(null);
                    if (onProposalSent) onProposalSent(null); // Clear proposal
                    onClose();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || `Failed to ${action} proposal.`,
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch((error) => {
                console.error(`Error ${action}ing proposal:`, error);
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || error.message || `Failed to ${action} proposal.`,
                    icon: 'error',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#177604',
                });
            });
    };

    const proposal = proposalData || existingProposal || {
        proposed_loan_amount: proposedLoanAmount || 0,
        proposed_payment_term: proposedPaymentTerm || 0,
        monthly_interest_rate: monthlyInterestRate || 0,
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2">Preview Proposal</Typography>
                <FormControl sx={{ mt: 2, width: '100%' }}>
                    <InputLabel shrink>New Loan Amount</InputLabel>
                    <TextField
                        value={`₱${parseFloat(proposal.proposed_loan_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        InputProps={{ readOnly: true }}
                    />
                </FormControl>
                <FormControl sx={{ mt: 2, width: '100%' }}>
                    <InputLabel shrink>New Payment Term</InputLabel>
                    <TextField value={`${proposal.proposed_payment_term || 0} months`} InputProps={{ readOnly: true }} />
                </FormControl>
                <FormControl sx={{ mt: 2, width: '100%' }}>
                    <InputLabel shrink>Monthly Interest Rate (%)</InputLabel>
                    <TextField value={`${proposal.monthly_interest_rate || 0}%`} InputProps={{ readOnly: true }} />
                </FormControl>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Monthly Payment Schedule</Typography>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Principal</TableCell>
                                <TableCell>Interest</TableCell>
                                <TableCell>Remaining Balance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {amortizationSchedule.map((row) => (
                                <TableRow key={row.month}>
                                    <TableCell>{row.month}</TableCell>
                                    <TableCell>₱{row.payment}</TableCell>
                                    <TableCell>₱{row.principal}</TableCell>
                                    <TableCell>₱{row.interest}</TableCell>
                                    <TableCell>₱{row.balance}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    {isAdmin ? (
                        <Button variant="contained" color="primary" onClick={handleCreateProposal}>
                            Send Proposal
                        </Button>
                    ) : (
                        <>
                            <Button variant="contained" color="success" onClick={() => handleRespondToProposal('approve')}>
                                Approve
                            </Button>
                            <Button variant="contained" color="error" onClick={() => handleRespondToProposal('decline')} sx={{ ml: 2 }}>
                                Decline
                            </Button>
                        </>
                    )}
                    <Button sx={{ ml: 2 }} onClick={onClose}>Close</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default PreviewProposal;