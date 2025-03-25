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
    LinearProgress,
    linearProgressClasses,
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
import { TaskAlt, MoreVert, Download, WarningAmber, OndemandVideo, Image, Description, Quiz, SwapHoriz, Lock } from "@mui/icons-material";
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

import PDFImage from '../../../../../public/media/assets/PDF_file_icon.png';
import DocImage from '../../../../../public/media/assets/Docx_file_icon.png';
import PPTImage from '../../../../../public/media/assets/PowerPoint_file_icon.png';

const TrainingView = () => {
    const { code } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Training Data States
    const [isLoading, setIsLoading] = useState(false);
    const [training, setTraining] = useState([]);
    const [content, setContent] = useState([]);
    const [contentProgress, setContentProgress] = useState(0);
    const [trainingComplete, setTrainingComplete] = useState(null);

    const [imageLoading, setImageLoading] = useState(true);
    const [imagePath, setImagePath] = useState("");

    useEffect(() => {
        getTrainingDetails();
        getTrainingContent();
    }, []);

    // Training Details
    const getTrainingDetails = () => {
        axiosInstance.get(`/trainings/getEmployeeTrainingDetails/${code}`, { headers })
            .then((response) => {
                setTraining(response.data.training);
                if (response.data.training.cover) {
                    const byteCharacters = window.atob(response.data.training.cover);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: response.data.training.cover_mime });

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

    // Training Content
    const getTrainingContent = () => {
        axiosInstance.get(`/trainings/getEmployeeTrainingContent/${code}`, { headers })
            .then((response) => {
                const contentList = response.data.content || [];
                setContent(contentList);

                // Progress
                const totalItems = contentList.length;
                const completedItems = contentList.filter(item => item.is_finished).length;
                const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                setContentProgress(progress);

                // Completion date (Completed Trainings Only)
                if (progress === 100 && contentList.length > 0) {
                    const latestCompletedAt = contentList
                        .filter(item => item.completed_at)
                        .map(item => dayjs(item.completed_at))
                        .sort((a, b) => b.unix() - a.unix())[0];

                    setTrainingComplete(latestCompletedAt ? latestCompletedAt.toISOString() : null);
                } else {
                    setTrainingComplete(null);
                }
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

    // Content Navigator
    const handleContentViewer = (cont, locked) => {
        if (locked) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Content Locked!",
                text: "Finish previous content to unlock",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            sessionStorage.setItem('contentId', cont.id);
            sessionStorage.setItem('trainingTitle', training.title);
            sessionStorage.setItem('trainingSequence', training.sequential);
            navigate(`/employee/training-content/${training.unique_code}`);
        }
    };

    return (
        <Layout title={"TrainingView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Training
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
                                    <Grid item container xs={8} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                                        <Grid item container spacing={1} sx={{ mb: 1 }}>
                                            {/* Title */}
                                            <Grid item xs={12}>
                                                <Typography variant="h5">
                                                    {training.title || "-"}
                                                </Typography>
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
                                                    {dayjs(training.created_at).format("MMM D, YYYY    h:mm A") || "-"}
                                                </Typography>
                                            </Grid>
                                            {/* Author Information */}
                                            <Grid item xs={5} align="left">
                                                Prepared by
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Stack>
                                                    <Typography sx={{ fontWeight: "bold", }}>
                                                        {training.author_name || "-"}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        {training.author_title || "-"}
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
                                            {/* Completion Date */}
                                            {trainingComplete != null ? (
                                                <>
                                                    <Grid item xs={5} align="left">
                                                        Completed At
                                                    </Grid>
                                                    <Grid item xs={7} align="left">
                                                        <Typography sx={{ fontWeight: "bold", }}>
                                                            {dayjs(trainingComplete).format("MMM D, YYYY    h:mm A")}
                                                        </Typography>
                                                    </Grid>
                                                </>
                                            ) : null}
                                        </Grid>
                                    </Grid>
                                    {/* Thumbnail */}
                                    <Grid item xs={4}>
                                        <Box sx={{
                                            position: 'relative',
                                            width: '100%',
                                            aspectRatio: '2 / 1',
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
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    <Grid container item xs={12} spacing={2}>
                                        <Grid item xs={2}>
                                            <Typography>
                                                Your Progress
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={10}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: "bold" }}>
                                                {`${content.filter(item => item.is_finished).length} of ${content.length} Completed`}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={contentProgress}
                                                sx={{
                                                    ml: 3,
                                                    width: "100%",
                                                    height: 15,
                                                    borderRadius: 5,
                                                    backgroundColor: "#e0e0e0",
                                                    boxShadow: 2,
                                                    [`& .${linearProgressClasses.bar}`]: {
                                                        borderRadius: 5,
                                                        backgroundImage: `linear-gradient(90deg, #e9ae20 ${100 - contentProgress}%, #177604 ${200 - contentProgress}%)`,
                                                        transition: "transform 2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Content Header */}
                                    <Grid item xs={12} align="left">
                                        <Typography>
                                            {`Content${content.length > 1 ? 's' : ''}`}
                                        </Typography>
                                    </Grid>
                                    {/* Content List */}
                                    {content.map((cont) => {
                                        const locked = training.sequential && content.find(item => item.order === cont.order - 1)?.is_finished === false;
                                        return (
                                            <Grid item xs={3} key={cont.id}>
                                                <CardActionArea title={cont.title || 'Content Item'} onClick={() => handleContentViewer(cont, locked)}>
                                                    <Card sx={{ boxShadow: 3, position: 'relative' }}>
                                                        {/* Card Content */}
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
                                                        {/* Status Chips */}
                                                        {cont.is_finished ? (
                                                            <Chip
                                                                label="COMPLETED"
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 8,
                                                                    left: 8,
                                                                    backgroundColor: "#177604",
                                                                    color: "white",
                                                                    fontWeight: "bold",
                                                                    boxShadow: 2,
                                                                }}
                                                            />
                                                        ) : cont.has_viewed ? (
                                                            <Chip
                                                                label="PENDING"
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 8,
                                                                    left: 8,
                                                                    backgroundColor: "#f57c00",
                                                                    color: "white",
                                                                    fontWeight: "bold",
                                                                    boxShadow: 2,
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Lock Overlays */}
                                                        {locked ? (
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                                                    zIndex: 1,
                                                                }}
                                                            />
                                                        ) : null}
                                                        {locked ? (
                                                            <Box
                                                                display="flex"
                                                                flexDirection="column"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    zIndex: 2,
                                                                    placeContent: "center",
                                                                    placeItems: "center",
                                                                }}
                                                            >
                                                                <Lock sx={{ height: "36px", width: "36px", color: "white" }} />
                                                                <Typography variant="body2" sx={{ mt: 1, color: "white", fontWeight: "bold" }}>
                                                                    Content Locked
                                                                </Typography>
                                                            </Box>
                                                        ) : null}
                                                    </Card>
                                                </CardActionArea>
                                            </Grid>
                                        );
                                    })}
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
