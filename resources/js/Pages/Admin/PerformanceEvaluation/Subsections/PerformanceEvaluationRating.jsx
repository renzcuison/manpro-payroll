import React, { useState } from 'react';
import {
    Box, TextField, Button, Grid, FormControl, FormControlLabel, InputLabel, Select,
    MenuItem, Typography, IconButton
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
        allowOtherOption, linearScaleStart, linearScaleEnd, order, options,
        saveOption, toggleRequired
    } = useEvaluationFormSubcategory( subcategory );
    // const [responseType, setResponseType] = useState('');
    // const [options, setOptions] = useState(['']);
    // const [rating, setRating] = useState(0);
    // const [label1, setLabel1] = useState('');
    // const [label2, setLabel2] = useState('');

    // const handleResponseTypeChange = (event) => {
    //     setResponseType(event.target.value);
    // };

    // const handleRatingChange = (event) => {
    //     setRating(event.target.value);
    // };

    // const handleOptionChange = (index, event) => {
    //     const newOptions = [...options];
    //     newOptions[index] = event.target.value;
    //     setOptions(newOptions);
    // };

    // const handleAddOption = () => {
    //     setOptions([...options, '']);
    // };

    // const handleRemoveOption = (index) => {
    //     const newOptions = options.filter((_, i) => i !== index);
    //     setOptions(newOptions);
    // };

    return (
        <div>
            <h1>Performance Evaluation Rating</h1>

            {/* Response Type Selection */}
            <FormControl variant="outlined" sx={{ width: '200px', mb: 3 }}>
                <InputLabel>Response Type</InputLabel>
                <Select
                    value={responseType}
                    // onChange={handleResponseTypeChange}
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
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Label 1"
                                    variant="outlined"
                                    fullWidth
                                    // value={label1}
                                    // onChange={(e) => setLabel1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Label 2"
                                    variant="outlined"
                                    fullWidth
                                    // value={label2}
                                    // onChange={(e) => setLabel2(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        {/* <RadioGroup row value={rating} onChange={handleRatingChange}> */}
                        <RadioGroup row>
                            <FormControlLabel value={0} control={<Radio />} label="0" />
                            <FormControlLabel value={1} control={<Radio />} label="1" />
                            <FormControlLabel value={2} control={<Radio />} label="2" />
                            <FormControlLabel value={3} control={<Radio />} label="3" />
                            <FormControlLabel value={4} control={<Radio />} label="4" />
                            <FormControlLabel value={5} control={<Radio />} label="5" />
                        </RadioGroup>
                    </Box>
                )}

                {responseType === 'multipleChoice' && (
                    <Box>
                        <Typography variant="h6">Multiple Choice</Typography>
                        {options.map((option, index) => (
                            <Grid container spacing={2} key={index}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        // value={option}
                                        // onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton
                                        // onClick={() => handleRemoveOption(index)}
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
                            // onClick={handleAddOption}
                        >
                            Add Option
                        </Button>
                    </Box>
                )}

                {responseType === 'checkbox' && (
                    <Box>
                        <Typography variant="h6">Checkbox</Typography>
                        {options.map((option, index) => (
                            <Grid container spacing={2} key={index}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        // value={option}
                                        // onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton
                                        // onClick={() => handleRemoveOption(index)}
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
                            // onClick={handleAddOption}
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

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" color="success">
                    Save Evaluation
                </Button>
            </Box>
        </div>
    );
};

export default PerformanceEvaluationRating;
