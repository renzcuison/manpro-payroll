import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

// Axios config
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

// Components
import Layout from "../../../../components/Layout/Layout";
import PemeResponsesTable from "./PemeResponsesTable";
import PemeDueDatePicker from "./PemeDueDatePicker";
import DateRangePicker from "../../../../components/DateRangePicker";
import PemeSettingsModal from "./Modals/PemeSettingsModal"

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
    IconButton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Swal from "sweetalert2";

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
    const [settingsOpen, setSettingsOpen] = useState(false);

    // FETCH THE QUESTIONNAIRE STRUCTURE FOR THE GIVEN PEME ID
    useEffect(() => {
        axiosInstance
            .get(`/peme/${PemeID}/questionnaire`, { headers })
            .then((response) => {
                setPemeRecords(response.data);
                setVisible(response.data.isVisible === 1);
                setEditable(response.data.isEditable === 1);
                setMultiple(response.data.isEditable === 1);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    // FETCH PEME RESPONSES FOR THE GIVEN PEME ID
    useEffect(() => {
        axiosInstance
            .get(`/peme-responses/${PemeID}`, { headers })
            .then((response) => {
                setPemeResponses([response.data]);
                console.log("resposnes", response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    const [visible, setVisible] = useState(true);
    const [multiple, setMultiple] = useState(true);
    const [editable, setEditable] = useState(true);

    // const setIsHiddenOrVisible = async () => {
    //     const isCurrentlyVisible = visible;
    //     const newStatus = isCurrentlyVisible ? 0 : 1;

    //     if (isCurrentlyVisible) {
    //         Swal.fire({
    //             title: "Hide this PEME Exam?",
    //             text: `You are about to hide "${pemeRecords?.peme || "this PEME Exam"}".`,
    //             icon: "warning",
    //             showCancelButton: true,
    //             confirmButtonText: "Hide",
    //             cancelButtonText: "Cancel",
    //             confirmButtonColor: "#d33",
    //             customClass: { container: "my-swal" },
    //         }).then(async (result) => {
    //             if (result.isConfirmed) {
    //                 try {
    //                     const payload = { isVisible: 0 };

    //                     await axiosInstance.patch(`/updatePemeSettings/${PemeID}`, payload, { headers });

    //                     Swal.fire({
    //                         icon: "success",
    //                         text: `PEME exam hidden successfully.`,
    //                         showConfirmButton: false,
    //                         timer: 1500,
    //                     });

    //                     setVisible(false);
    //                 } catch (error) {
    //                     console.error("Visibility toggle failed:", error);
    //                     Swal.fire({
    //                         icon: "error",
    //                         title: "Error",
    //                         text: "Failed to update visibility.",
    //                     });
    //                 }
    //             }
    //         });
    //     } else {
    //         try {
    //             const payload = { isVisible: 1 };

    //             await axiosInstance.patch(`/updatePemeSettings/${PemeID}`, payload, { headers });
    //             setVisible(true);
    //         } catch (error) {
    //             console.error("Visibility toggle failed:", error);
    //             Swal.fire({
    //                 icon: "error",
    //                 title: "Error",
    //                 text: "Failed to update visibility.",
    //             });
    //         }
    //     }
    // };


    const handleOnRowClick = (responseID) => {
        navigator(
            `/admin/medical-records/peme-records/peme-questionnaire-view/${responseID}`
        );
        console.log(responseID);
    };

    const handleOnPreviewClick = () => {
        navigator(
            `/admin/medical-records/peme-records/peme-questionnaire-preview/${PemeID}`
        );
    };

    const handleOnEditClick = () => {
        navigator(`/admin/medical-records/peme-records/peme-form/${PemeID}`);
    };

    const handleOnDeleteClick = () => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: `You want to delete ${pemeRecords.peme}?`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then(async (res) => {
            if (res.isConfirmed) {
                try {
                    await axiosInstance.delete(`/deletePeme/${PemeID}`, {
                        headers,
                    });

                    Swal.fire({
                        icon: "success",
                        text: "Question deleted successfully.",
                        showConfirmButton: false,
                        timer: 1500,
                    });

                    navigator("/admin/medical-records/peme-records");
                } catch {
                    console.log("unable to delete");
                }
            }
        });
    };

    const filteredRecords = pemeResponses
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

    const handleDateRangeChange = (start, end) => {
        setFromDate(start);
        setToDate(end);
    };

    // Route::patch('/updatePemeSettings/{id}', [PemeController::class, 'updatePemeSettings']);

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
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: "bold" }}
                            >
                                Respondents
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: "bold" }}
                            >
                                {pemeRecords.peme}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Button
                                onClick={handleOnDeleteClick}
                                variant="contained"
                                sx={{ backgroundColor: "Red" }}
                            >
                                Delete
                            </Button>
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
                            <IconButton onClick={() => setSettingsOpen(true)} aria-label="Settings">
                                <SettingsIcon />
                            </IconButton>
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
                                <DateRangePicker
                                    onRangeChange={handleDateRangeChange}
                                />
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
                            sx={{ width: 196, mb: 1 }}
                        >
                            <InputLabel htmlFor="custom-search">
                                Search
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
                                                {resultsCount === 1 ||
                                                    resultsCount === 0
                                                    ? "Match"
                                                    : "Matches"}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                }
                                label="Search"
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
            <PemeSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                visible={visible}
                setVisible={setVisible}
                multiple={multiple}
                setMultiple={setMultiple}
                editable={editable}
                setEditable={setEditable}
                PemeID={PemeID}
                pemeRecords={pemeRecords}
                headers={headers}
            />
        </Layout>
    );
};

export default PemeResponses;
