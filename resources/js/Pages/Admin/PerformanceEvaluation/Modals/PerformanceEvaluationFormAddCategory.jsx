import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Button,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const PerformanceEvaluationFormAddCategory = ({ open, onClose, onSave }) => {
    const [categoryName, setCategoryName] = useState('');

    const handleSave = () => {
        if (categoryName.trim()) {
            onSave(categoryName);
            setCategoryName('');
            onClose();
        }
    };

    const handleCancel = () => {
        setCategoryName('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: 10,
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    minWidth: 400,
                    maxWidth: 800,
                    backgroundColor: '#f8f9fa',
                    
                }
            }}
            sx={{
                '& .MuiPaper-root': {
                    width: '1100px', 
                    height: '350px', 
                    px: 3,
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
                    ADD CATEGORY
                </Typography>

                {/* Thin line beneath the title */}
                <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }}></Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1, mb: 4 }}>
                    <TextField
                        label="Category Name*"
                        variant="outlined"
                        fullWidth
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                        sx={{ mb: 4 }}
                    />
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
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PerformanceEvaluationFormAddCategory;