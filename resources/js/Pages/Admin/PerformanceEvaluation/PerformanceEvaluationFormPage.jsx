import React, { useEffect, useState } from 'react';
import { Box, Typography, CardContent, Button, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout'; 
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig"; 
import SettingsIcon from '@mui/icons-material/Settings'; 
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection'; // Import the Add Section Modal

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams(); // Retrieve formName from the URL parameter
    const navigate = useNavigate();

    const [creatorName, setCreatorName] = useState('');  // Store creator's name
    const [createdDate, setCreatedDate] = useState('');   // Store the creation date
    const [loading, setLoading] = useState(true);         // Loading state
    const [addSectionOpen, setAddSectionOpen] = useState(false); // State to control the modal visibility

    // Fetch form data including creator info
    useEffect(() => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        // Fetch form metadata from the backend
        axiosInstance.get(`/form/${formName}`, { headers })
            .then((response) => {
                const formData = response.data;
                if (formData) {
                    setCreatorName(formData.creator_name);  // Assuming the response contains creator_name
                    setCreatedDate(formData.created_at);    // Assuming the response contains created_at
                }
            })
            .catch(error => {
                console.error('Error fetching form data:', error);
            })
            .finally(() => {
                setLoading(false);  // Set loading to false once the data is fetched
            });
    }, [formName]);

    // Handle Settings Button click
    const handleSettings = () => {
        console.log("Settings clicked!"); // Placeholder for your settings functionality
    };

    // Handle opening the Add Section modal
    const handleOpenAddSectionModal = () => {
        setAddSectionOpen(true);  // Open the modal
    };

    // Handle closing the Add Section modal
    const handleCloseAddSectionModal = () => {
        setAddSectionOpen(false); // Close the modal
    };

    // Handle save action from the modal (this is where you can handle logic for saving a section)
    const handleSaveSection = (sectionName) => {
        console.log('New Section Saved:', sectionName); 
        // Implement section save logic here (e.g., API request to save the section)
        handleCloseAddSectionModal(); // Close the modal after saving
    };

    return (
        <Layout title="Performance Evaluation Form">
            <Box sx={{ mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative', maxWidth: '1000px', mx: 'auto' }}>
                {/* Settings Icon */}
                <IconButton sx={{ position: 'absolute', top: 24, right: 24 }} onClick={handleSettings}>
                    <SettingsIcon sx={{ color: '#bdbdbd', fontSize: 32 }} />
                </IconButton>

                {loading ? (
                    <Typography variant="h6">Loading...</Typography> 
                ) : (
                    <CardContent>
                        {/* Form Name */}
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'left', mb: 2 }}>
                            {formName}
                        </Typography>

                        {/* Form metadata */}
                        <Typography variant="body1" sx={{ textAlign: 'left', color: '#777', mb: 1 }}>
                            Created by: {creatorName || 'N/A'}  
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left', color: '#777' }}>
                            Date Created: {createdDate ? new Date(createdDate).toLocaleString() : 'N/A'}  
                        </Typography>

                        {/* Add Section Button */}
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenAddSectionModal} // Open the modal on button click
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
                )}

                {/* Add Section Modal */}
                <PerformanceEvaluationFormAddSection
                    open={addSectionOpen}
                    onClose={handleCloseAddSectionModal}
                    onSave={handleSaveSection}
                />
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationFormPage;
