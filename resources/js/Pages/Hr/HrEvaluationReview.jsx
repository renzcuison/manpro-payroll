import React, {  useState, useEffect } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    FormGroup,
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
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import moment from 'moment';
import Swal from "sweetalert2";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HrEvaluationReview = () => {
    const { id } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loading, setLoading] = useState(true);

    // Evaluation Information
    const [employee, setEmployee] = useState('');
    const [evaluator, setEvaluator] = useState('');
    const [department, setDepartment] = useState('');
    const [formName, setFormName] = useState('');
    const [date, setDate] = useState('');
    const [periodFrom, setPeriodFrom] = useState('');
    const [periodTo, setPeriodTo] = useState('');

    // Evaluation Form Information
    const [evaluation, setEvaluation] = useState([]); 

    // Evaluation Form Ratings
    const [ratings, setRatings] = useState([]);

    // Evaluation Form Categories
    const [categories, setCategories] = useState([]);
    
    const [creator, setCreator] = useState(''); 
    const [status, setStatus] = useState('');
    const [formId, setFormId] = useState('');
    
    useEffect(() => {
        if (id) {
            const data = { formID: id };
            
            axiosInstance.get(`/getEvaluationForm`, { params: data, headers })
                .then((response) => {

                    // For Evaluation Information
                    setEmployee(`${response.data.employee.fname} ${response.data.employee.mname} ${response.data.employee.lname}`);
                    setEvaluator(`${response.data.evaluator.fname} ${response.data.evaluator.mname} ${response.data.evaluator.lname}`);
                    setDepartment(response.data.employee.category);
                    setFormName(response.data.evaluation.name);
                    setDate(response.data.evaluationForm.date);
                    setPeriodFrom(response.data.evaluationForm.period_from);
                    setPeriodTo(response.data.evaluationForm.period_to);

                    // For Form Information
                    setEvaluation(response.data.evaluation);

                    // Evaluation Form Status
                    setStatus(response.data.evaluationForm.status);
                    setFormId(response.data.evaluationForm.id);

                    // Call Function to get Evaluation Details
                    getEvaluation(response.data.evaluationForm.evaluation_id);

                    // Call Function to get Evaluation Responses
                    getResponses(response.data.evaluationForm.id, response.data.evaluationForm.status);

                }).catch((error) => {
                    console.error('Error fetching evaluation:', error);
                });

            setLoading(false);
        }
    }, []);

    const getEvaluation = (evaluationId) => {
        const data = { evaluation: evaluationId };

        axiosInstance.get(`/getRatings`, { params: data, headers })
            .then((response) => {
                setRatings(response.data.ratings);
            }).catch((error) => {
                console.error('Error fetching ratings:', error);
            });

        axiosInstance.get(`/getEvaluation`, { params: data, headers })
            .then((response) => {
                setCreator(response.data.creator);
            }).catch((error) => {
                console.error('Error fetching evaluation:', error);
            });

        axiosInstance.get(`/getCategories`, { params: data, headers })
            .then((response) => {
                setCategories(response.data.categories);
            }).catch((error) => {
                console.error('Error fetching categories:', error);
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
    

    const confirmEvaluation = () => {

        const data = { formId: formId };

        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to approve this evaluation?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance.post('/approveEvaluation', data, { headers })
                .then(response => {
                    if ( response.data.status === 200 ) {
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Evaluation approved successfully!",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true,
                            confirmButtonText: 'Proceed',
                            confirmButtonColor: '#177604',
                        }).then(function (response) {
                            navigate('/hr/performance-evaluation/');
                        });
                    }
                }).catch(error => {
                    console.error('Error:', error);
                });
            }
        });

    };

    return (
        <Layout title={"EvaluationReview"}>
            <Box sx={{ m: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} noValidate autoComplete="off" encType="multipart/form-data" >
                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > E-Employee Evaluation Form </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'} },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField id="employee" label="Employee Name" variant="outlined" value={employee} InputProps={{ readOnly: true }}/>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField id="department" label="Department" variant="outlined" value={department} InputProps={{ readOnly: true }}/>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'} },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField id="evaluator" label="Evaluator Name" variant="outlined" value={evaluator} InputProps={{ readOnly: true }}/>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Date" dateAdapter={AdapterDayjs}>
                                    <TextField id="date" label="Date" variant="outlined" value={date} InputProps={{ readOnly: true }}/>
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'} },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField id="evaluationForm" label="Evaluation Form" variant="outlined" value={formName}  InputProps={{ readOnly: true }}/>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Period From" dateAdapter={AdapterDayjs}>
                                    <TextField id="periodFrom" label="Period From" variant="outlined" value={periodFrom} InputProps={{ readOnly: true }}/>
                                </LocalizationProvider>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Period To" dateAdapter={AdapterDayjs}>
                                    <TextField id="periodTo" label="Period To" variant="outlined" value={periodTo} InputProps={{ readOnly: true }}/>
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>
                    </Box>
                </div > 

                { loading ? (
                    <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
                        <Box sx={{ m: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <CircularProgress />
                        </Box>
                    </div > 
                ) : (
                    <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
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
                            {categories.map((category) => (
                                <Accordion key={category.id} sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', mb: 2, borderRadius: '20px 20px 0 0' }} >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${category.id}-content`} id={`panel${category.id}-header`} sx={{ backgroundColor: '#e9ae20', borderRadius: '10px 10px 0 0' }} >
                                        <Typography sx={{ ml: 2 }} variant="h6"> {category.name} ({category.indicators.length}) </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', p: 2 }} >
                                        {category.indicators.map((indicator) => (
                                            <Card key={indicator.id} sx={{ minWidth: 275, backgroundColor: '#f8f9fa', m: 2, mb: 4 }} >
                                                <CardContent>
                                                    <Typography id={`indicator-${indicator.id}`} sx={{ mx: 2, fontWeight: 'bold' }} variant="h6"> {indicator.indicator} </Typography>
                                                    <Typography id={`description-${indicator.id}`} sx={{ mx: 2 }}> {indicator.description} </Typography>

                                                    <Divider sx={{ mx: 2 }} />

                                                    {indicator.type === 'Comment' && (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, width: '100%' }}>
                                                            <TextField id={`comment-field-${indicator.id}`} label="Answer" variant="standard" sx={{ width: '95%' }} value={indicator.response?.comment || ''}  InputProps={{ readOnly: true }} />
                                                        </Box>
                                                    )}

                                                    {indicator.type === 'Rating' && (
                                                        <Box sx={{ display: 'flex', justifyContent: 'left', mt: 2, width: '100%' }}>
                                                            <FormControl sx={{ ml: 2 }}>
                                                                {/* <FormLabel id="demo-radio-buttons-group-label">Description</FormLabel> */}
                                                                <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group">
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
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>

                        <Box display="flex" justifyContent="center" sx={{ my: 9 }}>
                            {(status === 'Evaluated' || status === 'Reviewed') && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ backgroundColor: '#177604', color: 'white', cursor: status === 'Reviewed' ? 'not-allowed' : 'pointer', opacity: status === 'Reviewed' ? 0.5 : 1 }}
                                    className="m-1"
                                    onClick={confirmEvaluation}
                                    disabled={status === 'Reviewed'}
                                >
                                    <i className="fa fa-floppy-o mr-2 mt-1"></i> Approve Evaluation
                                </Button>
                            )}
                        </Box>
                    </div>
                )}
            </Box>
        </Layout >
    )
}

export default HrEvaluationReview
