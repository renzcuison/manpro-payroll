import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Button,
    TextField,
    FormGroup,
    FormControl,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useUser } from "../../../../hooks/useUser";

const PerformanceEvaluationAdd = ({ open, onClose, onSuccess }) => {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [formName, setFormName] = useState('');
    const [formNameError, setFormNameError] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();
        if (!formName) {
            setFormNameError(true);
            Swal.fire({
                text: "Evaluation Form Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        } else {
            setFormNameError(false);
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
        const data = { name: formName };
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
                        setFormName('');
                        if (onSuccess) onSuccess();
                        onClose();
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    text: "Failed to save evaluation form.",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                console.error('Error:', error);
            });
    };

    const handleCancel = () => {
        setFormName('');
        setFormNameError(false);
        onClose();
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
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: 26, pb: 0, mt: 2, mb: 2 }}>
                CREATE EVALUATION FORM
                <Box
                    sx={{
                        height: '2px',
                        width: '100%',
                        bgcolor: '#E6E6E6',
                        borderRadius: 2
                    }}
                />
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 20, top: 20, color: '#727F91' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Evaluation Form Name*"
                        variant="outlined"
                        fullWidth
                        value={formName}
                        error={formNameError}
                        onChange={e => setFormName(e.target.value)}
                        sx={{ mb: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<CloseIcon />}
                            onClick={handleCancel}
                            sx={{
                                bgcolor: '#7b8794',
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: '8px',
                                boxShadow: 1,
                                '&:hover': { bgcolor: '#5a6473' }
                            }}
                        >
                            CANCEL
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={checkInput}
                            sx={{
                                bgcolor: '#137333',
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: '8px',
                                boxShadow: 1,
                                '&:hover': { bgcolor: '#0d5c27' }
                            }}
                        >
                            SAVE
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PerformanceEvaluationAdd;