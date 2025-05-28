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
import CheckUser from '../../Errors/Error404';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import SettingsIcon from '@mui/icons-material/Settings';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormSection from './Subsections/PerformanceEvaluationFormSection';
import SubCategoryModal from './Modals/SubcategoryModal'; // Import your modal
import Swal from 'sweetalert2';
import { useEvaluationForm } from '../../../hooks/useEvaluationForm';

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams();
    const { creatorName, createdDate, formId, loading, notFound, sections, saveSection } =
        useEvaluationForm({ name: formName })
    ;

    // Section modal state
    const [addSectionOpen, setAddSectionOpen] = useState(false);

    // SubCategory modal state
    const [addSubCategoryOpen, setAddSubCategoryOpen] = useState(false);
    const [subCategorySectionId, setSubCategorySectionId] = useState(null);

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
        if (!sectionName) {
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        saveSection(sectionName);
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

    useEffect(() => {console.log(sections)}, [sections]);

    if(notFound) return <CheckUser />;

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

                        

                        {/* Sections as Accordions */}
                        <Box sx={{ mt: 2 }}>
                            {sections.map(section => <PerformanceEvaluationFormSection
                                key={ section.id }
                                section={ section }
                            />)}
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