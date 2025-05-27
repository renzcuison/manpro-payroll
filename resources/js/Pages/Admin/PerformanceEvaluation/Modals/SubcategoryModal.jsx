import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Box } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const SubCategoryModal = ({ open, onClose, onSave, subCategory }) => {
    const [subCategoryName, setSubCategoryName] = useState('');
    const [responseType, setResponseType] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState([]);
    const [label1, setLabel1] = useState('');
    const [label2, setLabel2] = useState('');
    const [minValue, setMinValue] = useState(1);
    const [maxValue, setMaxValue] = useState(5);

    // Synchronize state with the subCategory prop when it changes
    useEffect(() => {
        if (subCategory) {
            setSubCategoryName(subCategory.subCategoryName || '');
            setResponseType(subCategory.responseType || '');
            setDescription(subCategory.description || '');
            setOptions(subCategory.options || []);
            setLabel1(subCategory.label1 || '');
            setLabel2(subCategory.label2 || '');
            setMinValue(subCategory.minValue || 1);
            setMaxValue(subCategory.maxValue || 5);
        }
    }, [subCategory]);

    const handleSave = () => {
        onSave({
            subCategoryName,
            responseType,
            description,
            options,
            label1,
            label2,
            minValue,
            maxValue,
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth 
            sx={{
                '& .MuiPaper-root': {
                    width: '1100px', 
                    height: '430px', 
                    px: 4,
                },
            }}
        >
            <DialogTitle sx={{ paddingTop: '50px', paddingBottom:'50px' }}>
                
                {/* Add Sub-Category Title */}
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontFamily: 'Roboto, sans-serif', // Set font to Roboto
                        fontWeight: 'bold',
                    }}
                >
                    ADD SUB-CATEGORY
                </Typography>

                {/* Thin line beneath the title */}
                <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }}></Box>
            </DialogTitle>
            
            <DialogContent>
                {/* Sub-Category Name and Type */}
                <Grid container spacing={3} sx={{ mb: 3 }} >
                    <Grid item xs={6} sx={{ width: '100%' , maxWidth: '528px' }}>
                        <TextField
                            label="Sub-Category Name"
                            variant="outlined"
                            fullWidth
                            value={subCategoryName}
                            onChange={(e) => setSubCategoryName(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={6} sx={{ width: '100%', maxWidth: '235px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Response Type</InputLabel>
                            <Select
                                value={responseType}
                                onChange={(e) => setResponseType(e.target.value)}
                                label="Response Type"
                                required
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
                    </Grid>
                </Grid>

                {/* Description */}
                <Box sx={{ mb: 2, width:'100%', maxWidth: '935px' }} >
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Box>

                {/* Options for Multiple Choice or Checkbox */}
                {(responseType === 'multipleChoice' || responseType === 'checkbox') && (
                    <Box sx={{ mb: 2 }}>
                        {options.map((option, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                {/* Display option number */}
                                <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1">{index + 1}.</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <TextField
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

                        {/* Add Option Button */}
                        <Typography
                            onClick={handleAddOption}
                            sx={{
                                color: '#000000',
                                fontSize: '14px',
                                cursor: 'pointer',
                                marginTop: '8px',
                            }}
                        >
                            {options.length + 1}. Add Option
                        </Typography>
                    </Box>
                )}

                {/* Linear Scale Options (updated with Select for min and max values) */}
                {responseType === 'linearScale' && (
                    <Box sx={{ mb: 2 }}>
                        

                        {/* Min and Max Values */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={5}>
                                <FormControl fullWidth>
                                    {/* <InputLabel>Min Value</InputLabel> */}
                                    <Select
                                        value={minValue}
                                        onChange={(e) => setMinValue(e.target.value)}
                                        label="Min Value"
                                    >
                                        <MenuItem value={0}>0</MenuItem>
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={2}>2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                <Typography variant="h6">to</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <FormControl fullWidth>
                                    {/* <InputLabel>Max Value</InputLabel> */}
                                    <Select
                                        value={maxValue}
                                        onChange={(e) => setMaxValue(e.target.value)}
                                        label="Max Value"
                                    >
                                        <MenuItem value={3}>3</MenuItem>
                                        <MenuItem value={4}>4</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Labels for Min and Max Values */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={5}>
                                <TextField
                                    label="Label"
                                    variant="outlined"
                                    fullWidth
                                    value={label1}
                                    onChange={(e) => setLabel1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Label"
                                    variant="outlined"
                                    fullWidth
                                    value={label2}
                                    onChange={(e) => setLabel2(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Cancel and Save Buttons */}
                <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
                    <Button
                        onClick={onClose}
                        variant="contained"
                        sx={{
                            backgroundColor: '#727F91',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px', // Set fixed width
                            height: '35px', // Set fixed height
                            fontSize: '14px', // Ensure consistent font size
                        }}
                        startIcon={
                            <CloseIcon sx={{ 
                                fontSize: '1rem', 
                                fontWeight: 'bold',
                                stroke: 'white', 
                                strokeWidth: 2, 
                                fill: 'none' 
                            }}/>
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            backgroundColor: '#177604',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px', // Set fixed width
                            height: '35px', // Set fixed height
                            fontSize: '14px', // Ensure consistent font size
                        }}
                        startIcon={
                            <AddIcon sx={{
                                fontSize: '1rem', 
                                fontWeight: 'bold',
                                stroke: 'white', 
                                strokeWidth: 2,
                                fill: 'none' 
                            }}/>
                        }
                    >
                        Save
                    </Button>
                </Box>

            </DialogContent>
        </Dialog>
    );
};

export default SubCategoryModal;
