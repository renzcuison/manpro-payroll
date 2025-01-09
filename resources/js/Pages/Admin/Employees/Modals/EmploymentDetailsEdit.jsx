import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
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

const EmploymentDetailsEdit = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedRole, setSelectedRole] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        console.log("Employee: ");
        console.log(employee);
    }, []);

    useEffect(() => {
        axiosInstance.get('/settings/getRoles', { headers })
            .then((response) => {
                setRoles(response.data.roles);
                setIsRolesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                setBranches(response.data.branches);
                setIsBranchesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getJobTitles', { headers })
            .then((response) => {
                setJobTitles(response.data.jobTitles);
                setIsJobTitlesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                setDepartments(response.data.departments);
                setIsDepartmentsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
            });
    }, []);

    const checkInput = (event) => {
        event.preventDefault();

        if (!name) {
            setNameError(true);
        } else {
            setNameError(false);
        }

        if (!acronym) {
            setAcronymError(true);
        } else {
            setAcronymError(false);
        }

        if (!name || !acronym) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            saveInput(event);
        }
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Employment Details </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    id="role"
                                    label="Role"
                                    value={selectedRole}
                                    onChange={(event) => setSelectedRole(event.target.value)}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}> {role.name} ({role.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="jobTitle"
                                    label="Job Title"
                                    value={selectedJobTitle}
                                    onChange={(event) => setSelectedJobTitle(event.target.value)}
                                >
                                    {jobTitles.map((jobTitle) => (
                                        <MenuItem key={jobTitle.id} value={jobTitle.id}> {jobTitle.name} ({jobTitle.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    id="department"
                                    label="Department"
                                    value={selectedDepartment}
                                    onChange={(event) => setSelectedDepartment(event.target.value)}
                                >
                                    {departments.map((department) => (
                                        <MenuItem key={department.id} value={department.id}> {department.name} ({department.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="branch"
                                    label="Branch"
                                    value={selectedBranch}
                                    onChange={(event) => setSelectedBranch(event.target.value)}
                                >
                                    {branches.map((branch) => (
                                        <MenuItem key={branch.id} value={branch.id}> {branch.name} ({branch.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="startDate"
                                        label="Start Date"
                                        variant="outlined"
                                        onChange={(newValue) => setStartDate(newValue)}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    id="type"
                                    label="Employment Type"
                                    value={selectedType}
                                    onChange={(event) => setSelectedType(event.target.value)}
                                >
                                    <MenuItem key="probation" value="probation"> Probation </MenuItem>
                                    <MenuItem key="regular" value="regular"> Regular </MenuItem>
                                    <MenuItem key="partTime" value="partTime"> Part-Time </MenuItem>
                                    <MenuItem key="fullTime" value="fullTime"> Full-Time </MenuItem>

                                </TextField>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="status"
                                    label="Employee Status"
                                    value={selectedStatus}
                                    onChange={(event) => setSelectedStatus(event.target.value)}
                                >
                                    <MenuItem key="active" value="active"> Active </MenuItem>
                                    <MenuItem key="resigned" value="resigned"> Resigned </MenuItem>
                                    <MenuItem key="terminated" value="terminated"> Terminated </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="endDate"
                                        label="End Date"
                                        variant="outlined"
                                        onChange={(newValue) => setEndDate(newValue)}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Details </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default EmploymentDetailsEdit;
