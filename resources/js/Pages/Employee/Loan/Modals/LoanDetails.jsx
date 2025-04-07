import React, { useState, useEffect } from 'react';
import {
    Box, IconButton, Dialog, DialogTitle, DialogContent, Grid, Typography,
    CircularProgress, Divider, Stack, Tooltip, Button
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
    const [pendingProposal, setPendingProposal] = useState(null); // Store proposal locally

    useEffect(() => {
        if (loanId && open) {
            fetchLoanDetails();
            fetchLoanFiles();
        }
    }, [loanId, open]);

    const fetchLoanDetails = async () => {
        try {
            const response = await axiosInstance.get(`/loans/getLoanDetails/${loanId}`, { headers });
            if (response.data.status === 200) {
                setLoan(response.data.loan);
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

    // Sync proposal state with PreviewProposal
    const handleProposalSent = (proposal) => {
        setPendingProposal(proposal);
        setOpenPreview(true); // Open preview immediately after sending (optional)
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
                    <Grid item xs={5} align="left">Loan Amount</Grid>
                    <Grid item xs={7} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>
                            ₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item xs={5} align="left">Requested</Grid>
                    <Grid item xs={7} align="left">
                        <Stack direction="row">
                            <Typography sx={{ fontWeight: "bold", width: "50%" }}>{dayjs(loan.created_at).format("MMM D, YYYY")}</Typography>
                            <Typography sx={{ fontWeight: "bold", width: "50%" }}>{dayjs(loan.created_at).format("h:mm A")}</Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={5} align="left">Payment Term</Grid>
                    <Grid item xs={7} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>{loan.payment_term ? `${loan.payment_term} months` : '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item xs={5} align="left">Paid Amount</Grid>
                    <Grid item xs={7} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>
                            ₱{parseFloat(loan.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item xs={5} align="left">Remaining Amount</Grid>
                    <Grid item xs={7} align="left">
                        <Typography sx={{ fontWeight: "bold" }}>
                            ₱{parseFloat((loan.loan_amount - (loan.paid_amount || 0))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid item xs={5} align="left">Status</Grid>
                    <Grid item xs={7} align="left">
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
                    <Grid item xs={12} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid container item xs={12}>
                        <Grid item xs={12}><div style={{ textDecoration: "underline" }}>Reason</div></Grid>
                        <Grid item xs={12} sx={{ mt: 1 }}>{loan.reason || '-'}</Grid>
                    </Grid>
                    <Grid item xs={12} sx={{ my: 0 }}><Divider /></Grid>
                    <Grid container item xs={12}>
                        <Grid item xs={12}>Attached Files</Grid>
                        <Grid item xs={12}>
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
                    {/* Show Preview Proposal if there's a pending proposal */}
                    {pendingProposal && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => setOpenPreview(true)}>
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