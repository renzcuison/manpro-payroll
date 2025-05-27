import React from "react";
import Layout from "../../../../components/Layout/Layout";
import { Box, Button, Typography } from "@mui/material";
import PemeResponsesTable from "./PemeResponsesTable";
import { useNavigate } from "react-router-dom";

const PemeResponses = () => {
    const navigator = useNavigate();

    const responses = [
        {
            date: "2025-06-01",
            dueDate: "2025-06-12",
            employee: "Ram Christian D. Nacar",
            branch: "Makati",
            department: "Finance",
            currentProgress: 2,
            fullProgress: 4,
            status: "Pending",
        },
        {
            date: "2025-06-01",
            dueDate: "2025-06-12",
            employee: "Ram Christian D. Nacar",
            branch: "Makati",
            department: "Finance",
            currentProgress: 1,
            fullProgress: 4,
            status: "Pending",
        },
        {
            date: "2025-06-01",
            dueDate: "2025-06-12",
            employee: "Ram Christian D. Nacar",
            branch: "Makati",
            department: "Finance",
            currentProgress: 2,
            fullProgress: 3,
            status: "Pending",
        },
        {
            date: "2025-06-01",
            dueDate: "2025-06-12",
            employee: "Ram Christian D. Nacar",
            branch: "Makati",
            department: "Finance",
            currentProgress: 2,
            fullProgress: 3,
            status: "Rejected",
        },
    ];
    const handleOnRowClick = () => {
        navigator(
            "/admin/medical-records/peme-records/peme-questionnaire-view"
        );
    };
    return (
        <Layout title={"Pre-Employment Medical Exam Type Responses"}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
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
                            justifyContent: "space-between",
                            padding: 2,
                            borderBottom: "1px solid #ccc",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Questionnaire Name
                        </Typography>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                            }}
                        ></div>
                    </Box>
                </Box>
                <PemeResponsesTable
                    onRowClick={handleOnRowClick}
                    responses={responses}
                />
            </Box>
        </Layout>
    );
};

export default PemeResponses;
