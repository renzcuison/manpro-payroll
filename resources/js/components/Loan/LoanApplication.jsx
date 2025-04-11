import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import PreviewProposal from './Modal/PreviewProposal.jsx';
import HomeLogo from '../../../images/ManPro.png';
import Swal from 'sweetalert2';

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
  const [messageDialog, setMessageDialog] = useState({ open: false, title: '', message: '', severity: '' });
  const [confirmDialog, setConfirmDialog] = useState(false); // State for confirmation dialog
  const isAdmin = storedUser && JSON.parse(storedUser).user_type === 'Admin';

  useEffect(() => {
    fetchLoanDetails();
  }, [selectedLoan]);

  const fetchLoanDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/loans/getLoanDetails/${selectedLoan}`, { headers });
      if (response.data.status === 200) {
        const loanData = response.data.loan;
        setLoan(loanData);
        setStatus(loanData.status);
        setLoanProposal(loanData.proposal);
        setPaidAmount(loanData.paid_amount.toString());
        if (loanData.proposal) {
          setProposedLoanAmount(loanData.proposal.proposed_loan_amount.toString());
          setProposedPaymentTerm(loanData.proposal.proposed_payment_term.toString());
          setMonthlyInterestRate(loanData.proposal.monthly_interest_rate.toString());
        }
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: response.data.message || 'Failed to fetch loan details.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
      setMessageDialog({
        open: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to fetch loan details.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStatus = async () => {
    try {
      const response = await axiosInstance.post(`/loans/updateLoanStatus/${selectedLoan}`, { status }, { headers });
      if (response.data.status === 200) {
        setLoan({ ...loan, status });
        setMessageDialog({
          open: true,
          title: 'Success',
          message: 'Loan status updated successfully!',
          severity: 'success',
        });
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: response.data.message || 'Failed to update loan status.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update loan status.';
      const statusCode = error.response?.status;
      let displayMessage = errorMessage;
      if (statusCode === 403) {
        displayMessage = 'Unauthorized: Admin privileges required.';
      } else if (statusCode === 404) {
        displayMessage = 'Loan application not found.';
      } else if (statusCode === 422) {
        displayMessage = error.response?.data?.errors?.status?.[0] || 'Invalid status provided.';
      } else if (statusCode === 405) {
        displayMessage = 'Method not allowed. Contact support.';
      }
      setMessageDialog({
        open: true,
        title: 'Error',
        message: displayMessage,
        severity: 'error',
      });
    }
  };

  const handleConfirmSaveStatus = () => {
    document.activeElement.blur();
    Swal.fire({
      customClass: { container: 'my-swal' },
      title: 'Are you sure?',
      text: 'Are you sure you want to update the status?',
      icon: 'warning',
      showConfirmButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#177604',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then((res) => {
      if (res.isConfirmed) {
        handleSaveStatus();
      }
    });
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axiosInstance.get(`/loans/downloadFile/${fileId}`, {
        headers,
        responseType: 'blob',
      });

      if (response.status === 200 && response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Invalid response received from server');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      let errorMessage = 'Failed to download file.';
      if (error.response && error.response.data) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch (e) {
          // Not JSON
        }
      }
      setMessageDialog({
        open: true,
        title: 'Error',
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCloseMessageDialog = () => {
    setMessageDialog({ open: false, title: '', message: '', severity: '' });
  };

  const handlePaidAmountChange = (e) => setPaidAmount(e.target.value);

  const canCreateProposal = () => !loanProposal && loan?.status === 'Pending';
  const isEditable = () => !['Declined', 'Cancelled'].includes(loan?.status);
  const getStatusOptions = () => {
    const currentStatus = loan?.status;
    if (currentStatus === 'Pending') {
      return ['Pending', 'Declined'];
    }
    if (currentStatus === 'Approved') {
      return ['Approved', 'Released', 'Paid'];
    }
    return ['Pending', 'Approved', 'Declined', 'Released', 'Paid', 'Cancelled'];
  };

  const handlePreview = () => setOpenPreview(true);

  if (isLoading) return <CircularProgress />;
  if (!loan) return <Typography>No loan data available.</Typography>;

  return (
    <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 1 }}>
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 1 }}>
        <Box
          component="div"
          sx={{
            backgroundImage: `url(${HomeLogo})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            height: 105,
            width: 300,
          }}
        />
        <Typography sx={{ marginTop: '5px' }}>Online Loan</Typography>
      </Box>



      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
            Employee Information
          </Typography>
          <div className="row">
            <div className="col-6">
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Employee Name</InputLabel>
                <input className="form-control" type="text" value={loan.employee_name} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Role</InputLabel>
                <input className="form-control" type="text" value={loan.role || '-'} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Department</InputLabel>
                <input className="form-control" type="text" value={loan.department || 'Public Relations'} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
              </FormControl>
            </div>
            <div className="col-6">
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Employment Type</InputLabel>
                <input className="form-control" type="text" value={loan.employment_type || '-'} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Title</InputLabel>
                <input className="form-control" type="text" value={loan.job_title || '-'} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Branch</InputLabel>
                <input className="form-control" type="text" value={loan.branch || '-'} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
              </FormControl>
            </div>
          </div>

          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: '#333' }}>
            Loan Details
          </Typography>
          <div className="row">
            <div className="col-6">
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Loan Amount</InputLabel>
                <input
                  className="form-control"
                  type="text"
                  value={`₱${parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                  readOnly
                />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Payment Term</InputLabel>
                <input
                  className="form-control"
                  type="text"
                  value={`${loan.payment_term} months`}
                  style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                  readOnly
                />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Reason</InputLabel>
                <textarea
                  className="form-control"
                  value={loan.reason}
                  style={{ height: 80, backgroundColor: '#fff', resize: 'none' }}
                  readOnly
                />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Attachments</InputLabel>
                {loan.attachments && loan.attachments.length > 0 ? (
                  <List sx={{ bgcolor: '#fff', border: '1px solid #ccc', borderRadius: 1, p: 0 }}>
                    {loan.attachments.map((attachment) => (
                      <ListItem
                        key={attachment.id}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleDownload(attachment.id, attachment.filename)}>
                            <DownloadIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={attachment.filename} secondary={attachment.type} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography sx={{ p: 1, color: '#666' }}>No attachments available.</Typography>
                )}
              </FormControl>
            </div>
            <div className="col-6">
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Paid Amount</InputLabel>
                <input
                  className="form-control"
                  value={paidAmount}
                  onChange={handlePaidAmountChange}
                  disabled={!isEditable()}
                  style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Remaining Amount</InputLabel>
                <input
                  className="form-control"
                  type="text"
                  value={`₱${parseFloat(loan.remaining_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                  readOnly
                />
              </FormControl>
              <FormControl sx={{ mb: 2, width: '100%' }}>
                <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>Status</InputLabel>
                {isAdmin && isEditable() ? (
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      sx={{ height: 40, flex: 1 }}
                    >
                      {getStatusOptions().map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                    <Button
                      variant="contained"
                      onClick={handleConfirmSaveStatus}
                      sx={{ height: 40, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                    >
                        Update Status
                    </Button>
                  </Box>
                ) : (
                  <input
                    className="form-control"
                    type="text"
                    value={status}
                    style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                    readOnly
                  />
                )}
              </FormControl>
            </div>
          </div>

          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: '#333' }}>
            Proposal
          </Typography>
          {loanProposal ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handlePreview}
                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                Preview Loan
              </Button>
            </Box>
          ) : canCreateProposal() && isAdmin ? (
            <div className="row">
              <div className="col-4">
                <FormControl sx={{ mb: 2, width: '100%' }}>
                  <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>
                    New Loan Amount
                  </InputLabel>
                  <input
                    className="form-control"
                    value={proposedLoanAmount}
                    onChange={(e) => setProposedLoanAmount(e.target.value)}
                    style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                  />
                </FormControl>
              </div>
              <div className="col-4">
                <FormControl sx={{ mb: 2, width: '100%' }}>
                  <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>
                    New Payment Term (months)
                  </InputLabel>
                  <input
                    className="form-control"
                    type="number"
                    value={proposedPaymentTerm}
                    onChange={(e) => setProposedPaymentTerm(e.target.value)}
                    style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                  />
                </FormControl>
              </div>
              <div className="col-4">
                <FormControl sx={{ mb: 2, width: '100%' }}>
                  <InputLabel shrink sx={{ backgroundColor: 'white', px: 1, color: '#666' }}>
                    Monthly Interest Rate (%)
                  </InputLabel>
                  <input
                    className="form-control"
                    type="number"
                    value={monthlyInterestRate}
                    onChange={(e) => setMonthlyInterestRate(e.target.value)}
                    style={{ height: 40, backgroundColor: '#fff', textAlign: 'left' }}
                  />
                </FormControl>
              </div>
              <div className="col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handlePreview}
                  disabled={!proposedLoanAmount || !proposedPaymentTerm || !monthlyInterestRate}
                  sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                >
                  Preview Proposal
                </Button>
              </div>
            </div>
          ) : (
            <Typography sx={{ color: '#666' }}>
              {loan.status === 'Cancelled' ? 'Proposal creation is disabled for cancelled loans.' : 'No proposal exists for this loan.'}
            </Typography>
          )}
        </Grid>
      </Grid>

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
        isAdmin={isAdmin}
        isPreviewOnly={!!loanProposal}
      />

      <Dialog open={messageDialog.open} onClose={handleCloseMessageDialog}>
        <DialogTitle sx={{ color: messageDialog.severity === 'success' ? '#177604' : '#d32f2f' }}>
          {messageDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{messageDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog} sx={{ color: '#1976d2' }}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanApplication;