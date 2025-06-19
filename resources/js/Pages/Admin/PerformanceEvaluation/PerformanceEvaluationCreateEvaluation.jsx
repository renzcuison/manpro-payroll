import Layout from '../../../components/Layout/Layout';
import { Box, TextField, Button, Grid, FormControl, Typography, IconButton, Divider, CircularProgress } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { getFullName } from '../../../utils/user-utils';

const PerformanceEvaluationCreateEvaluation = () => {
    const navigate = useNavigate();

    // Form state
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

    const [extraCommentors, setExtraCommentors] = useState([]);

    // Data states
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [performanceEvaluation, setEvaluationForm] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    // Auth
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Filtering options for Autocomplete
    const filter = createFilterOptions();

    // Filtering functions for people fields
    const { evaluator, primaryCommentor, secondaryCommentor } = formValues;
    const allCommentorIds = [
        formValues.primaryCommentor,
        formValues.secondaryCommentor,
        ...extraCommentors
    ].filter(Boolean);

    const evaluatorOptions = admins.filter(
        admin =>
            !allCommentorIds.includes(admin.id) &&
            admin.id !== formValues.employeeName
    );

    const primaryCommentorOptions = admins.filter(
        admin =>
            admin.id !== evaluator &&
            admin.id !== formValues.secondaryCommentor &&
            !extraCommentors.includes(admin.id) &&
            admin.id !== formValues.employeeName
    );

    const secondaryCommentorOptions = admins.filter(
        admin =>
            admin.id !== evaluator &&
            admin.id !== formValues.primaryCommentor &&
            !extraCommentors.includes(admin.id) &&
            admin.id !== formValues.employeeName
    );

    const getExtraCommentorOptions = (currentIdx) => {
        const excludedIds = [
            formValues.employeeName,
            formValues.evaluator,
            formValues.primaryCommentor,
            formValues.secondaryCommentor,
            ...extraCommentors.filter((id, idx) => idx !== currentIdx)
        ].filter(Boolean);
        return admins.filter(
            admin => !excludedIds.includes(admin.id)
        );
    };

    // Handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        const evaluators = formValues.evaluator ? [formValues.evaluator] : [];
        const commentors = [
            formValues.primaryCommentor,
            formValues.secondaryCommentor,
            ...extraCommentors
        ].filter(Boolean);

        const payload = {
            evaluatee_id: formValues.employeeName,
            form_id: formValues.evaluationForm,
            evaluators,
            commentors,
            period_start_at: formValues.periodFrom + ' 00:00:00',
            period_end_at: formValues.periodTo + ' 23:59:59'
        };
        try {
            await axiosInstance.post('/saveEvaluationResponse', payload, { headers });
            Swal.fire({
                icon: 'success',
                title: 'Evaluation Response Sent!',
                text: 'The evaluation response has been successfully sent.',
                confirmButtonText: 'OK',
            }).then(() => {
                navigate(-1);
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.response?.data?.message || 'Error saving evaluation response. Please try again.',
            });
            console.error('Error saving evaluation response:', error);
        }
    };

    const handleChange = (eventOrObj, _value) => {
        let name, value;
        if (eventOrObj && eventOrObj.target) {
            name = eventOrObj.target.name;
            value = eventOrObj.target.value;
        } else if (eventOrObj && typeof eventOrObj === 'object') {
            // From Autocomplete onChange
            name = eventOrObj.name;
            value = _value;
        }
        const updatedValues = { ...formValues, [name]: value };

        // Reset dependent fields if needed
        if (name === 'branch') {
            updatedValues.department = '';
            updatedValues.employeeName = '';
            updatedValues.evaluator = '';
            updatedValues.primaryCommentor = '';
            updatedValues.secondaryCommentor = '';
            setExtraCommentors([]);
        }
        if (name === 'department') {
            updatedValues.employeeName = '';
            updatedValues.evaluator = '';
            updatedValues.primaryCommentor = '';
            updatedValues.secondaryCommentor = '';
            setExtraCommentors([]);
        }
        // Remove from other fields if selected as another role
        if (name === 'evaluator') {
            if (updatedValues.primaryCommentor === value) updatedValues.primaryCommentor = '';
            if (updatedValues.secondaryCommentor === value) updatedValues.secondaryCommentor = '';
            setExtraCommentors(prev => prev.map(id => id === value ? '' : id));
        }
        if (name === 'primaryCommentor') {
            if (updatedValues.evaluator === value) updatedValues.evaluator = '';
            if (updatedValues.secondaryCommentor === value) updatedValues.secondaryCommentor = '';
            setExtraCommentors(prev => prev.map(id => id === value ? '' : id));
        }
        if (name === 'secondaryCommentor') {
            if (updatedValues.evaluator === value) updatedValues.evaluator = '';
            if (updatedValues.primaryCommentor === value) updatedValues.primaryCommentor = '';
            setExtraCommentors(prev => prev.map(id => id === value ? '' : id));
        }

        setFormValues(updatedValues);
    };

    const handleExtraCommentorChange = (idx, newId) => {
        setExtraCommentors((prev) => {
            const updated = [...prev];
            updated[idx] = newId;
            return updated;
        });
    };

    const handleAddCommentor = () => {
        setExtraCommentors((prev) => [...prev, '']);
    };

    const handleRemoveCommentor = (idx) => {
        setExtraCommentors((prev) => prev.filter((_, i) => i !== idx));
    };

    // Data fetching
    useEffect(() => {
        // Branches
        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                const response = await axiosInstance.get('/settings/getBranches', { headers });
                if (response.data.branches) setBranches(response.data.branches);
            } catch (error) {
                console.error('Error fetching branches:', error);
            } finally {
                setLoadingBranches(false);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        // Departments
        const fetchDepartments = async (branchId) => {
            setLoadingDepartments(true);
            try {
                let params = {};
                if (branchId) params.branch_id = branchId;
                const response = await axiosInstance.get('/settings/getDepartments', { params, headers });
                if (response.data.departments) setDepartments(response.data.departments);
            } catch (error) {
                console.error('Error fetching departments:', error);
            } finally {
                setLoadingDepartments(false);
            }
        };
        fetchDepartments(formValues.branch);
    }, [formValues.branch]);


    // Change the confition so that it can fetch the evaluatee regardless of user_type
    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                // Get the logged-in user's ID
                const storedUser = localStorage.getItem("nasya_user");
                const currentUser = storedUser ? JSON.parse(storedUser) : null;
                const currentUserId = currentUser?.id;

                const params = {
                    branch_id: formValues.branch,
                    department_id: formValues.department,
                    exclude: currentUserId ? [currentUserId] : undefined, // Exclude the current user
                };
                const response = await axiosInstance.get('/getEvaluatees', { params, headers });
                if (response.data.status === 200) {
                    setEmployees(response.data.evaluatees);
                } else {
                    setEmployees([]);
                }
            } catch (error) {
                setEmployees([]);
                console.error('Error fetching evaluatees:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (formValues.branch && formValues.department) {
            fetchEmployees();
        } else {
            setEmployees([]);
            setFormValues(prev => ({ ...prev, employeeName: '' }));
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

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoadingAdmins(true);
            try {
                const params = {
                    branch_id: formValues.branch,
                    department_id: formValues.department,
                };
                const response = await axiosInstance.get('/getEvaluators', { params, headers });
                if (response.data.status === 200) setAdmins(response.data.users);
                else setAdmins([]);
            } catch (error) {
                setAdmins([]);
                console.error('Error fetching evaluators:', error);
            } finally {
                setLoadingAdmins(false);
            }
        };
        if (formValues.branch && formValues.department) {
            fetchAdmins();
        } else {
            setAdmins([]);
        }
    }, [formValues.branch, formValues.department]);


    // Render
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
                    {/* First Row: Branch, Department, Employee */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <Autocomplete
                                options={branches}
                                getOptionLabel={option => option.name || ""}
                                value={branches.find(b => b.id === formValues.branch) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'branch' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => (option.name || "").toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Branch" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingBranches}
                            />
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <Autocomplete
                                options={departments}
                                getOptionLabel={option => option.name || ""}
                                value={departments.find(b => b.id === formValues.department) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'department' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => (option.name || "").toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Department" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingDepartments}
                            />
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={option => getFullName(option) || ""}
                                value={employees.find(b => b.id === formValues.employeeName) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'employeeName' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => getFullName(option).toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Employee Name" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={employees.length === 0 && formValues.department}
                            />
                        </Grid>
                    </Grid>

                    {/* Second Row: Evaluator, Date */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '625px' }}>
                            <Autocomplete
                                options={evaluatorOptions}
                                getOptionLabel={option => getFullName(option) || ""}
                                value={evaluatorOptions.find(b => b.id === formValues.evaluator) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'evaluator' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => getFullName(option).toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Evaluator" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingAdmins}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '300px' }}>
                            <TextField
                                label="Date"
                                variant="outlined"
                                fullWidth
                                value={formValues.date}
                                name="date"
                                type="date"
                                required
                                InputLabelProps={{ shrink: true }}
                                disabled
                            />
                        </Grid>
                    </Grid>

                    {/* Third Row: Evaluation Form, Period From/To */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '300px' }}>
                            <Autocomplete
                                options={performanceEvaluation}
                                getOptionLabel={option => option.name || ""}
                                value={performanceEvaluation.find(f => f.id === formValues.evaluationForm) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'evaluationForm' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => (option.name || "").toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Evaluation Form" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={isLoading}
                            />
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

                    {/* Fourth Row: Commentors */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '463px' }}>
                            <Autocomplete
                                options={primaryCommentorOptions}
                                getOptionLabel={option => getFullName(option) || ""}
                                value={primaryCommentorOptions.find(b => b.id === formValues.primaryCommentor) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'primaryCommentor' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => getFullName(option).toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Primary Commentor" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingAdmins}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '463px' }}>
                            <Autocomplete
                                options={secondaryCommentorOptions}
                                getOptionLabel={option => getFullName(option) || ""}
                                value={secondaryCommentorOptions.find(b => b.id === formValues.secondaryCommentor) || null}
                                onChange={(_, newValue) =>
                                    handleChange({ name: 'secondaryCommentor' }, newValue ? newValue.id : "")
                                }
                                filterOptions={(options, { inputValue }) =>
                                    options.filter(
                                        option => getFullName(option).toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Secondary Commentor" variant="outlined" required />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingAdmins}
                            />
                        </Grid>
                    </Grid>

                    {/* Dynamic Extra Commentors */}
                    {extraCommentors.length > 0 && (
                        <Divider sx={{ mt: 4, mb: 2 }} />
                    )}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                        {extraCommentors.map((commentor, idx) => (
                            <Grid item xs={12} md={6} key={idx} sx={{ width: '100%', maxWidth: '463px', display: 'flex', alignItems: 'center' }}>
                                <Autocomplete
                                    options={getExtraCommentorOptions(idx)}
                                    getOptionLabel={option => getFullName(option) || ""}
                                    value={getExtraCommentorOptions(idx).find(a => a.id === commentor) || null}
                                    onChange={(_, newValue) => handleExtraCommentorChange(idx, newValue ? newValue.id : "")}
                                    filterOptions={(options, { inputValue }) =>
                                        options.filter(
                                            option => getFullName(option).toLowerCase().includes(inputValue.toLowerCase())
                                        )
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label={`Additional Commentor #${idx + 1}`} variant="outlined" required />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    loading={loadingAdmins}
                                    fullWidth
                                />
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
                            Add Commentor
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
                            Sent Evaluation
                        </Button>
                    </Box>
                </form>
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationCreateEvaluation;