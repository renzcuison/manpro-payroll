import { AccordionSummaryMouseSensor } from './Sensors/AccordionSummaryMouseSensor';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import {
  Box,
  Typography,
  CardContent,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import CheckUser from '../../Errors/Error404';
import CloseIcon from '@mui/icons-material/Close';
import {
    DndContext, 
    closestCenter,
    TouchSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormSection from './Subsections/PerformanceEvaluationFormSection';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Sortable from './Subsections/Sortable';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Swal from 'sweetalert2';
import { useEvaluationForm } from '../../../hooks/useEvaluationForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams();
    const {
        creatorName,
        createdDate,
        draggedSectionId,
        formId,
        loading,
        notFound,
        sections,
        moveSection,
        saveSection,
        setDraggedSectionId, 
    } = useEvaluationForm({ name: formName });
    const navigate = useNavigate();

    // JWT token from localStorage
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Settings menu
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const settingsOpen = Boolean(settingsAnchorEl);

    // Edit form dialog
    const [editOpen, setEditOpen] = useState(false);
    const [newName, setNewName] = useState(formName);

    // Delete form dialog
    const [deleteOpen, setDeleteOpen] = useState(false);

    // Add Section modal
    const [addSectionOpen, setAddSectionOpen] = useState(false);

    // Handlers for Settings menu
    const handleSettingsClick = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    };
    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
    };

    // Edit Form Handlers
    const handleEditMenuClick = () => {
        setNewName(formName || '');
        setEditOpen(true);
        handleSettingsClose();
    };

    const handleEditSave = async () => {
    if (!newName.trim()) {
        Swal.fire({
        text: "Form Name is required!",
        icon: "error",
        confirmButtonColor: '#177604',
        });
        return;
    }

    const formData = new FormData();
    formData.append('id', formId);
    formData.append('name', newName);

    setEditOpen(false);
    Swal.fire({
        title: "Are you sure?",
        text: "You want to save this evaluation form?",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: '#177604',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
    }).then(async (res) => {
        if (res.isConfirmed) {
        try {
            const response = await axiosInstance.post('/editEvaluationForm', formData, { headers });
            if (response.data.status === 200) {
            await Swal.fire({
                text: "Evaluation form updated successfully!",
                icon: "success",
                confirmButtonText: 'Proceed',
                confirmButtonColor: '#177604',
            });
            navigate(`/admin/performance-evaluation/form/${newName}`);
            }
        } catch (error) {
            console.error("Error while editing form:", error);
        }
        }
    });
    };

    // Delete Form Handlers
    const handleDeleteMenuClick = () => {
        setDeleteOpen(true);
        handleSettingsClose();
    };

    const handleDeleteConfirm = async () => {
    const formData = new FormData();
    formData.append('id', formId);

    setDeleteOpen(false); 
    Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this evaluation form?",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d32f2f',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
    }).then(async (res) => {
        if (res.isConfirmed) {
        try {
            const response = await axiosInstance.post('/deleteEvaluationForm', formData, { headers });
            if (response.data.status === 200) {
            setDeleteOpen(false); // <-- close dialog immediately
            await Swal.fire({
                text: "Evaluation form deleted successfully!",
                icon: "success",
                confirmButtonText: 'Proceed',
                confirmButtonColor: '#177604',
            });
            navigate('/admin/performance-evaluation');
            }
        } catch (error) {
            console.error("Error while deleting form:", error);
        }
        }
    });
    };

    // Section modal
    const handleOpenAddSectionModal = () => setAddSectionOpen(true);
    const handleCloseAddSectionModal = () => setAddSectionOpen(false);
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

    // Section moving

    const sensors = useSensors(
        // useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(AccordionSummaryMouseSensor, { activationConstraint: { distance: 10 } })
    );
    const handleDragStart = (event) => {
        setDraggedSectionId(event.active?.id ?? null);
    };
    const handleDragEnd = (event) => {
        setDraggedSectionId(null);
        if(!event.active || !event.over) return;
        moveSection(
            event.active.data.current.order,
            event.over.data.current.order
        );
    }

    // const [a, setA] = useState();

    useEffect(() => {
        axiosInstance.get(`/getEvaluationResponse`, { headers, params: {formName} })
        .then((response) => {
            const { evaluationResponse } = response.data;
            if(!evaluationResponse) return;
            console.log(evaluationResponse)
            setA(evaluationResponse)
        })
    }, [])

    if (notFound) return <CheckUser />;

    return (
        <Layout title="Performance Evaluation Form">
            <Box
                sx={{
                    mt: 5,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: '8px',
                    position: 'relative',
                    maxWidth: '1000px',
                    mx: 'auto',
                    boxShadow: 3,
                    cursor: draggedSectionId ? 'move' : undefined
                }}
            >
                {/* Settings Icon with Dropdown Menu */}
                <IconButton
                    onClick={handleSettingsClick}
                    sx={{
                        position: 'absolute',
                        top: 25,
                        right: 30,
                        color: '#bdbdbd',
                        borderRadius: '50%',
                        padding: '5px',
                        color: '#BEBEBE',
                    }}
                    aria-controls={settingsOpen ? 'settings-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={settingsOpen ? 'true' : undefined}
                >
                    <SettingsIcon sx={{ fontSize: 28 }} />
                </IconButton>
                <Menu
                    id="settings-menu"
                    anchorEl={settingsAnchorEl}
                    open={settingsOpen}
                    onClose={handleSettingsClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={handleEditMenuClick}>Edit Form</MenuItem>
                    <MenuItem onClick={handleDeleteMenuClick}>Delete Form</MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleSettingsClose();
                            setTimeout(() => navigate('/admin/performance-evaluation'), 100);
                        }}
                    >Exit Form</MenuItem>
                </Menu>

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
                        
                        <DndContext
                            sensors={ sensors }
                            collisionDetection={ closestCenter }
                            onDragStart={ handleDragStart }
                            onDragEnd={ handleDragEnd }
                            modifiers={ [restrictToFirstScrollableAncestor, restrictToVerticalAxis] }
                        ><SortableContext items={ sections.map(section=>({ ...section, id: 'section_'+section.id })) } strategy={ verticalListSortingStrategy }>
                            <Box sx={{ mt: 2, overflow: 'auto' }}>
                                {sections.map((section) => <Sortable key={section.id} id={'section_'+section.id} order={section.order} draggedId={draggedSectionId}>
                                    <PerformanceEvaluationFormSection section={section} draggedId={draggedSectionId}/>
                                </Sortable>)}
                            </Box>
                        </SortableContext></DndContext>
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
                                '&:hover': { bgcolor: '#0d5c27' },
                                }}
                            >Add Section</Button>
                        </Box>
                    </CardContent>
                )}
                {/* Add Section Modal */}
                <PerformanceEvaluationFormAddSection
                    open={addSectionOpen}
                    onClose={handleCloseAddSectionModal}
                    onSave={handleSaveSection}
                />

        {/* Edit Form Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Edit Form Name</DialogTitle>
          <DialogContent>
            <TextField
              label="Form Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle>Delete Form?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
            </Box>
            {/* {
                a ? <Box>
                    {a.form.sections.map(section => <div>
                        Section: { section.name }<br/>
                        {
                            section.subcategories.map(subcategory => {
                                return <>
                                    
                                    -----------{subcategory.textAnswer ? "yes text" : "no text"}<br/>
                                    -----------{subcategory.percentageAnswer ? "yes percentage" : "no percentage"}<br/>
                                    -----------{subcategory.options ? "yes options" : "no options"}<br/>
                                </>
                            })
                        }
                        <br/>
                    </div>)}
                    <br/>
                </Box> : undefined
            } */}
    </Layout>
  );
};

export default PerformanceEvaluationFormPage;
