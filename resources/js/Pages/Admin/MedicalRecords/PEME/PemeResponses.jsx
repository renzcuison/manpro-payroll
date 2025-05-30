import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

// Axios config
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

// Components
import Layout from "../../../../components/Layout/Layout";
import PemeResponsesTable from "./PemeResponsesTable";
import PemeDueDatePicker from "./PemeDueDatePicker";

// MUI components
import {
    Switch,
    Box,
    Button,
    Typography,
    Grid,
    InputLabel,
    FormControl,
    OutlinedInput,
    InputAdornment,
    Divider,
    FormControlLabel,
} from "@mui/material";

// MUI X Date Picker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const PemeResponses = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeID } = useParams();
    const navigator = useNavigate();
    const [pemeRecords, setPemeRecords] = useState([]);
    const [pemeResponses, setPemeResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);

    useEffect(() => {
        axiosInstance
            .get(`/peme/${PemeID}/questionnaire`, { headers })
            .then((response) => {
                setPemeRecords(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        axiosInstance
            .get(`/peme-responses/${PemeID}`, { headers })
            .then((response) => {
                setPemeResponses([response.data]);
                console.log("peme responses", response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    const handleOnRowClick = () => {
        navigator(
            "/admin/medical-records/peme-records/peme-questionnaire-view"
        );
    };

    const handleOnPreviewClick = () => {
        navigator(
            `/admin/medical-records/peme-records/peme-questionnaire-preview/${PemeID}`
        );
    };

    const handleOnEditClick = () => {
        navigator(`/admin/medical-records/peme-records/peme-form/${PemeID}`);
    };

    const dummyData = [
        {
            dueDate: "05-10-2025",
            employee: "employee",
            branch: "branch",
            department: "department",
            status: "status",
            currentProgress: 1,
            fullProgress: 2,
        },
        {
            dueDate: "06-12-2025",
            employee: "employee",
            branch: "branch",
            department: "department",
            status: "status",
            currentProgress: 2,
            fullProgress: 3,
        },
        {
            dueDate: "07-09-2025",
            employee: "employee",
            branch: "branch",
            department: "department",
            status: "status",
            currentProgress: 1,
            fullProgress: 4,
        },
    ];

    const filteredRecords = dummyData
        .filter((response) =>
            [
                dayjs(response.date).format("MMMM D, YYYY"),
                response.dueDate,
                response.employee,
                response.branch,
                response.department,
                response.status,
            ].some((field) =>
                field?.toString().toLowerCase().includes(search.toLowerCase())
            )
        )
        .filter((response) => {
            const recordDate = dayjs(response.date);
            if (fromDate && recordDate.isBefore(dayjs(fromDate), "day"))
                return false;
            if (toDate && recordDate.isAfter(dayjs(toDate), "day"))
                return false;
            return true;
        })
        .filter((response) => {
            if (!dueDate) return true;
            const recordDueDate = dayjs(response.dueDate).startOf("day");
            const today = dayjs().startOf("day");

            const ranges = {
                last7: [today.subtract(6, "day"), today],
                thisWeek: [
                    dayjs().startOf("isoWeek"),
                    dayjs().endOf("isoWeek"),
                ],
                lastWeek: [
                    dayjs().subtract(1, "week").startOf("isoWeek"),
                    dayjs().subtract(1, "week").endOf("isoWeek"),
                ],
                thisMonth: [dayjs().startOf("month"), dayjs().endOf("month")],
                lastMonth: [
                    dayjs().subtract(1, "month").startOf("month"),
                    dayjs().subtract(1, "month").endOf("month"),
                ],
                thisYear: [dayjs().startOf("year"), dayjs().endOf("year")],
                lastYear: [
                    dayjs().subtract(1, "year").startOf("year"),
                    dayjs().subtract(1, "year").endOf("year"),
                ],
            };

            if (dueDate in ranges) {
                const [start, end] = ranges[dueDate];
                return recordDueDate.isBetween(start, end, null, "[]");
            }

            return recordDueDate.isSame(dayjs(dueDate).startOf("day"));
        });

    const resultsCount = filteredRecords.length;

    return (
        <Layout title="Pre-Employment Medical Exam Type Responses">
            <Box
                sx={{
                    overflowX: "auto",
                    width: "100%",
                    whiteSpace: "nowrap",
                }}
            >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {pemeRecords.peme}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Button
                                onClick={handleOnEditClick}
                                variant="contained"
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={handleOnPreviewClick}
                                variant="contained"
                            >
                                Preview
                            </Button>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Visible"
                                sx={{
                                    "& .MuiFormControlLabel-label": {
                                        color: "green", // your custom color here
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#fff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid container spacing={2} gap={2}>
                            <Grid item>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="From"
                                        value={fromDate}
                                        onChange={setFromDate}
                                        slotProps={{
                                            textField: { sx: { width: 200 } },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="To"
                                        value={toDate}
                                        onChange={setToDate}
                                        slotProps={{
                                            textField: { sx: { width: 200 } },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item>
                                <PemeDueDatePicker
                                    dueDate={dueDate}
                                    setDueDate={setDueDate}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ height: 24 }} />
                        <FormControl
                            variant="outlined"
                            sx={{ width: 652, mb: 1 }}
                        >
                            <InputLabel htmlFor="custom-search">
                                Search Date, Employee, Branch, Department, or
                                Status
                            </InputLabel>
                            <OutlinedInput
                                id="custom-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                endAdornment={
                                    search && (
                                        <InputAdornment position="end">
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "gray" }}
                                            >
                                                {resultsCount}{" "}
                                                {resultsCount === 1
                                                    ? "Result"
                                                    : "Results"}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                }
                                label="Search Date, Employee, Branch, Department, or Status"
                            />
                        </FormControl>

                        <Box sx={{ height: 24 }} />
                        <Divider />
                        <PemeResponsesTable
                            onRowClick={handleOnRowClick}
                            responses={filteredRecords}
                            search={search}
                        />
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeResponses;
