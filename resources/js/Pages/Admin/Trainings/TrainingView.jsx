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
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
    Card,
    CardMedia,
    CardContent,
    Pagination,
    IconButton,
    Divider,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Tooltip
} from "@mui/material";
import { TaskAlt, MoreVert, Download } from "@mui/icons-material";
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
import { CardActions } from "@material-ui/core";

import PdfImage from '../../../../images/FileTypeIcons/PDF_file_icon.png';
import DocImage from '../../../../images/FileTypeIcons/Docx_file_icon.png';
import XlsImage from '../../../../images/FileTypeIcons/Excel_file_icon.png';

const TrainingView = () => {
    const { code } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Announcement Data States
    const [announcement, setAnnouncement] = useState([]);


    const [isLoading, setIsLoading] = useState(false);
    const [training, setTraining] = useState([]);

    const [imageLoading, setImageLoading] = useState(true);
    const [imagePath, setImagePath] = useState("");

    const [videos, setVideos] = useState([]);
    const [images, setImages] = useState([]);
    const [attachments, setAttachments] = useState([]);

    useEffect(() => {
        getTrainingDetails();
        getTrainingMedia();
    }, []);

    // Training Details
    const getTrainingDetails = () => {
        axiosInstance.get(`/trainings/getTrainingDetails/${code}`, { headers })
            .then((response) => {
                setTraining(response.data.training);
                console.log(response.data.training);
                if (response.data.training.cover) {
                    const byteCharacters = window.atob(response.data.training.cover);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/png' });

                    setImagePath(URL.createObjectURL(blob));
                } else {
                    setImagePath("../../../../images/ManProTab.png");
                }
                setImageLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching training details', error);
                setImagePath("../../../../images/ManProTab.png");
                setImageLoading(false);
            });
    }

    // Training Media
    const getTrainingMedia = () => {
        axiosInstance.get(`/trainings/getTrainingMedia/${code}`, { headers })
            .then((response) => {
                setImages(response.data.images);
                setAttachments(response.data.attachments);
                setVideos(response.data.videos);
            })
            .catch((error) => {
                console.error('Error fetching training media:', error);
            });
    }

    // Document Icon
    const getFileIcon = (filename) => {
        const fileType = filename
            .split(".")
            .pop()
            .toLowerCase();

        let src = null;

        switch (fileType) {
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

    // Download Attachment
    const handleFileDownload = (filename, id) => {
        console.log(`Downloading File:      ${filename}`)
        // axiosInstance.get(`/announcements/downloadFile/${id}`, { responseType: "blob", headers })
        //     .then((response) => {
        //         const blob = new Blob([response.data], {
        //             type: response.headers["content-type"],
        //         });
        //         const link = document.createElement("a");
        //         link.href = window.URL.createObjectURL(blob);
        //         link.download = filename;
        //         link.click();

        //         window.URL.revokeObjectURL(link.href);
        //     })
        //     .catch((error) => {
        //         console.error("Error downloading file:", error);
        //     });
    };

    // ---------------- Time Formatter
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

    // Training Menu
    const [anchorEl, setAnchorEl] = React.useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Layout title={"AnnouncementView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Training
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid container columnSpacing={4} rowSpacing={2}>
                                    {/* Core Information */}
                                    <Grid item container xs={7} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                                        <Grid item container spacing={1} sx={{ mb: 1 }}>
                                            {/* Title and Action Menu */}
                                            <Grid item xs={12}>
                                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="h5">
                                                        {training.title}
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
                                                        {/* Acknowledgement */}
                                                        <MenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                console.log(`Editing Training:  ${training.title}`);
                                                                handleMenuClose();
                                                            }}>
                                                            Edit
                                                        </MenuItem>
                                                    </Menu>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            {/* Posting Date */}
                                            <Grid item xs={5} align="left">
                                                Created
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    {dayjs(training.created_at).format("MMM D, YYYY    h:mm A")}
                                                </Typography>
                                            </Grid>
                                            {/* Author Information */}
                                            <Grid item xs={5} align="left">
                                                Prepared by
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Stack>
                                                    <Typography sx={{ fontWeight: "bold", }}>
                                                        {training.author_name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        {training.author_title}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} sx={{ my: 0 }} >
                                                <Divider />
                                            </Grid>
                                            {/* Opens */}
                                            <Grid item xs={5} align="left">
                                                Opens
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    {dayjs(training.start_date).format("MMM D, YYYY    h:mm A")}
                                                </Typography>
                                            </Grid>
                                            {/* Closes */}
                                            <Grid item xs={5} align="left">
                                                Closes
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    {dayjs(training.end_date).format("MMM D, YYYY    h:mm A")}
                                                </Typography>
                                            </Grid>
                                            {/* Duration */}
                                            <Grid item xs={5} align="left">
                                                Duration
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    {formatTime(training.duration)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
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
                                                alt={`${training.title} thumbnail`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: "4px",
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
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
                                            dangerouslySetInnerHTML={{ __html: training.description }}
                                        />
                                    </Grid>
                                    {/* Divider for Media if Present */}
                                    {(images.length > 0 || attachments.length > 0) &&
                                        <Grid item xs={12} sx={{ my: 0 }} >
                                            <Divider />
                                        </Grid>
                                    }
                                    {/* Images */}
                                    {images.length > 0 ? (
                                        <Grid item container xs={12} md={12} spacing={2}>
                                            <Grid item xs={12} align="left">
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
                                                                src={`${location.origin}/storage/trainings/images/${image.filename}`}
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
                                        </Grid>)
                                        : null
                                    }
                                    {/* Documents */}
                                    {attachments.length > 0 ? (
                                        <Grid item container xs={12} md={12} spacing={2}>
                                            <Grid item xs={12} align="left">
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
                                        </Grid>)
                                        : null
                                    }
                                </Grid>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default TrainingView;
