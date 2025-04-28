import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Stack,
    Tooltip,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Table,
    TextField,
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import InfoBox from '../../../../components/General/InfoBox';
import PreviewProposal from '../../../../Modals/Loan/PreviewProposal';
import dayjs from "dayjs";
import UTC from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(UTC);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const LoanApplication = ({ open, close, selectedLoan }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const isAdmin = storedUser && JSON.parse(storedUser).user_type === 'Admin';

    const [loanDetails, setLoanDetails] = useState({});
    const [files, setFiles] = useState([]);
    const [existingLoans, setExistingLoans] = useState([]);
    const [appResponse, setAppResponse] = useState("");
    const [appResponseError, setAppResponseError] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [proposedLoanAmount, setProposedLoanAmount] = useState('');
    const [proposedPaymentTerm, setProposedPaymentTerm] = useState('');
    const [monthlyInterestRate, setMonthlyInterestRate] = useState('');
    const [loanProposal, setLoanProposal] = useState(null);
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [actionSubmitted, setActionSubmitted] = useState(false);

    // Fetch Loan Details and Attachments
    useEffect(() => {
      if (!selectedLoan) return;
  
      axiosInstance.get(`/loans/getLoanDetails/${selectedLoan}`, { headers })
          .then((response) => {
              if (response.data.status === 200) {
                  const loanData = response.data.loan;
                  setLoanDetails(loanData);
                  setFiles(loanData.attachments || []);
  
                  // Only set proposal-related states if they haven't been edited by the user
                  if (!proposedLoanAmount && !proposedPaymentTerm && !monthlyInterestRate) {
                      setLoanProposal(loanData.proposal);
                      if (loanData.proposal) {
                          setProposedLoanAmount(loanData.proposal.proposed_loan_amount.toString());
                          setProposedPaymentTerm(loanData.proposal.proposed_payment_term.toString());
                          setMonthlyInterestRate(loanData.proposal.monthly_interest_rate.toString());
                          setShowProposalForm(true);
                          setActionSubmitted(true);
                          setAppResponse("Approve");
                      } else {
                          setProposedLoanAmount(loanData.loan_amount?.toString() || '');
                          setProposedPaymentTerm(loanData.payment_term?.toString() || '');
                          setMonthlyInterestRate('');
                      }
                  }
  
                  if (loanData.status === "Declined") {
                      setActionSubmitted(true);
                      setAppResponse("Decline");
                  }
  
                  // Fetch current loans with employee_id
                  if (loanData.employee_id) {
                      console.log('Fetching current loans for employee_id:', loanData.employee_id);
                      axiosInstance.get(`/loans/getCurrentLoans/${loanData.employee_id}`, { headers })
                          .then((response) => {
                              if (response.data.status === 200) {
                                  setExistingLoans(response.data.loans || []);
                                  console.log('Current loans fetched:', response.data.loans);
                              } else {
                                  console.error('Failed to fetch current loans:', response.data.message);
                              }
                          })
                          .catch((error) => {
                              console.error('Error fetching current loans:', error);
                          });
                  } else {
                      console.warn('No employee_id found in loan details');
                  }
              }
          })
          .catch((error) => {
              console.error('Error fetching loan details:', error);
          });
  }, [selectedLoan, headers, proposedLoanAmount, proposedPaymentTerm, monthlyInterestRate]);

    // Dynamic File Icon
    const getFileIcon = (filename) => {
        const fileType = filename.split(".").pop().toLowerCase();
        let icon = null;
        let color = null;

        switch (fileType) {
            case "png":
            case "jpg":
            case "jpeg":
                icon = InsertPhoto;
                color = "purple";
                break;
            case "doc":
            case "docx":
                icon = Description;
                color = "blue";
                break;
            case "pdf":
                icon = PictureAsPdf;
                color = "red";
                break;
            case "xls":
            case "xlsx":
                icon = GridOn;
                color = "green";
        }

        return { icon, color };
    };

    // Download Attachment
    const handleFileDownload = async (filename, id) => {
        try {
            const response = await axiosInstance.get(
                `/loans/downloadFile/${id}`,
                {
                    responseType: "blob",
                    headers,
                }
            );
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    // Response Verification
    const checkInput = (event) => {
        event.preventDefault();

        if (!appResponse) {
            setAppResponseError(true);
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Please select an action!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            setAppResponseError(false);
            Swal.fire({
                customClass: { container: "my-swal" },
                title: `Confirm ${appResponse} loan application?`,
                text: `Are you sure you want to ${appResponse.toLowerCase()} this loan application? This action cannot be undone.`,
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Yes, proceed",
                confirmButtonColor: `${appResponse === "Approve" ? "#177604" : "#f44336"}`,
                showCancelButton: true,
                cancelButtonText: "No, cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    setActionSubmitted(true);
                    if (appResponse === "Decline") {
                        saveInput(event, appResponse);
                    } else {
                        setShowProposalForm(true); // Show proposal input fields
                    }
                }
            });
        }
    };

    // Save Response
    const saveInput = (event, action) => {
        event.preventDefault();

        const data = {
            loan_id: selectedLoan,
            status: action,
        };

        axiosInstance.post(`/loans/updateLoanStatus/${selectedLoan}`, data, { headers })
            .then((response) => {
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `The loan application has been ${action === "Approve" ? "Approved" : "Declined"}.`,
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then((res) => {
                    if (res.isConfirmed) {
                        close();
                    }
                });
            })
            .catch((error) => {
                console.error("Error managing loan application:", error);
            });
    };

    // Fetch loan details for PreviewProposal
    const fetchLoanDetails = () => {
        axiosInstance.get(`/loans/getLoanDetails/${selectedLoan}`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    const loanData = response.data.loan;
                    setLoanDetails(loanData);
                    setFiles(loanData.attachments || []);
                    setLoanProposal(loanData.proposal);
                    if (loanData.proposal) {
                        setProposedLoanAmount(loanData.proposal.proposed_loan_amount.toString());
                        setProposedPaymentTerm(loanData.proposal.proposed_payment_term.toString());
                        setMonthlyInterestRate(loanData.proposal.monthly_interest_rate.toString());
                        setShowProposalForm(true);
                        setActionSubmitted(true);
                        setAppResponse("Approve");
                    }
                    if (loanData.status === "Declined") {
                        setActionSubmitted(true);
                        setAppResponse("Decline");
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching loan details:', error);
            });
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: { xs: "100%", sm: "900px" },
                        maxWidth: '1000px',
                        maxHeight: '750px',
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>Loan Application</Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex' }}>
                        {/* Loan Details */}
                        <Box sx={{ width: "50%" }}>
                            <Grid container rowSpacing={2}>
                                <Grid size={12} align="left">
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                        Loan Details
                                    </Typography>
                                </Grid>
                                {/* Loan Amount */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Loan Amount"
                                        info={`₱${parseFloat(loanDetails.loan_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                        compact
                                        clean
                                    />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Request Date */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Requested"
                                        info={loanDetails.created_at ? dayjs(loanDetails.created_at).format(`MMM D, YYYY   hh:mm A`) : '-'}
                                        compact
                                        clean
                                    />
                                </Grid>
                                {/* Payment Term */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Payment Term"
                                        info={`${loanDetails.payment_term || 0} months`}
                                        compact
                                        clean
                                    />
                                </Grid>
                                {/* Paid Amount */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Paid Amount"
                                        info={`₱${parseFloat(loanDetails.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                        compact
                                        clean
                                    />
                                </Grid>
                                {/* Remaining Amount */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Remaining Amount"
                                        info={`₱${parseFloat(loanDetails.remaining_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                        compact
                                        clean
                                    />
                                </Grid>
                                {/* Status */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Status"
                                        info={loanDetails.status || 'Pending'}
                                        compact
                                        clean
                                    />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Reason */}
                                <Grid container size={{ xs: 12 }}>
                                    <Grid size={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                            Reason
                                        </Typography>
                                    </Grid>
                                    <Grid size={12}>
                                        {loanDetails.reason || 'No reason provided'}
                                    </Grid>
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Attachments */}
                                <Grid container size={{ xs: 12 }}>
                                    <Grid size={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                            Attached Files
                                        </Typography>
                                    </Grid>
                                    <Grid size={12}>
                                        {files.length > 0 ? (
                                            <Stack direction="column" sx={{ width: '100%' }}>
                                                {files.map((file, index) => {
                                                    const fileIcon = getFileIcon(file.filename);
                                                    return (
                                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '4px 8px', mt: 1 }}>
                                                            <Box sx={{ display: 'flex' }}>
                                                                {fileIcon.icon && <fileIcon.icon sx={{ mr: 1, color: fileIcon.color }} />}
                                                                <Typography noWrap>{file.filename}</Typography>
                                                            </Box>
                                                            <Tooltip title="Download File">
                                                                <IconButton onClick={() => handleFileDownload(file.filename, file.id)} size="small">
                                                                    <FileDownload />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        ) : (
                                            <Box sx={{ mt: 1, width: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 8px' }}>
                                                <Typography noWrap variant="caption" sx={{ color: 'text.secondary' }}>-- No Attached Files --</Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Application Response */}
                                {isAdmin && !['Declined', 'Cancelled'].includes(loanDetails.status) && (
                                    <Grid container size={{ xs: 12 }} sx={{ alignItems: "center" }}>
                                        <Grid size={{ xs: 5 }} align="left">
                                            Action
                                        </Grid>
                                        <Grid size={{ xs: 7 }} align="left">
                                            <FormControl fullWidth>
                                                <InputLabel id="app-response-label">
                                                    Select Action
                                                </InputLabel>
                                                <Select
                                                    labelId="app-response-label"
                                                    id="app-response"
                                                    value={appResponse}
                                                    error={appResponseError}
                                                    label="Select Action"
                                                    onChange={(event) => setAppResponse(event.target.value)}
                                                    disabled={actionSubmitted}
                                                >
                                                    <MenuItem value="Approve">Approve</MenuItem>
                                                    <MenuItem value="Decline">Decline</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                )}
                                {/* Submit Action */}
                                {isAdmin && !['Declined', 'Cancelled'].includes(loanDetails.status) && !showProposalForm && (
                                    <Grid size={12} align="center" sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            sx={{ backgroundColor: "#177604", color: "white" }}
                                            onClick={checkInput}
                                            disabled={actionSubmitted}
                                        >
                                            <p className="m-0">
                                                <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}Confirm Response{" "}
                                            </p>
                                        </Button>
                                    </Grid>
                                )}
                                {/* Proposal Input Fields */}
                                {showProposalForm && (
                                  <>
                                      <Grid size={12} sx={{ my: 0 }}>
                                          <Divider />
                                      </Grid>
                                      <Grid container size={{ xs: 12 }} spacing={2}>
                                          <Grid size={12}>
                                              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                  Loan Proposal
                                              </Typography>
                                          </Grid>
                                          <Grid size={4}>
                                              <TextField
                                                  fullWidth
                                                  label="New Loan Amount"
                                                  value={proposedLoanAmount}
                                                  onChange={(e) => setProposedLoanAmount(e.target.value)}
                                                  type="number"
                                                  variant="outlined"
                                                  disabled={['Approved', 'Declined', 'Cancelled'].includes(loanDetails.status)}
                                                  inputProps={{ min: 0 }}
                                              />
                                          </Grid>
                                          <Grid size={4}>
                                              <TextField
                                                  fullWidth
                                                  label="New Payment Term (months)"
                                                  value={proposedPaymentTerm}
                                                  onChange={(e) => setProposedPaymentTerm(e.target.value)}
                                                  type="number"
                                                  variant="outlined"
                                                  disabled={['Approved', 'Declined', 'Cancelled'].includes(loanDetails.status)}
                                                  inputProps={{ min: 1 }}
                                              />
                                          </Grid>
                                          <Grid size={4}>
                                              <TextField
                                                  fullWidth
                                                  label="Monthly Interest Rate (%)"
                                                  value={monthlyInterestRate}
                                                  onChange={(e) => setMonthlyInterestRate(e.target.value)}
                                                  type="number"
                                                  variant="outlined"
                                                  disabled={['Approved', 'Declined', 'Cancelled'].includes(loanDetails.status)}
                                                  inputProps={{ min: 0, step: 0.01 }}
                                              />
                                          </Grid>
                                          <Grid size={12} align="right">
                                              <Button
                                                  variant="contained"
                                                  onClick={() => setOpenPreview(true)}
                                                  disabled={!proposedLoanAmount || !proposedPaymentTerm || !monthlyInterestRate}
                                                  sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                                              >
                                                  Preview Loan Proposal
                                              </Button>
                                          </Grid>
                                      </Grid>
                                  </>
                              )}
                            </Grid>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        {/* Employee Details */}
                        <Box sx={{ width: "50%" }}>
                            <Grid container rowSpacing={2}>
                                <Grid size={12} align="left">
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                        Employee Information
                                    </Typography>
                                </Grid>
                                {/* Employee Name */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Name"
                                        info={`${loanDetails.employee_name || ''}`}
                                        compact
                                        clean
                                    />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Employee Position */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Position"
                                        info={loanDetails.job_title || '-'}
                                        compact
                                        clean
                                    />
                                </Grid>
                                {/* Employee Branch */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Branch"
                                        info={loanDetails.branch || '-'}
                                        compact
                                        clean
                                    />
                                </Grid>
                                {/* Employee Department */}
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Department"
                                        info={loanDetails.department || '-'}
                                        compact
                                        clean
                                    />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Current Loans */}
                                <Grid container size={{ xs: 12 }}>
                                  <Grid size={12}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                          Current Loans
                                      </Typography>
                                  </Grid>
                                  <Grid size={12}>
                                      <TableContainer>
                                          <Table size="small">
                                              <TableHead>
                                                  <TableRow>
                                                      <TableCell align="left" sx={{ width: "20%" }}>
                                                          <Typography variant="caption" sx={{ color: "text.secondary" }}>Loan Amount</Typography>
                                                      </TableCell>
                                                      <TableCell align="center" sx={{ width: "20%" }}>
                                                          <Typography variant="caption" sx={{ color: "text.secondary" }}>Rem. Months</Typography>
                                                      </TableCell>
                                                      <TableCell align="center" sx={{ width: "20%" }}>
                                                          <Typography variant="caption" sx={{ color: "text.secondary" }}>Paid Amount</Typography>
                                                      </TableCell>
                                                      <TableCell align="center" sx={{ width: "20%" }}>
                                                          <Typography variant="caption" sx={{ color: "text.secondary" }}>Rem. Amount</Typography>
                                                      </TableCell>
                                                  </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                  {existingLoans.length > 0 ? (
                                                      existingLoans.map((loan, index) => (
                                                          <TableRow key={index}>
                                                              <TableCell>{`₱${parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</TableCell>
                                                              <TableCell align="center">{loan.remaining_months}</TableCell>
                                                              <TableCell align="center">{`₱${parseFloat(loan.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</TableCell>
                                                              <TableCell align="center">{`₱${parseFloat(loan.remaining_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</TableCell>
                                                          </TableRow>
                                                      ))
                                                  ) : (
                                                      <TableRow>
                                                          <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                              No Current Loans Found
                                                          </TableCell>
                                                      </TableRow>
                                                  )}
                                              </TableBody>
                                          </Table>
                                      </TableContainer>
                                  </Grid>
                              </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            <PreviewProposal
                open={openPreview}
                onClose={() => {
                    setOpenPreview(false);
                    fetchLoanDetails();
                }}
                proposedLoanAmount={proposedLoanAmount}
                proposedPaymentTerm={proposedPaymentTerm}
                monthlyInterestRate={monthlyInterestRate}
                selectedLoan={selectedLoan}
                isAdmin={isAdmin}
                isPreviewOnly={!(isAdmin && loanDetails.status === 'Pending')} 
            />
        </>
    );
};

export default LoanApplication;