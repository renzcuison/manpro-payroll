import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    FormControl,
    FormHelperText,
    Stack,
    Checkbox
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const LoanEdit = ({ open, close, loanDetails }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [loanAmount, setLoanAmount] = useState(loanDetails.loan_amount);
    const [reason, setReason] = useState(loanDetails.reason);
    const [paymentTerm, setPaymentTerm] = useState(loanDetails.payment_term);
    const [paidAmount] = useState(loanDetails.paid_amount || 0); // Read-only
    const [remainingAmount, setRemainingAmount] = useState(loanDetails.remaining_amount || loanDetails.loan_amount); // Read-only, updates with loanAmount
    const [attachment, setAttachment] = useState([]);
    const [image, setImage] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    const [deleteAttachments, setDeleteAttachments] = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);

    // Form Errors
    const [loanAmountError, setLoanAmountError] = useState(false);
    const [reasonError, setReasonError] = useState(false);
    const [paymentTermError, setPaymentTermError] = useState(false);
    const [fileError, setFileError] = useState(false);

    // Fetch existing files on mount
    useEffect(() => {
        axiosInstance
            .get(`/loans/getLoanApplicationFiles/${loanDetails.id}`, { headers })
            .then((response) => {
                setFileNames(response.data.filenames || []);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });

        // Update remaining amount whenever loanAmount changes
        setRemainingAmount(parseFloat(loanAmount) - parseFloat(paidAmount));
    }, [loanAmount, paidAmount, loanDetails.id]);

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const oldFiles = oldFileCompiler("Document");
        const oldFileCount = oldFiles.length - deleteAttachments.length;
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, oldFileCount, 5, 10485760, "document");
        if (validFiles) {
            setAttachment(prev => [...prev, ...files]);
        }
    };

    const handleDeleteAttachment = (index) => {
        setAttachment(prevAttachments => prevAttachments.filter((_, i) => i !== index));
    };

    // Image Handlers
    const handleImageUpload = (input) => {
        const oldFiles = oldFileCompiler("Image");
        const oldFileCount = oldFiles.length - deleteImages.length;
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, image.length, oldFileCount, 10, 5242880, "image");
        if (validFiles) {
            setImage(prev => [...prev, ...files]);
        }
    };

    const handleDeleteImage = (index) => {
        setImage(prevImages => prevImages.filter((_, i) => i !== index));
    };

    // Collects Old Files by Type
    const oldFileCompiler = (fileType) => {
        if (fileNames) {
            return fileNames.filter(filename => filename.type === fileType);
        } else {
            return [];
        }
    };

    // Validate Files
    const validateFiles = (newFiles, currentFileCount, oldFileCount, countLimit, sizeLimit, docType) => {
        if ((newFiles.length + currentFileCount + oldFileCount) > countLimit) {
            formError("File Limit Reached!", `You can only have up to ${countLimit} ${docType}s at a time.`);
            return false;
        } else {
            let largeFiles = 0;
            newFiles.forEach((file) => {
                if (file.size > sizeLimit) {
                    largeFiles++;
                }
            });
            if (largeFiles > 0) {
                formError("File Too Large!", `Each ${docType} can only be up to ${docType === "image" ? "5 MB" : "10 MB"}.`);
                return false;
            } else {
                return true;
            }
        }
    };

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Form Error Notice
    const formError = (title, message) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: title,
            text: message,
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#177604",
        });
    };

    // Input Verification
    const checkInput = (event) => {
        event.preventDefault();

        // Requirement Checks
        setLoanAmountError(!loanAmount || loanAmount <= 0);
        setReasonError(!reason);
        setPaymentTermError(!paymentTerm || paymentTerm <= 0);

        let fileRequirementsMet = true;
        let deleteAllOldFiles = true;
        if (fileNames) {
            deleteAllOldFiles = (deleteImages.length + deleteAttachments.length === fileNames.length);
        }

        if (!attachment.length && !image.length && deleteAllOldFiles && fileNames.length > 0) {
            setFileError(true);
            fileRequirementsMet = false;
        } else {
            setFileError(false);
        }

        if (!loanAmount || loanAmount <= 0 || !reason || !paymentTerm || paymentTerm <= 0) {
            formError(null, "All required fields must be filled with valid values!");
        } else if (!fileRequirementsMet) {
            formError(null, "You must include at least one supporting file!");
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to update this loan application?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    // Final Submission
    const saveInput = (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append("id", loanDetails.id);
        formData.append("loan_amount", parseFloat(loanAmount).toFixed(2)); // Ensure numeric
        formData.append("reason", reason);
        formData.append("payment_term", parseInt(paymentTerm, 10)); // Ensure integer
        if (attachment.length > 0) {
            attachment.forEach(file => {
                formData.append('attachment[]', file);
            });
        }
        if (image.length > 0) {
            image.forEach(file => {
                formData.append('image[]', file);
            });
        }
        if (deleteAttachments.length > 0) {
            deleteAttachments.forEach(del => {
                formData.append('deleteAttachments[]', del);
            });
        } else {
            formData.append('deleteAttachments[]', null);
        }
        if (deleteImages.length > 0) {
            deleteImages.forEach(del => {
                formData.append('deleteImages[]', del);
            });
        } else {
            formData.append('deleteImages[]', null);
        }
    
        // Log formData for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
    
        axiosInstance
            .post("/loans/editLoanApplication", formData, { headers })
            .then((response) => {
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: "Loan application successfully updated!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then(() => {
                    close();
                });
            })
            .catch((error) => {
                console.error("Error:", error);
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Error",
                    text: error.response?.data?.message || "Failed to update loan application.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                });
            });
    };

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
                    minWidth: { xs: "100%", sm: "700px" },
                    maxWidth: '800px',
                    marginBottom: '5%'
                }
            }}
        >
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                        Edit Loan Application
                    </Typography>
                    <IconButton onClick={close}>
                        <i className="si si-close"></i>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                <Box component="form" onSubmit={checkInput} noValidate autoComplete="off">
                    <Grid container columnSpacing={2} rowSpacing={3}>
                        {/* Loan Amount */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <TextField
                                    required
                                    label="Loan Amount"
                                    value={loanAmount}
                                    error={loanAmountError}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                                        inputProps: { min: 0, step: "0.01" }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        {/* Payment Term */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <TextField
                                    required
                                    label="Payment Term (Months)"
                                    type="number"
                                    value={paymentTerm}
                                    error={paymentTermError}
                                    onChange={(e) => setPaymentTerm(e.target.value)}
                                    InputProps={{
                                        inputProps: { min: 1 }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        {/* Paid Amount (Read-Only) */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Paid Amount"
                                    value={paidAmount}
                                    InputProps={{
                                        readOnly: true,
                                        startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        {/* Remaining Amount (Read-Only) */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Remaining Amount"
                                    value={remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    InputProps={{
                                        readOnly: true,
                                        startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        {/* Reason */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    required
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Reason"
                                    value={reason}
                                    error={reasonError}
                                    onChange={(e) => setReason(e.target.value)}
                                    inputProps={{ maxLength: 512 }}
                                />
                                <FormHelperText>{reason.length}/512</FormHelperText>
                            </FormControl>
                        </Grid>
                        {/* Attachment Upload */}
                        <Grid item xs={12}>
                            {fileError && (
                                <Typography variant="caption" color="error" sx={{ pb: 3 }}>
                                    You must include at least one supporting file!
                                </Typography>
                            )}
                            <FormControl fullWidth>
                                <Box sx={{ width: "100%" }}>
                                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
                                            <Typography noWrap>Documents</Typography>
                                            <input
                                                accept=".doc, .docx, .pdf, .xls, .xlsx"
                                                id="attachment-upload"
                                                type="file"
                                                name="attachment"
                                                multiple
                                                style={{ display: "none" }}
                                                onChange={handleAttachmentUpload}
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: "auto" }}
                                                onClick={() => document.getElementById('attachment-upload').click()}
                                            >
                                                <p className="m-0">
                                                    <i className="fa fa-plus"></i> Add
                                                </p>
                                            </Button>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Max Limit: 5 Files, 10 MB Each
                                        </Typography>
                                        {attachment.length > 0 && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                Remove
                                            </Typography>
                                        )}
                                    </Stack>
                                    {attachment.length > 0 && (
                                        <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                            {attachment.map((file, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: '4px',
                                                        padding: '4px 8px'
                                                    }}
                                                >
                                                    <Typography noWrap>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                    <IconButton onClick={() => handleDeleteAttachment(index)} size="small">
                                                        <Cancel />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                    {(() => {
                                        const documentFiles = oldFileCompiler("Document");
                                        return documentFiles.length > 0 && (
                                            <>
                                                <Stack direction="row" spacing={1} sx={{ pt: 1, pr: 1, justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Current Documents
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Remove
                                                    </Typography>
                                                </Stack>
                                                {documentFiles.map((filename, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mt: 1,
                                                            p: 1,
                                                            borderRadius: "2px",
                                                            border: '1px solid',
                                                            borderColor: deleteAttachments.includes(filename.id) ? "#f44336" : "#e0e0e0"
                                                        }}
                                                    >
                                                        <Typography variant="body2" noWrap>
                                                            {filename.filename}
                                                        </Typography>
                                                        <Checkbox
                                                            checked={deleteAttachments.includes(filename.id)}
                                                            onChange={() => {
                                                                const oldFileCount = documentFiles.length - deleteAttachments.length;
                                                                setDeleteAttachments(prev => {
                                                                    if (prev.includes(filename.id)) {
                                                                        if (attachment.length + oldFileCount === 5) {
                                                                            formError("File Limit Reached!", "You can only have up to 5 documents at a time.");
                                                                            return prev;
                                                                        } else {
                                                                            return prev.filter(id => id !== filename.id);
                                                                        }
                                                                    } else {
                                                                        return [...prev, filename.id];
                                                                    }
                                                                });
                                                            }}
                                                            sx={{ '&.Mui-checked': { color: "#f44336" } }}
                                                        />
                                                    </Box>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </Box>
                            </FormControl>
                        </Grid>
                        {/* Image Upload */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Box sx={{ width: "100%" }}>
                                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
                                            <Typography noWrap>Images</Typography>
                                            <input
                                                accept=".png, .jpg, .jpeg"
                                                id="image-upload"
                                                type="file"
                                                name="image"
                                                multiple
                                                style={{ display: "none" }}
                                                onChange={handleImageUpload}
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: "auto" }}
                                                onClick={() => document.getElementById('image-upload').click()}
                                            >
                                                <p className="m-0">
                                                    <i className="fa fa-plus"></i> Add
                                                </p>
                                            </Button>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Max Limit: 10 Files, 5 MB Each
                                        </Typography>
                                        {image.length > 0 && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                Remove
                                            </Typography>
                                        )}
                                    </Stack>
                                    {image.length > 0 && (
                                        <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                            {image.map((file, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: '4px',
                                                        padding: '4px 8px'
                                                    }}
                                                >
                                                    <Typography noWrap>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                    <IconButton onClick={() => handleDeleteImage(index)} size="small">
                                                        <Cancel />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                    {(() => {
                                        const imageFiles = oldFileCompiler("Image");
                                        return imageFiles.length > 0 && (
                                            <>
                                                <Stack direction="row" spacing={1} sx={{ pt: 1, pr: 1, justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Current Images
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Remove
                                                    </Typography>
                                                </Stack>
                                                {imageFiles.map((filename, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mt: 1,
                                                            p: 1,
                                                            borderRadius: "2px",
                                                            border: '1px solid',
                                                            borderColor: deleteImages.includes(filename.id) ? "#f44336" : "#e0e0e0"
                                                        }}
                                                    >
                                                        <Typography variant="body2" noWrap>
                                                            {filename.filename}
                                                        </Typography>
                                                        <Checkbox
                                                            checked={deleteImages.includes(filename.id)}
                                                            onChange={() => {
                                                                const oldFileCount = imageFiles.length - deleteImages.length;
                                                                setDeleteImages(prev => {
                                                                    if (prev.includes(filename.id)) {
                                                                        if (image.length + oldFileCount === 10) {
                                                                            formError("File Limit Reached!", "You can only have up to 10 images at a time.");
                                                                            return prev;
                                                                        } else {
                                                                            return prev.filter(id => id !== filename.id);
                                                                        }
                                                                    } else {
                                                                        return [...prev, filename.id];
                                                                    }
                                                                });
                                                            }}
                                                            sx={{ '&.Mui-checked': { color: "#f44336" } }}
                                                        />
                                                    </Box>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </Box>
                            </FormControl>
                        </Grid>
                        {/* Submit Button */}
                        <Grid item xs={12} align="center">
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ backgroundColor: "#177604", color: "white" }}
                                className="m-1"
                            >
                                <p className="m-0">
                                    <i className="fa fa-floppy-o mr-2 mt-1"></i> Update Loan
                                </p>
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LoanEdit;