import {
    Box,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PerformanceEvaluationFormAddCategory from '../Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationFormCategory from './PerformanceEvaluationFormCategory';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useState } from 'react';

const PerformanceEvaluationFormSection = ({ section }) => {
    const {
        sectionId, sectionName, expanded, order, categories,
        saveCategory, toggle
    } = useEvaluationFormSection( section );
    const hasCategories = categories.length > 0;

    // Category modal state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);

    // Category modal handlers
    const handleOpenAddCategoryModal = (sectionId) => {
        setAddCategoryOpen(true);
    };

    const handleCloseAddCategoryModal = () => {
        setAddCategoryOpen(false);
    };

    // Save category
    const handleSaveCategory = (categoryName) => {
        if (!sectionId || !categoryName) {
            Swal.fire({
                text: "Section ID and Category Name are required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        saveCategory(categoryName);
    };
    
    return <>
        <Accordion
            expanded={expanded}
            onChange={toggle}
            sx={{
                my: 2,
                boxShadow: 3,
                borderRadius: 2,
                '&:before': { display: 'none' },
                bgcolor: expanded === sectionId ? '#eab31a' : 'white',
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: expanded === sectionId ? 'white' : '#eab31a' }} />}
                aria-controls={`section-content-${sectionId}`}
                id={`section-header-${sectionId}`}
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
                {sectionName}
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
                    {hasCategories ? (
                        categories.map(category=><PerformanceEvaluationFormCategory
                            key={ category.id }
                            category={ category }
                        />)
                    ) : (
                        <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
                            No categories yet.
                        </Typography>
                    )}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        {!hasCategories ? (
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
                                onClick={() => handleOpenAddCategoryModal()}
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
                                // onClick={() => handleOpenAddSubCategoryModal(section.id)}
                            >
                                ADD SUB-CATEGORY
                            </Button>
                        )}
                    </Box>
                </Paper>
            </AccordionDetails>
        </Accordion>
        <PerformanceEvaluationFormAddCategory
            open={addCategoryOpen}
            onClose={handleCloseAddCategoryModal}
            onSave={handleSaveCategory}
        />
    </>;
};

export default PerformanceEvaluationFormSection;
