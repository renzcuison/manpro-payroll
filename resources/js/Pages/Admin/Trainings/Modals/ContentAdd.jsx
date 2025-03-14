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
import { Cancel, VideocamOff } from "@mui/icons-material";
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

const ContentAdd = ({ open, close, trainingCode }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [contentType, setContentType] = useState("Video");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [link, setLink] = useState('');
    const [file, setFile] = useState(null);

    const [videoError, setVideoError] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);

    // Form Errors
    const [contentTypeError, setContentTypeError] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);

    const [linkError, setLinkError] = useState(false);
    const [fileError, setFileError] = useState(false);

    // Content Type
    const handleTypeChange = (event) => {
        event.preventDefault;
        setLink('');
        setFile(null);
        setLinkError(false)
        setVideoError(false)
        setFileError(false)
        setContentType(event.target.value);
    };

    // File Size
    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleFileUpload = (input) => {
        const media = input.target.files[0];
        const sizeLimit = contentType == "Image" ? 5 : contentType == "Document" ? 10 : 20;
        if (media && media.size > (sizeLimit * 1024 * 1024)) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "File Too Large!",
                text: `The file size limit is ${sizeLimit} MB!`,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            setFile(media);
        }
    }

    // Video Link Handlers
    const verifyLink = (value) => {
        setLink(value);

        // Basic URL format validation
        const isValidUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)$/.test(value);
        setLinkError(!isValidUrl);

        setVideoError(false);
        setIsVideo(false);
        setIsVideoLoading(false);
        setThumbnailUrl(null);

        if (isValidUrl) {
            // YouTube Link
            const youtubeId = getYouTubeId(value);
            if (youtubeId) {
                const youtubeThumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                const img = new Image();
                img.src = youtubeThumbnail;
                setIsVideoLoading(true);
                img.onload = () => {
                    setThumbnailUrl(youtubeThumbnail);
                    setIsVideo(true);
                    setVideoError(false);
                    setIsVideoLoading(false);
                };
                img.onerror = () => {
                    setThumbnailUrl(null);
                    setIsVideo(false);
                    setVideoError(true);
                    setIsVideoLoading(false);
                };
                return;
            }

            // Direct Video URL with file extension
            const hasVideoExtension = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/.test(value.toLowerCase());
            if (hasVideoExtension) {
                setIsVideoLoading(true);
                (async () => {
                    try {
                        const response = await fetch(value, { method: "HEAD" });
                        const contentType = response.headers.get("Content-Type") || "";
                        const isVideo = contentType.toLowerCase().startsWith("video/");
                        setVideoError(!isVideo);
                        setIsVideo(isVideo);
                        setIsVideoLoading(false);

                        if (isVideo) {
                            generateThumbnailFromVideo(value);
                        }
                    } catch (error) {
                        setVideoError(true);
                        setIsVideo(false);
                        setIsVideoLoading(false);
                        setThumbnailUrl(null);
                    }
                })();
            } else {
                setVideoError(true);
            }
        }
    };
    // YouTube ID Validation
    const getYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
        const match = url.match(regex);
        const id = match ? match[1] : null;
        return id && id.length === 11 ? id : null;
    };
    // Direct URL Thumbnail
    const generateThumbnailFromVideo = (videoUrl) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.preload = "metadata";

        video.addEventListener("loadedmetadata", () => {
            video.currentTime = Math.min(10, video.duration / 2);
        });

        video.addEventListener("seeked", () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
            setThumbnailUrl(thumbnail);
            video.remove();
            canvas.remove();
        });

        video.addEventListener("error", () => {
            setThumbnailUrl(null);
        });
    };

    const checkInput = (event) => {
        event.preventDefault();

        setContentTypeError(!contentType);
        setTitleError(!title);
        setDescriptionError(!description);

        const linkFail = contentType == "Video" && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(link);
        setLinkError(linkFail);

        const fileFail = ["Image", "Document", "PowerPoint"].includes(contentType) && !file;
        setFileError(fileFail)

        if (!contentType || !title || !description || linkFail || fileFail) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All Required Fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else if (videoError) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "URL does not link to a video!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to save this content?",
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

    }

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("unique_code", trainingCode);
        formData.append("content_type", contentType);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("link", link);
        formData.append("file", file);

        axiosInstance.post("/trainings/saveContent", formData, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Your content has been saved!`,
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
                }
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
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Add Training Content </Typography>
                        <IconButton onClick={() => close(false)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" >
                        <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 1 }}>
                            {/* Content Type */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="content-type-select-label"> Content Type </InputLabel>
                                    <Select
                                        labelId="content-type-select-label"
                                        id="content-type-select"
                                        value={contentType}
                                        label="Content Type"
                                        onChange={(event) => handleTypeChange(event)}
                                    >
                                        <MenuItem value="Video"> Video </MenuItem>
                                        <MenuItem value="Image"> Image </MenuItem>
                                        <MenuItem value="Document"> Document </MenuItem>
                                        <MenuItem value="PowerPoint"> PowerPoint </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
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
                            {/* Upload Field */}
                            <Grid item xs={12}>
                                {contentType === "Video" ? (
                                    <Grid container direction="row" alignItems="center" spacing={2}>
                                        <Grid item sm={9}>
                                            <FormControl fullWidth sx={{ display: "flex" }}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Video Link"
                                                    variant="outlined"
                                                    type="url"
                                                    value={link}
                                                    error={linkError || videoError}
                                                    onChange={(event) => verifyLink(event.target.value)}
                                                    inputProps={{ maxLength: 512 }}
                                                    helperText={
                                                        linkError
                                                            ? "Please enter a valid URL"
                                                            : videoError
                                                                ? "URL does not point to a video"
                                                                : isVideoLoading
                                                                    ? "Checking URL..."
                                                                    : "Enter a video URL (e.g., https://youtube.com/watch?v=xyz)"
                                                    }
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item sm={3}>
                                            <Stack sx={{ placeContent: "center", placeItems: "center" }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        padding: thumbnailUrl ? 0 : 2,
                                                        border: "2px solid #e0e0e0",
                                                        borderRadius: thumbnailUrl ? 0 : "4px",
                                                        width: thumbnailUrl ? "auto" : "80%",
                                                        height: "90px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {thumbnailUrl ? (
                                                        <img
                                                            src={thumbnailUrl}
                                                            alt="Video Thumbnail"
                                                            style={{ maxWidth: "100%", maxHeight: "90px", objectFit: "contain" }}
                                                            onError={() => setThumbnailUrl(null)}
                                                        />
                                                    ) : (
                                                        <VideocamOff sx={{ color: "text.secondary", fontSize: "32px" }} />
                                                    )}
                                                </Box>
                                                <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
                                                    {thumbnailUrl ? "Video Thumbnail" : "No Video Selected"}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                ) : ["Image", "Document", "PowerPoint"].includes(contentType) ? (
                                    <FormControl fullWidth>
                                        <TextField
                                            fullWidth
                                            label={`Upload ${contentType}`}
                                            variant="outlined"
                                            value={file ? `${file.name}, ${getFileSize(file.size)}` : ""}
                                            error={fileError}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                document.getElementById('file-upload').click();
                                            }}
                                            InputProps={{
                                                readOnly: true,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        {file && (
                                                            <IconButton
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setFile(null);
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
                                            helperText={
                                                contentType === "Image"
                                                    ? "Upload an image (.png, .jpg, .jpeg), 5 MB size limit"
                                                    : contentType === "Document"
                                                        ? "Upload a document (.doc, .docx, .pdf), 10 MB size limit"
                                                        : contentType === "PowerPoint"
                                                            ? "Upload a PowerPoint (.ppt, .pptx, etc.), 20 MB size limit"
                                                            : ""
                                            }
                                        />
                                        <input
                                            accept={
                                                contentType === "Image"
                                                    ? ".png, .jpg, .jpeg"
                                                    : contentType === "Document"
                                                        ? ".doc, .docx, .pdf"
                                                        : contentType === "PowerPoint"
                                                            ? ".ppt, .pptx, .pptm, .potx, .potm, .ppsx, .ppsm"
                                                            : ""
                                            }
                                            id="file-upload"
                                            type="file"
                                            name="file"
                                            style={{ display: "none" }}
                                            aria-label={`Upload ${contentType}`}
                                            onChange={handleFileUpload}
                                        />
                                    </FormControl>
                                ) : null}
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
                                    <p className="m-0"> <i className="fa fa-floppy-o mr-2 mt-1"></i> Save Content </p>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ContentAdd;
