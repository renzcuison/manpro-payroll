import React, { useState, useEffect } from "react";
import Layout from "../../../../components/Layout/Layout";
import { Box, Button, Typography } from "@mui/material";
import PemeResponsesTable from "./PemeResponsesTable";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
const PemeResponses = () => {
    const getJWTHeader = (user) => {
        return {
            Authorization: `Bearer ${user.token}`,
        };
    };
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeID } = useParams();
    const navigator = useNavigate();
    const [pemeRecords, setPemeRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleOnOpenPreview = () => {
        navigator(
            `/admin/medical-records/peme-records/peme-questionnaire-preview/${PemeID}`
        );
    };

    useEffect(() => {
        axiosInstance
            .get(`/peme/${PemeID}/questionnaire`, { headers })
            .then((response) => {
                setPemeRecords(response.data);
                console.log("PEME Records responses:", response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching loan applications:", error);
                // Swal.fire({
                //     title: "Error",
                //     text:
                //         "Failed to fetch PEME records. Please try again later.",
                //     icon: "error",
                //     confirmButtonText: "Okay",
                //     confirmButtonColor: "#177604",
                // });
                setIsLoading(false);
            });
    }, []);

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
            `/admin/medical-records/peme-records/peme-questionnaire-view`
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
                            {pemeRecords.peme}
                        </Typography>
                        <Button
                            onClick={handleOnOpenPreview}
                            variant="contained"
                            sx={{ backgroundColor: "#e3b017" }}
                        >
                            Preview Exam
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
