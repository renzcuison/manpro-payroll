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
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormSection from './Subsections/PerformanceEvaluationFormSection';
import {
    restrictToFirstScrollableAncestor,
    restrictToVerticalAxis
} from '@dnd-kit/modifiers';
import Sortable from './Subsections/Sortable';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import Swal from 'sweetalert2';
import { useEvaluationForm } from '../../../hooks/useEvaluationForm';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams();
    const {
        creatorName,
        createdDate,
        dragging,
        formId,
        loading,
        notFound,
        sections,
        moveSection,
        saveSection,
        toggleDragging
    } = useEvaluationForm({ name: formName });
    const navigate = useNavigate();

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

        try {
        const resp = await fetch('/api/editEvaluationForm', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
            body: formData,
        });

        if (resp.status === 401 || resp.status === 403) {
            Swal.fire({
            icon: 'warning',
            title: 'Unauthenticated',
            text: 'Please login to continue.',
            confirmButtonColor: '#177604',
            }).then(() => {
            navigate('/login');
            });
            return;
        }

        const data = await resp.json();

        if (data.status === 200) {
            Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || "Form updated successfully!",
            confirmButtonColor: '#177604',
            }).then(() => {
            setEditOpen(false);
            window.location.reload();
            });
        } else {
            Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || "There was a problem updating the form.",
            confirmButtonColor: '#177604',
            });
        }
        } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.message || "Network error. Please try again.",
            confirmButtonColor: '#177604',
        });
        }
    };

    // Delete Form Handlers
    const handleDeleteMenuClick = () => {
        setDeleteOpen(true);
        handleSettingsClose();
    };

    const handleDeleteConfirm = async () => {
        const formData = new FormData();
        formData.append('id', formId);

        try {
        const resp = await fetch('/api/deleteEvaluationForm', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
            body: formData,
        });

        if (resp.status === 401 || resp.status === 403) {
            Swal.fire({
            icon: 'warning',
            title: 'Unauthenticated',
            text: 'Please login to continue.',
            confirmButtonColor: '#177604',
            }).then(() => {
            navigate('/login');
            });
            return;
        }

        const data = await resp.json();

        if (data.status === 200) {
            Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: data.message || "Form deleted successfully.",
            confirmButtonColor: '#177604',
            }).then(() => {
            setDeleteOpen(false);
            navigate('/evaluation-forms');
            });
        } else {
            Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || "Unable to delete form.",
            confirmButtonColor: '#177604',
            });
        }
        } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.message || "Network error. Please try again.",
            confirmButtonColor: '#177604',
        });
        }
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
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const handleDragEnd = (event) => {
        toggleDragging();
        if(!event.active || !event.over) return;
        const {
            active: { id, data: { current: { order: oldOrder } } },
            over: { data: { current: { order: newOrder } } },
        } = event;
        if(oldOrder === newOrder) return;
        moveSection(oldOrder, newOrder);
    }

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
                    cursor: dragging ? 'move' : undefined
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
                        navigate(-1);
                        }}
                    >Close Form</MenuItem>
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
                            onDragStart={ toggleDragging }
                            onDragEnd={ handleDragEnd }
                            modifiers={[restrictToFirstScrollableAncestor, restrictToVerticalAxis]}
                        ><SortableContext items={ sections.map(section=>({ ...section, id: 'section_'+section.id })) } strategy={ verticalListSortingStrategy }>
                            <Box sx={{ mt: 2, overflow: 'auto' }}>
                                {sections.map((section) => <Sortable key={section.id} id={'section_'+section.id} order={section.order}>
                                    <PerformanceEvaluationFormSection section={section} dragging={dragging}/>
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
                    <DialogContent>
                        <Typography>Are you sure you want to delete this form?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationFormPage;
