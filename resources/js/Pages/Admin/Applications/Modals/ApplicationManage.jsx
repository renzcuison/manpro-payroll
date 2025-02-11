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
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto } from "@mui/icons-material";
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

const ApplicationManage = ({ open, close, appDetails }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [applicationDuration, setApplicationDuration] = useState([]);
    const [attachmentName, setAttachmentName] = useState("");
    const [AttachmentIcon, setAttachmentIcon] = useState(null);
    const [iconColor, setIconColor] = useState("#177604");

    // ----------- Dynamic Attachment Icon
    useEffect(() => {
        if (appDetails && appDetails.app_attachment) {
            setAttachmentName(appDetails.app_attachment);
            const fileType = appDetails.app_attachment
                .split(".")
                .pop()
                .toLowerCase();

            switch (fileType) {
                case "png":
                case "jpg":
                case "jpeg":
                    setAttachmentIcon(InsertPhoto);
                    setIconColor("#177604");
                    break;
                case "doc":
                case "docx":
                    setAttachmentIcon(Description);
                    setIconColor("blue");
                    break;
                case "pdf":
                    setAttachmentIcon(PictureAsPdf);
                    setIconColor("red");
                    break;
            }
        }
    }, []);

    // ----------- Duration Calculator
    useEffect(() => {
        const fromDateTime = dayjs(appDetails.app_duration_start);
        const toDateTime = dayjs(appDetails.app_duration_end);
        const duration = dayjs.duration(toDateTime.diff(fromDateTime));

        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();

        let parts = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
        if (minutes > 0)
            parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

        const durationInfo = parts.length > 0 ? parts.join(", ") : "None";

        setApplicationDuration(durationInfo);
    }, []);

    const [appResponse, setAppResponse] = useState("");
    const [appResponseError, setAppResponseError] = useState(false);
    // ----------- Application Accept/Decline
    const handleApplicationResponse = () => {
        if (!appResponse) {
            setAppResponseError(true);
        } else {
            setAppResponseError(false);
        }
        if (!appResponse) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Select an Action!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: `${appResponse} application?`,
                text: "This action cannot be undone",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: appResponse,
                confirmButtonColor: `${appResponse == "Approve" ? "#177604" : "#f44336"
                    }`,
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    axiosInstance
                        .get(
                            `applications/manageApplication/${appDetails.app_id}/${appResponse}`,
                            {
                                headers,
                            }
                        )
                        .then((response) => {
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: `The application has been ${appResponse == "Approve"
                                    ? "Approved"
                                    : "Declined"
                                    }.`,
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonText: "Okay",
                                confirmButtonColor: "#177604",
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    close();
                                }
                            });
                        })
                        .catch((error) => {
                            console.error("Error managing application:", error);
                        });
                }
            });
        }
    };

    const handleFileDownload = async () => {
        try {
            const response = await axiosInstance.get(
                `/applications/downloadAttachment/${appDetails.app_id}`,
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
            link.download = attachmentName;
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
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "400px" },
                        maxWidth: "450px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, paddingBottom: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ marginLeft: 1, fontWeight: "bold" }}
                        >
                            {" "}
                            Application Details
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 4, paddingBottom: 5 }}>
                    <Grid container columnSpacing={4} rowSpacing={2}>
                        <Grid item xs={5} align="left">
                            Type
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {appDetails.app_type}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Created
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {dayjs(appDetails.app_date_requested).format(
                                    "MMM D, YYYY    h:mm A"
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Starts
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {dayjs(appDetails.app_duration_start).format(
                                    "MMM D, YYYY    h:mm A"
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Ends
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {dayjs(appDetails.app_duration_end).format(
                                    "MMM D, YYYY    h:mm A"
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Duration
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {applicationDuration}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Attachment
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "2px 0px",
                                    borderRadius: "4px",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        cursor: "pointer",
                                    },
                                }}
                                onClick={handleFileDownload}
                            >
                                {AttachmentIcon && (
                                    <AttachmentIcon
                                        fontSize="small"
                                        sx={{
                                            marginRight: "5px",
                                            color: iconColor,
                                        }}
                                    />
                                )}
                                <Typography
                                    sx={{ textDecoration: "underline" }}
                                >
                                    {attachmentName.length > 20
                                        ? `${appDetails.app_attachment.slice(
                                            0,
                                            20
                                        )}...`
                                        : attachmentName}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid
                            container
                            item
                            xs={12}
                            sx={{
                                mb: 1,
                            }}
                        >
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
                                {appDetails.app_description}
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            item
                            xs={12}
                            sx={{ alignItems: "center" }}
                        >
                            <Grid item xs={5} align="left">
                                Action
                            </Grid>
                            <Grid item xs={7} align="left">
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                        Select Action
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={appResponse}
                                        error={appResponseError}
                                        label="Age"
                                        onChange={(event) =>
                                            setAppResponse(event.target.value)
                                        }
                                    >
                                        <MenuItem value="Approve">
                                            Approve
                                        </MenuItem>
                                        <MenuItem value="Decline">
                                            Decline
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} align="center">
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ width: "30%" }}
                                onClick={handleApplicationResponse}
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationManage;
