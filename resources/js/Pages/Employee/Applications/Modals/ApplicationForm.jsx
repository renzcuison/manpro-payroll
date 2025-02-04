import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    FormHelperText,
    Switch,
    Select,
    MenuItem,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const ApplicationForm = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [appType, setAppType] = useState("");
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [applicationDuration, setApplicationDuration] = useState("");
    const [applicationTypes, setApplicationTypes] = useState([]);

    // Form Requirement Sets
    const [appTypeError, setAppTypeError] = useState(false);
    const [fromDateError, setFromDateError] = useState(false);
    const [toDateError, setToDateError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);

    const handleAttachmentChange = (event) => {
        const selectedAttachment = event.target.files[0];
        setAttachment(selectedAttachment);
    };

    const handleTextFieldClick = (event) => {
        attachmentInput.current.click();
    };
    const attachmentInput = useRef(null);

    const handleTypeChange = (value) => {
        setAppType(value);
    };

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationTypes`, { headers })
            .then((response) => {
                setApplicationTypes(response.data.types);
            })
            .catch((error) => {
                console.error("Error fetching application types:", error);
            });
    }, []);

    const handleApplicationSubmit = (event) => {
        event.preventDefault();

        if (!appType) {
            setAppTypeError(true);
        } else {
            setAppTypeError(false);
        }
        if (!fromDate) {
            setFromDateError(true);
        } else {
            setFromDateError(false);
        }
        if (!toDate) {
            setToDateError(true);
        } else {
            setToDateError(false);
        }
        if (!description) {
            setDescriptionError(true);
        } else {
            setDescriptionError(false);
        }
        if (!attachment) {
            setAttachmentError(true);
        } else {
            setAttachmentError(false);
        }

        if (!appType || !fromDate || !toDate || !description || !attachment) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to submit this application?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveApplication(event);
                }
            });
        }
    };

    const saveApplication = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("type_id", appType);
        formData.append("from_date", fromDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("to_date", toDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("description", description);
        formData.append("attachment", attachment);

        axiosInstance
            .post("/applications/saveApplication", formData, {
                headers,
            })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `You application has been submitted!`,
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
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    // Duration Calculation
    useEffect(() => {
        const duration = dayjs.duration(toDate.diff(fromDate));

        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();

        let parts = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
        if (minutes > 0)
            parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

        const durationInfo = parts.length > 0 ? parts.join(", ") : "None";

        setApplicationDuration(durationInfo);
    }, [fromDate, toDate]);

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "500px" },
                        maxWidth: "650px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, paddingBottom: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ marginLeft: 1, fontWeight: "bold" }}
                        >
                            {" "}
                            Submit an Application{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ paddingBottom: 5 }}>
                    <Box
                        component="form"
                        onSubmit={handleApplicationSubmit}
                        noValidate
                        autoComplete="off"
                    >
                        <Grid container columnSpacing={2} rowSpacing={3}>
                            {/* Application Type Selector */}
                            <Grid item xs={12}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#97a5ba",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#97a5ba",
                                            },
                                        },
                                    }}
                                >
                                    <TextField
                                        required
                                        select
                                        id="application-type"
                                        label="Application Type"
                                        value={appType}
                                        error={appTypeError}
                                        onChange={(event) =>
                                            handleTypeChange(event.target.value)
                                        }
                                    >
                                        {applicationTypes.map((log, index) => (
                                            <MenuItem
                                                key={index}
                                                value={log.id}
                                            >
                                                {log.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Grid>
                            {/* From Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="From Date"
                                        value={fromDate}
                                        error={fromDateError}
                                        minDate={dayjs()}
                                        onChange={(newValue) => {
                                            setFromDate(newValue);
                                            if (newValue.isAfter(toDate)) {
                                                setToDate(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* To Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="To Date"
                                        value={toDate}
                                        error={toDateError}
                                        minDateTime={fromDate}
                                        onChange={(newValue) => {
                                            setToDate(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* Duration */}
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Duration"
                                        value={applicationDuration}
                                        InputProps={{ readOnly: true }}
                                    ></TextField>
                                </FormControl>
                            </Grid>
                            {/* File Upload */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        label="Upload File"
                                        value={
                                            attachment
                                                ? `${
                                                      attachment.name
                                                  }, ${getFileSize(
                                                      attachment.size
                                                  )}`
                                                : ""
                                        }
                                        error={attachmentError}
                                        onClick={handleTextFieldClick}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: !attachment && (
                                                <InputAdornment position="end">
                                                    <InsertDriveFileIcon />
                                                </InputAdornment>
                                            ),
                                            startAdornment: attachment && (
                                                <InputAdornment position="start">
                                                    <InsertDriveFileIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        variant="outlined"
                                    />
                                    <input
                                        type="file"
                                        name="attachment"
                                        ref={attachmentInput}
                                        style={{ display: "none" }}
                                        onChange={handleAttachmentChange}
                                    />
                                </FormControl>
                            </Grid>
                            {/* Description Field */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Description"
                                        variant="outlined"
                                        value={description}
                                        error={descriptionError}
                                        onChange={(event) => {
                                            if (
                                                event.target.value.length <= 512
                                            ) {
                                                setDescription(
                                                    event.target.value
                                                );
                                            }
                                        }}
                                        inputProps={{ maxLength: 512 }}
                                    />
                                    <FormHelperText>
                                        {description.length}/{512}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationForm;
