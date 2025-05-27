import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CardContent,
    Button,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import SettingsIcon from '@mui/icons-material/Settings';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormAddCategory from './Modals/PerformanceEvaluationFormAddCategory';
import SubCategoryModal from './Modals/SubcategoryModal'; // Import your modal
import Swal from 'sweetalert2';

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams();

    const [creatorName, setCreatorName] = useState('');
    const [createdDate, setCreatedDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [sections, setSections] = useState([]);
    const [formId, setFormId] = useState(null);
    const [expanded, setExpanded] = useState(false);

    // Category modal state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const [categorySectionId, setCategorySectionId] = useState(null);

    // SubCategory modal state
    const [addSubCategoryOpen, setAddSubCategoryOpen] = useState(false);
    const [subCategorySectionId, setSubCategorySectionId] = useState(null);

    // Fetch form details
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

    // Fetch sections with categories
    const fetchSections = () => {
        if (!formId) return;
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        axiosInstance.get('/getEvaluationFormSections', { headers, params: { form_id: formId } })
            .then(res => setSections(res.data.sections || []))
            .catch(() => setSections([]));
    };

    useEffect(() => {
        fetchSections();
        // eslint-disable-next-line
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
            fetchSections();
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

    // Category modal handlers
    const handleOpenAddCategoryModal = (sectionId) => {
        setCategorySectionId(sectionId);
        setAddCategoryOpen(true);
    };

    const handleCloseAddCategoryModal = () => {
        setAddCategoryOpen(false);
        setCategorySectionId(null);
    };

    // Save category
    const handleSaveCategory = (categoryName) => {
        if (!categorySectionId || !categoryName) {
            Swal.fire({
                text: "Section ID and Category Name are required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }

        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        axiosInstance.post('/saveEvaluationFormCategory', {
            section_id: categorySectionId,
            name: categoryName
        }, { headers })
        .then(() => {
            fetchSections();
            handleCloseAddCategoryModal();
            Swal.fire({
                text: "Category added successfully!",
                icon: "success",
                confirmButtonColor: '#177604',
            });
        })
        .catch(error => {
            console.error('Error saving category:', error);
            Swal.fire({
                text: "Error saving category.",
                icon: "error",
                confirmButtonColor: '#177604',
            });
        });
    };

    // SubCategory modal handlers
    const handleOpenAddSubCategoryModal = (sectionId) => {
        setSubCategorySectionId(sectionId);
        setAddSubCategoryOpen(true);
    };

    const handleCloseAddSubCategoryModal = () => {
        setAddSubCategoryOpen(false);
        setSubCategorySectionId(null);
    };

    // Save SubCategory
    const handleSaveSubCategory = (subCategoryData) => {
        const section = sections.find(s => s.id === subCategorySectionId);
        const categoryId = section?.categories?.[0]?.id;
        if (!categoryId || !subCategoryData.subCategoryName) {
            Swal.fire({
                text: "Category and Sub-Category Name are required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }

        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        axiosInstance.post('/saveEvaluationFormSubcategory', {
            category_id: categoryId,
            name: subCategoryData.subCategoryName,
            subcategory_type: subCategoryData.responseType,
            description: subCategoryData.description,
            // Add more fields as needed (like options, scale, etc.)
        }, { headers })
        .then(() => {
            fetchSections();
            handleCloseAddSubCategoryModal();
            Swal.fire({
                text: "Sub-Category added successfully!",
                icon: "success",
                confirmButtonColor: '#177604',
            });
        })
        .catch(error => {
            console.error('Error saving subcategory:', error);
            Swal.fire({
                text: "Error saving sub-category.",
                icon: "error",
                confirmButtonColor: '#177604',
            });
        });
    };

    return (
        <Layout title="Performance Evaluation Form">
            <Box sx={{ mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative', maxWidth: '1000px', mx: 'auto' }}>
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

                        {/* Sections as Accordions */}
                        <Box sx={{ mt: 2 }}>
                            {sections.map(section => (
                                <Accordion
                                    key={section.id}
                                    expanded={expanded === section.id}
                                    onChange={handleAccordionChange(section.id)}
                                    sx={{
                                        my: 2,
                                        boxShadow: 3,
                                        borderRadius: 2,
                                        '&:before': { display: 'none' },
                                        bgcolor: expanded === section.id ? '#eab31a' : 'white',
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: expanded === section.id ? 'white' : '#eab31a' }} />}
                                        aria-controls={`section-content-${section.id}`}
                                        id={`section-header-${section.id}`}
                                        sx={{
                                            bgcolor: '#eab31a',
                                            color: 'white',
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            fontSize: 18,
                                            minHeight: 64,
                                            '& .MuiAccordionSummary-content': { my: 1 },
                                        }}
                                    >
                                        {section.name}
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fafafa', borderRadius: 2 }}>
                                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                                            <Typography variant="h6" sx={{
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
                                            }}>
                                                Categories
                                            </Typography>
                                            {section.categories && section.categories.length > 0 ? (
                                                section.categories.map(category => (
                                                    <Paper
                                                        key={category.id}
                                                        sx={{
                                                            mb: 1,
                                                            p: 2,
                                                            bgcolor: "#fff8e1",
                                                            borderLeft: "5px solid #eab31a",
                                                            fontWeight: "bold"
                                                        }}
                                                        elevation={1}
                                                    >
                                                        {category.name}
                                                    </Paper>
                                                ))
                                            ) : (
                                                <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
                                                    No categories yet.
                                                </Typography>
                                            )}
                                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                                {section.categories && section.categories.length === 0 ? (
                                                    <Button
                                                        variant="contained"
                                                        sx={{
                                                            bgcolor: '#177604',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            borderRadius: 1,
                                                            px: 4,
                                                            py: 1.5,
                                                            '&:hover': { bgcolor: '#0d5c27' }
                                                        }}
                                                        onClick={() => handleOpenAddCategoryModal(section.id)}
                                                    >
                                                        ADD CATEGORY
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        sx={{
                                                            bgcolor: '#177604',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            borderRadius: 1,
                                                            px: 4,
                                                            py: 1.5,
                                                            '&:hover': { bgcolor: '#0d5c27' }
                                                        }}
                                                        onClick={() => handleOpenAddSubCategoryModal(section.id)}
                                                    >
                                                        ADD SUB-CATEGORY
                                                    </Button>
                                                )}
                                            </Box>
                                        </Paper>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </CardContent>
                )}

                <PerformanceEvaluationFormAddSection
                    open={addSectionOpen}
                    onClose={handleCloseAddSectionModal}
                    onSave={handleSaveSection}
                />
                <PerformanceEvaluationFormAddCategory
                    open={addCategoryOpen}
                    onClose={handleCloseAddCategoryModal}
                    onSave={handleSaveCategory}
                />
                <SubCategoryModal
                    open={addSubCategoryOpen}
                    onClose={handleCloseAddSubCategoryModal}
                    onSave={handleSaveSubCategory}
                />
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationFormPage;