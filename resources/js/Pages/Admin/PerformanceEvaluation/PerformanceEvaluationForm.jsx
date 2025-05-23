import React, { useState } from 'react';
import { Box, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, FormControlLabel, Radio, RadioGroup, Checkbox } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';

// Modal Component to Add/Edit Sub-Category
const SubCategoryModal = ({ open, onClose, onSave, subCategory }) => {
    const [subCategoryName, setSubCategoryName] = useState(subCategory?.subCategoryName || '');
    const [responseType, setResponseType] = useState(subCategory?.responseType || '');
    const [description, setDescription] = useState(subCategory?.description || '');
    const [options, setOptions] = useState(subCategory?.options || []);
    const [label1, setLabel1] = useState(subCategory?.label1 || '');
    const [label2, setLabel2] = useState(subCategory?.label2 || '');
    const [minValue, setMinValue] = useState(subCategory?.minValue || 1);
    const [maxValue, setMaxValue] = useState(subCategory?.maxValue || 5);

    const handleSave = () => {
        onSave({
            subCategoryName,
            responseType,
            description,
            options,
            label1,
            label2,
            minValue,
            maxValue
        });
        onClose();
    };

    const handleOptionChange = (index, event) => {
        const newOptions = [...options];
        newOptions[index] = event.target.value;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const isTextResponseType = responseType === 'shortText' || responseType === 'longText';

    return (
        open && (
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '8px', maxWidth: '500px', mx: 'auto' }}>
                <Typography variant="h6">Add/Edit Sub-Category</Typography>
                <TextField
                    label="Sub-Category Name"
                    variant="outlined"
                    fullWidth
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Response Type</InputLabel>
                    <Select
                        value={responseType}
                        onChange={(e) => setResponseType(e.target.value)}
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

                {responseType === 'linearScale' && (
                    <Box sx={{ mb: 2 }}>
                        {/* ... your linear scale setup here */}
                    </Box>
                )}

                {(responseType === 'multipleChoice' || responseType === 'checkbox') && (
                    <Box sx={{ mb: 2 }}>
                        {options.map((option, index) => (
                            <Grid container spacing={2} key={index}>
                                <Grid item xs={10}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        variant="outlined"
                                        fullWidth
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
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

                {isTextResponseType ? (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            label="Description"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={responseType === 'shortText' ? 2 : 4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Box>
                ) : null}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" color="success" sx={{ ml: 2 }} onClick={handleSave}>Save</Button>
                </Box>
            </Box>
        )
    );
};

// Main Performance Evaluation Form Component
const PerformanceEvaluationForm = () => {
    const [openModal, setOpenModal] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleSaveSubCategory = (subCategory) => {
        if (editingSubCategory) {
            setSubCategories(subCategories.map(sc => sc.id === editingSubCategory.id ? { ...sc, ...subCategory } : sc));
        } else {
            setSubCategories([...subCategories, { id: Date.now(), ...subCategory }]);
        }
        setEditingSubCategory(null);
    };

    const handleEditSubCategory = (subCategory) => {
        setEditingSubCategory(subCategory);
        setOpenModal(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>Sample Form</Typography>
            <Box sx={{ mb: 3 }}>
                <Button variant="contained" color="success" onClick={handleOpenModal}>Add Sub-Category</Button>
            </Box>

            {/* List of saved sub-categories */}
            {subCategories.map((subCategory) => (
                <Box key={subCategory.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6">{subCategory.subCategoryName}</Typography>
                    <Typography variant="body1">Response Type: {subCategory.responseType}</Typography>
                    <Typography variant="body2">Description: {subCategory.description}</Typography>

                    {/* Render Likert scale with radio buttons (Linear Scale) */}
                    {subCategory.responseType === 'linearScale' && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {subCategory.label1}
                            </Typography>
                            <Grid container spacing={2} justifyContent="center">
                                {[...Array(subCategory.maxValue - subCategory.minValue + 1)].map((_, index) => {
                                    const value = subCategory.minValue + index;
                                    return (
                                        <Grid item key={value}>
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={subCategory.selectedValue === value.toString()}
                                                        value={value.toString()}
                                                    />
                                                }
                                                label={value}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {subCategory.label2}
                            </Typography>
                        </Box>
                    )}

                    {/* Render Multiple Choice */}
                    {subCategory.responseType === 'multipleChoice' && (
                        <Box sx={{ mb: 2 }}>
                            <RadioGroup>
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

                    {/* Render Checkbox */}
                    {subCategory.responseType === 'checkbox' && (
                        <Box sx={{ mb: 2 }}>
                            {subCategory.options.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={<Checkbox />}
                                    label={option}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Render Short Text */}
                    {subCategory.responseType === 'shortText' && (
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                label="Short Text"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={2}
                                value={subCategory.description}
                                disabled
                            />
                        </Box>
                    )}

                    {/* Render Long Text */}
                    {subCategory.responseType === 'longText' && (
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                label="Long Text"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={subCategory.description}
                                disabled
                            />
                        </Box>
                    )}

                    {/* Button to edit a sub-category */}
                    <Button onClick={() => handleEditSubCategory(subCategory)} sx={{ mt: 2 }}>Edit</Button>
                </Box>
            ))}

            {/* Modal for adding/editing sub-category */}
            <SubCategoryModal
                open={openModal}
                onClose={handleCloseModal}
                onSave={handleSaveSubCategory}
                subCategory={editingSubCategory || {}}
            />
        </Box>
    );
};



export default PerformanceEvaluationForm;
