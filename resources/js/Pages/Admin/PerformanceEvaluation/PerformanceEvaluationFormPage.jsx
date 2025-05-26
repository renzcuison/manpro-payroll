import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout'; // Assuming you have this Layout component

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams(); // Retrieve formName from the URL parameter
    const navigate = useNavigate();

    // For demonstration purposes, you can mock the "Created By" and "Date Created" data
    const createdBy = "User Name"; // Example creator
    const createdDate = "May 16, 2025 - 11:21 AM"; // Example creation date

    return (
        <Layout title="Performance Evaluation Form">
            <Box sx={{ mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px' }}>
                <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
                    <CardContent>
                        {/* Form Name */}
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                            {formName} {/* Form name from URL */}
                        </Typography>

                        {/* Form metadata */}
                        <Typography variant="body1" sx={{ textAlign: 'center', color: '#777' }}>
                            Created by: {createdBy}
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'center', color: '#777' }}>
                            Date Created: {createdDate}
                        </Typography>

                        {/* Add Section Button */}
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/admin/performance-evaluation/form/${formName}/add-section`)}
                                sx={{
                                    bgcolor: '#177604',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': { bgcolor: '#0d5c27' }
                                }}
                            >
                                Add Section
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationFormPage;
