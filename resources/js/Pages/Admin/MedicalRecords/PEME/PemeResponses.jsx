import React from "react";
import Layout from "../../../../components/Layout/Layout";
import { Box, Button, Typography } from "@mui/material";
import PemeResponsesTable from "./PemeResponsesTable";
import { useNavigate } from "react-router-dom";

const PemeResponses = () => {
    const navigator = useNavigate();

    const responses = [
        {
            id: 1,
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
            id: 2,
            date: "2025-06-01",
            dueDate: "2025-06-12",
            employee: "Ram Christian D. Nacar",
            branch: "Makati",
            department: "Finance",
            currentProgress: 4,
            fullProgress: 4,
            status: "Clear",
        },
        {
            id: 3,
            date: "2025-06-01",
            dueDate: "2025-06-07",
            employee: "Ram Christian D. Nacar",
            branch: "Makati",
            department: "Finance",
            currentProgress: 2,
            fullProgress: 3,
            status: "Pending",
        },
        {
            id: 4,
            date: "2025-06-01",
            dueDate: "2025-06-30",
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
    const handleOnPreviewClick = () => {
        navigator(
            "/admin/medical-records/peme-records/peme-questionnaire-preview"
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
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "#E9AE20" }}
                            onClick={handleOnPreviewClick}
                        >
                            Preview
                        </Button>
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
