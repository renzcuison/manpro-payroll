import React from "react";
<<<<<<< Updated upstream:resources/js/Pages/Admin/MedicalRecords/PemeRecords.jsx
import { Box, Button, Typography, TextField, CircularProgress } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
=======
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, TextField } from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
>>>>>>> Stashed changes:resources/js/Pages/Admin/MedicalRecords/PEME/PemeRecords.jsx
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import PemeExamTypeTable from "./PemeExamTypeTable";
import PemeOverview from "./PemeOverview";
import DueDatePicker from "./PemeDueDatePicker";

const PemeRecords = () => {
    const [openAddPemeRecordsModal, setOpenAddPemeRecordsModal] =
        React.useState(false);

    const [search, setSearch] = React.useState(""); 

    const handleCloseAddPemeRecordsModal = (reload) => {
        setOpenAddPemeRecordsModal(false);
        if (reload) {
            // Reload the data or perform any action after closing the modal
        }
    };

    const records = React.useMemo(() => [
    {
        exam: "Annual Physical Exam", 
        date: "2025-06-01"
    },
    {
        exam: "Drug Test", 
        date: "2025-06-01"
    },
    ], 
    []);

    const filteredRecords = records.filter((record) =>
        [record.date, record.exam]
        .some((field) =>
            field?.toLowerCase().includes(search.toLowerCase())
        )
    );

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
                flexWrap: "nowrap",  // prevent wrapping below
                justifyContent: "flex-start",
                alignItems: "flex-start",
            }}
            >
            <Box
                sx={{
<<<<<<< Updated upstream:resources/js/Pages/Admin/MedicalRecords/PemeRecords.jsx
                width: "25%",  // fixed width for chart container
                minWidth: 280,
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: 1,
                padding: 2,
                flexShrink: 0, // prevent shrinking
                }}
            >
                <PemeOverview records={records} />
            </Box>
            <Box
                sx={{
                width: "80%",  // fixed width for table container
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
=======
                    display: "flex",
                    gap: 4,
                    marginTop: 4,
                    flexWrap: "nowrap",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                }}
            >
                <Box
                    sx={{
                        width: "25%",
                        minWidth: 280,
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 1,
                        padding: 2,
                        flexShrink: 0, 
                    }}
                >
                    <PemeOverview records={records} />
                </Box>
                <Box
                    sx={{
                        width: "80%",
                        minWidth: 300,
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 1,
                        padding: 2,
                        overflow: "hidden",
                    }}
                >
                    <TextField
                        label="Search exam or date"
>>>>>>> Stashed changes:resources/js/Pages/Admin/MedicalRecords/PEME/PemeRecords.jsx
                        variant="outlined"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
<<<<<<< Updated upstream:resources/js/Pages/Admin/MedicalRecords/PemeRecords.jsx
                <PemeExamTypeTable records={filteredRecords} />
=======
                <PemeExamTypeTable records={filteredRecords} onRowClick={handleOnRowClick} />
                </Box>
>>>>>>> Stashed changes:resources/js/Pages/Admin/MedicalRecords/PEME/PemeRecords.jsx
            </Box>
            </Box>
            </Layout>
    );
};

export default PemeRecords;
