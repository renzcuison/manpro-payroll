import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css'; // Import styles

const EvaluationCategoryAddModal = ({ open, close, evaluationID }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [nameError, setNameError] = useState(false);
    const [categoryName, setCategoryName] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        console.log("Category Name: " + categoryName);

        const data = { evaluationID: evaluationID, categoryName: categoryName };

        if ( !categoryName ) {
            setNameError(true);
        } else {
            setNameError(false);
        }

        if ( !categoryName ){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Category Name is Required!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            })
        } else {
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this category?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    axiosInstance.post('/saveCategory', data, { headers })
                    .then(response => {
                        if ( response.data.status === 409 ) {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Category already exists!",
                                icon: "error",
                                showConfirmButton: true,
                                confirmButtonText: 'Proceed',
                                confirmButtonColor: '#177604',
                            })
                        }

                        if ( response.data.status === 200 ) {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Category has been added successfully!",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: true,
                                confirmButtonText: 'Proceed',
                                confirmButtonColor: '#177604',
                            }).then(function (response) {
                                location.reload();
                            });
                        }

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }
            });
        }
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa' } }}>

                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Add Category </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'} },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="categoryName"
                                    label="Category Name"
                                    variant="outlined"
                                    error={nameError}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white', width: '110px' }} className="m-1">
                                <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Save</p>
                            </Button>

                            <Button variant="contained" sx={{ backgroundColor: '#636c74', color: 'white', width: '110px' }} className="m-1" onClick={close}>
                                <p className='m-0'><i className="fa fa-times mr-2 mt-1"></i> Cancel</p>
                            </Button>
                        </Box>
                    </Box>
                </div > 

            </Dialog >
        </>
    )
}

export default EvaluationCategoryAddModal;
