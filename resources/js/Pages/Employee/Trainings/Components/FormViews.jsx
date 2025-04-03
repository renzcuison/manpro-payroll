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
import { AccessTime, ArrowBack, CheckCircle, ExitToApp, Save } from "@mui/icons-material";
import { Form, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import FormItem from "./FormItem";


const FormViews = ({ content, formItems, attemptData, handleFormFinished, contentReload }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const formInfo = content.content;
    const [analyticView, setAnalyticView] = useState(false);
    const [submissionView, setSubmissionView] = useState(false);
    const durationInSeconds = (content?.duration || 15) * 60;
    const [formTimer, setFormTimer] = useState(durationInSeconds);
    const [viewType, setViewType] = useState('Overview');

    // Local Storage
    let attemptedQuiz = null;
    const storedAnswers = JSON.parse(localStorage.getItem('quizAnswerData')) || {};

    // UTILITY
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

    // Attempt Initialization
    useEffect(() => {
        attemptedQuiz = localStorage.getItem('quizAttempted');
        if (attemptedQuiz) {
            if (attemptedQuiz == content.id) {
                setViewType('Attempt');
            } else {
                setViewType('Overview');
            }
        }
    }, [content.id]); // Runs when content.id changes

    // EVENTS
    // Start Attempt
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
    };

    // Record Answer
    const handleAnswer = (id, answer) => {
        console.log(`Received Answer for Item ${id}: ${answer}`);
        const storedAnswers = JSON.parse(localStorage.getItem('quizAnswerData')) || {};
        storedAnswers[id] = answer;
        localStorage.setItem('quizAnswerData', JSON.stringify(storedAnswers));
    };

    // Time Expired
    const handleTimerEnd = () => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Time's Up!",
            text: "Your answers will be automatically submitted.",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Continue",
            confirmButtonColor: "#177604",
        }).then((res) => {
            saveSubmission();
        });
    };

    // Final Submissions
    const handleSubmission = (event) => {
        event.preventDefault();

        const hasUnanswered = formItems.some(item => {
            const answer = storedAnswers[item.id];
            return !(item.id in storedAnswers) ||
                (item.type === 'MultiSelect' && Array.isArray(answer) && answer.length === 0);
        });
        const message = hasUnanswered
            ? "There are unanswered items. Are you sure you want to submit your attempt?"
            : "Are you sure you want to submit your attempt?";

        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Confirm Submission?",
            text: message,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Submit",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Return to Review",
            cancelButtonColor: "#f57c00",
        }).then((res) => {
            if (res.isConfirmed) {
                saveSubmission();
            }
        });
    };

    const saveSubmission = () => {

        const formData = new FormData();
        // Form Data
        formData.append("content_id", content.id);
        formData.append("form_id", formInfo.id);
        formData.append("remaining_time", formTimer);
        formData.append("duration", content.duration);
        // Answers
        formData.append("answers", JSON.stringify(storedAnswers));

        // Start-Submission Time
        formData.append("attempt_start_time", localStorage.getItem('quizStartTime') || null);
        formData.append("submission_time", dayjs().toISOString());

        axiosInstance.post("/trainings/saveEmployeeFormSubmission", formData, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: "Attempt submitted successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        document.body.setAttribute("aria-hidden", "true");
                        localStorage.removeItem('quizAttempted');
                        localStorage.removeItem('quizStartTime');
                        localStorage.removeItem('quizViewType');
                        localStorage.removeItem('quizAnswerData');
                        setViewType('Overview');

                        // Form Clear Conditions
                        const allAttempts = !formInfo.require_pass && (((attemptData?.response_count ?? 0) + 1) == formInfo.attempts_allowed);
                        if (response.data.passed || allAttempts) {
                            handleFormFinished(content.id, true);
                        }
                        contentReload(content.id);
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    // TIMER FUNCTIONS
    // Timer Initializer
    useEffect(() => {
        setFormTimer(calculateRemainingTime());
    }, [durationInSeconds]);

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
                clearInterval(timerInterval);
            } else {
                setFormTimer(remainingTime);
            }
        }, 1000);

        return () => clearInterval(timerInterval); // Cleanup (Unmount, View Change)
    }, [viewType, durationInSeconds, formTimer]);

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
                                    {formInfo.require_pass ? "Availability" : "Attempt Limit"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    {formInfo.require_pass ? "Until Passed" : `${formInfo.attempts_allowed} attempt/s` ?? "N/A"}
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
                                    {formItems.length}
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
                                    {formItems.reduce((sum, item) => sum + (item.value || 0), 0)}
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
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    {/* Form Result Summary / Form Start Prompt */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                            Answer Form
                        </Typography>
                        <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                            {attemptData?.status == "Finished" ? (
                                <Typography sx={{ color: "text.secondary" }}>
                                    {attemptData?.responses?.some(response => response.passed)
                                        ? "You have successfully completed this form."
                                        : "You have reached the maximum number of attempts for this form."}
                                </Typography>
                            ) : (
                                <>
                                    <Typography sx={{ color: "text.secondary" }}>
                                        {formInfo.require_pass ? "The timer will start counting down once the attempt starts"
                                            : "An attempt will be used, and the timer will start counting down once the attempt starts."}
                                    </Typography>
                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                        {!formInfo.require_pass ? (
                                            <>
                                                <Typography sx={{ color: "text.secondary" }}>
                                                    Attempts Remaining:
                                                </Typography>
                                                <Typography sx={{ mx: 1, fontWeight: "bold" }}>
                                                    {formInfo.attempts_allowed - (attemptData?.response_count ?? 0)}
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
                                </>
                            )}
                        </Box>
                    </Grid>
                </>
            );
        case 'Attempt':
            return (
                <>
                    {/* Attempt Count */}
                    <Grid item xs={3}>
                        <Box
                            display="flex"
                            sx={{
                                width: "100%",
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
                                {`${(attemptData?.response_count ?? 0) + 1} ${formInfo.require_pass ? '' : ` of ${formInfo.attempts_allowed}`}`}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Item Count */}
                    <Grid item xs={3}>
                        <Box
                            display="flex"
                            sx={{
                                width: "100%",
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                No. of Items
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                {formItems.length}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Passing Score*/}
                    <Grid item xs={3}>
                        <Box
                            display="flex"
                            sx={{
                                width: "100%",
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Passing Score
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                {`${formInfo.passing_score}%`}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Timer */}
                    <Grid item xs={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
                        <Box
                            display="flex"
                            sx={{
                                py: 1,
                                pl: 1,
                                pr: 2,
                                bgcolor: getTimerColor(),
                                color: "white",
                                fontWeight: "bold",
                                borderRadius: "12px",
                                boxShadow: formTimer < 60
                                    ? '0 0 12px 4px rgba(244, 67, 54, 0.8)'
                                    : formTimer < 300
                                        ? '0 0 8px 2px rgba(245, 124, 0, 0.5)'
                                        : 'none'
                            }}
                        >
                            <AccessTime />
                            <Typography sx={{ ml: 1, fontWeight: "bold" }}>
                                {formatTimer(formTimer)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ mt: 1 }} />
                    </Grid>
                    {/* Form Items and Submission */}
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
                            {/* Form Items */}
                            <Grid container spacing={2}>
                                {formItems.map((item, index) => (
                                    <Grid item xs={12} key={index}>
                                        <FormItem
                                            itemData={item}
                                            handleAnswer={handleAnswer}
                                            storedAnswer={storedAnswers[item.id]}
                                            submissionView={submissionView}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Divider sx={{ mt: 2 }} />
                            {/* Submission Buttons */}
                            <Box sx={{ p: 3, mb: 5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                    Submit Answers
                                </Typography>
                                <Box display="flex" sx={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                    {submissionView ? (
                                        <>
                                            <Typography sx={{ color: "text.secondary" }}>
                                                Review your answers before submitting. This will finalize your attempt and calculate your results.
                                            </Typography>
                                            <Box display="flex" sx={{ alignItems: "center", mt: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => setSubmissionView(false)}
                                                    sx={{ ml: 1, backgroundColor: "#f57c00" }}
                                                    startIcon={<ArrowBack />}
                                                >
                                                    Return to Attempt
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSubmission}
                                                    sx={{ ml: 1, backgroundColor: "#177604" }}
                                                    startIcon={<CheckCircle />}
                                                >
                                                    Submit Attempt
                                                </Button>
                                            </Box>
                                        </>
                                    ) : (
                                        <>
                                            <Typography sx={{ color: "text.secondary" }}>
                                                Save your progress or submit when ready. Results will be calculated upon submission.
                                            </Typography>
                                            <Box display="flex" sx={{ alignItems: "center", mt: 1 }}>
                                                {/* Force Exit Button (TEMPORARY, REMOVE LATER) */}
                                                <Button
                                                    variant="contained"
                                                    onClick={handleTimerEnd}
                                                    sx={{ ml: 1, backgroundColor: "#d32f2f" }}
                                                    startIcon={<ExitToApp />}
                                                >
                                                    End Attempt (Temp)
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => setSubmissionView(true)}
                                                    sx={{ ml: 1, backgroundColor: "#177604" }}
                                                    startIcon={<Save />}
                                                >
                                                    Review & Submit
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </Box>
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
