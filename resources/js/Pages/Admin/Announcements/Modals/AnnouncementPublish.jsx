import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, Typography, CircularProgress, FormGroup, FormControl, MenuItem, Checkbox, ListItemText } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Swal from 'sweetalert2';

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

    // Selection
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]); // multiple roles now
    const [selectedAnnouncementType, setSelectedAnnouncementType] = useState('');
    const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
    const [selectedEmploymentStatuses, setSelectedEmploymentStatuses] = useState([]);

    // Errors
    const [selectedBranchError, setSelectedBranchError] = useState(false);
    const [selectedDepartmentError, setSelectedDepartmentError] = useState(false);
    const [selectedAnnouncementTypeError, setSelectedAnnouncementTypeError] = useState(false);

    // Thumbnail
    const [imagePath, setImagePath] = useState("");
    const [imageLoading, setImageLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        axiosInstance.get('/settings/getBranches', { headers })
            .then((res) => {
                setBranches(res.data.branches);
                // Optionally select all by default:
                // setSelectedBranches(res.data.branches.map(b => b.id.toString()));
            })
            .catch((err) => console.error('Error fetching branches:', err));

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((res) => {
                setDepartments(res.data.departments);
                // setSelectedDepartments(res.data.departments.map(d => d.id.toString()));
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
                        setImagePath("../../../../images/ManProTab.png");
                    }
                    setImageLoading(false);
                })
                .catch((error) => {
                    setImagePath("../../../../images/ManProTab.png");
                    setImageLoading(false);
                });
        }
    }, [announceInfo?.unique_code, employee?.role_id]);

    // Utility
    const toggleSelection = (value, selectedArray, setSelectedArray) => {
        if (selectedArray.includes(value)) {
            setSelectedArray(selectedArray.filter(item => item !== value));
        } else {
            setSelectedArray([...selectedArray, value]);
        }
    };

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
        const data = {
            unique_code: announceInfo?.unique_code,
            branches: selectedBranches,
            departments: selectedDepartments,
            announcement_type_id: selectedAnnouncementType,
            role_ids: selectedRoleIds,
            employment_types: selectedEmploymentTypes,
            employment_statuses: selectedEmploymentStatuses,
        };

        axiosInstance.post('/announcements/publishAnnouncement', data, { headers })
            .then(() => {
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: "Announcement published.",
                    icon: "success",
                    confirmButtonColor: '#177604'
                }).then(() => handleClose());
            })
            .catch(() => {
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
                <Box component="form" sx={{ my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                    <Typography variant="subtitle1" sx={{ color: "text.primary", mb: 2 }}>
                        Select Recipients
                    </Typography>
                    <FormGroup row={true} className="d-flex justify-content-between">
                        {/* Announcement Type */}
                        <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                            <TextField
                                select
                                id="announcementType"
                                label="Announcement Type"
                                error={selectedAnnouncementTypeError}
                                value={selectedAnnouncementType}
                                onChange={e => setSelectedAnnouncementType(e.target.value)}
                            >
                                <MenuItem value="">Select Announcement Type</MenuItem>
                                {announcementTypes.map(type => (
                                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                        {/* Department Selection */}
                        <FormControl sx={{ marginBottom: 2, width: '49%' }}>
                            <TextField
                                select
                                id="department"
                                label="Departments"
                                error={selectedDepartmentError}
                                value={selectedDepartments}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) =>
                                        departments
                                            .filter((department) => selected.includes(department.id.toString()))
                                            .map((department) => department.acronym)
                                            .join(', '),
                                }}
                            >
                                {departments.map((department) => (
                                    <MenuItem
                                        key={department.id}
                                        value={department.id.toString()}
                                        onClick={() => {
                                            toggleSelection(department.id.toString(), selectedDepartments, setSelectedDepartments);
                                        }}
                                    >
                                        <Checkbox checked={selectedDepartments.includes(department.id.toString())} />
                                        <ListItemText primary={`${department.name} (${department.acronym})`} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                        {/* Branch Selection */}
                        <FormControl sx={{ marginBottom: 2, width: '49%' }}>
                            <TextField
                                select
                                id="branch"
                                label="Branches"
                                error={selectedBranchError}
                                value={selectedBranches}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) =>
                                        branches
                                            .filter((branch) => selected.includes(branch.id.toString()))
                                            .map((branch) => branch.acronym)
                                            .join(', '),
                                }}
                            >
                                {branches.map((branch) => (
                                    <MenuItem
                                        key={branch.id}
                                        value={branch.id.toString()}
                                        onClick={() => {
                                            toggleSelection(branch.id.toString(), selectedBranches, setSelectedBranches);
                                        }}
                                    >
                                        <Checkbox checked={selectedBranches.includes(branch.id.toString())} />
                                        <ListItemText primary={`${branch.name} (${branch.acronym})`} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                    </FormGroup>
                    {/* Roles Selection */}
                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                    <TextField
                        select
                        id="roles"
                        label="Roles"
                        value={selectedRoleIds}
                        SelectProps={{
                        multiple: true,
                        renderValue: (selected) =>
                            roles
                            .filter(role => selected.includes(role.id.toString()))
                            .map(role => role.name)
                            .join(', '),
                        }}
                    >
                        {roles.map(role => (
                        <MenuItem
                            key={role.id}
                            value={role.id.toString()}
                            onClick={() => {
                            const value = role.id.toString();
                            setSelectedRoleIds(prev =>
                                prev.includes(value)
                                ? prev.filter(id => id !== value)
                                : [...prev, value]
                            );
                            }}
                        >
                            <Checkbox checked={selectedRoleIds.includes(role.id.toString())} />
                            <ListItemText primary={role.name} />
                        </MenuItem>
                        ))}
                    </TextField>
                    </FormControl>
                    {/* Employment Types Selection */}
                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                    <TextField
                        select
                        id="employmentTypes"
                        label="Employment Types"
                        value={selectedEmploymentTypes}
                        SelectProps={{
                        multiple: true,
                        renderValue: (selected) =>
                            selected.join(', '),
                        }}
                    >
                        {employmentTypes.map(type => (
                        <MenuItem
                            key={type}
                            value={type}
                            onClick={() => {
                            setSelectedEmploymentTypes(prev =>
                                prev.includes(type)
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            );
                            }}
                        >
                            <Checkbox checked={selectedEmploymentTypes.includes(type)} />
                            <ListItemText primary={type} />
                        </MenuItem>
                        ))}
                    </TextField>
                    </FormControl>

                   {/* Employment Statuses Selection */}
                    <FormControl sx={{ marginBottom: 2, width: '100%' }}>
                    <TextField
                        select
                        id="employmentStatuses"
                        label="Employment Statuses"
                        value={selectedEmploymentStatuses}
                        SelectProps={{
                        multiple: true,
                        renderValue: (selected) =>
                            selected.join(', '),
                        }}
                    >
                        {employmentStatuses.map(status => (
                        <MenuItem
                            key={status}
                            value={status}
                            onClick={() => {
                            setSelectedEmploymentStatuses(prev =>
                                prev.includes(status)
                                ? prev.filter(s => s !== status)
                                : [...prev, status]
                            );
                            }}
                        >
                            <Checkbox checked={selectedEmploymentStatuses.includes(status)} />
                            <ListItemText primary={status} />
                        </MenuItem>
                        ))}
                    </TextField>
                    </FormControl>
                    <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Publish </p>
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AnnouncementPublish;