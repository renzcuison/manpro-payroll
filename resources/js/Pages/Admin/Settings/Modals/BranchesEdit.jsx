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

const BranchesEdit = ({ open, close, branchInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [name, setName] = useState(branchInfo.name);
    const [acronym, setAcronym] = useState(branchInfo.acronym);
    const [address, setAddress] = useState(branchInfo.address);
    const [leaveLimit, setLeaveLimit] = useState(branchInfo.leave_limit);
    const [status, setStatus] = useState(branchInfo.status);

    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    const [addressError, setAddressError] = useState(false);
    const [leaveLimitError, setLeaveLimitError] = useState(false);
    const [statusError, setStatusError] = useState(false);

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

        if (!address) {
            setAddressError(true);
        } else {
            setAddressError(false);
        }

        if (!status) {
            setStatusError(true);
        } else {
            setStatusError(false);
        }

        if (leaveLimit == null) {
            setLeaveLimitError(true);
        } else {
            setLeaveLimitError(false);
        }

        if (!name || !acronym || !address || !status || leaveLimit == null) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This branch will be updated",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
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
            id: branchInfo.id,
            name: name,
            acronym: acronym,
            address: address,
            leave_limit: leaveLimit,
            status: status
        };

        /*

        axiosInstance.post('/settings/saveBranch', data, { headers })
            .then(response => {
                if (response.data.status === 200) {

                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Branch saved successfully!",
                        icon: "success",
                        timer: 1000,
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
            */
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Branch </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '59%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={acronym}
                                    error={acronymError}
                                    onChange={(e) => setAcronym(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel id="branch-status-label">
                                    Status
                                </InputLabel>
                                <Select
                                    required
                                    labelId="branch-status-label"
                                    id="branch-status"
                                    value={status}
                                    error={statusError}
                                    label="Status"
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <MenuItem value="Active">
                                        Active
                                    </MenuItem>
                                    <MenuItem value="Inactive">
                                        Inactive
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '79%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    value={address}
                                    error={addressError}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="leave_limit"
                                    label="Leave Limit"
                                    variant="outlined"
                                    value={leaveLimit}
                                    error={leaveLimitError}
                                    onChange={(e) => setLeaveLimit(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Branch </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default BranchesEdit;
