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
    CardActionArea,
    Paper,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { AccessTime, ArrowBack, CheckCircle, ExitToApp, Save, BarChart, Assessment, History, Grading } from "@mui/icons-material";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { Gauge, LineChart, gaugeClasses, areaElementClasses } from '@mui/x-charts';
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import FormItem from "./FormItem";
import InfoBox from "../../../../components/General/InfoBox";
import ReviewItem from "./ReviewItem";


const FormViews = ({ content, formItems, attemptData, handleFormFinished, contentReload }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const theme = useTheme();
    const medScreen = useMediaQuery(theme.breakpoints.up('md'));

    const formInfo = content.content;
    const [analyticView, setAnalyticView] = useState(false);
    const [submissionView, setSubmissionView] = useState(false);

    const durationInSeconds = (content?.duration || 15) * 60;
    const [formTimer, setFormTimer] = useState(durationInSeconds);
    const [viewType, setViewType] = useState('Overview');

    const [overviewReload, setOverviewReload] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [reviewData, setReviewData] = useState(null);
    const totalPoints = formItems.reduce((sum, item) => sum + (item.value || 0), 0);

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

    const formatDuration = (seconds) => {
        const roundedSeconds = Math.round(seconds);
        const hours = Math.floor(roundedSeconds / 3600);
        const minutes = Math.floor((roundedSeconds % 3600) / 60);
        const secs = roundedSeconds % 60;
        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0 || hours > 0) result += `${minutes}m `;
        result += `${secs}s`;
        return result.trim();
    };

    // View Initialization
    useEffect(() => {
        attemptedQuiz = localStorage.getItem('quizAttempted');
        if (attemptedQuiz) {
            if (attemptedQuiz == content.id) {
                setViewType('Attempt');
            }
        }
    }, [content.id]);

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

                        const resData = response.data.results;
                        // Results Page Prep
                        setViewType('Results');
                        setOverviewReload(true);
                        setResultData(resData);

                        // Form Clear Conditions
                        const allAttempts = !formInfo.require_pass && (((attemptData?.response_count ?? 0) + 1) == formInfo.attempts_allowed);
                        if (resData.passed || allAttempts) {
                            handleFormFinished(content.id, true);
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    // Attempt Review
    const handleAttemptReview = (id, attemptNo) => {
        axiosInstance.get(`/trainings/getEmployeeFormReviewer`, { headers, params: { attempt_id: id, form_id: content.training_form_id } })
            .then((response) => {
                if (response.data.status === 200) {
                    const revData = response.data.review_data;
                    const newRevData = {
                        ...revData,
                        attempt_number: attemptNo
                    };
                    console.log(revData);
                    setReviewData(newRevData);
                    setViewType('Review');
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
                    <Grid container size={{ xs: 12 }} spacing={2}>
                        {/* Availability */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InfoBox
                                title={formInfo.require_pass ? 'Availability' : 'Attempt Limit'}
                                info={
                                    formInfo.require_pass
                                        ? 'Until Passed'
                                        : `${formInfo.attempts_allowed} attempt${formInfo.attempts_allowed > 1 ? 's' : ''}`
                                }
                            />
                        </Grid>
                        {/* Duration */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InfoBox
                                title="Attempt Duration"
                                info={`${content.duration} minute${content.duration > 1 ? 's' : ''}`}
                            />
                        </Grid>
                        {/* Item Count */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <InfoBox
                                title="Item Count"
                                info={formItems.length}
                            />
                        </Grid>
                        {/* Total Points */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <InfoBox
                                title="Total Points"
                                info={totalPoints}
                            />
                        </Grid>
                        {/* Passing Score */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <InfoBox
                                title="Passing Score"
                                info={`${formInfo.passing_score}%`}
                            />
                        </Grid>
                        {/* Button */}
                        <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                                <Grid size={{ xs: 12 }}>
                                    <Divider />
                                </Grid>
                                <Grid container size={{ xs: 12 }} spacing={2}>
                                    {/* Attempt Count */}
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)', // Shadow for elevation 1
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                height: 180,
                                                transition: 'transform 0.2s ease',
                                                '&:hover': {
                                                    transform: 'scale(0.95)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                                                    <BarChart sx={{ mr: 1, color: 'text.secondary', width: 28, height: 28 }} />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.5px' }}
                                                    >
                                                        Attempt Count
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                                                    <Typography
                                                        variant="h3"
                                                        sx={{ fontWeight: 700, color: '#177604', mb: 1, letterSpacing: '-0.5px' }}
                                                    >
                                                        {attemptData?.response_count ?? 0}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    {/* Average Score */}
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                height: 180,
                                                transition: 'transform 0.2s ease',
                                                '&:hover': {
                                                    transform: 'scale(0.95)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100%', }} >
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Assessment sx={{ mr: 1, color: 'text.secondary', width: 28, height: 28 }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.5px', }} >
                                                        Avg. Score
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, }} >
                                                    <Gauge
                                                        value={(attemptData?.response_count ?? 0) === 0 ? 0 : Number((attemptData?.average_score ?? 0).toFixed(1))}
                                                        valueMax={totalPoints}
                                                        height={140}
                                                        width={140}
                                                        cornerRadius="8px"
                                                        sx={(theme) => ({
                                                            [`& .${gaugeClasses.valueText}`]: {
                                                                fontSize: 20,
                                                                fontWeight: "bold",
                                                                fill: "text.secondary"
                                                            },
                                                            [`& .${gaugeClasses.valueArc}`]: {
                                                                fill: (attemptData?.average_score ?? 0) >= (totalPoints * 0.75) ? '#177604'
                                                                    : (attemptData?.average_score ?? 0) >= (totalPoints * 0.50) ? '#e9ae20'
                                                                        : (attemptData?.average_score ?? 0) >= (totalPoints * 0.25) ? '#f57c00'
                                                                            : '#f44336'
                                                            },
                                                            [`& .${gaugeClasses.referenceArc}`]: {
                                                                fill: `#e0e0e0`
                                                            },
                                                        })}
                                                        margin={{ top: 0 }}
                                                        startAngle={-110}
                                                        endAngle={110}
                                                        innerRadius="70%"
                                                        outerRadius="100%"
                                                        text={({ value }) => `${value}pt${value > 1 ? 's' : ''}`}
                                                    />
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    {/* Average Duration */}
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                height: 180,
                                                transition: 'transform 0.2s ease',
                                                '&:hover': {
                                                    transform: 'scale(0.95)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100%', }} >
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }} >
                                                    <AccessTime sx={{ mr: 1, color: 'text.secondary', width: 28, height: 28 }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.5px', }} >
                                                        Avg. Duration
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, }} >
                                                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#177604', mb: 1, letterSpacing: '-0.5px', }} >
                                                        {(attemptData?.response_count ?? 0) == 0 ? "-" : formatDuration(attemptData?.average_duration ?? 0)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    {/* Attempt History */}
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box
                                            sx={{
                                                height: 180,
                                                border: "solid 1px #e0e0e0",
                                                borderRadius: "8px",
                                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
                                                overflowY: 'auto',
                                                overflowX: 'hidden',
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: '#777 #f5f5f5',
                                                '&::-webkit-scrollbar': {
                                                    width: '6px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: '#777',
                                                    borderRadius: '3px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    backgroundColor: '#f5f5f5',
                                                },
                                            }}
                                        >
                                            {attemptData?.responses?.length > 0 ? (
                                                <Table
                                                    stickyHeader
                                                    size="small"
                                                    sx={{
                                                        tableLayout: 'fixed',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ pl: 1, width: '65%', fontWeight: 'bold' }}>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    Attempt Date
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ width: '35%', fontWeight: 'bold' }}>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    Score
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {attemptData.responses.map((response, index) => (
                                                            <TableRow
                                                                key={index}
                                                                onClick={() => handleAttemptReview(response.id, (index + 1))}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    transition: "background-color 0.3s ease",
                                                                    '&:hover': {
                                                                        backgroundColor: "#f5f5f5"
                                                                    }
                                                                }}
                                                            >
                                                                <TableCell
                                                                    sx={{
                                                                        width: '65%',
                                                                        whiteSpace: 'normal',
                                                                        wordBreak: 'break-word',
                                                                        p: 1,
                                                                    }}
                                                                >
                                                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                                        {dayjs(response.created_at).format('MM/DD/YYYY hh:mm A')}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell
                                                                    sx={{
                                                                        width: '35%',
                                                                        whiteSpace: 'normal',
                                                                        wordBreak: 'break-word',
                                                                        p: 1,
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: '12px',
                                                                            backgroundColor: response.passed ? '#e8f5e9' : "#ffebee",
                                                                            color: response.passed ? '#2e7d32' : "#d32f2f",
                                                                            fontSize: '0.875rem',
                                                                            fontWeight: 'bold',
                                                                            textAlign: 'center',
                                                                        }}
                                                                    >
                                                                        {`${response.score} pt${response.score > 1 ? 's' : ''}`}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 'calc(180px - 48px)' }}>
                                                    No attempts recorded
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Divider />
                    </Grid>
                    {/* Description */}
                    <Grid size={{ xs: 12 }} >
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                            Description
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }}
                            dangerouslySetInnerHTML={{ __html: content.description }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Divider />
                    </Grid>
                    {/* Form Result Summary / Form Start Prompt */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                            Answer Form
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            {attemptData?.status === "Finished" ? (
                                <Grid size={{ xs: 12 }}>
                                    <Typography sx={{ color: "text.secondary" }}>
                                        {attemptData?.responses?.some(response => response.passed)
                                            ? "You have successfully completed this form."
                                            : "You have reached the maximum number of attempts for this form."}
                                    </Typography>
                                </Grid>
                            ) : (
                                <>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography sx={{
                                            color: "text.secondary",
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word",
                                            lineHeight: 1.5,
                                        }}>
                                            {formInfo.require_pass
                                                ? "The timer will start counting down once the attempt starts"
                                                : "An attempt will be used, and the timer will start counting down once the attempt starts."}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }} container spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }} alignItems="center">
                                        {!formInfo.require_pass && (
                                            <Grid size={{ xs: 12, sm: "auto" }}>
                                                <Typography sx={{ color: "text.secondary" }}>
                                                    Attempts Remaining:
                                                    <Typography component="span" sx={{ ml: 1, fontWeight: "bold" }}>
                                                        {formInfo.attempts_allowed - (attemptData?.response_count ?? 0)}
                                                    </Typography>
                                                </Typography>
                                            </Grid>
                                        )}
                                        <Grid size={{ xs: 12, md: "auto" }}>
                                            <Box display="flex" sx={{ width: "100%", justifyContent: "center" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleAttemptStart()}
                                                    sx={{ backgroundColor: "#177604" }}
                                                >
                                                    Start Attempt
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Grid>
                </>
            );
        case 'Attempt':
            return (
                <>
                    {/* Attempt Count */}
                    <Grid size={{ xs: 6, md: 3 }} sx={{ py: { xs: 1, md: 0 } }}>
                        <InfoBox
                            title="Attempt No."
                            info={`${(attemptData?.response_count ?? 0) + 1} ${formInfo.require_pass ? '' : ` of ${formInfo.attempts_allowed}`}`}
                            clean={!medScreen}
                        />
                    </Grid>
                    {medScreen && (
                        <>
                            {/* Item Count */}
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InfoBox
                                    title='No. of Items'
                                    info={formItems.length}
                                />
                            </Grid>
                            {/* Passing Score*/}
                            <Grid size={{ xs: 12, md: 3 }}>
                                <InfoBox
                                    title='Passing Score'
                                    info={`${formInfo.passing_score}%`}
                                />
                            </Grid>
                        </>
                    )}
                    {/* Timer */}
                    <Grid size={{ xs: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Box
                            display="flex"
                            sx={{
                                pt: 1,
                                pb: { xs: 0, md: 1 },
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
                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ mt: 1 }} />
                    </Grid>
                    {/* Form Items and Submission */}
                    <Grid size={{ xs: 12 }}>
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
                                    <Grid size={{ xs: 12 }} key={index}>
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
                            <Grid container spacing={2} sx={{ p: 3, mb: 5 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                        Submit Answers
                                    </Typography>
                                </Grid>
                                {submissionView ? (
                                    <>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                            <Typography
                                                sx={{
                                                    color: "text.secondary",
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                    overflowWrap: "break-word",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                Review your answers before submitting. This will finalize your attempt and calculate your results.
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            size={{ xs: 12, md: 4 }}
                                            container
                                            spacing={1}
                                            justifyContent={{ xs: "flex-start", md: "flex-end" }}
                                            alignItems="center"
                                        >
                                            <Grid size={{ xs: 12, sm: "auto" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => setSubmissionView(false)}
                                                    sx={{ width: { xs: "100%", sm: "auto" }, backgroundColor: "#f57c00" }}
                                                    startIcon={<ArrowBack />}
                                                    aria-label="Return to attempt"
                                                >
                                                    Return to Attempt
                                                </Button>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: "auto" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSubmission}
                                                    sx={{ width: { xs: "100%", sm: "auto" }, backgroundColor: "#177604" }}
                                                    startIcon={<CheckCircle />}
                                                    aria-label="Submit attempt"
                                                >
                                                    Submit Attempt
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                ) : (
                                    <>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                            <Typography
                                                sx={{
                                                    color: "text.secondary",
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                    overflowWrap: "break-word",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                Save your progress or submit when ready. Results will be calculated upon submission.
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            size={{ xs: 12, md: 4 }}
                                            container
                                            spacing={1}
                                            justifyContent={{ xs: "flex-start", md: "flex-end" }}
                                            alignItems="center"
                                        >
                                            <Grid size={{ xs: 12, sm: "auto" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => setSubmissionView(true)}
                                                    sx={{ width: { xs: "100%", sm: "auto" }, backgroundColor: "#177604" }}
                                                    startIcon={<Save />}
                                                    aria-label="Review and submit"
                                                >
                                                    Review & Submit
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Box>
                    </Grid>
                </>
            );
        case 'Results':
            return (
                <Grid container size={{ xs: 12 }} spacing={2} sx={{ mb: { xs: 4, mb: 2 } }}>
                    {/* Score Meter, Interactions */}
                    <Grid container size={{ xs: 12, md: 5 }} spacing={2}>
                        {/* Score Meter */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                Result
                            </Typography>
                            <Grid container>
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ width: "100%", placeItems: "center" }}>
                                        <Gauge
                                            value={resultData.score_percentage}
                                            height={250}
                                            width={300}
                                            cornerRadius="8px"
                                            sx={(theme) => ({
                                                [`& .${gaugeClasses.valueText}`]: {
                                                    fontSize: 32,
                                                    fontWeight: "bold",
                                                    fill: "text.secondary",
                                                },
                                                [`& .${gaugeClasses.valueArc}`]: {
                                                    fill: resultData?.passed ? '#177604' : '#f44336',
                                                },
                                                [`& .${gaugeClasses.referenceArc}`]: {
                                                    fill: `#e0e0e0`,
                                                },
                                            })}
                                            startAngle={-110}
                                            endAngle={110}
                                            innerRadius="70%"
                                            outerRadius="100%"
                                            text={({ value }) => `${Math.round(value)}%`}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* Score Information and Interactions */}
                        <Grid size={{ xs: 12 }}>
                            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 5 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" align="center">
                                        {`You scored ${resultData.total_score} out of ${resultData.total_points}`}
                                    </Typography>
                                    <Typography variant="h6" align="center">
                                        {`The passing score is ${formInfo.passing_score}%`}
                                    </Typography>
                                </Grid>
                                <Grid
                                    size={{ xs: 12 }}
                                    container
                                    spacing={1}
                                    justifyContent={{ xs: "center", sm: "flex-end" }}
                                    alignItems="center"
                                >
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Box display="flex" sx={{ width: "100%", placeItems: "center" }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleAttemptReview(resultData.reviewer_num, ((attemptData?.response_count ?? 0) + 1))}
                                                sx={{ width: "100%", backgroundColor: "#177604" }}
                                                startIcon={<Grading />}
                                                aria-label="Review attempt"
                                            >
                                                Review Attempt
                                            </Button>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Box display="flex" sx={{ width: "100%", placeItems: "center" }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => contentReload(content.id)}
                                                sx={{ width: "100%", backgroundColor: "#f57c00" }}
                                                startIcon={<ExitToApp />}
                                                aria-label="Return to overview"
                                            >
                                                Return to Overview
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* Attempt Data */}
                    <Grid container size={{ xs: 12, md: 7 }} spacing={2}>
                        {/* Current Attempt */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                Attempt Data
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <InfoBox title="Attempt No." info={((attemptData?.response_count ?? 0) + 1)} clean={!medScreen} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <InfoBox title="Duration" info={formatDuration(resultData.duration)} clean={!medScreen} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <InfoBox title="Missed Items" info={resultData.empty_answers} clean={!medScreen} />
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* Attempt History */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                Attempt History
                            </Typography>
                            <Grid container justifyContent="center" alignItems="center">
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ width: "100%", overflow: "hidden" }}>
                                        <LineChart
                                            xAxis={[
                                                {
                                                    data: [
                                                        0,
                                                        ...attemptData.responses.map((_, index) => index + 1),
                                                        attemptData.responses.length + 1,
                                                    ],
                                                    valueFormatter: (value) => {
                                                        if (value === 0) {
                                                            return "-";
                                                        }
                                                        if (value === attemptData.responses.length + 1) {
                                                            return dayjs(resultData.created_at).format('MM/DD/YYYY \nhh:mm A');
                                                        }
                                                        return dayjs(attemptData.responses[value - 1].created_at).format('MM/DD/YYYY \nhh:mm A');
                                                    },
                                                    label: 'Attempt',
                                                    labelStyle: {
                                                        transform: 'translateY(25px)',
                                                    },
                                                    tickMinStep: 1,
                                                },
                                            ]}
                                            yAxis={[
                                                {
                                                    label: 'Score (pts)',
                                                    max: resultData.total_points,
                                                },
                                            ]}
                                            series={[
                                                {
                                                    curve: "monotoneX",
                                                    data: [
                                                        0,
                                                        ...attemptData.responses.map(response => response.score),
                                                        resultData.total_score,
                                                    ],
                                                    color: '#177604',
                                                    area: true,
                                                    valueFormatter: (value) => {
                                                        return `${value} pt${value > 1 ? 's' : ''}`;
                                                    },
                                                },
                                            ]}
                                            grid={{ horizontal: true }}
                                            height={300}
                                            margin={{ left: 50, top: 10, bottom: 50, right: 50 }}
                                            sx={{
                                                width: "100%",
                                                [`& .${areaElementClasses.root}`]: {
                                                    fill: 'rgba(23, 118, 4, 0.8)',
                                                },
                                                '& .MuiLineElement-root': {
                                                    strokeWidth: 3,
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            );
        case 'Review':
            return (

                <Grid container size={{ xs: 12 }} spacing={2}>
                    {/* Header */}
                    <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                    Attempt Review
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }} container justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                                <Grid size={{ xs: 12, sm: "auto" }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            if (overviewReload) {
                                                contentReload(content.id);
                                            } else {
                                                setViewType('Overview');
                                            }
                                        }}
                                        sx={{ width: { xs: "100%", sm: "auto" }, backgroundColor: "#f57c00" }}
                                        startIcon={<ExitToApp />}
                                        aria-label="Return to overview"
                                    >
                                        Return to Overview
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* Attempt Number */}
                    <Grid size={{ xs: 12, sm: 2, md: 1 }}>
                        <Box
                            sx={{
                                p: 1,
                                height: 100,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
                                Attempt
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: "bold", color: "#177604" }}>
                                {reviewData.attempt_number}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Submission Details */}
                    <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                        <Box sx={{ height: 100, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                            <Box sx={{ px: 2, py: 0.5, borderBottom: "1px solid #e0e0e0" }}>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Submission Details
                                </Typography>
                            </Box>
                            <Grid sx={{ p: 2, pt: 1 }}>
                                <Grid size={{ xs: 12 }}>
                                    <InfoBox
                                        title="Submitted On"
                                        info={dayjs(reviewData.submit_time).format('MMM DD, YYYY hh:mm A')}
                                        clean
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ mt: { xs: 0, md: 1 } }}>
                                    <InfoBox
                                        title="Time Taken"
                                        info={formatDuration(reviewData.duration)}
                                        clean
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    {/* Score and Tally */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box sx={{ height: { xs: "auto", md: 100 }, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                            <Grid container spacing={2}>
                                {/* Score Gauge */}
                                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                                    <Box
                                        sx={{
                                            position: "relative",
                                            height: "100%",
                                            display: "grid",
                                            placeContent: "center",
                                            placeItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ color: "text.secondary", mb: 1, position: "absolute", top: 7, left: 10 }}
                                        >
                                            Score
                                        </Typography>
                                        <Gauge
                                            value={reviewData.score}
                                            valueMax={totalPoints}
                                            height={100}
                                            width={100}
                                            cornerRadius="8px"
                                            sx={(theme) => ({
                                                [`& .${gaugeClasses.valueText}`]: {
                                                    fontSize: 18,
                                                    fontWeight: "bold",
                                                    fill: "text.secondary",
                                                },
                                                [`& .${gaugeClasses.valueArc}`]: {
                                                    fill:
                                                        reviewData.score >= (totalPoints * (formInfo.passing_score / 100))
                                                            ? '#177604'
                                                            : '#f44336',
                                                },
                                                [`& .${gaugeClasses.referenceArc}`]: {
                                                    fill: "#e0e0e0",
                                                },
                                            })}
                                            margin={{ top: 10, bottom: 0 }}
                                            startAngle={-110}
                                            endAngle={110}
                                            innerRadius="80%"
                                            outerRadius="120%"
                                            text={({ value }) => `${value}pt${value > 1 ? 's' : ''}`}
                                            aria-label="Score gauge"
                                        />
                                    </Box>
                                </Grid>
                                {/* Answer Tally */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Box sx={{ flexDirection: "column" }}>
                                        <Box sx={{ px: 2, py: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Answer Tally
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={1} sx={{ flexGrow: 1, p: 2, pt: 1 }}>
                                            {[
                                                { title: "Correct", info: reviewData.correct_items },
                                                { title: "Incorrect", info: reviewData.incorrect_items },
                                                { title: "Partial", info: reviewData.partial_items },
                                                { title: "Missed", info: reviewData.incorrect_items },
                                            ].map((item, index) => (
                                                <Grid key={index} size={{ xs: 6, md: 6 }}>
                                                    <InfoBox title={item.title} info={item.info} clean />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    {/* Answers */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                            Answers
                        </Typography>
                        <Box
                            sx={{
                                maxHeight: '690px',
                                overflowY: 'auto',
                                pr: 1,
                                mb: 10,
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
                                {reviewData.items.map((item, index) => (
                                    <Grid key={index} size={{ xs: 12 }}>
                                        <ReviewItem itemData={item} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            );
        default:
            return (<></>);
    }
};

export default FormViews;
