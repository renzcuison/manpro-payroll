import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Typography, Button, Box, Divider } from '@mui/material';


const labelStyle = {
    fontWeight: 600,
    color: '#444',
    width: 180,
    display: 'inline-block',
    verticalAlign: 'top'
};

const valueStyle = {
    color: '#222',
    marginLeft: 10,
    fontWeight: 400,
    alignSelf: 'flex-start',
};

const sectionStyle = {
    mb: 2,
    mt: 1,
};

const CreateEvaluationReviewModal = ({
    open,
    onProceed,
    onClose,
    data,
    branches,
    departments,
    employees,
    admins,
    performanceEvaluation,
    extraCommentors,
    getFullName
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1, pt: 2, fontWeight: 700, fontSize: 22 }}>Review E-Employee Evaluation Details</DialogTitle>
        <DialogContent dividers sx={{ px: 4, py: 3, bgcolor: '#f8f9fa' }}>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ ...labelStyle }}>Branch:</Typography>
                <Typography sx={valueStyle} component="span">
                    {branches.find(b => b.id === data.branch)?.name || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Department:</Typography>
                <Typography sx={valueStyle} component="span">
                    {departments.find(d => d.id === data.department)?.name || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Employee:</Typography>
                <Typography sx={valueStyle} component="span">
                    {getFullName(employees.find(e => e.id === data.evaluatee) || {}) || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Evaluator:</Typography>
                <Typography sx={valueStyle} component="span">
                    {getFullName(admins.find(a => a.id === data.evaluator) || {}) || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Primary Commentor:</Typography>
                <Typography sx={valueStyle} component="span">
                    {getFullName(admins.find(a => a.id === data.primaryCommentor) || {}) || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Secondary Commentor:</Typography>
                <Typography sx={valueStyle} component="span">
                    {getFullName(admins.find(a => a.id === data.secondaryCommentor) || {}) || <em>—</em>}
                </Typography>
            </Box>
            {extraCommentors.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2, mb: 2 }}>
                <Typography sx={labelStyle}>Additional Commentors:</Typography>
                <Box sx={{ ...valueStyle, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {extraCommentors.map((id, idx) => (
                    <Typography
                    key={idx}
                    sx={{ color: '#222', fontWeight: 400,lineHeight: 1.6 }}
                    >
                    {getFullName(admins.find(a => a.id === id) || {}) || <em>—</em>}
                    </Typography>
                ))}
                </Box>
            </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Evaluation Form:</Typography>
                <Typography sx={valueStyle} component="span">
                    {performanceEvaluation.find(f => f.id === data.evaluationForm)?.name || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Period From:</Typography>
                <Typography sx={valueStyle} component="span">
                    {data.periodFrom || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Period To:</Typography>
                <Typography sx={valueStyle} component="span">
                    {data.periodTo || <em>—</em>}
                </Typography>
            </Box>
            <Box sx={sectionStyle}>
                <Typography sx={labelStyle}>Date:</Typography>
                <Typography sx={valueStyle} component="span">
                    {data.date || <em>—</em>}
                </Typography>
            </Box>
        </DialogContent>
        <DialogActions
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                px: 4,
                py: 2,
                bgcolor: '#f4f4f4',
                borderTop: '1px solid #eee',
                gap: 2
            }}
        >
            <Button
                onClick={onClose}
                color="white"
                variant="outlined"
                sx={{ px: 4, py: 1, fontWeight: 600, borderRadius: 2, backgroundColor: '#727F91', color:'#ffff' }}
            >
                Edit
            </Button>
            <Button
                onClick={onProceed}
                color="success"
                variant="contained"
                sx={{ px: 4, py: 1, fontWeight: 600, borderRadius: 2, boxShadow: 1 }}
            >
                Proceed
            </Button>
        </DialogActions>
    </Dialog>
);

export default CreateEvaluationReviewModal;