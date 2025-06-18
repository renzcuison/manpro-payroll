import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Button,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PenLineIcon } from 'lucide-react';
import PerformanceEvaluationEvaluateeSign from './PerformanceEvaluationEvaluateeSign';

const PerformanceEvaluationEvaluateeAcknowledge = ({ open, onClose, onProceed }) => {
    const [signModalOpen, setSignModalOpen] = useState(false);

    const handleProceedSignature = (signatureData) => {
        setSignModalOpen(false);
        if (onProceed) onProceed(signatureData);
        if (onClose) onClose();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: 10,
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        backgroundColor: '#f8f9fa',
                        padding: 0
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: 26, pb: 0, mt: 4, mb: 4 }}>
                    EVALUATEE ACKNOWLEDGMENT
                    <Box
                        sx={{
                            height: '2px',
                            width: '100%',
                            bgcolor: '#E6E6E6',
                            borderRadius: 2
                        }}
                    />
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 20, top: 20, color: '#727F91' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: 16, color: '#4A4A4A', mb: 7 }}>
                            I acknowledge that I have had the opportunity to discuss this performance evaluation with my manager/supervisor and I have received a copy of this evaluation.
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                            <Button
                                variant="contained"
                                startIcon={<PenLineIcon />}
                                onClick={() => setSignModalOpen(true)}
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
                                SIGN HERE
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Signature Modal */}
            <PerformanceEvaluationEvaluateeSign
                open={signModalOpen}
                onClose={() => setSignModalOpen(false)}
                onProceed={handleProceedSignature}
            />
        </>
    );
};

export default PerformanceEvaluationEvaluateeAcknowledge;