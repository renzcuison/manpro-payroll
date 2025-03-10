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
    Stack,
    Radio
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const TrainingsAdd = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [trainingCourses, setTrainingCourses] = useState([]);
    const [course, setCourse] = useState('');
    const [title, setTitle] = useState("");

    const [startDate, setFromDate] = useState(dayjs());
    const [endDate, setToDate] = useState(dayjs());

    const [trainingDuration, setTrainingDuration] = useState(0);
    const [trainingMinutes, setTrainingMinutes] = useState(0);
    const [trainingHours, setTrainingHours] = useState(0);

    const [description, setDescription] = useState("");
    const [image, setImage] = useState([]);
    const [coverImage, setCoverImage] = useState(null);
    const [attachment, setAttachment] = useState([]);
    const [linkInput, setLinkInput] = useState('');
    const [links, setLinks] = useState([]);

    // Form Errors
    const [courseError, setCourseError] = useState(false);
    const [titleError, setTitleError] = useState(false);

    const [fromDateError, setFromDateError] = useState(false);
    const [toDateError, setToDateError] = useState(false);

    const [descriptionError, setDescriptionError] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [coverImageError, setCoverImageError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);

    // Training Duration
    useEffect(() => {
        const trainingHoursNumber = parseInt(trainingHours) || 0;
        const trainingMinutesNumber = parseInt(trainingMinutes) || 0;

        const duration = (trainingHoursNumber * 60) + trainingMinutesNumber;
        setTrainingDuration(duration);
    }, [trainingHours, trainingMinutes]);

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, 10, 10485760, "document");
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
        let validFiles = validateFiles(files, image.length, 20, 5242880, "image");
        if (validFiles) {
            setImage(prev => [...prev, ...files]);
        }
    };
    const handleDeleteImage = (index) => {
        setImage(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );
    };

    // Cover Image Handler
    const handleCoverUpload = (input) => {
        const file = input.target.files[0];
        if (file && file.size > 5242880) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "File Too Large!",
                text: `The file size limit is 5 MB!`,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            setCoverImage(file);
        }
    }

    // Validate Files
    const validateFiles = (newFiles, currentFileCount, countLimit, sizeLimit, docType) => {
        if (newFiles.length + currentFileCount > countLimit) {
            // The File Limit has been Exceeded
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "File Limit Reached!",
                text: `You can only have up to ${countLimit} ${docType}s at a time.`,
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
                    title: "File Too Large!",
                    text: `Each ${docType} can only be up to ${docType == "image" ? "5 MB" : "10 MB"}.`,
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

    // Link Handlers
    const handleLinkAdd = (event) => {
        const newLink = linkInput.trim();
        if (!links.includes(newLink) && isValidUrl(newLink) && links.length < 10) {
            setLinks(prev => [...prev, newLink]);
            setLinkInput('');
            event.target.value = '';
        } else if (links.includes(newLink)) {
            handleMediaError("Duplicate Link!", "This URL is already added.");
        } else if (links.length >= 10) {
            handleMediaError("Link Limit Reached!", "You can only have up to 10 links at a time.");
        } else {
            handleMediaError("Invalid URL!", "Please enter a valid URL starting with http:// or https://");
        }
    };
    const handleDeleteLink = (index) => {
        setLinks(prevLinks =>
            prevLinks.filter((_, i) => i !== index)
        );
    };

    // Validate Links
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    };

    const handleMediaError = (title, error) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: title,
            text: message,
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#177604",
        });
    }

    const checkInput = (event) => {
        event.preventDefault();

        setTitleError(!title);
        setDescriptionError(!description);
        setFromDateError(!startDate);
        setToDateError(!endDate);

        if (!title || !description || !startDate || !endDate) {
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
                text: "Do you want to save this training?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);                   //saveInput(event);
                }
            });
        }

    }

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("start_date", startDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("end_date", endDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("duration", trainingDuration);
        formData.append("cover_image", coverImage);
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
        if (links.length > 0) {
            links.forEach(link => {
                formData.append('link[]', link);
            });
        }

        axiosInstance.post("/trainings/saveTraining", formData, { headers })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `Your training has been saved!`,
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then((res) => {
                    if (res.isConfirmed) {
                        close(true);
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

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '800px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Create Training </Typography>
                        <IconButton onClick={() => close(false)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" >
                        <Grid container columnSpacing={2} rowSpacing={3}>
                            {/* Title Field */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Title"
                                        variant="outlined"
                                        value={title}
                                        error={titleError}
                                        onChange={(event) => {
                                            if (event.target.value.length <= 128) {
                                                setTitle(event.target.value);
                                            }
                                        }}
                                        inputProps={{ maxLength: 128 }}
                                    />
                                    <FormHelperText>
                                        {title.length}/{128}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            {/* Cover Image */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        label="Cover Image"
                                        variant="outlined"
                                        value={coverImage ? `${coverImage.name}, ${getFileSize(coverImage.size)}` : ""}
                                        error={coverImageError}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            document.getElementById('cover-image-upload').click();
                                        }}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {coverImage && (
                                                        <IconButton
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setCoverImage(null);
                                                            }}
                                                            size="small"
                                                            sx={{ marginLeft: '8px' }}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    )}
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="Upload a cover image (.png, .jpg, .jpeg), 5 MB size limit"
                                    />
                                    <input
                                        accept=".png, .jpg, .jpeg"
                                        id="cover-image-upload"
                                        type="file"
                                        name="image"
                                        style={{ display: "none" }}
                                        onChange={handleCoverUpload}
                                    />
                                </FormControl>
                            </Grid>
                            {/* Start Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="Starts"
                                        value={startDate}
                                        minDate={dayjs()}
                                        timeSteps={{ minutes: 1 }}
                                        onChange={(newValue) => {
                                            setFromDate(newValue);
                                            if (newValue.isAfter(endDate)) {
                                                setToDate(newValue);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: fromDateError,
                                                readOnly: true,
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* End Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="Ends"
                                        value={endDate}
                                        minDateTime={startDate}
                                        timeSteps={{ minutes: 1 }}
                                        onChange={(newValue) => setToDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                error: toDateError,
                                                readOnly: true,
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* Duration */}
                            <Grid item container xs={4} spacing={1}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="number"
                                            label="Duration"
                                            value={trainingHours}
                                            onChange={(event) => {
                                                if (event.target.value) {
                                                    setTrainingHours(event.target.value)
                                                } else {
                                                    setTrainingHours(0);
                                                }

                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Hr
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                inputProps: {
                                                    min: 0,
                                                },
                                            }}
                                            inputProps={{
                                                pattern: '[0-9]*',
                                                inputMode: 'numeric',
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="number"
                                            value={trainingMinutes}
                                            onChange={(event) => {
                                                if (event.target.value) {
                                                    if (event.target.value > 59) {
                                                        setTrainingMinutes(59);
                                                    } else {
                                                        setTrainingMinutes(event.target.value)
                                                    }
                                                } else {
                                                    setTrainingMinutes(0);
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Min
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                inputProps: {
                                                    min: 0,
                                                    max: 59,
                                                },
                                            }}
                                            inputProps={{
                                                pattern: '[0-9]*',
                                                inputMode: 'numeric',
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {/* Description Field */}
                            <Grid item xs={12}>
                                <FormControl error={descriptionError} fullWidth>
                                    <div style={{ border: descriptionError ? '1px solid red' : '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                        <ReactQuill
                                            id='description'
                                            name='description'
                                            value={description}
                                            onChange={(value) => {
                                                if (value.length <= 512) {
                                                    setDescription(value);
                                                }
                                            }}
                                            placeholder="Enter training description here *"
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                                                    ['link'],
                                                    ['clean']
                                                ],
                                            }}
                                            formats={[
                                                'header', 'font', 'size',
                                                'bold', 'italic', 'underline', 'strike', 'blockquote',
                                                'list', 'bullet', 'indent',
                                                'align',
                                                'link', 'image', 'video'
                                            ]}
                                            theme="snow"
                                            style={{ marginBottom: '3rem', height: '150px', width: '100%' }}
                                        ></ReactQuill>
                                        <FormHelperText>
                                            {description.length}/{512}
                                        </FormHelperText>
                                    </div>
                                </FormControl>

                            </Grid>
                            {/* Document Upload */}
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
                                                    sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: 'auto' }}
                                                    onClick={() => document.getElementById('attachment-upload').click()}
                                                >
                                                    <p className="m-0">
                                                        <i className="fa fa-plus"></i> Add
                                                    </p>
                                                </Button>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                mt: 1
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Max Limit: 10 Files, 10 MB Each
                                            </Typography>
                                            {attachment.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {/* Added Documents */}
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
                                        </Stack>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                mt: 1
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Max Limit: 20 Files, 5 MB Each
                                            </Typography>
                                            {image.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {/* Added Images */}
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
                            {/* Video Link Upload */}
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
                                            <Box sx={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', flexGrow: 1 }}>
                                                <Typography noWrap>
                                                    Links
                                                </Typography>
                                                <TextField
                                                    variant="outlined"
                                                    placeholder="Enter URL (e.g., https://example.com)"
                                                    size="small"
                                                    value={linkInput}
                                                    onChange={(event) => setLinkInput(event.target.value)}
                                                    sx={{ width: "80%" }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: '8px' }}
                                                                onClick={handleLinkAdd}
                                                            >
                                                                <p className="m-0">
                                                                    <i className="fa fa-plus"></i> Add
                                                                </p>
                                                            </Button>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                mt: 1
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Max Limit: 10 Links
                                            </Typography>
                                            {links.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {/* Added Links */}
                                        {links.length > 0 && (
                                            <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                                {links.map((link, index) => (
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
                                                        <Typography noWrap>{link}</Typography>
                                                        <IconButton onClick={() => handleDeleteLink(index)} size="small">
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
                                    justifyContent: "center", alignItems: "center",
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
                                    <p className="m-0"> <i className="fa fa-floppy-o mr-2 mt-1"></i> Save Training </p>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TrainingsAdd;
