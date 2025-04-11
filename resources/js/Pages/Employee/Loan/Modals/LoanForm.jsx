import React, { useState } from 'react';
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
    Stack,
    FormControl,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from 'sweetalert2';

const LoanForm = ({ open, close }) => {
    const storedUser = localStorage.getItem('nasya_user');
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [loanAmount, setLoanAmount] = useState('');
    const [reason, setReason] = useState('');
    const [paymentTerm, setPaymentTerm] = useState('');
    const [attachment, setAttachment] = useState([]);
    const [image, setImage] = useState([]);

    // Form Errors
    const [loanAmountError, setLoanAmountError] = useState(false);
    const [reasonError, setReasonError] = useState(false);
    const [paymentTermError, setPaymentTermError] = useState(false);

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, 5, 10485760, 'document');
        if (validFiles) {
            setAttachment((prev) => [...prev, ...files]);
        }
    };

    const handleDeleteAttachment = (index) => {
        setAttachment((prevAttachments) =>
            prevAttachments.filter((_, i) => i !== index)
        );
    };

    // Image Handlers
    const handleImageUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, image.length, 10, 5242880, 'image');
        if (validFiles) {
            setImage((prev) => [...prev, ...files]);
        }
    };

    const handleDeleteImage = (index) => {
        setImage((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
    };

    const validateFiles = (newFiles, currentFileCount, countLimit, sizeLimit, docType) => {
        if (newFiles.length + currentFileCount > countLimit) {
            formError('File Limit Reached!', `You can only have up to ${countLimit} ${docType}s at a time.`);
            return false;
        } else {
            let largeFiles = 0;
            newFiles.forEach((file) => {
                if (file.size > sizeLimit) {
                    largeFiles++;
                }
            });
            if (largeFiles > 0) {
                formError('File Too Large!', `Each ${docType} can only be up to ${docType === 'image' ? '5 MB' : '10 MB'}.`);
                return false;
            } else {
                return true;
            }
        }
    };

    const getFileSize = (size) => {
        if (size === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formError = (title, message) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: 'my-swal' },
            title: title,
            text: message,
            icon: 'error',
            showConfirmButton: true,
            confirmButtonColor: '#177604',
        });
    };

    // Form Submission
    const checkInput = (event) => {
        event.preventDefault();

        setLoanAmountError(!loanAmount || loanAmount <= 0);
        setReasonError(!reason);
        setPaymentTermError(!paymentTerm || paymentTerm <= 0);

        if (!loanAmount || loanAmount <= 0 || !reason || !paymentTerm || paymentTerm <= 0) {
            formError(null, 'All required fields must be filled with valid values!');
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: 'my-swal' },
                title: 'Are you sure?',
                text: 'Do you want to submit this loan application?',
                icon: 'warning',
                showConfirmButton: true,
                confirmButtonText: 'Submit',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('loan_amount', loanAmount);
        formData.append('reason', reason);
        formData.append('payment_term', paymentTerm);
        if (attachment.length > 0) {
            attachment.forEach((file) => {
                formData.append('attachment[]', file);
            });
        }
        if (image.length > 0) {
            image.forEach((file) => {
                formData.append('image[]', file);
            });
        }

        axiosInstance
            .post('/loans/saveLoanApplication', formData, { headers })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute('aria-hidden');
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    title: 'Success!',
                    text: 'Your loan application has been submitted!',
                    icon: 'success',
                    showConfirmButton: true,
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#177604',
                }).then((res) => {
                    if (res.isConfirmed) {
                        close();
                        document.body.setAttribute('aria-hidden', 'true');
                    } else {
                        document.body.setAttribute('aria-hidden', 'true');
                    }
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                document.body.setAttribute('aria-hidden', 'true');
                formError('Error', 'Failed to submit loan application.');
            });
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    backgroundColor: '#ffffff',
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    borderRadius: '10px',
                    minWidth: { xs: '100%', sm: '700px' },
                    maxWidth: '800px',
                    marginBottom: '5%',
                },
            }}
        >
            <DialogTitle sx={{ padding: 2, paddingBottom: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ ml: 1, fontWeight: 'bold' }}>
                        Create Loan Application
                    </Typography>
                    <IconButton onClick={close}>
                        <Cancel />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ padding: 2, mt: 1, mb: 2, overflowY: 'auto' }}>
                <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" className="loan-form-container">
                    <Grid container spacing={1}>
                        {/* Loan Amount and Payment Term in one row */}
                        <Grid item xs={12} sm={8}>
                            <FormControl fullWidth>
                                <TextField
                                    required
                                    variant="outlined"
                                    placeholder="Loan Amount *"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    error={loanAmountError}
                                    helperText={loanAmountError ? 'Please enter a valid loan amount' : ''}
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 1, color: '#000' }}>₱</Typography>,
                                        sx: {
                                            backgroundColor: '#fff',
                                            borderRadius: '5px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d3d3d3',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d3d3d3',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#42a5f5',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '40px',
                                        },
                                        '& .MuiInputLabel-root': {
                                            display: 'none', // Hide the floating label
                                        },
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            marginRight: 0,
                                        },
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <TextField
                                    required
                                    variant="outlined"
                                    placeholder="Payment Term (Months) *"
                                    type="number"
                                    value={paymentTerm}
                                    onChange={(e) => setPaymentTerm(e.target.value)}
                                    error={paymentTermError}
                                    helperText={paymentTermError ? 'Please enter a valid payment term' : ''}
                                    InputProps={{
                                        inputProps: { min: 1 },
                                        sx: {
                                            backgroundColor: '#fff',
                                            borderRadius: '5px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d3d3d3',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d3d3d3',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#42a5f5',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '40px',
                                        },
                                        '& .MuiInputLabel-root': {
                                            display: 'none', // Hide the floating label
                                        },
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            marginRight: 0,
                                        },
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        {/* Reason */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    required
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    placeholder="Reason *"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    error={reasonError}
                                    helperText={reasonError ? 'Please provide a reason for the loan' : `${reason.length}/256`}
                                    inputProps={{ maxLength: 256 }}
                                    InputProps={{
                                        sx: {
                                            backgroundColor: '#fff',
                                            borderRadius: '5px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d3d3d3',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d3d3d3',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#42a5f5',
                                                borderWidth: '2px',
                                            },
                                        },
                                    }}
                                    sx={{
                                        '& .MuiInputLabel-root': {
                                            display: 'none', // Hide the floating label
                                        },
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            marginRight: 0,
                                            textAlign: 'right',
                                            fontSize: '0.75rem',
                                        },
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        {/* Documents and Images in one row */}
                        <Grid item xs={12}>
                            <Grid container spacing={2} sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <Box sx={{ width: '100%' }}>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                                                <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                                                    Documents
                                                </Typography>
                                                <input
                                                    accept=".doc,.docx,.pdf,.xls,.xlsx"
                                                    id="attachment-upload"
                                                    type="file"
                                                    name="attachment"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={handleAttachmentUpload}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#42a5f5',
                                                        color: 'white',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 'bold',
                                                        borderRadius: '5px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem',
                                                        '&:hover': {
                                                            backgroundColor: '#2196f3',
                                                        },
                                                    }}
                                                    onClick={() => document.getElementById('attachment-upload').click()}
                                                >
                                                    + Add
                                                </Button>
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.75rem' }}>
                                                Max Limit: 5 Files, 10 MB Each
                                            </Typography>
                                            {attachment.length > 0 && (
                                                <Stack direction="column" spacing={0.5} sx={{ mt: 1, width: '100%' }}>
                                                    {attachment.map((file, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '4px',
                                                                padding: '4px 8px',
                                                            }}
                                                        >
                                                            <Typography noWrap sx={{ fontSize: '0.875rem' }}>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                            <IconButton onClick={() => handleDeleteAttachment(index)} size="small">
                                                                <Cancel fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}
                                        </Box>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <Box sx={{ width: '100%' }}>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                                                <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                                                    Images
                                                </Typography>
                                                <input
                                                    accept=".png,.jpg,.jpeg"
                                                    id="image-upload"
                                                    type="file"
                                                    name="image"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={handleImageUpload}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#42a5f5',
                                                        color: 'white',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 'bold',
                                                        borderRadius: '5px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem',
                                                        '&:hover': {
                                                            backgroundColor: '#2196f3',
                                                        },
                                                    }}
                                                    onClick={() => document.getElementById('image-upload').click()}
                                                >
                                                    + Add
                                                </Button>
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.75rem' }}>
                                                Max Limit: 10 Files, 5 MB Each
                                            </Typography>
                                            {image.length > 0 && (
                                                <Stack direction="column" spacing={0.5} sx={{ mt: 1, width: '100%' }}>
                                                    {image.map((file, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '4px',
                                                                padding: '4px 8px',
                                                            }}
                                                        >
                                                            <Typography noWrap sx={{ fontSize: '0.875rem' }}>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                            <IconButton onClick={() => handleDeleteImage(index)} size="small">
                                                                <Cancel fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}
                                        </Box>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: '#177604',
                                    color: 'white',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    borderRadius: '5px',
                                    padding: '8px 16px',
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        backgroundColor: '#145c03',
                                    },
                                }}
                            >
                                <i className="fa fa-floppy-disk mr-2"></i> Submit Loan Application
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LoanForm;