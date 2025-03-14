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

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import ContentEdit from "./ContentEdit";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ContentView = ({ open, close, content }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Training Menu
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
                return `${location.origin}/storage/${source}`;
            case "Document":
            case "PowerPoint":
            case "Video":
            case "Form":
                return "../../../../images/ManProTab.png";
            default:
                return "../../../../images/ManProTab.png";
        }
    };

    // Edit Content
    const [openContentEditModal, setOpenContentEditModal] = useState(false);
    const handleOpenContentEditModal = () => {
        setOpenContentEditModal(true);
    };
    const handleCloseContentEditModal = (reload) => {
        setOpenContentEditModal(false);
        if (reload) {
            //set content details
        }
    };

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

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '800px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Content Details </Typography>
                        <IconButton onClick={() => close(false)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3 }}>
                    <Box>
                        <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 1 }}>
                            {content.content.type == "Image" && (
                                <Grid item xs={12}>
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            width: "56%",
                                            aspectRatio: "16 / 9",
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
                                    <Divider />
                                </Grid>
                            )}
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
                                        <MenuItem
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleOpenContentEditModal();
                                                handleMenuClose();
                                            }}>
                                            Edit
                                        </MenuItem>
                                        {/* Remove Content */}
                                        <MenuItem
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleRemoveContent();
                                                handleMenuClose();
                                            }}>
                                            Remove
                                        </MenuItem>
                                    </Menu>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sx={{ my: 0 }} >
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
                    </Box>
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
