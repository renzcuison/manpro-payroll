import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

import SignatureCanvas from 'react-signature-canvas'

const EvaluationAcknowledgeModal = ({ open, close, formId }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [categoryName, setCategoryName] = useState('');

    const [sign,setSign] = useState()
    const [url,setUrl] = useState()

    const handleGenerate= () =>{

        console.log("Form ID: " + formId);

        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to acknowledge this?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {

                const signatureData = sign.getTrimmedCanvas().toDataURL('image/png');

                const data = { 
                    formId: formId,
                    signature: signatureData
                };

                axiosInstance.post('/saveAcknowledgement', data, { headers })
                    .then(response => {
                        console.log(response);

                        location.reload();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });
    }

    const handleClear= () =>{
        sign.clear()
        setUrl('')
    }


    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa' } }}>

                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Acknowledge Evaluation </Typography>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Box sx={{ border: '2px solid black', width: 500, height: 200 }} >
                                <SignatureCanvas canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} ref={data => setSign(data)} />
                            </Box>
                        </Box>    

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="button" variant="contained" sx={{ backgroundColor: '#177604', color: 'white', width: '110px' }} className="m-1" onClick={handleGenerate}>
                                <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Save</p>
                            </Button>

                            <Button type="button" variant="contained" sx={{ backgroundColor: '#ffa500', color: 'white', width: '110px' }} className="m-1" onClick={handleClear}>
                                <p className='m-0'><i className="fa fa-eraser mr-2 mt-1"></i> Clear</p>
                            </Button>

                            <Button type="button" variant="contained" sx={{ backgroundColor: '#636c74', color: 'white', width: '110px' }} className="m-1" onClick={close}>
                                <p className='m-0'><i className="fa fa-times mr-2 mt-1"></i> Cancel</p>
                            </Button>
                        </Box>
                    </Box>
                </div > 

            </Dialog >
        </>
    )
}

export default EvaluationAcknowledgeModal;
