import React, { useEffect, useState } from 'react';
import { Box, Typography, CardContent, Button, IconButton, Accordion, AccordionSummary, AccordionDetails, TextField, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import SettingsIcon from '@mui/icons-material/Settings';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import Swal from 'sweetalert2';
 
const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams();
    const navigate = useNavigate();
 
    const [creatorName, setCreatorName] = useState('');
    const [createdDate, setCreatedDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [sections, setSections] = useState([]);
    const [formId, setFormId] = useState(null);
    const [expanded, setExpanded] = useState(false);
 
    useEffect(() => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));
 
        axiosInstance.get(`/form/${formName}`, { headers })
            .then((response) => {
                const formData = response.data;
                if (formData) {
                    setCreatorName(formData.creator_name);
                    setCreatedDate(formData.created_at);
                    setFormId(formData.id);
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
        if (!formId) return;
 
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));
 
        axiosInstance.get('/getEvaluationFormSections', { headers, params: { form_id: formId } })
            .then(res => setSections(res.data.sections || []))
            .catch(() => setSections([]));
    }, [formId]);
 
    const handleSettings = () => {
        console.log("Settings clicked!");
    };
 
    const handleOpenAddSectionModal = () => {
        setAddSectionOpen(true);
    };
 
    const handleCloseAddSectionModal = () => {
        setAddSectionOpen(false);
    };
 
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
 
        axiosInstance.post('/saveEvaluationFormSection', {
            form_id: formId,
            name: sectionName
        }, { headers })
        .then(() => {
            axiosInstance.get('/getEvaluationFormSections', { headers, params: { form_id: formId } })
                .then(res => setSections(res.data.sections || []));
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
 
    const handleAccordionChange = (sectionId) => (event, isExpanded) => {
        setExpanded(isExpanded ? sectionId : false);
    };
 
    return (
        <Layout title="Performance Evaluation Form">
            <Box sx={{ mt: 5, p: 3, bgcolor: '#FBFBFB', borderRadius: '8px', position: 'relative', maxWidth: '1000px', mx: 'auto' }}>
                <IconButton sx={{ position: 'absolute', top: 24, right: 24 }} onClick={handleSettings}>
                    <SettingsIcon sx={{ color: '#bdbdbd', fontSize: 32 }} />
                </IconButton>
 
                {loading ? (
                    <Typography variant="h6">Loading...</Typography>
                ) : (
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'left', mb: 2 }}>
                            {formName}
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left', color: '#777', mb: 1 }}>
                            Created by: {creatorName || 'N/A'}
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left', color: '#777' }}>
                            Date Created: {createdDate ? new Date(createdDate).toLocaleString() : 'N/A'}
                        </Typography>
 
                        
 
 <Box sx={{ mt: 2 }}>
  {sections.map((section, index) => {
    const isFirst = index === 0;
    const isLast = index === sections.length - 1;

    

    return (
      <Accordion
        key={section.id}
        expanded={expanded === section.id}
        onChange={handleAccordionChange(section.id)}
        sx={{
          boxShadow: 'none',
          bgcolor: 'transparent',  // Ensure no unwanted white background
          border: 'none',
          '&:before': { display: 'none' },
          mb: 2,
          borderRadius: '20px',
          // Apply box shadow only when expanded
          boxShadow: expanded === section.id ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls={`section-content-${section.id}`}
          id={`section-header-${section.id}`}
          sx={{
            bgcolor: '#eab31a',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 20,
            minHeight: 56,
            borderRadius: expanded === section.id ? '20px 20px 0 0' : '20px',
            boxShadow: expanded === section.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            px: 3,
            // Ensure no padding or margin overflow
            margin: 0,
          }}
        >
          {section.name}
        </AccordionSummary>
        <AccordionDetails
          sx={{
            bgcolor: expanded === section.id ? 'white' : 'transparent', // Transparent when collapsed
            borderTop: 'none',
            borderRadius: '0 0 20px 20px',
            p: 3, // Padding for the expanded content
            pt: 4,
            // Add a subtle shadow when expanded
            boxShadow: expanded === section.id ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
            margin: 0, // Prevent margin overflow
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              mb: 3,
              bgcolor: '#f4f4f4',
              boxShadow: 'none', // No additional shadow on Paper
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                color: '#444',
                fontWeight: 'bold',
                borderLeft: '8px solid #eab31a',
                pl: 2,
                bgcolor: '#f4f4f4',
                borderRadius: 1,
                minHeight: 48,
              }}
            >
              Category Name
            </Typography>
            <TextField
              fullWidth
              label="Category Name"
              variant="standard"
              sx={{ mb: 3, bgcolor: 'white' }}
            />
          </Paper>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#177604',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 1,
                px: 4,
                py: 1.5,
                boxShadow: 2,
                '&:hover': { bgcolor: '#0d5c27' },
              }}
            >
              ADD CATEGORY
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  })}
</Box>










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
                    </CardContent>
                )}
 
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