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
    Menu,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";
import { Cancel, ExpandMore, ExpandLess, MoreVert } from "@mui/icons-material";
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
import FormItemAdd from "./FormItemAdd";
import FormItemSettings from "./FormItemSettings";
import FormItemEdit from "./FormItemEdit";
import { PieChart } from "@mui/x-charts";
import InfoBox from "../../../../components/General/InfoBox";
import ContentProgressView from "./ContentProgressView";
import FormAnalytics from "./FormAnalytics";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ContentView = ({ open, close, contentId, status }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [content, setContent] = useState(null)
    const [exitReload, setExitReload] = useState(false);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // CONTENT FUNCTIONS --------------------------------------- /
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
                return file;
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

    useEffect(() => {
        return () => {
            if (file && file.startsWith('blob:')) {
                URL.revokeObjectURL(file);
            }
        };
    }, [file]);

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
                    ["Image", "Document", "PowerPoint"].includes(resContent?.content?.type) &&
                    resContent?.file
                ) {
                    if (file && file.startsWith('blob:')) {
                        URL.revokeObjectURL(file);
                    }
                    const byteCharacters = atob(resContent.file);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: resContent.file_mime });

                    setFile(URL.createObjectURL(blob));
                } else {
                    setFile(null);
                }
                if (resContent?.content?.type === 'Form') {
                    getFormItems(resContent.training_form_id);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching content details', error);
                setIsLoading(false);
            });
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

    // FORM ITEM FUNCTIONS ------------------------------------- /
    const [formItems, setFormItems] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const getFormItems = (formId) => {
        axiosInstance.get(`/trainings/getFormItems/${formId}`, { headers })
            .then((response) => {
                setFormItems(response.data.items);
            })
            .catch((error) => {
                console.error('Error fetching form items', error);
            });
    }

    // Add Form Item
    const [openFormItemAddModal, setOpenFormItemAddModal] = useState(false);
    const handleOpenFormItemAddModal = () => {
        setOpenFormItemAddModal(true);
    };
    const handleCloseFormItemAddModal = (reload) => {
        setOpenFormItemAddModal(false);
        if (reload) {
            setExitReload(true);
            getContentDetails();
        }
    };

    // Form Item Settings
    const [openFormItemSettingsModal, setOpenFormItemSettingsModal] = useState(false);
    const handleOpenFormItemSettingsModal = () => {
        setOpenFormItemSettingsModal(true);
    };
    const handleCloseFormItemSettingsModal = (reload) => {
        setOpenFormItemSettingsModal(false);
        if (reload) {
            setExitReload(true);
            getFormItems(content.training_form_id);
        }
    };

    // Item Menu
    const [itemMenuStates, setItemMenuStates] = useState({});
    const handleItemMenuOpen = (event, id) => {
        setItemMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: true,
                anchorEl: event.currentTarget,
            },
        }));
    };

    const handleItemMenuClose = (id) => {
        setItemMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: false,
                anchorEl: null,
            },
        }));
    };

    // Edit Form Item
    const [openFormItemEditModal, setOpenFormItemEditModal] = useState(false);
    const [loadItem, setLoadItem] = useState(null);
    const handleOpenFormItemEditModal = (item) => {
        setLoadItem(item);
        setOpenFormItemEditModal(true);
        handleItemMenuClose(item.id);
    }
    const handleCloseFormItemEditModal = (reload) => {
        setLoadItem(false);
        setOpenFormItemEditModal(false);
        if (reload) {
            getContentDetails();
        }
    }

    // Remove Form Item
    const handleDeleteItem = (id) => {
        handleItemMenuClose(id);
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Remove Item?",
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
                    id: id
                };
                axiosInstance
                    .post(`trainings/removeFormItem`, data, {
                        headers,
                    })
                    .then((response) => {
                        document.activeElement.blur();
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Success!",
                            text: `Form item successfully removed`,
                            icon: "success",
                            showConfirmButton: true,
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        }).then((res) => {
                            if (res.isConfirmed) {
                                getFormItems(content.training_form_id);
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error removing item:", error);
                    });
            }
        });
    }

    // CONTENT PROGRESSION ------------------------------------- /
    // Progress Viewer
    const [openProgressViewModal, setOpenProgressViewModal] = useState(false);
    const handleOpenProgressViewModal = () => {
        setOpenProgressViewModal(true);
    }
    const handleCloseProgressViewModal = () => {
        setOpenProgressViewModal(false);
    }

    // Form Analytics
    const [openFormAnalyticsModal, setOpenFormAnalyticsModal] = useState(false)
    const handleOpenFormAnalyticsModal = () => {
        setOpenFormAnalyticsModal(true);
    }
    const handleCloseFormAnalyticsModal = () => {
        setOpenFormAnalyticsModal(false);
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "800px" }, maxWidth: '900px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> {content?.title ?? "Content"} </Typography>
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
                                {content.content.type !== "Form" && (
                                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                        {content.content.type === "Video" ? (
                                            <Box
                                                sx={{
                                                    mb: 2,
                                                    width: "100%",
                                                    maxWidth: "600px",
                                                    aspectRatio: "16 / 9",
                                                    borderRadius: "8px",
                                                    overflow: "hidden",
                                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                    "&:hover": {
                                                        transform: "scale(1.02)",
                                                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                                                    },
                                                }}
                                            >
                                                {renderVideo(content.content.source)}
                                            </Box>
                                        ) : (
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    mb: 2,
                                                    width: "100%",
                                                    maxWidth: ["Document", "PowerPoint"].includes(content.content.type) ? "200px" : "600px", // Smaller for documents, larger for images
                                                    aspectRatio: ["Document", "PowerPoint"].includes(content.content.type) ? "4 / 3" : "16 / 9",
                                                    objectFit: "contain",
                                                    borderRadius: "8px",
                                                    backgroundColor: "transparent",
                                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                    "&:hover": {
                                                        transform: "scale(1.02)",
                                                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                                                        backgroundColor: ["Document", "PowerPoint"].includes(content.content.type) ? "#e0e0e0" : "transparent",
                                                    },
                                                }}
                                                image={renderImage(content.content.source, content.content.type)}
                                                title={content.title || "Content Item"}
                                                alt={content.title || "Content Item"}
                                                onClick={
                                                    ["Document", "PowerPoint"].includes(content.content.type)
                                                        ? () => window.open(file, "_blank")
                                                        : undefined
                                                }
                                            />
                                        )}
                                        {["Document", "PowerPoint"].includes(content.content.type) && (
                                            <Typography variant="caption" sx={{ mt: 1, color: "text.secondary", fontStyle: "italic" }}>
                                                Click to open file
                                            </Typography>
                                        )}
                                    </Grid>
                                )}
                                {/* Content Information */}
                                <Grid container item spacing={2} xs={12}>
                                    {/* Header and Options */}
                                    <Grid item xs={12}>
                                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                Content Details
                                            </Typography>
                                            <IconButton
                                                id="basic-button"
                                                size="small"
                                                aria-controls={menuOpen ? 'basic-menu' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={menuOpen ? 'true' : undefined}
                                                onClick={handleMenuClick}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                            <Menu
                                                id="basic-menu"
                                                anchorEl={anchorEl}
                                                open={menuOpen}
                                                onClose={handleMenuClose}
                                                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                                            >
                                                {status === 'Pending' && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenContentEditModal();
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        Edit
                                                    </MenuItem>
                                                )}
                                                {status === 'Pending' && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleRemoveContent();
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        Remove
                                                    </MenuItem>
                                                )}
                                                {status !== 'Pending' && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenProgressViewModal();
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        View Employee Progress
                                                    </MenuItem>
                                                )}
                                                {status === 'Pending' && content.content.type === 'Form' && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenFormItemAddModal();
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        Add Item
                                                    </MenuItem>
                                                )}
                                                {status === 'Pending' && content.content.type === 'Form' && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenFormItemSettingsModal();
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        Item Settings
                                                    </MenuItem>
                                                )}
                                                {status !== 'Pending' && content.content.type === 'Form' && (
                                                    <MenuItem
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenFormAnalyticsModal();
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        View Form Analytics
                                                    </MenuItem>
                                                )}
                                            </Menu>
                                        </Stack>
                                        <Divider />
                                    </Grid>
                                    {/* Additional Form Information */}
                                    {content.content.type === 'Form' && (
                                        <Grid container item xs={12} spacing={2}>
                                            <Grid item xs={4}>
                                                <InfoBox
                                                    title={content.content.require_pass ? 'Availability' : 'Attempt Limit'}
                                                    info={content.content.require_pass ? 'Until Passed' : content.content.attempts_allowed ?? 'N/A'}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <InfoBox
                                                    title="Passing Score"
                                                    info={`${content.content.passing_score ?? 'N/A'} %`}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <InfoBox
                                                    title="Duration Per Attempt"
                                                    info={`${content.duration ?? 'N/A'} min`}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <InfoBox
                                                    title="Item Count"
                                                    info={content.item_count}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <InfoBox
                                                    title="Total Points"
                                                    info={`${content.total_points} pts`}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Divider />
                                            </Grid>
                                        </Grid>
                                    )}
                                    {/* Progress Viewer */}
                                    {status !== 'Pending' && (
                                        <Grid container item xs={12} spacing={2}>
                                            <Grid item xs={7}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                                                    Progress Statistics
                                                </Typography>
                                                <PieChart
                                                    series={[
                                                        {
                                                            data: [
                                                                { id: 0, value: content.no_view_count ?? 0, label: 'Not Yet Viewed', color: '#545457' },
                                                                { id: 1, value: content.view_count ?? 0, label: 'Viewed', color: '#f57c00' },
                                                                { id: 2, value: content.finished_count ?? 0, label: 'Completed', color: '#177604' },
                                                            ],
                                                            innerRadius: 30,
                                                            outerRadius: 100,
                                                            startAngle: 0,
                                                            endAngle: -360,
                                                        },
                                                    ]}
                                                    height={200}
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                                                    Employee Progress (Recent)
                                                </Typography>
                                                <Box sx={{ width: '100%', height: 200, border: 'solid 1px #e0e0e0', overflow: 'auto' }}>
                                                    {content.latest_views && content.latest_views.length > 0 ? (
                                                        <Table stickyHeader size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell sx={{ width: '75%', fontWeight: 'bold' }}>
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                            Name
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                            Status
                                                                        </Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {content.latest_views.map((view, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell sx={{ width: '75%' }}>
                                                                            {`${view.user_first_name} ${view.user_last_name}`}
                                                                        </TableCell>
                                                                        <TableCell sx={{ width: '25%' }}>{view.status}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: '200px' }}
                                                        >
                                                            No views available
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Divider />
                                            </Grid>
                                        </Grid>
                                    )}
                                    {/* Description */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
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
                                </Grid>
                                {/* Form Items */}
                                {content.content.type == "Form" && (
                                    <Grid container item xs={12} spacing={2}>
                                        <Grid item xs={12} sx={{ my: 0 }} >
                                            <Divider />
                                        </Grid>
                                        <Grid item xs={12}>
                                            {formItems.length == 0 ? (
                                                <Typography sx={{ pb: 1, placeSelf: "center", color: "text.secondary" }}>
                                                    No Items Found
                                                </Typography>
                                            ) : (
                                                <Typography>
                                                    Items
                                                </Typography>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            {formItems.length > 0 ? (
                                                formItems.map((item, index) => {

                                                    if (!itemMenuStates[item.id]) {
                                                        itemMenuStates[item.id] = { open: false, anchorEl: null, };
                                                    }

                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                mb: 1,
                                                                p: "8px 12px",
                                                                border: "1px solid #e0e0e0",
                                                                borderRadius: "8px",
                                                                backgroundColor: expanded.includes(index) ? "#f5f7fa" : "white",
                                                                transition: "background-color 0.3s ease",
                                                                boxShadow: expanded.includes(index) ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
                                                            }}
                                                        >
                                                            {/* Primary Content */}
                                                            <Box display="flex" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                                {/* Type and Description */}
                                                                <Box display="flex" alignItems="center" sx={{ width: "56%" }}>
                                                                    {/* Item Type */}
                                                                    <Box
                                                                        sx={{
                                                                            mr: 1,
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            width: "20%",
                                                                            borderRadius: "4px",
                                                                            backgroundColor:
                                                                                item.type === "Choice"
                                                                                    ? "#e3f2fd"
                                                                                    : item.type === "MultiSelect"
                                                                                        ? "#fff3e0"
                                                                                        : item.type === "FillInTheBlank"
                                                                                            ? "#e8f5e9"
                                                                                            : "#ffebee",
                                                                            color:
                                                                                item.type === "Choice"
                                                                                    ? "#1976d2"
                                                                                    : item.type === "MultiSelect"
                                                                                        ? "#f57c00"
                                                                                        : item.type === "FillInTheBlank"
                                                                                            ? "#2e7d32"
                                                                                            : "#d32f2f",
                                                                            fontSize: "0.75rem",
                                                                            fontWeight: "bold",
                                                                            textTransform: "uppercase",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {item.type === "Choice"
                                                                            ? "Choice"
                                                                            : item.type === "MultiSelect"
                                                                                ? "Selection"
                                                                                : item.type === "FillInTheBlank"
                                                                                    ? "Fill"
                                                                                    : "Unknown"}
                                                                    </Box>

                                                                    {/* Short Description */}
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            flex: 1,
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            whiteSpace: "nowrap",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            lineHeight: 1,
                                                                            "& *": { margin: 0, padding: 0 },
                                                                        }}
                                                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                                                    />
                                                                </Box>
                                                                {/* Interactions */}
                                                                <Box display="flex" sx={{ width: "19%", justifyContent: "flex-end", alignItems: "center" }}>
                                                                    {/* Points */}
                                                                    <Box
                                                                        sx={{
                                                                            width: "50%",
                                                                            mr: 1,
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: "12px",
                                                                            backgroundColor: "#e8f5e9",
                                                                            color: "#2e7d32",
                                                                            fontSize: "0.875rem",
                                                                            fontWeight: "bold",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {`${item.value} pt${item.value > 1 ? "s" : ""}`}
                                                                    </Box>

                                                                    {/* Dropdown Button */}
                                                                    {status === "Pending" && (
                                                                        <>
                                                                            <IconButton
                                                                                size="small"
                                                                                aria-controls={itemMenuStates[item.id]?.open ? `item-menu-${index}` : undefined}
                                                                                aria-haspopup="true"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleItemMenuOpen(event, item.id);
                                                                                }}
                                                                                sx={{ ml: 0.5 }}
                                                                            >
                                                                                <MoreVert sx={{ color: "text.secondary", fontSize: "1.25rem" }} />
                                                                            </IconButton>
                                                                            <Menu
                                                                                id={`item-menu-${index}`}
                                                                                anchorEl={itemMenuStates[item.id]?.anchorEl}
                                                                                open={itemMenuStates[item.id]?.open || false}
                                                                                onClose={(event) => {
                                                                                    handleItemMenuClose(item.id);
                                                                                }}
                                                                                MenuListProps={{
                                                                                    "aria-labelledby": `item-button-${index}`,
                                                                                }}
                                                                            >
                                                                                <MenuItem onClick={() => handleOpenFormItemEditModal(item)}>Edit</MenuItem>
                                                                                <MenuItem onClick={() => handleDeleteItem(item.id)}>Delete</MenuItem>
                                                                            </Menu>
                                                                        </>
                                                                    )}

                                                                    {/* Expand/Collapse Button */}
                                                                    <IconButton
                                                                        title={expanded.includes(index) ? "Collapse Content" : "Expand Content"}
                                                                        onClick={() => {
                                                                            if (expanded.includes(index)) {
                                                                                setExpanded(expanded.filter((i) => i !== index));
                                                                            } else {
                                                                                setExpanded([...expanded, index]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {expanded.includes(index) ? (
                                                                            <ExpandLess sx={{ color: "text.secondary", fontSize: "1.25rem" }} />
                                                                        ) : (
                                                                            <ExpandMore sx={{ color: "text.secondary", fontSize: "1.25rem" }} />
                                                                        )}
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>

                                                            {/* Expanded Content */}
                                                            {expanded.includes(index) && (
                                                                <Box sx={{ mt: 1, p: 1, borderTop: "1px solid #e0e0e0" }}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            mb: 2,
                                                                            whiteSpace: "pre-wrap",
                                                                            "& *": { margin: 0, padding: 0 },
                                                                        }}
                                                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                                                    />
                                                                    {item.choices.length > 0 && (
                                                                        <>
                                                                            <Typography variant="caption" sx={{ mb: 1 }}>
                                                                                {item.type == "FillInTheBlank" ? "Answer" : "Choices"}
                                                                            </Typography>
                                                                            {item.choices.map((choice, index) => (
                                                                                <Box
                                                                                    key={index}
                                                                                    sx={{
                                                                                        mt: 1,
                                                                                        p: 1,
                                                                                        width: "100%",
                                                                                        border: item.type != "FillInTheBlank" && choice.is_correct ? "1px solid #42a5f5" : "1px solid #e0e0e0",
                                                                                        borderRadius: "4px",
                                                                                    }}
                                                                                >
                                                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                                        {choice.description}
                                                                                    </Typography>
                                                                                </Box>
                                                                            ))}
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    );
                                                })
                                            ) : null}
                                        </Grid>
                                    </Grid>
                                )}
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
                {openFormItemAddModal && (
                    <FormItemAdd
                        open={openFormItemAddModal}
                        close={handleCloseFormItemAddModal}
                        formId={content.training_form_id}
                    />
                )}
                {openFormItemSettingsModal && (
                    <FormItemSettings
                        open={openFormItemSettingsModal}
                        close={handleCloseFormItemSettingsModal}
                        formId={content.training_form_id}
                        formItems={formItems}
                    />
                )}
                {openFormItemEditModal && (
                    <FormItemEdit
                        open={openFormItemEditModal}
                        close={handleCloseFormItemEditModal}
                        itemInfo={loadItem}
                    />
                )}
                {openProgressViewModal && (
                    <ContentProgressView
                        open={openProgressViewModal}
                        close={handleCloseProgressViewModal}
                        contentId={content.id}
                    />
                )}
                {openFormAnalyticsModal && (
                    <FormAnalytics
                        open={openFormAnalyticsModal}
                        close={handleCloseFormAnalyticsModal}
                        formData={content}
                    />
                )}
            </Dialog>
        </>
    );
};

export default ContentView;
