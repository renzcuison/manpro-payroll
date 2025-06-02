import Layout from '../../../components/Layout/Layout';
import { Box, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig'; // Use your axiosInstance and getJWTHeader

const PerformanceEvaluationCreateEvaluation = () => {
    const navigate = useNavigate();

    // Form state to hold input values
    const [formValues, setFormValues] = useState({
        employeeName: '',
        branch: '',
        department: '',
        evaluator: '',
        primaryCommentor: '',
        secondaryCommentor: '',
        evaluationForm: '',
        periodFrom: '',
        periodTo: '',
        date: ''
    });

    // State for employees, branches, and departments
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Loading states
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    // Get headers for authenticated requests (copy logic from AnnouncementPublish)
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const { evaluator, primaryCommentor, secondaryCommentor } = formValues;
    
    // For each dropdown, filter out already-chosen people:
    const evaluatorOptions = admins.filter(
    admin => admin.id !== primaryCommentor && admin.id !== secondaryCommentor
    );
    const primaryCommentorOptions = admins.filter(
    admin => admin.id !== evaluator && admin.id !== secondaryCommentor
    );
    const secondaryCommentorOptions = admins.filter(
    admin => admin.id !== evaluator && admin.id !== primaryCommentor
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formValues);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updatedValues = { ...formValues, [name]: value };

        if (name === 'branch') {
            updatedValues.department = '';
            updatedValues.employeeName = '';
        }
        if (name === 'department') {
            updatedValues.employeeName = '';
        }

        setFormValues(updatedValues);

        console.log('handleChange:', name, value, updatedValues);
    };

    const [performanceEvaluation, setEvaluationForm] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch branches, copying from AnnouncementPublish
    const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
            // Use endpoint as in AnnouncementPublish
            const response = await axiosInstance.get('/settings/getBranches', { headers });
            if (response.data.branches) {
                setBranches(response.data.branches);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoadingBranches(false);
        }
    };

    // Fetch departments (optionally filtered by branch)
    const fetchDepartments = async (branchId) => {
        setLoadingDepartments(true);
        try {
            let params = {};
            if (branchId) params.branch_id = branchId;
            const response = await axiosInstance.get('/settings/getDepartments', { params, headers });
            if (response.data.departments) {
                setDepartments(response.data.departments);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoadingDepartments(false);
        }
    };

    // Fetch employees filtered by branch and/or department
    const fetchEmployees = async (branchId, departmentId) => {
        console.log('fetchEmployees called!', branchId, departmentId);
        try {
            const params = {};
            if (branchId) params.branch_id = branchId;
            if (departmentId) params.department_id = departmentId;
            const response = await axiosInstance.get('/getEmployeesName', { params, headers });
            console.log('Employees API response:', response);
            if (response.data.status === 200) {
                setEmployees(response.data.employees);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
        }
    };

    const fetchAdmins = async (branchId, departmentId) => {
        setLoadingAdmins(true);
        try {
            const params = {};
            if (branchId) params.branch_id = branchId;
            if (departmentId) params.department_id = departmentId;
            const response = await axiosInstance.get('/getAdmins', { params, headers });
            if (response.data.status === 200) {
                setAdmins(response.data.admins);
            } else {
                setAdmins([]);
            }
        } catch (error) {
            setAdmins([]);
            console.error('Error fetching admins:', error);
        } finally {
            setLoadingAdmins(false);
        }
    };

    // When branch changes, fetch departments and reset employee list
    useEffect(() => {
        console.log('useEffect fired:', formValues.branch, formValues.department);
        if (formValues.branch && formValues.department) {
            console.log('Calling fetchEmployees with:', formValues.branch, formValues.department);
            fetchEmployees(formValues.branch, formValues.department);
        } else {
            setEmployees([]);
            setFormValues(prev => ({ ...prev, employeeName: '' }));
        }
    }, [formValues.department, formValues.branch]);

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/getEvaluationForms', { headers })
            .then((response) => {
                setEvaluationForm(response.data.evaluationForms || []);
            })
            .catch(() => {
                setEvaluationForm([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (formValues.branch && formValues.department) {
            fetchAdmins(formValues.branch, formValues.department);
        } else {
            setAdmins([]);
        }
    }, [formValues.branch, formValues.department]);

    // When department changes, fetch employees
    useEffect(() => {
        if (formValues.branch && formValues.department) {
            fetchEmployees(formValues.branch, formValues.department);
        } else {
            setEmployees([]);
            setFormValues(prev => ({ ...prev, employeeName: '' }));
        }
    }, [formValues.department, formValues.branch]);

    // On mount, fetch branches and departments (no filter)
    useEffect(() => {
        fetchBranches();
        fetchDepartments();
    }, []);

    // Debug
    useEffect(() => {
        console.log('Branches:', branches);
    }, [branches]);
    useEffect(() => {
        console.log('Departments:', departments);
    }, [departments]);

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
                    <CloseIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>E-Employee Evaluation Form</Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Branch Dropdown */}
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Branch</InputLabel>
                                <Select
                                    label="Branch"
                                    name="branch"
                                    value={formValues.branch}
                                    onChange={handleChange}
                                >
                                    {loadingBranches ? (
                                        <MenuItem disabled>Loading branches...</MenuItem>
                                    ) : branches.length === 0 ? (
                                        <MenuItem disabled>No branches found</MenuItem>
                                    ) : (
                                        branches.map(branch => (
                                            <MenuItem key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Department Dropdown */}
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    label="Department"
                                    name="department"
                                    value={formValues.department}
                                    onChange={handleChange}
                                >
                                    {loadingDepartments ? (
                                        <MenuItem disabled>Loading departments...</MenuItem>
                                    ) : departments.length === 0 ? (
                                        <MenuItem disabled>No departments found</MenuItem>
                                    ) : (
                                        departments.map(dept => (
                                            <MenuItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Employee Dropdown */}
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Employee Name</InputLabel>
                                <Select
                                    label="Employee Name"
                                    name="employeeName"
                                    value={formValues.employeeName}
                                    onChange={handleChange}
                                >
                                    {employees.length === 0 ? (
                                        <MenuItem disabled>No employees found</MenuItem>
                                    ) : (
                                        employees.map(emp => (
                                            <MenuItem key={emp.id} value={emp.id}>
                                                {`${emp.first_name} ${emp.middle_name || ''} ${emp.last_name}`.trim()}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Second Row (Evaluator, Date) */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '625px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Evaluator</InputLabel>
                                <Select
                                    label="Evaluator"
                                    name="evaluator"
                                    value={formValues.evaluator}
                                    onChange={handleChange}
                                    >
                                    {evaluatorOptions.map(admin => (
                                        <MenuItem key={admin.id} value={admin.id}>
                                        {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                        </MenuItem>
                                    ))}
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

                    {/* Third Row (Commentors) */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '463px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Primary Evaluator</InputLabel>
                                <Select
                                    label="Primary Commentor"
                                    name="primaryCommentor"
                                    value={formValues.primaryCommentor}
                                    onChange={handleChange}
                                    >
                                    {primaryCommentorOptions.map(admin => (
                                        <MenuItem key={admin.id} value={admin.id}>
                                        {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                        </MenuItem>
                                    ))}
                                </Select>

                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '463px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Secondary Evaluator</InputLabel>
                                <Select
                                    label="Secondary Commentor"
                                    name="secondaryCommentor"
                                    value={formValues.secondaryCommentor}
                                    onChange={handleChange}
                                    >
                                    {secondaryCommentorOptions.map(admin => (
                                        <MenuItem key={admin.id} value={admin.id}>
                                        {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Fourth Row (Evaluation Form, Period From/To) */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <FormControl fullWidth variant="outlined" required>
                                <InputLabel>Evaluation Form</InputLabel>
                                <Select
                                    label="Evaluation Form"
                                    variant="outlined"
                                    name="evaluationForm"
                                    value={formValues.evaluationForm}
                                    onChange={handleChange}
                                >
                                    {isLoading ? (
                                        <MenuItem disabled>Loading forms...</MenuItem>
                                    ) : performanceEvaluation.length === 0 ? (
                                        <MenuItem disabled>No evaluation forms found</MenuItem>
                                    ) : (
                                        performanceEvaluation.map(form => (
                                            <MenuItem key={form.id} value={form.id}>
                                                {form.name}
                                            </MenuItem>
                                        ))
                                    )}
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
                            startIcon={<SaveIcon />}
                        >
                            Save Evaluation
                        </Button>
                    </Box>
                </form>
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationCreateEvaluation;