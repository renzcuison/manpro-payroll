import Layout from '../../../components/Layout/Layout';
import { Box, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
// Import SweetAlert2
import Swal from 'sweetalert2';

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
        date: new Date().toISOString().slice(0, 10)
    });

    // Dynamic commenters state (start with primary and secondary)
    const [extraCommentors, setExtraCommentors] = useState([]);

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
    // Additionally, filter admins to match branch and department (frontend filtering as backup)
    const filteredAdmins = admins;

    // Collect all selected commenter ids to exclude from other dropdowns
    const allCommentorIds = [
        formValues.primaryCommentor,
        formValues.secondaryCommentor,
        ...extraCommentors
    ].filter(Boolean);

    const evaluatorOptions = filteredAdmins.filter(
        admin =>
            !allCommentorIds.includes(admin.id) &&
            admin.id !== formValues.employeeName // Exclude the employee
    );

    const primaryCommentorOptions = filteredAdmins.filter(
        admin =>
            admin.id !== evaluator &&
            admin.id !== formValues.secondaryCommentor &&
            !extraCommentors.includes(admin.id) &&
            admin.id !== formValues.employeeName
    );

    const secondaryCommentorOptions = filteredAdmins.filter(
        admin =>
            admin.id !== evaluator &&
            admin.id !== formValues.primaryCommentor &&
            !extraCommentors.includes(admin.id) &&
            admin.id !== formValues.employeeName
    );

    // For each extra commenter, filter to only those not already selected in previous fields
    const getExtraCommentorOptions = (currentIdx) => {
        // Exclude: employee, evaluator, primary, secondary, all other extra commenters except self
        const excludedIds = [
            formValues.employeeName,
            formValues.evaluator,
            formValues.primaryCommentor,
            formValues.secondaryCommentor,
            ...extraCommentors.filter((id, idx) => idx !== currentIdx)
        ].filter(Boolean);
        return filteredAdmins.filter(
            admin => !excludedIds.includes(admin.id)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Map form values to backend fields
        const payload = {
            evaluatee_id: formValues.employeeName,
            evaluator_id: formValues.evaluator,
            primary_commentor_id: formValues.primaryCommentor,
            secondary_commentor_id: formValues.secondaryCommentor,
            extra_commentor_ids: extraCommentors, // <--- Pass array of additional commenters
            form_id: formValues.evaluationForm,
            period_start_at: formValues.periodFrom + ' 00:00:00',
            period_end_at: formValues.periodTo + ' 23:59:59'
        };
        try {
            const response = await axiosInstance.post('/saveEvaluationResponse', payload, { headers });
            // Show success SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Evaluation Response Saved!',
                text: 'The evaluation response has been successfully saved.',
                confirmButtonText: 'OK',
            }).then(() => {
                // Optionally navigate or reset form after confirmation
                navigate(-1);
            });
        } catch (error) {
            // Show error SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.response?.data?.message || 'Error saving evaluation response. Please try again.',
            });
            console.error('Error saving evaluation response:', error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updatedValues = { ...formValues, [name]: value };

        if (name === 'branch') {
            updatedValues.department = '';
            updatedValues.employeeName = '';
            // Optionally reset evaluator/commentors if you want to force new selection on branch change:
            updatedValues.evaluator = '';
            updatedValues.primaryCommentor = '';
            updatedValues.secondaryCommentor = '';
            setExtraCommentors([]);
        }
        if (name === 'department') {
            updatedValues.employeeName = '';
            // Optionally reset evaluator/commentors if you want to force new selection on department change:
            updatedValues.evaluator = '';
            updatedValues.primaryCommentor = '';
            updatedValues.secondaryCommentor = '';
            setExtraCommentors([]);
        }

        setFormValues(updatedValues);

        //console.log('handleChange:', name, value, updatedValues);
    };

    // For extra commenters
    const handleExtraCommentorChange = (idx, value) => {
        setExtraCommentors((prev) => {
            const updated = [...prev];
            updated[idx] = value;
            return updated;
        });
    };

    const handleAddCommentor = () => {
        setExtraCommentors((prev) => [...prev, '']);
    };

    const handleRemoveCommentor = (idx) => {
        setExtraCommentors((prev) => prev.filter((_, i) => i !== idx));
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
        //console.log('fetchEmployees called!', branchId, departmentId);
        try {
            const params = {};
            if (branchId) params.branch_id = branchId;
            if (departmentId) params.department_id = departmentId;
            const response = await axiosInstance.get('/getEmployeesName', { params, headers });
            //console.log('Employees API response:', response);
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

    // Fetch admins filtered by branch and department
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

    useEffect(() => {
        if (formValues.branch && formValues.department) {
            fetchEmployees(formValues.branch, formValues.department);
        } else {
            setEmployees([]);
            setFormValues(prev => ({ ...prev, employeeName: '' }));
        }
    }, [formValues.department, formValues.branch]);

    useEffect(() => {
        if (formValues.branch && formValues.department) {
            fetchAdmins(formValues.branch, formValues.department);
        } else {
            setAdmins([]);
        }
    }, [formValues.branch, formValues.department]);

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

    // On mount, fetch branches and departments (no filter)
    useEffect(() => {
        fetchBranches();
        fetchDepartments();
    }, []);

    // Debug
    // useEffect(() => {
    //     console.log('Branches:', branches);
    // }, [branches]);
    // useEffect(() => {
    //     console.log('Departments:', departments);
    // }, [departments]);

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
                                    {evaluatorOptions.length === 0 ? (
                                        <MenuItem disabled>No evaluators found</MenuItem>
                                    ) : (
                                        evaluatorOptions.map(admin => (
                                            <MenuItem key={admin.id} value={admin.id}>
                                            {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                            </MenuItem>
                                        ))
                                    )}
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

                    {/* Third Row (Evaluation Form, Period From/To) */}
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

                    {/* Fourth Row (Commentors) */}
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
                                    {primaryCommentorOptions.length === 0 ? (
                                        <MenuItem disabled>No commenters found</MenuItem>
                                    ) : (
                                        primaryCommentorOptions.map(admin => (
                                            <MenuItem key={admin.id} value={admin.id}>
                                            {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                            </MenuItem>
                                        ))
                                    )}
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
                                    {secondaryCommentorOptions.length === 0 ? (
                                        <MenuItem disabled>No commenters found</MenuItem>
                                    ) : (
                                        secondaryCommentorOptions.map(admin => (
                                            <MenuItem key={admin.id} value={admin.id}>
                                            {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Dynamic Extra Commenters */}
                    {extraCommentors.length > 0 && (
  <Divider sx={{ mt: 4, mb: 2 }} />
)}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        {extraCommentors.map((commentor, idx) => (
                            <Grid item xs={12} md={6} key={idx} sx={{ width: '100%', maxWidth: '463px', display: 'flex', alignItems: 'center' }}>
                                <FormControl fullWidth variant="outlined" required>
                                    <InputLabel>{`Additional Commenter #${idx + 1}`}</InputLabel>
                                    <Select
                                        label={`Additional Commenter #${idx + 1}`}
                                        value={commentor}
                                        onChange={e => handleExtraCommentorChange(idx, e.target.value)}
                                    >
                                        {getExtraCommentorOptions(idx).length === 0 ? (
                                            <MenuItem disabled>No commenters found</MenuItem>
                                        ) : (
                                            getExtraCommentorOptions(idx).map(admin => (
                                                <MenuItem key={admin.id} value={admin.id}>
                                                    {`${admin.first_name} ${admin.middle_name || ''} ${admin.last_name}`.trim()}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                                <IconButton
                                    aria-label="remove"
                                    onClick={() => handleRemoveCommentor(idx)}
                                    sx={{ ml: 1, mt: 1 }}
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddCommentor}
                        >
                            Add Commenter
                        </Button>
                    </Box>
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