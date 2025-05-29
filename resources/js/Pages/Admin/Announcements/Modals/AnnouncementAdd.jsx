import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    TextField,
    Typography,
    Stack,
    useMediaQuery,
    Divider,
    Tabs,
    Tab
} from "@mui/material";
import { Close, CloudUpload, CheckCircle } from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

const tabSx = {
    fontWeight: 700,
    minWidth: 120,
    fontSize: "1rem",
    color: "#177604",
    "&.Mui-selected": {
        color: "#155d03"
    }
};

const AnnouncementAdd = ({ open, close }) => {
    // Auth
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const isMobile = useMediaQuery('(max-width:600px)');
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [tab, setTab] = useState(0);

    // Errors
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);

    // Tab change for preview
    const handleTabChange = (_, newValue) => setTab(newValue);

    // Upload handler
    const handleUpload = (e) => {
        const file = e.target.files[0];
        setUploadFile(file);
    };

    // Main save function (from old design)
    const saveAnnouncement = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (uploadFile) {
            formData.append('attachment[]', uploadFile);
        }

        await axiosInstance
            .post("/announcements/saveAnnouncement", formData, { headers })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `Your announcement has been saved!`,
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then((res) => {
                    if (res.isConfirmed) {
                        close(true);
                        document.body.setAttribute("aria-hidden", "true");
                    } else {
                        document.body.setAttribute("aria-hidden", "true");
                    }
                });
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    // Validate and confirm before saving
    const handleSubmit = (e) => {
        e.preventDefault();
        setTitleError(!title);
        setDescriptionError(!description);

        if (!title || !description) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All Required Fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to save this announcement?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveAnnouncement();
                }
            });
        }
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    background: "#fafbfa",
                    borderRadius: 12,
                    minWidth: isMobile ? "100%" : 700,
                    maxWidth: 800,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }
            }}
        >
            <Box sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 2, width: "100%" }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: "1.4rem",
                            textTransform: "uppercase",
                            textDecoration: "underline",
                            letterSpacing: 0.5
                        }}
                    >
                        Create Announcement
                    </Typography>
                    <IconButton onClick={() => close(false)} aria-label="close">
                        <Close />
                    </IconButton>
                </Stack>
            </Box>
            <Divider />
            <DialogContent sx={{ px: { xs: 2, sm: 4 }, pb: 4 }}>
                <form onSubmit={handleSubmit}>
                    {/* Upload Area */}
                    <Box
                        sx={{
                            border: "1.5px solid #E0E0E0",
                            borderRadius: 2,
                            height: 140,
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            mb: 3,
                            cursor: "pointer",
                            transition: "border 0.2s",
                            "&:hover": { borderColor: "#bdbdbd" }
                        }}
                        onClick={() => document.getElementById("file-upload").click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: "none" }}
                            onChange={handleUpload}
                        />
                        <CloudUpload sx={{ fontSize: 42, color: "#bdbdbd" }} />
                        <Typography sx={{
                            color: "#757575", fontSize: "1rem", mt: 1, fontWeight: 500, letterSpacing: 0.2
                        }}>
                            {uploadFile ? uploadFile.name : "UPLOAD"}
                        </Typography>
                    </Box>
                    {/* Title Field */}
                    <TextField
                        placeholder="TITLE HERE*"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        fullWidth
                        required
                        variant="outlined"
                        error={titleError}
                        sx={{
                            mb: 3,
                            "& input": { fontWeight: 500, fontSize: "1.1rem" }
                        }}
                        inputProps={{
                            maxLength: 128,
                        }}
                        helperText={`${title.length}/128`}
                    />
                    {/* Description Field with Tabs */}
                    <Box
                        sx={{
                            border: "1.5px solid #E0E0E0",
                            borderRadius: 2,
                            background: "#fff",
                            mb: 3,
                            overflow: "hidden"
                        }}
                    >
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            TabIndicatorProps={{
                                style: { background: "#177604", height: 3, borderRadius: 2 }
                            }}
                            sx={{
                                borderBottom: "1.5px solid #E0E0E0",
                                minHeight: 44,
                                pl: 1,
                                ".MuiTabs-flexContainer": { gap: 2 }
                            }}
                        >
                            <Tab label="WRITE" sx={tabSx} />
                            <Tab label="PREVIEW" sx={tabSx} />
                        </Tabs>
                        <Box sx={{ p: 2, pt: 1 }}>
                            {tab === 0 ? (
                                <Box
                                    sx={{
                                        border: descriptionError ? "1px solid red" : "1px solid #E0E0E0",
                                        borderRadius: 2,
                                        background: "#fff",
                                        minHeight: 120,
                                        "& .ql-toolbar": {
                                            border: "none",
                                            borderBottom: "1px solid #e0e0e0",
                                            borderRadius: 0,
                                            padding: "4px 8px",
                                            fontSize: "1rem",
                                        },
                                        "& .ql-container": {
                                            border: "none",
                                            fontSize: "1rem",
                                            color: "#757575",
                                            minHeight: 80,
                                        },
                                    }}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={description}
                                        onChange={setDescription}
                                        placeholder="DESCRIPTION HERE*"
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [false, 1, 2, 3] }],
                                                ['bold', 'italic', 'underline'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link', 'strike'],
                                            ]
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            minHeight: 90
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ float: "right", color: "#999" }}>
                                        {description.length}/512
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{
                                    minHeight: 120,
                                    color: "#333",
                                    fontSize: "1rem",
                                    p: 1,
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: description || "<em>No content</em>" }} />
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {/* Proceed Button */}
                    <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                background: "#177604",
                                color: "#fff",
                                fontWeight: 700,
                                borderRadius: 1.5,
                                px: 5,
                                py: 1.2,
                                fontSize: "1.05rem",
                                "&:hover": { background: "#155d03" }
                            }}
                            startIcon={<CheckCircle sx={{ fontSize: 22 }} />}
                        >
                            PROCEED
                        </Button>
                    </Stack>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AnnouncementAdd;