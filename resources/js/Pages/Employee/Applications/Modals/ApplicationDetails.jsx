import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    Divider,
    Stack,
    Tooltip
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

import InfoBox from "../../../../components/General/InfoBox"
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ApplicationDetails = ({ open, close, appDetails }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [files, setFiles] = useState([]);

    // ----------- Request Attachments
    useEffect(() => {
        axiosInstance.get(`/applications/getApplicationFiles/${appDetails.id}`, { headers })
            .then((response) => {
                setFiles(response.data.filenames);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }, []);

    // ----------- Dynamic File Icon
    const getFileIcon = (filename) => {
        const fileType = filename
            .split(".")
            .pop()
            .toLowerCase();

        let icon = null;
        let color = null;

        switch (fileType) {
            case "png":
            case "jpg":
            case "jpeg":
                icon = InsertPhoto;
                color = "purple";
                break;
            case "doc":
            case "docx":
                icon = Description;
                color = "blue";
                break;
            case "pdf":
                icon = PictureAsPdf;
                color = "red";
                break;
            case "xls":
            case "xlsx":
                icon = GridOn;
                color = "green";
        }

        return { icon, color };
    }

    // ----------- Download Attachment
    const handleFileDownload = async (filename, id) => {
        try {
            const response = await axiosInstance.get(
                `/applications/downloadFile/${id}`,
                {
                    responseType: "blob",
                    headers,
                }
            );
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

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
                        minWidth: { xs: "100%", sm: "500px" },
                        maxWidth: '600px',
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}>
                            {" "}Application Details{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Grid container rowSpacing={2}>
                        {/* Application Type */}
                        <Grid size={{ xs: 12 }}>
                            <InfoBox
                                title="Type"
                                info={appDetails.type_name}
                                compact
                                clean
                            />
                        </Grid>
                        <Grid xs={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Request Date*/}
                        <Grid size={{ xs: 12 }}>
                            <InfoBox
                                title="Requested"
                                info={dayjs(appDetails.created_at).format("MMM D, YYYY  h:mm A")}
                                compact
                                clean
                            />
                        </Grid>
                        {/* Start Date */}
                        <Grid size={{ xs: 12 }}>
                            <InfoBox
                                title="Starts"
                                info={dayjs(appDetails.duration_start).format("MMM D, YYYY  h:mm A")}
                                compact
                                clean
                            />
                        </Grid>
                        {/* End Date */}
                        <Grid size={{ xs: 12 }}>
                            <InfoBox
                                title="Ends"
                                info={dayjs(appDetails.duration_end).format("MMM D, YYYY  h:mm A")}
                                compact
                                clean
                            />
                        </Grid>
                        {/* Credits Used */}
                        <Grid size={{ xs: 12 }}>
                            <InfoBox
                                title="Credits Used"
                                info={appDetails.leave_used}
                                compact
                                clean
                            />
                        </Grid>
                        <Grid size={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Application Status */}
                        <Grid size={{ xs: 12 }}>
                            <InfoBox
                                title="Status"
                                info={appDetails.status.toUpperCase()}
                                compact
                                clean
                                color={
                                    appDetails.status === "Approved"
                                        ? "#177604"
                                        : appDetails.status === "Declined"
                                            ? "#f44336"
                                            : appDetails.status === "Pending"
                                                ? "#e9ae20"
                                                : appDetails.status === "Cancelled"
                                                    ? "#f57c00"
                                                    : "#000000"
                                }
                            />
                        </Grid>
                        <Grid size={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Description */}
                        <Grid container item xs={12}>
                            <Grid size={12}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    Description
                                </Typography>
                            </Grid>
                            <Grid size={12} sx={{ mt: 1 }}>
                                {appDetails.description}
                            </Grid>
                        </Grid>
                        <Grid size={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Attachments */}
                        <Grid container item size={12}>
                            <Grid size={12}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    Attached Files
                                </Typography>
                            </Grid>
                            <Grid size={12}>
                                {files ? (
                                    <Stack direction="column" sx={{ width: '100%' }}>
                                        {files.map((file, index) => {
                                            const fileIcon = getFileIcon(file.filename);
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: '10px',
                                                        padding: '4px 8px',
                                                        mt: 1,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex' }}>
                                                        {fileIcon.icon && <fileIcon.icon sx={{ mr: 1, color: fileIcon.color }} />}
                                                        <Typography noWrap sx={{ textDecoration: "underline" }}>{file.filename}</Typography>
                                                    </Box>
                                                    <Tooltip title="Download File">
                                                        <IconButton onClick={() => handleFileDownload(file.filename, file.id)} size="small">
                                                            <FileDownload />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )
                                        })}
                                    </Stack>
                                ) : (
                                    <Box
                                        sx={{
                                            mt: 1,
                                            width: "100%",
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        <Typography noWrap variant="caption" sx={{ color: 'text.secondary' }}>-- No Attached Files --</Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationDetails;
