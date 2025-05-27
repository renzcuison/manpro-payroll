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
    const [sections, setSections] = useState([]);
    const [formId, setFormId] = useState(null); // Also store formId for future use

    // Fetch form data including creator info
    useEffect(() => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    axiosInstance.get(`/form/${formName}`, { headers })
        .then((response) => {
            const formData = response.data;
            if (formData) {
                setCreatorName(formData.creator_name);
                setCreatedDate(formData.created_at);
                setFormId(formData.id); // Save formId for fetching sections
            }
        })
        .catch(error => {
            console.error('Error fetching form data:', error);
        })
        .finally(() => {
            setLoading(false);
        });
}, [formName]);

useEffect(() => {
    if (!formId) return; // Early return if formId is not set

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    axiosInstance.get('/getEvaluationFormSections', { headers, params: { form_id: formId } })
        .then(res => setSections(res.data.sections || []))
        .catch(() => setSections([]));
}, [formId]);


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

    // Send the POST request to the backend
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    console.log('Sending data:', { form_id: formId, section_name: sectionName });

    axiosInstance.post('/insertEvaluationFormSection', {
        form_id: formId,
        name: sectionName,
        order: 1  // Default order
    }, { headers })
    .then(response => {
        setSections(prevSections => [...prevSections, response.data.section]);
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