import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    MenuItem,
    Divider,
    Stack,
    Tooltip,
    Menu,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    CircularProgress,
    Avatar
} from "@mui/material";
import { MoreVert, Download } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import InfoBox from "../../../../components/General/InfoBox";
import mammoth from "mammoth";

import PdfImage from '../../../../../../public/media/assets/PDF_file_icon.png';
import DocImage from '../../../../../../public/media/assets/Docx_file_icon.png';
import XlsImage from '../../../../../../public/media/assets/Excel_file_icon.png';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import AnnouncementPublish from './AnnouncementPublish';
import AnnouncementEdit from './AnnouncementEdit';
import AnnouncementAcknowledgements from "./AnnouncementAcknowledgements";
import AnnouncementAttachments from "./AnnouncementAttachments";

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
    const [roles, setRoles] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [employmentStatuses, setEmploymentStatuses] = useState([]);
    const [announcementType, setAnnouncementType] = useState('');
    const [scheduledSendDatetime, setScheduledSendDatetime] = useState(null);
    const [announcement, setAnnouncement] = useState(announceInfo || {});
    const [exitReload, setExitReload] = useState(false);

    const [acknowledgements, setAcknowledgements] = useState([]);
    const [unAcknowledged, setUnAcknowledged] = useState([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const [docxHtml, setDocxHtml] = useState("");

    const [attachmentsModal, setAttachmentsModal] = useState({ open: false, type: null });

    const hasImages = Array.isArray(images) && images.length > 0;
    const hasDocuments = Array.isArray(attachments) && attachments.length > 0;
    const cardWidth = hasImages && hasDocuments ? "48%" : "48%";

    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [imagePreviewSrc, setImagePreviewSrc] = useState("");
    const [imagePreviewName, setImagePreviewName] = useState("");

    const handleCloseAttachmentsModal = () => {
        setAttachmentsModal((prev) => ({ ...prev, open: false }));
    };

    const handlePreviewImage = (img) => {
        let src = img.url || (img.id && renderImage ? renderImage(img.id, img.data, img.mime_type) : "");
        setImagePreviewSrc(src);
        setImagePreviewName(img.filename || "");
        setImagePreviewOpen(true);
    };

    // ----------- Additional Details
    useEffect(() => {
        if (!announceInfo?.unique_code) {
            console.error('Invalid announceInfo:', announceInfo);
            return;
        }
        console.log('Stored User:', JSON.parse(storedUser));
        getAnnouncementThumbnail();
        getAnnouncementFiles();
        getAnnouncementPublishmentDetails();
    }, [announceInfo]);

    // Announcement Menu
    const [anchorEl, setAnchorEl] = useState(null);
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
        setOpenAnnouncementPublish(announcement);
    };
    const handleCloseAnnouncementPublish = (reload) => {
        setOpenAnnouncementPublish(null);
        if (reload) {
            setExitReload(true);
            announcementReloader();
        }
    };

    // ---------------- Announcement Editing
    const [openAnnouncementEdit, setOpenAnnouncementEdit] = useState(null);
    const handleOpenAnnouncementEdit = (announcement) => {
        setOpenAnnouncementEdit(announcement);
    };
    const handleCloseAnnouncementEdit = (reload) => {
        setOpenAnnouncementEdit(null);
        if (reload) {
            announcementReloader();
            setExitReload(true);
        }
    };


    const handleDeleteAnnouncement = (announcement) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: `Delete Announcement?`,
            text: `Are you sure you want to delete this announcement?\This action can't be undone!`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {

                const data = {
                    announcement: announcement.id,
                };

                axiosInstance.post('/announcements/deleteAnnouncement', data, { headers })
                    .then(response => {
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Announcement deleted successfully!",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true,
                            confirmButtonText: 'Proceed',
                            confirmButtonColor: '#177604',
                        }).then(() => {
                            setExitReload(true);
                            close(exitReload);
                            window.location.reload();
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

            }
        });
    };

    // ---------------- Announcement Acknowledgements
    const [openAnnouncementAcknowledgements, setOpenAnnouncementAcknowledgements] = useState(null);
    const handleOpenAnnouncementAcknowledgements = (unicode) => {
        setOpenAnnouncementAcknowledgements(unicode);
    };
    const handleCloseAnnouncementAcknowledgements = () => {
        setOpenAnnouncementAcknowledgements(null);
    };

    // ---------------- Application Hiding
    const handleToggleHide = (toggle, code) => {
        console.log('handleToggleHide:', { toggle, code, user: JSON.parse(storedUser) });
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
                    .post(`/announcements/toggleHide/${code}`, {}, { headers })
                    .then((response) => {
                        console.log('toggleHide Response:', response.data);
                        if (response.data.status === 200) {
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
                        } else {
                            throw new Error(`Unexpected status: ${response.data.status}`);
                        }
                    })
                    .catch((error) => {
                        console.error("Error toggling Hidden Status:", {
                            message: error.message,
                            response: error.response?.data,
                            status: error.response?.status,
                        });
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Error!",
                            text: error.response?.data?.message || "Failed to toggle announcement visibility. Please try again.",
                            icon: "error",
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#d32f2f",
                        });
                    });
            }
        });
    };

    // ---------------- Announcement Detail Reloader
    const announcementReloader = () => {
        if (!announceInfo?.unique_code) {
            console.error('Cannot reload announcement: missing unique_code');
            return;
        }
        axiosInstance.get(`/announcements/getAnnouncementDetails/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                console.log('announcementReloader Response:', response.data);
                setAnnouncement(response.data.announcement || {});
            })
            .catch((error) => {
                console.error('Error fetching updated announcement details', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
            });
        getAnnouncementThumbnail();
        getAnnouncementPublishmentDetails();
        getAnnouncementFiles();
    };

    // ---------------- Announcement Files
    const getAnnouncementFiles = () => {
        if (!announceInfo?.unique_code) {
            console.error('Cannot fetch files: missing unique_code');
            setImages([]);
            setAttachments([]);
            return;
        }
        axiosInstance.get(`/announcements/getAnnouncementFiles/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                console.log('getAnnouncementFiles Response:', response.data);
                setImages(Array.isArray(response.data.images) ? response.data.images : []);
                setAttachments(Array.isArray(response.data.attachments) ? response.data.attachments : []);
            })
            .catch((error) => {
                console.error('Error fetching files:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                setImages([]);
                setAttachments([]);
            });
    };

    // ---------------- Thumbnail
    const getAnnouncementThumbnail = () => {
        if (!announceInfo?.unique_code) {
            console.error('Cannot fetch thumbnail: missing unique_code');
            setImagePath(null);
            setImageLoading(false);
            return;
        }
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
                    setImagePath(null);
                }
                setImageLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching thumbnail:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                setImagePath(null);
                setImageLoading(false);
            });
    };

    // ---------------- Recipient Branch and Departments
    const getAnnouncementPublishmentDetails = () => {
        if (!announceInfo?.unique_code) {
            console.error('Cannot fetch branch/depts: missing unique_code');
            setBranches([]);
            setDepartments([]);
            setRoles([]);
            setEmploymentTypes([]);
            setEmploymentStatuses([]);
            return;
        }
        axiosInstance.get(`/announcements/getAnnouncementPublishmentDetails/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                setBranches(Array.isArray(response.data.branches) ? response.data.branches : []);
                setDepartments(Array.isArray(response.data.departments) ? response.data.departments : []);
                setRoles(Array.isArray(response.data.roles) ? response.data.roles : []);
                setEmploymentTypes(Array.isArray(response.data.employment_types) ? response.data.employment_types : []);
                setEmploymentStatuses(Array.isArray(response.data.employment_statuses) ? response.data.employment_statuses : []);
                setAnnouncementType(response.data.announcement_type || 'N/A');
                setScheduledSendDatetime(response.data.scheduled_send_datetime || null); // <-- Add this
            })
            .catch((error) => {
                console.error('Error fetching published branch/departments:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                setBranches([]);
                setDepartments([]);
                setRoles([]);
                setEmploymentTypes([]);
                setEmploymentStatuses([]);
                setAnnouncementType('N/A');
                setScheduledSendDatetime(null);
            });
    };

    // ---------------- Dynamic File Icon
    const getFileIcon = (filename) => {
        const fileType = filename
            ?.split(".")
            .pop()
            ?.toLowerCase();

        let src = null;
        switch (fileType) {
            case "png":
            case "jpg":
            case "jpeg":
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
                console.error("Error downloading file:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
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
    };

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
    }, [imagePath]);

    useEffect(() => {
        if (!announceInfo?.unique_code) return;
        axiosInstance
            .get(`/announcements/getAcknowledgements/${announceInfo.unique_code}`, { headers })
            .then((response) => {
                console.log("Fetched acknowledgements:", response.data.acknowledgements);
                setAcknowledgements(response.data.acknowledgements || []);
                setUnAcknowledged(response.data.unacknowledged || []);
            })
            .catch((error) => {
                console.error("Error fetching acknowledgements:", error);
                setAcknowledgements([]);
                setUnAcknowledged([]);
            });
    }, [announceInfo?.unique_code]);

    // ---------------- File Preview
    useEffect(() => {
        if (!previewOpen) setDocxHtml("");
    }, [previewOpen]);

    const handlePreviewFile = (filename, id, mimeType) => {
        axiosInstance.get(`/announcements/downloadFile/${id}`, { responseType: "blob", headers })
            .then(async (response) => {
                const blob = new Blob([response.data], { type: mimeType });
                const url = URL.createObjectURL(blob);

                if (
                    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                    filename.endsWith(".docx")
                ) {
                    const arrayBuffer = await blob.arrayBuffer();
                    mammoth.convertToHtml({ arrayBuffer }).then(result => {
                        setDocxHtml(result.value);
                        setPreviewFile({ url, mimeType, filename });
                        setPreviewOpen(true);
                    });
                } else {
                    setPreviewFile({ url, mimeType, filename });
                    setPreviewOpen(true);
                }
            })
            .catch((error) => {
                console.error("Error previewing file:", error);
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "800px" }, maxWidth: '1000px', maxHeight: '750px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}> {announcement.title || "Announcement"} </Typography>
                        <IconButton onClick={() => close(exitReload)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box>
                        <Grid container columnSpacing={4} rowSpacing={2}>
                            {/* Thumbnail */}
                            {imageLoading || imagePath ? (
                                <Grid size={{ xs: 5 }}>
                                    <Box sx={{ position: 'relative', width: '100%', height: 210, borderRadius: "4px", border: '2px solid #e0e0e0' }}>
                                        {imageLoading ? (
                                        <Box sx={{ display: 'flex', placeSelf: "center", justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                                            <CircularProgress />
                                        </Box>
                                        ) : (
                                        <img src={imagePath} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: "4px" }} />
                                        )}
                                    </Box>
                                </Grid>
                                ) : null}
                            {/* Core Information */}
                            {imageLoading || imagePath ? (
                                <Grid container size={{ xs: 7 }} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                                    <Grid container spacing={1} sx={{ mb: 1 }}>
                                        {/* Title and Action Menu */}
                                        <Grid size={12}>
                                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                    Publishment Details
                                                </Typography>
                                                <IconButton
                                                    id="basic-button"
                                                    size="small"
                                                    aria-controls={open ? 'basic-menu' : undefined}
                                                    aria-haspopup="true"
                                                    aria-expanded={open ? 'true' : undefined}
                                                    onClick={handleMenuClick}
                                                    sx={{ m: 0 }}
                                                >
                                                    <MoreVert />
                                                </IconButton>

                                                <Menu id="basic-menu" anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} MenuListProps={{ 'aria-labelledby': 'basic-button' }} >
                                                    {announcement.status === "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleOpenAnnouncementEdit(announcement);
                                                                handleMenuClose();
                                                            }}>
                                                            Edit
                                                        </MenuItem>
                                                    )}
                                                    {!scheduledSendDatetime && announcement.status === "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleOpenAnnouncementPublish(announcement);
                                                                handleMenuClose();
                                                            }}>
                                                            Publish
                                                        </MenuItem>
                                                    )}

                                                    {announcement.status !== "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                handleOpenAnnouncementAcknowledgements(announcement.unique_code);
                                                            }}>
                                                            View Acknowledgements
                                                        </MenuItem>
                                                    )}
                                                    {announcement.status !== "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleToggleHide(announcement.status === "Published", announcement.unique_code);
                                                                handleMenuClose();
                                                            }}>
                                                            {announcement.status === "Hidden" ? 'Show Announcement' : 'Hide Announcement'}
                                                        </MenuItem>
                                                    )}

                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteAnnouncement(announcement);
                                                            handleMenuClose();
                                                        }}>
                                                        Delete Announcement
                                                    </MenuItem>

                                                </Menu>
                                            </Stack>
                                        </Grid>
                                        <Grid size={12} sx={{ my: 0 }}>
                                            <Divider />
                                        </Grid>
                                        {/* Announcement Status & Visibility */}
                                        <Grid size={12}>
                                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                <InfoBox
                                                    title="Status"
                                                    info={announcement.status === "Pending" ? "PENDING" : announcement.status === "Hidden" ? "HIDDEN" : "PUBLISHED"}
                                                    color={announcement.status === "Pending" ? "#e9ae20" : announcement.status === "Hidden" ? "#f57c00" : "#177604"}
                                                    compact
                                                    clean
                                                />
                                                {announcement.status !== "Pending" && (
                                                    <InfoBox
                                                        title="Visibility"
                                                        info={announcement.status === "Published" ? "VISIBLE" : "HIDDEN"}
                                                        color={announcement.status === "Published" ? "#177604" : "#f57c00"}
                                                        compact
                                                        clean
                                                    />
                                                )}
                                            </Stack>
                                        </Grid> 
                                        {announcement.status === "Pending" && scheduledSendDatetime && (
                                            <Grid size={12}>
                                                <InfoBox
                                                    title="Scheduled Post"
                                                    info={dayjs(scheduledSendDatetime).format('MMM D, YYYY h:mm A')}
                                                    color="#1976d2"
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                        )}
                                        {announcement.status !== "Pending" || scheduledSendDatetime ? (
                                            <Grid container size={12} spacing={1}>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Announcement Type"
                                                        info={announcementType || 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Branches"
                                                        info={branches.length > 0 ? branches.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Departments"
                                                        info={departments.length > 0 ? departments.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Roles"
                                                        info={roles.length > 0 ? roles.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Status"
                                                        info={employmentStatuses.length > 0 ? employmentStatuses.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Employment Type"
                                                        info={employmentTypes.length > 0 ? employmentTypes.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Grid size={12} align="center">
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    -- Publishing Data Unavailable --
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            ): (
                                <Grid container size={{ xs: 12 }} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                                    <Grid container size={{ xs: 12 }} spacing={1} sx={{ mb: 1 }}>
                                        {/* Title and Action Menu */}
                                        <Grid size={12}>
                                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                    Publishment Details
                                                </Typography>
                                                <IconButton
                                                    id="basic-button"
                                                    size="small"
                                                    aria-controls={open ? 'basic-menu' : undefined}
                                                    aria-haspopup="true"
                                                    aria-expanded={open ? 'true' : undefined}
                                                    onClick={handleMenuClick}
                                                    sx={{ m: 0 }}
                                                >
                                                    <MoreVert />
                                                </IconButton>

                                                <Menu id="basic-menu" anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} MenuListProps={{ 'aria-labelledby': 'basic-button' }} >
                                                    {announcement.status === "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleOpenAnnouncementEdit(announcement);
                                                                handleMenuClose();
                                                            }}>
                                                            Edit
                                                        </MenuItem>
                                                    )}
                                                    {!scheduledSendDatetime && announcement.status === "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleOpenAnnouncementPublish(announcement);
                                                                handleMenuClose();
                                                            }}>
                                                            Publish
                                                        </MenuItem>
                                                    )}

                                                    {announcement.status !== "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                handleOpenAnnouncementAcknowledgements(announcement.unique_code);
                                                            }}>
                                                            View Acknowledgements
                                                        </MenuItem>
                                                    )}
                                                    {announcement.status !== "Pending" && (
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleToggleHide(announcement.status === "Published", announcement.unique_code);
                                                                handleMenuClose();
                                                            }}>
                                                            {announcement.status === "Hidden" ? 'Show Announcement' : 'Hide Announcement'}
                                                        </MenuItem>
                                                    )}

                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteAnnouncement(announcement);
                                                            handleMenuClose();
                                                        }}>
                                                        Delete Announcement
                                                    </MenuItem>

                                                </Menu>
                                            </Stack>
                                        </Grid>
                                        <Grid size={12} sx={{ my: 0 }}>
                                            <Divider />
                                        </Grid>
                                        {/* Announcement Status & Visibility */}
                                        <Grid size={12}>
                                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                <InfoBox
                                                    title="Status"
                                                    info={announcement.status === "Pending" ? "PENDING" : announcement.status === "Hidden" ? "HIDDEN" : "PUBLISHED"}
                                                    color={announcement.status === "Pending" ? "#e9ae20" : announcement.status === "Hidden" ? "#f57c00" : "#177604"}
                                                    compact
                                                    clean
                                                />
                                                {announcement.status !== "Pending" && (
                                                    <InfoBox
                                                        title="Visibility"
                                                        info={announcement.status === "Published" ? "VISIBLE" : "HIDDEN"}
                                                        color={announcement.status === "Published" ? "#177604" : "#f57c00"}
                                                        compact
                                                        clean
                                                    />
                                                )}
                                            </Stack>
                                        </Grid> 
                                        {announcement.status === "Pending" && scheduledSendDatetime && (
                                            <Grid size={12}>
                                                <InfoBox
                                                    title="Scheduled Post"
                                                    info={dayjs(scheduledSendDatetime).format('MMM D, YYYY h:mm A')}
                                                    color="#1976d2"
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                        )}
                                        {announcement.status !== "Pending" || scheduledSendDatetime ? (
                                            <Grid container size={12} spacing={1}>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Announcement Type"
                                                        info={announcementType || 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Branches"
                                                        info={branches.length > 0 ? branches.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Departments"
                                                        info={departments.length > 0 ? departments.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Roles"
                                                        info={roles.length > 0 ? roles.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Status"
                                                        info={employmentStatuses.length > 0 ? employmentStatuses.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                                <Grid size={12}>
                                                    <InfoBox
                                                        title="Employment Type"
                                                        info={employmentTypes.length > 0 ? employmentTypes.join(', ') : 'N/A'}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Grid size={12} align="center" sx={{ mt: 1 }}>
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    -- Publishing Data Unavailable --
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            )}
                            <Grid size={12} sx={{ my: 0 }}>
                                <Divider />
                            </Grid>
                            {/* Description */}
                            <Grid size={12} align="left">
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    Announcement Details
                                </Typography>
                            </Grid>
                            <Grid size={12}  sx={{ mb: 0 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: announceInfo?.description || '' }}
                                />
                            </Grid>
                            {(hasImages || hasDocuments) && (
                                <Grid size={12}>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                    {hasImages && (
                                        <Box
                                        sx={{
                                            width: cardWidth,
                                            bgcolor: "#f5f5f5",
                                            borderRadius: 2,
                                            boxShadow: 2,
                                            cursor: "pointer",
                                            textAlign: "center",
                                            p: 3,
                                            "&:hover": { boxShadow: 4, bgcolor: "#e0e0e0" }
                                        }}
                                        onClick={() => setAttachmentsModal({ open: true, type: "images" })}
                                        >
                                        <i className="fa fa-file-image-o" aria-hidden="true" style={{ fontSize: 32, color: "#333", marginBottom: 8 }}></i>
                                        <Typography variant="h6" fontWeight="bold">IMAGES</Typography>
                                        <Typography variant="body2" color="text.secondary">{images.length} attached</Typography>
                                        </Box>
                                    )}
                                    {hasDocuments && (
                                        <Box
                                        sx={{
                                            width: cardWidth,
                                            bgcolor: "#f5f5f5",
                                            borderRadius: 2,
                                            boxShadow: 2,
                                            cursor: "pointer",
                                            textAlign: "center",
                                            p: 3,
                                            "&:hover": { boxShadow: 4, bgcolor: "#e0e0e0" }
                                        }}
                                        onClick={() => setAttachmentsModal({ open: true, type: "documents" })}
                                        >
                                        <i className="fa fa-file-text" aria-hidden="true" style={{ fontSize: 32, color: "#333", marginBottom: 8 }}></i>
                                        <Typography variant="h6" fontWeight="bold">DOCUMENTS</Typography>
                                        <Typography variant="body2" color="text.secondary">{attachments.length} attached</Typography>
                                        </Box>
                                    )}
                                    </Box>
                                </Grid>
                                )}
                            {announcement.status !== "Pending" ? (
                            <Grid container columnSpacing={4} rowSpacing={2}> 
                                    {/* Acknowledgements */}
                                    <Grid size={12} sx={{ my: 0 }}>
                                        <Divider />
                                    </Grid>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%'}}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Acknowledged By
                                        </Typography>
                                        {acknowledgements.length > 0 ? (
                                            <Box display="flex" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                            {acknowledgements.map((ack, index) => (
                                                <Tooltip
                                                    key={ack.emp_id || index}
                                                    title={
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} color="#fff">
                                                                {`${ack.emp_first_name} ${ack.emp_middle_name || ''} ${ack.emp_last_name} ${ack.emp_suffix || ''}`.replace(/\s+/g, ' ').trim()}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Branch: {ack.branch || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Department: {ack.department || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Role: {ack.emp_role || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Status: {ack.emp_status || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Type: {ack.emp_type || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Acknowledged on: {dayjs(ack.timestamp).format('MMM D, YYYY h:mm A') || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    arrow
                                                    slotProps={{
                                                        popper: {
                                                        sx: {
                                                            [`& .MuiTooltip-tooltip`]: {
                                                            backgroundColor: '#198754', // Your custom color
                                                            color: '#fff',              // Text color
                                                            },
                                                            [`& .MuiTooltip-arrow`]: {
                                                            color: '#198754',           // Arrow color
                                                            },
                                                        }
                                                        }
                                                    }}
                                                >
                                                    <Avatar
                                                        alt={`${ack.emp_first_name}_Avatar`}
                                                        src={ack.emp_profile_pic ? `${location.origin}/storage/${ack.emp_profile_pic}` : '../../../../../images/avatarpic.jpg'}
                                                        sx={{
                                                            mr: 1,
                                                            transition: 'background 0.2s, box-shadow 0.2s',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: '#198754', // Your desired hover color
                                                                boxShadow: 3,               // Optional: adds a shadow on hover
                                                            },
                                                        }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </Box>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                -- No Acknowledgements --
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%'}}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Waiting to be acknowledged by
                                        </Typography>
                                        {unAcknowledged.length > 0 ? (
                                            <Box display="flex" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {unAcknowledged.map((ack, index) => (
                                                    <Tooltip
                                                        key={ack.emp_id || index}
                                                        title={
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} color="#fff">
                                                                    {`${ack.emp_first_name} ${ack.emp_middle_name || ''} ${ack.emp_last_name} ${ack.emp_suffix || ''}`.replace(/\s+/g, ' ').trim()}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Branch: {ack.branch || 'N/A'}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Department: {ack.department || 'N/A'}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Role: {ack.emp_role || 'N/A'}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Status: {ack.emp_status || 'N/A'}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Type: {ack.emp_type || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        arrow 
                                                        slotProps={{
                                                            popper: {
                                                            sx: {
                                                                [`& .MuiTooltip-tooltip`]: {
                                                                backgroundColor: '#dc3545', // Your custom color
                                                                color: '#fff',              // Text color
                                                                },
                                                                [`& .MuiTooltip-arrow`]: {
                                                                color: '#dc3545',           // Arrow color
                                                                },
                                                            }
                                                            }
                                                        }}
                                                    >
                                                        <Avatar
                                                            alt={`${ack.emp_first_name}_Avatar`}
                                                            src={ack.emp_profile_pic ? `${location.origin}/storage/${ack.emp_profile_pic}` : '../../../../../images/avatarpic.jpg'}
                                                            sx={{
                                                                mr: 1,
                                                                transition: 'background 0.2s, box-shadow 0.2s',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    backgroundColor: '#dc3545',  // Your desired hover color
                                                                    boxShadow: 3,               // Optional: adds a shadow on hover
                                                                },
                                                            }}
                                                        />
                                                    </Tooltip>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                -- Announcement Acknowledged by all recipients --
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            ) : (
                                <Grid size={12} align="center">
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        -- Acknowledgement Details Unavailable --
                                    </Typography>
                                </Grid>
                            )}
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
                <AnnouncementAttachments
                    open={attachmentsModal.open}
                    onClose={handleCloseAttachmentsModal}
                    type={attachmentsModal.type}
                    items={attachmentsModal.type === "images" ? images : attachments}
                    handleFileDownload={handleFileDownload}
                    handlePreviewFile={handlePreviewFile}
                    handlePreviewImage={handlePreviewImage}
                    renderImage={renderImage}
                    />
            </Dialog>

            {/* Image Preview */}
            <Dialog open={imagePreviewOpen} onClose={() => setImagePreviewOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {imagePreviewName}
                    <IconButton
                    aria-label="close"
                    onClick={() => setImagePreviewOpen(false)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                    <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                    <img src={imagePreviewSrc} alt={imagePreviewName} style={{ maxWidth: "100%", maxHeight: 500, borderRadius: 8 }} />
                </DialogContent>
            </Dialog>

            <Dialog open={previewOpen} onClose={() => {
                    if (previewFile?.url) URL.revokeObjectURL(previewFile.url);
                    setPreviewOpen(false);
                    setPreviewFile(null);
                }} maxWidth="md" fullWidth>
                <DialogTitle>
                    {previewFile?.filename}
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            if (previewFile?.url) URL.revokeObjectURL(previewFile.url);
                            setPreviewOpen(false);
                            setPreviewFile(null);
                        }}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ minHeight: 600 }}>
                    {previewFile &&
                    (
                        (previewFile.mimeType?.toLowerCase().includes("pdf") ||
                        previewFile.filename?.toLowerCase().endsWith(".pdf"))
                        ? (
                            <iframe
                            src={previewFile.url}
                            title="PDF Preview"
                            width="100%"
                            height="500px"
                            style={{ border: "none" }}
                            />
                        )
                        : (previewFile.mimeType?.toLowerCase().includes("word") ||
                            previewFile.filename?.toLowerCase().endsWith(".docx"))
                        ? (
                            <Box sx={{ width: "100%", minHeight: 400, bgcolor: "#fafafa", p: 2, overflow: "auto" }}>
                            <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
                            </Box>
                        )
                        : (
                            <Typography>
                            Preview not supported for this file type. Please download to view.
                            </Typography>
                        )
                    )
                    }
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AnnouncementManage;