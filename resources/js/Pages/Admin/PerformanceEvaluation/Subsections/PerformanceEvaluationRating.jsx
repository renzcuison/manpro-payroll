import React, { useState } from 'react';
import {
    Box, TextField, Button, Grid, FormControl, FormControlLabel, InputLabel, Select,
    RadioGroup, Radio, MenuItem, Typography, IconButton, Paper
} from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';  // For the "X" icon
import { useEvaluationFormSubcategory } from '../../../../hooks/useEvaluationFormSubcategory';

const PerformanceEvaluationRating = ({ subcategory }) => {

    const {
        subcategoryId, subcategoryName, responseType, subcategoryDescription, required,
        allowOtherOption, linearScaleStart = 1, linearScaleEnd = 5, order, options,
        editSubcategory, saveOption, switchResponseType, toggleRequired, editOption, deleteOption
    } = useEvaluationFormSubcategory(subcategory);

    // For demonstration, use state for the likert scale value and labels.
    const [likertValue, setLikertValue] = useState('');
    const [label1, setLabel1] = useState('Disagree'); // Left label
    const [label2, setLabel2] = useState('Strongly Disagree'); // Right label

    const handleResponseTypeChange = (event) => {
        switchResponseType(event.target.value);
    };

    const handleLikertChange = (event) => {
        setLikertValue(event.target.value);
    };

    // Option handlers
    const handleOptionChange = (index, event) => {
        editOption(index, event.target.value);
    };

    const handleAddOption = () => {
        saveOption({ label: '' });
    };
    const handleRemoveOption = (index) => {
        deleteOption(index);
    };

    // Generate scale array based on start and end
    const scale = [];
    for (let i = linearScaleStart; i <= linearScaleEnd; i++) {
        scale.push(i);
    }

    return (
        <div>
            {/* Move Response Type Selection to the right, top corner */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <FormControl variant="outlined" sx={{ width: '200px' }}>
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
            </Box>

            {/* Likert Scale Design */}
            {responseType === 'linearScale' && (
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        maxWidth: 800,
                        margin: "auto",
                        mt: 2
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        {subcategoryName || 'Kindess Rating'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {subcategoryDescription || 'Response Type: Linear Scale'}
                    </Typography>

                    <Grid container alignItems="center" spacing={0}>
                        <Grid item xs={2} sx={{ textAlign: "left" }}>
                            <Typography variant="body2">{label1}</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <RadioGroup
                                row
                                sx={{
                                    justifyContent: "space-between",
                                    width: "100%",
                                    px: 4
                                }}
                                value={likertValue}
                                onChange={handleLikertChange}
                            >
                                {scale.map((num) => (
                                    <Box
                                        key={num}
                                        sx={{
                                            textAlign: "center",
                                            width: "56px"
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            {num}
                                        </Typography>
                                        <FormControlLabel
                                            value={num}
                                            control={<Radio sx={{
                                                color: "#aaa",
                                                "&.Mui-checked": {
                                                    color: "#1976d2"
                                                }
                                            }} />}
                                            label=""
                                            sx={{ margin: 0 }}
                                        />
                                    </Box>
                                ))}
                            </RadioGroup>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: "right" }}>
                            <Typography variant="body2">{label2}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Conditionally render input fields based on the selected response type */}
            <Box sx={{ mt: 2 }}>
                {responseType === 'multipleChoice' && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>Multiple Choice</Typography>
                        {options.map(({ label }, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        value={ label }
                                        onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton
                                        onClick={() => handleRemoveOption(index)}
                                        sx={{ color: 'gray' }}
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
                        >
                            Add Option
                        </Button>
                    </Box>
                )}

                {responseType === 'checkbox' && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>Checkbox</Typography>
                        {options.map(({ label }, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        value={label}
                                        onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton
                                        onClick={() => handleRemoveOption(index)}
                                        sx={{ color: 'gray' }}
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
                        />
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default PerformanceEvaluationRating;