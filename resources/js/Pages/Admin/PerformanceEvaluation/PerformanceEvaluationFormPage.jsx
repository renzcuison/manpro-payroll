import React, { useEffect, useState } from 'react';
import { Box, Typography, CardContent, Button, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout'; 
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig"; 
import SettingsIcon from '@mui/icons-material/Settings'; 
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection'; // Import the Add Section Modal
import Swal from 'sweetalert2';

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams(); // Retrieve formName from the URL parameter
    const navigate = useNavigate();

    const [formData, setFormData] = useState({});
    const {
        id: formId,
        creator_user_name: creatorName,
        created_at: createdDate,
        sections
    } = formData;

    const [loading, setLoading] = useState(true);         // Loading state
    const [addSectionOpen, setAddSectionOpen] = useState(false); // State to control the modal visibility
    // Fetch form data including creator info
    useEffect(() => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        axiosInstance.get(`/getEvaluationForm`, { headers, params: { name: formName } })
            .then((response) => {
                const { evaluationForm, status } = response.data;
                if(status.toString().startsWith(4)) throw response.data;
                setFormData(evaluationForm);
            })
            .catch(error => {
                console.error('Error fetching form data:', error);
            })
            .finally(() => {
                setLoading(false);
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
            if (!formId || !sectionName) {
                Swal.fire({
                    text: "Form ID and Section Name are required!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }

        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        // Use the correct endpoint and payload
        axiosInstance.post('/saveEvaluationFormSection', {
            form_id: formId,
            name: sectionName
        }, { headers })
        .then(() => {
            // Refetch sections after adding
            axiosInstance.get('/getEvaluationForm', { headers, params: { id: formId } })
                .then(response => {
                    const { evaluationForm, status } = response.data;
                    if(status.toString().startsWith(4)) throw response.data;
                    setFormData(evaluationForm);
                });
            handleCloseAddSectionModal();
        })
        .catch(error => {
            console.error('Error saving section:', error);
            Swal.fire({
                text: "Error saving section.",
                icon: "error",
                confirmButtonColor: '#177604',
            });
        });
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
                                onClick={handleOpenAddSectionModal}
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

                        {/* Display sections here */}
                        {sections.map(section => (
                            <Box key={section.id} sx={{ my: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#eab31a',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: 18,
                                        py: 2,
                                        mb: 2,
                                        '&:hover': { bgcolor: '#c99c17' }
                                    }}
                                >
                                    {section.name}
                                </Button>
                            </Box>
                        ))}
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