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
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload, MoreVert } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

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

const AnnouncementManage = ({ open, close, announceInfo }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [imagePath, setImagePath] = useState("");
    const [imageLoading, setImageLoading] = useState(true);

    // ----------- AnnouncementDetails
    useEffect(() => {
        axiosInstance.get(`/announcements/getThumbnail/${announceInfo.id}`, { headers })
            .then((response) => {
                if (response.data.thumbnail) {
                    const byteCharacters = window.atob(response.data.thumbnail);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/png' });

                    setImagePath(URL.createObjectURL(blob));
                    console.log(announceInfo);
                } else {
                    setImagePath("../../../../images/ManProTab.png");
                }
                setImageLoading(false);

            })
            .catch((error) => {
                console.error('Error fetching thumbnail:', error);
                setImagePath("../../../../images/ManProTab.png");
                setImageLoading(false);
            });
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
            fetchAnnouncements();
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
            fetchAnnouncements();
        }
    }


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
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>
                            {" "}Announcement Details{" "}
                        </Typography>
                        <IconButton onClick={() => close(false)}>
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
                                        alt={`${announceInfo.title} thumbnail`}
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
                                                {announceInfo.title}
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
                                                <MenuItem onClick={() => handleOpenAnnouncementEdit(announceInfo)}>Edit</MenuItem>
                                                <MenuItem onClick={() => handleOpenAnnouncementPublish(announceInfo)}>Publish</MenuItem>
                                                <MenuItem onClick={handleMenuClose}>Open in New Page</MenuItem>
                                                <MenuItem onClick={handleMenuClose}>View Acknowledgements</MenuItem>
                                                <MenuItem onClick={handleMenuClose}>Close Menu</MenuItem>
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
                                                    announceInfo.status == "Pending"
                                                        ? "#e9ae20"
                                                        : announceInfo.status == "Published"
                                                            ? "#177604"
                                                            : "#f57c00"
                                            }}
                                        >
                                            {announceInfo.status.toUpperCase()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Publishment Details*/}
                                    {announceInfo.status != "Pending" ? (
                                        <Grid item container xs={12} spacing={1}>
                                            <Grid item xs={12} align="left">
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    Publishment Details
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={5} align="left">
                                                Branches
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    MNL, DVO
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={5} align="left">
                                                Departments
                                            </Grid>
                                            <Grid item xs={7} align="left">
                                                <Typography sx={{ fontWeight: "bold", }}>
                                                    HR, FN, PR
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={5} align="left">
                                                Acknowledged
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
                                    ) : null}
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ my: 0 }} >
                                <Divider />
                            </Grid>
                            {/* Description*/}
                            <Grid item xs={2}>
                                Description
                            </Grid>
                            <Grid item xs={10} sx={{ maxHeight: 200, overflowY: 'auto' }}>
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
                            <Grid item xs={12} sx={{ my: 0 }} >
                                <Divider />
                            </Grid>
                            {/* Attachments */}
                            <Grid item xs={2}>
                                Attachments
                            </Grid>
                            <Grid item xs={10}>
                                insert an image, insert another image, insert another image, insert another image, insert another image
                            </Grid>
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
            </Dialog >
        </>
    );
};

export default AnnouncementManage;
