import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

const AnnouncementPublishModal = ({ open, close, announceInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedBranchError, setSelectedBranchError] = useState(false);
    const [selectedDepartmentError, setSelectedDepartmentError] = useState(false);

    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);

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
                    publishAnnouncement();
                }
            });
        }
    };

    const publishAnnouncement = () => {
        const data = {
            announcement: announceInfo.id,
            departments: selectedDepartments,
            branches: selectedBranches,
        };

        console.log(data);

        axiosInstance
            .post("/announcements/publishAnnouncement", data, {
                headers,
            })
            .then((response) => {
                console.log("Announcement Published!");
                /*
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
                        close();
                        document.body.setAttribute("aria-hidden", "true");
                    } else {
                        document.body.setAttribute("aria-hidden", "true");
                    }
                });
                */
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Publish Announcement </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
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

                            <FormControl sx={{
                                marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                                setSelectedDepartments((prevSelected) =>
                                                    prevSelected.includes(branch.id)
                                                        ? prevSelected.filter((id) => id !== branch.id)
                                                        : [...prevSelected, branch.id]
                                                );
                                            }}
                                        >
                                            <Checkbox checked={selectedDepartments.includes(branch.id)} />
                                            <ListItemText primary={`${branch.name} (${branch.acronym})`} />
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Publish </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default AnnouncementPublishModal;