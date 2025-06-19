import React, { useState } from 'react';
import { Box, Button, Typography, FormGroup, TextField, FormControl } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useUser } from "../../../../hooks/useUser";

const PerformanceEvaluationAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [formName, setFormName] = useState('');
    const [formNameError, setFormError] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();

        if (!formName) {
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
        const data = { name: formName };

        axiosInstance.post('/saveEvaluationForm', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        text: "Evaluation form saved successfully!",
                        icon: "success",
                        timer: 1000,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        // Navigate to the new page with formName in the URL
                        navigate(`/employee/performance-evaluation/form/${formName}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"Create Evaluation Form"}>
            <Box sx={{ mx: 10, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ 
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', 
                    borderRadius: '20px', 
                    minWidth: '800px', 
                    maxWidth: '1000px', 
                    marginBottom: '5%' 
                }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off">
                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}>Create Evaluation Form</Typography>

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
                                    value={formName}
                                    error={formNameError}
                                    onChange={(e) => setFormName(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

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
                </div>
            </Box>
        </Layout>
    );
}

export default PerformanceEvaluationAdd;
