import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const GenerateFormLink = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [useLimit, setUseLimit] = useState(1);
    const [expirationDate, setExpirationDate] = useState(dayjs());
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [useLimitError, setUseLimitError] = useState(false);
    const [expirationDateError, setExpirationDateError] = useState(false);

    // ---- Departments and Branches
    useEffect(() => {
        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                setBranches(response.data.branches);
            }).catch((error) => {
                console.error('Error fetching branches:', error);
            });
        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                setDepartments(response.data.departments);
            }).catch((error) => {
                console.error('Error fetching departments:', error);
            });
    }, []);

    const checkInput = (event) => {
        event.preventDefault();

        if (!useLimit) {
            setUseLimitError(true);
        } else {
            setUseLimitError(false);
        }
        if (!expirationDate) {
            setExpirationDateError(true);
        } else {
            setExpirationDateError(false);
        }

        if (!useLimit || !expirationDate) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All Required fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to generate a form link?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Generate',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    }

    const saveInput = (event) => {
        event.preventDefault();
        const data = {
            use_limit: useLimit,
            expiry_date: expirationDate.format("YYYY-MM-DD HH:mm:ss"),
            branch: selectedBranch,
            department: selectedDepartment
        };

        axiosInstance.post('/employee/saveFormLink', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    document.activeElement.blur();
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Form Link generated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

    }

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}>
                            Generate Form Link
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            {/* Use Limit */}
                            <FormControl sx={{
                                mt: 1, marginBottom: 3, width: '24%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="limit"
                                    label="Use Limit"
                                    variant="outlined"
                                    value={useLimit}
                                    error={useLimitError}
                                    type="number"
                                    inputProps={{
                                        min: 0,
                                        step: 1
                                    }}
                                    onChange={(e) => setUseLimit(e.target.value)}
                                />
                            </FormControl>
                            {/* Expiration Date */}
                            <FormControl sx={{
                                mt: 1, marginBottom: 3, width: '24%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="Expiration Date"
                                        value={expirationDate}
                                        minDate={dayjs()}
                                        timeSteps={{ minutes: 1 }}
                                        onChange={(newValue) => setExpirationDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                error: expirationDateError,
                                                readOnly: true,
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                            {/* Department Selection */}
                            <FormControl sx={{
                                mt: 1, marginBottom: 3, width: '24%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
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
                            {/* Branch Selection */}
                            <FormControl sx={{
                                mt: 1, marginBottom: 3, width: '24%', '& label.Mui-focused': { color: '#97a5ba' },
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
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Generate </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default GenerateFormLink;