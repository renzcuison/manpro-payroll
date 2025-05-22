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
import { max } from 'lodash';

const PerformanceEvaluationFormAddSection = ({ open, onClose, onSave }) => {
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
                    padding: 0
                }
            }}
        >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 26, pb: 0, mt: 2, mb: 2 }}>
            ADD SECTION
            <Box
                sx={{
                    height: '2px',
                    width: '100%',
                    bgcolor: '#E6E6E6',
                    borderRadius: 2
                }}
            />
        </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Category Name*"
                        variant="outlined"
                        fullWidth
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                        sx={{ mb: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt:2 }}>
                        <Button
                            variant="contained"
                            startIcon={<CloseIcon />}
                            onClick={handleCancel}
                            sx={{
                                bgcolor: '#7b8794',
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: '8px',
                                boxShadow: 1,
                                '&:hover': { bgcolor: '#5a6473' }
                            }}
                        >
                            CANCEL
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleSave}
                            sx={{
                                bgcolor: '#137333',
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: '8px',
                                boxShadow: 1,
                                '&:hover': { bgcolor: '#0d5c27' }
                            }}
                        >
                            SAVE
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PerformanceEvaluationFormAddSection;