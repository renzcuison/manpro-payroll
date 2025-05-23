import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

const PerformanceEvaluationFormSaveEvaluation = ({ open, onClose, onProceed }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 35, }}>
                        Your evaluation is received and<br />
                        will be sent to your supervisor.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 8, pb: 5,  }}>
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        bgcolor: '#7b8794',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        px: 4,
                        '&:hover': { bgcolor: '#5a6673' }
                    }}
                >
                    &#10005;&nbsp; CANCEL
                </Button>
                <Button
                    variant="contained"
                    onClick={onProceed}
                    sx={{
                        bgcolor: '#137333',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        px: 4,
                        '&:hover': { bgcolor: '#0d5c27' }
                    }}
                    startIcon={
                        <span
                            style={{
                                display: 'inline-block',
                                width: 18,
                                height: 18,
                                background: `url("data:image/svg+xml,%3Csvg width='18' height='18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='8' stroke='%23FFFFFF' stroke-width='2'/%3E%3Cpath d='M5 9.5l2 2L13 6.5' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center center`,
                                backgroundSize: 'contain'
                            }}
                        />
                    }
                >
                    PROCEED
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PerformanceEvaluationFormSaveEvaluation;