import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Divider } from '@mui/material';
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

const OvertimeManage = ({ open, close, overtime }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState(false);

    const formatTime = (time) => {
        return time ? dayjs(`${overtime.date}T${time}`).format('hh:mm:ss A') : '';
    };

    const formatDate = (date) => {
        return date ? dayjs(date).format('MM/DD/YYYY') : '';
    };

    const checkInput = () => {
        setReasonError(!reason);

        if (!reason) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: 'Add a Reason',
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to submit this overtime?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput();
                }
            });
        }
    }

    const saveInput = () => {
        const formData = new FormData();
        formData.append("ot_date", overtime.date);
        formData.append("ot_in", overtime.timeIn);
        formData.append("ot_out", overtime.timeOut);
        formData.append("reason", reason);

        axiosInstance
            .post("/applications/saveOvertimeApplication", formData, {
                headers,
            })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Overtime successfully submitted`,
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
                    style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '800px', marginBottom: '5%' }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Overtime Application </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box sx={{ mt: 1, width: "100%" }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4 }}>
                                <TextField
                                    label="Date"
                                    value={formatDate(overtime.date)}
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField
                                    label="Time In"
                                    value={formatTime(overtime.timeIn)}
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField
                                    label="Time Out"
                                    value={formatTime(overtime.timeOut)}
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Reason"
                                    variant="outlined"
                                    value={overtime.reason || reason}
                                    error={reasonError}
                                    onChange={(event) => {
                                        if (event.target.value.length <= 512) {
                                            setReason(event.target.value);
                                        }
                                    }}
                                    helperText={reasonError ? "Reason is required" : `${reason.length}/512`}
                                    InputProps={{
                                        readOnly: overtime.reason,
                                    }}
                                />
                            </Grid>
                            <Grid size={12} sx={{ my: 0 }}>
                                <Divider />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InfoBox
                                    title="Status"
                                    info={overtime.status == "Unapplied" ? "You have not submitted this overtime period yet." : overtime.status.toUpperCase()}
                                    compact
                                    clean
                                    color={["Approved", "Paid"].includes(overtime.status)
                                        ? "#177604"
                                        : overtime.status === "Declined"
                                            ? "#f44336"
                                            : overtime.status === "Pending"
                                                ? "#e9ae20"
                                                : overtime.status === "Cancelled"
                                                    ? "#f57c00"
                                                    : "#000000"
                                    }
                                />
                            </Grid>
                            {overtime.status == "Unapplied" ? (
                                <>
                                    <Grid size={12} sx={{ my: 0 }}>
                                        <Divider />
                                    </Grid>
                                    <Grid size={{ xs: 12 }} align="center" sx={{ justifyContent: "center", alignItems: "center", }} >
                                        <Button
                                            onClick={checkInput}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "#177604",
                                                color: "white",
                                            }}
                                            className="m-1"
                                        >
                                            <p className="m-0">
                                                <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}
                                                Submit Overtime{" "}
                                            </p>
                                        </Button>
                                    </Grid>
                                </>
                            ) : (
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Application Date"
                                        info={dayjs(overtime.requested).format('MMMM D, YYYY hh:mm A')}
                                        compact
                                        clean
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default OvertimeManage;
