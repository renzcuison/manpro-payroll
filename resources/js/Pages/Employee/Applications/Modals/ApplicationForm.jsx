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
    FormHelperText,
    Switch,
    Select,
    MenuItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
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

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleApplicationSubmit = async (event) => {
        event.preventDefault();
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
                        <Grid container spacing={2}>
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
                                        onChange={(event) =>
                                            setAppType(event.target.value)
                                        }
                                    >
                                        <MenuItem value="overtime">
                                            Overtime
                                        </MenuItem>
                                        <MenuItem value="sick leave">
                                            Sick Leave
                                        </MenuItem>
                                        <MenuItem value="vacation leave">
                                            Vacation Leave
                                        </MenuItem>
                                        <MenuItem value="paid leave">
                                            Paid Leave
                                        </MenuItem>
                                        <MenuItem value="unpaid leave">
                                            Unpaid Leave
                                        </MenuItem>
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
                                        onChange={(event) => {
                                            setFromDate(event);
                                            if (event.isAfter(toDate)) {
                                                setToDate(event);
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
                                        minDate={fromDate}
                                        onChange={(event) => setToDate(event)}
                                        renderInput={(params) => (
                                            <TextField {...params} />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* Affected Time */}
                            <Grid item xs={4}>
                                <Typography align="left">
                                    Affected Time: {"???"}
                                </Typography>
                            </Grid>
                            {/* File Upload */}
                            <Grid item container spacing={2} xs={12}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <Button
                                            variant="contained"
                                            component="label"
                                        >
                                            Upload File
                                            <input
                                                type="file"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        {file ? (
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <InsertDriveFileIcon
                                                    sx={{ marginRight: 1 }}
                                                />
                                                <Typography noWrap>
                                                    {file.name},{" "}
                                                    {getFileSize(file.size)}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <FormHelperText>
                                                No file chosen
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
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
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApplicationForm;
