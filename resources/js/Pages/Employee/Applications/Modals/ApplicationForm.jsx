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
    Stack
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
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
    const [applicationTypes, setApplicationTypes] = useState([]);
    const [appType, setAppType] = useState("");

    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    const [applicationDuration, setApplicationDuration] = useState("");

    const [description, setDescription] = useState("");

    const [attachment, setAttachment] = useState([]);
    const [image, setImage] = useState([]);

    // Form Requirement Sets
    const [appTypeError, setAppTypeError] = useState(false);

    const [fromDateError, setFromDateError] = useState(false);
    const [toDateError, setToDateError] = useState(false);

    const [descriptionError, setDescriptionError] = useState(false);

    const [fileRequired, setFileRequired] = useState(false);
    const [fileError, setFileError] = useState(false);


    // Application Types
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

    const handleTypeChange = (value) => {
        const selectedType = applicationTypes.find(type => type.id == value);
        setFileRequired(selectedType.require_files);
        setAppType(value);
    };

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, 5, 10485760);
        if (validFiles) {
            setAttachment(prev => [...prev, ...files]);
        }
    };

    const handleDeleteAttachment = (index) => {
        setAttachment(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );

    };

    // Image Handlers
    const handleImageUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, image.length, 10, 5242880);
        if (validFiles) {
            setImage(prev => [...prev, ...files]);
        }
    };

    const handleDeleteImage = (index) => {
        setImage(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );

    };

    // Validate Files
    const validateFiles = (newFiles, currentFileCount, countLimit, sizeLimit) => {
        if (newFiles.length + currentFileCount > countLimit) {
            // The File Limit has been Exceeded
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "The File Limit has been Exceeded!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
            return false;
        } else {
            let largeFiles = 0;
            newFiles.forEach((file) => {
                if (file.size > sizeLimit) {
                    largeFiles++;
                }
            });
            if (largeFiles > 0) {
                // A File is Too Large
                document.activeElement.blur();
                Swal.fire({
                    customClass: { container: "my-swal" },
                    text: "A File is Too Large",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: "#177604",
                });
                return false;
            } else {
                // All File Criteria Met
                return true;
            }
        }
    }

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Input Verification
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
        if (fileRequired && (!attachment.length > 0) && (!image.length > 0)) {
            setFileError(true);
        } else {
            setFileError(false);
        }

        if (!appType || !fromDate || !toDate || !description || (fileRequired && (!attachment.length > 0) && (!image.length > 0))) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All Required Fields must be filled!",
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

    // Final Submission
    const saveApplication = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("type_id", appType);
        formData.append("from_date", fromDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("to_date", toDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("description", description);
        if (attachment.length > 0) {
            attachment.forEach(file => {
                formData.append('attachment[]', file);
            });
        }
        if (image.length > 0) {
            image.forEach(file => {
                formData.append('image[]', file);
            });
        }

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
                    text: `Your application has been submitted!`,
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
                            variant="h4"
                            sx={{ ml: 1, mt: 2, fontWeight: "bold" }}
                        >
                            {" "}
                            Create Application{" "}
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
                            <Grid item xs={12} sx={{ mt: 1 }}>
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
                                        {applicationTypes.map((type, index) => (
                                            <MenuItem key={index} value={type.id}>
                                                {type.name}
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
                                        label="From"
                                        value={fromDate}
                                        error={fromDateError}
                                        minDate={dayjs()}
                                        timeSteps={{ minutes: 1 }}
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
                                        label="To"
                                        value={toDate}
                                        error={toDateError}
                                        minDateTime={fromDate}
                                        timeSteps={{ minutes: 1 }}
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
                            {/* Attachment Upload */}
                            <Grid item xs={12}>
                                {/* File Requirement */}
                                {fileError && <Typography variant="caption" color="error" sx={{ mb: 2 }}>
                                    You must include supporting files for this type of application!
                                </Typography>
                                }
                                <FormControl fullWidth>
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
                                                <Typography noWrap>
                                                    Documents
                                                </Typography>
                                                <input
                                                    accept=".doc, .docx, .pdf, .xls, .xlsx"
                                                    id="attachment-upload"
                                                    type="file"
                                                    name="attachment"
                                                    multiple
                                                    style={{ display: "none" }}
                                                    onChange={handleAttachmentUpload}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: "auto" }}
                                                    onClick={() => document.getElementById('attachment-upload').click()}
                                                >
                                                    <p className="m-0">
                                                        <i className="fa fa-plus"></i> Add
                                                    </p>
                                                </Button>
                                            </Box>
                                            {attachment.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>

                                        {attachment.length > 0 && (
                                            <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                                {attachment.map((file, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        <Typography noWrap>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                        <IconButton onClick={() => handleDeleteAttachment(index)} size="small">
                                                            <Cancel />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </FormControl>
                            </Grid>
                            {/* Image Upload */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
                                                <Typography noWrap>
                                                    Images
                                                </Typography>
                                                <input
                                                    accept=".png, .jpg, .jpeg"
                                                    id="image-upload"
                                                    type="file"
                                                    name="image"
                                                    multiple
                                                    style={{ display: "none" }}
                                                    onChange={handleImageUpload}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: 'auto' }}
                                                    onClick={() => document.getElementById('image-upload').click()}
                                                >
                                                    <p className="m-0">
                                                        <i className="fa fa-plus"></i> Add
                                                    </p>
                                                </Button>
                                            </Box>
                                            {image.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {image.length > 0 && (
                                            <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                                {image.map((file, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        <Typography noWrap>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                        <IconButton onClick={() => handleDeleteImage(index)} size="small">
                                                            <Cancel />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </FormControl>
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                align="center"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#177604",
                                        color: "white",
                                    }}
                                    className="m-1"
                                >
                                    <p className="m-0">
                                        <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}
                                        Submit Application{" "}
                                    </p>
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
