import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Layout from '../../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';

const PerformanceEvaluationForm = () => {
    const navigate = useNavigate();
    const [addSectionOpen, setAddSectionOpen] = useState(false);

    // Placeholder data
    const formTitle = "Sample Form";
    const createdBy = "User Name";
    const dateCreated = "May 16, 2025 - 11:21 AM";

    // Add Section handler
    const handleAddSection = () => setAddSectionOpen(true);

    // Save Section handler
    const handleSaveSection = (categoryName) => {
        // Implement save logic here
        // Example: console.log('Saved section:', categoryName);
    };

    // Settings handler
    const handleSettings = () => {
        alert('Settings clicked!');
    };

    return (
        <Layout title={"Performance Evaluation Form"}>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={2}
                    sx={{
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '900px',
                        minHeight: '200px',
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    {/* Settings Icon */}
                    <IconButton
                        sx={{ position: 'absolute', top: 24, right: 24 }}
                        onClick={handleSettings}
                    >
                        <SettingsIcon sx={{ color: '#bdbdbd', fontSize: 32 }} />
                    </IconButton>

                    {/* Title and Meta */}
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {formTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Created by: {createdBy}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                        Date Created: {dateCreated}
                    </Typography>

                    {/* Centered Add Section Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#137333',
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: '4px',
                                boxShadow: 2,
                                '&:hover': { bgcolor: '#0d5c27' }
                            }}
                            onClick={handleAddSection}
                        >
                            ADD SECTION
                        </Button>
                    </Box>
                </Paper>
            </Box>
            {/* Add Section Modal */}
            <PerformanceEvaluationFormAddSection
                open={addSectionOpen}
                onClose={() => setAddSectionOpen(false)}
                onSave={handleSaveSection}
            />
        </Layout>
    );
};

export default PerformanceEvaluationForm;