import React, { useState } from 'react';
import { Box, Typography, Button, Grid, FormControl, FormControlLabel, Radio, RadioGroup, Checkbox, TextField } from '@mui/material';
import SubCategoryModal from './Modals/SubcategoryModal';  
import Layout from '../../../components/Layout/Layout';  

const PerformanceEvaluationForm = () => {
    const [openModal, setOpenModal] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [editingSubCategory, setEditingSubCategory] = useState(null);

    const handleOpenModal = (subCategory) => {
        setEditingSubCategory(subCategory);  // Set the sub-category that is being edited
        setOpenModal(true);  // Open the modal
    };

    const handleCloseModal = () => {
        setOpenModal(false);  // Close the modal
    };

    const handleLinearScaleChange = (subCategoryId, value) => {
        setSubCategories(subCategories.map((subCategory) =>
            subCategory.id === subCategoryId
                ? { ...subCategory, selectedValue: value }
                : subCategory
        ));
    };

    const handleSaveSubCategory = (updatedSubCategory) => {
        if (editingSubCategory) {
            // Update the sub-category in the list
            setSubCategories(subCategories.map(sc => 
                sc.id === editingSubCategory.id ? { ...sc, ...updatedSubCategory } : sc
            ));
        } else {
            // Add new sub-category
            setSubCategories([...subCategories, { id: Date.now(), ...updatedSubCategory }]);
        }
        setEditingSubCategory(null);  // Reset the editing sub-category
        setOpenModal(false);  // Close the modal
    };

    const handleMultipleChoiceChange = (subCategoryId, value) => {
        setSubCategories((prevState) => 
            prevState.map((subCategory) => 
                subCategory.id === subCategoryId
                    ? { ...subCategory, selectedValue: value }  // Update the selectedValue for the matched sub-category
                    : subCategory
            )
        );
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
                                                            labelPlacement="top" // Place the value above the radio button
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
                                        control={<Checkbox />}
                                        label={option}
                                    />
                                ))}
                            </Box>
                        )}

                        {/* Render Short Text and Long Text */}
                        {subCategory.responseType === 'shortText' || subCategory.responseType === 'longText' ? (
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Your Response"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={subCategory.userResponse || ''}
                                    onChange={(e) => {
                                        // Handle user response here
                                    }}
                                />
                            </Box>
                        ) : null}

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

export default PerformanceEvaluationForm;
