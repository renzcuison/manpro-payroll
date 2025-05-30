import {
    Box,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PerformanceEvaluationFormAddCategory from '../Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationRating from './PerformanceEvaluationRating';
import PerformanceEvaluationAddSubcategory from '../Modals/PerformanceEvaluationAddSubcategory';
import Swal from 'sweetalert2';
import { useClickHandler } from '../../../../hooks/useClickHandler';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useState } from 'react';

const PerformanceEvaluationFormSection = ({ section }) => {
    const {
        sectionId,
        sectionName, setSectionName,
        sectionCategory, setSectionCategory,
        expanded, toggleExpand,
        editable, toggleEditable,
        order,
        subcategories, saveSubcategory,
        editSection
    } = useEvaluationFormSection(section);

    // Section handlers
    const [onSectionClick] = useClickHandler({
        onSingleClick: toggleExpand,
        onDoubleClick: toggleEditable
    });

    // Category modal state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);

    // Category modal handlers
    const handleOpenAddCategoryModal = () => setAddCategoryOpen(true);
    const handleCloseAddCategoryModal = () => setAddCategoryOpen(false);

    // Save category
    const handleSaveCategory = (sectionCategory) => {
        if (!sectionId || !sectionCategory) {
            Swal.fire({
                text: "Category Name are required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        editSection({ category: sectionCategory });
    };

    // Subcategory modal state
    const [addSubcategoryOpen, setAddSubcategoryOpen] = useState(false);

    // Subcategory modal handlers
    const handleOpenAddPerformanceEvaluationAddSubcategory = () => setAddSubcategoryOpen(true);
    const handleCloseAddPerformanceEvaluationAddSubcategory = () => setAddSubcategoryOpen(false);

    // Save Subcategory
    const handleSaveSubcategory = (subcategory) => {
        if (!subcategory.name) {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        saveSubcategory(subcategory);
    };

    // Local state to track which subcategory is expanded
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    const handleSubcategoryToggle = (id) => (event, isExpanded) => {
        setExpandedSubcategory(isExpanded ? id : null);
    };

    // Helper to display subcategory type
    const getSubcategoryTypeDisplay = (type) => {
        // You can customize these for user-friendly names
        const map = {
            short_answer: "Short Answer",
            checkbox: "Checkbox",
            linear_scale: "Linear Scale",
            rating: "Rating",
            comment: "Comment",
            // Add more mappings as needed
        };
        return map[type] || type;
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={onSectionClick}
            sx={{
                my: 2,
                boxShadow: 2,
                borderRadius: 3,
                '&:before': { display: 'none' },
                background: '#fff',
                overflow: 'visible'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                aria-controls={`section-content-${sectionId}`}
                id={`section-header-${sectionId}`}
                sx={{
                    bgcolor: '#eab31a',
                    color: 'white',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    fontWeight: 'bold',
                    fontSize: 18,
                    minHeight: 56,
                    '& .MuiAccordionSummary-content': { my: 0, alignItems: 'center' },
                    boxShadow: 'none',
                }}
            >
                {editable ? (
                    <TextField
                        autoFocus
                        label="Section Name"
                        fullWidth
                        variant="standard"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        onBlur={toggleEditable}
                        InputProps={{
                            disableUnderline: true,
                            style: {
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 18,
                                background: 'transparent'
                            }
                        }}
                        InputLabelProps={{
                            style: { color: '#fff8e1' }
                        }}
                    />
                ) : sectionName}
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#fff', borderRadius: 3, pt: 0, mb: 2, mx:2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 0,
                        borderRadius: 2,
                        mb: 2,
                        boxShadow: 'none',
                        bgcolor: 'transparent'
                    }}
                >
                    {/* Only render the category card if a category exists */}
                    {sectionCategory && (
                        <Paper
                            elevation={0}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: '#f6f6f6',
                                borderRadius: 2,
                                borderLeft: '8px solid #eab31a',
                                px: 3,
                                pt: 2,
                                pb: 2,
                                mt: 2,
                                mb: 4,
                                mx: 2
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#222',
                                    mb: 2
                                }}
                            >
                                {sectionCategory}
                            </Typography>
                            <Box
                                sx={{
                                    borderBottom: "2px solid #ccc",
                                    width: "100%",
                                    mt: 1
                                }}
                            />
                        </Paper>
                    )}

                    {/* Render collapsible subcategories */}
                    {sectionCategory && subcategories.map((subcategory) => (
                        <Accordion
                            key={subcategory.id}
                            expanded={expandedSubcategory === subcategory.id}
                            onChange={handleSubcategoryToggle(subcategory.id)}
                            sx={{
                                mb: 2,
                                boxShadow: 2,
                                borderRadius: 2,
                                background: "#f6f6f6",
                                '&:before': { display: 'none' },
                                mx: 2
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    minHeight: 56,
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    px: 3,
                                    py: 0,
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                        {subcategory.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#555" }}>
                                        Response Type: {getSubcategoryTypeDisplay(subcategory.subcategory_type)}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 2 }}>
                                <PerformanceEvaluationRating subcategory={subcategory} />
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Box sx={{ textAlign: 'center', mt: sectionCategory ? 0 : 3 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#177604',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: 1,
                                px: 4,
                                py: 1.5,
                                boxShadow: '0 2px 4px 0 rgba(0,0,0,0.08)',
                                letterSpacing: 1,
                                '&:hover': { bgcolor: '#0d5c27' }
                            }}
                            onClick={sectionCategory ? handleOpenAddPerformanceEvaluationAddSubcategory : handleOpenAddCategoryModal}
                        >
                            {sectionCategory ? <>ADD SUB-CATEGORY</> : <>ADD CATEGORY</>}
                        </Button>
                    </Box>
                </Paper>
            </AccordionDetails>
            <PerformanceEvaluationFormAddCategory
                open={addCategoryOpen}
                onClose={handleCloseAddCategoryModal}
                onSave={handleSaveCategory}
            />
            <PerformanceEvaluationAddSubcategory
                open={addSubcategoryOpen}
                onClose={handleCloseAddPerformanceEvaluationAddSubcategory}
                onSave={handleSaveSubcategory}
            />
        </Accordion>
    );
};

export default PerformanceEvaluationFormSection;