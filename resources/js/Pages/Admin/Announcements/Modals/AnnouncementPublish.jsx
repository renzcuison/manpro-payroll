import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, Typography, CircularProgress, FormGroup, FormControl, MenuItem, Checkbox, ListItemText } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Swal from 'sweetalert2';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const employmentTypes = ['Probationary', 'Regular', 'Full-Time', 'Part-Time'];
const employmentStatuses = ['Active', 'Resigned', 'Terminated'];

const AnnouncementPublish = ({ open, close, announceInfo, employee }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Data
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [announcementTypes, setAnnouncementTypes] = useState([]);
    const [clientId, setClientId] = useState(""); // <-- Client ID state

    // Selection
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);

    // Announcement Type selection + Create new
    const [selectedAnnouncementType, setSelectedAnnouncementType] = useState('');
    const [selectedAnnouncementTypeError, setSelectedAnnouncementTypeError] = useState(false);

    // Create new announcement type states
    const [isCreatingNewType, setIsCreatingNewType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeError, setNewTypeError] = useState('');
    const [newTypeLoading, setNewTypeLoading] = useState(false);

    // Employment selections
    const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
    const [selectedEmploymentStatuses, setSelectedEmploymentStatuses] = useState([]);

    // Other errors
    const [selectedBranchError, setSelectedBranchError] = useState(false);
    const [selectedDepartmentError, setSelectedDepartmentError] = useState(false);

    // Thumbnail
    const [imagePath, setImagePath] = useState("");
    const [imageLoading, setImageLoading] = useState(true);

    // Scheduled Sent
    const [scheduledDate, setScheduledDate] = useState(null);
    const [scheduledTime, setScheduledTime] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);

    //loading state
    const [saving, setSaving] = useState(false);

    // Informative feedback for scheduling
    const [schedulingInfo, setSchedulingInfo] = useState('');

    // Fetch data on mount
    useEffect(() => {
        // Fetch client_id for the logged-in user
        axiosInstance.get('/user/profile', { headers })
            .then((res) => {
                setClientId(res.data.client_id || "");
            })
            .catch((err) => {
                console.error('Error fetching user profile:', err);
                setClientId("");
            });

        axiosInstance.get('/settings/getBranches', { headers })
            .then((res) => {
                setBranches(res.data.branches);
            })
            .catch((err) => console.error('Error fetching branches:', err));

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((res) => {
                setDepartments(res.data.departments);
            })
            .catch((err) => console.error('Error fetching departments:', err));

        axiosInstance.get('/settings/getRoles', { headers })
            .then((res) => {
                setRoles(res.data.roles || []);
                if (employee?.role_id) setSelectedRoleIds([employee.role_id.toString()]);
            })
            .catch((err) => console.error('Error fetching roles:', err));

        axiosInstance.get('/getAnnouncementType', { headers })
            .then(res => {
                if (res.data.status === 200) setAnnouncementTypes(res.data.types);
            })
            .catch((err) => console.error('Error fetching announcement types:', err));

        if (announceInfo?.unique_code) {
            axiosInstance.get(`/announcements/getThumbnail/${announceInfo.unique_code}`, { headers })
                .then((response) => {
                    if (response.data.thumbnail) {
                        const byteCharacters = window.atob(response.data.thumbnail);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'image/png' });

                        setImagePath(URL.createObjectURL(blob));
                    } else {
                        setImagePath("../../../../images/defaultThumbnail.jpg");
                    }
                    setImageLoading(false);
                })
                .catch((error) => {
                    setImagePath("../../../../images/defaultThumbnail.jpg");
                    setImageLoading(false);
                });
        }
    }, [announceInfo?.unique_code, employee?.role_id]);

    // Helper function to check if all selected
    const isAllSelected = (allItems, selectedItems) => {
        return allItems.length > 0 && selectedItems.length === allItems.length;
    };

    // Departments multi-select handler with "All Departments"
    const handleDepartmentChange = (event) => {
        const value = event.target.value;
        if (value.includes('ALL_DEPARTMENTS')) {
            if (isAllSelected(departments, selectedDepartments)) {
                setSelectedDepartments([]);
            } else {
                setSelectedDepartments(departments.map(d => d.id.toString()));
            }
        } else {
            setSelectedDepartments(value);
        }
    };

    // Branches multi-select handler with "All Branches"
    const handleBranchChange = (event) => {
        const value = event.target.value;
        if (value.includes('ALL_BRANCHES')) {
            if (isAllSelected(branches, selectedBranches)) {
                setSelectedBranches([]);
            } else {
                setSelectedBranches(branches.map(b => b.id.toString()));
            }
        } else {
            setSelectedBranches(value);
        }
    };

    // Roles multi-select handler with "All Roles"
    const handleRoleChange = (event) => {
        const value = event.target.value;
        if (value.includes('ALL_ROLES')) {
            if (isAllSelected(roles, selectedRoleIds)) {
                setSelectedRoleIds([]);
            } else {
                setSelectedRoleIds(roles.map(r => r.id.toString()));
            }
        } else {
            setSelectedRoleIds(value);
        }
    };

    // Employment Types multi-select handler with "All Employment Types"
    const handleEmploymentTypesChange = (event) => {
        const value = event.target.value;
        if (value.includes('ALL_EMPLOYMENT_TYPES')) {
            if (isAllSelected(employmentTypes, selectedEmploymentTypes)) {
                setSelectedEmploymentTypes([]);
            } else {
                setSelectedEmploymentTypes([...employmentTypes]);
            }
        } else {
            setSelectedEmploymentTypes(value);
        }
    };

    // Employment Statuses multi-select handler with "All Employment Statuses"
    const handleEmploymentStatusesChange = (event) => {
        const value = event.target.value;
        if (value.includes('ALL_EMPLOYMENT_STATUSES')) {
            if (isAllSelected(employmentStatuses, selectedEmploymentStatuses)) {
                setSelectedEmploymentStatuses([]);
            } else {
                setSelectedEmploymentStatuses([...employmentStatuses]);
            }
        } else {
            setSelectedEmploymentStatuses(value);
        }
    };

    // Utility
    const toggleSelection = (value, selectedArray, setSelectedArray) => {
        if (selectedArray.includes(value)) {
            setSelectedArray(selectedArray.filter(item => item !== value));
        } else {
            setSelectedArray([...selectedArray, value]);
        }
    };

    // Handler when announcement type changes
    const handleAnnouncementTypeChange = (event) => {
        const value = event.target.value;
        if (value === '__create_new__') {
            setIsCreatingNewType(true);
            setSelectedAnnouncementType('');
            setSelectedAnnouncementTypeError(false);
        } else {
            setSelectedAnnouncementType(value);
            setSelectedAnnouncementTypeError(false);
            setIsCreatingNewType(false);
        }
    };

    // Save new announcement type to backend
    const handleAddNewType = async () => {
        if (!newTypeName.trim()) {
            setNewTypeError('Announcement type name is required.');
            return;
        }
        setNewTypeError('');
        setNewTypeLoading(true);
        try {
            const response = await axiosInstance.post(
                '/addAnnouncementType',
                { name: newTypeName.trim() },
                { headers }
            );
            if (response.status === 200 && response.data.status === 200) {
                const createdType = response.data.type;
                setAnnouncementTypes(prev => [...prev, createdType]);
                setSelectedAnnouncementType(createdType.id.toString());
                setIsCreatingNewType(false);
                setNewTypeName('');
            } else {
                const errMsg = response.data.errors?.name?.[0] || response.data.message || 'Error adding announcement type.';
                setNewTypeError(errMsg);
            }
        } catch (err) {
            setNewTypeError('Server error.');
        } finally {
            setNewTypeLoading(false);
        }
    };

    // Watch for scheduling changes to update info
    useEffect(() => {
        if (scheduledDate && scheduledTime) {
            const scheduledSend = dayjs(
                dayjs(scheduledDate).format('YYYY-MM-DD') + ' ' + scheduledTime,
                'YYYY-MM-DD HH:mm'
            );
            if (scheduledSend.isAfter(dayjs())) {
                setSchedulingInfo(`This announcement will be scheduled for ${scheduledSend.format('MMMM DD, YYYY hh:mm A')}. It will be automatically published at that time.`);
            } else {
                setSchedulingInfo('This announcement will be published immediately.');
            }
        } else {
            setSchedulingInfo('');
        }
    }, [scheduledDate, scheduledTime]);

    // Validation & Submit
    const checkInput = (event) => {
        event.preventDefault();

        setSelectedBranchError(selectedBranches.length === 0);
        setSelectedDepartmentError(selectedDepartments.length === 0);
        setSelectedAnnouncementTypeError(!selectedAnnouncementType);

        let reqMessage = null;
        if (!selectedAnnouncementType && selectedBranches.length === 0 && selectedDepartments.length === 0) {
            reqMessage = "Select an Announcement Type, Department, and Branch";
        } else if (!selectedAnnouncementType && selectedBranches.length === 0) {
            reqMessage = "Select an Announcement Type and Branch";
        } else if (!selectedAnnouncementType && selectedDepartments.length === 0) {
            reqMessage = "Select an Announcement Type and Department";
        } else if (!selectedAnnouncementType) {
            reqMessage = "Select an Announcement Type";
        } else if (selectedBranches.length === 0 && selectedDepartments.length === 0) {
            reqMessage = "Select a Department and Branch";
        } else if (selectedBranches.length === 0) {
            reqMessage = "Select a Branch";
        } else if (selectedDepartments.length === 0) {
            reqMessage = "Select a Department";
        }

        // Validate date/time
        if (scheduledDate && scheduledTime) {
            const scheduledSend = dayjs(
                dayjs(scheduledDate).format('YYYY-MM-DD') + ' ' + scheduledTime,
                'YYYY-MM-DD HH:mm'
            );
            if (scheduledSend.isBefore(dayjs())) {
                reqMessage = "Scheduled send date/time must be in the future.";
            }
        }

        if (reqMessage) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: reqMessage,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Publish?",
            text: "Are you sure you want to publish this announcement?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput();
            }
        });
    };

    const saveInput = () => {
        setSaving(true); // Start loading
        let scheduledSend = null;
        if (scheduledDate && scheduledTime) {
            scheduledSend = dayjs(
                dayjs(scheduledDate).format('YYYY-MM-DD') + ' ' + scheduledTime,
                'YYYY-MM-DD HH:mm'
            ).format('YYYY-MM-DD HH:mm:ss');
        }

        const data = {
            unique_code: announceInfo?.unique_code,
            branches: selectedBranches,
            departments: selectedDepartments,
            announcement_type_id: selectedAnnouncementType,
            role_ids: selectedRoleIds,
            employment_types: selectedEmploymentTypes,
            employment_statuses: selectedEmploymentStatuses,
            scheduled_send_datetime: scheduledSend,
            client_id: clientId, // <-- Pass client ID if needed
        };

        axiosInstance.post('/announcements/publishAnnouncement', data, { headers })
            .then(() => {
                setSaving(false); // Stop loading
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: scheduledSend
                        ? "Announcement has been scheduled for publishing."
                        : "Announcement published.",
                    icon: "success",
                    confirmButtonColor: '#177604'
                }).then(() => handleClose());
            })
            .catch(() => {
                setSaving(false); // Stop loading
                Swal.fire({
                    title: "Error!",
                    text: "Failed to publish announcement.",
                    icon: "error"
                });
            });
    };

    // Close Modal & Blob Cleanup
    const handleClose = () => {
        if (imagePath && imagePath.startsWith('blob:')) URL.revokeObjectURL(imagePath);
        close(true);
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    backgroundColor: '#f8f9fa',
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    borderRadius: '20px',
                    minWidth: { xs: "100%", sm: "700px" },
                    maxWidth: '800px',
                    marginBottom: '5%'
                }
            }}>
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                    <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                        Publish Announcement
                    </Typography>
                    <IconButton onClick={() => close(false)}>
                        <i className="si si-close"></i>
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ padding: 5, mt: 2 }}>
                {/* Show client ID for demonstration */}
                {clientId && (
                    <Typography variant="body2" sx={{ mb: 2, color: "gray" }}>
                        Client ID: {clientId}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Card sx={{ width: 500 }}>
                            {imageLoading ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 210
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <CardMedia
                                    sx={{ height: 210 }}
                                    image={imagePath}
                                    title="Thumbnail"
                                />
                            )}
                            <CardContent>
                                <Typography gutterBottom variant="h6" component="div">
                                    {announceInfo?.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
                {saving ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                        <CircularProgress size={60} sx={{ mb: 2 }} />
                        <Typography variant="h6" sx={{ color: "#177604" }}>Publishing announcement...</Typography>
                    </Box>
                ) : (
                <Box component="form" sx={{ my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                    <Typography variant="subtitle1" sx={{ color: "text.primary", mb: 2 }}>
                        Select Recipients
                    </Typography>
                    <FormGroup row={true} className="d-flex justify-content-between">
                        {/* Announcement Type */}
                        <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                            {!isCreatingNewType ? (
                                <TextField
                                    select
                                    id="announcementType"
                                    label="Announcement Type"
                                    error={selectedAnnouncementTypeError}
                                    value={selectedAnnouncementType}
                                    onChange={handleAnnouncementTypeChange}
                                >
                                    <MenuItem value="">Select Announcement Type</MenuItem>
                                    {announcementTypes.map(type => (
                                        <MenuItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value="__create_new__" sx={{ fontStyle: 'italic' }}>
                                        + Create new announcement type
                                    </MenuItem>
                                </TextField>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <TextField
                                        id="newAnnouncementType"
                                        label="New Announcement Type"
                                        value={newTypeName}
                                        onChange={e => setNewTypeName(e.target.value)}
                                        error={!!newTypeError}
                                        helperText={newTypeError}
                                        disabled={newTypeLoading}
                                        size="small"
                                        fullWidth
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleAddNewType}
                                        disabled={!newTypeName.trim() || newTypeLoading}
                                        sx={{ ml: 1, whiteSpace: 'nowrap' }}
                                    >
                                        {newTypeLoading ? <CircularProgress size={24} /> : 'Save'}
                                    </Button>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => {
                                            setIsCreatingNewType(false);
                                            setNewTypeName('');
                                            setNewTypeError('');
                                        }}
                                        sx={{ ml: 1 }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            )}
                        </FormControl>
                        {/* Department Selection */}
                        <FormControl sx={{ marginBottom: 2, width: '49%' }}>
                            <TextField
                                select
                                label="Departments"
                                SelectProps={{
                                    multiple: true,
                                    value: selectedDepartments,
                                    onChange: handleDepartmentChange,
                                    renderValue: (selected) => selected.length === 0 ? "Select Departments" : selected.map(id => {
                                        const dept = departments.find(d => d.id.toString() === id);
                                        return dept ? dept.name : id;
                                    }).join(', '),
                                }}
                                fullWidth
                            >
                                <MenuItem value="ALL_DEPARTMENTS" dense>
                                    <Checkbox checked={isAllSelected(departments, selectedDepartments)} />
                                    <ListItemText primary="All Departments" />
                                </MenuItem>
                                {departments.map(dept => (
                                    <MenuItem key={dept.id} value={dept.id.toString()}>
                                        <Checkbox checked={selectedDepartments.includes(dept.id.toString())} />
                                        <ListItemText primary={dept.name} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                        {/* Branch Selection */}
                        <FormControl sx={{ marginBottom: 2, width: '49%' }}>
                            <TextField
                                select
                                label="Branches"
                                SelectProps={{
                                    multiple: true,
                                    value: selectedBranches,
                                    onChange: handleBranchChange,
                                    renderValue: (selected) => selected.length === 0 ? "Select Branches" : selected.map(id => {
                                        const branch = branches.find(b => b.id.toString() === id);
                                        return branch ? branch.name : id;
                                    }).join(', '),
                                }}
                                fullWidth
                            >
                                <MenuItem value="ALL_BRANCHES" dense>
                                    <Checkbox checked={isAllSelected(branches, selectedBranches)} />
                                    <ListItemText primary="All Branches" />
                                </MenuItem>
                                {branches.map(branch => (
                                    <MenuItem key={branch.id} value={branch.id.toString()}>
                                        <Checkbox checked={selectedBranches.includes(branch.id.toString())} />
                                        <ListItemText primary={branch.name} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                    </FormGroup>
                    {/* Roles Selection */}
                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                        <TextField
                            select
                            label="Roles"
                            SelectProps={{
                                multiple: true,
                                value: selectedRoleIds,
                                onChange: handleRoleChange,
                                renderValue: (selected) => selected.length === 0 ? "Select Roles" : selected.map(id => {
                                    const role = roles.find(r => r.id.toString() === id);
                                    return role ? role.name : id;
                                }).join(', '),
                            }}
                            fullWidth
                        >
                            <MenuItem value="ALL_ROLES" dense>
                                <Checkbox checked={isAllSelected(roles, selectedRoleIds)} />
                                <ListItemText primary="All Roles" />
                            </MenuItem>
                            {roles.map(role => (
                                <MenuItem key={role.id} value={role.id.toString()}>
                                    <Checkbox checked={selectedRoleIds.includes(role.id.toString())} />
                                    <ListItemText primary={role.name} />
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                    {/* Employment Types Selection with All Option */}
                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                        <TextField
                            select
                            id="employmentTypes"
                            label="Employment Types"
                            value={selectedEmploymentTypes}
                            SelectProps={{
                                multiple: true,
                                value: selectedEmploymentTypes,
                                onChange: handleEmploymentTypesChange,
                                renderValue: (selected) =>
                                    selected.length === 0
                                        ? "Select Employment Types"
                                        : selected.join(', '),
                            }}
                            fullWidth
                        >
                            <MenuItem value="ALL_EMPLOYMENT_TYPES" dense>
                                <Checkbox checked={isAllSelected(employmentTypes, selectedEmploymentTypes)} />
                                <ListItemText primary="All Employment Types" />
                            </MenuItem>
                            {employmentTypes.map(type => (
                                <MenuItem
                                    key={type}
                                    value={type}
                                >
                                    <Checkbox checked={selectedEmploymentTypes.includes(type)} />
                                    <ListItemText primary={type} />
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                    {/* Employment Statuses Selection with All Option */}
                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                        <TextField
                            select
                            id="employmentStatuses"
                            label="Employment Statuses"
                            value={selectedEmploymentStatuses}
                            SelectProps={{
                                multiple: true,
                                value: selectedEmploymentStatuses,
                                onChange: handleEmploymentStatusesChange,
                                renderValue: (selected) =>
                                    selected.length === 0
                                        ? "Select Employment Statuses"
                                        : selected.join(', ')
                            }}
                            fullWidth
                        >
                            <MenuItem value="ALL_EMPLOYMENT_STATUSES" dense>
                                <Checkbox checked={isAllSelected(employmentStatuses, selectedEmploymentStatuses)} />
                                <ListItemText primary="All Employment Statuses" />
                            </MenuItem>
                            {employmentStatuses.map(status => (
                                <MenuItem
                                    key={status}
                                    value={status}
                                >
                                    <Checkbox checked={selectedEmploymentStatuses.includes(status)} />
                                    <ListItemText primary={status} />
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                    {/* Scheduled Sent */}
                    {showSchedule && (
                        <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                            <Typography variant="subtitle1" sx={{ color: "text.primary", mb: 1 }}>
                            Schedule Send
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <DatePicker
                                label="Select Date"
                                value={scheduledDate}
                                onChange={setScheduledDate}
                                sx={{ width: 180 }}
                                />
                                <TimePicker
                                label="Select Time"
                                value={scheduledTime ? dayjs(`${dayjs(scheduledDate).format('YYYY-MM-DD')}T${scheduledTime}`) : null}
                                onChange={val => setScheduledTime(val ? dayjs(val).format('HH:mm') : null)}
                                sx={{ width: 120 }}
                                />
                            </Box>
                            </LocalizationProvider>
                        </FormControl>
                    )}
                    {schedulingInfo && (
                        <Typography variant="caption" sx={{ color: 'gray', mt: 1 }}>
                            {schedulingInfo}
                        </Typography>
                    )}
                    <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: '#adb5bd', color: 'black', mr: 2 }}
                            onClick={() => setShowSchedule(true)}
                            >
                            <p className='m-0'><i className="fa fa-calendar mr-2 mt-1"></i> Schedule Post </p>
                        </Button>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Publish </p>
                        </Button>
                    </Box>
                </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AnnouncementPublish;