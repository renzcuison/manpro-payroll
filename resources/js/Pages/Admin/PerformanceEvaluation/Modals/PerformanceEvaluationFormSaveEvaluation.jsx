import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const PerformanceEvaluationFormSaveEvaluation = ({ open, onClose, onProceed }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 35 }}>
                        Your evaluation is received and<br />
                        will be sent to your supervisor.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 8, pb: 5 }}>
                {/* Cancel Button */}
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
                            fontSize: '30px',
                            fontWeight: 'bold',
                            stroke: 'white',
                            strokeWidth: 2,
                            fill: 'none'
                        }} />
                    }
                >
                    Cancel
                </Button>

                {/* Save Button */}
                <Button
                    onClick={onProceed}
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
                            fontSize: '0.3rem',
                            fontWeight: 'bold',
                            stroke: 'white',
                            strokeWidth: 2,
                            fill: 'none'
                        }} />
                    }
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PerformanceEvaluationFormSaveEvaluation;
