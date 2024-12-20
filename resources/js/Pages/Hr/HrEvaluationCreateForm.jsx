import React, {  useState, useEffect } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    FormGroup,
    InputLabel,
    TextField,
    Select,
    MenuItem,
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
    Slider,
    Radio,
    RadioGroup,
    FormLabel,
    FormControl,
    FormControlGroup,
    FormControlLabel, 
    Divider
} from '@mui/material';

import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import moment from 'moment';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HrEvaluationCreateForm = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loading, setLoading] = useState(true);

    const [employeeError, setEmployeeError] = useState(false);
    const [departmentError, setDepartmentError] = useState(false);
    const [evalautorError, setEvaluatorError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [formError, setFormError] = useState(false);
    const [periodFormError, setPeriodFromError] = useState(false);
    const [periodToError, setPeriodToError] = useState(false);
    
    const [department, setDepartment] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedEvaluator, setSelectedEvaluator] = useState('');
    
    const [employees, setEmployees] = useState([]);
    const [creator, setCreator] = useState(''); 
    const [evaluation, setEvaluation] = useState(''); 
    const [evaluations, setEvaluations] = useState([]);
    const [evaluationID, setEvaluationID] = useState('');
    const [categories, setCategories] = useState([]);
    const [ratings, setRatings] = useState([]);

    const [date, setDate] = useState('');
    const [periodFrom, setPeriodFrom] = useState('');
    const [periodTo, setPeriodTo] = useState('');

    useEffect(() => {
        axiosInstance.get(`/getEmployees`, {headers})
            .then((response) => {
                setEmployees(response.data.employees);
            }).catch((error) => {
                console.error('Error fetching employees:', error);
            });

        axiosInstance.get(`/getEvaluations`, {headers})    
            .then((response) => {
                setEvaluations(response.data.evaluations);
            }).catch((error) => {
                console.error('Error fetching evaluations:', error);
            });
    }, []);

    const handleEvaluationForm = (formID) => {
        setEvaluationID(formID);

        const data = { evaluation: formID };

        axiosInstance.get(`/getEvaluation`, { params: data, headers })
            .then((response) => {
                setEvaluation(response.data.evaluation);
                setCreator(response.data.creator);
            }).catch((error) => {
                console.error('Error fetching evaluation:', error);
            });

        axiosInstance.get(`/getCategories`, { params: data, headers })
            .then((response) => {
                setCategories(response.data.categories);
                if ( response.data.status === 200 ) {
                    setLoading(false);
                }
            }).catch((error) => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });

        axiosInstance.get(`/getRatings`, { params: data, headers })
            .then((response) => {
                setRatings(response.data.ratings); 
            }).catch((error) => {
                console.error('Error fetching rating:', error);
                setLoading(false);
            });
    };

    const handleEmployee = (empID) => {
        const selectedEmployee = employees.find(employee => employee.user_id === empID);

        if (selectedEmployee) {
            setSelectedEmployee(empID);
            setDepartment(selectedEmployee.department ? selectedEmployee.department : '-');
        } else {
            setSelectedEmployee('-');
            setDepartment('-');
        }
    };

    const handleEvaluator = (empID) => {
        setSelectedEvaluator(empID);
    }

    const checkInput = (event) => {
        event.preventDefault();

        if (!selectedEmployee) {
            setEmployeeError(true);
            setDepartmentError(true);
        } else {
            setEmployeeError(false);
            setDepartmentError(false);
        }

        if (!selectedEvaluator) {
            setEvaluatorError(true);
        } else {
            setEvaluatorError(false);
        }

        if (!date) {
            setDateError(true);
        } else {
            setDateError(false);
        }

        if (!periodFrom) {
            setPeriodFromError(true);
        } else {
            setPeriodFromError(false);
        }

        if (!periodTo) {
            setPeriodToError(true);
        } else {
            setPeriodToError(false);
        }

        if (!evaluationID) {
            setFormError(true);
        } else {
            setFormError(false);
        }
        
        if (!selectedEmployee || !selectedEvaluator || !date || !periodFrom || !periodTo || !evaluationID) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
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
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            evaluation: evaluationID,
            employee: selectedEmployee,
            evaluator: selectedEvaluator,
            department: department,
            date: date,
            periodFrom: periodFrom,
            periodTo: periodTo,
        };

        axiosInstance.post('/saveEvaluationForm', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Evaluation form saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/hr/performance-evaluation-review/${response.data.formId}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"EvaluateCreateForm"}>
            <Box sx={{ mx: 12, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > E-Employee Evaluation Form </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    required
                                    id="employeeName"
                                    label="Employee Name"
                                    error={employeeError}
                                    value={selectedEmployee}
                                    onChange={(event) => handleEmployee(event.target.value)}
                                >
                                    {employees.map((employee) => (
                                        <MenuItem key={employee.user_id} value={employee.user_id}> {employee.fname} {employee.mname} {employee.lname} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="department"
                                    label="Department"
                                    variant="outlined"
                                    value={department}
                                    error={employeeError}
                                    InputProps={{ readOnly: true }}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    required
                                    id="evaluator"
                                    label="Evaluator"
                                    error={evalautorError}
                                    value={selectedEvaluator}
                                    onChange={(event) => handleEvaluator(event.target.value)}
                                >
                                    {employees.map((employee) => (
                                        <MenuItem key={employee.user_id} value={employee.user_id}> {employee.fname} {employee.mname} {employee.lname} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date"
                                        onChange={(newValue) => setDate(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: dateError }
                                        }}
                                    />
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
                                <TextField
                                    select
                                    required
                                    id="evaluationForm"
                                    label="Evaluation Form"
                                    error={formError}
                                    value={evaluationID}
                                    onChange={(event) => handleEvaluationForm(event.target.value)}
                                >
                                    {evaluations.map((evaluation) => (
                                        <MenuItem key={evaluation.id} value={evaluation.id}> {evaluation.name} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Period From" dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Period From"
                                        onChange={(newValue) => setPeriodFrom(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: periodFormError }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Period To" dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Period To"
                                        onChange={(newValue) => setPeriodTo(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: periodToError }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Form </p>
                            </Button>
                        </Box>
                    </Box>
                </div > 

                { evaluationID ? (
                    loading ? (
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
                                    Date Created: ${moment(evaluation.created_at).format('MMMM D, YYYY - h:mm A')}`}
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
                                    <Accordion sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', mb: 2, borderRadius: '20px 20px 0 0' }} key={category.id}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${category.id}-content`} id={`panel${category.id}-header`} sx={{ backgroundColor: '#e9ae20', borderRadius: '10px 10px 0 0' }} >
                                            <Typography sx={{ ml: 2 }} variant="h6"> {category.name} ({category.indicators.length}) </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', p: 2 }} >
                                            {category.indicators.map(indicator => (
                                                <Card key={indicator.id} sx={{ minWidth: 275, backgroundColor: '#f8f9fa', m: 2, mb: 4 }} >
                                                    <CardContent>
                                                        <Typography id={`indicator-${indicator.id}`} sx={{ mx: 2, fontWeight: 'bold' }} variant="h6"> {indicator.indicator} </Typography>
                                                        <Typography id={`description-${indicator.id}`} sx={{ mx: 2 }}> {indicator.description} </Typography>

                                                        <Divider sx={{ mx: 2 }} />

                                                        {indicator.type === 'Comment' && (
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, width: '100%' }}>
                                                                <TextField id="standard-basic" label="Answer" variant="standard" sx={{ width: '95%' }} />
                                                           </Box>
                                                        )}

                                                        {indicator.type === 'Rating' && (
                                                            <Box sx={{ display: 'flex', justifyContent: 'left', mt: 2, width: '100%' }}>
                                                                {/* <Slider aria-label="Rating" defaultValue={0} valueLabelDisplay="auto" step={1} marks min={0} max={10} sx={{ width: '93%' }} /> */}

                                                                <FormControl sx={{ ml: 2 }}>
                                                                    {/* <FormLabel id="demo-radio-buttons-group-label">Description</FormLabel> */}
                                                                    <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group" >

                                                                        {ratings.map((rating) => (
                                                                            <FormControlLabel key={rating.id} value={rating.id} control={<Radio />} label={rating.description} />
                                                                        ))}

                                                                        {/* <FormControlLabel value="female" control={<Radio />} label="Female" /> */}
                                                                        {/* <FormControlLabel value="male" control={<Radio />} label="Male" /> */}
                                                                        {/* <FormControlLabel value="other" control={<Radio />} label="Other" /> */}
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
                        </div > 
                    )
                ) : (
                    <Box></Box>
                )}

            </Box>
        </Layout >
    )
}

export default HrEvaluationCreateForm
