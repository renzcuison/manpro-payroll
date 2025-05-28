import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Box } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const PerformanceEvaludationAddSubcategory = ({ open, onClose, onSave, subcategory }) => {
    const [subcategoryName, setSubcategoryName] = useState('');
    const [responseType, setResponseType] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState([]);
    const [linearScaleStartLabel, setLinearScaleStartLabel] = useState('Not at all');
    const [linearScaleEndLabel, setLinearScaleEndLabel] = useState('Extremely');
    const [linearScaleStart, setLinearScaleStart] = useState(1);
    const [linearScaleEnd, setLinearScaleEnd] = useState(5);

    // Synchronize state with the subcategory prop when it changes
    // useEffect(() => {
    //     if (subcategory) {
    //         setSubcategoryName(subcategory.subcategoryName || '');
    //         setResponseType(subcategory.responseType || '');
    //         setDescription(subcategory.description || '');
    //         setOptions(subcategory.options || []);
    //         setLinearScaleStartLabel(subcategory.linearScaleStartLabel || '');
    //         setLinearScaleEndLabel(subcategory.linearScaleEndLabel || '');
    //         setLinearScaleStart(subcategory.linearScaleStart || 1);
    //         setLinearScaleEnd(subcategory.linearScaleEnd || 5);
    //     }
    // }, [subcategory]);



    // note: this does not save options enlisted in modal to db as of yet




    const handleSave = () => {
        onSave({
            name: subcategoryName,
            subcategory_type: responseType,
            description,
            options,
            linear_scale_start: linearScaleStartLabel,
            linear_scale_end: linearScaleEndLabel,
            linear_scale_start_label: linearScaleStart,
            linear_scale_end_label: linearScaleEnd
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
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
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
                                        value={linearScaleStart}
                                        onChange={(e) => setLinearScaleStart(e.target.value)}
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
                                        value={linearScaleEnd}
                                        onChange={(e) => setLinearScaleEnd(e.target.value)}
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
                                    value={linearScaleStartLabel}
                                    onChange={(e) => setLinearScaleStartLabel(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Label"
                                    variant="outlined"
                                    fullWidth
                                    value={linearScaleEndLabel}
                                    onChange={(e) => setLinearScaleEndLabel(e.target.value)}
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

export default PerformanceEvaludationAddSubcategory;
