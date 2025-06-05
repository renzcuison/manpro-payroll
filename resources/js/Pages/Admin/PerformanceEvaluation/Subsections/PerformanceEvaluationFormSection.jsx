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

const PerformanceEvaluationFormSection = ({ section, draggedId }) => {
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
    const sectionNameWrapperRef = useRef(null);

    // Section header click (single: expand/collapse, double: edit)
    const onSectionClick = useClickHandler({
        onSingleClick: () => toggleExpand(),
        onDoubleClick: toggleEditableSection
    });

    // Category modal state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const handleOpenAddCategoryModal = () => setAddCategoryOpen(true);
    const handleCloseAddCategoryModal = () => setAddCategoryOpen(false);
    const [editingCategory, setEditingCategory] = useState(false);
    const categoryInputRef = useRef(null);
    const [categoryDraft, setCategoryDraft] = useState(sectionCategory ?? ""); // For local draft while editing

    // Subcategory modal state
    const [addSubcategoryOpen, setAddSubcategoryOpen] = useState(false);
    const handleOpenAddSubcategoryModal = () => setAddSubcategoryOpen(true);
    const handleCloseAddSubcategoryModal = () => setAddSubcategoryOpen(false);
    const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
    const subcategoryInputRef = useRef(null);

<<<<<<< HEAD
    function handleExitEditMode() {
        if (sectionName?.trim()) {
            toggleEditableSection();
        } else {
            // Show error and refocus if empty
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            }).then(() => {
                if (inputRef.current) inputRef.current.focus();
            });
        }
    }
    // Save handlers for inline editing
    const handleSaveSectionName = (event) => {
        const sectionName = event.target.value.trim();
        setSectionName(sectionName)
        if (!sectionName) {
>>>>>>> Gian-Development
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
<<<<<<< HEAD
    }

    // Only activate click away handler when in edit mode
    useClickAway(inputRef, () => {
        if (editableSectionName) {
            if (sectionName?.trim()) {
                toggleEditableSection(); // exit edit mode if valid
            } else {
                Swal.fire({
                    text: "Section Name is required!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                }).then(() => {
                    setTimeout(() => {
                        if (inputRef.current) inputRef.current.focus();
                    }, 0);
                });
            }
        }
    });

    useClickAway(categoryInputRef, () => {
        if (!editingCategory) return;
        if (categoryDraft.trim()) {
            // Optionally, save to server here
            setEditingCategory(false);
            setSectionCategory(categoryDraft);
            editSection({ category: categoryDraft });
        } else {
            Swal.fire({
                text: "Category Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            }).then(() => {
                setTimeout(() => {
                    if (categoryInputRef.current) categoryInputRef.current.focus();
                }, 0);
            });
        }
    });

    // Save handlers for inline editing
    const handleSaveSectionName = (event) => {
        const sectionName = event.target.value.trim();
        setSectionName(sectionName)
        if (!sectionName) {
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        editSection({ name: sectionName }, inputRef).then((response) => {
            if (response?.data?.status?.toString().startsWith("2")) {
                toggleEditableSection();
            }
=======
        editSection({ name: sectionName }, inputRef).then((response) => {
            if (response?.data?.status?.toString().startsWith("2")) {
                toggleEditableSection();
            }
>>>>>>> Gian-Development
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
        // Additional validation for linear scale fields
        if (subcategory.subcategory_type === "linear_scale") {
            if (
                subcategory.linear_scale_start == null ||
                subcategory.linear_scale_end == null ||
                isNaN(subcategory.linear_scale_start) ||
                isNaN(subcategory.linear_scale_end)
            ) {
                Swal.fire({
                    text: "Linear Scale Start and End values are required and must be numbers!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }
            if (subcategory.linear_scale_start >= subcategory.linear_scale_end) {
                Swal.fire({
                    text: "Linear Scale Start must be less than End!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }
            if (!subcategory.linear_scale_start_label?.trim()) {
                Swal.fire({
                    text: "Linear Scale Start Label is required!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }
            if (!subcategory.linear_scale_end_label?.trim()) {
                Swal.fire({
                    text: "Linear Scale End Label is required!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }
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

    useClickAway(subcategoryInputRef, () => {
    if (editingSubcategoryId !== null) {
        const sub = subcategories.find(s => s.id === editingSubcategoryId);
        if (sub && sub.name.trim()) {
            setEditingSubcategoryId(null);
        } else {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            }).then(() => {
                setTimeout(() => {
                    if (subcategoryInputRef.current) subcategoryInputRef.current.focus();
                }, 0);
            });
        }
    }
});

    useClickAway(subcategoryInputRef, () => {
    if (editingSubcategoryId !== null) {
        const sub = subcategories.find(s => s.id === editingSubcategoryId);
        if (sub && sub.name.trim()) {
            setEditingSubcategoryId(null);
        } else {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            }).then(() => {
                setTimeout(() => {
                    if (subcategoryInputRef.current) subcategoryInputRef.current.focus();
                }, 0);
            });
        }
    }
});

    return <>
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
                    position: 'relative',
                    width: '100%',
                    bgcolor: '#eab31a!important',
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
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: 'inline-block',
                        maxWidth: (sectionNameWrapperRef.current?.parentElement.offsetWidth ?? 0)+`px`,
                        position: 'relative',
                        cursor: draggedId ? 'move' : 'pointer',
                        fontWeight: "bold",
                        fontSize: 20,
                        color: 'white'
                    }}
                    ref={ sectionNameWrapperRef }
                >
                    <Typography
                        sx={{
                            maxWidth: '100%',
                            fontSize: 20,
                            fontWeight: "bold",
                            letterSpacing: '0.5px',
                            padding: '4px 0 5px',
                            visibility: 'hidden',
                            whiteSpace: 'nowrap'
                        }}
                    >{ sectionName.replaceAll(' ', `\u00A0`) }</Typography>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={sectionName}
                        onChange={ (e) => setSectionName(e.target.value) }
                        onClick={ (e) => e.stopPropagation() }
                        onBlur={ handleSaveSectionName }
                        onKeyUp={ (e) => e.preventDefault() }
                        ref={inputRef}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(calc(-50% - 1px))',
                            overflow: 'hidden'
                        }}
                        InputProps={{
                            disableUnderline: true,
                            style: {
                                color: 'white',
                                fontSize: 20,
                                fontWeight: "bold",
                                
                                letterSpacing: '0.5px'
                            }
                        }}
                        required
                    />
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{
                bgcolor: '#fff',
                borderRadius: '0 0 20px 20px',
                mb: 2,
                mx: 2,
                borderTop: 'none',
                p: 3,
                pt: 4
            }}>
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
                        editingCategory ? (
                            <TextField
                            inputRef={categoryInputRef}
                            autoFocus
                            label="Category"
                            fullWidth
                            variant="standard"
                            value={categoryDraft}
                            onChange={e => setCategoryDraft(e.target.value)}
                            // REMOVE onBlur!
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
                            sx={{ mb: 2, mx: 2, mt: 2 }}
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
                            onDoubleClick={() => {
                                setEditingCategory(true);
                                setCategoryDraft(sectionCategory);
                            }}
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
                            <Box sx={{ width: "100%" }}>
                                {editingSubcategoryId === subcategory.id ? (
                                    <TextField
                                        inputRef={subcategoryInputRef}
                                        autoFocus
                                        value={subcategory.name}
                                        onChange={e => {
                                            // Update local state or, if from props, use a local editing value array
                                            // Example: setSubcategories(prev => prev.map(s => s.id === subcategory.id ? {...s, name: e.target.value} : s));
                                            // Or call a handler, e.g. handleChangeSubcategoryName(subcategory.id, e.target.value)
                                        }}
                                        // REMOVE onBlur!
                                        variant="standard"
                                        fullWidth
                                        required
                                        InputProps={{
                                            style: { fontWeight: "bold", fontSize: 16 }
                                        }}
                                    />
                                ) : (
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: "bold", cursor: "pointer" }}
                                        onDoubleClick={() => setEditingSubcategoryId(subcategory.id)}
                                    >
                                        {subcategory.name}
                                    </Typography>
                                )}
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
        </Accordion>
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
    </>;
};

export default PerformanceEvaluationFormSection;