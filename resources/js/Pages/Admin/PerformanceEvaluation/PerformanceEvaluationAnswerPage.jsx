import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Divider, Grid, FormControlLabel, Radio, RadioGroup, Checkbox, TextField } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';

const flattenSubcategories = (form) => {
    if (!form || !form.sections) return [];
    let subcategories = [];
    form.sections.forEach(section => {
        if (section.subcategories && Array.isArray(section.subcategories)) {
            section.subcategories.forEach(sub => {
                subcategories.push({
                    ...sub,
                    sectionName: section.name,
                });
            });
        }
    });
    return subcategories;
};

const PerformanceEvaluationAnswerPage = () => {
    const { id } = useParams(); // <-- this is evaluation_responses.id
    const storedUser = localStorage.getItem("nasya_user");
    const user = JSON.parse(storedUser || '{}');
    const headers = getJWTHeader(user);

    const [responseMeta, setResponseMeta] = useState(null); // the evaluation_responses row
    const [form, setForm] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get the evaluation response (to get form_id and evaluatee/evaluator info)
                const resResponse = await axiosInstance.get('/getEvaluationResponse', { headers, params: { id } });
                if (resResponse.data.status === 200 && resResponse.data.evaluationResponse) {
                    setResponseMeta(resResponse.data.evaluationResponse);

                    // 2. Get the form structure from form_id
                    const formId = resResponse.data.evaluationResponse.evaluationForm
                        ? resResponse.data.evaluationResponse.evaluationForm.id
                        : resResponse.data.evaluationResponse.form_id;
                    if (formId) {
                        const resForm = await axiosInstance.get('/getEvaluationForm', { headers, params: { id: formId } });
                        if (resForm.data.status === 200 && resForm.data.evaluationForm) {
                            setForm(resForm.data.evaluationForm);
                            const flat = flattenSubcategories(resForm.data.evaluationForm).map(sc => ({
                                ...sc,
                                selectedValue: '',
                                selectedValues: [],
                                userResponse: '',
                            }));
                            setCategories(flat);
                        } else {
                            setForm(null);
                            setCategories([]);
                        }
                    } else {
                        setForm(null);
                        setCategories([]);
                    }
                } else {
                    setResponseMeta(null);
                    setForm(null);
                    setCategories([]);
                }
            } catch (e) {
                setResponseMeta(null);
                setForm(null);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    // Input handlers (same as before)
    const handleLinearScaleChange = (subCategoryId, value) => {
        setCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, selectedValue: value }
                    : sc
            )
        );
    };
    const handleMultipleChoiceChange = (subCategoryId, value) => {
        setCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, selectedValue: value }
                    : sc
            )
        );
    };
    const handleCheckboxChange = (subCategoryId, option) => {
        setCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? {
                        ...sc,
                        selectedValues: Array.isArray(sc.selectedValues)
                            ? sc.selectedValues.includes(option)
                                ? sc.selectedValues.filter(v => v !== option)
                                : [...sc.selectedValues, option]
                            : [option]
                    }
                    : sc
            )
        );
    };
    const handleShortAnswerChange = (subCategoryId, value) => {
        setCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, userResponse: value }
                    : sc
            )
        );
    };
    const handleLongAnswerChange = (subCategoryId, value) => {
        setCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, userResponse: value }
                    : sc
            )
        );
    };


const handleSubmit = async () => {
    setSubmitting(true);
    let hasError = false;
    let errorMsg = '';

    // Loop through each answer and call the appropriate endpoint
    for (const sc of categories) {
        try {
            if (sc.subcategory_type === 'linear_scale') {
                // Save as percentage answer
                if (!sc.selectedValue) continue;
                const percentage = (
                    (parseInt(sc.selectedValue, 10) - sc.linear_scale_start) /
                    (sc.linear_scale_end - sc.linear_scale_start)
                );
                await axiosInstance.post('/saveEvaluationPercentageAnswer', {
                    response_id: responseMeta.id,
                    subcategory_id: sc.id,
                    percentage,
                }, { headers });
            } else if (sc.subcategory_type === 'multiple_choice') {
                // Save as option answer (only one option_id, must find id by label)
                if (!sc.selectedValue) continue;
                const selectedOption = (sc.options || []).find(opt => opt.label === sc.selectedValue);
                if (selectedOption) {
                    await axiosInstance.post('/saveEvaluationOptionAnswer', {
                        response_id: responseMeta.id,
                        option_id: selectedOption.id,
                    }, { headers });
                }
            } else if (sc.subcategory_type === 'checkbox') {
                // Save each checked option as its own option answer
                if (!Array.isArray(sc.selectedValues)) continue;
                for (const value of sc.selectedValues) {
                    const selectedOption = (sc.options || []).find(opt => opt.label === value);
                    if (selectedOption) {
                        await axiosInstance.post('/saveEvaluationOptionAnswer', {
                            response_id: responseMeta.id,
                            option_id: selectedOption.id,
                        }, { headers });
                    }
                }
            } else if (sc.subcategory_type === 'short_answer' || sc.subcategory_type === 'long_answer') {
                // Save as text answer
                if (!sc.userResponse) continue;
                await axiosInstance.post('/saveEvaluationTextAnswer', {
                    response_id: responseMeta.id,
                    subcategory_id: sc.id,
                    answer: sc.userResponse,
                }, { headers });
            }
        } catch (e) {
            hasError = true;
            errorMsg = e?.response?.data?.message || 'Failed to submit some answers.';
            break;
        }
    }

    setSubmitting(false);

    if (hasError) {
        alert(errorMsg);
    } else {
        alert('Evaluation submitted!');
    }
};

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    if (!form || !responseMeta) {
        return <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" color="error">Evaluation Form or Response Not Found</Typography>
        </Box>;
    }

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', minHeight: 600 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Performance Evaluation Answer Form
            </Typography>

            {/* Show info about the response/evaluatee/evaluator */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Evaluatee: {responseMeta.evaluatee_last_name}, {responseMeta.evaluatee_first_name} {responseMeta.evaluatee_middle_name || ""}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Evaluator: {responseMeta.evaluator_last_name}, {responseMeta.evaluator_first_name} {responseMeta.evaluator_middle_name || ""}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                {form.name}
            </Typography>

            <Box component="form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {categories.length === 0 && (
                    <Typography>No subcategories available for this form.</Typography>
                )}
                {categories.map((subCategory) => (
                    <Box
                        key={subCategory.id}
                        sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2 }}
                    >
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Section: {subCategory.sectionName}
                        </Typography>
                        <Typography variant="h6">{subCategory.name}</Typography>
                        <Typography variant="body1">Response Type: {subCategory.subcategory_type}</Typography>
                        <Typography variant="body2">Description: {subCategory.description}</Typography>

                        {subCategory.subcategory_type === 'linear_scale' && (
                            <Box sx={{ mb: 2 }}>
                                <Grid container alignItems="center" spacing={2} justifyContent='center'>
                                    <Grid item>
                                        <Typography variant="body1">{subCategory.linear_scale_start_label}</Typography>
                                    </Grid>
                                    <Grid item xs>
                                        <Grid container justifyContent="center" spacing={1}>
                                            {[...Array(subCategory.linear_scale_end - subCategory.linear_scale_start + 1)].map((_, index) => {
                                                const value = subCategory.linear_scale_start + index;
                                                return (
                                                    <Grid item key={value}>
                                                        <FormControlLabel
                                                            control={
                                                                <Radio
                                                                    checked={subCategory.selectedValue === value.toString()}
                                                                    onChange={() => handleLinearScaleChange(subCategory.id, value.toString())}
                                                                    value={value.toString()}
                                                                />
                                                            }
                                                            label={value}
                                                            labelPlacement="top"
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1">{subCategory.linear_scale_end_label}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {subCategory.subcategory_type === 'multiple_choice' && (
                            <Box sx={{ mb: 2 }}>
                                <RadioGroup
                                    value={subCategory.selectedValue || ''}
                                    onChange={(e) => handleMultipleChoiceChange(subCategory.id, e.target.value)}
                                >
                                    {Array.isArray(subCategory.options) && subCategory.options.map((option, index) => (
                                        <FormControlLabel
                                            key={option.id || index}
                                            value={option.label}
                                            control={<Radio />}
                                            label={option.label}
                                        />
                                    ))}
                                </RadioGroup>
                            </Box>
                        )}

                        {subCategory.subcategory_type === 'checkbox' && (
                            <Box sx={{ mb: 2 }}>
                                {Array.isArray(subCategory.options) && subCategory.options.map((option, index) => (
                                    <FormControlLabel
                                        key={option.id || index}
                                        control={
                                            <Checkbox
                                                checked={Array.isArray(subCategory.selectedValues) ? subCategory.selectedValues.includes(option.label) : false}
                                                onChange={() => handleCheckboxChange(subCategory.id, option.label)}
                                            />
                                        }
                                        label={option.label}
                                    />
                                ))}
                            </Box>
                        )}

                        {subCategory.subcategory_type === 'short_answer' && (
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Short Text"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={subCategory.userResponse || ''}
                                    onChange={(e) => handleShortAnswerChange(subCategory.id, e.target.value)}
                                />
                            </Box>
                        )}

                        {subCategory.subcategory_type === 'long_answer' && (
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Long Text"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={subCategory.userResponse || ''}
                                    onChange={(e) => handleLongAnswerChange(subCategory.id, e.target.value)}
                                />
                            </Box>
                        )}
                    </Box>
                ))}
                <Divider sx={{ my: 3 }} />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting || !form}
                    sx={{ mt: 2 }}
                >
                    {submitting ? "Submitting..." : "Submit Evaluation"}
                </Button>
            </Box>
        </Box>
    );
};

export default PerformanceEvaluationAnswerPage;