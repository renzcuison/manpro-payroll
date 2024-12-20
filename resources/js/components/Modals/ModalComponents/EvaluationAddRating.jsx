import { Box, Button, Dialog, Typography, FormGroup, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { TableDowCell } from '@fullcalendar/core/internal';

const EvaluationAddRating = ({ close, evaluationID }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    
    const [choiceName, setChoiceName] = useState('');
    const [scoreMin, setScoreMin] = useState('');
    const [scoreMax, setScoreMax] = useState('');
    const [description, setDescription] = useState('');

    const submitAddRating = event => {
        event.preventDefault();

        console.log("Submit Add Rating");

        const data = {
            evaluationID: evaluationID,
            choiceName: choiceName,
            scoreMin: scoreMin,
            scoreMax: scoreMax,
            description: description,
        };

        if ( !choiceName || !scoreMin || !scoreMax || !description ) {
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
                text: "You want to save this rating?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    ('/saveRating', data, { headers })
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

    const handleScoreMinChange = (e) => {
        const value = e.target.value;
        if (/^[0-9]?$/.test(value)) {
            setScoreMin(value);
        }
    };

    const handleScoreMaxChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,2}$/.test(value)) {
            setScoreMax(value);
        }
    };

    return (
        <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={submitAddRating} autoComplete="off" encType="multipart/form-data" >

            <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}> Add Rating </Typography>

            {/* 50 - 22 -22 */}

            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                '& label.Mui-focused': {color: '#97a5ba'},
                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
            }}>
                <FormControl sx={{ marginBottom: 3, width: '62%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                }}>
                    <InputLabel id="shiftNameLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Choice Name</InputLabel>
                    <input id="choiceName" type="text" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setChoiceName(e.target.value)} maxLength={64}/>
                </FormControl>

                <FormControl sx={{ marginBottom: 3, width: '16%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                }}>
                    <InputLabel id="shiftNameLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Minimum Score</InputLabel>
                    <input id="scoreMin" type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={scoreMin} onChange={handleScoreMinChange} maxLength={1} />
                </FormControl>

                <FormControl sx={{ marginBottom: 3, width: '16%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                }}>
                    <InputLabel id="shiftNameLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Maximum Score</InputLabel>
                    <input id="scoreMax" type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={scoreMax} onChange={handleScoreMaxChange} maxLength={2} />
                </FormControl>
            </FormGroup>

            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                '& label.Mui-focused': {color: '#97a5ba'},
                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
            }}>
                <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                }}>
                    <InputLabel id="shiftNameLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Description</InputLabel>
                    <input id="description" type="text" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setDescription(e.target.value)} maxLength={128} />
                </FormControl>

            </FormGroup>

            <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="center">
                    <Button type='submit' variant="contained" sx={{ backgroundColor: '#177604', color: 'white', width: '110px' }} className="m-1">
                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save</p>
                    </Button>

                    <Button variant="contained" sx={{ backgroundColor: '#636c74', color: 'white', width: '110px' }} className="m-1" onClick={close}>
                        <p className='m-0'><i className="fa fa-times mr-2 mt-1"></i> Cancel</p>
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default EvaluationAddRating;
