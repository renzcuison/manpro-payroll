import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Grid, Divider } from '@mui/material';

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
        onSave(scores);
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
                    {sections.map(section => (
                        <Grid container item alignItems="center" key={section.id} spacing={2}>
                            <Grid item sx={{ minWidth: 180, maxWidth: 250 }}>
                                <Typography sx={{ fontSize: 16 }}>{section.name}</Typography>
                            </Grid>
                            <Grid item sx={{ flex: 1 }}>
                                <TextField
                                    type="number"
                                    value={scores[section.id]}
                                    onChange={e => handleScoreChange(section.id, e.target.value)}
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    ))}
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