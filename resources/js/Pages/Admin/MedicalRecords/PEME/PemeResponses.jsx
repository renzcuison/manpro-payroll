import React from "react";
import Layout from "../../../../components/Layout/Layout";
import { Box, Button, Typography, TextField } from "@mui/material";
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
            currentProgress: 1,
            fullProgress: 4,
            status: "Pending",
        },
        {
            date: "2025-05-24",
            dueDate: "2025-05-26",
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
    ];

    // Handle dropdown changes for due date filtering
    const filteredRecords = responses
    .filter((response) =>
      [response.date,
       response.dueDate,
       response.employee,
       response.branch,
       response.department,
       response.status
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
        return recordDueDate.isSame(today) || recordDueDate.isAfter(last7DaysStart);
    }

    const selectedDueDate = dayjs(dueDate).startOf("day");

    return recordDueDate.isSame(selectedDueDate);
    });

    const handleOnRowClick = () => {
        navigator(
            "/admin/medical-records/peme-records/peme-questionnaire-view"
        );
    };


    return (
        <Layout title={"Pre-Employment Medical Exam Type Responses"}>
            <Box sx={{ display: "inline", flexDirection: "column" }}>
                <Box
                    sx={{
                        padding: 2,
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{  
                            display: "flex",
                            gap: 2,
                            flexDirection: "column",
                            alignItems: "flex-start",
                            mt: 2,
                            padding: 1,
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Questionnaire Name
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                            label="From"
                            value={fromDate}
                            onChange={(newValue) => setFromDate(newValue)}
                            slotProps={{
                                textField: {
                                sx: { width: 200 }
                                },
                            }}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                            label="To"
                            value={toDate}
                            onChange={(newValue) => setToDate(newValue)}
                            slotProps={{
                                textField: {
                                sx: { width: 200 },
                                },
                            }}
                            />
                        </LocalizationProvider>

                        <PemeDueDatePicker dueDate={dueDate} setDueDate={setDueDate} />
                        </Box>
                            <TextField
                            label="Search employee, branch, department, status"
                            variant="outlined"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{marginBottom: 1, width: 652 }}
                            />
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                            }}
                        >
                        </div>
                    </Box>
                </Box>

                <PemeResponsesTable
                onRowClick={handleOnRowClick} responses={filteredRecords} search={search}
                />

            </Box>
        </Layout>
    );
};

export default PemeResponses;