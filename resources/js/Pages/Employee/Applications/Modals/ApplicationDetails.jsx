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

const ApplicationDetails = ({ open, close, id }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [applicationDetails, setApplicationDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationDetails`, {
                headers,
                params: {
                    app_id: id,
                },
            })
            .then((response) => {
                //console.log(response.data);
                //console.log(response.data.application);
                setApplicationDetails(response.data.application);
                getDuration(
                    response.data.application.duration_start,
                    response.data.application.duration_end
                );
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
                // console.error("Error fetching employee:", error);
            });
    }, []);

    const [applicationDuration, setApplicationDuration] = useState("");

    const getDuration = (fromDate, toDate) => {
        const fromDateTime = dayjs(fromDate);
        const toDateTime = dayjs(toDate);
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
                        minWidth: { xs: "100%", sm: "560px" },
                        maxWidth: "720px",
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
                            sx={{ marginLeft: 2, fontWeight: "bold" }}
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
                    {isLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 100,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Grid container columnSpacing={4} rowSpacing={2}>
                                <Grid container item xs={6}>
                                    <Grid item xs={6} align="left">
                                        Type
                                    </Grid>
                                    <Grid item xs={6} align="right">
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {applicationDetails.type_id}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={6}>
                                    <Grid item xs={6} align="left">
                                        Starts
                                    </Grid>
                                    <Grid item xs={6} align="right">
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {dayjs(
                                                applicationDetails.duration_start
                                            ).format("MMM D, YYYY    h:mm A")}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container item xs={6}>
                                    <Grid item xs={6} align="left">
                                        Created
                                    </Grid>
                                    <Grid item xs={6} align="right">
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {dayjs(
                                                applicationDetails.created_at
                                            ).format("MMM D, YYYY    h:mm A")}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={6}>
                                    <Grid item xs={6} align="left">
                                        Ends
                                    </Grid>
                                    <Grid item xs={6} align="right">
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {dayjs(
                                                applicationDetails.duration_end
                                            ).format("MMM D, YYYY    h:mm A")}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid container item xs={6}>
                                    <Grid item xs={6} align="left">
                                        Status
                                    </Grid>
                                    <Grid item xs={6} align="right">
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                color:
                                                    applicationDetails.status ===
                                                    "Accepted"
                                                        ? "#177604"
                                                        : applicationDetails.status ===
                                                          "Declined"
                                                        ? "#f44336"
                                                        : applicationDetails.status ===
                                                          "Pending"
                                                        ? "#e9ae20"
                                                        : "#000000",
                                            }}
                                        >
                                            {applicationDetails.status}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={6}>
                                    <Grid item xs={6} align="left">
                                        Duration
                                    </Grid>
                                    <Grid item xs={6} align="right">
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {applicationDuration}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12}>
                                    {applicationDetails.attachment}
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
                                        {applicationDetails.description}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationDetails;
