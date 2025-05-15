import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
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
  const [paidAmount, setPaidAmount] = useState('');
  const [openPreview, setOpenPreview] = useState(false);
  const [loanProposal, setLoanProposal] = useState(null);
  const [proposalStatus, setProposalStatus] = useState(null);

  useEffect(() => {
    fetchLoanDetails();
  }, [selectedLoan]);

  const fetchLoanDetails = () => {
    axiosInstance
      .get(`/loans/getLoanDetails/${selectedLoan}`, { headers })
      .then((response) => {
        if (response.data.status === 200) {
          const loanData = response.data.loan;
          console.log('Loan Details Response:', loanData); // Debug log
          setLoan(loanData);
          setStatus(loanData.status);
          setLoanProposal(loanData.proposal);
          setProposalStatus(loanData.proposal_status);
          setPaidAmount(loanData.paid_amount.toString());
          // Pre-fill proposal inputs if proposal exists
          if (loanData.proposal) {
            console.log('Proposal Data:', loanData.proposal); // Debug log
            setProposedLoanAmount(loanData.proposal.proposed_loan_amount.toString());
            setProposedPaymentTerm(loanData.proposal.proposed_payment_term.toString());
            setMonthlyInterestRate(loanData.proposal.monthly_interest_rate.toString());
          }
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
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    axiosInstance
      .post(`/loans/updateLoanStatus/${selectedLoan}`, { status: newStatus }, { headers })
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

  const handlePaidAmountChange = (e) => {
    const value = e.target.value;
    setPaidAmount(value);
  };

  const canCreateProposal = () => {
    return !loanProposal && status === 'Pending';
  };

  const isProposalComplete = () => {
    return proposedLoanAmount && proposedPaymentTerm && monthlyInterestRate;
  };

  const canPreviewLoan = () => {
    return ['Approved', 'Released', 'Paid'].includes(status);
  };

  const handlePreview = () => {
    setOpenPreview(true);
  };

  if (isLoading) return <CircularProgress />;
  if (!loan) return <Typography>No loan data available.</Typography>;

  return (
    <Box sx={{ mt: 3, py: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 1, maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#177604' }}>
          Loan Application
        </Typography>
        <Typography sx={{ mt: 1, color: '#666', fontSize: '0.9rem' }}>
          Loan ID: {loan.id}
        </Typography>
      </Box>

      <Box sx={{ px: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
          Loan Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Employee Name
              </InputLabel>
              <TextField
                value={loan.employee_name}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Loan Amount
              </InputLabel>
              <TextField
                value={`₱${parseFloat(loan.loan_amount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Payment Term
              </InputLabel>
              <TextField
                value={`${loan.payment_term} months`}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Reason
              </InputLabel>
              <TextField
                value={loan.reason}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Status
              </InputLabel>
              <Select
                value={status}
                onChange={handleStatusChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Declined">Declined</MenuItem>
                <MenuItem value="Released">Released</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Date Created
              </InputLabel>
              <TextField
                value={loan.created_at}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Paid Amount
              </InputLabel>
              <TextField
                value={paidAmount}
                onChange={handlePaidAmountChange}
                placeholder="Enter paid amount"
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Remaining Amount
              </InputLabel>
              <TextField
                value={`₱${parseFloat(loan.remaining_amount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Department
              </InputLabel>
              <TextField
                value={loan.department || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Branch
              </InputLabel>
              <TextField
                value={loan.branch || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                Job Title
              </InputLabel>
              <TextField
                value={loan.job_title || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: '#333' }}>
          Proposal
        </Typography>
        {loanProposal ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                    New Loan Amount
                  </InputLabel>
                  <TextField
                    value={`₱${parseFloat(loanProposal.proposed_loan_amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                    New Payment Term (months)
                  </InputLabel>
                  <TextField
                    value={`${loanProposal.proposed_payment_term} months`}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                    Monthly Interest Rate (%)
                  </InputLabel>
                  <TextField
                    value={`${loanProposal.monthly_interest_rate}%`}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Grid>
            </Grid>
            {canPreviewLoan() && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handlePreview}>
                  Preview Loan
                </Button>
              </Box>
            )}
          </>
        ) : canCreateProposal() ? (
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                  New Loan Amount
                </InputLabel>
                <TextField
                  value={proposedLoanAmount}
                  onChange={(e) => setProposedLoanAmount(e.target.value)}
                  placeholder="Enter new loan amount"
                  type="number"
                  variant="outlined"
                  size="small"
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                  New Payment Term (months)
                </InputLabel>
                <TextField
                  type="number"
                  value={proposedPaymentTerm}
                  onChange={(e) => setProposedPaymentTerm(e.target.value)}
                  placeholder="Enter new payment term"
                  variant="outlined"
                  size="small"
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: '#fff', px: 1, fontSize: '0.9rem' }}>
                  Monthly Interest Rate (%)
                </InputLabel>
                <TextField
                  type="number"
                  value={monthlyInterestRate}
                  onChange={(e) => setMonthlyInterestRate(e.target.value)}
                  placeholder="e.g., 2 for 2%"
                  variant="outlined"
                  size="small"
                />
              </FormControl>
            </Grid>
            {isProposalComplete() && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handlePreview}>
                  Preview Proposal
                </Button>
              </Grid>
            )}
          </Grid>
        ) : canPreviewLoan() ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handlePreview}>
              Preview Loan
            </Button>
          </Box>
        ) : (
          <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
            {status === 'Cancelled'
              ? 'Proposal creation is disabled for cancelled loans.'
              : 'No proposal exists for this loan.'}
          </Typography>
        )}
      </Box>

      <PreviewProposal
        open={openPreview}
        onClose={() => {
          setOpenPreview(false);
          fetchLoanDetails();
        }}
        proposedLoanAmount={loanProposal?.proposed_loan_amount || proposedLoanAmount}
        proposedPaymentTerm={loanProposal?.proposed_payment_term || proposedPaymentTerm}
        monthlyInterestRate={loanProposal?.monthly_interest_rate || monthlyInterestRate}
        selectedLoan={selectedLoan}
        isAdmin={true}
        isPreviewOnly={canPreviewLoan()}
      />
    </Box>
  );
};

export default LoanApplication;