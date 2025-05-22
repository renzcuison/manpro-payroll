import React, { useState } from 'react';
import { Dialog, DialogContent, Button, Typography, FormGroup, TextField, FormControl, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useUser } from "../../../../hooks/useUser";
import Swal from "sweetalert2";

const PerformanceEvaluationAdd = ({ open, onClose, onSuccess }) => {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [fromName, setFromName] = useState('');
    const [formNameError, setFormError] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();
        if (!fromName) {
            setFormError(true);
            Swal.fire({
                text: "Evaluation Form Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        } else {
            setFormError(false);
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You want to save this evaluation form?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput(event);
            }
        });
    };

    const saveInput = (event) => {
        event.preventDefault();
        const data = { name: fromName };
        axiosInstance.post('/saveEvaluation', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        text: "Evaluation form saved successfully!",
                        icon: "success",
                        timer: 1000,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        setFromName('');
                        if (onSuccess) onSuccess();
                        onClose();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: 10,
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    minWidth: 400,
                    maxWidth: 800,
                    backgroundColor: '#f8f9fa',
                    padding: 0
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ position: 'absolute', right: 20, top: 20 }}>
                    <IconButton onClick={onClose} sx={{ color: '#727F91' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ px: 6, pt: 6, pb: 2 }}>
                    <Typography variant="h4" sx={{mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                        Create Evaluation Form
                    </Typography>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off">
                        <FormGroup row={true} sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%' }}>
                                <TextField
                                    required
                                    id="fromName"
                                    label="Evaluation Form Name"
                                    variant="outlined"
                                    value={fromName}
                                    error={formNameError}
                                    onChange={(e) => setFromName(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>
                        <Box display="flex" justifyContent="space-between" sx={{ marginTop: '20px', marginBottom: '20px', gap: 2 }}>
                            <Button
                                type="button"
                                variant="contained"
                                sx={{ backgroundColor: '#727F91', color: 'white', minWidth: 110 }}
                                onClick={onClose}
                            >
                                <span className='m-0'><i className="fa fa-times mr-2 mt-1"></i> Cancel </span>
                            </Button>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white', minWidth: 110 }}>
                                <span className='m-0'><i className="fa fa-check mr-2 mt-1"></i> Confirm </span>
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PerformanceEvaluationAdd;