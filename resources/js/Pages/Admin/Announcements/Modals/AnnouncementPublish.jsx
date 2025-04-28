import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, Typography, CircularProgress, FormGroup, FormControl, MenuItem, Checkbox, ListItemText } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'react-quill/dist/quill.snow.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

const AnnouncementPublish = ({ open, close, announceInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedBranchError, setSelectedBranchError] = useState(false);
    const [selectedDepartmentError, setSelectedDepartmentError] = useState(false);

    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);

    const [imagePath, setImagePath] = useState("");
    const [imageLoading, setImageLoading] = useState(true);

    // ------------- Branch, Department, Thumbnail Requests
    useEffect(() => {
        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                const fetchedBranches = response.data.branches;
                setBranches(fetchedBranches);

                const allBranchIds = fetchedBranches.map((branch) => branch.id);
                setSelectedBranches(allBranchIds);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                const fetchedDepartments = response.data.departments;
                setDepartments(fetchedDepartments);
                const allDepartmentIds = fetchedDepartments.map((department) => department.id);
                setSelectedDepartments(allDepartmentIds);
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
            });

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
                console.error('Error fetching thumbnail:', error);
                setImagePath("../../../../images/ManProTab.png");
                setImageLoading(false);
            });

    }, []);

    const checkInput = (event) => {
        event.preventDefault();

        if (selectedDepartments.length == 0) {
            setSelectedDepartmentError(true);
        } else {
            setSelectedDepartmentError(false);
        }

        if (selectedBranches.length == 0) {
            setSelectedBranchError(true);
        } else {
            setSelectedBranchError(false);
        }

        let reqMessage = null;
        if (selectedBranches.length == 0 && selectedDepartments.length == 0) {
            reqMessage = "Select a Department and Branch";
        } else if (selectedBranches.length == 0) {
            reqMessage = "Select a Branch";
        } else if (selectedDepartments.length == 0) {
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
        } else {
            new Swal({
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
        }
    };

    const saveInput = () => {
        const data = {
            announcement: announceInfo.unique_code,
            departments: selectedDepartments,
            branches: selectedBranches,
        };

        axiosInstance
            .post("/announcements/publishAnnouncement", data, {
                headers,
            })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `Your announcement has been published!`,
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then((res) => {
                    if (res.isConfirmed) {
                        handleClose();
                        document.body.setAttribute("aria-hidden", "true");
                    } else {
                        document.body.setAttribute("aria-hidden", "true");
                    }
                })
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });

    }

    // ------------- Close Modal & Blob Cleanup
    const handleClose = () => {
        if (imagePath && imagePath.startsWith('blob:')) {
            URL.revokeObjectURL(imagePath);
        }
        close(true);
    }

    return (
        <>
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
                            {" "}Publish Announcement{" "}
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
                                        {announceInfo.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                    <Box component="form" sx={{ my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <Typography variant="subtitle1" sx={{ color: "text.primary", mb: 2 }}>
                            Select Recipients
                        </Typography>
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            {/* Department Selection */}
                            <FormControl sx={{
                                marginBottom: 2, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="department"
                                    label="Department"
                                    error={selectedDepartmentError}
                                    value={selectedDepartments}
                                    SelectProps={{
                                        multiple: true,
                                        renderValue: (selected) =>
                                            departments
                                                .filter((department) => selected.includes(department.id))
                                                .map((department) => department.acronym)
                                                .join(', '),
                                    }}
                                >
                                    {departments.map((department) => (
                                        <MenuItem
                                            key={department.id}
                                            value={department.id}
                                            onClick={() => {
                                                setSelectedDepartments((prevSelected) =>
                                                    prevSelected.includes(department.id)
                                                        ? prevSelected.filter((id) => id !== department.id)
                                                        : [...prevSelected, department.id]
                                                );
                                            }}
                                        >
                                            <Checkbox checked={selectedDepartments.includes(department.id)} />
                                            <ListItemText primary={`${department.name} (${department.acronym})`} />
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            {/* Branch Selection */}
                            <FormControl sx={{
                                marginBottom: 2, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="branch"
                                    label="Branch"
                                    error={selectedBranchError}
                                    value={selectedBranches}
                                    SelectProps={{
                                        multiple: true,
                                        renderValue: (selected) =>
                                            branches
                                                .filter((branch) => selected.includes(branch.id))
                                                .map((branch) => branch.acronym)
                                                .join(', '),
                                    }}
                                    onChange={(event) => setSelectedBranches(event.target.value)}
                                >
                                    {branches.map((branch) => (
                                        <MenuItem
                                            key={branch.id}
                                            value={branch.id}
                                            onClick={() => {
                                                setSelectedBranches((prevSelected) =>
                                                    prevSelected.includes(branch.id)
                                                        ? prevSelected.filter((id) => id !== branch.id)
                                                        : [...prevSelected, branch.id]
                                                );
                                            }}
                                        >
                                            <Checkbox checked={selectedBranches.includes(branch.id)} />
                                            <ListItemText primary={`${branch.name} (${branch.acronym})`} />
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </FormGroup>
                        <Box display="flex" justifyContent="center" sx={{ marginTop: 2 }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Publish </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default AnnouncementPublish;