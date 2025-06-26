import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import {
    closestCenter,
    DndContext,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PerformanceEvaluationFormAddCategory from '../Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationFormSubcategory from './PerformanceEvaluationSubcategory';
import PerformanceEvaluationFormAddSubcategory from '../Modals/PerformanceEvaluationFormAddSubcategory';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Sortable from './Sortable';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SubcategoryDropdownMouseSensor } from '../Sensors/SubcategoryDropdownMouseSensor';
import { SubcategoryDropdownTouchSensor } from '../Sensors/SubcategoryDropdownTouchSensor';
import Swal from 'sweetalert2';
import { useClickAway } from '../../../../hooks/useClickAway';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useRef, useState } from 'react';

const PerformanceEvaluationFormSection = ({ section, draggedId }) => {
    const {
        sectionId,
        sectionName, setSectionName,
        editableSectionName, toggleEditableSection,
        editSection,
        sectionCategory, setSectionCategory,
        expanded, toggleExpand,
        order,
        subcategories, saveSubcategory, deleteSubcategory, moveSubcategory,
        draggedSubcategoryId, setDraggedSubcategoryId
    } = useEvaluationFormSection(section);

    const inputRef = useRef(null);
    const sectionNameWrapperRef = useRef(null);

    // Subcategory moving
    const subcategorySensors = useSensors(
        useSensor(SubcategoryDropdownTouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(SubcategoryDropdownMouseSensor, { activationConstraint: { distance: 10 } })
    );
    const handleSubcategoryDragStart = (event) => {
        setDraggedSubcategoryId(event.active?.id ?? null);
    };
    const handleSubcategoryDragEnd = (event) => {
        setDraggedSubcategoryId(null);
        if(!event.active || !event.over) return;
        moveSubcategory(
            event.active.data.current.order,
            event.over.data.current.order
        );
    }

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

    // Subcategory editing state
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    // const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
    // const [subcategoryDraft, setSubcategoryDraft] = useState({});
    // const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    // const subcategoryInputRef = useRef(null);

    function handleExitEditMode() {
        if (sectionName?.trim()) {
            toggleEditableSection();
        } else {
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            }).then(() => {
                if (inputRef.current) inputRef.current.focus();
            });
        }
    }

    // Only activate click away handler when in edit mode
    useClickAway(inputRef, () => {
        if (editableSectionName) {
            let sectionNameTrimmed = sectionName?.trim();
            if (sectionNameTrimmed) {
                editSection({ name: sectionNameTrimmed });
                toggleEditableSection();
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
    const handleSaveSubcategory = async (subcategory) => {
        if (!subcategory?.name?.trim()) {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        subcategory = await saveSubcategory(subcategory);
        section.subcategories.push(subcategory);
    };
    // here
    const handleDeleteSubcategory = async (subcategoryId) => {
        const subcategories = await deleteSubcategory(subcategoryId);
        section.subcategories = subcategories;
    }

    // const getSubcategoryTypeDisplay = (type) => {
    //     const map = {
    //         short_answer: "Short Text",
    //         long_answer: "Long Text",
    //         checkbox: "Checkbox",
    //         linear_scale: "Linear Scale",
    //         multiple_choice: "Multiple Choice",
    //         rating: "Rating",
    //         comment: "Comment",
    //     };
    //     return map[type] || type;
    // };

    // Subcategory: show edit UI when expanded
    // const handleSubcategoryToggle = (id, subcategory) => (event, isExpanded) => {
    //     setExpandedSubcategory(isExpanded ? id : null);
    //     if (isExpanded) {
    //         setEditingSubcategoryId(id);
    //         // Clone all values for editing
    //         setSubcategoryDraft({ ...subcategory });
    //         setSubcategoryOptions(subcategory.options ? subcategory.options.map(opt => ({ ...opt })) : []);
    //     } else {
    //         setEditingSubcategoryId(null);
    //         setSubcategoryDraft({});
    //         setSubcategoryOptions([]);
    //     }
    // };

    // Option editing
    // const handleOptionChange = (index, event) => {
    //     const newOptions = [...subcategoryOptions];
    //     newOptions[index].label = event.target.value;
    //     setSubcategoryOptions(newOptions);
    // };

    // const handleAddOption = () => {
    //     setSubcategoryOptions([...subcategoryOptions, { label: "", extra: "", description: "" }]);
    // };

    // const handleRemoveOption = (index) => {
    //     const newOptions = [...subcategoryOptions];
    //     newOptions.splice(index, 1);
    //     setSubcategoryOptions(newOptions);
    // };

    // const handleOptionExtraChange = (index, event) => {
    //     const newOptions = [...subcategoryOptions];
    //     newOptions[index].extra = event.target.value;
    //     setSubcategoryOptions(newOptions);
    // };

    // const handleSaveEditSubcategory = () => {
    //     // Ensure the subcategory name is not empty
    //     if (!subcategoryDraft.name?.trim()) {
    //         Swal.fire({
    //             text: "Subcategory Name is required!",
    //             icon: "error",
    //             confirmButtonColor: '#177604',
    //         });
    //         return;
    //     }

    //     // Validate for linear scale fields if needed
    //     if (subcategoryDraft.subcategory_type === "linear_scale") {
    //         if (
    //             subcategoryDraft.linear_scale_start == null ||
    //             subcategoryDraft.linear_scale_end == null ||
    //             subcategoryDraft.linear_scale_start_label?.trim() === "" ||
    //             subcategoryDraft.linear_scale_end_label?.trim() === ""
    //         ) {
    //             Swal.fire({
    //                 text: "All linear scale fields are required!",
    //                 icon: "error",
    //                 confirmButtonColor: '#177604',
    //             });
    //             return;
    //         }
    //         if (+subcategoryDraft.linear_scale_start >= +subcategoryDraft.linear_scale_end) {
    //             Swal.fire({
    //                 text: "Linear Scale Start must be less than End!",
    //                 icon: "error",
    //                 confirmButtonColor: '#177604',
    //             });
    //             return;
    //         }
    //     }

    //     // If it's an existing subcategory (has an ID), update it
    //     if (subcategoryDraft.id) {
    //     let updatedSubcategory = { ...subcategoryDraft };

    //     if (
    //         subcategoryDraft.subcategory_type === "multiple_choice" ||
    //         subcategoryDraft.subcategory_type === "checkbox"
    //     ) {
    //         updatedSubcategory.options = subcategoryOptions;
    //     } else if (subcategoryDraft.subcategory_type === "linear_scale") {
    //         updatedSubcategory.options = subcategoryOptions.map((opt, idx) => ({
    //             label: opt.label,
    //             description: opt.description,
    //             score: idx + 1,
    //             order: idx + 1
    //         }));
    //     }

    //     saveSubcategory(updatedSubcategory, "update");
    // } else {
    //     saveSubcategory(subcategoryDraft, "create");
    // }

    //     // Clear the form after saving
    //     setEditingSubcategoryId(null);
    //     setSubcategoryDraft({});
    //     setSubcategoryOptions([]);
    //     setExpandedSubcategory(null);
    // };


    // const handleCancelEditSubcategory = () => {
    //     setEditingSubcategoryId(null);
    //     setSubcategoryDraft({});
    //     setSubcategoryOptions([]);
    //     setExpandedSubcategory(null);
    // };

    return <>
        <Accordion
            expanded={expanded}
            onChange={toggleExpand}
            sx={{
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
                className='section-dropdown'
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                aria-controls={`section-content-${sectionId}`}
                id={`section-header-${sectionId}`}
                sx={{
                    position: 'relative',
                    mt: 2,
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
                    overflow: 'hidden',
                    cursor: draggedId ? 'move!important' : 'pointer'
                }}
            >
                <Box
                    sx={{
                        display: 'inline-block',
                        maxWidth: (sectionNameWrapperRef.current?.parentElement.offsetWidth ?? 0)+`px`,
                        position: 'relative',
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
                        onBlur={ handleExitEditMode }
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
                    <DndContext
                        sensors={ subcategorySensors }
                        collisionDetection={ closestCenter }
                        onDragStart={ handleSubcategoryDragStart }
                        onDragEnd={ handleSubcategoryDragEnd }
                        modifiers={ [restrictToFirstScrollableAncestor, restrictToVerticalAxis] }
                    ><SortableContext items={ subcategories.map(subcategory=>({ ...subcategory, id: 'subcategory_'+subcategory.id })) } strategy={ verticalListSortingStrategy }>
                        <Box sx={{ mt: 2, overflow: 'auto' }}>
                            {
                                sectionCategory && subcategories.map((subcategory) =>
                                    <Sortable
                                        key={subcategory.id}
                                        id={'subcategory_'+subcategory.id}
                                        order={subcategory.order}
                                    >
                                        <PerformanceEvaluationFormSubcategory
                                            subcategory={ subcategory }
                                            deleteSubcategory={ handleDeleteSubcategory }
                                            draggedId={ draggedSubcategoryId }
                                            expandedSubcategoryId={ expandedSubcategory }
                                            setExpandedSubcategoryId={ setExpandedSubcategory }
                                        />
                                    </Sortable>
                                )
                            }
                        </Box>
                    </SortableContext></DndContext>

                    {/* BUTTONS */}
                    <Box sx={{ textAlign: 'center', mt: sectionCategory ? 3 : 3 }}>
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