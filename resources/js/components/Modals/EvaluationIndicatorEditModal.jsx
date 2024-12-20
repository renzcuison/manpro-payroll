import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css'; // Import styles

const EvalautionIndicatorEditModal = ({ open, close, indicator }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [descriptionError, setDescriptionError] = useState(false);
    const [indicatorError, setIndicatorError] = useState(false);
    const [typeError, setTypeError] = useState(false);

    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        if (indicator) {
            setNewName(indicator.indicator || '');
            setNewType(indicator.type || '');
            setNewDescription(indicator.description || '');
        }
    }, [indicator]);

    const checkInput = (event) => {
        event.preventDefault();

        const data = {
            id: indicator.id,
            indicator: newName,
            type: newType,
            description: newDescription,
        };

        if ( !newType ){
            setTypeError(true);
        } else {
            setTypeError(false);
        }

        if ( !newName ){
            setIndicatorError(true);
        } else {
            setIndicatorError(false);
        }

        if ( !newDescription ){
            setDescriptionError(true);
        } else {
            setDescriptionError(false);
        }

        if ( !newName || !newType || !newDescription ){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All Fields Must Be Filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            })
        } else {
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to edit this indicator?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    axiosInstance.post('/editIndicator', data, { headers })
                    .then(response => {

                        if ( response.data.status === 200 ) {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Indicator has been edited successfully!",
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

                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '80%', maxWidth: '100%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}> Edit Indicator </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'} },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}
                            }}>
                                <TextField
                                    required
                                    id="shiftName"
                                    label="Indicator Label"
                                    variant="outlined"
                                    error={indicatorError}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}
                            }}>
                                <TextField
                                    select
                                    required
                                    id="responseType"
                                    label="Response Type"
                                    error={typeError}
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                >
                                    <MenuItem value="Rating"> Rating </MenuItem>
                                    <MenuItem value="Comment"> Comment </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}
                            }}>
                                <TextField
                                    required
                                    id = "description"
                                    label = "Description"
                                    multiline
                                    minRows = {3}
                                    maxRows = {5}
                                    inputProps = {{ maxLength: 254 }}
                                    value = {newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    error = {descriptionError}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white', width: '110px' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save</p>
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

export default EvalautionIndicatorEditModal;
