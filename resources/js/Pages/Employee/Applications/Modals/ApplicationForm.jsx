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
    Stack
} from "@mui/material";
import { Cancel, InfoOutlined } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import Swal from "sweetalert2";
import moment from "moment";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import minMax from "dayjs/plugin/minMax";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(minMax);

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { validateDate } from "@mui/x-date-pickers";

const ApplicationForm = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Form Fields
    const [applicationTypes, setApplicationTypes] = useState([]);
    const [appType, setAppType] = useState("");
    const [tenureship, setTenureship] = useState(0);
    const [leaveCredits, setLeaveCredits] = useState(0);
    const [availableLeave, setAvailableLeave] = useState(0);

    const [fromDate, setFromDate] = useState(dayjs().startOf('hour'));
    const [toDate, setToDate] = useState(dayjs().startOf('hour'));

    const [workHours, setWorkHours] = useState(0);
    const [leaveUsed, setLeaveUsed] = useState(0);
    const [fullDates, setFullDates] = useState([]);

    const [holidayDates, setHolidayDates] = useState([]);
    const [holidayNames, setHolidayNames] = useState([]);
    const [weekendCount, setWeekendCount] = useState(0);
    const [holidayCount, setHolidayCount] = useState(0);

    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState([]);
    const [image, setImage] = useState([]);
    const [fileRequired, setFileRequired] = useState(false);

    // Form Errors
    const [appTypeError, setAppTypeError] = useState(false);
    const [tenureshipError, setTenureshipError] = useState(false);
    const [availableLeaveError, setAvailableLeaveError] = useState(false);

    const [fromDateError, setFromDateError] = useState(false);
    const [toDateError, setToDateError] = useState(false);
    const [dateRangeError, setDateRangeError] = useState(false);
    const [leaveUsedError, setLeaveUsedError] = useState(false);

    const [descriptionError, setDescriptionError] = useState(false);
    const [fileError, setFileError] = useState(false);


    // Application Data Prep
    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationTypes`, { headers })
            .then((response) => {
                setApplicationTypes(response.data.types);
            })
            .catch((error) => {
                console.error("Error fetching application types:", error);
            });

        axiosInstance
            .get(`applications/getTenureship`, { headers })
            .then((response) => {
                setTenureship(response.data.tenureship);
            })
            .catch((error) => {
                console.error("Error fetching tenureship duration:", error);
            });

        axiosInstance
            .get(`applications/getMyLeaveCredits`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error("Error fetching leave credits:", error);
            });

        axiosInstance
            .get(`workshedule/getWorkHours`, { headers })
            .then((response) => {
                setWorkHours(response.data.workHours);
            })
            .catch((error) => {
                console.error("Error fetching tenureship duration:", error);
            });

        axiosInstance
            .get(`applications/getFullLeaveDays`, { headers })
            .then((response) => {
                setFullDates(response.data.fullDates);
            })
            .catch((error) => {
                console.error("Error fetching full days:", error);
            });


        axiosInstance
            .get(`applications/getNagerHolidays`, {
                headers,
                params: {
                    start_date: fromDate,
                    to_date: toDate
                }
            })
            .then((response) => {
                ;
                setHolidayDates(response.data.holiday_dates);
                setHolidayNames(response.data.holiday_names);
            })
            .catch((error) => {
                console.error("Error fetching Full Days:", error);
            });

    }, []);

    // Application Type Handler
    const handleTypeChange = (value) => {
        const selectedType = applicationTypes.find(type => type.id == value);
        const leaveType = leaveCredits.find(leave => leave.app_type_id == value);

        const available = leaveType ? (leaveType.credit_number - leaveType.credit_used) : 0;
        setAvailableLeave(available);
        setAvailableLeaveError(leaveUsed > available);
        setTenureshipError(tenureship < selectedType.tenureship_required);

        setFileRequired(selectedType.require_files);
        setAppType(value);
    };

    // Attachment Handlers
    const handleAttachmentUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, attachment.length, 5, 10485760, "document");
        if (validFiles) {
            setAttachment(prev => [...prev, ...files]);
        }
    };

    const handleDeleteAttachment = (index) => {
        setAttachment(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );

    };

    // Image Handlers
    const handleImageUpload = (input) => {
        const files = Array.from(input.target.files);
        let validFiles = validateFiles(files, image.length, 10, 5242880, "image");
        if (validFiles) {
            setImage(prev => [...prev, ...files]);
        }
    };

    const handleDeleteImage = (index) => {
        setImage(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );

    };

    // Validate Files
    const validateFiles = (newFiles, currentFileCount, countLimit, sizeLimit, docType) => {
        if (newFiles.length + currentFileCount > countLimit) {
            // The File Limit has been Exceeded
            formError("File Limit Reached!", `You can only have up to ${countLimit} ${docType}s at a time.`);
            return false;
        } else {
            let largeFiles = 0;
            newFiles.forEach((file) => {
                if (file.size > sizeLimit) {
                    largeFiles++;
                }
            });
            if (largeFiles > 0) {
                // A File is Too Large
                formError("File Too Large!", `Each ${docType} can only be up to ${docType == "image" ? "5 MB" : "10 MB"}.`);
                return false;
            } else {
                // All File Criteria Met
                return true;
            }
        }
    }

    const getFileSize = (size) => {
        if (size === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Validate Date Range
    const validateDates = (dateTime, type) => {
        const dates = [];
        let currentDate = dayjs(fromDate).startOf('hour')
        let endDate = dayjs(toDate).startOf('hour')

        let adjustedDateTime = dayjs(dateTime).startOf('hour');

        // Set Date States
        if (type === "From") {
            setFromDate(adjustedDateTime);
            currentDate = adjustedDateTime

            if (adjustedDateTime.isAfter(toDate)) {
                setToDate(adjustedDateTime);
                endDate = adjustedDateTime
            }

        } else if (type === "To") {
            setToDate(adjustedDateTime);
            endDate = adjustedDateTime
        }

        // Date-Full Date Comparison
        while (currentDate <= endDate) {
            dates.push(currentDate.format('YYYY-MM-DD'));
            currentDate = currentDate.add(1, 'day')
        }

        if (dates.some(date => fullDates.includes(date))) {
            setDateRangeError(true);
        } else {
            setDateRangeError(false);
        }
    }

    // Leave Credit Calculation
    useEffect(() => {
        if (toDate.isBefore(fromDate)) {
            setLeaveUsed(0);
            return;
        }
        let creditsUsed = 0;
        let weekends = 0;
        let holidays = 0;
        let skipDay;

        if (workHours) {
            let currentDate = fromDate.startOf('day');
            let lastDate = toDate.startOf('day');

            const firstIn = parseTime(workHours.first_time_in);
            const firstOut = parseTime(workHours.first_time_out);
            const dayStart = currentDate.set('hour', firstIn.hr).set('minute', firstIn.min).set('second', firstIn.sec);
            const lastStart = lastDate.set('hour', firstIn.hr).set('minute', firstIn.min).set('second', firstIn.sec);

            let dayEnd, dayGapStart, dayGapEnd;
            let lastEnd, lastGapStart, lastGapEnd;
            let affectedStart, affectedEnd, affectedTime;

            // Data Preps
            if (workHours.shift_type == "Regular") {
                const breakStart = parseTime(workHours.break_start);
                const breakEnd = parseTime(workHours.break_end);

                dayEnd = currentDate.set('hour', firstOut.hr).set('minute', firstOut.min).set('second', firstOut.sec);
                dayGapStart = currentDate.set('hour', breakStart.hr).set('minute', breakStart.min).set('second', breakStart.sec);
                dayGapEnd = currentDate.set('hour', breakEnd.hr).set('minute', breakEnd.min).set('second', breakEnd.sec);

                lastEnd = lastDate.set('hour', firstOut.hr).set('minute', firstOut.min).set('second', firstOut.sec);
                lastGapStart = lastDate.set('hour', breakStart.hr).set('minute', breakStart.min).set('second', breakStart.sec);
                lastGapEnd = lastDate.set('hour', breakEnd.hr).set('minute', breakEnd.min).set('second', breakEnd.sec);


            } else if (workHours.shift_type == "Split") {
                const secondIn = parseTime(workHours.second_time_in);
                const secondOut = parseTime(workHours.second_time_out);

                dayEnd = currentDate.set('hour', secondOut.hr).set('minute', secondOut.min).set('second', secondOut.sec);
                dayGapStart = currentDate.set('hour', firstOut.hr).set('minute', firstOut.min).set('second', firstOut.sec);
                dayGapEnd = currentDate.set('hour', secondIn.hr).set('minute', secondIn.min).set('second', secondIn.sec);

                lastEnd = lastDate.set('hour', secondOut.hr).set('minute', secondOut.min).set('second', secondOut.sec);
                lastGapStart = lastDate.set('hour', firstOut.hr).set('minute', firstOut.min).set('second', firstOut.sec);
                lastGapEnd = lastDate.set('hour', secondIn.hr).set('minute', secondIn.min).set('second', secondIn.sec);
            }

            // Same Day Calculations
            if (fromDate.isSame(toDate, 'day')) {
                skipDay = excludeDate(currentDate);

                if (skipDay.excluded) {
                    if (skipDay.type == "Holiday") {
                        holidays++;
                    } else if (skipDay.type == "Weekend") {
                        weekends++;
                    }
                } else {
                    if (fromDate.isAfter(dayEnd) || toDate.isBefore(dayStart)) {
                        creditsUsed = 0;
                    } else {
                        affectedStart = dayjs.max(fromDate, dayStart);
                        affectedEnd = dayjs.min(toDate, dayEnd);

                        affectedTime = affectedEnd.diff(affectedStart, 'hour', true);

                        if (affectedStart.isBefore(dayGapStart) || affectedStart.isSame(dayGapStart)) {
                            if (affectedEnd.isAfter(dayGapEnd) || affectedEnd.isSame(dayGapEnd)) {
                                affectedTime -= dayGapEnd.diff(dayGapStart, 'hour', true);
                            } else if (affectedEnd.isAfter(dayGapStart)) {
                                affectedTime -= affectedEnd.diff(dayGapStart, 'hour', true);
                            }
                        } else if (affectedStart.isBetween(dayGapStart, dayGapEnd)) {
                            if (affectedEnd.isAfter(dayGapEnd)) {
                                affectedTime -= affectedEnd.diff(dayGapEnd, 'hour', true);
                            } else if (affectedEnd.isBetween(dayGapStart, dayGapEnd)) {
                                affectedTime = 0;
                            }
                        }
                        creditsUsed = affectedTime / workHours.total_hours;
                    }
                }
            } else {
                // Multiple Day Calculations
                while (currentDate.isBefore(toDate) || currentDate.isSame(toDate, 'day')) {
                    affectedTime = 0;

                    skipDay = excludeDate(currentDate);

                    // Weekend, Holiday Check
                    if (skipDay.excluded) {
                        if (skipDay.type == "Holiday") {
                            holidays++;
                        } else if (skipDay.type == "Weekend") {
                            weekends++;
                        }
                    } else {
                        if (currentDate.isAfter(fromDate, 'day') && currentDate.isBefore(toDate, 'day')) {
                            affectedTime = workHours.total_hours;
                            //console.log(`Full Day   ${affectedTime}`);
                        } else if (currentDate.isSame(fromDate, 'day') && !fromDate.isAfter(dayEnd)) {
                            affectedStart = dayjs.max(fromDate, dayStart);
                            affectedTime = dayEnd.diff(affectedStart, 'hour', true);

                            if (affectedStart.isBefore(dayGapStart)) {
                                affectedTime -= dayGapEnd.diff(dayGapStart, 'hour', true);
                            } else if (affectedStart.isBefore(dayGapEnd)) {
                                affectedTime -= dayGapEnd.diff(affectedStart, 'hour', true);
                            }
                            //console.log(`First Day  ${affectedTime}`);
                        } else if (currentDate.isSame(toDate, 'day') && !toDate.isBefore(lastStart)) {
                            affectedEnd = dayjs.min(toDate, lastEnd);
                            affectedTime = affectedEnd.diff(lastStart, 'hour', true);

                            if (affectedEnd.isAfter(lastGapEnd)) {
                                affectedTime -= lastGapEnd.diff(lastGapStart, 'hour', true);
                            } else if (affectedEnd.isAfter(lastGapStart)) {
                                affectedTime -= affectedEnd.diff(lastGapStart, 'hour', true);
                            }
                            //console.log(`Last Day   ${affectedTime}`)
                        }
                    }

                    creditsUsed += affectedTime / workHours.total_hours
                    currentDate = currentDate.add(1, 'day');
                }
            }
        }
        const updatedCount = Number(creditsUsed.toFixed(2));
        setWeekendCount(weekends);
        setHolidayCount(holidays);
        setLeaveUsed(updatedCount);
        setAvailableLeaveError(updatedCount > availableLeave);
    }, [fromDate, toDate]);

    // Time Parser
    const parseTime = (timeString) => {
        if (!timeString) return { hr: 0, min: 0, sec: 0 };
        const [hr, min, sec] = timeString.split(':').map(Number);
        return { hr, min, sec };
    };

    // Weekend, Holiday Exclusion
    const excludeDate = (date) => {
        if (holidayDates.includes(date.format('YYYY-MM-DD'))) {
            return { excluded: true, type: "Holiday" };
        } else {
            const day = date.day();
            return { excluded: day === 0 || day === 6, type: "Weekend" };
        }
    };

    // Form Error Notice
    const formError = (title, message) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: title,
            text: message,
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#177604",
        });
    }

    // Input Verification
    const checkInput = (event) => {
        event.preventDefault();

        // Requirement Checks
        setAppTypeError(!appType);
        setFromDateError(!fromDate);
        setToDateError(!fromDate);
        setDescriptionError(!description);

        if (fileRequired && (!attachment.length > 0) && (!image.length > 0)) {
            setFileError(true);
        } else {
            setFileError(false);
        }
        if (leaveUsed == 0) {
            setLeaveUsedError(true);
        } else {
            setLeaveUsedError(false);
        }

        if (!appType || !fromDate || !toDate || !description || (fileRequired && (!attachment.length > 0) && (!image.length > 0))) {
            formError(null, "All Required Fields must be filled!");
        } else if (leaveUsed == 0) {
            formError(null, "The selected range does not use any leave credits");
        } else if (availableLeaveError) {
            formError(null, "You do not have enough leave credits for this application");
        } else if (dateRangeError) {
            formError(null, "A date within range has reached the maximum amount of leaves allowed in your Department/Branch");
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to submit this application?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    // Final Submission
    const saveInput = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("type_id", appType);
        formData.append("from_date", fromDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("to_date", toDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append("description", description);
        formData.append("leave_used", leaveUsed);
        if (attachment.length > 0) {
            attachment.forEach(file => {
                formData.append('attachment[]', file);
            });
        }
        if (image.length > 0) {
            image.forEach(file => {
                formData.append('image[]', file);
            });
        }

        axiosInstance
            .post("/applications/saveApplication", formData, {
                headers,
            })
            .then((response) => {
                document.activeElement.blur();
                document.body.removeAttribute("aria-hidden");
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "Success!",
                    text: `Your application has been submitted!`,
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                }).then((res) => {
                    if (res.isConfirmed) {
                        close();
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

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '800px', marginBottom: '5%' }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Create Application </Typography>
                        <IconButton onClick={close}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" >
                        <Grid container columnSpacing={2} rowSpacing={3}>
                            {/* Application Type Selector */}
                            <Grid item xs={12} sx={{ mt: 1 }}>
                                <FormControl fullWidth>
                                    <TextField
                                        required
                                        select
                                        id="application-type"
                                        label="Application Type"
                                        value={appType}
                                        error={appTypeError || tenureshipError}
                                        onChange={(event) => handleTypeChange(event.target.value)}
                                        helperText={tenureshipError ? `You currently do not meet the tenureship requirement for this application. Your Tenureship: ${tenureship} month${tenureship > 1 ? s : ""}` : ""}
                                    >
                                        {applicationTypes
                                            .sort((a, b) => {
                                                const validTypesA = tenureship >= a.tenureship_required;
                                                const validTypesB = tenureship >= b.tenureship_required;
                                                if (validTypesA === validTypesB) return 0;
                                                return validTypesA ? -1 : 1;
                                            })
                                            .map((type, index) => (
                                                <MenuItem
                                                    key={index}
                                                    value={type.id}
                                                    sx={{ color: tenureship < type.tenureship_required ? 'grey' : 'inherit' }}
                                                >
                                                    {type.name}
                                                    {tenureship < type.tenureship_required &&
                                                        " (Requires tenureship of " + type.tenureship_required + " months)"}
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                </FormControl>
                            </Grid>
                            {/* From Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="From"
                                        value={fromDate}
                                        views={['year', 'month', 'day', 'hours']}
                                        onChange={(newValue) => validateDates(newValue, "From")}
                                        shouldDisableDate={(day) => {
                                            const dateString = day.format('YYYY-MM-DD');
                                            return fullDates.includes(dateString);
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: fromDateError || dateRangeError,
                                                readOnly: true,
                                                helperText: dateRangeError ? "A Date Within Range is Already Full" : "",
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* To Date */}
                            <Grid item xs={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DateTimePicker
                                        label="To"
                                        value={toDate}
                                        minDateTime={fromDate}
                                        views={['year', 'month', 'day', 'hours']}
                                        onChange={(newValue) => validateDates(newValue, "To")}
                                        shouldDisableDate={(day) => {
                                            const dateString = day.format('YYYY-MM-DD');
                                            return fullDates.includes(dateString);
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: toDateError || dateRangeError,
                                                readOnly: true,
                                                helperText: dateRangeError ? "A Date Within Range is Already Full" : "",
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            {/* Leave Credits */}
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Credits Used/Available"
                                        value={leaveUsed}
                                        error={leaveUsedError || availableLeaveError}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                `/${!availableLeave ? "0" : availableLeave}`
                                            )
                                        }}
                                        sx={{
                                            '& .MuiFormHelperText-root': {
                                                color: leaveUsedError ? "#f44336" : '#42a5f5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            },
                                        }}
                                        helperText={
                                            availableLeaveError ? `Credits used exceeds available credits`
                                                : leaveUsedError ? `No leave credits has been used`
                                                    : (holidayCount > 0 || weekendCount > 0) ? `${holidayCount > 0 ? `${holidayCount} Holiday${holidayCount > 1 ? 's' : ''}${weekendCount > 0 ? ', ' : ''}` : ''}${weekendCount > 0 ? `${weekendCount} Weekend${weekendCount > 1 ? 's' : ''}` : ''} excluded from count`
                                                        : ''
                                        }
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
                                        error={descriptionError}
                                        onChange={(event) => {
                                            if (
                                                event.target.value.length <= 512
                                            ) {
                                                setDescription(
                                                    event.target.value
                                                );
                                            }
                                        }}
                                        inputProps={{ maxLength: 512 }}
                                    />
                                    <FormHelperText>
                                        {description.length}/{512}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                            {/* Attachment Upload */}
                            <Grid item xs={12}>
                                {/* File Requirement */}
                                {fileError && <Typography variant="caption" color="error" sx={{ mb: 2 }}>
                                    You must include supporting files for this type of application!
                                </Typography>
                                }
                                <FormControl fullWidth>
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
                                                <Typography noWrap>
                                                    Documents
                                                </Typography>
                                                <input
                                                    accept=".doc, .docx, .pdf, .xls, .xlsx"
                                                    id="attachment-upload"
                                                    type="file"
                                                    name="attachment"
                                                    multiple
                                                    style={{ display: "none" }}
                                                    onChange={handleAttachmentUpload}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: "auto" }}
                                                    onClick={() => document.getElementById('attachment-upload').click()}
                                                >
                                                    <p className="m-0">
                                                        <i className="fa fa-plus"></i> Add
                                                    </p>
                                                </Button>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                mt: 1
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Max Limit: 5 Files, 10 MB Each
                                            </Typography>
                                            {attachment.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {/* Added Attachments */}
                                        {attachment.length > 0 && (
                                            <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                                {attachment.map((file, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        <Typography noWrap>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                        <IconButton onClick={() => handleDeleteAttachment(index)} size="small">
                                                            <Cancel />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </FormControl>
                            </Grid>
                            {/* Image Upload */}
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: '150px' }}>
                                                <Typography noWrap>
                                                    Images
                                                </Typography>
                                                <input
                                                    accept=".png, .jpg, .jpeg"
                                                    id="image-upload"
                                                    type="file"
                                                    name="image"
                                                    multiple
                                                    style={{ display: "none" }}
                                                    onChange={handleImageUpload}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: 'auto' }}
                                                    onClick={() => document.getElementById('image-upload').click()}
                                                >
                                                    <p className="m-0">
                                                        <i className="fa fa-plus"></i> Add
                                                    </p>
                                                </Button>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1}
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                mt: 1
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Max Limit: 10 Files, 5 MB Each
                                            </Typography>
                                            {image.length > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                                                    Remove
                                                </Typography>
                                            )}
                                        </Stack>
                                        {/* Added Images */}
                                        {image.length > 0 && (
                                            <Stack direction="column" spacing={1} sx={{ mt: 1, width: '100%' }}>
                                                {image.map((file, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        <Typography noWrap>{`${file.name}, ${getFileSize(file.size)}`}</Typography>
                                                        <IconButton onClick={() => handleDeleteImage(index)} size="small">
                                                            <Cancel />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </FormControl>
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                align="center"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
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
                                    <p className="m-0">
                                        <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}
                                        Submit Application{" "}
                                    </p>
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
