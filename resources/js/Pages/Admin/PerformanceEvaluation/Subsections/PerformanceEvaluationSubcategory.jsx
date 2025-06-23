import AddIcon from '@mui/icons-material/Add';
import { AddRounded } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    ButtonBase,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import { createContext, useContext, useRef, useState } from 'react';
import { DragHandleRounded } from '@mui/icons-material';
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
import { useClickAway } from '../../../../hooks/useClickAway';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useEvaluationFormSubcategory } from '../../../../hooks/useEvaluationFormSubcategory';

const RESPONSE_TYPE_OPTIONS = [
    { value: "linear_scale", label: "Linear Scale", icon: <LinearScaleIcon sx={{ mr: 2 }} /> },
    { value: "multiple_choice", label: "Multiple Choice", icon: <RadioButtonCheckedIcon sx={{ mr: 2 }} /> },
    { value: "checkbox", label: "Checkbox", icon: <CheckBoxIcon sx={{ mr: 2 }} /> },
    { value: "short_answer", label: "Short Text", icon: <ShortTextIcon sx={{ mr: 2 }} /> },
    { value: "long_answer", label: "Long Text", icon: <TextFieldsIcon sx={{ mr: 2 }} /> }
];

const SubcategoryContext = createContext();

export default function PerformanceEvaluationFormSubcategory({
    subcategory: subcategoryInit, draggedId, expandedSubcategoryId, setExpandedSubcategoryId
}) {
    const {
        subcategory, subcategoryId,
        editSubcategory,
        responseType, responseTypeDisplay, switchResponseType,
        subcategoryName, setSubcategoryName,
        subcategoryDescription, setSubcategoryDescription,
        options, draggedOptionId, deleteOption, editOption, moveOption,
        reloadOptions, saveOption, setDraggedOptionId,
    } = useEvaluationFormSubcategory(subcategoryInit);

    return <SubcategoryContext.Provider value={{
        options, draggedOptionId,
        deleteOption, editOption, moveOption, reloadOptions, saveOption, setDraggedOptionId
    }}>
        <Accordion
            expanded={ expandedSubcategoryId === subcategoryId }
            onChange={ () => setExpandedSubcategoryId(subcategoryId) }
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
                        Response Type: { responseTypeDisplay }
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 2 }}>
                <Box sx={{ width: "100%" }}>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={6} sx={{ width: '100%', maxWidth: '528px' }}>
                            <TextField
                                label="Sub-Category Name"
                                variant="outlined"
                                fullWidth
                                value={subcategoryName || ""}
                                onChange={e => setSubcategoryName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={6} sx={{ width: '100%', maxWidth: '235px' }}>
                            <FormControl fullWidth>
                                <InputLabel>Response Type</InputLabel>
                                <Select
                                    value={responseType || ""}
                                    onChange={e => switchResponseType(e.target.value)}
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
                            variant="outlined"  // here
                            fullWidth
                            multiline
                            rows={3}
                            value={subcategoryDescription || ""}
                            onChange={e => setSubcategoryDescription(e.target.value)}
                            required
                        />
                    </Box>
                    {(responseType === 'multipleChoice' || responseType === 'checkbox') && (
                        <OptionsEditor/>
                    )}
                    {/* {subcategoryDraft.subcategory_type === 'linear_scale' && (
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
                                minWidth: 500,
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
                    )} */}
                    <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
                        <Box>
                            <Button
                            onClick={() => {}}
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
                            onClick={(e) => {e.stopPropagation()}}
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
                            onClick={editSubcategory}
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
            </AccordionDetails>
        </Accordion>
    </SubcategoryContext.Provider>;
}

function OptionsEditor() {
    const {
        options, draggedOptionId,
        deleteOption, editOption, moveOption, reloadOptions, saveOption, setDraggedOptionId
    } = useContext(SubcategoryContext);
    const optionSensors = useSensors(
        useSensor(OptionTouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(OptionMouseSensor, { activationConstraint: { distance: 10 } })
    );

    const handleAddOption = () => {
        saveOption();
    }
    const handleChangeDescription = (option, e) => {
        editOption(option, { description: e.target.value });
    }
    const handleChangeLabel = (option, e) => {
        editOption(option, { label: e.target.value });
    }
    const handleChangeScore = (option, e) => {
        editOption(option, { score: e.target.value });
    }
    const handleOptionDragStart = (event) => {
        setDraggedOptionId(event.active?.id ?? null);
    };
    const handleOptionDragEnd = (event) => {
        setDraggedOptionId(null);
        if(!event.active || !event.over) return;
        moveOption(
            event.active.data.current.order,
            event.over.data.current.order
        );
    }

    return <>
        <Box sx={{ mb: 2 }}>
            <DndContext
                sensors={ optionSensors }
                collisionDetection={ closestCenter }
                onDragStart={ handleOptionDragStart }
                onDragEnd={ handleOptionDragEnd }
                modifiers={ [restrictToFirstScrollableAncestor, restrictToVerticalAxis] }
            ><SortableContext items={ options.map(option=>({ ...option, id: 'option_'+option.id })) } strategy={ verticalListSortingStrategy }>
                <Box sx={{ mt: 2, overflow: 'auto' }}>
                    {options.map((option) => (
                        (option.action != 'delete') && <Sortable key={option.id} id={'option_'+option.id} order={option.order}>
                            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
                                <Grid className='option-dragger' item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'move', width: '5%' }}>
                                    <Typography variant="body1"><DragHandleRounded sx={{color: 'gray'}}/></Typography>
                                </Grid>
                                <Grid item xs={7} sx={{width: '20%'}}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        value={option.label}
                                        onChange={e => handleChangeLabel(option, e)}
                                    />
                                </Grid>
                                <Grid item xs={2} sx={{width: '10%'}}>
                                    <TextField
                                        variant="outlined"
                                        placeholder="Score"
                                        value={option.score ?? ""}
                                        type="number"
                                        onChange={e => handleChangeScore(option, e)}
                                        inputProps={{ min: 0, step: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={4} sx={{width: '50%'}}>
                                    <TextField
                                        variant="outlined"
                                        label="Description"
                                        placeholder="Why this score?"
                                        value={option.description || ""}
                                        onChange={e => handleChangeDescription(option, e)}
                                        fullWidth
                                        inputProps={{
                                            maxLength: 250,
                                            style: {
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={2} sx={{width: '5%'}}>
                                    <IconButton
                                        onClick={() => deleteOption(option)}
                                        sx={{ color: 'gray' }}
                                    ><CloseIcon/></IconButton>
                                </Grid>
                            </Grid>
                        </Sortable>
                    ))}
                </Box>
            </SortableContext></DndContext>
            <ButtonBase
                onClick={() => console.log(options)}
                sx={{
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '8px',
                }}
            >
                <AddRounded/>Log
            </ButtonBase>
            <ButtonBase
                onClick={handleAddOption}
                sx={{
                    color: '#000000',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '8px',
                }}
            >
                <AddRounded/>Add Option
            </ButtonBase>
        </Box>
    </>;
}
