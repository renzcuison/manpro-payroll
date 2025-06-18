import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Grid, Divider } from '@mui/material';

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
        sections.reduce((acc, s) => ({ ...acc, [s.id]: s.score ?? 0 }), {})
    );

    React.useEffect(() => {
        setScores(sections.reduce((acc, s) => ({ ...acc, [s.id]: s.score ?? 0 }), {}));
    }, [sections, open]);

    const handleScoreChange = (id, val) => {
        setScores({ ...scores, [id]: Number(val) });
    };

    const handleSave = () => {
        // Only send scores for scorable sections
        const filteredScores = {};
        for (const section of sections) {
            if (isSectionScorable(section)) {
                filteredScores[section.id] = scores[section.id];
            }
        }
        onSave(filteredScores);
        onClose();
    };

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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                    <Button onClick={onClose} variant="outlined">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#177604', color: 'white' }}>Save</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default PerformanceEvaluationSectionRatingModal;