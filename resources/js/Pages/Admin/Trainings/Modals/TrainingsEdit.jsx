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
    Radio
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const TrainingsEdit = ({ open, close, trainingInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [title, setTitle] = useState(trainingInfo.title);

    const [startDate, setFromDate] = useState(dayjs(trainingInfo.start_date));
    const [endDate, setToDate] = useState(dayjs(trainingInfo.end_date));

    const [trainingDuration, setTrainingDuration] = useState(trainingInfo.duration || 0);
    const [trainingMinutes, setTrainingMinutes] = useState((trainingInfo.duration % 60) || 0);
    const [trainingHours, setTrainingHours] = useState(Math.floor(trainingInfo.duration / 60) || 0);

    const [description, setDescription] = useState(trainingInfo.description || '');
    const [coverImage, setCoverImage] = useState(null);

    // Form Errors
    const [titleError, setTitleError] = useState(false);

    const [fromDateError, setFromDateError] = useState(false);
    const [toDateError, setToDateError] = useState(false);

    const [descriptionError, setDescriptionError] = useState(false);
    const [coverImageError, setCoverImageError] = useState(false);

    // Training Duration
    useEffect(() => {
        const trainingHoursNumber = parseInt(trainingHours) || 0;
        const trainingMinutesNumber = parseInt(trainingMinutes) || 0;

        const duration = (trainingHoursNumber * 60) + trainingMinutesNumber;
        setTrainingDuration(duration);
    }, [trainingHours, trainingMinutes]);

    // Cover Image Handler
    const handleCoverUpload = (input) => {
        const file = input.target.files[0];
        if (file && file.size > 5242880) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "File Too Large!",
                text: `The file size limit is 5 MB!`,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            setCoverImage(file);
        }
    }

    // File Size
    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const checkInput = (event) => {
        event.preventDefault();

        setTitleError(!title);
        setDescriptionError(!description);
        setFromDateError(!startDate);
        setToDateError(!endDate);

        if (!title || !description || !startDate || !endDate) {
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
                text: "Do you want to update this training?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }

    }

    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("unique_code", trainingInfo.unique_code);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("start_date", startDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("end_date", endDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("duration", trainingDuration);
        formData.append("cover_image", coverImage);

        axiosInstance.post("/trainings/editTraining", formData, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Your training has been updated!`,
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
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "900px" }, maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Edit Training </Typography>
                        <IconButton onClick={() => close(false)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" >
                        <Grid container columnSpacing={2} rowSpacing={3} sx={{ mt: 1 }}>
                            {/* Title Field */}
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Title"
                                        variant="outlined"
                                        value={title}
                                        error={titleError}
                                        onChange={(event) => {
                                            if (event.target.value.length <= 128) {
                                                setTitle(event.target.value);
                                            }
                                        }}
                                        inputProps={{ maxLength: 128 }}
                                    />
                                    <FormHelperText>
                                        {title.length}/{128}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            {/* Cover Image */}
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        fullWidth
                                        label="Cover Image"
                                        variant="outlined"
                                        value={coverImage ? `${coverImage.name}, ${getFileSize(coverImage.size)}` : ""}
                                        error={coverImageError}
                                        placeholder={trainingInfo.cover_name}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            document.getElementById('cover-image-upload').click();
                                        }}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {coverImage && (
                                                        <IconButton
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setCoverImage(null);
                                                            }}
                                                            size="small"
                                                            sx={{ marginLeft: '8px' }}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    )}
                                                </InputAdornment>
                                            ),
                                        }}
                                        InputLabelProps={{ shrink: !!trainingInfo.cover_name }}
                                        helperText="Upload a cover image (.png, .jpg, .jpeg), 5 MB size limit"
                                    />
                                    <input
                                        accept=".png, .jpg, .jpeg"
                                        id="cover-image-upload"
                                        type="file"
                                        name="image"
                                        style={{ display: "none" }}
                                        onChange={handleCoverUpload}
                                    />
                                </FormControl>
                            </Grid>
                            {/* Start Date */}
                            <Grid size={{ xs: 4 }}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="Starts"
                                        value={startDate}
                                        minDate={dayjs()}
                                        timeSteps={{ minutes: 1 }}
                                        onChange={(newValue) => {
                                            setFromDate(newValue);
                                            if (newValue.isAfter(endDate)) {
                                                setToDate(newValue);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: fromDateError,
                                                readOnly: true,
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* End Date */}
                            <Grid size={{ xs: 4 }}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="Ends"
                                        value={endDate}
                                        minDateTime={startDate}
                                        timeSteps={{ minutes: 1 }}
                                        onChange={(newValue) => setToDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: toDateError,
                                                readOnly: true,
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* Duration */}
                            <Grid container size={{ xs: 4 }} spacing={1}>
                                <Grid size={{ xs: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Duration"
                                            value={trainingHours}
                                            onChange={(event) => {
                                                if (event.target.value) {
                                                    setTrainingHours(event.target.value)
                                                } else {
                                                    setTrainingHours(0);
                                                }

                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Hr
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                inputProps: {
                                                    min: 0,
                                                },
                                            }}
                                            inputProps={{
                                                pattern: '[0-9]*',
                                                inputMode: 'numeric',
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <FormControl fullWidth>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={trainingMinutes}
                                            onChange={(event) => {
                                                if (event.target.value) {
                                                    if (event.target.value > 59) {
                                                        setTrainingMinutes(59);
                                                    } else {
                                                        setTrainingMinutes(event.target.value)
                                                    }
                                                } else {
                                                    setTrainingMinutes(0);
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Min
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                inputProps: {
                                                    min: 0,
                                                    max: 59,
                                                },
                                            }}
                                            inputProps={{
                                                pattern: '[0-9]*',
                                                inputMode: 'numeric',
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {/* Description Field */}
                            <Grid size={{ xs: 12 }}>
                                <FormControl error={descriptionError} fullWidth>
                                    <div style={{ border: descriptionError ? '1px solid red' : '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                        <ReactQuill
                                            id='description'
                                            name='description'
                                            value={description}
                                            onChange={(value) => {
                                                if (value.length <= 1024) {
                                                    setDescription(value);
                                                }
                                            }}
                                            placeholder="Enter training description here *"
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                                                    ['link'],
                                                    ['clean']
                                                ],
                                            }}
                                            formats={[
                                                'header', 'font', 'size',
                                                'bold', 'italic', 'underline', 'strike', 'blockquote',
                                                'list', 'bullet', 'indent',
                                                'align',
                                                'link', 'image', 'video'
                                            ]}
                                            theme="snow"
                                            style={{ marginBottom: '3rem', height: '150px', width: '100%' }}
                                        ></ReactQuill>
                                        <FormHelperText>
                                            {description.length}/{1024}
                                        </FormHelperText>
                                    </div>
                                </FormControl>

                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                size={{ xs: 12 }}
                                align="center"
                                sx={{
                                    justifyContent: "center", alignItems: "center",
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
                                    <p className="m-0"> <i className="fa fa-floppy-o mr-2 mt-1"></i> Update Training </p>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TrainingsEdit;
