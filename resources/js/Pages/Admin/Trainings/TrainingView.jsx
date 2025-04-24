import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Pagination,
    IconButton,
    Divider,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Tooltip,
    CardActionArea
} from "@mui/material";
import { TaskAlt, MoreVert, WarningAmber, OndemandVideo, Image, Description, Quiz, ErrorOutline } from "@mui/icons-material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import Swal from "sweetalert2";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";
import { first } from "lodash";

import TrainingsEdit from "./Modals/TrainingsEdit";
import ContentAdd from "./Modals/ContentAdd";

import PDFImage from '../../../../../public/media/assets/PDF_file_icon.png';
import DocImage from '../../../../../public/media/assets/Docx_file_icon.png';
import PPTImage from '../../../../../public/media/assets/PowerPoint_file_icon.png';

import ContentSettings from "./Modals/ContentSettings";
import ContentView from "./Modals/ContentView";
import InfoBox from "../../../components/General/InfoBox";

const TrainingView = () => {
    const { code } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Training Data States
    const [isLoading, setIsLoading] = useState(false);
    const [training, setTraining] = useState([]);
    const [content, setContent] = useState([]);
    const [inOrder, setInOrder] = useState(null);

    const [imageLoading, setImageLoading] = useState(true);
    const [imagePath, setImagePath] = useState("");

    useEffect(() => {
        getTrainingDetails();
        getTrainingContent();
    }, []);

    // Training Details
    const getTrainingDetails = () => {
        axiosInstance.get(`/trainings/getTrainingDetails/${code}`, { headers })
            .then((response) => {
                setTraining(response.data.training);
                setInOrder(Boolean(response.data.training.sequential));
                if (response.data.training.cover) {
                    const byteCharacters = window.atob(response.data.training.cover);
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
                    setImagePath("../../../../images/ManProTab.png");
                }
                setImageLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching training details', error);
                if (imagePath && imagePath.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePath);
                }
                setImagePath("../../../../images/ManProTab.png");
                setImageLoading(false);
            });
    }

    // Training Content
    const getTrainingContent = () => {
        axiosInstance.get(`/trainings/getTrainingContent/${code}`, { headers })
            .then((response) => {
                Object.values(blobMap).forEach((url) => {
                    if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                    }
                });
                setBlobMap({});
                setContent(response.data.content || []);
            })
            .catch((error) => {
                console.error('Error fetching training content:', error);
            });
    }

    // Time Formatter
    const formatTime = (time) => {
        if (!time) return '-';

        const absTime = Math.abs(time);

        const hours = Math.floor(absTime / 60);
        const minutes = absTime % 60;

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
    }

    // Content Images
    const [blobMap, setBlobMap] = useState({});
    const renderImage = (id, source, type, mime, data) => {
        let src = "../../../images/ManProTab.png";

        switch (type) {
            case "Image":
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
                // YouTube links
                const youtubeId = getYouTubeId(source);
                if (youtubeId) {
                    src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                    return src;
                }
                // Direct Video URLs
                const hasVideoExtension = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/.test(source.toLowerCase());
                if (hasVideoExtension) {
                    // Add Later
                }
                return src;
            case "Form":
                return "../../../images/ManProTab.png";
            default:
                return "../../../images/ManProTab.png";
        }
    };
    const getYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
        const match = url.match(regex);
        const id = match ? match[1] : null;
        return id && id.length === 11 ? id : null;
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

    // Training Visibility
    const renderVisibility = () => {

        let color, label;

        if (dayjs().isBefore(training.start_date)) {
            label = 'NOT YET OPENED';
            color = '#42a5f5';
        } else if (dayjs().isBefore(training.end_date)) {
            label = 'OPEN';
            color = '#177604';
        } else if (dayjs().isAfter(training.end_date)) {
            label = 'CLOSED';
            color = '#f57c00';
        } else {
            label = "-";
            color = "black";
        }

        return { label: label, color: color }
    }

    // Training Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Edit Training Modal
    const [openEditTrainingModal, setOpenEditTrainingModal] = useState(false);
    const handleOpenEditTrainingModal = () => {
        setOpenEditTrainingModal(true);
    };
    const handleCloseEditTrainingModal = (reload) => {
        setOpenEditTrainingModal(false);
        if (reload) {
            getTrainingDetails();
        }
    };

    // Add Content Modal
    const [openContentAddModal, setOpenContentAddModal] = useState(false);
    const handleOpenContentAddModal = () => {
        setOpenContentAddModal(true);
    };
    const handleCloseContentAddModal = (reload) => {
        setOpenContentAddModal(false);
        if (reload) {
            getTrainingContent();
        }
    };

    // View Content Modal
    const [openContentViewModal, setOpenContentViewModal] = useState(false);
    const [loadContent, setLoadContent] = useState(null)
    const handleOpenContentViewModal = (cont) => {
        setLoadContent(cont.id);
        setOpenContentViewModal(true);
    }
    const handleCloseContentViewModal = (reload) => {
        setLoadContent(null);
        setOpenContentViewModal(false);
        if (reload) {
            getTrainingContent();
        }
    }

    // Content Options Modal
    const [openContentSettingsModal, setOpenContentSettingsModal] = useState(false);
    const handleOpenContentSettingsModal = () => {
        setOpenContentSettingsModal(true);
    }
    const handleCloseContentSettingsModal = (reload, order) => {
        setOpenContentSettingsModal(false);
        if (reload) {
            setInOrder(order);
            getTrainingContent();
        }
    }

    // Training Activation
    const handleUpdateStatus = (type) => {
        let title, text, status, endMessage;
        switch (type) {
            case "Activate":
                title = "Activate Training?";
                text = "Details and Content can no longer be edited";
                endMessage = "activated";
                status = "Active";
                break;
            case "Show":
                title = "Show Training?";
                text = "Training will be visible to employees";
                endMessage = "displayed";
                status = "Active";
                break;
            case "Hide":
                title = "Hide Training?";
                text = "Training will be hidden from employees";
                endMessage = "hidden";
                status = "Hidden";
                break;
            case "Cancel":
                title = "Cancel Training?";
                text = "This action cannot be undone!";
                endMessage = "cancelled";
                status = "Cancelled";
                break;
        }
        if (content.length == 0 && type == "Activate") {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "No Content!",
                text: "You cannot activate a training without any content",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else if (content.some(item => item.empty_form === true) && type === "Activate") {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Empty Form Found!",
                text: "All forms must have at least one item!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: title,
                text: text,
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: type,
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "No",
            }).then((res) => {
                if (res.isConfirmed) {
                    const data = {
                        code: training.unique_code,
                        status: status
                    };
                    axiosInstance
                        .post("/trainings/updateTrainingStatus", data, {
                            headers,
                        })
                        .then((response) => {
                            document.activeElement.blur();
                            document.body.removeAttribute("aria-hidden");
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: `Training successfully ${endMessage}!`,
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonText: "Okay",
                                confirmButtonColor: "#177604",
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    getTrainingDetails();
                                }
                            })
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                            document.body.setAttribute("aria-hidden", "true");
                        });
                }
            });
        }
    };

    return (
        <Layout title={"TrainingView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {training?.title ?? "Training"}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "white", borderRadius: "8px", mb: 5 }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid container columnSpacing={4} rowSpacing={2}>
                                    {/* Core Information */}
                                    <Grid container size={{ xs: 6 }} spacing={1} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                                        <Grid container spacing={1} >
                                            {/* Title and Action Menu */}
                                            <Grid size={{ xs: 12 }}>
                                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary", }}>
                                                        Training Details:
                                                    </Typography>
                                                    {/* Options */}
                                                    {training.status != "Cancelled" && (
                                                        <>
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
                                                                {/* Edit Training */}
                                                                {training.status == "Pending" && (
                                                                    <MenuItem
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleOpenEditTrainingModal();
                                                                            handleMenuClose();
                                                                        }}>
                                                                        Edit
                                                                    </MenuItem>
                                                                )}
                                                                {/* Activate Training */}
                                                                {training.status == "Pending" && (
                                                                    <MenuItem
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleUpdateStatus("Activate");
                                                                            handleMenuClose();
                                                                        }}>
                                                                        Activate
                                                                    </MenuItem>
                                                                )}
                                                                {training.status == "Active" && (
                                                                    <MenuItem
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleUpdateStatus("Hide");
                                                                            handleMenuClose();
                                                                        }}>
                                                                        Hide
                                                                    </MenuItem>
                                                                )}
                                                                {training.status == "Hidden" && (
                                                                    <MenuItem
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleUpdateStatus("Show");
                                                                            handleMenuClose();
                                                                        }}>
                                                                        Show
                                                                    </MenuItem>
                                                                )}
                                                                <MenuItem
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleUpdateStatus("Cancel");
                                                                        handleMenuClose();
                                                                    }}>
                                                                    Cancel
                                                                </MenuItem>
                                                            </Menu>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12 }} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            {/* Status */}
                                            <Grid size={{ xs: 12 }}>
                                                <InfoBox
                                                    title="Status"
                                                    info={String(training.status || "-").toUpperCase()}
                                                    color={training.status == "Pending"
                                                        ? "#e9ae20"
                                                        : training.status == "Active"
                                                            ? "#177604"
                                                            : training.status == "Hidden"
                                                                ? "#f57c00"
                                                                : training.status == "Cancelled"
                                                                    ? "#f44336"
                                                                    : "#000000"}
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                            {/* Visibility */}
                                            {training.status !== "Pending" && training.status !== "Cancelled" && (
                                                <Grid size={{ xs: 12 }}>
                                                    <InfoBox
                                                        title="Visibility"
                                                        info={renderVisibility().label}
                                                        color={renderVisibility().color}
                                                        compact
                                                        clean
                                                    />
                                                </Grid>
                                            )}
                                            <Grid size={{ xs: 12 }} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            {/* Posting Date */}
                                            <Grid size={{ xs: 12 }}>
                                                <InfoBox
                                                    title="Created"
                                                    info={dayjs(training.created_at).format("MMM D, YYYY    h:mm A") || "-"}
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                            {/* Author Information */}
                                            <Grid size={{ xs: 12 }}>
                                                <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', }} >
                                                    <Typography
                                                        sx={{
                                                            color: 'text.secondary',
                                                            fontWeight: 500,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            flex: '0 0 40%',
                                                        }}
                                                    >
                                                        Prepared by
                                                    </Typography>
                                                    <Stack sx={{ flex: '0 0 60%', textAlign: 'left', }} >
                                                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                            {training.author_name || '-'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {training.author_title || '-'}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12 }} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            {/* Opens */}
                                            <Grid size={{ xs: 12 }}>
                                                <InfoBox
                                                    title="Opens"
                                                    info={dayjs(training.start_date).format("MMM D, YYYY    h:mm A") || "-"}
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                            {/* Closes */}
                                            <Grid size={{ xs: 12 }}>
                                                <InfoBox
                                                    title="Closes"
                                                    info={dayjs(training.end_date).format("MMM D, YYYY    h:mm A") || "-"}
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                            {/* Duration */}
                                            <Grid size={{ xs: 12 }}>
                                                <InfoBox
                                                    title="Duration"
                                                    info={formatTime(training.duration)}
                                                    compact
                                                    clean
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    {/* Thumbnail */}
                                    <Grid size={{ xs: 6 }}>
                                        <Box sx={{
                                            position: 'relative',
                                            width: '100%',
                                            aspectRatio: '16 / 9',
                                            borderRadius: "4px",
                                            border: '2px solid #e0e0e0',
                                        }}>
                                            {imageLoading ?
                                                <Box sx={{ display: 'flex', placeSelf: "center", justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                                    <CircularProgress />
                                                </Box>
                                                :
                                                <img
                                                    src={imagePath}
                                                    alt={`${training.title} thumbnail`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            }
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12 }} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Description */}
                                    <Grid size={{ xs: 12 }} >
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                            Description
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                wordWrap: 'break-word',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: training.description }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Content Header */}
                                    <Grid size={{ xs: 12 }} align="left">
                                        <Box display="flex" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                {content.length == 0 ? (
                                                    <>
                                                        <WarningAmber sx={{ color: "#f44336" }} />
                                                        <Typography sx={{ ml: 1, color: "#f44336" }}>
                                                            No Content Found
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary", }}>
                                                        {`Content${content.length > 1 ? 's' : ''}`}
                                                    </Typography>
                                                )
                                                }
                                                {training.status == "Pending" && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleOpenContentAddModal}
                                                        sx={{ ml: 3 }}
                                                    >
                                                        <p className="m-0">
                                                            <i className="fa fa-plus"></i> Add Content{" "}
                                                        </p>
                                                    </Button>
                                                )}
                                            </Box>
                                            {content.length > 0 && (
                                                <Box display="flex" sx={{ justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                                                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                                        {inOrder == null ? "-" : `Contents ${inOrder ? 'have to be completed in order.' : 'can be completed in any order.'}`}
                                                    </Typography>
                                                    {training.status == "Pending" && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={handleOpenContentSettingsModal}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            <p className="m-0">
                                                                Manage
                                                            </p>
                                                        </Button>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                    {/* Content List */}
                                    {content && content.length > 0 && (
                                        <Grid container size={{ xs: 12 }} rowSpacing={3} columnSpacing={2}>
                                            {content.map((cont) => (
                                                <Grid size={{ xs: 4 }} key={cont.id}>
                                                    <CardActionArea title={cont.title || 'Content Item'} onClick={() => handleOpenContentViewModal(cont)}
                                                        sx={{
                                                            "&:hover": {
                                                                transform: "scale(0.97)",
                                                                transition: "transform 0.2s ease-in-out",
                                                            },
                                                        }}
                                                    >
                                                        <Card sx={{ boxShadow: 3 }}>
                                                            <CardMedia
                                                                sx={{
                                                                    height: '180px',
                                                                    backgroundColor: 'transparent',
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    placeSelf: 'center',
                                                                    ...(["Document", "PowerPoint"].includes(cont.content.type)
                                                                        ? {
                                                                            objectFit: "contain",
                                                                            width: '64%',
                                                                        }
                                                                        : {}),
                                                                }}
                                                                image={renderImage(cont.id, cont.content.source, cont.content.type || 'Form', cont.mime, cont.image)}
                                                                alt={cont.title || 'Content Item'}
                                                            />
                                                            <CardContent sx={{ pb: "5px" }}>
                                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                                    <Box sx={{
                                                                        display: 'inline-flex',
                                                                        backgroundColor: "#177604",
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px'
                                                                    }}>
                                                                        <Typography sx={{ color: "white", fontWeight: "bold" }}>
                                                                            {cont.order}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="body1" noWrap>
                                                                        {cont.title || 'Content Item'}
                                                                    </Typography>
                                                                </Stack>
                                                            </CardContent>
                                                            <CardActions sx={{ ml: "8px" }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    {cont.content.type === 'Video' && <OndemandVideo sx={{ color: 'text.secondary' }} />}
                                                                    {cont.content.type === 'Image' && <Image sx={{ color: 'text.secondary' }} />}
                                                                    {(cont.content.type === 'Document' || cont.content.type == 'PowerPoint') && <Description sx={{ color: 'text.secondary' }} />}
                                                                    {!cont.content.type && <Quiz sx={{ color: 'text.secondary' }} />}
                                                                    <Box sx={{ ml: 1 }}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                            {cont.content.type ? cont.content.type : "Form"}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </CardActions>
                                                            {cont.empty_form && (
                                                                <Chip
                                                                    icon={<ErrorOutline sx={{ color: "white !important" }} />}
                                                                    label="EMPTY"
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 8,
                                                                        left: 8,
                                                                        backgroundColor: "#f44336",
                                                                        color: "white",
                                                                        fontWeight: "bold",
                                                                        boxShadow: 2,
                                                                    }}
                                                                />
                                                            )}
                                                        </Card>
                                                    </CardActionArea>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Grid>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {openEditTrainingModal && (
                <TrainingsEdit
                    open={openEditTrainingModal}
                    close={handleCloseEditTrainingModal}
                    trainingInfo={training}
                />
            )}
            {openContentAddModal && (
                <ContentAdd
                    open={openContentAddModal}
                    close={handleCloseContentAddModal}
                    trainingCode={training.unique_code}
                />
            )}
            {openContentViewModal && (
                <ContentView
                    open={openContentViewModal}
                    close={handleCloseContentViewModal}
                    contentId={loadContent}
                    status={training.status}
                />
            )}
            {openContentSettingsModal && (
                <ContentSettings
                    open={openContentSettingsModal}
                    close={handleCloseContentSettingsModal}
                    trainingCode={training.unique_code}
                    contentInfo={content}
                    contentOrder={inOrder}
                    blobs={blobMap}
                />
            )}
        </Layout>
    );
};

export default TrainingView;
