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
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Divider,
    Stack,
    Tooltip,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Table,
    Menu,
    ImageList,
    ImageListItem,
    ImageListItemBar
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, MoreVert, Download } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import PdfImage from '../../../../../../public/media/assets/PDF_file_icon.png';
import DocImage from '../../../../../../public/media/assets/Docx_file_icon.png';
import XlsImage from '../../../../../../public/media/assets/Excel_file_icon.png';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import { icon } from "@fortawesome/fontawesome-svg-core";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import AnnouncementPublish from './AnnouncementPublish';
import AnnouncementEdit from './AnnouncementEdit';
import AnnouncementAcknowledgements from "./AnnouncementAcknowledgements";

const AnnouncementManage = ({ open, close, announceInfo }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [imagePath, setImagePath] = useState("");
    const [imageLoading, setImageLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [images, setImages] = useState([]);
    const [attachments, setAttachments] = useState([]);


    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [announcement, setAnnouncement] = useState(announceInfo);
    const [exitReload, setExitReload] = useState(false);

    // ----------- Additional Details
    useEffect(() => {
        getAnnouncementThumbnail();
        getAnnouncementFiles();
        if (announceInfo.status != "Pending") {
            getAnnouncementBranchDepts();
        }
    }, []);

    // Announcement Menu
    const [anchorEl, setAnchorEl] = React.useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // ---------------- Announcement Publishing
    const [openAnnouncementPublish, setOpenAnnouncementPublish] = useState(null);
    const handleOpenAnnouncementPublish = (announcement) => {
        setOpenAnnouncementPublish(announcement)
    }
    const handleCloseAnnouncementPublish = (reload) => {
        setOpenAnnouncementPublish(null);
        if (reload) {
            setExitReload(true);
            announcementReloader();
        }
    }

    // ---------------- Announcement Editing
    const [openAnnouncementEdit, setOpenAnnouncementEdit] = useState(null);
    const handleOpenAnnouncementEdit = (announcement) => {
        setOpenAnnouncementEdit(announcement)
    }
    const handleCloseAnnouncementEdit = (reload) => {
        setOpenAnnouncementEdit(null);
        if (reload) {
            announcementReloader();
            setExitReload(true);
        }
    }

    // ---------------- Announcement Acknowledgements
    const [openAnnouncementAcknowledgements, setOpenAnnouncementAcknowledgements] = useState(null);
    const handleOpenAnnouncementAcknowledgements = (unicode) => {
        setOpenAnnouncementAcknowledgements(unicode)
    }
    const handleCloseAnnouncementAcknowledgements = () => {
        setOpenAnnouncementAcknowledgements(null);
    }

    // ---------------- Application Hiding
    const handleToggleHide = (toggle, code) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: `${toggle ? "Hide" : "Show"} Announcement?`,
            text: `The Announcement will be ${toggle ? "hidden from" : "visible to"} employees`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: toggle ? "Hide" : "Show",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .get(`announcements/toggleHide/${code}`, {
                        headers
                    })
                    .then((response) => {
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Success!",
                            text: `Your Announcement is now ${toggle ? "hidden" : "visible"}`,
                            icon: "success",
                            showConfirmButton: true,
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        }).then((res) => {
                            if (res.isConfirmed) {
                                setExitReload(true);
                                announcementReloader();
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error toggling Hidden Status:", error);
                    });
            }
        });
    };

    // ---------------- Announcement Detail Reloader
    const announcementReloader = () => {
        axiosInstance.get(`/announcements/getAnnouncementDetails/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                setAnnouncement(response.data.announcement);
            })
            .catch((error) => {
                console.error('Error fetching updated announcement details', error);
            });
        getAnnouncementThumbnail();
        getAnnouncementBranchDepts();
        getAnnouncementFiles();
    }

    // ---------------- Announcement Files
    const getAnnouncementFiles = () => {
        axiosInstance.get(`/announcements/getAnnouncementFiles/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                setImages(response.data.images);
                setAttachments(response.data.attachments);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }

    // ---------------- Thumbnail
    const getAnnouncementThumbnail = () => {
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
                    if (imagePath && imagePath.startsWith('blob:')) {
                        URL.revokeObjectURL(imagePath);
                    }
                    setImagePath(URL.createObjectURL(blob));
                } else {
                    if (imagePath && imagePath.startsWith('blob:')) {
                        URL.revokeObjectURL(imagePath);
                    }
                    setImagePath("../../../../../images/ManProTab.png");
                }
                setImageLoading(false);

            })
            .catch((error) => {
                console.error('Error fetching thumbnail:', error);
                if (imagePath && imagePath.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePath);
                }
                setImagePath("../../../../../images/ManProTab.png");
                setImageLoading(false);
            });
    }

    // ---------------- Recipient Branch and Departments
    const getAnnouncementBranchDepts = () => {
        axiosInstance.get(`/announcements/getAnnouncementBranchDepts/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                setBranches(response.data.branches);
                setDepartments(response.data.departments);
            })
            .catch((error) => {
                console.error('Error fetching published branch/departments:', error);
            });
    }

    // ---------------- Dynamic File Icon
    const getFileIcon = (filename) => {
        const fileType = filename
            .split(".")
            .pop()
            .toLowerCase();

        let src = null;
        let color = null;

        switch (fileType) {
            case "png":
            case "jpg":
            case "jpeg":
                // REPLACE WITH DOMAIN IN PRODUCTION
                src = `../../../../../../storage/announcements/images/${filename}`;
                break;
            case "doc":
            case "docx":
                src = DocImage;
                break;
            case "pdf":
                src = PdfImage;
                break;
            case "xls":
            case "xlsx":
                src = XlsImage;
                break;
            default:
                src = null;
        }

        return src;
    };

    // ---------------- File Download
    const handleFileDownload = (filename, id) => {
        axiosInstance.get(`/announcements/downloadFile/${id}`, { responseType: "blob", headers })
            .then((response) => {
                const blob = new Blob([response.data], {
                    type: response.headers["content-type"],
                });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                link.click();

                window.URL.revokeObjectURL(link.href);
            })
            .catch((error) => {
                console.error("Error downloading file:", error);
            });
    };

    // ---------------- Image Renders
    const [blobMap, setBlobMap] = useState({});

    const renderImage = (id, data, mime) => {
        if (!blobMap[id]) {
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            const newBlob = URL.createObjectURL(blob);

            setBlobMap((prev) => ({ ...prev, [id]: newBlob }));

            return newBlob;
        } else {
            return blobMap[id];
        }
    }

    // Image Cleanup
    useEffect(() => {
        return () => {
            if (imagePath && imagePath.startsWith('blob:')) {
                URL.revokeObjectURL(imagePath);
            }
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

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
                        minWidth: { xs: "100%", sm: "850px" },
                        maxWidth: '900px',
                        maxHeight: '750px',
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>
                            {" "}Announcement Details{" "}
                        </Typography>
                        <IconButton onClick={() => close(exitReload)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box>
                        <Grid container columnSpacing={4} rowSpacing={2}>
                            {/* Thumbnail */}
                            <Grid item xs={5}>
                                <Box sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: 200,
                                    borderRadius: "4px",
                                    border: '2px solid #e0e0e0',
                                }}>
                                    <img
                                        src={imagePath}
                                        alt={`${announcement.title} thumbnail`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: "4px",
                                        }}
                                    />
                                </Box>
                            </Grid>
                            {/* Core Information */}
                            <Grid item container xs={7} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                                <Grid item container spacing={1} sx={{ mb: 1 }}>
                                    {/* Title and Action Menu */}
                                    <Grid item xs={12}>
                                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="h6" component="div">
                                                {announcement.title}
                                            </Typography>
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
                                                {/* Editing */}
                                                {announcement.status == "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenAnnouncementEdit(announcement);
                                                            handleMenuClose();
                                                        }}>
                                                        Edit
                                                    </MenuItem>
                                                )}
                                                {/* Publishing */}
                                                {announcement.status == "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenAnnouncementPublish(announcement);
                                                            handleMenuClose();
                                                        }}>
                                                        Publish
                                                    </MenuItem>
                                                )}
                                                {/* Acknowledgements */}
                                                {announcement.status != "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            handleOpenAnnouncementAcknowledgements(announcement.unique_code);
                                                        }}>
                                                        View Acknowledgements
                                                    </MenuItem>
                                                )}
                                                {/* Toggle Hide */}
                                                {announcement.status != "Pending" && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleToggleHide(announcement.status == "Published", announcement.unique_code);
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        {announcement.status == "Hidden" ? 'Show Announcement' : 'Hide Announcement'}
                                                    </MenuItem>
                                                )}
                                            </Menu>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Announcement Status */}
                                    <Grid item xs={5} align="left">
                                        Status
                                    </Grid>
                                    <Grid item xs={7} align="left">
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                color:
                                                    announcement.status == "Pending"
                                                        ? "#e9ae20"
                                                        : "#177604"
                                            }}
                                        >
                                            {announcement.status == "Pending" ? "PENDING" : "PUBLISHED"}
                                        </Typography>
                                    </Grid>
                                    {/* Visibility */}
                                    {announcement.status != "Pending" && (
                                        <>
                                            <Grid item xs={5} align="left">
                                                Visibility
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color:
                                                            announcement.status == "Published"
                                                                ? "#177604"
                                                                : "#f57c00"
                                                    }}
                                                >
                                                    {announcement.status == "Published" ? "VISIBLE" : "HIDDEN"}
                                                </Typography>
                                            </Grid>
                                        </>
                                    )}
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Publishment Details*/}
                                    {announcement.status != "Pending" ? (
                                        <Grid item container xs={12} spacing={1}>
                                            <Grid item xs={12} align="left">
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    Publishment Details
                                                </Typography>
                                            </Grid>
                                            {/* Branches */}
                                            <Grid item xs={5} align="left">
                                                Branches
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    {branches.length > 0 ? branches.join(', ') : 'N/A'}
                                                </Typography>
                                            </Grid>
                                            {/* Departments */}
                                            <Grid item xs={5} align="left">
                                                Departments
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    {departments.length > 0 ? departments.join(', ') : 'N/A'}
                                                </Typography>
                                            </Grid>
                                            {/* Acknowledgement Count */}
                                            <Grid item xs={5} align="left">
                                                Acknowledged by
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {`${announceInfo.acknowledged} of ${announceInfo.recipients} Recipients`}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    ) :
                                        <Grid item xs={12} align="center">
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                -- Publishing Data Unavailable --
                                            </Typography>
                                        </Grid>}
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ my: 0 }} >
                                <Divider />
                            </Grid>
                            {/* Description*/}
                            <Grid item xs={12} sx={{ mb: 1 }} align="left">
                                Description
                            </Grid>
                            <Grid item xs={12}>
                                <div
                                    id="description"
                                    style={{
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: announceInfo.description }}
                                />
                            </Grid>
                            {/* Images */}
                            {images.length > 0 ? (
                                <>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={12} sx={{ mb: 1 }} align="left">
                                        Images
                                    </Grid>
                                    <Grid item md={12} align="left">
                                        <ImageList cols={7} gap={4} sx={{ width: '100%' }}>
                                            {images.map((image) => (
                                                <ImageListItem
                                                    key={image.id}
                                                    sx={{
                                                        aspectRatio: "1/1",
                                                        width: "100%"
                                                    }}>
                                                    <img
                                                        src={renderImage(image.id, image.data, image.mime)}
                                                        alt={image.filename}
                                                        loading="lazy"
                                                        style={{
                                                            height: "100%",
                                                            width: "100%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                    <ImageListItemBar
                                                        subtitle={image.filename}
                                                        actionIcon={
                                                            <Tooltip title={'Download'}>
                                                                <IconButton
                                                                    sx={{ color: 'rgba(255, 255, 255, 0.47)' }}
                                                                    onClick={() => handleFileDownload(image.filename, image.id)}
                                                                >
                                                                    <Download />
                                                                </IconButton>
                                                            </Tooltip>
                                                        }
                                                    />
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    </Grid>
                                </>)
                                : null
                            }
                            {/* Attachments */}
                            {attachments.length > 0 ? (
                                <>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={12} sx={{ mb: 1 }} align="left">
                                        Documents
                                    </Grid>
                                    <Grid item md={12} align="left">
                                        <ImageList cols={7} gap={4} sx={{ width: '100%' }}>
                                            {attachments.map((attachment) => {
                                                const fileIcon = getFileIcon(attachment.filename);
                                                return (
                                                    <ImageListItem
                                                        key={attachment.id}
                                                        sx={{
                                                            aspectRatio: "1/1",
                                                            width: "100%"
                                                        }}>
                                                        <img
                                                            src={fileIcon}
                                                            alt={attachment.filename}
                                                            loading="lazy"
                                                            style={{
                                                                height: "100%",
                                                                width: "100%",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                        <ImageListItemBar
                                                            subtitle={attachment.filename}
                                                            actionIcon={
                                                                <Tooltip title={'Download'}>
                                                                    <IconButton
                                                                        sx={{ color: 'rgba(255, 255, 255, 0.47)' }}
                                                                        onClick={() => handleFileDownload(attachment.filename, attachment.id)}
                                                                    >
                                                                        <Download />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            }
                                                        />
                                                    </ImageListItem>
                                                );
                                            })}
                                        </ImageList>
                                    </Grid>
                                </>)
                                : null
                            }
                        </Grid>
                    </Box>
                </DialogContent>
                {openAnnouncementPublish && (
                    <AnnouncementPublish
                        open={true}
                        close={handleCloseAnnouncementPublish}
                        announceInfo={openAnnouncementPublish}
                    />
                )}
                {openAnnouncementEdit && (
                    <AnnouncementEdit
                        open={true}
                        close={handleCloseAnnouncementEdit}
                        announceInfo={openAnnouncementEdit}
                    />
                )}
                {openAnnouncementAcknowledgements && (
                    <AnnouncementAcknowledgements
                        open={true}
                        close={handleCloseAnnouncementAcknowledgements}
                        uniCode={openAnnouncementAcknowledgements}
                    />
                )}
            </Dialog >
        </>
    );
};

export default AnnouncementManage;
