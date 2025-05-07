import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Divider, Avatar } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';
import dayjs from "dayjs";

import InfoBox from "../../../../components/General/InfoBox";

const ViewOvertime = ({ open, close, overtime }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [appResponse, setAppResponse] = useState('');
    const [appResponseError, setAppResponseError] = useState(false);

    const timeIn = dayjs(overtime.time_in);
    const timeOut = dayjs(overtime.time_out);
    const date = timeIn.format('YYYY-MM-DD');
    const diffInMinutes = timeOut.diff(timeIn, 'minute');
    const totalHours = Math.floor(diffInMinutes / 59);

    const checkInput = (event) => {
        event.preventDefault();

        if (!appResponse) {
            setAppResponseError(true);
        } else {
            setAppResponseError(false);
        }
        if (!appResponse) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Select an Action!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: `${appResponse} application?`,
                text: "This action cannot be undone",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: appResponse,
                confirmButtonColor: `${appResponse == "Approve" ? "#177604" : "#f44336"}`,
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    }

    const saveInput = () => {
        const data = { app_id: overtime.application, app_response: appResponse, totalHours: totalHours, date: date }

        axiosInstance.post("/applications/manageOvertimeApplication", data, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Overtime successfully ${appResponse == "Approve" ? "Approved" : "Declined"}`,
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        close(true);
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
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
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: { xs: "100%", sm: "900px" },
                        maxWidth: '1000px',
                        maxHeight: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Manage Overtime Application </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex' }}>
                        <Box sx={{ mt: 1, width: "50%" }}>
                            <Grid container spacing={2}>

                                <Grid size={12} align="left">
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                        Application Details
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Type" compact clean />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Requested" info={dayjs(overtime.requested).format('MMMM D, YYYY hh:mm A')} compact clean />
                                </Grid>

                                {/* <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Overtime Date" info={dayjs(overtime.time_in).format('MMMM D, YYYY')} compact clean />
                                </Grid> */}

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Start" info={dayjs(overtime.time_in).format('MMMM D, YYYY hh:mm A')} compact clean />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="End" info={dayjs(overtime.time_out).format('MMMM D, YYYY hh:mm A')} compact clean />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Total Hours" info={`${totalHours} Hour(s)`} compact clean />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>

                                <Grid size={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}> Reason </Typography>
                                    <Typography> {overtime.reason} </Typography>
                                </Grid>

                                <Grid size={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>

                                <Grid container size={{ xs: 12 }} sx={{ alignItems: "center" }} >
                                    <Grid size={{ xs: 5 }} align="left">
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}> Action </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 7 }} align="left">
                                        <FormControl fullWidth>
                                            <InputLabel id="app-response-label"> Select Action </InputLabel>
                                            <Select labelId="app-response-label" id="app-response" value={appResponse} error={appResponseError} label="Select Action" onChange={(event) => setAppResponse(event.target.value)} >
                                                <MenuItem value="Approve"> Approve </MenuItem>
                                                <MenuItem value="Decline"> Decline </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid size={12} align="center">
                                    <Button variant="contained" sx={{ mt: 2, backgroundColor: "#177604", color: "white" }} onClick={checkInput} >
                                        <p className="m-0">
                                            <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}Confirm Response{" "}
                                        </p>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        <Box sx={{ width: "50%" }}>
                            <Grid container rowSpacing={2}>
                                <Grid size={12} align="left">
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                        Employee Information
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box display="flex" sx={{ width: "100%" }}>
                                        <Box sx={{ width: "40%", placeContent: "center", placeItems: "center" }}>
                                            <Avatar sx={{ height: "58px", width: "58px", mr: 4 }} />
                                        </Box>
                                        <Box display="flex" sx={{ width: "60%", alignItems: "center" }}>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}> {`${overtime.emp_name}`} </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid size={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Position" info={overtime.emp_job_title} compact clean />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Branch" info={overtime.emp_branch} compact clean />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <InfoBox title="Department" info={overtime.emp_department} compact clean />
                                </Grid>
                                <Grid size={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default ViewOvertime;
