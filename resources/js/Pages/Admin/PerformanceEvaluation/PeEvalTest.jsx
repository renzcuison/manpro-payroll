import React, { useState } from 'react';
import { Box, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, FormControlLabel, Radio, RadioGroup, Checkbox } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../../../components/Layout/Layout';


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

    React.useEffect(() => {
        setSubCategoryName(subCategory?.subCategoryName || '');
        setResponseType(subCategory?.responseType || '');
        setDescription(subCategory?.description || '');
        setOptions(subCategory?.options || []);
        setLabel1(subCategory?.label1 || '');
        setLabel2(subCategory?.label2 || '');
        setMinValue(subCategory?.minValue || 1);
        setMaxValue(subCategory?.maxValue || 5);
    }, [subCategory, open]);

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
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Label 1"
                                    variant="outlined"
                                    fullWidth
                                    value={label1}
                                    onChange={(e) => setLabel1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Label 2"
                                    variant="outlined"
                                    fullWidth
                                    value={label2}
                                    onChange={(e) => setLabel2(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Min Value"
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    value={minValue}
                                    onChange={(e) => setMinValue(Number(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Max Value"
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(Number(e.target.value))}
                                />
                            </Grid>
                        </Grid>
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
const PeEvalTest = () => {
    const [openModal, setOpenModal] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    // For linear scale value selection
    const handleLinearScaleChange = (subCategoryId, value) => {
        setSubCategories(subCategories.map((subCategory) =>
            subCategory.id === subCategoryId
                ? { ...subCategory, selectedValue: value }
                : subCategory
        ));
    };

    // For multiple choice selection
    const handleMultipleChoiceChange = (subCategoryId, value) => {
        setSubCategories((prevState) =>
            prevState.map((subCategory) =>
                subCategory.id === subCategoryId
                    ? { ...subCategory, selectedValue: value }
                    : subCategory
            )
        );
    };

    // For checkbox selection
    const handleCheckboxChange = (subCategoryId, option) => {
        setSubCategories((prevState) =>
            prevState.map((subCategory) => {
                if (subCategory.id === subCategoryId) {
                    const currentSelections = subCategory.selectedValues || [];
                    let newSelections;
                    if (currentSelections.includes(option)) {
                        newSelections = currentSelections.filter((v) => v !== option);
                    } else {
                        newSelections = [...currentSelections, option];
                    }
                    return { ...subCategory, selectedValues: newSelections };
                }
                return subCategory;
            })
        );
    };

    // Open modal for adding new sub-category
    const handleOpenModal = (subCategory = null) => {
        setEditingSubCategory(subCategory);
        setOpenModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingSubCategory(null);
    };

    // Save sub-category (add or update)
    const handleSaveSubCategory = (subCategory) => {
        if (editingSubCategory) {
            setSubCategories(subCategories.map(sc => sc.id === editingSubCategory.id ? { ...sc, ...subCategory } : sc));
        } else {
            setSubCategories([...subCategories, { id: Date.now(), ...subCategory }]);
        }
        setEditingSubCategory(null);
        setOpenModal(false);
    };

    // Edit sub-category (open modal for existing)
    const handleEditSubCategory = (subCategory) => {
        setEditingSubCategory(subCategory);
        setOpenModal(true);
    };

    return (
        <Layout title="Performance Evaluation Form" position="relative">
            <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Performance Evaluation Form</Typography>

                {/* List of saved sub-categories */}
                {subCategories.map((subCategory) => (
                    <Box
                        key={subCategory.id}
                        sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2, cursor: 'pointer' }}
                        onClick={(e) => {
                            // Ensure the click is only registered when clicking on the box itself and not other elements like radio buttons or checkboxes.
                            if (e.target === e.currentTarget) {
                                handleOpenModal(subCategory); // Open modal only when the box is clicked
                            }
                        }}
                    >
                        <Typography variant="h6">{subCategory.subCategoryName}</Typography>
                        <Typography variant="body1">Response Type: {subCategory.responseType}</Typography>
                        <Typography variant="body2">Description: {subCategory.description}</Typography>

                        {/* Render Likert scale with radio buttons (Linear Scale) */}
                        {subCategory.responseType === 'linearScale' && (
                            <Box sx={{ mb: 2 }}>
                                <Grid container alignItems="center" spacing={2} justifyContent='center'>
                                    {/* Left Label */}
                                    <Grid item>
                                        <Typography variant="body1">{subCategory.label1}</Typography>
                                    </Grid>
                                    {/* Radio Buttons */}
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
                                    {/* Right Label */}
                                    <Grid item>
                                        <Typography variant="body1">{subCategory.label2}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Render Multiple Choice */}
                        {subCategory.responseType === 'multipleChoice' && (
                            <Box sx={{ mb: 2 }}>
                                <RadioGroup
                                    value={subCategory.selectedValue || ''} // Bind to the selected value for each sub-category
                                    onChange={(e) => handleMultipleChoiceChange(subCategory.id, e.target.value)} // Pass subCategory.id to handle change
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

                        {/* Render Checkbox */}
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

                        {/* Render Short Text */}
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

                        {/* Render Long Text */}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button variant="contained" color="success" onClick={() => handleOpenModal(null)}>Add Sub-Category</Button>
                </Box>
            </Box>
        </Layout>
    );
};

export default PeEvalTest;