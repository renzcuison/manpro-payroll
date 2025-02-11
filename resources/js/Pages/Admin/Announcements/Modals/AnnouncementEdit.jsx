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
    Checkbox
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
    const [image, setImage] = useState([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(null);
    const [fileNames, setFileNames] = useState([]);

    const [deleteAttachments, setDeleteAttachments] = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);

    // Form Errors
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        axiosInstance.get(`/announcements/getFileNames/${announceInfo.id}`, { headers })
            .then((response) => {
                setFileNames(response.data.filenames);
            })
            .catch((error) => {
                console.error('Error fetching file names:', error);
            });
    }, []);

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const files = Array.from(input.target.files);
        setAttachment(prev => [...prev, ...files]);
    };

    const handleDeleteAttachment = (index) => {
        setAttachment(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );

    };

    // Image Handlers
    const handleImageUpload = (input) => {
        const files = Array.from(input.target.files);
        setImage(prev => [...prev, ...files]);
    };

    const handleDeleteImage = (index) => {
        if (thumbnailIndex !== null) {
            if (index === thumbnailIndex) {
                setThumbnailIndex(null);
            } else if (index < thumbnailIndex) {
                setThumbnailIndex(thumbnailIndex - 1);
            }
        }
        setImage(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );
    };

    // File Size Verification
    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleAnnouncementSubmit = (event) => {
        event.preventDefault();

        if (!title) {
            setTitleError(true);
        } else {
            setTitleError(false);
        }
        if (!description) {
            setDescriptionError(true);
        } else {
            setDescriptionError(false);
        }

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
                    saveAnnouncement(event);
                }
            });
        }
    }

    const saveAnnouncement = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("id", announceInfo.id);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("thumbnail", thumbnailIndex);
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

        axiosInstance
            .post("/announcements/editAnnouncement", formData, {
                headers,
            })
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                            {" "}Edit Announcement{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ paddingBottom: 5 }}>
                    <Box
                        component="form"
                        onSubmit={handleAnnouncementSubmit}
                        noValidate
                        autoComplete="off"
                    >
                        <Grid container columnSpacing={2} rowSpacing={3}>
                            {/* Title Field */}
                            <Grid item xs={12} sx={{ mt: 1 }}>
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
                            <Grid item xs={12}>
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
                                                    sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: "auto" }}
                                                    onClick={() => document.getElementById('attachment-upload').click()}
                                                >
                                                    <p className="m-0">
                                                        <i className="fa fa-plus"></i> Add
                                                    </p>
                                                </Button>
                                            </Box>
                                            {attachment.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                                        {(() => {
                                            const documentFiles = fileNames.filter(filename => filename.type === "Document");
                                            return documentFiles.length > 0 && (
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
                                                    {documentFiles.map((filename, index) => (
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
                                                                borderColor: deleteAttachments.includes(filename.id)
                                                                    ? "#f44336"
                                                                    : "#e0e0e0"
                                                            }}
                                                        >
                                                            <Typography variant="body2" noWrap>
                                                                {`${filename.filename} ${filename.id}`}
                                                            </Typography>
                                                            <Checkbox
                                                                checked={deleteAttachments.includes(filename.id)}
                                                                onChange={() => {
                                                                    setDeleteAttachments(prevAttachments => {
                                                                        if (prevAttachments.includes(filename.id)) {
                                                                            return prevAttachments.filter(id => id !== filename.id);
                                                                        } else {
                                                                            return [...prevAttachments, filename.id];
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
                                            );
                                        })()}
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
                                                <Stack direction="row" spacing={1}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Set Thumbnail
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Remove
                                                    </Typography>
                                                </Stack>
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
                                                        <Stack direction="row" spacing={3}>
                                                            <Radio
                                                                checked={thumbnailIndex === index}
                                                                onChange={() => setThumbnailIndex(index)}
                                                                name="thumbnail"
                                                                inputProps={{ 'aria-label': `Choose ${file.name} as thumbnail` }}
                                                            />
                                                            <IconButton onClick={() => handleDeleteImage(index)} size="small">
                                                                <Cancel />
                                                            </IconButton>
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                        {(() => {
                                            const imageFiles = fileNames.filter(filename => filename.type === "Image");
                                            return imageFiles.length > 0 && (
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
                                                    {imageFiles.map((filename, index) => (
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
                                                                borderColor: deleteImages.includes(filename.id)
                                                                    ? "#f44336"
                                                                    : "#e0e0e0"
                                                            }}
                                                        >
                                                            <Typography variant="body2" noWrap>
                                                                {`${filename.filename} ${filename.id}`}
                                                            </Typography>
                                                            <Checkbox
                                                                checked={deleteImages.includes(filename.id)}
                                                                onChange={() => {
                                                                    setDeleteImages(prevImages => {
                                                                        if (prevImages.includes(filename.id)) {
                                                                            return prevImages.filter(id => id !== filename.id);
                                                                        } else {
                                                                            return [...prevImages, filename.id];
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
                                            );
                                        })()}
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
