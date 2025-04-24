import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Grid,
    CircularProgress,
    CardMedia,
    IconButton,
    Divider,
    Tooltip,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { OndemandVideo, Image, Description, Quiz, Lock, CheckBox, ArrowBackIos, ArrowForwardIos, HourglassBottom, KeyboardReturn } from "@mui/icons-material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import Swal from "sweetalert2";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import PDFImage from "../../../../../public/media/assets/PDF_file_icon.png";
import DocImage from "../../../../../public/media/assets/Docx_file_icon.png";
import PPTImage from "../../../../../public/media/assets/PowerPoint_file_icon.png";
import FormViews from "./Components/FormViews";

const ContentView = () => {
    const { code } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const theme = useTheme();
    const medScreen = useMediaQuery(theme.breakpoints.up('md'));
    const capSize = medScreen ? "h4" : "h5";

    // Content Information
    const [isLoading, setIsLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState(null);
    const [contentId, setContentId] = useState(null);
    const [contentList, setContentList] = useState([]);
    const [sequential, setSequential] = useState(false);

    const [file, setFile] = useState(null);

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
        if (storedSequence && storedSequence == 1) {
            setSequential(true);
        }
        getContentDetails(storedContentId);
        getTrainingContent(storedContentId);
    }, []);

    // Content Details
    const getContentDetails = (id) => {
        setIsLoading(true);
        axiosInstance.get(`/trainings/getEmployeeContentDetails/${id}`, { headers })
            .then((response) => {
                const resContent = (response.data.content);
                setContent(resContent);
                // File Decoder
                if (resContent?.content?.type != "Video" && resContent?.file) {
                    if (file && file.url.startsWith('blob:')) {
                        URL.revokeObjectURL(file);
                    }
                    const byteCharacters = atob(resContent.file);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: resContent.file_mime });

                    const filePath = resContent.content.source;
                    const fileName = filePath.split('/').pop() ||
                        (resContent.title || `content_${id}.${resContent.file_mime.split('/')[1] || 'file'}`);
                    const blobUrl = URL.createObjectURL(blob);

                    setFile({ url: blobUrl, name: fileName });
                } else {
                    setFile(null);
                }
                // Training View Tracker
                if (resContent?.content?.type == "Image") {
                    if (!resContent.is_finished) {
                        handleTrainingViews(resContent.id, true);
                    }
                } else {
                    if (!resContent.has_viewed && !resContent.is_finished) {
                        handleTrainingViews(resContent.id, false);
                    }
                }
                // Training Form Details
                if (resContent?.content?.type == "Form") {
                    getFormDetails(resContent.id);
                } else {
                    setIsLoading(false); // End Form Loading after form details are retrieved
                }
            })
            .catch((error) => {
                console.error('Error fetching content details', error);
                setIsLoading(false);
            });
    }
    // File Cleanup
    useEffect(() => {
        return () => {
            if (file && file.url.startsWith('blob:')) {
                URL.revokeObjectURL(file.url);
            }
        };
    }, [file]);

    // Content List
    const [nextContentId, setNextContentId] = useState(null);
    const [prevContentId, setPrevContentId] = useState(null);
    const getTrainingContent = (id) => {
        axiosInstance.get(`/trainings/getEmployeeTrainingContent/${code}`, { headers })
            .then((response) => {
                const contList = response.data.content;
                setContentList(contList || []);

                const cIndex = contList.findIndex(item => item.id == id);
                setNextContentId(cIndex < contList.length - 1 ? contList[cIndex + 1].id : null);
                setPrevContentId(cIndex > 0 ? contList[cIndex - 1].id : null);
            })
            .catch((error) => {
                console.error('Error fetching training content:', error);
            });
    }

    const [contentListOn, setContentListOn] = useState(true);
    const toggleContentList = () => {
        setContentListOn((prev) => !prev);
    };

    // Content Selection
    const handleContentChange = (id, unlocked, quickNav = false) => {
        if (unlocked) {
            setContentId(id);
            getContentDetails(id);

            sessionStorage.setItem('contentId', id);

            const cIndex = contentList.findIndex(item => item.id === id);
            setNextContentId(cIndex < contentList.length - 1 ? contentList[cIndex + 1].id : null);
            setPrevContentId(cIndex > 0 ? contentList[cIndex - 1].id : null);

        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Content Locked!",
                text: `Finish ${quickNav ? "the current" : "previous"} content to unlock`,
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
                return file.url;
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
    const [furthestPoint, setFurthestPoint] = useState(0);
    const renderVideo = (source) => {
        const youtubeMatch = source.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);

        // Video Clear
        let hasTriggered = content.is_finished;

        const onVideoClear = () => {
            if (!hasTriggered) {
                handleTrainingViews(content.id, true);
                hasTriggered = true;
            }
        };

        // Progress Tracker
        const updateFurthestPoint = (currentTime) => {
            if (currentTime > furthestPoint) {
                setFurthestPoint(currentTime);
            }
        };

        // YouTube Video
        if (youtubeMatch && youtubeMatch[1]) {
            const videoId = youtubeMatch[1];
            return (
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`}
                    title={content.title || "Youtube Video Player"}
                    style={{ border: '0' }}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    onLoad={(e) => {
                        const iframe = e.target;
                        const player = new window.YT.Player(iframe, {
                            events: {
                                onReady: (event) => {
                                    const duration = event.target.getDuration();
                                    let intervalId = null;

                                    // Seeking Restrictions for unfinished videos
                                    const restrictSeeking = () => {
                                        const currentTime = event.target.getCurrentTime();
                                        if (!content.is_finished && currentTime > furthestPoint) {
                                            event.target.seekTo(furthestPoint, true);
                                        }
                                        updateFurthestPoint(currentTime);
                                    };

                                    event.target.addEventListener('onStateChange', (state) => {
                                        if (state.data === window.YT.PlayerState.PLAYING) {
                                            if (intervalId) clearInterval(intervalId);
                                            intervalId = setInterval(() => {
                                                const currentTime = event.target.getCurrentTime();
                                                updateFurthestPoint(currentTime);
                                                if (currentTime >= duration - 5) {
                                                    onVideoClear();
                                                }
                                            }, 1000);
                                        } else if (state.data === window.YT.PlayerState.PAUSED || state.data === window.YT.PlayerState.ENDED) {
                                            if (intervalId) clearInterval(intervalId);
                                        }
                                    });
                                },
                                onError: (event) => { // Video Removed, Privated, Restricted, etc.
                                    // Automatically Clear (TEMPORARY FIX, Implement Alternative Actions Later)
                                    onVideoClear();
                                }
                            },
                        });
                    }}
                ></iframe>
            );
        }

        // Direct URLs
        const isDirectURL = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/.test(source.toLowerCase());
        if (isDirectURL) {
            return (
                <video
                    width="100%"
                    height="100%"
                    controls
                    onTimeUpdate={(e) => {
                        const video = e.target;
                        const currentTime = video.currentTime;
                        const duration = video.duration;
                        updateFurthestPoint(currentTime);
                        if (duration - currentTime <= 5 && !hasTriggered) {
                            onVideoClear();
                        }
                    }}
                    // Seeking Restrictions for unfinished videos
                    onSeeking={(e) => {
                        const video = e.target;
                        const currentTime = video.currentTime;
                        if (!content.is_finished && currentTime > furthestPoint) {
                            video.currentTime = furthestPoint;
                        }
                    }}
                >
                    <source src={source} type={`video/${source.split('.').pop().toLowerCase()}`} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        return null;
    };

    // Document File Size
    const getFileSize = (bytes) => {
        if (!bytes) return "Size not available";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
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
                getTrainingContent(id);
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    }

    // Form Functions
    const [formItems, setFormItems] = useState([]);
    const [attemptData, setAttemptData] = useState(null);

    const getFormDetails = (id) => {
        setIsLoading(true);
        axiosInstance.get(`/trainings/getEmployeeFormDetails/${id}`, { headers })
            .then((response) => {
                setFormItems(response.data.items);
                setAttemptData(response.data.attempt_data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching form details:', error);
                setIsLoading(false);
            });
    }

    return (
        <Layout title={"ContentView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "95%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography
                            variant={capSize}
                            sx={{
                                fontWeight: "bold",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                lineHeight: 1.5,
                                paddingRight: { xs: 0, md: 2 },
                            }}
                        >
                            {title || "Training"}
                        </Typography>
                        <Link to={`/employee/training/${code}`}>
                            {medScreen ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                >
                                    <p className="m-0">
                                        Return to Training
                                    </p>
                                </Button>
                            ) : (
                                <Tooltip title="Return to Training">
                                    <IconButton sx={{ p: 1, borderRadius: "4px", bgcolor: "#177604" }}>
                                        <KeyboardReturn sx={{ color: "white" }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Link>
                    </Box>

                    <Box display="flex" sx={{ mt: 6, mb: 5, bgcolor: "white", borderRadius: "8px", maxHeight: "1000px", overflow: "hidden" }} >
                        <>
                            {/* Content List */}
                            {(contentListOn && medScreen) && (
                                <Box
                                    sx={{
                                        width: '20%',
                                        borderRight: '1px solid #e0e0e0',
                                        bgcolor: '#fafafa',
                                        transition: 'width 0.3s ease',
                                    }}
                                >
                                    <Box sx={{ width: "100%", p: 3, pb: 1, mb: 1, bgcolor: "#f5f5f5", borderBottom: "solid 1px #e0e0e0", }}>
                                        <Typography sx={{ fontWeight: 600, color: '#177604' }}>
                                            Content List
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            maxHeight: 'calc(100% - 32px)',
                                            overflowY: 'auto',
                                            pr: 2,
                                            pl: 1,
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#e9ae20 #fafafa',
                                            '&::-webkit-scrollbar': { width: '6px' },
                                            '&::-webkit-scrollbar-thumb': { backgroundColor: '#e9ae20', borderRadius: '3px' },
                                            '&::-webkit-scrollbar-track': { backgroundColor: '#fafafa' },
                                        }}
                                    >
                                        {contentList.length > 0 ? (
                                            contentList.map((cont) => {
                                                const locked = sequential && contentList.find((item) => item.order === cont.order - 1)?.is_finished === false;
                                                return (
                                                    <Box
                                                        key={cont.id}
                                                        sx={{ position: 'relative', mb: 1 }}
                                                        onClick={() => handleContentChange(cont.id, !locked)}
                                                    >
                                                        <Box
                                                            display="flex"
                                                            sx={{
                                                                py: 1,
                                                                px: 1.5,
                                                                borderRadius: '6px',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                cursor: locked ? 'not-allowed' : 'pointer',
                                                                transition: 'background-color 0.2s ease',
                                                                ...(cont.id == contentId
                                                                    ? { background: 'linear-gradient(135deg, #177604 0%, #e9ae20 100%)', color: 'white' }
                                                                    : {
                                                                        '&:hover': !locked && {
                                                                            backgroundColor: '#f0f0f0',
                                                                        },
                                                                        opacity: locked ? 0.5 : 1,
                                                                    }),
                                                            }}
                                                        >
                                                            <Box display="flex" sx={{ alignItems: 'center', maxWidth: "90%" }}>
                                                                {cont.content.type === 'Video' && (
                                                                    <OndemandVideo sx={{ fontSize: 18, color: cont.id == contentId ? 'white' : '#757575' }} />
                                                                )}
                                                                {cont.content.type === 'Image' && (
                                                                    <Image sx={{ fontSize: 18, color: cont.id == contentId ? 'white' : '#757575' }} />
                                                                )}
                                                                {(cont.content.type === 'Document' || cont.content.type == 'PowerPoint') && (
                                                                    <Description sx={{ fontSize: 18, color: cont.id == contentId ? 'white' : '#757575' }} />
                                                                )}
                                                                {!cont.content.type && (
                                                                    <Quiz sx={{ fontSize: 18, color: cont.id == contentId ? 'white' : '#757575' }} />
                                                                )}
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        ml: 1,
                                                                        color: cont.id == contentId ? 'white' : 'text.primary',
                                                                        fontWeight: cont.id == contentId ? 600 : 400,
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                    }}
                                                                >
                                                                    {cont.title}
                                                                </Typography>
                                                            </Box>
                                                            <Box display="flex" sx={{ alignItems: 'center', width: "5%" }}>
                                                                {cont.is_finished ? (
                                                                    <CheckBox sx={{ fontSize: 18, color: cont.id == contentId ? 'white' : '#177604' }} />
                                                                ) : cont.has_viewed ? (
                                                                    <HourglassBottom sx={{ fontSize: 18, color: cont.id == contentId ? 'white' : '#f57c00' }} />
                                                                ) : null}
                                                            </Box>
                                                        </Box>
                                                        {locked && (
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    borderRadius: '6px',
                                                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                                    zIndex: 1,
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                );
                                            })
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                                                No content available
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            {/* Content Display */}
                            <Box sx={{ width: (contentListOn && medScreen) ? '80%' : '100%', mt: 2, mb: 2, p: { xs: 2, md: 3 }, position: 'relative', }} >
                                {/* Content List Toggle */}
                                {medScreen && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            backgroundColor: '#177604',
                                            height: 40,
                                            borderRadius: contentListOn ? { borderTopRightRadius: '8px', borderBottomRightRadius: '8px' } : '8px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            ml: contentListOn ? 0 : 1,
                                        }}
                                    >
                                        <Tooltip title={contentListOn ? 'Hide Content List' : 'Show Content List'}>
                                            <IconButton onClick={toggleContentList} sx={{ color: 'white' }} >
                                                {contentListOn ? <ArrowBackIos /> : <ArrowForwardIos />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                {/* Content Details */}
                                {isLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <Box sx={{ minHeight: "450px" }}>
                                        <Grid container spacing={2} sx={{ mt: { xs: 0, md: 3 }, px: contentListOn ? 0 : 2 }}>
                                            {/* Title */}
                                            <Grid size={12}>
                                                <Typography
                                                    variant={capSize}
                                                    sx={{
                                                        fontWeight: "bold",
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                        overflowWrap: "break-word",
                                                        lineHeight: 1.5,
                                                        mb: 1,
                                                    }}
                                                >
                                                    {content.title || "-"}
                                                </Typography>
                                            </Grid>
                                            {(content.content.type == "Form") ? (
                                                <>
                                                    <FormViews
                                                        content={content}
                                                        updateProgress={handleTrainingViews}
                                                        formItems={formItems}
                                                        attemptData={attemptData}
                                                        handleFormFinished={handleTrainingViews}
                                                        contentReload={getContentDetails}
                                                    />
                                                </>
                                            ) :
                                                <>
                                                    {/* Primary Content */}
                                                    <Grid size={12} sx={{ placeContent: "center", placeItems: "center" }}>
                                                        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                            {content.content.type === "Video" ? (
                                                                <Box
                                                                    sx={{
                                                                        maxWidth: medScreen ? '720px' : '100%',
                                                                        width: medScreen ? "90%" : '100%',
                                                                        aspectRatio: "16 / 9",
                                                                        placeSelf: "center",
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    {renderVideo(content.content.source)}
                                                                </Box>
                                                            ) : content.content.type === "Image" ? (
                                                                <CardMedia
                                                                    component="img"
                                                                    sx={{
                                                                        maxWidth: medScreen ? '640px' : '100%',
                                                                        width: medScreen ? "80%" : '100%',
                                                                        aspectRatio: !["Document", "PowerPoint"].includes(content.content.type) ? "16 / 9" : "4 / 3",
                                                                        objectFit: "contain",
                                                                        borderRadius: "4px",
                                                                        backgroundColor: "transparent",
                                                                        placeSelf: "center",
                                                                        mb: 1,
                                                                    }}
                                                                    image={renderImage(content.content.source, content.content.type)}
                                                                    title={content.title || "Content Item"}
                                                                    alt={content.title || "Content Item"}
                                                                />
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        maxWidth: '640px',
                                                                        width: "80%",
                                                                        placeSelf: "center",
                                                                        mb: 1,
                                                                    }}
                                                                    onClick={() => {
                                                                        window.open(file.url, "_blank");
                                                                        handleTrainingViews(content.id, true);
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            p: 2,
                                                                            borderRadius: "12px",
                                                                            bgcolor: "#fff",
                                                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                                            "&:hover": {
                                                                                transform: 'scale(1.02)',
                                                                                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CardMedia
                                                                            component="img"
                                                                            sx={{
                                                                                width: "30%",
                                                                                maxWidth: "200px",
                                                                                aspectRatio: "4 / 3",
                                                                                objectFit: "contain",
                                                                                borderRadius: "4px",
                                                                                backgroundColor: "transparent",
                                                                                mr: 2,
                                                                            }}
                                                                            image={renderImage(content.content.source, content.content.type)}
                                                                            title={content.title || "Content Item"}
                                                                            alt={content.title || "Content Item"}
                                                                        />
                                                                        <Stack sx={{ flex: 1 }}>
                                                                            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                                                                {file.name}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
                                                                                {getFileSize(content.file_size)}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                                                Click to Open Document
                                                                            </Typography>
                                                                        </Stack>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                            {medScreen && (
                                                                <>
                                                                    {prevContentId && (
                                                                        <Tooltip title="View Previous Content">
                                                                            <Box
                                                                                onClick={() => handleContentChange(prevContentId, true)}
                                                                                sx={{
                                                                                    position: "absolute",
                                                                                    height: ["Document", "PowerPoint"].includes(content.content.type) ? "40%" : "20%",
                                                                                    top: ["Document", "PowerPoint"].includes(content.content.type) ? "30%" : "40%",
                                                                                    left: 0,
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",
                                                                                    py: 1,
                                                                                    pl: 1.5,
                                                                                    backgroundColor: "#fff",
                                                                                    border: "1px solid rgba(0, 0, 0, 0.1)",
                                                                                    borderRadius: "8px",
                                                                                    cursor: "pointer",
                                                                                    opacity: medScreen ? 0.5 : 1,
                                                                                    transition: "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease, color 0.3s ease, opacity 0.3s ease",
                                                                                    color: "#e0e0e0",
                                                                                    "&:hover": {
                                                                                        color: "#fff",
                                                                                        backgroundColor: "#177604",
                                                                                        transform: "scale(1.05)",
                                                                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                                                        opacity: 1,
                                                                                    },
                                                                                }}
                                                                            >
                                                                                <ArrowBackIos sx={{ fontSize: "2rem" }} />
                                                                            </Box>
                                                                        </Tooltip>
                                                                    )}
                                                                    {nextContentId && (
                                                                        <Tooltip title="View Next Content">
                                                                            <Box
                                                                                onClick={() => handleContentChange(nextContentId, content.is_finished, true)}
                                                                                sx={{
                                                                                    position: "absolute",
                                                                                    height: ["Document", "PowerPoint"].includes(content.content.type) ? "40%" : "20%",
                                                                                    top: ["Document", "PowerPoint"].includes(content.content.type) ? "30%" : "40%",
                                                                                    right: 0,
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",
                                                                                    p: 1,
                                                                                    backgroundColor: "#fff",
                                                                                    border: "1px solid rgba(0, 0, 0, 0.1)",
                                                                                    borderRadius: "8px",
                                                                                    cursor: "pointer",
                                                                                    opacity: medScreen ? 0.5 : 1,
                                                                                    transition: "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease, color 0.3s ease, opacity 0.3s ease",
                                                                                    color: "#e0e0e0",
                                                                                    "&:hover": {
                                                                                        color: "#fff",
                                                                                        backgroundColor: content.is_finished ? "#177604" : "#e0e0e0",
                                                                                        transform: "scale(1.05)",
                                                                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                                                        opacity: 1,
                                                                                    },
                                                                                }}
                                                                            >
                                                                                {content.is_finished ? (
                                                                                    <ArrowForwardIos sx={{ fontSize: "2rem" }} />
                                                                                ) : (
                                                                                    <Lock sx={{ fontSize: "2rem" }} />
                                                                                )}
                                                                            </Box>
                                                                        </Tooltip>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={12}>
                                                        <Divider />
                                                    </Grid>
                                                    {/* Description */}
                                                    <Grid size={12} >
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
                                                            dangerouslySetInnerHTML={{ __html: content.description }}
                                                        />
                                                    </Grid>
                                                    {!medScreen && (
                                                        <Grid size={12}>
                                                            <Box display="flex" sx={{ width: "100%", justifyContent: prevContentId ? "space-between" : "flex-end", alignItems: "center" }}>
                                                                {prevContentId && (
                                                                    <Box
                                                                        onClick={() => handleContentChange(prevContentId, true)}
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            py: 1,
                                                                            pl: 1.5,
                                                                            backgroundColor: "#fff",
                                                                            border: "1px solid rgba(0, 0, 0, 0.1)",
                                                                            borderRadius: "8px",
                                                                            cursor: "pointer",
                                                                            transition: "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease, color 0.3s ease",
                                                                            color: "#e0e0e0",
                                                                            "&:hover": {
                                                                                color: "#fff",
                                                                                backgroundColor: "#177604",
                                                                                transform: "scale(1.05)",
                                                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <ArrowBackIos sx={{ fontSize: "1rem" }} />
                                                                    </Box>
                                                                )}
                                                                {nextContentId && (
                                                                    <Box
                                                                        onClick={() => handleContentChange(nextContentId, content.is_finished, true)}
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            p: 1,
                                                                            backgroundColor: "#fff",
                                                                            border: "1px solid rgba(0, 0, 0, 0.1)",
                                                                            borderRadius: "8px",
                                                                            cursor: "pointer",
                                                                            transition: "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease, color 0.3s ease",
                                                                            color: "#e0e0e0",
                                                                            "&:hover": {
                                                                                color: "#fff",
                                                                                backgroundColor: content.is_finished ? "#177604" : "#e0e0e0",
                                                                                transform: "scale(1.05)",
                                                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        {content.is_finished ? (
                                                                            <ArrowForwardIos sx={{ fontSize: "1rem" }} />
                                                                        ) : (
                                                                            <Lock sx={{ fontSize: "1rem" }} />
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                </>
                                            }
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </>
                    </Box>
                </Box>
            </Box>
        </Layout >
    );
};

export default ContentView;
