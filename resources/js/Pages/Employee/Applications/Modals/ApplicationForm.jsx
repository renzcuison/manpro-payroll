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
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const ApplicationForm = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [appType, setAppType] = useState("");
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [applicationDuration, setApplicationDuration] = useState("");
    const [applicationTypes, setApplicationTypes] = useState([]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleTextFieldClick = (event) => {
        fileInput.current.click();
    };
    const fileInput = useRef(null);

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationTypes`, { headers })
            .then((response) => {
                console.log(response.data);
                setApplicationTypes(response.data.types);
            })
            .catch((error) => {
                console.error("Error fetching application types:", error);
            });
    }, []);

    const handleApplicationSubmit = async (event) => {
        event.preventDefault();
        console.log("Submitted Form!");
        console.log(`Application Type: ${appType}`);
        console.log(`From ${fromDate}`);
        console.log(`To: ${toDate}`);
        console.log(`Duration ${applicationDuration}`);
        console.log(`Uploaded File: ${file}`);
        console.log(`Description:`);
        console.log(description);

        const data = {
            type_id: appType,
            from_date: fromDate,
            to_date: toDate,
            attachment: "path_here",
            description: description,
        };
        axiosInstance
            .post("/applications/saveApplication", data, {
                headers,
            })
            .then((response) => {
                // Trigger refresh by toggling refreshTrigger
                setRefreshTrigger((prev) => !prev);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    useEffect(() => {
        const duration = toDate.diff(fromDate);
        const totalMinutes = Math.floor(duration / 60000);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        const remainingMinutes = totalMinutes % 60;
        const remainingHours = totalHours % 24;

        let durationInfo = "";

        if (totalDays > 0) {
            durationInfo += `${totalDays} day${totalDays > 1 ? "s" : ""}`;
            if (remainingHours > 0 || remainingMinutes > 0)
                durationInfo += ", ";
        }
        if (remainingHours > 0) {
            durationInfo += `${remainingHours} hour${
                remainingHours > 1 ? "s" : ""
            }`;
            if (remainingMinutes > 0) durationInfo += ", ";
        }
        if (remainingMinutes > 0) {
            durationInfo += `${remainingMinutes} minute${
                remainingMinutes > 1 ? "s" : ""
            }`;
        }
        if (duration == 0) {
            durationInfo += `None`;
        }
        setApplicationDuration(durationInfo);
    }, [fromDate, toDate]);

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
                        minWidth: { xs: "100%", sm: "500px" },
                        maxWidth: "650px",
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
                            Submit an Application{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ paddingBottom: 5 }}>
                    <Box component="form" onSubmit={handleApplicationSubmit}>
                        <Grid container columnSpacing={2} rowSpacing={3}>
                            {/* Application Type Selector */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="application-type-select-label">
                                        Type of Application
                                    </InputLabel>
                                    <Select
                                        labelId="application-type-select-label"
                                        id="application-type-select"
                                        value={appType}
                                        label="Application Type"
                                        // onChange={(event) =>
                                        // setAppType()
                                        // }
                                        onChange={(event) =>
                                            handleTypeChange(event.target.value)
                                        }
                                    >
                                        {applicationTypes.map((log, index) => (
                                            <MenuItem
                                                key={index}
                                                value={log.id}
                                            >
                                                {log.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* From Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="From Date"
                                        value={fromDate}
                                        minDate={dayjs()}
                                        onChange={(newValue) => {
                                            setFromDate(newValue);
                                            if (newValue.isAfter(toDate)) {
                                                setToDate(newValue);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* To Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="To Date"
                                        value={toDate}
                                        minDateTime={fromDate}
                                        onChange={(newValue) => {
                                            setToDate(newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* Duration */}
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Duration"
                                        value={applicationDuration}
                                        InputProps={{ readOnly: true }}
                                    ></TextField>
                                </FormControl>
                            </Grid>
                            {/* File Upload */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        label="Upload File"
                                        value={
                                            file
                                                ? `${file.name}, ${getFileSize(
                                                      file.size
                                                  )}`
                                                : ""
                                        }
                                        onClick={handleTextFieldClick}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: !file && (
                                                <InputAdornment position="end">
                                                    <InsertDriveFileIcon />
                                                </InputAdornment>
                                            ),
                                            startAdornment: file && (
                                                <InputAdornment position="start">
                                                    <InsertDriveFileIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        variant="outlined"
                                    />
                                    <input
                                        type="file"
                                        ref={fileInput}
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                </FormControl>
                            </Grid>
                            {/* Description Field */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Description"
                                        variant="outlined"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(event.target.value)
                                        }
                                    />
                                </FormControl>
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationForm;
