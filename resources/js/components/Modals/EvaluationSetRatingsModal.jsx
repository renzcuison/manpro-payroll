import { Box, Button, Dialog, Typography, FormGroup, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { TableDowCell } from '@fullcalendar/core/internal';

import EvaluationAddRating from '../Modals/ModalComponents/EvaluationAddRating';
import EvaluationEditRating from '../Modals/ModalComponents/EvaluationEditRating';

const EvaluationSetRatingsModal = ({ open, close, evaluationID, ratings }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [addRating, setAddRating] = useState(false);
    const [editRating, setEditRating] = useState(false);
    
    const [ratingId, setRatingId] = useState('');
    const [rating, setRating] = useState([]);

    const openAddRating = event => {
        setAddRating(true);
    }

    const closeAddRating = event => {
        setAddRating(false);
    }

    const openEditRating = (id) => {

        const data = { ratingID: id };

        axiosInstance.get(`/getRating`, { params: data, headers })
            .then((response) => {
                setRating(response.data.rating); 
                setEditRating(true);
            }).catch((error) => {
                console.error('Error fetching rating:', error);
                setLoading(false);
            });
    }

    const closeEdiRating = event => {
        setEditRating(false);
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa' } }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>

                    {addRating ? (
                        <EvaluationAddRating close={closeAddRating} evaluationID={evaluationID} />
                    ) : editRating ? (
                        <EvaluationEditRating close={closeEdiRating} evaluationID={evaluationID} rating={rating}/>
                    ) : (
                        <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} noValidate autoComplete="off" encType="multipart/form-data" >

                            <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}> Set Ratings </Typography>

                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center"> Choice </TableCell>
                                            <TableCell align="center"> Score </TableCell>
                                            <TableCell align="center"> Description </TableCell>
                                            <TableCell align="center"> <i className="fa fa-plus" style={{ cursor: 'pointer' }} onClick={openAddRating} /> </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {ratings.map((rating) => (
                                            <TableRow key={rating.id}>
                                                <TableCell align="center"> {rating.choice} </TableCell>
                                                <TableCell align="center"> {rating.score_min} - {rating.score_max} </TableCell>
                                                <TableCell align="center"> {rating.description} </TableCell>
                                                <TableCell align="center"> <i className="fa fa-pencil-square-o" style={{ cursor: 'pointer' }} onClick={() => openEditRating(rating.id)} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    
                                </Table>
                            </TableContainer>

                            <Box display="flex" justifyContent="center" sx={{ mt: 6 }}>
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white', width: '110px' }} className="m-1" onClick={close}>
                                    <p className='m-0'> Done </p>
                                </Button>
                            </Box>
                        </Box>
                    )}

                </div>
            </Dialog >
        </>
    )
}

export default EvaluationSetRatingsModal;
