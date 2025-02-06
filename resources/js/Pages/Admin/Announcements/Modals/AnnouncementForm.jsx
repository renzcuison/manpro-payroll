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

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AnnouncementForm = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [image, setImage] = useState(null);

    // Form Errors
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Attachment Handlers
    const handleAttachmentChange = (event) => {
        const selectedAttachment = event.target.files[0];
        setAttachment(selectedAttachment);
    };
    const handleAttachmentFieldClick = (event) => {
        attachmentInput.current.click();
    };
    const attachmentInput = useRef(null);

    const handleImageChange = (event) => {
        const selectedImage = event.target.files[0];
        setImage(selectedImage);
    };
    const handleImageFieldClick = (event) => {
        imageInput.current.click();
    };
    const imageInput = useRef(null);
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

        //Field Tests
        console.log("Form Fields");
        console.log(title);
        console.log(description);
        console.log(attachment);
        console.log(image);

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
                text: "Do you want to submit this announcement?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
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
        formData.append("title", title);
        formData.append("description", description);
        formData.append("attachment", attachment);
        formData.append("image", image);

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
                    text: `Your announcement has been submitted!`,
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
                            {" "}Create Announcement{" "}
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
                                            placeholder="Enter announcement description here... (Required)"
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
                                    </div>
                                </FormControl>

                            </Grid>
                            {/* Document Upload */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        label="Upload Document"
                                        value={
                                            attachment
                                                ? `${attachment.name
                                                }, ${getFileSize(
                                                    attachment.size
                                                )}`
                                                : ""
                                        }
                                        error={attachmentError}
                                        onClick={handleAttachmentFieldClick}
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
                            {/* Image Upload */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        label="Upload Image"
                                        value={
                                            image
                                                ? `${image.name
                                                }, ${getFileSize(
                                                    image.size
                                                )}`
                                                : ""
                                        }
                                        error={imageError}
                                        onClick={handleImageFieldClick}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: !image && (
                                                <InputAdornment position="end">
                                                    <InsertDriveFileIcon />
                                                </InputAdornment>
                                            ),
                                            startAdornment: image && (
                                                <InputAdornment position="start">
                                                    <InsertDriveFileIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        variant="outlined"
                                    />
                                    <input
                                        type="file"
                                        name="image"
                                        ref={imageInput}
                                        style={{ display: "none" }}
                                        onChange={handleImageChange}
                                    />
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
                                        {" "}Submit Announcement{" "}
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

export default AnnouncementForm;
