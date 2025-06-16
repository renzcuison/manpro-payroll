import React, { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SignatureCanvas from 'react-signature-canvas';

const PerformanceEvaluationEvaluatorSign = ({ open, onClose, onProceed }) => {
    const sigPadRef = useRef();

    const handleProceed = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            const signatureData = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
            if (onProceed) onProceed(signatureData);
            // sigPadRef.current.getTrimmedCanvas().toBlob(function(blob) {
            //     if (onProceed) onProceed(blob);
            // }, 'image/png');
            
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '20px',
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    backgroundColor: '#ffffff',
                    minWidth: '1000px',
                    maxWidth: '1100px',
                }
            }}
        >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent>
                <Box sx={{ mx: 4, my: 5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        EVALUATOR SIGNATURE
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Typography sx={{ fontSize: 16, color: '#6c757d', mb: 3 }}>
                        I acknowledge that I have answered the performance evaluation and provided my comments as an evaluator.
                    </Typography>

                    <Box
                        sx={{
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            padding: 2,
                            minHeight: 160,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                        }}
                    >
                        <SignatureCanvas
                            ref={sigPadRef}
                            penColor="black"
                            canvasProps={{ width: 700, height: 120, className: 'sigCanvas' }}
                        />
                        <Typography
                            variant="body2"
                            sx={{ position: 'absolute', bottom: 8, right: 16, color: '#6c757d' }}
                        >
                            {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between', px: 6, pb: 6 }}>
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        bgcolor: '#7b8794',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        px: 4,
                        '&:hover': { bgcolor: '#5a6673' }
                    }}
                >
                    &#10005;&nbsp; CANCEL
                </Button>
                <Button
                    variant="contained"
                    onClick={handleProceed}
                    sx={{
                        bgcolor: '#137333',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        px: 4,
                        '&:hover': { bgcolor: '#0d5c27' }
                    }}
                >
                    PROCEED
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PerformanceEvaluationEvaluatorSign;