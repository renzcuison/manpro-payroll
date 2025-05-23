import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import PemeExamTypeTable from "./PemeExamTypeTable";
const PemeRecords = () => {
    const navigator = useNavigate();

    const [openAddPemeRecordsModal, setOpenAddPemeRecordsModal] =
        React.useState(false);

    const handleCloseAddPemeRecordsModal = (reload) => {
        setOpenAddPemeRecordsModal(false);
        if (reload) {
            // Reload the data or perform any action after closing the modal
        }
    };

    const records = [
        { exam: "Annual Physical Exam", date: "2025-06-01" },
        { exam: "Drug Test", date: "2025-06-01" },
    ];

    const handleOnRowClick = () => {
        navigator("/admin/medical-records/peme-records/peme-responses");
    };

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

            <PemeExamTypeTable
                records={records}
                onRowClick={handleOnRowClick}
            />
        </Layout>
    );
};

export default PemeRecords;
