import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
} from "@mui/material";
import React from "react";
import "react-quill/dist/quill.snow.css";

import LoanApplication from '../../components/Loan/LoanApplication';    

const LoanView = ({ open, close, selectedLoan }) => {

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '1200px', maxWidth: '1500px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Employee Loan Application </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 5, pb: 5 }}>
                    <LoanApplication selectedLoan={selectedLoan} />
                </DialogContent>
            </Dialog >
        </>
    )
}

export default LoanView;