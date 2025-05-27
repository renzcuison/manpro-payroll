import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import PemeExamTypeTable from "./PemeExamTypeTable";
import PemeOverview from "./PemeOverview";
import TextField from '@mui/material/TextField';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from "sweetalert2";


const PemeRecords = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigator = useNavigate();
    const [pemeRecords, setPemeRecords] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [openAddPemeRecordsModal, setOpenAddPemeRecordsModal] =
        React.useState(false);

    const [search, setSearch] = React.useState("");

    const handleCloseAddPemeRecordsModal = () => {
        setOpenAddPemeRecordsModal(false);
    };

    const records = React.useMemo(
        () => [
            {
                exam: "Annual Physical Exam",
                date: "2025-06-01",
            },
            {
                exam: "Drug Test",
                date: "2025-06-01",
            },
        ],
        []
    );

    const filteredRecords = pemeRecords.filter((record) =>
        [record.date, record.name].some((field) =>
            field?.toLowerCase().includes(search.toLowerCase())
        )
    );

    const handleOnRowClick = () => {
        navigator("/admin/medical-records/peme-records/peme-responses");
    };

     useEffect(() => {
            axiosInstance.get('/pemes', { headers })
                .then((response) => {
                        setPemeRecords(response.data);
                        console.log("PEME Records:", pemeRecords);

                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching loan applications:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to fetch loan applications. Please try again later.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#177604',
                    });
                    setIsLoading(false);
                });
        }, []);




    
    return (
        <Layout title={"Pre-Employment Medical Exam Records"}>
            <Box>
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
                            Pre-Employment Medical Exam Records
                        </Typography>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                            }}
                        >
                            <Button
                                onClick={() => setOpenAddPemeRecordsModal(true)}
                                variant="contained"
                                style={{ color: "#e8f1e6" }}
                            >
                                <i className="fa fa-plus pr-2"></i> Add
                            </Button>
                        </div>
                    </Box>
                </Box>
            </Box>
            {openAddPemeRecordsModal && (
                <PemeRecordsAddModal
                    open={openAddPemeRecordsModal}
                    close={handleCloseAddPemeRecordsModal}
                />
            )}

            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                    marginTop: 4,
                    flexWrap: "nowrap", // prevent wrapping below
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                }}
            >
                <Box
                    sx={{
                        width: "25%", // fixed width for chart container
                        minWidth: 280,
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 1,
                        padding: 2,
                        flexShrink: 0, // prevent shrinking
                    }}
                >
                    <PemeOverview records={pemeRecords} />
                </Box>
                <Box
                    sx={{
                        width: "80%", // fixed width for table container
                        minWidth: 300,
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 1,
                        padding: 2,
                        overflow: "hidden",
                    }}
                >
                    <TextField
                        label="Search exam, date, or status"
                        variant="outlined"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <PemeExamTypeTable records={pemeRecords} onRowClick={handleOnRowClick}/>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeRecords;
