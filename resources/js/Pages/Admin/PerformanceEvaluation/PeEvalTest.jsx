import React, { useState } from 'react';
import { Box, TextField, Button, Grid, FormControlLabel, Radio, RadioGroup, Checkbox, Typography } from '@mui/material';

// Preview of Performance Evaluation Form Sub-Category Rendering
const PeEvalTestPreview = ({ subCategories = [], onEdit }) => {
    // Dummy handlers and selected values for preview only
    const [previewCategories, setPreviewCategories] = useState(
        subCategories.map(sc => ({
            ...sc,
            selectedValue: sc.selectedValue || '',
            selectedValues: sc.selectedValues || [],
            userResponse: sc.userResponse || '',
        }))
    );

    // For linear scale value selection (dummy for preview)
    const handleLinearScaleChange = (subCategoryId, value) => {
        setPreviewCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, selectedValue: value }
                    : sc
            )
        );
    };

    // For multiple choice selection (dummy for preview)
    const handleMultipleChoiceChange = (subCategoryId, value) => {
        setPreviewCategories(prev =>
            prev.map(sc =>
                sc.id === subCategoryId
                    ? { ...sc, selectedValue: value }
                    : sc
            )
        );
    };

    // For checkbox selection (dummy for preview)
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
        <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Performance Evaluation Form Preview</Typography>

            {previewCategories.map((subCategory) => (
                <Box
                    key={subCategory.id}
                    sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2, cursor: 'pointer' }}
                >
                    <Typography variant="h6">{subCategory.subCategoryName}</Typography>
                    <Typography variant="body1">Response Type: {subCategory.responseType}</Typography>
                    <Typography variant="body2">Description: {subCategory.description}</Typography>

                    {subCategory.responseType === 'linearScale' && (
                        <Box sx={{ mb: 2 }}>
                            <Grid container alignItems="center" spacing={2} justifyContent='center'>
                                <Grid item>
                                    <Typography variant="body1">{subCategory.label1}</Typography>
                                </Grid>
                                <Grid item xs>
                                    <Grid container justifyContent="center" spacing={1}>
                                        {[...Array(subCategory.maxValue - subCategory.minValue + 1)].map((_, index) => {
                                            const value = subCategory.minValue + index;
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
                                    <Typography variant="body1">{subCategory.label2}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {subCategory.responseType === 'multipleChoice' && (
                        <Box sx={{ mb: 2 }}>
                            <RadioGroup
                                value={subCategory.selectedValue || ''}
                                onChange={(e) => handleMultipleChoiceChange(subCategory.id, e.target.value)}
                            >
                                {subCategory.options.map((option, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={option}
                                        control={<Radio />}
                                        label={option}
                                    />
                                ))}
                            </RadioGroup>
                        </Box>
                    )}

                    {subCategory.responseType === 'checkbox' && (
                        <Box sx={{ mb: 2 }}>
                            {subCategory.options.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            checked={Array.isArray(subCategory.selectedValues) ? subCategory.selectedValues.includes(option) : false}
                                            onChange={() => handleCheckboxChange(subCategory.id, option)}
                                        />
                                    }
                                    label={option}
                                />
                            ))}
                        </Box>
                    )}

                    {subCategory.responseType === 'shortText' && (
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

                    {subCategory.responseType === 'longText' && (
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
    );
};

export default PeEvalTestPreview;