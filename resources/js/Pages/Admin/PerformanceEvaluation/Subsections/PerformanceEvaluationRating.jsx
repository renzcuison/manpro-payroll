import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Grid, FormControl, InputLabel, Select,
    MenuItem, Typography, IconButton
} from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';
import { useEvaluationFormSubcategory } from '../../../../hooks/useEvaluationFormSubcategory';

const PerformanceEvaluationRating = ({ subcategory }) => {
    const {
        subcategoryId, subcategoryName, responseType, subcategoryDescription, required,
        allowOtherOption, linearScaleStart, linearScaleEnd, order, options,
        editSubcategory, saveOption, switchResponseType, toggleRequired
    } = useEvaluationFormSubcategory(subcategory);

    const [label1, setLabel1] = useState(subcategory.linear_scale_start_label || '');
    const [label2, setLabel2] = useState(subcategory.linear_scale_end_label || '');
    const [rating, setRating] = useState(0);

    // Only allow options for these types
    const supportsOptions = ['multiple_choice', 'checkbox'].includes(subcategory.subcategory_type);

    // Keep options and labels in sync with subcategory
    const [optionList, setOptionList] = useState(supportsOptions ? (options || []) : []);
    useEffect(() => {
        setOptionList(supportsOptions ? (subcategory.options || []) : []);
        setLabel1(subcategory.linear_scale_start_label || '');
        setLabel2(subcategory.linear_scale_end_label || '');
    }, [
        subcategory.id,
        subcategory.options,
        subcategory.linear_scale_start_label,
        subcategory.linear_scale_end_label,
        subcategory.subcategory_type
    ]);

    const handleResponseTypeChange = (event) => {
        switchResponseType(event.target.value);
    };

    const handleRatingChange = (event) => {
        setRating(Number(event.target.value));
    };

    const handleOptionChange = (index, event) => {
        if (!supportsOptions) return;
        const newOptions = [...optionList];
        newOptions[index] = { ...newOptions[index], label: event.target.value };
        setOptionList(newOptions);
    };

    const handleAddOption = () => {
        if (!supportsOptions) return;
        setOptionList([...optionList, { label: "" }]);
    };

    const handleRemoveOption = (index) => {
        if (!supportsOptions) return;
        const newOptions = optionList.filter((_, i) => i !== index);
        setOptionList(newOptions);
    };

    return (
        <div>
            {/* Response Type Selection */}
            <FormControl variant="outlined" sx={{ width: '200px', mb: 3 }}>
                <InputLabel>Response Type</InputLabel>
                <Select
                    value={responseType}
                    onChange={handleResponseTypeChange}
                    label="Response Type"
                >
                    <MenuItem value="linearScale">
                        <LinearScaleIcon sx={{ mr: 2 }} /> Linear Scale
                    </MenuItem>
                    <MenuItem value="multipleChoice">
                        <RadioButtonCheckedIcon sx={{ mr: 2 }} /> Multiple Choice
                    </MenuItem>
                    <MenuItem value="checkbox">
                        <CheckBoxIcon sx={{ mr: 2 }} /> Checkbox
                    </MenuItem>
                    <MenuItem value="shortText">
                        <ShortTextIcon sx={{ mr: 2 }} /> Short Text
                    </MenuItem>
                    <MenuItem value="longText">
                        <TextFieldsIcon sx={{ mr: 2 }} /> Long Text
                    </MenuItem>
                </Select>
            </FormControl>

            {/* Conditionally render input fields based on the selected response type */}
            <Box sx={{ mt: 2 }}>
                {responseType === 'linearScale' && (
                    <Box>
                        <Typography variant="h6">Linear Scale</Typography>
                        <Grid container spacing={2} direction="column">
                            <Grid item>
                                <TextField
                                    label="Label 1"
                                    variant="outlined"
                                    value={label1}
                                    onChange={(e) => setLabel1(e.target.value)}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Label 2"
                                    variant="outlined"
                                    value={label2}
                                    onChange={(e) => setLabel2(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                        </Grid>
                        {/* <Typography variant="body2" sx={{ mt: 1, color: '#888' }}>
                            Start Value: {linearScaleStart} &nbsp;&nbsp;
                            End Value: {linearScaleEnd}
                        </Typography> */}
                    </Box>
                )}

                {supportsOptions && responseType === 'multipleChoice' && (
                    <Box>
                        <Typography variant="h6">Multiple Choice</Typography>
                        {optionList.map((option, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2, mt: 2 }}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        value={option.label}
                                        onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton
                                        onClick={() => handleRemoveOption(index)}
                                        sx={{ color: 'gray' }}
                                        aria-label="Remove option"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleAddOption}
                            sx={{ mt: 2 }}
                        >
                            Add Option
                        </Button>
                    </Box>
                )}

                {supportsOptions && responseType === 'checkbox' && (
                    <Box>
                        <Typography variant="h6">Checkbox</Typography>
                        {optionList.map((option, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2, mt:2  }}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        value={option.label}
                                        onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton
                                        onClick={() => handleRemoveOption(index)}
                                        sx={{ color: 'gray' }}
                                        aria-label="Remove option"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleAddOption}
                            sx={{ mt: 2 }}
                        >
                            Add Option
                        </Button>
                    </Box>
                )}

                {responseType === 'shortText' && (
                    <Box>
                        <Typography variant="h6">Short Text</Typography>
                        <TextField
                            label="Your Answer"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                )}

                {responseType === 'longText' && (
                    <Box>
                        <Typography variant="h6">Long Text</Typography>
                        <TextField
                            label="Your Answer"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default PerformanceEvaluationRating;