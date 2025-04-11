import React, { useState, useEffect } from 'react';
import {
    Box, IconButton, Dialog, DialogTitle, DialogContent, Grid, Typography,
    CircularProgress, Divider, Stack, Tooltip, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload } from "@mui/icons-material";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import PreviewProposal from '../../../../components/Loan/Modal/PreviewProposal';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const LoanDetails = ({ open, close, loanId }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};

    const [loan, setLoan] = useState(null);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [pendingProposal, setPendingProposal] = useState(null);
    const [amortizationSchedule, setAmortizationSchedule] = useState([]);

    useEffect(() => {
        if (loanId && open) {
            fetchLoanDetails();
            fetchLoanFiles();
            fetchLoanProposal();
        }
    }, [loanId, open]);

    const fetchLoanDetails = async () => {
        try {
            const response = await axiosInstance.get(`/loans/getLoanDetails/${loanId}`, { headers });
            if (response.data.status === 200) {
                setLoan(response.data.loan);
                // If the loan has an approved proposal, calculate the amortization schedule
                if (response.data.loan.status === 'Approved' && response.data.loan.proposal) {
                    const schedule = calculateAmortizationSchedule(response.data.loan.proposal);
                    setAmortizationSchedule(schedule);
                }
            } else {
                setError(response.data.message || 'Failed to fetch loan details');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching loan details');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLoanFiles = async () => {
        try {
            const response = await axiosInstance.get(`/loans/getLoanApplicationFiles/${loanId}`, { headers });
            setFiles(response.data.filenames || []);
        } catch (err) {
            console.error('Error fetching files:', err);
            setFiles([]);
        }
    };

    const fetchLoanProposal = async () => {
        try {
            const response = await axiosInstance.get(`/loans/getLoanProposal/${loanId}`, { headers });
            if (response.data.status === 200 && response.data.proposal) {
                setPendingProposal(response.data.proposal);
            } else {
                setPendingProposal(null);
            }
        } catch (err) {
            console.error('Error fetching proposal:', err);
            setPendingProposal(null);
        }
    };

    const calculateAmortizationSchedule = (proposal) => {
        const loanAmount = proposal?.proposed_loan_amount || 0;
        const paymentTerm = proposal?.proposed_payment_term || 0;
        const interestRate = proposal?.monthly_interest_rate || 0;

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
                status: 'Unpaid', // Default status as "Unpaid"
            });
        }
        return schedule;
    };

    const getFileIcon = (filename) => {
        const fileType = filename.split(".").pop().toLowerCase();
        let icon = null;
        let color = null;
        switch (fileType) {
            case "png": case "jpg": case "jpeg":
                icon = InsertPhoto; color = "purple"; break;
            case "doc": case "docx":
                icon = Description; color = "blue"; break;
            case "pdf":
                icon = PictureAsPdf; color = "red"; break;
            case "xls": case "xlsx":
                icon = GridOn; color = "green"; break;
            default:
                icon = Description; color = "grey";
        }
        return { icon, color };
    };

    const handleFileDownload = async (filename, id) => {
        try {
            const response = await axiosInstance.get(`/loans/downloadFile/${id}`, {
                responseType: "blob",
                headers,
            });
            const blob = new Blob([response.data], { type: response.headers["content-type"] });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleProposalSent = (proposal) => {
        setPendingProposal(proposal);
        setOpenPreview(true);
    };

    if (isLoading) {
        return (
            <Dialog open={open} fullWidth maxWidth="md">
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={open} fullWidth maxWidth="md">
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>
                            Loan Details
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Typography color="error">{error}</Typography>
                </DialogContent>
            </Dialog>
        );
    }

    if (!loan) {
        return (
            <Dialog open={open} fullWidth maxWidth="md">
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>
                            Loan Details
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Typography>Loan not found</Typography>
                </DialogContent>
            </Dialog>
        );
    }

    const isApprovedProposal = pendingProposal && pendingProposal.status === 'Approved';

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    backgroundColor: '#f8f9fa',
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    borderRadius: '20px',
                    minWidth: { xs: "100%", sm: "500px" },
                    maxWidth: '600px',
                    marginBottom: '5%'
                }
            }}
        >
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>
                        Loan Details
                    </Typography>
                    <IconButton onClick={close}>
                        <i className="si si-close"></i>
                    </IconButton>                        

                </Box>
            </DialogTitle>
            <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                <Grid container rowSpacing={2}>
                <Grid item size={{ xs: 5 }} align="left">Loan Amount</Grid>
                <Grid item size={{ xs: 7 }} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>
                            ₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item size={{ xs: 5 }} align="left">Requested</Grid>
                    <Grid item size={{ xs: 7 }} align="left">
                        <Stack direction="row">
                            <Typography sx={{ fontWeight: "bold", width: "50%" }}>{dayjs(loan.created_at).format("MMM D, YYYY")}</Typography>
                            <Typography sx={{ fontWeight: "bold", width: "50%" }}>{dayjs(loan.created_at).format("h:mm A")}</Typography>
                        </Stack>
                    </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item size={{ xs: 5 }} align="left">Payment Term</Grid>
                    <Grid item size={{ xs: 7 }} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>{loan.payment_term ? `${loan.payment_term} months` : '-'}</Typography>
                    </Grid>
                    {isApprovedProposal && (
                        <>
                            <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                            <Grid item size={{ xs: 5 }} align="left">Monthly Interest</Grid>
                            <Grid item size={{ xs: 7 }} align="left">
                                <Typography sx={{ fontWeight: "bold" }}>{pendingProposal.monthly_interest_rate ? `${pendingProposal.monthly_interest_rate}%` : '-'}</Typography>
                            </Grid>
                        </>
                    )}
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item size={{ xs: 5 }} align="left">Paid Amount</Grid>
                    <Grid item size={{ xs: 7 }} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>
                            ₱{parseFloat(loan.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item size={{ xs: 5 }} align="left">Remaining Amount</Grid>
                    <Grid item size={{ xs: 7 }} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>
                            ₱{parseFloat((loan.loan_amount - (loan.paid_amount || 0))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item size={{ xs: 5 }} align="left">Status</Grid>
                    <Grid item size={{ xs: 7 }} align="left">
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                color: loan.status === "Approved" ? "#177604"
                                    : loan.status === "Declined" ? "#f44336"
                                    : loan.status === "Pending" ? "#e9ae20"
                                    : loan.status === "Released" ? "#42a5f5"
                                    : loan.status === "Paid" ? "#4caf50"
                                    : loan.status === "Cancelled" ? "#9e9e9e"
                                    : "#000000",
                            }}
                        >
                            {loan.status.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid container  item size={{ xs: 12}}>
                    <Grid item size={{ xs: 12 }}><div style={{ textDecoration: "underline" }}>Reason</div></Grid>
                    <Grid item size={{ xs: 12 }} sx={{ mt: 1 }}>
                        <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {loan.reason || '-'}
                        </Typography>
                    </Grid>
                </Grid>
                    <Grid item size={{ xs: 12 }} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid container item size={{ xs: 12 }}>
                    <Grid item size={{ xs: 12 }}>Attached Files</Grid>
                    <Grid item size={{ xs: 12 }}>
                            {files && files.length > 0 ? (
                                <Stack direction="column" sx={{ width: '100%' }}>
                                    {files.map((file, index) => {
                                        const fileIcon = getFileIcon(file.filename);
                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '10px',
                                                    padding: '4px 8px',
                                                    mt: 1,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex' }}>
                                                    {fileIcon.icon && <fileIcon.icon sx={{ mr: 1, color: fileIcon.color }} />}
                                                    <Typography noWrap sx={{ textDecoration: "underline" }}>{file.filename}</Typography>
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
                                    <Typography noWrap variant="caption" sx={{ color: 'text.secondary' }}>
                                        -- No Attached Files --
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                    {/* Add Monthly Payment Schedule Table for Approved Loans */}
                    {loan.status === 'Approved' && amortizationSchedule.length > 0 && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, textDecoration: "underline" }}>
                                Monthly Payment Schedule
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Month</TableCell>
                                            <TableCell>Payment</TableCell>
                                            <TableCell>Principal</TableCell>
                                            <TableCell>Interest</TableCell>
                                            <TableCell>Expected Balance</TableCell>
                                            <TableCell>Status</TableCell>
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
                                                <TableCell>{row.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    )}
                    {/* Show Preview Proposal Button only if the proposal is not Approved */}
                    {pendingProposal && !isApprovedProposal && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenPreview(true)}
                            >
                                Preview Proposal
                            </Button>
                        </Grid>
                    )}
                </Grid>
                <PreviewProposal
                    open={openPreview}
                    onClose={() => {
                        setOpenPreview(false);
                        fetchLoanDetails();
                        fetchLoanProposal();
                    }}
                    selectedLoan={loanId}
                    isAdmin={false}
                    existingProposal={pendingProposal}
                    onProposalSent={handleProposalSent}
                />
            </DialogContent>
        </Dialog>
    );
};

export default LoanDetails;