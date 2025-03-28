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
    CardMedia,
    Divider,
    Menu
} from "@mui/material";
import { Cancel, MoreVert } from "@mui/icons-material";
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

import PDFImage from "../../../../../../public/media/assets/PDF_file_icon.png";
import DocImage from "../../../../../../public/media/assets/Docx_file_icon.png";
import PPTImage from "../../../../../../public/media/assets/PowerPoint_file_icon.png";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import ContentEdit from "./ContentEdit";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ContentView = ({ open, close, contentId, status }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [content, setContent] = useState(null)
    const [exitReload, setExitReload] = useState(false);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Content Details
    useEffect(() => {
        getContentDetails();
    }, []);


    // Content Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Content Image
    const renderImage = (source, type) => {
        switch (type) {
            case "Image":
                return image;
            case "Document":
                const docExtension = source.split('.').pop().toLowerCase();
                if (docExtension === 'pdf') {
                    return PDFImage;
                }
                if (['doc', 'docx'].includes(docExtension)) {
                    return DocImage;
                }
                return "../../../../images/ManProTab.png";
            case "PowerPoint":
                return PPTImage;
            case "Video":
                return null;
            case "Form":
                return "../../../../images/ManProTab.png";
            default:
                return "../../../../images/ManProTab.png";
        }
    };

    const renderVideo = (source) => {
        const youtubeMatch = source.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
        if (youtubeMatch && youtubeMatch[1]) {
            const videoId = youtubeMatch[1];
            return (
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={content.title || "Youtube Video Player"}
                    style={{ border: '0' }}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen></iframe>
            );
        }

        const isDirectURL = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/.test(source.toLowerCase());
        if (isDirectURL) {
            return (
                <video width="100%" height="100%" controls>
                    <source src={source} type={`video/${source.split('.').pop().toLowerCase()}`} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        return null;
    };

    // Edit Content
    const [openContentEditModal, setOpenContentEditModal] = useState(false);
    const handleOpenContentEditModal = () => {
        setOpenContentEditModal(true);
    };
    const handleCloseContentEditModal = (reload) => {
        setOpenContentEditModal(false);
        if (reload) {
            setExitReload(true);
            getContentDetails();
        }
    };

    // Reload Content
    const getContentDetails = () => {
        setIsLoading(true);
        axiosInstance.get(`/trainings/getContentDetails/${contentId}`, { headers })
            .then((response) => {
                const resContent = (response.data.content);
                setContent(resContent);
                if (
                    resContent?.content?.type === 'Image' &&
                    resContent?.file
                ) {
                    if (image && image.startsWith('blob:')) {
                        URL.revokeObjectURL(image);
                    }
                    const byteCharacters = atob(resContent.file);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: resContent.file_mime });

                    setImage(URL.createObjectURL(blob));
                } else {
                    setImage(null);
                }
                if (resContent?.content?.type === 'Form') {
                    getFormItems();
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching content details', error);
                setIsLoading(false);
            });
    }

    // Form Items
    const getFormItems = () => {
        console.log("Hello World");
    }

    // Remove Content
    const handleRemoveContent = () => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Remove Content?",
            text: "This action cannot be undone!",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Remove",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "No",
        }).then((res) => {
            if (res.isConfirmed) {
                const data = {
                    id: content.id
                };
                axiosInstance
                    .post(`trainings/removeContent`, data, {
                        headers,
                    })
                    .then((response) => {
                        document.activeElement.blur();
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Success!",
                            text: `Content successfully removed`,
                            icon: "success",
                            showConfirmButton: true,
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        }).then((res) => {
                            if (res.isConfirmed) {
                                close(true);
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error removing content:", error);
                    });
            }
        });
    };

    // Image Cleanup
    useEffect(() => {
        return () => {
            if (image && image.startsWith('blob:')) {
                console.log("removing image");
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '800px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Content Details </Typography>
                        <IconButton onClick={() => close(exitReload)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3, maxHeight: "580px" }}>
                    {isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {/* Media Display for Non-Forms */}
                                {content.content.type != "Form" && (
                                    <Grid item xs={["Document", "PowerPoint"].includes(content.content.type) ? 3 : 12} sx={{ placeContent: "center", placeItems: "center" }}>
                                        {content.content.type === "Video" ? (
                                            <Box
                                                sx={{
                                                    width: "90%",
                                                    aspectRatio: "16 / 9",
                                                    placeSelf: "center",
                                                    mb: 1,
                                                }}
                                            >
                                                {renderVideo(content.content.source)}
                                            </Box>
                                        ) : (
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: "80%",
                                                    aspectRatio: !["Document", "PowerPoint"].includes(content.content.type) ? "16 / 9" : "4 / 3",
                                                    objectFit: "contain",
                                                    borderRadius: "4px",
                                                    backgroundColor: "transparent",
                                                    placeSelf: "center",
                                                    mb: 1,
                                                    ...(["Document", "PowerPoint"].includes(content.content.type) && {
                                                        p: 1,
                                                        "&:hover": {
                                                            backgroundColor: "#e0e0e0",
                                                            transition: "background-color 0.3s ease",
                                                        },
                                                    }),
                                                }}
                                                image={renderImage(content.content.source, content.content.type)}
                                                title={content.title || "Content Item"}
                                                alt={content.title || "Content Item"}
                                                onClick={
                                                    ["Document", "PowerPoint"].includes(content.content.type)
                                                        ? () => window.open(`${location.origin}/storage/${content.content.source}`, "_blank")
                                                        : undefined
                                                }
                                            />
                                        )}
                                        {["Document", "PowerPoint"].includes(content.content.type) ? (
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>Click to open file</Typography>
                                        ) : (
                                            <Divider />
                                        )}
                                    </Grid>
                                )}
                                {/* Content Information */}
                                <Grid container item spacing={2} xs={["Document", "PowerPoint"].includes(content.content.type) ? 9 : 12}>
                                    {/* Divider for Image, Videos */}
                                    {content.content.type && !["Document", "PowerPoint", "Form"].includes(content.content.type) && <Grid item xs={12}><Divider /></Grid>}
                                    {/* Content Title and Options */}
                                    <Grid item xs={12}>
                                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="h5">
                                                {content.title}
                                            </Typography>
                                            {/* Options */}
                                            <IconButton
                                                id="basic-button"
                                                size="small"
                                                aria-controls={open ? 'basic-menu' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={open ? 'true' : undefined}
                                                onClick={handleMenuClick}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                            <Menu
                                                id="basic-menu"
                                                anchorEl={anchorEl}
                                                open={menuOpen}
                                                onClose={handleMenuClose}
                                                MenuListProps={{
                                                    'aria-labelledby': 'basic-button',
                                                }}
                                            >
                                                {/* Edit Content */}
                                                {status == "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenContentEditModal();
                                                            handleMenuClose();
                                                        }}>
                                                        Edit
                                                    </MenuItem>
                                                )}
                                                {/* Remove Content */}
                                                {status == "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleRemoveContent();
                                                            handleMenuClose();
                                                        }}>
                                                        Remove
                                                    </MenuItem>
                                                )}
                                                {/* Progress Monitoring */}
                                                {status != "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            console.log("Viewing Employee Progress");
                                                            handleMenuClose();
                                                        }}>
                                                        Remove
                                                    </MenuItem>
                                                )}
                                                {/* Form Options */}
                                                {status == "Pending" && content.content.type == "Form" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            console.log("Viewing Form Items");
                                                            handleMenuClose();
                                                        }}>
                                                        Add Item
                                                    </MenuItem>
                                                )}
                                                {status == "Pending" && content.content.type == "Form" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            console.log("Viewing Form Items");
                                                            handleMenuClose();
                                                        }}>
                                                        Item Settings
                                                    </MenuItem>
                                                )}
                                            </Menu>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Additional Form Information */}
                                    {content.content.type == "Form" && (
                                        <Grid container item xs={12} spacing={2}>
                                            <Grid item xs={4}>
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        {content.content.require_pass ? "Availability" : "Attempt Limit"}
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {content.content.require_pass ? "Until Passed" : content.content.attempts_allowed ?? "N/A"}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Passing Score
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {`${content.content.passing_score ?? "N/A"} %`}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Duration Per Attempt
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {`${content.duration ?? "N/A"} min`}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Item Count
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {43}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Total Points
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {`${64} pts`}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                        </Grid>
                                    )}
                                    {status != "Pending" && (
                                        <Grid container item xs={12} spacing={2}>
                                            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Not Yet Viewed
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {content.no_view_count ?? 0}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Viewers
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {content.view_count ?? 0}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography>
                                                        Completers
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {content.finished_count ?? 0}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                        </Grid>
                                    )}
                                    {/* Description */}
                                    <Grid item xs={12} >
                                        <div
                                            id="description"
                                            style={{
                                                wordWrap: 'break-word',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: content.description }}
                                        />
                                    </Grid>
                                    {/* Form Items */}
                                    {content.content.type == "Form" && (
                                        <Grid container item xs={12} spacing={2}>
                                            <Grid item xs={12} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>
                                                    Items
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {`[insert full item list]`}
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                </DialogContent>
                {openContentEditModal && (
                    <ContentEdit
                        open={openContentEditModal}
                        close={handleCloseContentEditModal}
                        content={content}
                    />
                )}
            </Dialog>
        </>
    );
};

export default ContentView;
