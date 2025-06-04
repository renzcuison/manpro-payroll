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
    useMediaQuery,
    Divider,
    Tabs,
    Tab
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

const MAX_DESCRIPTION_LENGTH = 512;

const AnnouncementAdd = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState([]);
    const [thumbnail, setThumbnail] = useState(null); // single file
    const [images, setImages] = useState([]);        // array of files
    const [tab, setTab] = useState(0);

    // Form Errors
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);
    const [imageError, setImageError] = useState(false);

    const quillRef = useRef(null);

    // Tab change for preview
    const handleTabChange = (_, newValue) => setTab(newValue);

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, 5, 10485760, "document");
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
        // Filter out the thumbnail if it's already selected
        const filtered = files.filter(file =>
            !(thumbnail && file.name === thumbnail.name && file.size === thumbnail.size)
        );
        let validFiles = validateFiles(filtered, images.length, 10, 5242880, "image");
        if (validFiles) {
            setImages(prev => [...prev, ...filtered]);
        }
    };

    const handleDeleteImage = (index) => {
        setImages(prevImages =>
            prevImages.filter((_, i) => i !== index)
        );
    };

    // Validate Files
    const validateFiles = (newFiles, currentFileCount, countLimit, sizeLimit, docType) => {
        if (newFiles.length + currentFileCount > countLimit) {
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

    // Helper for plain text length from HTML
    const getPlainTextLength = html => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.innerText.length;
    };

    // Color logic for character count
    const getCharCountColor = (count) => {
        if (count === MAX_DESCRIPTION_LENGTH) return "#d32f2f"; // error/red
        if (count > MAX_DESCRIPTION_LENGTH - 62) return "#ffa726"; // warning/orange (last 62 chars)
        return "#999"; // default/gray
    };

    // OnChange handler for ReactQuill (enforce char limit)
    const handleDescriptionChange = value => {
        const plainLength = getPlainTextLength(value);
        if (plainLength <= MAX_DESCRIPTION_LENGTH) {
            setDescription(value);
        } else {
            // Truncate to max length
            const tmp = document.createElement("div");
            tmp.innerHTML = value;
            let truncated = tmp.innerText.slice(0, MAX_DESCRIPTION_LENGTH);
            setDescription(truncated);
        }
    };

    // Block typing/pasting if limit reached
    useEffect(() => {
        const quill = quillRef.current && quillRef.current.getEditor && quillRef.current.getEditor();
        if (!quill) return;

        const handleBeforeInput = (e) => {
            const plainText = quill.getText();
            const length = plainText.endsWith('\n') ? plainText.length - 1 : plainText.length;
            if (
                length >= MAX_DESCRIPTION_LENGTH &&
                !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab"].includes(e.key)
            ) {
                e.preventDefault();
            }
        };

        const handlePaste = (e) => {
            const plainText = quill.getText();
            const length = plainText.endsWith('\n') ? plainText.length - 1 : plainText.length;
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (length + paste.length > MAX_DESCRIPTION_LENGTH) {
                e.preventDefault();
                // Optionally, only allow enough characters to fill up to the limit
                const allowed = MAX_DESCRIPTION_LENGTH - length;
                if (allowed > 0) {
                    document.execCommand('insertText', false, paste.slice(0, allowed));
                }
            }
        };

        quill.root.addEventListener('keydown', handleBeforeInput);
        quill.root.addEventListener('paste', handlePaste);

        return () => {
            quill.root.removeEventListener('keydown', handleBeforeInput);
            quill.root.removeEventListener('paste', handlePaste);
        };
    }, [open, description]);

    const checkInput = (event) => {
        event.preventDefault();

        setTitleError(!title);
        setDescriptionError(getPlainTextLength(description) === 0);

        if (!title || getPlainTextLength(description) === 0) {
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
                text: "Do you want to save this announcement?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
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

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (thumbnail) formData.append("thumbnail", thumbnail);
        images.forEach(img => formData.append("images[]", img));
        if (attachment.length > 0) {
            attachment.forEach(file => {
                formData.append('attachment[]', file);
            });
        }

        axiosInstance
            .post("/announcements/saveAnnouncement", formData, {
                headers,
            })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `Your announcement has been saved!`,
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
                        marginBottom: '5%',
                        marginTop: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                            {" "}Create Announcement{" "}
                        </Typography>
                        <IconButton onClick={() => close(false)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider></Divider>

                <DialogContent sx={{ padding: 4, mt: 2, mb: 3 }}>
                    <Box
                        component="form"
                        onSubmit={checkInput}
                        noValidate
                        autoComplete="off"
                    >
                        <Grid container columnSpacing={2} rowSpacing={3}>
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
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) setThumbnail(file);
                                    }}
                                />
                                {thumbnail ? (
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: "100%", height: "100%", padding: 1 }}>
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
                                            }}
                                        >
                                            <Cancel />
                                        </IconButton>
                                    </Box>
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
                            {/* Title Field */}
                            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        placeholder="TITLE HERE*"
                                        value={title}
                                        onChange={(event) => {
                                            if (event.target.value.length <= 128) {
                                                setTitle(event.target.value);
                                            }
                                        }}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        error={titleError}
                                        sx={{
                                            "& input": { fontWeight: 500, fontSize: "1.1rem" }
                                        }}
                                        inputProps={{
                                            maxLength: 128,
                                        }}
                                        helperText={`${title.length}/128`}
                                    />
                                </FormControl>
                            </Grid>
                            {/* Description Field with Tabs */}
                            <Box
                                sx={{
                                    border: "1.5px solid #E0E0E0",
                                    borderRadius: 2,
                                    background: "#fff",
                                    mb: 3,
                                    overflow: "hidden",
                                    width: "100%",
                                }}
                            >
                                <Tabs
                                    value={tab}
                                    onChange={handleTabChange}
                                    TabIndicatorProps={{
                                        style: { background: "#177604", height: 3, borderRadius: 2 }
                                    }}
                                    sx={{
                                        borderBottom: "1.5px solid #E0E0E0",
                                        minHeight: 44,
                                        pl: 1,
                                        ".MuiTabs-flexContainer": { gap: 2 }
                                    }}
                                >
                                    <Tab label="WRITE" />
                                    <Tab label="PREVIEW" />
                                </Tabs>
                                <Box sx={{ p: 2, pt: 2, }}>
                                    {tab === 0 ? (
                                        <Box
                                            sx={{
                                                border: descriptionError ? "1px solid red" : "1px solid #E0E0E0",
                                                borderRadius: 2,
                                                background: "#fff",
                                                minHeight: 120,
                                                "& .ql-toolbar": {
                                                    border: "none",
                                                    borderBottom: "1px solid #e0e0e0",
                                                    borderRadius: 0,
                                                    padding: "4px 8px",
                                                    fontSize: "1rem",
                                                },
                                                "& .ql-container": {
                                                    border: "none",
                                                    fontSize: "1rem",
                                                    color: "#757575",
                                                    minHeight: 80,
                                                },
                                            }}
                                        >
                                            <ReactQuill
                                                ref={quillRef}
                                                theme="snow"
                                                value={description}
                                                onChange={handleDescriptionChange}
                                                placeholder="DESCRIPTION HERE*"
                                                modules={{
                                                    toolbar: [
                                                        [{ 'header': [false, 1, 2, 3] }],
                                                        ['bold', 'italic', 'underline'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['link', 'strike'],
                                                    ]
                                                }}
                                                style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    marginBottom: '3rem', 
                                                    height: '150px'
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    float: "right",
                                                    color: getCharCountColor(getPlainTextLength(description)),
                                                    mb: 1, mt: 1,
                                                    fontWeight: getPlainTextLength(description) === MAX_DESCRIPTION_LENGTH ? "bold" : "normal"
                                                }}
                                            >
                                                {getPlainTextLength(description)}/{MAX_DESCRIPTION_LENGTH}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            minHeight: 120,
                                            color: "#333",
                                            fontSize: "1rem",
                                            p: 1,
                                        }}>
                                            <div dangerouslySetInnerHTML={{ __html: description || "<em>No content</em>" }} />
                                        </Box>
                                    )}
                                </Box>
                            </Box>
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
                                    </Box>
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
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                                                    sx={{ backgroundColor: "#42a5f5", color: "white" }}
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
                                        {" "}Save Announcement{" "}
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

export default AnnouncementAdd;