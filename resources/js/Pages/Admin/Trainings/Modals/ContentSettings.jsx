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
    Divider,
    CardMedia
} from "@mui/material";
import { Cancel, DragIndicator, OndemandVideo, Image, Description, Quiz } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ContentSettings = ({ open, close, trainingInfo, contentInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [content, setContent] = useState([]);
    const [inOrder, setInOrder] = useState(Boolean(trainingInfo?.sequential));
    const [initialContent, setInitialContent] = useState([]);
    const [newOrder, setNewOrder] = useState([]);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    useEffect(() => {
        if (open && contentInfo && Array.isArray(contentInfo)) {
            const contentCopy = contentInfo.map((item) => ({
                id: item.id,
                order: item.order,
                title: item.title,
                content: item.content,
            }));
            setContent(contentCopy);
            setInitialContent(contentCopy);
            const initialOrder = contentCopy.map((item) => ({
                id: item.id,
                order: item.order,
            }));
            setNewOrder(initialOrder);
        } else if (open) {
            setContent([]);
            setInitialContent([]);
            setNewOrder([]);
        }
    }, [open]);

    // Drag and Drop Handlers
    const handleDragStart = (e, index) => {
        //console.log("Drag started at index:", index);
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
        //e.target.style.opacity = "0.5";
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        //console.log("Dragging over index:", index);
        dragOverItem.current = index;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragLeave = (e) => {
        e.target.style.opacity = "1";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dragIndex = dragItem.current;
        const dropIndex = dragOverItem.current;

        //console.log("Dropped. From index:", dragIndex, "to index:", dropIndex);

        if (dragIndex === null || dropIndex === null) return;

        const items = Array.from(content);
        const [draggedItem] = items.splice(dragIndex, 1);
        items.splice(dropIndex, 0, draggedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setContent(updatedItems);

        const updatedOrder = updatedItems.map((item) => ({
            id: item.id,
            order: item.order,
        }));
        setNewOrder(updatedOrder);

        // console.log("Content after drop:", updatedItems);
        // console.log("New order:", updatedOrder);

        dragItem.current = null;
        dragOverItem.current = null;
        e.target.style.opacity = "1";
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = "1";
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // Reset Order to Default
    const handleResetToDefault = () => {
        setContent(initialContent);
        const resetOrder = initialContent.map((item) => ({
            id: item.id,
            order: item.order,
        }));
        setNewOrder(resetOrder);
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

    const checkInput = (event) => {
        event.preventDefault();

        console.log("Submitting newOrder:", newOrder);

        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "Do you want to update the content settings?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput(event);
            }
        });
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            in_order: inOrder,
            unique_code: trainingInfo.unique_code,
            new_order: newOrder
        }

        axiosInstance.post("/trainings/saveContentSettings", data, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Content settings updated!`,
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        if (res.isConfirmed) {
                            close(true, inOrder);
                            document.body.setAttribute("aria-hidden", "true");
                        } else {
                            document.body.setAttribute("aria-hidden", "true");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "700px" },
                        maxWidth: "800px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                            Content Settings
                        </Typography>
                        <IconButton onClick={() => close(false, inOrder)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off">
                        <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 1 }}>
                            {/* Content Type */}
                            <Grid item xs={12}>
                                <Box
                                    display="flex"
                                    sx={{
                                        width: "100%",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography>Require content to be completed in order</Typography>
                                    <Switch
                                        checked={inOrder}
                                        onChange={() => setInOrder(!inOrder)}
                                        inputProps={{ "aria-label": "controlled" }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sx={{ my: 0 }}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} display="flex" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                <Box display="flex" sx={{ alignItems: "center" }}>
                                    <Typography>Content Order</Typography>
                                    <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>(Drag and Drop to Reorder)</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#f57c00",
                                        color: "white",
                                    }}
                                    onClick={handleResetToDefault}
                                    disabled={initialContent.length === 0}
                                    className="m-1"
                                >
                                    <p className="m-0">
                                        <i className="fa fa-undo mr-2 mt-1"></i> Reset to Default
                                    </p>
                                </Button>
                            </Grid>
                            <Grid container item xs={12} spacing={2}>
                                {content && content.length > 0 && content.every((cont) => cont && cont.id) ? (
                                    content.map((cont, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            key={cont.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnter={(e) => handleDragEnter(e, index)}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                sx={{
                                                    width: "100%",
                                                    border: "1px solid #e0e0e0",
                                                    borderRadius: "4px",
                                                    padding: "12px",
                                                    backgroundColor: "#fafafa",
                                                    boxShadow: 1,
                                                    cursor: "grab",
                                                    "&:hover": { backgroundColor: "#f0f0f0" },
                                                    transition: "background-color 0.2s ease",
                                                }}
                                            >
                                                {/* Content Details */}
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <DragIndicator sx={{ color: "text.secondary", cursor: "grab" }} />
                                                    <CardMedia
                                                        component="img"
                                                        sx={{
                                                            width: "80px",
                                                            height: "60px",
                                                            objectFit: "contain",
                                                            borderRadius: "4px",
                                                            backgroundColor: "transparent",
                                                        }}
                                                        image={renderImage(cont.content.source, cont.content.type)}
                                                        title={cont.title || "Content Item"}
                                                        alt={cont.title || "Content Item"}
                                                    />
                                                    <Stack spacing={0.5} sx={{ ml: 1 }}>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {`${cont.order} - ${cont.title}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {cont.content.type || "Form"}
                                                        </Typography>
                                                    </Stack>
                                                </Box>

                                                {/* Content Icon */}
                                                <Box>
                                                    {cont.content.type === "Video" && <OndemandVideo sx={{ color: "text.secondary" }} />}
                                                    {cont.content.type === "Image" && <Image sx={{ color: "text.secondary" }} />}
                                                    {cont.content.type === "Document" && <Description sx={{ color: "text.secondary" }} />}
                                                    {!cont.content.type && <Quiz sx={{ color: "text.secondary" }} />}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))
                                ) : (
                                    <Typography sx={{ color: "text.secondary" }}>No content available</Typography>
                                )}
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                align="center"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#177604",
                                        color: "white",
                                    }}
                                    className="m-1"
                                >
                                    <p className="m-0">
                                        <i className="fa fa-floppy-o mr-2 mt-1"></i> Save Changes
                                    </p>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ContentSettings;