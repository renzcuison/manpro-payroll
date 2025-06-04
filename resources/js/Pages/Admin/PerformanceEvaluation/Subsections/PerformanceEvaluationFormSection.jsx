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
import PerformanceEvaluationFormAddSubcategory from '../Modals/PerformanceEvaluationFormAddSubcategory';
import Swal from 'sweetalert2';
import { useClickHandler } from '../../../../hooks/useClickHandler';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useRef, useState } from 'react';

const PerformanceEvaluationFormSection = ({ section }) => {
    const {
        sectionId,
        sectionName, setSectionName,
        editableSectionName, toggleEditableSection,
        sectionCategory, setSectionCategory,
        editableCategory, toggleEditableCategory,
        expanded, toggleExpand,
        order,
        subcategories, saveSubcategory,
        editSection
    } = useEvaluationFormSection(section);

    const inputRef = useRef(null);

    // Section header click (single: expand/collapse, double: edit)
    const onSectionClick = useClickHandler({
        onSingleClick: () => toggleExpand(),
        onDoubleClick: toggleEditableSection
    });

    // Category modal state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const handleOpenAddCategoryModal = () => setAddCategoryOpen(true);
    const handleCloseAddCategoryModal = () => setAddCategoryOpen(false);

    // Subcategory modal state
    const [addSubcategoryOpen, setAddSubcategoryOpen] = useState(false);
    const handleOpenAddSubcategoryModal = () => setAddSubcategoryOpen(true);
    const handleCloseAddSubcategoryModal = () => setAddSubcategoryOpen(false);

    // Save handlers for inline editing
    const handleSaveSectionName = (newName) => {
        if (!newName?.trim()) {
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        editSection({ name: newName }, inputRef).then((response) => {
            if (response?.data?.status?.toString().startsWith("2")) {
                toggleEditableSection();
            }
        });
    };

    const handleSaveCategoryName = (newCategory) => {
        if (!newCategory?.trim()) {
            Swal.fire({
                text: "Category Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        editSection({ category: newCategory }, inputRef).then((response) => {
            if (response?.data?.status?.toString().startsWith("2")) {
                toggleEditableCategory();
            }
        });
    };

    // Save category from modal
    const handleSaveCategory = (categoryValue) => {
        if (!sectionId || !categoryValue?.trim()) {
            Swal.fire({
                text: "Category Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        editSection({ category: categoryValue });
    };

    // Save subcategory from modal
    const handleSaveSubcategory = (subcategory) => {
        if (!subcategory?.name?.trim()) {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        saveSubcategory(subcategory);
    };

    // Collapsible subcategory state
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    const handleSubcategoryToggle = (id) => (event, isExpanded) => {
        setExpandedSubcategory(isExpanded ? id : null);
    };

    // Display for subcategory type
    const getSubcategoryTypeDisplay = (type) => {
        const map = {
            short_answer: "Short Text",
            long_answer: "Long Text",
            checkbox: "Checkbox",
            linear_scale: "Linear Scale",
            multiple_choice: "Multiple Choice",
            rating: "Rating",
            comment: "Comment",
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
                overflow: "hidden",
                bgcolor: 'transparent',
                border: 'none',
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
                    borderBottomLeftRadius: expanded ? 0 : 12,
                    borderBottomRightRadius: expanded ? 0 : 12,
                    fontWeight: 'bold',
                    fontSize: 18,
                    minHeight: 56,
                    '& .MuiAccordionSummary-content': { my: 0, alignItems: 'center' },
                    boxShadow: 'none',
                    px: 3,
                }}
            >
                {editableSectionName ? (
                    <TextField
                        autoFocus
                        label="Section Name"
                        fullWidth
                        variant="standard"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        onBlur={(e) => handleSaveSectionName(e.target.value)}
                        ref={inputRef}
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
                        required
                    />
                ) : (
                    <Box
                        sx={{
                            width: "100%",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: 20,
                            color: 'white',
                        }}
                    >
                        {sectionName}
                    </Box>
                )}
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#fff', mb: 2, mx: 2 , borderTop: 'none', borderRadius: '0 0 20px 20px', p: 3, pt: 4}}>
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
                    {/* CATEGORY */}
                    {sectionCategory ? (
                        editableCategory ? (
                            <TextField
                                autoFocus
                                label="Category"
                                fullWidth
                                variant="standard"
                                value={sectionCategory}
                                onChange={(e) => setSectionCategory(e.target.value)}
                                onBlur={(e) => handleSaveCategoryName(e.target.value)}
                                ref={inputRef}
                                InputProps={{
                                    disableUnderline: true,
                                    style: {
                                        color: '#222',
                                        fontWeight: 'bold',
                                        fontSize: 20,
                                        background: '#f6f6f6'
                                    }
                                }}
                                InputLabelProps={{
                                    style: { color: '#eab31a' }
                                }}
                                sx={{ mb: 2, mx: 2, mt: 2}}
                                required
                            />
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: '#f3f3f3',
                                    borderRadius: 2,
                                    borderLeft: '8px solid #eab31a',
                                    px: 2,
                                    pt: 2,
                                    pb: 2,
                                    mt: 2,
                                    mb: 2,
                                    mx: 2,
                                    cursor: "pointer",
                                    boxShadow: 2
                                }}
                                onDoubleClick={toggleEditableCategory}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: '#222'
                                    }}
                                >
                                    {sectionCategory}
                                </Typography>
                            </Paper>
                        )
                    ) : (
                        <Box sx={{ textAlign: "center", mt: 3, color: "#aaa", fontStyle: "italic", mb: 2 }}>
                            No category yet.
                        </Box>
                    )}

                    {/* SUBCATEGORIES */}
                    {sectionCategory && subcategories.map((subcategory) => (
                        <Accordion
                            key={subcategory.id}
                            expanded={expandedSubcategory === subcategory.id}
                            onChange={handleSubcategoryToggle(subcategory.id)}
                            sx={{
                                mb: 2,
                                boxShadow: 2,
                                borderRadius: 2,
                                background: "#f3f3f3",
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

                    {/* BUTTONS */}
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
                            onClick={sectionCategory ? handleOpenAddSubcategoryModal : handleOpenAddCategoryModal}
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
            <PerformanceEvaluationFormAddSubcategory
                open={addSubcategoryOpen}
                onClose={handleCloseAddSubcategoryModal}
                onSave={handleSaveSubcategory}
            />
        </Accordion>
        
    );
};

export default PerformanceEvaluationFormSection;
