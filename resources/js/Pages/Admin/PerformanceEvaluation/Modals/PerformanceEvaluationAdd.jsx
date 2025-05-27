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
    IconButton,
    Typography
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
        onClose();
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
        axiosInstance.post('/saveEvaluationForm', data, { headers })
            .then(response => {
                if (response.data.status.toString().startsWith(2)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "success",
                        timer: 1000,
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay' // Custom class to ensure overlay
                        }
                    }).then(() => {
                        setFormName('');
                        if (onSuccess) onSuccess(formName);
                        onClose();
                    });
                } else if (response.data.status.toString().startsWith(4)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay' // Custom class to ensure overlay
                        }
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    text: "Failed to save evaluation form.",
                    icon: "error",
                    timer: 1000,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                    customClass: {
                        popup: 'swal-popup-overlay' // Custom class to ensure overlay
                    }
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
                    
                }
            }}
            sx={{
                '& .MuiPaper-root': {
                    width: '1000px', 
                    height: '340px', 
                    px: 3,
                },
            }}
        >
            <DialogTitle sx={{ paddingTop: '50px', paddingBottom:'50px' }}>
                
                {/* Add Sub-Category Title */}
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontFamily: 'Roboto, sans-serif', // Set font to Roboto
                        fontWeight: 'bold',
                    }}
                >
                    CREATE EVALUATION FORM
                </Typography>

                {/* Thin line beneath the title */}
                <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }}></Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1 , mb: 4 }}>
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
                            startIcon={<CloseIcon sx={{ 
                                fontSize: '1rem', 
                                fontWeight: 'bold',
                                stroke: 'white', 
                                strokeWidth: 2, 
                                fill: 'none' 
                            }}/>}
                            onClick={handleCancel}
                            sx={{
                                backgroundColor: '#727F91',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '120px', // Set fixed width
                                height: '35px', // Set fixed height
                                fontSize: '14px', // Ensure consistent font size
                            }}
                            
                        >
                            CANCEL
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon sx={{
                                fontSize: '1rem', 
                                fontWeight: 'bold',
                                stroke: 'white', 
                                strokeWidth: 2,
                                fill: 'none' 
                            }}/>}
                            onClick={checkInput}
                            sx={{
                                backgroundColor: '#177604',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '120px', // Set fixed width
                                height: '35px', // Set fixed height
                                fontSize: '14px', // Ensure consistent font size
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