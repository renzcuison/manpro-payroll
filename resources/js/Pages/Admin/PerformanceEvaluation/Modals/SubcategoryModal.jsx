import React, { useState } from 'react';
import { Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Modal } from '@mui/material';

const SubCategoryModal = ({ open, onClose, onSave }) => {
    const [subCategoryName, setSubCategoryName] = useState('');
    const [responseType, setResponseType] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        onSave({
            subCategoryName,
            responseType,
            description
        });
        onClose(); // Close the modal after saving
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'white',
                p: 3,
                borderRadius: 2,
                maxWidth: 600,
                width: '100%',
                boxShadow: 24,
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Add Sub-Category</Typography>

                <TextField
                    label="Sub-Category Name"
                    fullWidth
                    variant="outlined"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Response Type</InputLabel>
                    <Select
                        value={responseType}
                        onChange={(e) => setResponseType(e.target.value)}
                        label="Response Type"
                    >
                        <MenuItem value="checkbox">Checkbox</MenuItem>
                        <MenuItem value="dropdown">Dropdown</MenuItem>
                        <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
                        <MenuItem value="linearScale">Linear Scale</MenuItem>
                        <MenuItem value="shortText">Short Text</MenuItem>
                        <MenuItem value="longText">Long Text</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Description"
                    fullWidth
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onClose} sx={{ mr: 2 }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default SubCategoryModal;