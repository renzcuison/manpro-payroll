import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, FormGroup, TextField, FormControl } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";


const PerformanceEvaluationAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Define state variables
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
                        navigate(`/admin/employees`);
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
                                    value={fromName}
                                    error={formNameError}
                                    onChange={(e) => setFromName(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="space-between" sx={{ marginTop: '20px', gap: 2 }}>
                            <Button
                                type="button"
                                variant="contained"
                                sx={{ backgroundColor: '#727F91', color: 'white'}}
                                onClick={() => navigate(-1)}
                            >
                                <p className='m-0'><i className="fa fa-times mr-2 mt-1"></i> Cancel </p>
                            </Button>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }}>
                                <p className='m-0'><i className="fa fa-check mr-2 mt-1"></i> Confirm </p>
                            </Button>
                            
                        </Box>
                    </Box>
                </div>
            </Box>
        </Layout>
    );
}

export default PerformanceEvaluationAdd;
