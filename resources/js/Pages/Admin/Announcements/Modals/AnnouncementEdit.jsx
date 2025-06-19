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
    Radio,
    Checkbox,
    Chip
} from "@mui/material";
import { Cancel, CheckBox, CheckBoxRounded } from "@mui/icons-material";
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

const AnnouncementEdit = ({ open, close, announceInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [title, setTitle] = useState(announceInfo.title);
    const [description, setDescription] = useState(announceInfo.description);
    const [attachment, setAttachment] = useState([]);

    const [fileNames, setFileNames] = useState([]);
    const [thumbnail, setThumbnail] = useState(null); // new thumbnail file
    const [currentThumbnail, setCurrentThumbnail] = useState(null);
    const [removeThumbnail, setRemoveThumbnail] = useState(false);
    const [thumbnailBlobUrl, setThumbnailBlobUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);    const [images, setImages] = useState([]); // new image files
    const [currentImages, setCurrentImages] = useState([]); // existing images
    const [currentAttachments, setCurrentAttachments] = useState([]);

    const [deleteAttachments, setDeleteAttachments] = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);

    // Form Errors
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!announceInfo?.unique_code) return;
        setImageLoading(true);
        axiosInstance.get(`/announcements/getThumbnail/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                if (response.data.thumbnail) {
                    const byteCharacters = window.atob(response.data.thumbnail);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/png' });
                    setThumbnailBlobUrl(URL.createObjectURL(blob));
                } else {
                    setThumbnailBlobUrl("../../../../images/defaultThumbnail.jpg");
                }
                setImageLoading(false);
            })
            .catch(() => {
                setThumbnailBlobUrl("../../../../images/defaultThumbnail.jpg");
                setImageLoading(false);
            });
        return () => {
            if (thumbnailBlobUrl && thumbnailBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailBlobUrl);
            }
        };
    }, [announceInfo?.unique_code]);

    // Fetch current files and thumbnail
    useEffect(() => {
        axiosInstance.get(`/announcements/getAnnouncementFiles/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                setCurrentImages(response.data.images || []);
                setCurrentAttachments(response.data.attachments || []);
                // Set current thumbnail if available
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }, []);

    // Get Existing Files
    useEffect(() => {
        axiosInstance.get(`/announcements/getAnnouncementFiles/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                setCurrentImages(response.data.images);
                setCurrentAttachments(response.data.attachments);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }, []);

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const oldFileCount = currentAttachments.length - deleteAttachments.length;
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, oldFileCount, 5, 10485760, "document");
        if (validFiles) {
            setAttachment(prev => [...prev, ...files]);
        }
    };

    const handleDeleteAttachment = (index) => {
        setAttachment(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );

    };

    // Thumbnail upload handler
    const handleThumbnailUpload = (e) => {
        const file = e.target.files[0];
        if (file) setThumbnail(file);
    };

    // Image Handlers
    const handleImageUpload = (input) => {
        const oldFileCount = currentImages.length - deleteImages.length;
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, images.length, oldFileCount, 10, 5242880, "image");
        if (validFiles) {
            setImages(prev => [...prev, ...files]);
        }
    };

    const handleDeleteImage = (index) => {
        setImages(prevImages =>
            prevImages.filter((_, i) => i !== index)
        );
    };

    // Collects Old Files by Type
    const oldFileCompiler = (fileType) => {
        if (!fileNames) {
            return [];
        }

        if (fileType === "Document") {
            return fileNames.filter(filename => filename.type === "Document");
        } else if (fileType === "Image") {
            return fileNames.filter(filename => filename.type === "Image" || filename.type === "Thumbnail");
        } else {
            return [];
        }
    };

    // Validate Files
    const validateFiles = (newFiles, currentFileCount, oldFileCount, countLimit, sizeLimit, docType) => {
        if ((newFiles.length + currentFileCount + oldFileCount) > countLimit) {
            // The File Limit has been Exceeded
            fileCountError(`You can only have up to ${countLimit} ${docType}s at a time.`);
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

    const fileCountError = (message) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "File Limit Reached!",
            text: message,
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#177604",
        });
    }

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const checkInput = (event) => {
        event.preventDefault();

        setTitleError(!title);
        setDescriptionError(!description);

        if (!title || !description) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All required fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to update this announcement?",
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
    }

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("unique_code", announceInfo.unique_code);
        formData.append("title", title);
        formData.append("description", description);
        if (thumbnail) formData.append("thumbnail", thumbnail);
        images.forEach(img => formData.append("images[]", img));
        if (attachment.length > 0) {
            attachment.forEach(file => {
                formData.append('attachment[]', file);
            });
        }
        if (deleteAttachments.length > 0) {
            deleteAttachments.forEach(del => {
                formData.append('deleteAttachments[]', del);
            });
        } else {
            formData.append('deleteAttachments[]', null);
        }
        if (deleteImages.length > 0) {
            deleteImages.forEach(del => {
                formData.append('deleteImages[]', del);
            });
        } else {
            formData.append('deleteImages[]', null);
        }
        if (removeThumbnail && !thumbnail) {
            formData.append("removeThumbnail", true);
        }

        axiosInstance
            .post("/announcements/editAnnouncement", formData, { headers })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `Announcement successfully edited!`,
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then((res) => {
                    if (res.isConfirmed) {
                        // Refetch the thumbnail so the new one appears
                        setThumbnail(null);
                        // This will trigger the useEffect to refetch the thumbnail
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
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: { xs: "100%", sm: "700px" },
                        maxWidth: '800px',
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                            {" "}Edit Announcement{" "}
                        </Typography>
                        <IconButton onClick={() => close(false)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    {/* Thumbnail Section */}
                    <Box
                        sx={{
                            border: "1.5px solid #E0E0E0",
                            borderRadius: 2,
                            height: 140,
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            mb: 1,
                            width: "100%",
                            position: "relative",
                            cursor: "pointer"
                        }}
                        onClick={() => document.getElementById('thumbnail-upload').click()}
                    >
                        <input
                            accept=".png, .jpg, .jpeg"
                            id="thumbnail-upload"
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleThumbnailUpload}
                        />
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: "100%", height: "100%", padding: 1 }}>
                        {thumbnail ? (
                            <>
                                <img
                                    src={URL.createObjectURL(thumbnail)}
                                    alt="Thumbnail Preview"
                                    style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: 4, border: "1px solid #e0e0e0" }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        background: "#fff",
                                        "&:hover": { background: "#f5f5f5" }
                                    }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setThumbnail(null);
                                        setRemoveThumbnail(true);
                                        setThumbnailBlobUrl(null);
                                    }}
                                >
                                    <Cancel />
                                </IconButton>
                            </>
                        ) : (thumbnailBlobUrl && !thumbnailBlobUrl.includes("defaultThumbnail")) ? (
                            <>
                                <img
                                    src={thumbnailBlobUrl}
                                    alt="Current Thumbnail"
                                    style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: 4, border: "1px solid #e0e0e0" }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        background: "#fff",
                                        "&:hover": { background: "#f5f5f5" }
                                    }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setThumbnail(null);
                                        setRemoveThumbnail(true);
                                        setThumbnailBlobUrl(null);
                                    }}
                                >
                                    <Cancel />
                                </IconButton>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                component="span"
                                sx={{ mt: 2 }}
                            >
                                Upload Thumbnail (OPTIONAL)
                            </Button>
                        )}
                    </Box>
                        {imageLoading && <CircularProgress sx={{ position: "absolute" }} />}
                    </Box>
                    <Box
                        component="form"
                        onSubmit={checkInput}
                        noValidate
                        autoComplete="off"
                    >
                        <Grid container columnSpacing={2} rowSpacing={3}>
                            {/* Title Field */}
                            <Grid size={12} sx={{ mt: 1 }}>
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
                            {/* Description Field */}
                            <Grid size={12}>
                                <FormControl error={descriptionError} sx={{ width: '100%' }}>
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
                                            placeholder="Enter announcement description here *"
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
                            {/* Attachment Upload */}
                            <Grid size={12}>
                                <FormControl fullWidth>
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Typography noWrap>
                                                Documents (Optional)
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
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
                                                Max Limit: 5 Files, 10 MB Each
                                            </Typography>
                                            {attachment.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {/* Added Attachments */}
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
                                        {/* Old Attachments */}
                                        {(() => (
                                            currentAttachments.length > 0 && (
                                                <>
                                                    <Stack direction="row" spacing={1}
                                                        sx={{
                                                            pt: 1,
                                                            pr: 1,
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Current Documents
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Remove
                                                        </Typography>
                                                    </Stack>
                                                    {currentAttachments.map((attach, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mt: 1,
                                                                p: 1,
                                                                borderRadius: "2px",
                                                                border: '1px solid',
                                                                borderColor: deleteAttachments.includes(attach.id)
                                                                    ? "#f44336"
                                                                    : "#e0e0e0"
                                                            }}
                                                        >
                                                            <Typography variant="body2" noWrap>
                                                                {attach.filename}
                                                            </Typography>
                                                            <Checkbox
                                                                checked={deleteAttachments.includes(attach.id)}
                                                                onChange={() => {
                                                                    const oldFileCount = currentAttachments.length - deleteAttachments.length;
                                                                    setDeleteAttachments(prevAttachments => {
                                                                        if (prevAttachments.includes(attach.id)) {
                                                                            if (attachment.length + oldFileCount == 5) {
                                                                                fileCountError("You can only have up to 5 documents at a time.");
                                                                                return prevAttachments;
                                                                            } else {
                                                                                return prevAttachments.filter(id => id !== attach.id);
                                                                            }
                                                                        } else {
                                                                            return [...prevAttachments, attach.id];
                                                                        }

                                                                    });
                                                                }}
                                                                sx={{
                                                                    '&.Mui-checked': {
                                                                        color: "#f44336",
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                </>
                                            )
                                        ))()}
                                    </Box>
                                </FormControl>
                            </Grid>
                            {/* Image Upload */}
                            <Grid size={12}>
                                <FormControl fullWidth>
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Typography noWrap>
                                                Images (Optional)
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
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
                                                Max Limit: 10 Files, 5 MB Each
                                            </Typography>
                                            {images.length > 0 && (
                                                <Stack direction="row" spacing={1}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Remove
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Stack>
                                        {/* Added Images */}
                                        {images.length > 0 && (
                                            <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                                {images.map((file, index) => (
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
                                                        <Stack direction="row" spacing={3}>
                                                            <IconButton onClick={() => handleDeleteImage(index)} size="small">
                                                                <Cancel />
                                                            </IconButton>
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                        {/* Old Images */}
                                        {(() => (
                                            currentImages.length > 0 && (
                                                <>
                                                    <Stack direction="row" spacing={1}
                                                        sx={{
                                                            pt: 1,
                                                            pr: 1,
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Current Images
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Remove
                                                        </Typography>
                                                    </Stack>
                                                    {currentImages.map((img, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mt: 1,
                                                                p: 1,
                                                                borderRadius: "2px",
                                                                border: '1px solid',
                                                                borderColor: deleteImages.includes(img.id)
                                                                    ? "#f44336"
                                                                    : "#e0e0e0"
                                                            }}
                                                        >
                                                            <Typography variant="body2" noWrap>
                                                                {img.filename}
                                                            </Typography>
                                                            <Checkbox
                                                                checked={deleteImages.includes(img.id)}
                                                                onChange={() => {
                                                                    const oldFileCount = currentImages.length - deleteImages.length;
                                                                    setDeleteImages(prevImages => {
                                                                        if (prevImages.includes(img.id)) {
                                                                            if (images.length + oldFileCount == 10) {
                                                                                fileCountError("You can only have up to 10 images at a time.");
                                                                                return prevImages;
                                                                            } else {
                                                                                return prevImages.filter(id => id !== img.id);
                                                                            }
                                                                        } else {
                                                                            return [...prevImages, img.id];
                                                                        }
                                                                    });
                                                                }}
                                                                sx={{
                                                                    '&.Mui-checked': {
                                                                        color: "#f44336",
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                </>
                                            )
                                        ))()}
                                    </Box>
                                </FormControl>
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                size={12}
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
                                    <p className="m-0">
                                        <i className="fa fa-floppy-o mr-2 mt-1"></i>
                                        {" "}Update Announcement{" "}
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

export default AnnouncementEdit;
