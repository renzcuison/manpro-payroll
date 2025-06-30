import Layout from "../../../../components/Layout/Layout";
import {
    Box,
    Button,
    Typography,
    Grid,
    InputLabel,
    FormControl,
    OutlinedInput,
    InputAdornment,
    Divider,
    CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import PemeResponsesTable from "./PemeResponsesTable";
import { useNavigate } from "react-router-dom";
import PemeDueDatePicker from "./PemeDueDatePicker";
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const PemeResponses = () => {
    const navigator = useNavigate();
    const [search, setSearch] = React.useState("");
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [pemeResponses, setPemeResponses] = useState([]);
    const [pemeRecords, setPemeRecords] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = React.useState(null);
    const [toDate, setToDate] = React.useState(null);
    const [dueDate, setDueDate] = React.useState(null);

    // GET EXAMS TAKEN BY EMPLOYEE
    useEffect(() => {
        axiosInstance
            .get("/peme-responses/showResponses", { headers })
            .then((response) => {
                setPemeResponses(response.data);
                setIsLoading(false);
                console.log("RESPONSES", response.data);
            })
            .catch((error) => {
                console.error("Error fetching PEME responses:", error);
                Swal.fire({
                    title: "Error",
                    text:
                        "Failed to fetch PEME records. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                });
                setIsLoading(false);
            });
    }, []);

    // GET AVAILABLE EXAMS CREATED BY ADMIN
    useEffect(() => {
        axiosInstance
            .get("/getPemeList", { headers })
            .then((response) => {
                setPemeRecords(response.data);
                setIsLoading(false);
                console.log("EXAMS", response.data);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                Swal.fire({
                    title: "Error",
                    text:
                        "Failed to fetch PEME records. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                });
                setIsLoading(false);
            });
    }, []);

    const [
        openAddPemeRecordsModal,
        setOpenAddPemeRecordsModal,
    ] = React.useState(false);

    const handleCloseAddPemeRecordsModal = () => {
        setOpenAddPemeRecordsModal(false);
        axiosInstance.get("/peme-responses/showResponses", { headers }).then((response) => {
            setPemeResponses(response.data);
        });
    };

    // Handle dropdown changes for due date filtering
    const filteredRecords = pemeResponses
        .filter((response) =>
            [
                dayjs(response.date).format("MMMM D, YYYY"),
                response.exam,
                response.dueDate,
                response.status,
            ].some((field) =>
                field?.toString().toLowerCase().includes(search.toLowerCase())
            )
        )
        .filter((response) => {
            const recordDate = dayjs(response.date);
            const from = fromDate ? dayjs(fromDate) : null;
            const to = toDate ? dayjs(toDate) : null;

            if (from && recordDate.isBefore(from, "day")) return false;
            if (to && recordDate.isAfter(to, "day")) return false;

            return true;
        })
        .filter((response) => {
            if (!dueDate) return true;

            const recordDueDate = dayjs(response.dueDate).startOf("day");
            const today = dayjs().startOf("day");

            if (dueDate === "last7") {
                const last7DaysStart = today.subtract(6, "day");
                return recordDueDate.isBetween(
                    last7DaysStart,
                    today,
                    null,
                    "[]"
                );
            }

            if (dueDate === "thisWeek") {
                const startOfWeek = dayjs().startOf("isoWeek"); // isoWeek = Monday start
                const endOfWeek = dayjs().endOf("isoWeek");

                return recordDueDate.isBetween(
                    startOfWeek,
                    endOfWeek,
                    null,
                    "[]"
                );
            }

            if (dueDate === "lastWeek") {
                const startOfLastWeek = dayjs()
                    .subtract(1, "week")
                    .startOf("isoWeek");
                const endOfLastWeek = dayjs()
                    .subtract(1, "week")
                    .endOf("isoWeek");

                return recordDueDate.isBetween(
                    startOfLastWeek,
                    endOfLastWeek,
                    null,
                    "[]"
                );
            }

            if (dueDate === "thisMonth") {
                const startOfMonth = dayjs().startOf("month");
                const endOfMonth = dayjs().endOf("month");
                return recordDueDate.isBetween(
                    startOfMonth,
                    endOfMonth,
                    null,
                    "[]"
                );
            }

            if (dueDate === "lastMonth") {
                const startOfLastMonth = dayjs()
                    .subtract(1, "month")
                    .startOf("month");
                const endOfLastMonth = dayjs()
                    .subtract(1, "month")
                    .endOf("month");
                return recordDueDate.isBetween(
                    startOfLastMonth,
                    endOfLastMonth,
                    null,
                    "[]"
                );
            }

            if (dueDate === "thisYear") {
                const startOfYear = dayjs().startOf("year");
                const endOfYear = dayjs().endOf("year");
                return recordDueDate.isBetween(
                    startOfYear,
                    endOfYear,
                    null,
                    "[]"
                );
            }

            if (dueDate === "lastYear") {
                const startOfLastYear = dayjs()
                    .subtract(1, "year")
                    .startOf("year");
                const endOfLastYear = dayjs().subtract(1, "year").endOf("year");
                return recordDueDate.isBetween(
                    startOfLastYear,
                    endOfLastYear,
                    null,
                    "[]"
                );
            }

            const selectedDueDate = dayjs(dueDate).startOf("day");

            return recordDueDate.isSame(selectedDueDate);
        });

    const handleOnRowClick = (responseID) => {
        navigator(
            `/employee/medical-records/peme-records/peme-questionnaire-view/${responseID}`
        );
        console.log(responseID);
    };

    const resultsCount = filteredRecords.length;

    return (
        <Layout title={"Pre-Employment Medical Exam Type Responses"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    {/* Header */}
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Pre-Employment Medical Exam
                        </Typography>

                        <Button
                            onClick={() => setOpenAddPemeRecordsModal(true)}
                            variant="contained"
                            style={{ color: "#e8f1e6" }}
                        >
                            <i className="fa fa-plus pr-2"></i> Add
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        {/* Horizontal Filters: Search + From/To */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            {/* Search */}
                            <FormControl variant="outlined" sx={{ width: 652 }}>
                                <InputLabel htmlFor="custom-search">
                                    Search Date, Type of Exam, Due Date, or Status
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
                                                    {resultsCount === 1 || resultsCount === 0
                                                        ? "Result"
                                                        : "Results"}
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }
                                    label="Search Date, Type of Exam, Due Date, or Status"
                                />
                            </FormControl>

                            <Box sx={{ display: "flex", gap: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="From"
                                        value={fromDate}
                                        onChange={(newValue) => setFromDate(newValue)}
                                        slotProps={{
                                            textField: { sx: { width: 200 } },
                                        }}
                                    />
                                </LocalizationProvider>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="To"
                                        value={toDate}
                                        onChange={(newValue) => setToDate(newValue)}
                                        slotProps={{
                                            textField: { sx: { width: 200 } },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Box>

                        {/* Add Modal */}
                        {openAddPemeRecordsModal && (
                            <PemeRecordsAddModal
                                open={openAddPemeRecordsModal}
                                close={handleCloseAddPemeRecordsModal}
                                records={pemeRecords}
                            />
                        )}

                        <Box sx={{ height: 24 }} />

                        <Divider />

                        {/* Table Section */}
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 400,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <PemeResponsesTable
                                onRowClick={handleOnRowClick}
                                responses={filteredRecords}
                                search={search}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>

    );
};

export default PemeResponses;
