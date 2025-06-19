import React from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Box } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useEvaluationFormSubcategory } from '../../../../hooks/useEvaluationFormSubcategory';

const PerformanceEvaluationFormAddSubcategory = ({ open, onClose, onSave }) => {
    const {
        subcategory,
        subcategoryName, setSubcategoryName,
        responseType, switchResponseType,
        subcategoryDescription, setSubcategoryDescription,
        required, toggleRequired,
        allowOtherOption, toggleAllowOtherOption,
        linearScaleStart, setLinearScaleStart,
        linearScaleEnd, setLinearScaleEnd,
        linearScaleStartLabel, setLinearScaleStartLabel,
        linearScaleEndLabel, setLinearScaleEndLabel,
        order,
        options, deleteOption, editOption, saveOption,
        linearScaleOptions, addLinearScaleOption, removeLinearScaleOption, editLinearScaleOption,
        saveSubcategory//, editOptionScore
    } = useEvaluationFormSubcategory();

    const handleSave = () => {
        onSave(subcategory);
        onClose();
    };


    const handleOptionChange = (index, event) => {
        editOption(index, event.target.value, options[index].score);
    };

    const handleOptionScoreChange = (index, event) => {
        editOption(index, options[index].label, Number(event.target.value));
    };

    const handleOptionDescriptionChange = (index, event) => {
        // Add this function
        editOption(index, options[index].label, options[index].score, event.target.value);
    };


    const handleAddOption = () => {
        saveOption('', 1, ''); 
    };

    const handleRemoveOption = (index) => {
        deleteOption(index);
    };
    
    const handleAddLinearScaleOption = () => {
        if (linearScaleOptions.length < 10) {
            setLinearScaleOptions([
                ...linearScaleOptions,
                { label: '', description: '', score: linearScaleOptions.length + 1 }
            ]);
        } else {
            // Optionally show a message when the limit of 10 options is reached.
            alert("You can only add up to 10 options for the linear scale.");
        }
    };

    const handleRemoveLinearScaleOption = (idx) => {
        if (linearScaleOptions.length > 2) { // Keep at least 2 options
            const newOptions = linearScaleOptions.filter((_, index) => index !== idx);
            setLinearScaleOptions(newOptions);
        }
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
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 'bold',
                    }}
                >
                    ADD SUB-CATEGORY
                </Typography>
                <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }}></Box>
            </DialogTitle>
            
            <DialogContent>
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
                                onChange={(e) => switchResponseType(e.target.value)}
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

                <Box sx={{ mb: 2, width:'100%', maxWidth: '935px' }} >
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={subcategoryDescription}
                        onChange={(e) => setSubcategoryDescription(e.target.value)}
                        required
                    />
                </Box>

                {(responseType === 'multipleChoice' || responseType === 'checkbox') && (
                    <Box sx={{ mb: 2, width: '100%'}}>
                        {options.map(({ label, score, description }, index) => (
                            <Grid container spacing={3} key={index} sx={{ mb: 2 }} alignItems="center">
                                <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1">{index + 1}.</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        value={label}
                                        onChange={(e) => handleOptionChange(index, e)}
                                        placeholder="Option label"
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        variant="outlined"
                                        placeholder="Score"
                                        value={score || ""}
                                        type="number"
                                        onChange={(e) => handleOptionScoreChange(index, e)}
                                        sx={{ width: 80 }}
                                        
                                        inputProps={{ min: 0, step: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                    variant="outlined"
                                    multiline
                                    label="Description"
                                    placeholder="Why this score?"
                                    value={description || ""}
                                    onChange={e => handleOptionDescriptionChange(index, e)}
                                    fullWidth
                                    
                                />
                                </Grid>
                                
                                <Grid item xs={1}>
                                    <IconButton
                                        onClick={() => handleRemoveOption(index)}
                                        sx={{ color: 'gray' }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
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

{responseType === 'linearScale' && (
    <Box sx={{ mb: 2 }}>
        {linearScaleOptions.map((option, idx) => (
            <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={1}>
                    <Typography variant="body1">{idx + 1}.</Typography>
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        variant="outlined"
                        label="Label"
                        value={option.label}
                        onChange={e => editLinearScaleOption(idx, 'label', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        variant="outlined"
                        label="Description (optional)"
                        value={option.description}
                        onChange={e => editLinearScaleOption(idx, 'description', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={1}>
                    {linearScaleOptions.length > 2 && (
                        <IconButton
                            onClick={() => removeLinearScaleOption(idx)}
                            sx={{ color: 'gray' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </Grid>
            </Grid>
        ))}
        {linearScaleOptions.length < 10 && (
            <Typography
                onClick={addLinearScaleOption}
                sx={{
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '8px',
                }}
            >
                {linearScaleOptions.length + 1}. Add Option
            </Typography>
        )}
    </Box>
)}
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
                            width: '120px',
                            height: '35px',
                            fontSize: '14px',
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
                            width: '120px',
                            height: '35px',
                            fontSize: '14px',
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

export default PerformanceEvaluationFormAddSubcategory;