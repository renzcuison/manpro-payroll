import React, {  useState } from 'react'
import { Box, Button, Typography, FormGroup, FormControl, InputLabel } from '@mui/material';
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import Swal from "sweetalert2";

const HrEvaluationAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [formName, setFormName] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        const data = { formName: formName };

        if ( !formName ){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Form Name is Required!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            })
        } else {
            new Swal({
                customClass: { container: "my-swal" },
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
                    axiosInstance.post('/saveEvaluation', data, { headers })
                    .then(response => {
                        var evaluationID = response.data.evaluationID;

                        if ( response.data.status === 409 ) {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Evaluation already exists!",
                                icon: "error",
                                showConfirmButton: true,
                                confirmButtonText: 'Proceed',
                                confirmButtonColor: '#177604',
                            })
                        }

                        if ( response.data.status === 200 ) {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Evaluation has been added successfully!",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: true,
                                confirmButtonText: 'Proceed',
                                confirmButtonColor: '#177604',
                            }).then(function (response) {
                                navigate('/hr/performance-evaluation-edit/' + evaluationID);
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
        <Layout title={"EvaluationAdd"}>
            <Box sx={{ mx: 12, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Add Evaluation Form </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'} },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel id="formNameLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Evaluation Form Name</InputLabel>
                                <input id="formName" type="text" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setFormName(e.target.value)} />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Save</p>
                            </Button>
                        </Box>
                    </Box>
                </div > 
            </Box>
        </Layout >
    )
}

export default HrEvaluationAdd
