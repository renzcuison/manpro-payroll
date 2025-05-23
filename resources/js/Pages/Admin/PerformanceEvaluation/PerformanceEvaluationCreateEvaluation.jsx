import Layout from '../../../components/Layout/Layout';  // Import your Layout component
import { Box, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save'; 
import CloseIcon from '@mui/icons-material/Close'; 

const PerformanceEvaluationCreateEvaluation = () => {
    const navigate = useNavigate();

    // You can add form state and functionality here
    const [formValues, setFormValues] = useState({
        employeeName: '',
        branch: '',
        department: '',
        evaluator: '',
        primaryCommentor: '',
        secondaryCommentor: '',
        evaluationForm: '',
        periodFrom: '',
        periodTo: ''
    });

    const handleChange = (event) => {
        setFormValues({ ...formValues, [event.target.name]: event.target.value });
    };

    const handleSubmit = () => {
        // Handle the form submission here
        console.log(formValues);
    };

    return (
        <Layout title={"Create Evaluation Form"}> 
            <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative' }}>
            <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        position: 'absolute',
                        top: 25,
                        right: 30,
                        border: '1px solid #BEBEBE',
                        borderRadius: '50%',
                        padding: '5px',
                        color: '#BEBEBE',
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.2rem' }} /> {/* Adjust the size here */}
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>E-Employee Evaluation Form</Typography>
               
                <form onSubmit={handleSubmit}>
                    {/* First Row */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Employee Name</InputLabel>
                                    <Select
                                        label="Employee Name"
                                        variant="outlined"
                                        name="employeeName"
                                        value={formValues.employeeName}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Branch1">Employee 1</MenuItem>
                                        <MenuItem value="Branch2">Employee 2</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }} >
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Branch</InputLabel>
                                <Select
                                    label="Branch"
                                    name="branch"
                                    value={formValues.branch}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Branch1">Branch 1</MenuItem>
                                    <MenuItem value="Branch2">Branch 2</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Department</InputLabel>
                                    <Select
                                        label="Department"
                                        variant="outlined"
                                        name="department"
                                        value={formValues.department}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Branch1">CS Cluster</MenuItem>
                                        <MenuItem value="Branch2">IS Cluster</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                    </Grid>

                    {/* Second Row */}
                    <Grid container spacing={3} sx={{ mt: 3 }} >
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '625px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Evaluator</InputLabel>
                                    <Select
                                        label="Evaluator"
                                        variant="outlined"
                                        name="evaluator"
                                        value={formValues.evaluator}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Branch1">Evaluator 1</MenuItem>
                                        <MenuItem value="Branch2">Evaluator 2</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '300px' }}>
                            <TextField
                                label="Date"
                                variant="outlined"
                                fullWidth
                                value={formValues.date}
                                onChange={handleChange}
                                name="date"
                                type="date"
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* Third Row */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '463px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Primary Commentor</InputLabel>
                                    <Select
                                        label="Primary Commentor"
                                        variant="outlined"
                                        name="primaryCommentor"
                                        value={formValues.primaryCommentor}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Branch1">Primary Commentor 1</MenuItem>
                                        <MenuItem value="Branch2">Primary Commentor 2</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '463px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Secondary Commentor</InputLabel>
                                    <Select
                                        label="Secondary Commentor"
                                        variant="outlined"
                                        name="secondaryCommentor"
                                        value={formValues.secondaryCommentor}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Branch1">Secondary Commentor 1</MenuItem>
                                        <MenuItem value="Branch2">Secondary Commentor 2</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                    </Grid>

                    {/* Fourth Row */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel >Evaluation Form</InputLabel>
                                    <Select
                                        label="Evaluation Form"
                                        variant="outlined"
                                        name="evaluationForm"
                                        value={formValues.evaluationForm}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Branch1">Evaluation Form 1</MenuItem>
                                        <MenuItem value="Branch2">Evaluation Form 2</MenuItem>
                                    </Select>
                                </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <TextField
                                label="Period From"
                                variant="outlined"
                                fullWidth
                                value={formValues.periodFrom}
                                onChange={handleChange}
                                name="periodFrom"
                                type="date"
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <TextField
                                label="Period To"
                                variant="outlined"
                                fullWidth
                                value={formValues.periodTo}
                                onChange={handleChange}
                                name="periodTo"
                                type="date"
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* Submit Button */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            sx={{ padding: '10px 20px' }}
                            startIcon={<SaveIcon />} // Add the Save icon here
                        >
                            Save Evaluation
                        </Button>
                    </Box>
                </form>
            </Box>
        </Layout> 
    );
}

export default PerformanceEvaluationCreateEvaluation;
