import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText, } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

const LeaveCreditAdd = ({ open, close, empId }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [leaveType, setLeaveType] = useState('');
    const [leaveTypeSet, setLeaveTypeSet] = useState([]);
    const [creditCount, setCreditCount] = useState('');

    const [leaveTypeError, setLeaveTypeError] = useState(false);
    const [creditCountError, setCreditCountError] = useState(false);

    const [leaveCredits, setLeaveCredits] = useState([]);

    // Application Types
    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationTypes`, { headers })
            .then((response) => {
                setLeaveTypeSet(response.data.types);
            })
            .catch((error) => {
                console.error("Error fetching leave types:", error);
            });

        axiosInstance.get(`/applications/getLeaveCredits/${empId}`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }, []);

    const checkInput = (event) => {
        event.preventDefault();

        setLeaveTypeError(!leaveType);
        setCreditCountError(!creditCount);

        if (!leaveType || !creditCount) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to add this leave credit?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            emp_id: empId,
            app_type_id: leaveType,
            credit_count: creditCount,
        };

        console.log(data);
        axiosInstance.post('/applications/saveLeaveCredits', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    document.activeElement.blur();
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Leave Credits added successfully!",
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

    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"
                PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Leave Credit </Typography>
                        <IconButton onClick={close}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                mt: 1,
                                marginBottom: 3, width: '29%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    select
                                    id="leave-type"
                                    label="Leave Type"
                                    value={leaveType}
                                    error={leaveTypeError}
                                    onChange={(event) => setLeaveType(event.target.value)}
                                >
                                    {leaveTypeSet
                                        .filter(type => !leaveCredits.some(credit => credit.app_type_id === type.id))
                                        .map((type, index) => (
                                            <MenuItem key={index} value={type.id}>
                                                {type.name}
                                            </MenuItem>
                                        ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{
                                mt: 1,
                                marginBottom: 3, width: '69%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="credits"
                                    label="Credits"
                                    variant="outlined"
                                    value={creditCount}
                                    error={creditCountError}
                                    type="number"
                                    inputProps={{
                                        min: 0,
                                        step: 1
                                    }}
                                    onChange={(e) => setCreditCount(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Leave Credit </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default LeaveCreditAdd;