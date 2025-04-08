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
    Stack,
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Tab
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";
import { BarChart, Gauge, gaugeClasses, PieChart } from "@mui/x-charts";
import InfoBox from "../../../../components/General/InfoBox";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const FormAnalytics = ({ open, close, contentId }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [responseAnalytics, setResponseAnalytics] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(`trainings/getFormAnalytics/${contentId}`, {
                headers
            })
            .then((response) => {
                const analytics = response.data.analytics;
                setResponseAnalytics(analytics);
                setExpanded(analytics.items.map((_, index) => index));
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching form analytics:", error);
            });
    }, []);

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

    const renderItemType = (item) => {
        const typeStyles = {
            Choice: { backgroundColor: "#e3f2fd", color: "#1976d2", label: "Choice" },
            MultiSelect: { backgroundColor: "#fff3e0", color: "#f57c00", label: "Selection" },
            FillInTheBlank: { backgroundColor: "#e8f5e9", color: "#2e7d32", label: "Fill" },
        };

        const style = typeStyles[item.type] || { backgroundColor: "#ffebee", color: "#d32f2f", label: "Unknown" };

        return (
            <Box
                sx={{
                    mr: 1,
                    px: 1,
                    py: 0.5,
                    width: "20%",
                    borderRadius: "4px",
                    backgroundColor: style.backgroundColor,
                    color: style.color,
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    textAlign: "center",
                }}
            >
                {style.label}
            </Box>
        );
    };

    const valueFormatter = (item) => `${item.value}%`;

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
                        minWidth: { xs: "100%", sm: "750px" },
                        maxWidth: "850px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, mt: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: "bold" }} >
                            {" "}Form Analytics{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 2, mb: 3, maxHeight: "600px" }}>
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
                        <Box>
                            <Grid container spacing={2}>
                                {/* Attempt Summary */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        Attempts
                                    </Typography>
                                </Grid>
                                {/* Respondend Count */}
                                <Grid item xs={4}>
                                    <InfoBox
                                        title="Total Respondents"
                                        info={responseAnalytics.respondent_count}
                                    />
                                </Grid>
                                {/* Total Attempts */}
                                <Grid item xs={4}>
                                    <InfoBox
                                        title="Total Attempts"
                                        info={responseAnalytics.total_attempts}
                                    />
                                </Grid>
                                {/* Avg. Attempt Count */}
                                <Grid item xs={4}>
                                    <InfoBox
                                        title="Avg. Attempt Count"
                                        info={responseAnalytics.avg_attempt_count}
                                    />
                                </Grid>
                                {/* Avg. Attempt Duration */}
                                <Grid item xs={4}>
                                    <InfoBox
                                        title="Avg. Attempt Duration"
                                        info={formatDuration(responseAnalytics.avg_duration)}
                                    />
                                </Grid>
                                {/* Fastest Attempt */}
                                <Grid item xs={4}>
                                    <InfoBox
                                        title="Fastest Attempt"
                                        info={formatDuration(responseAnalytics.fastest_attempt)}
                                    />
                                </Grid>
                                {/* Slowest Attempt */}
                                <Grid item xs={4}>
                                    <InfoBox
                                        title="Slowest Attempt"
                                        info={formatDuration(responseAnalytics.slowest_attempt)}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Score Summary */}
                                <Grid item xs={8}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                                        Score Summary
                                    </Typography>
                                    <BarChart
                                        series={[
                                            {
                                                data: [responseAnalytics.hi_score, responseAnalytics.avg_score, responseAnalytics.lo_score].map(score => score === 0 ? 0.05 : score),
                                                color: '#177604',
                                                valueFormatter: (value) => `${Math.round(value === 0.05 ? 0 : value)}`,
                                            },
                                        ]}
                                        yAxis={[
                                            {
                                                scaleType: 'band',
                                                data: ['Highest', 'Avg', 'Lowest'],
                                            },
                                        ]}
                                        xAxis={[
                                            {
                                                max: (responseAnalytics.total_points) ?? 100,
                                                valueFormatter: (value) => `${Math.round(value === 0.05 ? 0 : value)}`,
                                            },
                                        ]}
                                        grid={{ vertical: true }}
                                        width={580}
                                        height={200}
                                        borderRadius={4}
                                        layout="horizontal"
                                        margin={{ left: 50, top: 10, bottom: 25 }}
                                    />
                                </Grid>
                                {/* Passing Rate */}
                                <Grid item xs={4}>
                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                                            Passing Rate
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, ml: 1 }}>
                                            (All Attempts)
                                        </Typography>
                                    </Box>
                                    <Box display="flex" sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                                        <Gauge
                                            value={responseAnalytics.passing_rate}
                                            height={180}
                                            width={180}
                                            cornerRadius="50%"
                                            sx={(theme) => ({
                                                [`& .${gaugeClasses.valueText}`]: {
                                                    fontSize: 20,
                                                    fontWeight: "bold",
                                                    fill: "text.secondary"
                                                },
                                                [`& .${gaugeClasses.valueArc}`]: {
                                                    fill: '#177604'
                                                },
                                                [`& .${gaugeClasses.referenceArc}`]: {
                                                    fill: `#e0e0e0`
                                                },
                                            })}
                                            innerRadius="70%"
                                            outerRadius="100%"
                                            text={({ value }) => `${Math.round(value)}%`}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }}>
                                    <Divider />
                                </Grid>
                                {/* Item Statistics */}
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                                            Item Statistics
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="contained"

                                            onClick={() => {
                                                if (expanded.length === responseAnalytics.items.length) {
                                                    setExpanded([]);
                                                } else {
                                                    setExpanded(responseAnalytics.items.map((_, index) => index));
                                                }
                                            }}
                                            endIcon={
                                                expanded.length === responseAnalytics.items.length ?
                                                    <ExpandLess /> :
                                                    <ExpandMore />
                                            }
                                            sx={{ textTransform: 'none', fontSize: '0.875rem', color: "white" }}
                                        >
                                            {expanded.length === responseAnalytics.items.length ? "Collapse All" : "Expand All"}
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    {responseAnalytics.items.map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                mb: 1,
                                                p: "8px 12px",
                                                border: "1px solid #e0e0e0",
                                                borderRadius: "8px",
                                                backgroundColor: expanded.includes(index) ? "#f5f7fa" : "white",
                                                transition: "background-color 0.3s ease",
                                                boxShadow: expanded.includes(index) ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
                                            }}
                                        >
                                            {/* Primary Content */}
                                            <Box display="flex" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                {/* Type and Description */}
                                                <Box display="flex" alignItems="center" sx={{ width: "56%" }}>
                                                    {/* Item Type */}
                                                    {renderItemType(item)}

                                                    {/* Short Description */}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            flex: 1,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            lineHeight: 1,
                                                            "& *": { margin: 0, padding: 0 },
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                                    />
                                                </Box>
                                                {/* Rates, Expand/Collapse Button */}
                                                <Box display="flex" sx={{ width: "19%", justifyContent: "flex-end", alignItems: "center" }}>
                                                    {/* Expand/Collapse Button */}
                                                    <IconButton
                                                        title={expanded.includes(index) ? "Collapse Content" : "Expand Content"}
                                                        onClick={() => {
                                                            if (expanded.includes(index)) {
                                                                setExpanded(expanded.filter((i) => i !== index));
                                                            } else {
                                                                setExpanded([...expanded, index]);
                                                            }
                                                        }}
                                                    >
                                                        {expanded.includes(index) ? (
                                                            <ExpandLess sx={{ color: "text.secondary", fontSize: "1.25rem" }} />
                                                        ) : (
                                                            <ExpandMore sx={{ color: "text.secondary", fontSize: "1.25rem" }} />
                                                        )}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Expanded Content */}
                                            {expanded.includes(index) && (
                                                <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", backgroundColor: "#fafafa", borderRadius: "8px" }}>
                                                    {/* Full Description */}
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 0.5 }}>
                                                            Full Description
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                whiteSpace: "pre-wrap",
                                                                "& *": { margin: 0, padding: 0 },
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: item.description }}
                                                        />
                                                    </Box>

                                                    {/* Type-Specific Details */}
                                                    {item.type === "FillInTheBlank" && (
                                                        <Box>
                                                            {/* Correct Answer */}
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 0.5 }}>
                                                                    Correct Answer
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: "medium", color: "text.primary" }}>
                                                                    {item.correct_answer}
                                                                </Typography>
                                                            </Box>

                                                            {/* Response Data */}
                                                            <Box sx={{ mt: 2, }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                                                    Response Distribution
                                                                </Typography>
                                                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                                                    <PieChart
                                                                        series={[
                                                                            {
                                                                                data: [
                                                                                    { id: 0, value: item.unanswered_rate ?? 0, label: 'Unanswered', color: '#545457' },
                                                                                    { id: 1, value: item.incorrect_rate ?? 0, label: 'Incorrect', color: '#f57c00' },
                                                                                    { id: 2, value: item.correct_rate ?? 0, label: 'Correct', color: '#177604' },
                                                                                ],
                                                                                innerRadius: 30,
                                                                                outerRadius: 100,
                                                                                startAngle: 0,
                                                                                endAngle: -360,
                                                                                valueFormatter,
                                                                            },
                                                                        ]}
                                                                        height={200}
                                                                        width={500}
                                                                    />
                                                                </Box>
                                                            </Box>

                                                            {/* Frequent Incorrect Answers */}
                                                            {item.common_incorrects.length > 0 && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 0.5 }}>
                                                                        Common Incorrect Answers
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                                        {item.common_incorrects.map((inc, idx) => (

                                                                            <Box key={idx} display="flex" sx={{ border: "solid 1px #e0e0e0", borderRadius: "4px", alignItems: "center" }}>
                                                                                <Box sx={{ borderRight: "solid 1px #e0e0e0", p: 1 }}>
                                                                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                                                        {inc.count}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{ px: 1 }}>
                                                                                    <Typography variant="body2">
                                                                                        {inc.description}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {(item.type === "Choice" || item.type === "MultiSelect") && (
                                                        <Box>
                                                            {/* Correct Choices */}
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 0.5 }}>
                                                                    Correct {item.choices.filter(choice => choice.is_correct).length > 1 ? "Choices" : "Choice"}
                                                                </Typography>
                                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                                    {item.choices
                                                                        .filter(choice => choice.is_correct)
                                                                        .map((choice, idx) => (
                                                                            <Typography
                                                                                key={idx}
                                                                                variant="body2"
                                                                                sx={{
                                                                                    px: 1,
                                                                                    py: 0.5,
                                                                                    borderRadius: "4px",
                                                                                    backgroundColor: "#e8f5e9",
                                                                                    color: "#2e7d32",
                                                                                }}
                                                                            >
                                                                                {choice.description}
                                                                            </Typography>
                                                                        ))}
                                                                </Box>
                                                            </Box>

                                                            {/* Response Data */}
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                                                    Response Distribution
                                                                </Typography>
                                                                <BarChart
                                                                    series={[
                                                                        {
                                                                            data: [
                                                                                ...item.choices.map(choice => choice.answer_rate === 0 ? 0.05 : choice.answer_rate),
                                                                                ...(item.unanswered_count > 0 ? [item.unanswered_count === 0 ? 0.05 : item.unanswered_count] : []),
                                                                            ],
                                                                            id: `${item.type}Rates-${index}`,
                                                                            valueFormatter: (value) => `${Math.round(value === 0.05 ? 0 : value)}`,
                                                                        },
                                                                    ]}
                                                                    xAxis={[
                                                                        {
                                                                            scaleType: 'band',
                                                                            data: [
                                                                                ...item.choices.map(choice => choice.description),
                                                                                ...(item.unanswered_count > 0 ? ['Unanswered'] : []),
                                                                            ],
                                                                            colorMap: {
                                                                                type: "ordinal",
                                                                                values: [
                                                                                    ...item.choices.map(choice => choice.description),
                                                                                    ...(item.unanswered_count > 0 ? ['Unanswered'] : []),
                                                                                ],
                                                                                colors: [
                                                                                    ...item.choices.map(choice => choice.is_correct ? '#177604' : '#f57c00'),
                                                                                    ...(item.unanswered_count > 0 ? ['#545457'] : []),
                                                                                ],
                                                                            },
                                                                            tickLabelStyle: {
                                                                                angle: 45,
                                                                                textAnchor: 'start',
                                                                                fontSize: 12,
                                                                            },
                                                                        },
                                                                    ]}
                                                                    yAxis={[
                                                                        {
                                                                            label: 'Answer Count',
                                                                            tickMinStep: 1,
                                                                            valueFormatter: (value) => `${Math.round(value === 0.05 ? 0 : value)}`,
                                                                        },
                                                                    ]}
                                                                    height={200}
                                                                    width={700}
                                                                    margin={{ left: 50, top: 20, bottom: 50, right: 20 }}
                                                                />
                                                            </Box>

                                                            {/* Additional Stats for MultiSelect */}
                                                            {item.type === "MultiSelect" && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.primary", mb: 0.5 }}>
                                                                        Average Score
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                                                                        {item.avg_score.toFixed(2)} correct selections per response
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FormAnalytics;
