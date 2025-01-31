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
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ApplicationDetails = ({ open, close, appDetails }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [applicationDuration, setApplicationDuration] = useState([]);

    useEffect(() => {
        const fromDateTime = dayjs(appDetails.duration_start);
        const toDateTime = dayjs(appDetails.duration_end);
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
                                {appDetails.type_id}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Starts
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {dayjs(appDetails.duration_start).format(
                                    "MMM D, YYYY    h:mm A"
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Created
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {dayjs(appDetails.created_at).format(
                                    "MMM D, YYYY    h:mm A"
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Ends
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography sx={{ fontWeight: "bold" }}>
                                {dayjs(appDetails.duration_end).format(
                                    "MMM D, YYYY    h:mm A"
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={5} align="left">
                            Status
                        </Grid>
                        <Grid item xs={7} align="left">
                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                    color:
                                        appDetails.status === "Accepted"
                                            ? "#177604"
                                            : appDetails.status === "Declined"
                                            ? "#f44336"
                                            : appDetails.status === "Pending"
                                            ? "#e9ae20"
                                            : "#000000",
                                }}
                            >
                                {appDetails.status}
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
                            {appDetails.attachment}
                        </Grid>
                        <Grid
                            container
                            item
                            xs={12}
                            sx={{
                                mt: 1,
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
                                {appDetails.description}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationDetails;
