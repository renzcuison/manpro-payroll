import AddIcon from '@mui/icons-material/Add';
import { AddRounded } from '@mui/icons-material';
import {
    Box,
    Button,
    ButtonBase,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import {
    closestCenter,
    DndContext,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    createContext,
    useContext
} from 'react';
import { DragHandleRounded } from '@mui/icons-material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import { OptionMouseSensor } from '../Sensors/OptionMouseSensor';
import { OptionTouchSensor } from '../Sensors/OptionTouchSensor';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {
    restrictToFirstScrollableAncestor,
    restrictToVerticalAxis
} from '@dnd-kit/modifiers';
import ShortTextIcon from '@mui/icons-material/ShortText';
import Sortable from '../Subsections/Sortable';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TextFieldsIcon from '@mui/icons-material/TextFields';

import { useEvaluationFormSubcategory } from '../../../../hooks/useEvaluationFormSubcategory';

const SubcategoryContext = createContext();

export default function PerformanceEvaluationFormAddSubcategory({ open, onClose, onSave }) {
    const {
        subcategory, subcategoryId,
        cancelEditSubcategory, editSubcategory,
        subcategoryType, subcategoryTypeDisplay, switchSubcategoryType,
        subcategoryName, setSubcategoryName,
        subcategoryDescription, setSubcategoryDescription,
        resetSubcategory,
        options, draggedOptionId, deleteOption, editOption, moveOption,
        reloadOptions, saveOption, setDraggedOptionId
    } = useEvaluationFormSubcategory();

    const handleSave = () => {
        onSave(subcategory);
        resetSubcategory();
        onClose();
    };
    const handleCancel = () => {
        cancelEditSubcategory();
        onClose();
    }

    return <SubcategoryContext.Provider value={{
        options, draggedOptionId,
        deleteOption, editOption, moveOption, reloadOptions, saveOption, setDraggedOptionId
    }}>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth 
            sx={{
                '& .MuiPaper-root': {
                    width: '1100px', 
                    height: '430px', 
                    px: 4,
                },
            }}
        >
            <DialogTitle sx={{ paddingTop: '50px', paddingBottom:'50px' }}>
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 'bold',
                    }}
                >
                    ADD SUB-CATEGORY
                </Typography>
                <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }}></Box>
            </DialogTitle>
            
            <DialogContent>
                <Grid container spacing={3} sx={{ mb: 3 }} >
                    <Grid item xs={6} sx={{ width: '100%' , maxWidth: '528px' }}>
                        <TextField
                            label="Sub-Category Name"
                            variant="outlined"
                            fullWidth
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={6} sx={{ width: '100%', maxWidth: '235px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Response Type</InputLabel>
                            <Select
                                value={ subcategoryType ?? '' }
                                onChange={(e) => switchSubcategoryType(e.target.value)}
                                label="Response Type"
                                required
                            >
                                <MenuItem value="linear_scale">
                                    <LinearScaleIcon sx={{ mr: 2 }} /> Linear Scale
                                </MenuItem>
                                <MenuItem value="multiple_choice">
                                    <RadioButtonCheckedIcon sx={{ mr: 2 }} /> Multiple Choice
                                </MenuItem>
                                <MenuItem value="checkbox">
                                    <CheckBoxIcon sx={{ mr: 2 }} /> Checkbox
                                </MenuItem>
                                <MenuItem value="short_answer">
                                    <ShortTextIcon sx={{ mr: 2 }} /> Short Text
                                </MenuItem>
                                <MenuItem value="long_answer">
                                    <TextFieldsIcon sx={{ mr: 2 }} /> Long Text
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 2, width:'100%', maxWidth: '935px' }} >
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={subcategoryDescription}
                        onChange={(e) => setSubcategoryDescription(e.target.value)}
                        required
                    />
                </Box>
                {(subcategoryType === 'multiple_choice' || subcategoryType === 'checkbox') && (
                    <OptionsEditor/>
                )}
                {(subcategoryType === 'linear_scale') && (
                    <LinearScaleEditor/>
                )}
                <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
                    <Button
                        onClick={ handleCancel }
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
                            }}/>
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
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
                            }}/>
                        }
                    >
                        Save
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    </SubcategoryContext.Provider>;
};

function OptionsEditor() {
    const {
        options, draggedOptionId,
        deleteOption, editOption, moveOption, saveOption, setDraggedOptionId
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

function LinearScaleEditor() {
    const {
        options, draggedOptionId,
        deleteOption, editOption, moveOption, reloadOptions, saveOption, setDraggedOptionId
    } = useContext(SubcategoryContext);

    const handleAddOption = () => {
        saveOption();
    }
    const handleChangeDescription = (option, e) => {
        editOption(option, { description: e.target.value });
    }
    const handleChangeLabel = (option, e) => {
        editOption(option, { label: e.target.value });
    }
    const handleOptionDragStart = (event) => {
        setDraggedOptionId(event.active?.id ?? null);
    };

    return <>
        <Box sx={{ mb: 2 }}>
            {
                options.map((option) => (
                <Grid container spacing={2} key={option.id} alignItems="center" sx={{ mb: 1 }}>
                    <Grid item xs={1}>
                        <Typography variant="body1">{option.order}.</Typography>
                    </Grid>
                    <Grid item xs={4}>
                    <TextField
                        variant="outlined"
                        label="Label"
                        value={option.label ?? ''}
                        onChange={ e => handleChangeLabel(option, e) }
                        fullWidth
                    />
                    </Grid>
                    <Grid item xs={6}>
                    <TextField
                        variant="outlined"
                        label="Description (optional)"
                        value={option.description ?? ''}
                        onChange={ e => handleChangeDescription(option, e) }
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
                            minWidth: 500,
                            maxWidth: "100%"
                        }}
                    />
                    </Grid>
                    <Grid item xs={1}>{
                        options.length > 2 && (
                            <IconButton
                            onClick={ () => deleteOption(option) }
                            sx={{ color: 'gray' }}
                            >
                            <CloseIcon />
                            </IconButton>
                        )
                    }</Grid>
                </Grid>
                ))
            }
            {
                options.length < 10 && (
                    <Typography
                        onClick={ handleAddOption }
                        sx={{
                            color: '#000000',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '8px',
                        }}
                    >
                        {options.length + 1}. Add Option
                    </Typography>
                )
            }
        </Box>
    </>;
}
