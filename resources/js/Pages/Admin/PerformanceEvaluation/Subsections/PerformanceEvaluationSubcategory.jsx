import AddIcon from '@mui/icons-material/Add';
import { AddRounded } from '@mui/icons-material';
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
    IconButton,
    ButtonBase
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
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
import PerformanceEvaluationMultipleChoiceEditor from './PerformanceEvaluationMultipleChoiceEditor';
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
import { useRef, useState } from 'react';

export default function PerformanceEvaluationFormSubcategory({ subcategory, draggedId }) {
    const {
        expanded, subcategory, options, subcategoryTypeDisplay,
        toggleExpand
    } = useEvaluationFormSubcategory(subcategory);

    return <>
        <Accordion
            expanded={ expanded }
            onChange={ toggleExpand }
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
                        Response Type: { subcategoryTypeDisplay }
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
                                                        <Typography variant="body1"><DragHandleRounded sx={{color: 'gray'}}/></Typography>
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
                                                            minWidth: 390,
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
                            // <PerformanceEvaluationMultipleChoiceEditor subcategoryOptions={ subcategoryOptions } setSubcategoryOptions={ setSubcategoryOptions }/>
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
    </>;
}
