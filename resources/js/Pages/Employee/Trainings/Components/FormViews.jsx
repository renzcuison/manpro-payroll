import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Pagination,
    IconButton,
    Divider,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Tooltip,
    CardActionArea
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import FormItem from "./FormItem";


const FormViews = ({ content, viewType, setViewType, formItems, attemptData }) => {

    const formData = content.content;
    const [analyticView, setAnalyticView] = useState(false);

    // Attempted Form Loaders
    let attemptedQuiz = null;
    if (localStorage.getItem('quizAttempted')) {
        attemptedQuiz = localStorage.getItem('quizAttempted');
        if (attemptedQuiz == content.id) {
            setViewType('Attempt');
        } else {
            setViewType('Overview');
        }
    }

    // START ATTEMPT
    const handleAttemptStart = () => {
        const ongoingQuiz = localStorage.getItem('quizAttempted');
        if (ongoingQuiz && ongoingQuiz != content.id) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Invalid Action!",
                text: "You are still answering another form!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Start Attempt?",
                text: `An attempt will be used. You will have ${content.duration} minutes to finish this form.`,
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Start",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    setViewType('Attempt');
                    localStorage.setItem('quizAttempted', content.id);
                }
            });
        }
    }

    // TIMER FUNCTIONS
    const durationInSeconds = (content?.duration || 15) * 60;

    // Remaining Time
    const calculateRemainingTime = () => {
        const storedStartTime = localStorage.getItem('quizStartTime');
        if (storedStartTime) {
            const startTime = dayjs(storedStartTime);
            const currentTime = dayjs();
            const elapsedSeconds = currentTime.diff(startTime, 'second');
            const remainingTime = durationInSeconds - elapsedSeconds;
            return remainingTime >= 0 ? remainingTime : 0;
        }
        return durationInSeconds; // If no start time, return full duration
    };

    const [formTimer, setFormTimer] = useState(calculateRemainingTime());

    // Countdown Logic
    useEffect(() => {
        if (viewType !== 'Attempt') return; // Only run timer during Attempt view

        // New Attempt
        if (formTimer === durationInSeconds && !localStorage.getItem('quizStartTime')) {
            localStorage.setItem('quizStartTime', dayjs().toISOString());
            setFormTimer(durationInSeconds);
        }

        // Timer Expired on Load
        if (formTimer === 0) {
            handleTimerEnd();
            return;
        }

        // Timer Updates
        const timerInterval = setInterval(() => {
            const storedStartTime = localStorage.getItem('quizStartTime');
            if (!storedStartTime) return; // Safety check

            const startTime = dayjs(storedStartTime); // Parse stored start time
            const currentTime = dayjs(); // Current time
            const elapsedSeconds = currentTime.diff(startTime, 'second'); // Calculate elapsed seconds
            const remainingTime = durationInSeconds - elapsedSeconds;

            if (remainingTime <= 0) {
                setFormTimer(0);
                handleTimerEnd();
                clearInterval(timerInterval);
            } else {
                setFormTimer(remainingTime);
            }
        }, 1000);

        return () => clearInterval(timerInterval); // Cleanup (Unmount, View Change)
    }, [viewType, durationInSeconds, setViewType, formTimer]);

    // Timer Renderers
    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (formTimer < 60) return '#f44336'; // Red (< 1 min)
        if (formTimer < 300) return '#f57c00'; // Orange (< 5 min)
        return '#177604'; // Green
    };

    // Timer Expiry Handler
    const handleTimerEnd = () => {
        console.log('Time is up! Automatically submitting quiz attempt...');
        setViewType('Overview');
        // Clear localStorage to reset the quiz state
        localStorage.removeItem('quizAttempted');
        localStorage.removeItem('quizStartTime');
        localStorage.removeItem('quizViewType');
        localStorage.removeItem('quizAnswerData');
    };

    // ANSWER HANDLING
    const handleAnswer = (id, answer) => {
        console.log(`Received Answer for Item ${id}: ${answer}`);
    }

    switch (viewType) {
        case 'Overview':
            return (
                <>
                    {/* Primary Details */}
                    <Grid item container xs={12} spacing={2}>
                        {/* Availability */}
                        <Grid item xs={6}>
                            <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: "4px", backgroundColor: "#f5f5f5" }}>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {formData.require_pass ? "Availability" : "Attempt Limit"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    {formData.require_pass ? "Until Passed" : `${formData.attempts_allowed} attempt/s` ?? "N/A"}
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Duration */}
                        <Grid item xs={6}>
                            <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: "4px", backgroundColor: "#f5f5f5" }}>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {"Attempt Duration"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    {`${content.duration} minute${content.duration > 1 ? 's' : ''}`}
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Item Count */}
                        <Grid item xs={3}>
                            <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: "4px", backgroundColor: "#f5f5f5" }}>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {"Item Count"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    {20}
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Total Points */}
                        <Grid item xs={3}>
                            <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: "4px", backgroundColor: "#f5f5f5" }}>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {"Total Points"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    {50}
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Passing Score */}
                        <Grid item xs={3}>
                            <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: "4px", backgroundColor: "#f5f5f5" }}>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {"Passing Score"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    {`${64}%`}
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Button */}
                        <Grid item xs={3} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setAnalyticView(!analyticView)}
                                sx={{ ml: 1 }}
                            >
                                <p className="m-0">
                                    {`${analyticView ? "Hide" : "Show"} Attempt Data`}
                                </p>
                            </Button>
                        </Grid>
                        {/* Analytics */}
                        {analyticView && (
                            <>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                                <Grid item container xs={12}>
                                    <Grid item xs={12}>
                                        {`[INSERT ATTEMPT ANALYTICS HERE]`}
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    {/* Description */}
                    <Grid item xs={12} >
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                            Description
                        </Typography>
                        <div
                            id="description"
                            style={{
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }}
                            dangerouslySetInnerHTML={{ __html: content.description }}
                        />
                    </Grid>
                    {/* Form Start Prompt */}
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                            Answer Form
                        </Typography>
                        <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ color: "text.secondary" }}>
                                {formData.require_pass ? "The timer will start counting down once the attempt starts"
                                    : "An attempt will be used, and the timer will start counting down once the attempt starts."}
                            </Typography>
                            <Box display="flex" sx={{ alignItems: "center" }}>
                                {!formData.require_pass ? (
                                    <>
                                        <Typography sx={{ color: "text.secondary" }}>
                                            Attempts Remaining:
                                        </Typography>
                                        <Typography sx={{ mx: 1, fontWeight: "bold" }}>
                                            {3}
                                        </Typography>
                                    </>
                                ) : null}
                                <Button
                                    variant="contained"
                                    onClick={() => handleAttemptStart()}
                                    sx={{ ml: 1, backgroundColor: "#177604" }}
                                >
                                    <p className="m-0">
                                        Start Attempt
                                    </p>
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </>
            );
        case 'Attempt':
            return (
                <>
                    {/* Attempt Count */}
                    <Grid item xs={4}>
                        <Box
                            display="flex"
                            sx={{
                                width: { xs: '100%', sm: '50%' },
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Attempt No.
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                {`${1}${formData.require_pass ? '' : ` of ${formData.attempts_allowed}`}`}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Timer */}
                    <Grid item xs={8} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
                        <Chip
                            icon={<AccessTime />}
                            label={formatTimer(formTimer)}
                            sx={{
                                bgcolor: getTimerColor(),
                                color: 'white',
                                fontWeight: 'bold',
                                '& .MuiChip-icon': {
                                    color: 'white',
                                },
                            }}
                            aria-label={`Remaining time: ${formatTimer(formTimer)}`}
                        />
                    </Grid>
                    {/* Form Exit Button (TEMPORARY, REMOVE LATER) */}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={() => handleTimerEnd()}
                            sx={{
                                mt: 2,
                                backgroundColor: '#177604',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: 2,
                                textTransform: 'none',
                                py: 1,
                                '&:hover': {
                                    backgroundColor: '#135f03',
                                    boxShadow: 3,
                                },
                            }}
                            aria-label="Back to overview"
                        >
                            Back to Overview (Test)
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                    </Grid>
                    {/* Form Items */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                maxHeight: '690px',
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#888',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    background: '#555',
                                },
                            }}
                        >
                            <Grid container spacing={2}>
                                {formItems.map((item, index) => (
                                    <Grid item xs={12} key={index}>
                                        <FormItem
                                            itemData={item}
                                            handleAnswer={handleAnswer}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </>
            );
        case 'Results':
            return (<></>);
        case 'Review':
            return (<></>);
        default:
            return (<></>);
    }
};

export default FormViews;
