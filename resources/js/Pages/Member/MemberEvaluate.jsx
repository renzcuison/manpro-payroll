import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    Divider
} from '@mui/material';

import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import Swal from "sweetalert2";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EvaluationAcknowledgeModal from '../../components/Modals/EvaluationAcknowledgeModal';
import { forEach } from 'lodash';

const MemberEvaluate = () => {
    const { id } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [evaluationAcknowledgementModalOpen, setEvaluationAcknowledgementModalOpen] = useState(false)
    const [highlightedIndicators, setHighlightedIndicators] = useState([]);

    const [loading, setLoading] = useState(true)
    const [creator, setCreator] = useState(''); 
    const [evaluation, setEvaluation] = useState(''); 
    const [categoryID, setCategoryID] = useState(''); 
    const [form, setForm] = useState('');
    const [userRole, setUserRole] = useState(''); 
    const [categories, setCategories] = useState([]); 
    const [ratings, setRatings] = useState([]);
    const [status, setStatus] = useState('');
    const [signature, setSignature] = useState('');

    const [responses, setResponses] = useState({});

    useEffect(() => {
        if (id) {   
            const data = { formID: id };

            axiosInstance.get(`/getEvaluationForm`, { params: data, headers })
                .then((response) => {

                    if ( response.data.evaluationForm.employee_id === user.user_id){
                        setUserRole('employee');
                    } else if ( response.data.evaluationForm.evaluator_id === user.user_id ) {
                        setUserRole('evaluator');
                    }

                    setStatus(response.data.evaluationForm.status);
                    setSignature(response.data.evaluationForm.signature);
                    getEvaluation(response.data.evaluationForm.evaluation_id);

                    setForm(response.data.evaluationForm);
                    getResponses(response.data.evaluationForm.id, response.data.evaluationForm.status);

                }).catch((error) => {
                    console.error('Error fetching evaluation:', error);
                    setLoading(false);
                });
        }
    }, []);

    const getEvaluation = (evaluationId) => {
        const data = { evaluation: evaluationId };
        axiosInstance.get(`/getEvaluation`, { params: data, headers })
            .then((response) => {
                setEvaluation(response.data.evaluation);
                setCreator(response.data.creator);
                setLoading(false);
            }).catch((error) => {
                console.error('Error fetching evaluation:', error);
                setLoading(false);
            });

        axiosInstance.get(`/getCategories`, { params: data, headers })
            .then((response) => {
                setCategories(response.data.categories);
                initializeResponses(response.data.categories);
                setLoading(false);
            }).catch((error) => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });

        axiosInstance.get(`/getRatings`, { params: data, headers })
            .then((response) => {
                setRatings(response.data.ratings);
            }).catch((error) => {
                console.error('Error fetching ratings:', error);
            });
    };

    const getResponses = (formId, status) => {
        const data = { formId };
    
        if (status !== 'Pending') {
            setCategories([]);
            setLoading(true);
    
            axiosInstance.get(`/getCategoryResponse`, { params: data, headers })
                .then((response) => {
                    setCategories(response.data.categories);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching responses:', error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    };

    // Initialize responses based on categories and indicators
    const initializeResponses = (categories) => {
        const initialResponses = {};
        categories.forEach(category => {
            category.indicators.forEach(indicator => {
                initialResponses[indicator.id] = indicator.type === 'Rating' ? "" : "";
            });
        });
        setResponses(initialResponses);
    };    

    const handleInputChange = (id, value) => {
        setResponses(prevResponses => ({ ...prevResponses, [id]: value }));
    };

    const checkInput = async (event) => {
        event.preventDefault();

        console.log("Check Input Responses");
        console.log(responses);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = { form_id: id, responses: responses };
        
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to submit this evaluation?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {

                setHighlightedIndicators([]);

                axiosInstance.post('/saveEvaluationResponse', data, { headers })
                .then(response => {
                    if ( response.data.status === 200 ) {
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Evaluation submuitted successfully!",
                            icon: "success",
                            timer: 3000,
                            showConfirmButton: true,
                            confirmButtonText: 'Proceed',
                            confirmButtonColor: '#177604',
                        }).then(function (response) {
                            navigate('/member/evaluate/');
                        });
                    } else if ( response.data.status === 400 ) {

                        const nullIndicatorIds = response.data.nullIndicators.map(indicator => indicator.id);
                        setHighlightedIndicators(nullIndicatorIds);

                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Please Fill All Indicators!",
                            icon: "error",
                            showConfirmButton: true,
                            confirmButtonText: 'Proceed',
                            confirmButtonColor: '#177604',
                        })

                    }
                }).catch(error => {
                    console.error('Error:', error);
                });
            }
        });
    };

    const openAcknowledgeModal = () => {
        setEvaluationAcknowledgementModalOpen(true)
    };

    const closeAcknowledgeModal = () => {
        setEvaluationAcknowledgementModalOpen(false)
    }

    return (
        <Layout title={"Evaluate"}>
            <Box sx={{ mx: 12, py: 12, mb: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
                    {loading && !evaluation ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ m: 6 }} >
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }} > {evaluation.name} </Typography>
                                <Typography sx={{ fontSize: '12px', whiteSpace: 'pre-line' }} >
                                    {`Created By: ${creator.fname} ${creator.mname} ${creator.lname}
                                    Date Created: ${moment(evaluation.created_at).format('MMMM D, YYYY - h:mm A')}
                                    Status: ${status}`}
                                </Typography>
                            </Box>

                            <Box sx={{ m: 6 }} >
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead sx={{ backgroundColor: '#e9ae20' }}>
                                            <TableRow>
                                                <TableCell align="center"> Choice </TableCell>
                                                <TableCell align="center"> Score </TableCell>
                                                <TableCell align="center"> Description </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {ratings.map((rating) => (
                                                <TableRow key={rating.id}>
                                                    <TableCell align="center"> {rating.choice} </TableCell>
                                                    <TableCell align="center"> {rating.score_min} - {rating.score_max} </TableCell>
                                                    <TableCell align="center"> {rating.description} </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            <Box sx={{ m: 6 }}>
                            
                                <form onSubmit={handleSubmit}>
                                {/* <form onSubmit={checkInput}> */}

                                    {status == "Pending" ? (
                                        <>
                                            {categories.map((category) => (
                                                <Accordion sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', mb: 2, borderRadius: '20px 20px 0 0' }} key={category.id} >
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${category.id}-content`} id={`panel${category.id}-header`} sx={{ backgroundColor: '#e9ae20', borderRadius: '10px 10px 0 0' }} >
                                                        <Typography sx={{ ml: 2 }} variant="h6"> {category.name} ({category.indicators.length}) </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', p: 2 }} >
                                                        {category.indicators.map(indicator => (
                                                            <Card
                                                                key={indicator.id}
                                                                id={`question-${indicator.id}`}
                                                                sx={{
                                                                    minWidth: 275,
                                                                    backgroundColor: '#f8f9fa',
                                                                    m: 2,
                                                                    mb: 4,
                                                                    border: highlightedIndicators.includes(indicator.id) ? '2px solid red' : 'none'
                                                                }}
                                                            >
                                                                <CardContent>
                                                                    <Typography id={`indicator-${indicator.id}`} sx={{ mx: 2, fontWeight: 'bold' }} variant="h6"> {indicator.indicator} </Typography>
                                                                    <Typography id={`description-${indicator.id}`} sx={{ mx: 2 }}> {indicator.description} </Typography>

                                                                    {indicator.type === 'Comment' && (
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, width: '100%' }}>
                                                                            <TextField id={`comment-${indicator.id}`} variant="standard" sx={{ width: '95%' }} multiline minRows={4} maxRows={8} value={responses[indicator.id] || ''} onChange={(e) => handleInputChange(indicator.id, e.target.value)} inputProps={{ maxLength: 512 }} disabled={status !== 'Pending'} />
                                                                        </Box>
                                                                    )}

                                                                    {indicator.type === 'Rating' && (
                                                                        <>
                                                                            <Divider sx={{ mx: 2 }} />

                                                                            <Box sx={{ display: 'flex', justifyContent: 'left', mt: 2, width: '100%' }}>
                                                                                <FormControl sx={{ ml: 2 }}>
                                                                                    {/* <FormLabel id="demo-radio-buttons-group-label">Description</FormLabel> */}
                                                                                    <RadioGroup aria-labelledby="demo-radio-buttons-group-label" name="radio-buttons-group" onChange={(e, newValue) => handleInputChange(indicator.id, newValue)}>
                                                                                        {ratings.map((rating) => (
                                                                                            <FormControlLabel key={rating.id} value={rating.id} control={<Radio />} label={rating.description} />
                                                                                        ))}
                                                                                    </RadioGroup>
                                                                                </FormControl>
                                                                            </Box>
                                                                        </>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {categories.map((category) => (
                                                <Accordion key={category.id} sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', mb: 2, borderRadius: '20px 20px 0 0' }} >
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${category.id}-content`} id={`panel${category.id}-header`} sx={{ backgroundColor: '#e9ae20', borderRadius: '10px 10px 0 0' }} >
                                                        <Typography sx={{ ml: 2 }} variant="h6"> {category.name} ({category.indicators.length}) </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', p: 2 }} >
                                                        {category.indicators.map((indicator) => (
                                                            <Card
                                                                key={indicator.id}
                                                                id={`result-${indicator.id}`}
                                                                sx={{ minWidth: 275, backgroundColor: '#f8f9fa', m: 2, mb: 4 }}
                                                            >
                                                                <CardContent>
                                                                    <Typography id={`indicator-${indicator.id}`} sx={{ mx: 2, fontWeight: 'bold' }} variant="h6"> {indicator.indicator} </Typography>
                                                                    <Typography id={`description-${indicator.id}`} sx={{ mx: 2 }}> {indicator.description} </Typography>
                                                                    
                                                                    {indicator.type === 'Comment' && (
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, width: '100%' }}> 
                                                                            <TextField id={`comment-field-${indicator.id}`} variant="standard" sx={{ width: '95%' }} value={indicator.response?.comment || ''}  InputProps={{ readOnly: true }} />
                                                                        </Box>
                                                                    )}

                                                                    {indicator.type === 'Rating' && (
                                                                        <>
                                                                            <Divider sx={{ mx: 2 }} />
                                                                            <Box sx={{ display: 'flex', justifyContent: 'left', mt: 2, width: '100%' }}>
                                                                                <FormControl sx={{ ml: 2 }}>
                                                                                    {/* <FormLabel id="demo-radio-buttons-group-label">Description</FormLabel> */}
                                                                                    <RadioGroup aria-labelledby="demo-radio-buttons-group-label" name="radio-buttons-group">
                                                                                        {ratings.map((rating) => (
                                                                                            <FormControlLabel
                                                                                                key={rating.id}
                                                                                                value={rating.id}
                                                                                                label={rating.description}
                                                                                                control={
                                                                                                    <Radio checked={indicator.response?.rating === rating.id}/>
                                                                                                }
                                                                                            />
                                                                                        ))}
                                                                                    </RadioGroup>
                                                                                </FormControl>
                                                                            </Box>
                                                                        </>
                                                                    )}
                                                                        
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))}
                                        </>
                                    )}

                                    {userRole === 'evaluator' && (
                                        <Box display="flex" justifyContent="center" sx={{ mt: 9 }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                sx={{ backgroundColor: '#177604', color: 'white', cursor: status === 'Pending' ? 'pointer' : 'not-allowed' }}
                                                className="m-1"
                                                disabled={status !== 'Pending'}
                                            >
                                                    <i className="fa fa-floppy-o mr-2 mt-1"></i> Save Evaluation
                                            </Button>
                                        </Box>
                                    )}

                                    {userRole === 'employee' && (
                                        <>
                                            {status === 'Reviewed' && (
                                                <Box display="flex" justifyContent="center" sx={{ mt: 9 }}>
                                                <Button
                                                    type="button"
                                                    variant="contained"
                                                    sx={{ backgroundColor: '#177604', color: 'white', cursor: 'pointer', opacity: 1 }}
                                                    className="m-1"
                                                    disabled={status !== 'Reviewed'}
                                                    onClick={openAcknowledgeModal}
                                                >
                                                    <i className="fa fa-floppy-o mr-2 mt-1"></i> Acknowledge
                                                </Button>
                                                </Box>
                                            )}

                                            {status === 'Acknowledged' && (
                                                <Box display="flex" justifyContent="center" sx={{ mt: 9 }}>
                                                    <Box sx={{ border: '2px solid black', width: 500, height: 200 }}>
                                                        <img src={`${location.origin}/storage/${signature}`} alt="Signature" />
                                                    </Box>
                                                </Box>    
                                            )}
                                        </>
                                    )}

                                </form>
                            </Box>
                        </>
                    )} 
                </div > 
            </Box>

            <EvaluationAcknowledgeModal open={evaluationAcknowledgementModalOpen} close={closeAcknowledgeModal} formId={form.id} />
        </Layout >
    )
}

export default MemberEvaluate
