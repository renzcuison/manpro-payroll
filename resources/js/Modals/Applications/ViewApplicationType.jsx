import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Divider, Stack, Tooltip, TableContainer, TableHead, TableBody, TableRow, TableCell, Table, } from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import moment from "moment";


const ViewApplicationType = ({ open, close, applicationType }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [nameError, setNameError] = useState(false);
    const [percentageError, setPercentageError] = useState(false);
    const [tenureshipError, setTenureshipError] = useState(false);

    const [name, setName] = useState(applicationType.name);
    const [amount, setAmount] = useState(applicationType.amount);
    const [percentage, setPercentage] = useState(applicationType.percentage);

    const [paidLeave, setPaidLeave] = useState(applicationType.is_paid_leave);
    const [tenureship, setTenureship] = useState(applicationType.tenureship_required);
    const [requireFiles, setRequireFiles] = useState(applicationType.require_files);

    const checkInput = (event) => {
        event.preventDefault();

        // setNameError(!name);
        // setTenureshipError(!tenureship);

        if (!name || !tenureship) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All Required fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This Application Type will be updated",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Add",
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
            applicationType: applicationType.id,
            name: name,
            percentage: percentage,
            paidLeave: paidLeave,
            tenureship: tenureship,
            requireFiles: requireFiles,
        };

        axiosInstance.post('/applications/editApplicationType', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Application Type Updated Successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/admin/application/types`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "850px" }, maxWidth: '900px', maxHeight: '750px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}> {" "}View Application Type{" "} </Typography>
                        <IconButton onClick={close}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{ mt: 1, marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
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

                            <FormControl sx={{ mt: 1, marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                <TextField
                                    required
                                    id="percentage"
                                    label="Percentage"
                                    variant="outlined"
                                    value={percentage}
                                    error={percentageError}
                                    onChange={(e) => setPercentage(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{ mt: 1, marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                <TextField select id="paidLeave" label="Paid Leave" value={paidLeave} onChange={(event) => setPaidLeave(event.target.value)} >
                                    <MenuItem value={1}> Yes </MenuItem>
                                    <MenuItem value={0}> No </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ mt: 1, marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                <TextField select id="requireFiles" label="Require Files" value={requireFiles} onChange={(event) => setRequireFiles(event.target.value)} >
                                    <MenuItem value={1}> Yes </MenuItem>
                                    <MenuItem value={0}> No </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ mt: 1, marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                <TextField
                                    required
                                    id="tenureship"
                                    label="Tenureship Requirement (months)"
                                    variant="outlined"
                                    value={tenureship}
                                    error={tenureshipError}
                                    type="number"
                                    inputProps={{ min: 0, step: 1 }}
                                    onChange={(e) => setTenureship(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Type </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>

            </Dialog >
        </>
    );
};

export default ViewApplicationType;
