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
    Tooltip
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload } from "@mui/icons-material";
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
                `/applications/downloadAttachment/${id}`,
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
                        <Grid item xs={5} align="left">
                            Type
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {appDetails.type_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Request Date*/}
                        <Grid item xs={5} align="left">
                            Requested
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Stack direction="row">
                                <Typography sx={{ fontWeight: "bold", width: "50%" }}>
                                    {dayjs(appDetails.created_at).format("MMM D, YYYY")}
                                </Typography>
                                <Typography sx={{ fontWeight: "bold", width: "50%" }}>
                                    {dayjs(appDetails.created_at).format("h:mm A")}
                                </Typography>
                            </Stack>
                        </Grid>
                        {/* Start Date */}
                        <Grid item xs={5} align="left">
                            Starts
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Stack direction="row">
                                <Typography sx={{ fontWeight: "bold", width: "50%" }}>
                                    {dayjs(appDetails.duration_start).format("MMM D, YYYY")}
                                </Typography>
                                <Typography sx={{ fontWeight: "bold", width: "50%" }}>
                                    {dayjs(appDetails.duration_start).format("h:mm A")}
                                </Typography>
                            </Stack>
                        </Grid>
                        {/* End Date */}
                        <Grid item xs={5} align="left">
                            Ends
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Stack direction="row">
                                <Typography sx={{ fontWeight: "bold", width: "50%" }}>
                                    {dayjs(appDetails.duration_end).format("MMM D, YYYY")}
                                </Typography>
                                <Typography sx={{ fontWeight: "bold", width: "50%" }}>
                                    {dayjs(appDetails.duration_end).format("h:mm A")}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Application Status */}
                        <Grid item xs={5} align="left">
                            Status
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                    color:
                                        appDetails.status === "Approved"
                                            ? "#177604"
                                            : appDetails.status === "Declined"
                                                ? "#f44336"
                                                : appDetails.status === "Pending"
                                                    ? "#e9ae20"
                                                    : appDetails.status === "Cancelled"
                                                        ? "#f57c00"
                                                        : "#000000",
                                }}
                            >
                                {appDetails.status.toUpperCase()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Description */}
                        <Grid container item xs={12}>
                            <Grid item xs={12}>
                                <div
                                    style={{
                                        textDecoration: "underline",
                                    }}
                                >
                                    Description
                                </div>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 1 }}>
                                {appDetails.description}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sx={{ my: 0 }} >
                            <Divider />
                        </Grid>
                        {/* Attachments */}
                        <Grid container item xs={12}>
                            <Grid item xs={12}>
                                Attached Files
                            </Grid>
                            <Grid item xs={12}>
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
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '4px',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        <Typography noWrap variant="caption" sx={{ color: 'text.secondary' }}>No Attached Documents</Typography>
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
