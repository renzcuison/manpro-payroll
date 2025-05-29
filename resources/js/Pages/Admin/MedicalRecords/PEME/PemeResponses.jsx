import React from "react";
import Layout from "../../../../components/Layout/Layout";
import { Box, Button, Typography, Grid, InputLabel, FormControl, OutlinedInput, InputAdornment, Divider} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import PemeResponsesTable from "./PemeResponsesTable";
import { useNavigate } from "react-router-dom";
import PemeDueDatePicker from "./PemeDueDatePicker";


const PemeResponses = () => {
    const navigator = useNavigate();
    const [search, setSearch] = React.useState("");

    const [fromDate, setFromDate] = React.useState(null);
    const [toDate, setToDate] = React.useState(null);
    const [dueDate, setDueDate] = React.useState(null);

    const responses = [
        {
            date: "2025-05-01",
            dueDate: "2025-05-26",
            employee: "Samuel Christian D. Nacar",
            branch: "Cebu",
            department: "Marketing",
            currentProgress: 2,
            fullProgress: 4,
            status: "Pending",
        },
        {
            date: "2025-05-23",
            dueDate: "2025-05-25",
            employee: "Pamelo Christian D. Nacar",
            branch: "Makati",
            department: "Customer Service",
            currentProgress: 4,
            fullProgress: 4,
            status: "Accepted",
        },
        {
            date: "2025-05-24",
            dueDate: "2025-05-27",
            employee: "Hamill Christian D. Nacar",
            branch: "Davao",
            department: "Finance",
            currentProgress: 2,
            fullProgress: 3,
            status: "Pending",
        },
        {
            date: "2025-05-24",
            dueDate: "2025-05-28",
            employee: "Hamill Christian D. Nacar",
            branch: "Davao",
            department: "Finance",
            currentProgress: 2,
            fullProgress: 3,
            status: "Pending",
        },
        {
            date: "2024-06-25",
            dueDate: "2025-05-22",
            employee: "Cameron Christian D. Nacar",
            branch: "Batangas",
            department: "Human Resources",
            currentProgress: 2,
            fullProgress: 3,
            status: "Rejected",
        },
        {
            date: "2024-06-25",
            dueDate: "2025-04-22",
            employee: "Cameron Christian D. Nacar",
            branch: "Batangas",
            department: "Human Resources",
            currentProgress: 2,
            fullProgress: 3,
            status: "Rejected",
        },
        {
            date: "2024-03-25",
            dueDate: "2024-04-22",
            employee: "Cameron Christian D. Nacar",
            branch: "Batangas",
            department: "Human Resources",
            currentProgress: 2,
            fullProgress: 3,
            status: "Rejected",
        },
        {
            date: "2024-06-25",
            dueDate: "2026-04-22",
            employee: "Cameron Christian D. Nacar",
            branch: "Batangas",
            department: "Human Resources",
            currentProgress: 2,
            fullProgress: 3,
            status: "Rejected",
        },
        {
            date: "2025-05-25",
            dueDate: "2025-06-22",
            employee: "Cameron Christian D. Nacar",
            branch: "Batangas",
            department: "Human Resources",
            currentProgress: 2,
            fullProgress: 3,
            status: "Rejected",
        },
    ];

    // Handle dropdown changes for due date filtering
const filteredRecords = responses
    .filter((response) =>
        [dayjs(response.date).format("MMMM D, YYYY"),
        response.dueDate,
        response.employee,
        response.branch,
        response.department,
        response.status
        ].some((field) =>
            field?.toString().toLowerCase().includes(search.toLowerCase())
    ))
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
            return recordDueDate.isBetween(last7DaysStart, today, null, "[]");
        }

        if (dueDate === "thisWeek") {
            const startOfWeek = dayjs().startOf('isoWeek'); // isoWeek = Monday start
            const endOfWeek = dayjs().endOf('isoWeek');

            return recordDueDate.isBetween(startOfWeek, endOfWeek, null, "[]");
        }

        if (dueDate === "lastWeek") {
            const startOfLastWeek = dayjs().subtract(1, "week").startOf("isoWeek");
            const endOfLastWeek = dayjs().subtract(1, "week").endOf("isoWeek");

            return recordDueDate.isBetween(startOfLastWeek, endOfLastWeek, null, "[]");
        }

        if (dueDate === "thisMonth") {
            const startOfMonth = dayjs().startOf("month");
            const endOfMonth = dayjs().endOf("month");
            return recordDueDate.isBetween(startOfMonth, endOfMonth, null, "[]");
        }
        
        if (dueDate === "lastMonth") {
            const startOfLastMonth = dayjs().subtract(1, "month").startOf("month");
            const endOfLastMonth = dayjs().subtract(1, "month").endOf("month");
            return recordDueDate.isBetween(startOfLastMonth, endOfLastMonth, null, "[]");
        }

        if (dueDate === "thisYear") {
            const startOfYear = dayjs().startOf("year");
            const endOfYear = dayjs().endOf("year");
            return recordDueDate.isBetween(startOfYear, endOfYear, null, "[]");
        }

        if (dueDate === "lastYear") {
            const startOfLastYear = dayjs().subtract(1, "year").startOf("year");
            const endOfLastYear = dayjs().subtract(1, "year").endOf("year");
            return recordDueDate.isBetween(startOfLastYear, endOfLastYear, null, "[]");
        }

        const selectedDueDate = dayjs(dueDate).startOf("day");

        return recordDueDate.isSame(selectedDueDate);
    });

    const handleOnRowClick = () => {
        navigator(
            "/admin/medical-records/peme-records/peme-questionnaire-view"
        );
    };

    const resultsCount = filteredRecords.length;

    return (

    <Layout title={"Pre-Employment Medical Exam Type Responses"}>
        <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
            <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
            
                {/* Header */}
                <Box sx={{mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center"}}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Questionnaire Name </Typography>
                </Box>
                
                <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                    
                    {/* Filters */}
                        <Grid container spacing={2} alignItems="center" justifyContent="flex-start" gap={2}>
                            <Grid item>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                    label="From"
                                    value={fromDate}
                                    onChange={(newValue) => setFromDate(newValue)}
                                    slotProps={{ textField: 
                                        { sx: { width: 200 } 
                                    }, 
                                    }}
                                    />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                        label="To"
                                        value={toDate}
                                        onChange={(newValue) => setToDate(newValue)}
                                        slotProps={{ textField: { 
                                            sx: { width: 200 } 
                                        }, 
                                        }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item>
                                    <PemeDueDatePicker dueDate={dueDate} setDueDate={setDueDate} />
                                </Grid>
                    
                            </Grid>

                            {/* Spacing after date pickers */}
                                <Box sx={{ height: 24 }} />

                                <FormControl variant="outlined" sx={{ width: 652, mb: 1 }}>
                                <InputLabel htmlFor="custom-search" >Search Date, Employee, Branch, Department, or Status</InputLabel>
                                <OutlinedInput
                                    id="custom-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    endAdornment={
                                    search && (
                                        <InputAdornment position="end">
                                        <Typography variant="body2" sx={{ color: 'gray' }}>
                                            {resultsCount} {resultsCount === 1 || resultsCount === 0 ? "Match" : "Matches"}
                                        </Typography>
                                        </InputAdornment>
                                    )
                                    }
                                    label="Search Date, Employee, Branch, Department, or Status"
                                    />
                                </FormControl>

                                {/* Spacing after search bar */}
                                <Box sx={{ height: 24 }} />
                                    <Divider />
                                    {/* Table */}
                                    <PemeResponsesTable 
                                        onRowClick={handleOnRowClick} responses={filteredRecords} search={search}
                                    />
                                </Box>
                </Box> 
            </Box>
        </Layout>
        
    );
};

export default PemeResponses;