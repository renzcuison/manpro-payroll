import { useEffect, useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, CircularProgress, Grid, FormControlLabel, Radio, RadioGroup, Checkbox, TextField } from '@mui/material';
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

const PerformanceEvaluationPreview = ({ onEdit }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const user = JSON.parse(storedUser || '{}');
    const headers = getJWTHeader(user);

    // Dropdown menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Forms and preview state
    const [performanceEvaluations, setPerformanceEvaluations] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [previewCategories, setPreviewCategories] = useState([]);
    const [loadingForms, setLoadingForms] = useState(true);
    const [loadingFormDetails, setLoadingFormDetails] = useState(false);

    // Fetch forms for dropdown
    useEffect(() => {
        setLoadingForms(true);
        axiosInstance.get('/getEvaluationForms', { headers })
            .then(res => {
                if (res.data.status === 200 && Array.isArray(res.data.evaluationForms)) {
                    setPerformanceEvaluations(res.data.evaluationForms);
                }
            })
            .finally(() => setLoadingForms(false));
    }, []);

    // Fetch form details and flatten subcategories
    const fetchAndPreviewForm = async (form) => {
        setLoadingFormDetails(true);
        setSelectedForm(form);
        setPreviewCategories([]);
        try {
            const res = await axiosInstance.get('/getEvaluationForm', { headers, params: { id: form.id } });
            if (res.data.status === 200 && res.data.evaluationForm) {
                const flat = flattenSubcategories(res.data.evaluationForm).map(sc => ({
                    ...sc,
                    selectedValue: '',
                    selectedValues: [],
                    userResponse: '',
                }));
                setPreviewCategories(flat);
            }
        } catch (e) {
            setPreviewCategories([]);
        } finally {
            setLoadingFormDetails(false);
        }
    };

    // Dummy handlers for preview controls
    const handleLinearScaleChange = (subCategoryId, value) => {
        setPreviewCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, selectedValue: value }
                    : sc
            )
        );
    };
    const handleMultipleChoiceChange = (subCategoryId, value) => {
        setPreviewCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, selectedValue: value }
                    : sc
            )
        );
    };
    const handleCheckboxChange = (subCategoryId, option) => {
        setPreviewCategories(prev =>
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

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', minHeight: 600 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
                Performance Evaluation Form Preview
            </Typography>
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                {/* Dropdown Menu for Forms */}
                <Button
                    variant="contained"
                    color="success"
                    id="perf-eval-preview-menu"
                    aria-controls={openMenu ? 'perf-eval-preview-menu-list' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    {selectedForm ? selectedForm.name : 'Select Form'}
                    <i className="fa fa-caret-down ml-2" />
                </Button>
                <Menu
                    id="perf-eval-preview-menu-list"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={{
                        'aria-labelledby': 'perf-eval-preview-menu',
                    }}
                >
                    {loadingForms && <MenuItem disabled>Loading forms...</MenuItem>}
                    {!loadingForms && performanceEvaluations.length === 0 && (
                        <MenuItem disabled>No forms available</MenuItem>
                    )}
                    {!loadingForms && performanceEvaluations.map((form) => (
                        <MenuItem
                            key={form.id}
                            onClick={() => {
                                setAnchorEl(null);
                                fetchAndPreviewForm(form);
                            }}
                        >
                            {form.name}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Preview Area */}
            {loadingFormDetails && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loadingFormDetails && selectedForm && (
                <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                        {selectedForm.name}
                    </Typography>
                    {previewCategories.length === 0 && (
                        <Typography>No subcategories available for this form.</Typography>
                    )}
                    {previewCategories.map((subCategory) => (
                        <Box
                            key={subCategory.id}
                            sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2, cursor: 'pointer' }}
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
                                        onChange={() => {}}
                                        disabled
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
                                        onChange={() => {}}
                                        disabled
                                    />
                                </Box>
                            )}

                            {onEdit && (
                                <Button onClick={() => onEdit(subCategory)} sx={{ mt: 2 }}>Edit</Button>
                            )}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default PerformanceEvaluationPreview;