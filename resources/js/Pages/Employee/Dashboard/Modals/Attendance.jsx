import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import moment from 'moment';
import dayjs from 'dayjs';

const Attendance = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [workGroups, setWorkGroups] = useState([]);

    const [selectedRole, setSelectedRole] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedWorkGroup, setSelectedWorkGroup] = useState('');

    // useEffect(() => {
    //     axiosInstance.get('/settings/getRoles', { headers })
    //         .then((response) => {
    //             setRoles(response.data.roles);
    //             setSelectedRole(employee.role_id);
    //         }).catch((error) => {
    //             console.error('Error fetching branches:', error);
    //         });

    //     axiosInstance.get('/settings/getBranches', { headers })
    //         .then((response) => {
    //             setBranches(response.data.branches);
    //             setSelectedBranch(employee.branch_id);
    //         }).catch((error) => {
    //             console.error('Error fetching branches:', error);
    //         });

    //     axiosInstance.get('/settings/getJobTitles', { headers })
    //         .then((response) => {
    //             setJobTitles(response.data.jobTitles);
    //             setSelectedJobTitle(employee.job_title_id);
    //         }).catch((error) => {
    //             console.error('Error fetching branches:', error);
    //         });

    //     axiosInstance.get('/settings/getDepartments', { headers })
    //         .then((response) => {
    //             setDepartments(response.data.departments);
    //             setSelectedDepartment(employee.department_id);
    //         }).catch((error) => {
    //             console.error('Error fetching departments:', error);
    //         });

    //     axiosInstance.get('/workshedule/getWorkGroups', { headers })
    //         .then((response) => {
    //             setWorkGroups(response.data.workGroups);
    //             setSelectedWorkGroup(employee.work_group_id);
    //         }).catch((error) => {
    //             console.error('Error fetching branches:', error);
    //         });
    // }, []);

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            id: employee.id,
            selectedRole: selectedRole,
            selectedBranch: selectedBranch,
            selectedJobTitle: selectedJobTitle,
            selectedDepartment: selectedDepartment,
            selectedWorkGroup: selectedWorkGroup,
            selectedType: selectedType,
            selectedStatus: selectedStatus,
            startDate: startDate,
            endDate: endDate,
        };

        axiosInstance.post('/employee/editEmmployeeDetails', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Employment Details updated successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (onUpdateEmployee) {
                            onUpdateEmployee();
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Attendance </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={saveInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    id="role"
                                    label="Role"
                                >
                                </TextField>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="jobTitle"
                                    label="Job Title"
                                >
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="workGroup"
                                    label="Work Group"
                                >
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
                                >
                                </TextField>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="branch"
                                    label="Branch"
                                >
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="startDate"
                                        label="Start Date"
                                        slotProps={{ textField: { variant: 'outlined' }}}
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
                                >
                                    <MenuItem key="Probation" value="Probation"> Probation </MenuItem>
                                    <MenuItem key="Regular" value="Regular"> Regular </MenuItem>
                                    <MenuItem key="Part-Time" value="Part-Time"> Part-Time </MenuItem>
                                    <MenuItem key="Full-Time" value="Full-Time"> Full-Time </MenuItem>
                                </TextField>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="status"
                                    label="Employee Status"
                                >
                                    <MenuItem key="Active" value="Active"> Active </MenuItem>
                                    <MenuItem key="Resigned" value="Resigned"> Resigned </MenuItem>
                                    <MenuItem key="Terminated" value="Terminated"> Terminated </MenuItem>
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
                                        slotProps={{ textField: { variant: 'outlined' }}}
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

export default Attendance;
