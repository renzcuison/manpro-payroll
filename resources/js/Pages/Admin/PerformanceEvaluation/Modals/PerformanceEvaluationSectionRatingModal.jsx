import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Grid, Divider, InputAdornment, Alert } from '@mui/material';

const isSectionScorable = (section) => {
    // Return true if there's at least 1 subcategory NOT a short/long answer
    return Array.isArray(section.subcategories) &&
        section.subcategories.some(
            sc =>
                sc.subcategory_type !== "short_answer" &&
                sc.subcategory_type !== "long_answer"
        );
};

const PerformanceEvaluationSectionRatingModal = ({
    open, onClose, sections, onSave
}) => {
    const [scores, setScores] = useState(
        sections.reduce((acc, s) => ({ ...acc, [s.id]: s.score !== undefined ? String(s.score) : "" }), {})
    );
    const [error, setError] = useState('');

    React.useEffect(() => {
        setScores(sections.reduce((acc, s) => ({ ...acc, [s.id]: s.score ?? 0 }), {}));
        setError('');
    }, [sections, open]);

    const handleScoreChange = (id, val) => {
        // Optional: Only allow numbers and empty string
        if (/^\d*$/.test(val)) {
            setScores({ ...scores, [id]: val });
        }
    };

    const handleSave = () => {
        // Only send scores for scorable sections
        const filteredScores = {};
        let total = 0;
        for (const section of sections) {
            if (isSectionScorable(section)) {
                filteredScores[section.id] = Number(scores[section.id] || 0);
                total += Number(scores[section.id] || 0);
            }
        }
        if (total > 100) {
            setError('The total of all section scores cannot be more than 100.');
            return;
        } else if (total !==100){
            setError('The total of all section scores cannot be less than 100.');
            return;
        }
        setError('');
        onSave(filteredScores);
        onClose();
    };

    const totalScore = sections.reduce(
        (sum, section) => isSectionScorable(section) ? sum + Number(scores[section.id] || 0) : sum,
        0
    );

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                bgcolor: 'white', p: 4, borderRadius: 2, maxWidth: 500,
                mx: 'auto', mt: '10vh', boxShadow: 24
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Set Section Ratings</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container direction="column" spacing={2}>
                    {sections.map(section => {
                        const scorable = isSectionScorable(section);
                        return (
                            <Grid container item alignItems="center" key={section.id} spacing={2}>
                                <Grid item sx={{ minWidth: 180, maxWidth: 250 }}>
                                    <Typography sx={{ fontSize: 16 }}>{section.name}</Typography>
                                </Grid>
                                <Grid item sx={{ flex: 1 }}>
                                    {scorable ? (
                                        <TextField
                                            type="number"
                                            value={scores[section.id]}
                                            onChange={e => handleScoreChange(section.id, e.target.value)}
                                            inputProps={{ min: 0 }}
                                            fullWidth
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}
                                        />
                                    ) : (
                                        <Typography sx={{ color: '#aaa', fontStyle: 'italic', fontSize: 14 }}>
                                            Scoring not applicable
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 700, textAlign: 'right' }}>
                        Total: {totalScore}%
                    </Typography>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                    <Button onClick={onClose} variant="outlined">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#177604', color: 'white' }}>Save</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default PerformanceEvaluationSectionRatingModal;