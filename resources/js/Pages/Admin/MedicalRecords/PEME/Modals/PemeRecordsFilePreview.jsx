import {
    Dialog,
    Typography,
    DialogTitle,
    Box,
    DialogContent,
    Button,
    IconButton,
    Tooltip,
} from "@mui/material";
import React from "react";
import DownloadIcon from "@mui/icons-material/Download";

const PemeRecordsFilePreview = ({ open, close, file }) => {
    const downloadFile = async (filename) => {
        try {
            const response = await fetch(`http://192.168.79.33:8000/api/download/${filename}`, {
                method: "GET",
            });

            if (!response.ok) {
                alert("Download failed.");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download error:", error);
            alert("An error occurred while downloading.");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            maxWidth={false}
            PaperProps={{
                sx: {
                    backgroundColor: "#f8f9fa",
                    width: { xs: '100%', md: '60vw' },
                    height: { xs: '100%', md: '90vh' },
                    borderRadius: "20px",
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <DialogTitle sx={{ paddingBottom: 0 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: 1,
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {file?.file_name || "File Preview"}
                    </Typography>

                    {file?.file_name && (
                        <Tooltip title="Download file">
                            <IconButton
                                onClick={() => downloadFile(file.file_name)}
                                sx={{
                                    color: "#727F91",
                                    padding: 1,
                                    "&:hover": {
                                        color: "#5e6b7a",
                                        backgroundColor: "transparent",
                                    },
                                    borderRadius: 0,
                                }}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </DialogTitle>

            <DialogContent
                sx={{
                    flex: 1,
                    padding: 3,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {file?.url ? (
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            overflow: "hidden",
                            backgroundColor: "#fff",
                        }}
                    >
                        {file.url.endsWith(".pdf") ? (
                            <iframe
                                src={file.url}
                                title="PDF Preview"
                                width="100%"
                                height="100%"
                                style={{
                                    border: "none",
                                    height: "100%",
                                }}
                            />
                        ) : (
                            <img
                                src={file.url}
                                alt={file.file_name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    display: "block",
                                }}
                            />
                        )}
                    </Box>
                ) : (
                    <Typography>No file to preview.</Typography>
                )}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 3,
                    }}
                >
                    <Button
                        onClick={close}
                        variant="contained"
                        sx={{ backgroundColor: "#727F91" }}
                    >
                        Close
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PemeRecordsFilePreview;
