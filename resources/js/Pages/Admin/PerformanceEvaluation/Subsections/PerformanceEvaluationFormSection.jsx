import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    IconButton
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import {
    DndContext, 
    closestCenter,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import { OptionMouseSensor } from '../Sensors/OptionMouseSensor';
import { OptionTouchSensor } from '../Sensors/OptionTouchSensor';
import PerformanceEvaluationFormAddCategory from '../Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationRating from './PerformanceEvaluationRating';
import PerformanceEvaluationFormAddSubcategory from '../Modals/PerformanceEvaluationFormAddSubcategory';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ShortTextIcon from '@mui/icons-material/ShortText';
import Sortable from './Sortable';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SubcategoryDropdownMouseSensor } from '../Sensors/SubcategoryDropdownMouseSensor';
import { SubcategoryDropdownTouchSensor } from '../Sensors/SubcategoryDropdownTouchSensor';
import Swal from 'sweetalert2';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useClickAway } from '../Test/useClickAway';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useRef, useState } from 'react';

const RESPONSE_TYPE_OPTIONS = [
    { value: "linear_scale", label: "Linear Scale", icon: <LinearScaleIcon sx={{ mr: 2 }} /> },
    { value: "multiple_choice", label: "Multiple Choice", icon: <RadioButtonCheckedIcon sx={{ mr: 2 }} /> },
    { value: "checkbox", label: "Checkbox", icon: <CheckBoxIcon sx={{ mr: 2 }} /> },
    { value: "short_answer", label: "Short Text", icon: <ShortTextIcon sx={{ mr: 2 }} /> },
    { value: "long_answer", label: "Long Text", icon: <TextFieldsIcon sx={{ mr: 2 }} /> }
];

const PerformanceEvaluationFormSection = ({ section, draggedId }) => {
    const {
        sectionId,
        sectionName, setSectionName,
        editableSectionName, toggleEditableSection,
        editSection,
        sectionCategory, setSectionCategory,
        editableCategory, toggleEditableCategory,
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

    // Option moving
    const optionSensors = useSensors(
        useSensor(OptionTouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(OptionMouseSensor, { activationConstraint: { distance: 10 } })
    );
    // here
    const handleOptionDragStart = (event) => {
        setDraggedSubcategoryId(event.active?.id ?? null);
    };
    const handleOptionDragEnd = (event) => {
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
    const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
    const [subcategoryDraft, setSubcategoryDraft] = useState({});
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    const subcategoryInputRef = useRef(null);

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
    const handleSaveSubcategory = (subcategory) => {
        if (!subcategory?.name?.trim()) {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
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

    // Subcategory: show edit UI when expanded
    const handleSubcategoryToggle = (id, subcategory) => (event, isExpanded) => {
        setExpandedSubcategory(isExpanded ? id : null);
        if (isExpanded) {
            setEditingSubcategoryId(id);
            // Clone all values for editing
            setSubcategoryDraft({ ...subcategory });
            setSubcategoryOptions(subcategory.options ? subcategory.options.map(opt => ({ ...opt })) : []);
        } else {
            setEditingSubcategoryId(null);
            setSubcategoryDraft({});
            setSubcategoryOptions([]);
        }
    };

    // Option editing
    const handleOptionChange = (index, event) => {
        const newOptions = [...subcategoryOptions];
        newOptions[index].label = event.target.value;
        setSubcategoryOptions(newOptions);
    };

    const handleAddOption = () => {
        setSubcategoryOptions([...subcategoryOptions, { label: "", extra: "", description: "" }]);
    };

    const handleRemoveOption = (index) => {
        const newOptions = [...subcategoryOptions];
        newOptions.splice(index, 1);
        setSubcategoryOptions(newOptions);
    };

    const handleOptionExtraChange = (index, event) => {
        const newOptions = [...subcategoryOptions];
        newOptions[index].extra = event.target.value;
        setSubcategoryOptions(newOptions);
    };

    const handleSaveEditSubcategory = () => {
        // Ensure the subcategory name is not empty
        if (!subcategoryDraft.name?.trim()) {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }

        // Validate for linear scale fields if needed
        if (subcategoryDraft.subcategory_type === "linear_scale") {
            if (
                subcategoryDraft.linear_scale_start == null ||
                subcategoryDraft.linear_scale_end == null ||
                subcategoryDraft.linear_scale_start_label?.trim() === "" ||
                subcategoryDraft.linear_scale_end_label?.trim() === ""
            ) {
                Swal.fire({
                    text: "All linear scale fields are required!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }
            if (+subcategoryDraft.linear_scale_start >= +subcategoryDraft.linear_scale_end) {
                Swal.fire({
                    text: "Linear Scale Start must be less than End!",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
                return;
            }
        }

        // If it's an existing subcategory (has an ID), update it
        if (subcategoryDraft.id) {
        let updatedSubcategory = { ...subcategoryDraft };

        if (
            subcategoryDraft.subcategory_type === "multiple_choice" ||
            subcategoryDraft.subcategory_type === "checkbox"
        ) {
            updatedSubcategory.options = subcategoryOptions;
        } else if (subcategoryDraft.subcategory_type === "linear_scale") {
            updatedSubcategory.options = subcategoryOptions.map((opt, idx) => ({
                label: opt.label,
                description: opt.description,
                score: idx + 1,
                order: idx + 1
            }));
        }

        saveSubcategory(updatedSubcategory, "update");
    } else {
        saveSubcategory(subcategoryDraft, "create");
    }

        // Clear the form after saving
        setEditingSubcategoryId(null);
        setSubcategoryDraft({});
        setSubcategoryOptions([]);
        setExpandedSubcategory(null);
    };


    const handleCancelEditSubcategory = () => {
        setEditingSubcategoryId(null);
        setSubcategoryDraft({});
        setSubcategoryOptions([]);
        setExpandedSubcategory(null);
    };

    return <>
        <Accordion
            expanded={expanded}
            onChange={toggleExpand}
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
                className='section-dropdown'
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
                                        <Accordion
                                            expanded={expandedSubcategory === subcategory.id}
                                            onChange={handleSubcategoryToggle(subcategory.id, subcategory)}
                                            sx={{
                                                my: 2,
                                                boxShadow: 2,
                                                borderRadius: 2,
                                                background: "#f3f3f3",
                                                '&:before': { display: 'none' },
                                                mx: 2
                                            }}
                                        >
                                            <AccordionSummary
                                                className='subcategory-dropdown'
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{
                                                    cursor: draggedSubcategoryId ? 'move!important' : undefined,
                                                    minHeight: 56,
                                                    borderRadius: 2,
                                                    boxShadow: 'none',
                                                    px: 3,
                                                    py: 0,
                                                }}
                                            >
                                                <Box sx={{ width: "100%" }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{ fontWeight: "bold" }}
                                                    >
                                                        {subcategory.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "#555" }}>
                                                        Response Type: {getSubcategoryTypeDisplay(subcategory.subcategory_type)}
                                                    </Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ px: 3, pb: 2 }}>
                                                {expandedSubcategory === subcategory.id ? (
                                                    <Box sx={{ width: "100%" }}>
                                                        <Grid container spacing={3} sx={{ mb: 3 }}>
                                                            <Grid item xs={6} sx={{ width: '100%', maxWidth: '528px' }}>
                                                                <TextField
                                                                    label="Sub-Category Name"
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={subcategoryDraft.name || ""}
                                                                    onChange={e => setSubcategoryDraft(d => ({ ...d, name: e.target.value }))}
                                                                    required
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6} sx={{ width: '100%', maxWidth: '235px' }}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Response Type</InputLabel>
                                                                    <Select
                                                                        value={subcategoryDraft.subcategory_type || ""}
                                                                        onChange={e => setSubcategoryDraft(d => ({ ...d, subcategory_type: e.target.value }))}
                                                                        label="Response Type"
                                                                        required
                                                                    >
                                                                        {RESPONSE_TYPE_OPTIONS.map(opt => (
                                                                            <MenuItem key={opt.value} value={opt.value}>
                                                                                {opt.icon}{opt.label}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                        </Grid>
                                                        <Box sx={{ mb: 2, width: '100%', maxWidth: '935px' }}>
                                                            <TextField
                                                                label="Description"
                                                                variant="outlined"
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                value={subcategoryDraft.description || ""}
                                                                onChange={e => setSubcategoryDraft(d => ({ ...d, description: e.target.value }))}
                                                                required
                                                            />
                                                        </Box>
                                                        {(subcategoryDraft.subcategory_type === 'multiple_choice' || subcategoryDraft.subcategory_type === 'checkbox') && (
                                                            <Box sx={{ mb: 2 }}>
                                                                <DndContext
                                                                    sensors={ optionSensors }
                                                                    collisionDetection={ closestCenter }
                                                                    onDragStart={ handleOptionDragStart }
                                                                    onDragEnd={ handleOptionDragEnd }
                                                                    modifiers={ [restrictToFirstScrollableAncestor, restrictToVerticalAxis] }
                                                                ><SortableContext items={ subcategoryOptions.map(option=>({ ...option, id: 'option_'+option.id })) } strategy={ verticalListSortingStrategy }>
                                                                    <Box sx={{ mt: 2, overflow: 'auto' }}>
                                                                        {subcategoryOptions.map((option) => (
                                                                            <Sortable key={option.id} id={'option_'+option.id} order={option.order}>
                                                                                <Grid container spacing={2} key={option.order} sx={{ mb: 2 }} alignItems="center">
                                                                                    <Grid className='option-dragger' item xs={1} sx={{ display: 'flex', alignItems: 'center', cursor: 'move' }}>
                                                                                        <Typography variant="body1" sx={{ color: 'gray' }}>═</Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={7}>
                                                                                        <TextField
                                                                                            variant="outlined"
                                                                                            fullWidth
                                                                                            value={option.label}
                                                                                            onChange={e => handleOptionChange(option.order - 1, e)}
                                                                                        />
                                                                                    </Grid>
                                                                                    <Grid item xs={2}>
                                                                                        <TextField
                                                                                            variant="outlined"
                                                                                            placeholder="Score"
                                                                                            value={option.score ?? ""}
                                                                                            type="number"
                                                                                            onChange={e => {
                                                                                                const newOptions = [...subcategoryOptions];
                                                                                                newOptions[option.order - 1].score = Number(e.target.value);
                                                                                                setSubcategoryOptions(newOptions);
                                                                                            }}
                                                                                            sx={{ width: 80 }}
                                                                                            inputProps={{ min: 0, step: 1 }}
                                                                                        />
                                                                                    </Grid>
                                                                                    <Grid item xs={4}>
                                                                                        <TextField
                                                                                            variant="outlined"
                                                                                            label="Description"
                                                                                            placeholder="Why this score?"
                                                                                            value={option.description || ""}
                                                                                            onChange={e => {
                                                                                                const newOptions = [...subcategoryOptions];
                                                                                                newOptions[option.order - 1].description = e.target.value;
                                                                                                setSubcategoryOptions(newOptions);
                                                                                            }}
                                                                                            fullWidth
                                                                                            inputProps={{
                                                                                            maxLength: 250,
                                                                                            style: {
                                                                                                whiteSpace: 'nowrap',
                                                                                                overflow: 'hidden',
                                                                                                textOverflow: 'ellipsis'
                                                                                            }
                                                                                            }}
                                                                                            sx={{
                                                                                            // Ensures description field takes the rest of the row and does not grow vertically
                                                                                            minWidth: 400,
                                                                                            maxWidth: "100%",
                                                                                            }}
                                                                                        />
                                                                                    </Grid>
                                                                                    <Grid item xs={2}>
                                                                                        <IconButton
                                                                                            onClick={() => handleRemoveOption(option.order - 1)}
                                                                                            sx={{ color: 'gray' }}
                                                                                        ><CloseIcon/></IconButton>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Sortable>
                                                                        ))}
                                                                    </Box>
                                                                </SortableContext></DndContext>
                                                                <Typography
                                                                    onClick={handleAddOption}
                                                                    sx={{
                                                                        color: '#000000',
                                                                        fontSize: '14px',
                                                                        cursor: 'pointer',
                                                                        marginTop: '8px',
                                                                    }}
                                                                >
                                                                    + Add Option
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {subcategoryDraft.subcategory_type === 'linear_scale' && (
                                                        <Box sx={{ mb: 2 }}>
                                                            {Array.isArray(subcategoryOptions) && subcategoryOptions.map((option, idx) => (
                                                            <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 1 }}>
                                                                <Grid item xs={1}>
                                                                <Typography variant="body1">{idx + 1}.</Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                <TextField
                                                                    variant="outlined"
                                                                    label="Label"
                                                                    value={option.label}
                                                                    onChange={e => {
                                                                    const newOptions = [...subcategoryOptions];
                                                                    newOptions[idx].label = e.target.value;
                                                                    setSubcategoryOptions(newOptions);
                                                                    }}
                                                                    fullWidth
                                                                />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                <TextField
                                                                    variant="outlined"
                                                                    label="Description (optional)"
                                                                    value={option.description}
                                                                    onChange={e => {
                                                                    const newOptions = [...subcategoryOptions];
                                                                    newOptions[idx].description = e.target.value;
                                                                    setSubcategoryOptions(newOptions);
                                                                    }}
                                                                    fullWidth
                                                                    inputProps={{
                                                                    maxLength: 250,
                                                                    style: {
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }
                                                                    }}
                                                                    sx={{
                                                                    // Ensures description field takes the rest of the row and does not grow vertically
                                                                    minWidth: 562,
                                                                    maxWidth: "100%",
                                                                    }}
                                                                />
                                                                </Grid>
                                                                <Grid item xs={1}>
                                                                {subcategoryOptions.length > 2 && (
                                                                    <IconButton
                                                                    onClick={() => {
                                                                        const newOptions = subcategoryOptions.filter((_, i) => i !== idx);
                                                                        setSubcategoryOptions(newOptions);
                                                                    }}
                                                                    sx={{ color: 'gray' }}
                                                                    >
                                                                    <CloseIcon />
                                                                    </IconButton>
                                                                )}
                                                                </Grid>
                                                            </Grid>
                                                            ))}
                                                            {subcategoryOptions.length < 10 && (
                                                            <Typography
                                                                onClick={() => setSubcategoryOptions([
                                                                ...subcategoryOptions,
                                                                { label: '', description: '' }
                                                                ])}
                                                                sx={{
                                                                color: '#000000',
                                                                fontSize: '14px',
                                                                cursor: 'pointer',
                                                                marginTop: '8px',
                                                                }}
                                                            >
                                                                {subcategoryOptions.length + 1}. Add Option
                                                            </Typography>
                                                            )}
                                                        </Box>
                                                        )}
                                                        <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
                                                            <Box>
                                                                <Button
                                                                onClick={handleCancelEditSubcategory}
                                                                variant="contained"
                                                                sx={{
                                                                    backgroundColor: '#727F91',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '120px',
                                                                    height: '35px',
                                                                    fontSize: '14px',
                                                                }}
                                                                startIcon={
                                                                    <CloseIcon sx={{
                                                                        fontSize: '1rem',
                                                                        fontWeight: 'bold',
                                                                        stroke: 'white',
                                                                        strokeWidth: 2,
                                                                        fill: 'none'
                                                                    }} />
                                                                }
                                                            >
                                                                Cancel
                                                            </Button>
                                                            </Box>
                                                            
                                                            <Box justifyContent="flex-end" display="flex" gap={1}>
                                                                <Button
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    deleteSubcategory(subcategory.id);
                                                                }}
                                                                variant="contained"
                                                                sx={{
                                                                    backgroundColor: '#727F91',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '120px',
                                                                    height: '35px',
                                                                    fontSize: '14px',
                                                                }}
                                                                startIcon={
                                                                    <CloseIcon sx={{
                                                                        fontSize: '1rem',
                                                                        fontWeight: 'bold',
                                                                        stroke: 'white',
                                                                        strokeWidth: 2,
                                                                        fill: 'none'
                                                                    }} />
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                            
                                                            <Button
                                                                onClick={handleSaveEditSubcategory}
                                                                variant="contained"
                                                                sx={{
                                                                    backgroundColor: '#177604',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '120px',
                                                                    height: '35px',
                                                                    fontSize: '14px',
                                                                }}
                                                                startIcon={
                                                                    <AddIcon sx={{
                                                                        fontSize: '1rem',
                                                                        fontWeight: 'bold',
                                                                        stroke: 'white',
                                                                        strokeWidth: 2,
                                                                        fill: 'none'
                                                                    }} />
                                                                }
                                                            >
                                                                Save
                                                            </Button>
                                                            </Box>
                                                            
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <PerformanceEvaluationRating subcategory={subcategory} />
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    </Sortable>
                                )
                            }
                        </Box>
                    </SortableContext></DndContext>

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