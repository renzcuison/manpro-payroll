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
import { TaskAlt, MoreVert, Download, WarningAmber, OndemandVideo, Image, Description, Quiz, SwapHoriz, CheckCircle, Visibility, Pending } from "@mui/icons-material";
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

import PDFImage from "../../../../../public/media/assets/PDF_file_icon.png";
import DocImage from "../../../../../public/media/assets/Docx_file_icon.png";
import PPTImage from "../../../../../public/media/assets/PowerPoint_file_icon.png";


const ContentView = () => {
    const { code } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();


    // Content Information
    const [isLoading, setIsLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState(null);
    const [contentId, setContentId] = useState(null);
    const [contentList, setContentList] = useState([]);
    const [sequential, setSequential] = useState(false);

    const [image, setImage] = useState(null);

    // Load Session Data
    useEffect(() => {
        const storedContentId = sessionStorage.getItem('contentId');
        if (storedContentId) {
            setContentId(storedContentId);
        }
        const storedTrainingTitle = sessionStorage.getItem('trainingTitle');
        if (storedTrainingTitle) {
            setTitle(storedTrainingTitle);
        }
        const storedSequence = sessionStorage.getItem('trainingSequence');
        if (storedSequence) {
            setSequential(storedSequence);
        }
        getContentDetails(storedContentId);
        getTrainingContent();
    }, []);

    // Content Details
    const getContentDetails = (id) => {
        setIsLoading(true);
        axiosInstance.get(`/trainings/getContentDetails/${id}`, { headers })
            .then((response) => {
                const resContent = (response.data.content);
                setContent(resContent);
                if (
                    resContent?.content?.type === 'Image' &&
                    resContent?.image
                ) {
                    const byteCharacters = atob(resContent.image);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: resContent.image_mime });

                    setImage(URL.createObjectURL(blob));
                    if (!resContent.is_finished) {
                        handleTrainingViews(resContent.id, true);
                    }
                } else {
                    setImage(null);
                    if (!resContent.has_viewed && !resContent.is_finished) {
                        handleTrainingViews(resContent.id, false);
                    }
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching content details', error);
                setIsLoading(false);
            });
    }
    // Image Cleanup
    useEffect(() => {
        return () => {
            if (image) {
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    // Content List
    const getTrainingContent = () => {
        axiosInstance.get(`/trainings/getEmployeeTrainingContent/${code}`, { headers })
            .then((response) => {
                setContentList(response.data.content || []);
            })
            .catch((error) => {
                console.error('Error fetching training content:', error);
            });
    }

    // Content Selection
    const handleContentChange = (id, unlocked) => {
        if (unlocked) {
            setContentId(id);
            getContentDetails(id);
            sessionStorage.setItem('contentId', id);
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Content Locked!",
                text: "Finish previous content to unlock",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        }
    }

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

    // Content Video
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

    // Content Viewed
    const handleTrainingViews = (id, finished) => {
        const data = {
            code: code,
            id: id,
            finished: finished
        };
        axiosInstance
            .post("/trainings/handleTrainingViews", data, {
                headers,
            })
            .then((response) => {
                getTrainingContent();
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    }

    return (
        <Layout title={"ContentView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Training Content
                        </Typography>
                        <Link to={`/employee/training/${code}`}>
                            <Button
                                variant="contained"
                                color="primary"
                            >
                                <p className="m-0">
                                    Return to Training
                                </p>
                            </Button>
                        </Link>
                    </Box>

                    <Box display="flex" sx={{ mt: 6, mb: 5, bgcolor: "white", borderRadius: "8px", maxHeight: "1000px" }} >
                        <>
                            <Box sx={{ width: "20%", my: 2, mb: 2, p: 3, borderRight: "solid 1px #e0e0e0", }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }} >
                                    {title}
                                </Typography>
                                <Box sx={{ height: "95%" }}>
                                    {contentList.length > 0 && (
                                        contentList.map((cont) => (
                                            <Box
                                                key={cont.id}
                                                display="flex"
                                                sx={{
                                                    mt: 0.5,
                                                    py: 1.5,
                                                    borderRadius: "8px",
                                                    justifyContent: "space-between",
                                                    transition: "background-color 0.3s ease, padding 0.3s ease",
                                                    ...(sequential && contentList.find(item => item.order === cont.order - 1)?.is_finished === false
                                                        ? { backgroundColor: "#777777" }
                                                        : cont.id == contentId
                                                            ? {
                                                                backgroundColor: "#e9ae20",
                                                                pl: 1,
                                                            }
                                                            : {
                                                                "&:hover": {
                                                                    backgroundColor: "#e0e0e0",
                                                                    pl: 1,
                                                                },
                                                            }),
                                                }}
                                                onClick={() =>
                                                    handleContentChange(
                                                        cont.id,
                                                        !(sequential && contentList.find(item => item.order === cont.order - 1)?.is_finished === false)
                                                    )
                                                }
                                            >
                                                <Box display="flex">
                                                    {cont.content.type === 'Video' && <OndemandVideo sx={{ color: cont.id == contentId ? "white" : 'text.secondary' }} />}
                                                    {cont.content.type === 'Image' && <Image sx={{ color: cont.id == contentId ? "white" : 'text.secondary' }} />}
                                                    {(cont.content.type === 'Document' || cont.content.type == 'PowerPoint') && <Description sx={{ color: cont.id == contentId ? "white" : 'text.secondary' }} />}
                                                    {!cont.content.type && <Quiz sx={{ color: cont.id == contentId ? "white" : 'text.secondary' }} />}
                                                    <Typography sx={{ ml: 1, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transiton: "color 0.3s ease", ...(cont.id == contentId && { color: "white", fontWeight: "bold" }), }}>
                                                        {cont.title}
                                                    </Typography>
                                                </Box>
                                                {cont.is_finished ? (
                                                    <CheckCircle sx={{ mr: 1, color: cont.id == contentId ? "white" : "#177604", transiton: "color 0.3s ease" }} />
                                                ) : cont.has_viewed ? (
                                                    <Pending sx={{ mr: 1, color: cont.id == contentId ? "white" : "#f57c00", transiton: "color 0.3s ease" }} />
                                                )
                                                    : null}
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ width: "80%", mt: 6, mb: 2, p: 3 }}>
                                {isLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                                                {content.title || "-"}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sx={{ placeContent: "center", placeItems: "center" }}>
                                            {content.content.type !== "Form" && (
                                                <>
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
                                                </>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
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
                                    </Grid>
                                )}
                            </Box>
                        </>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default ContentView;
