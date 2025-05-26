import React from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import PemeExamTypeTable from "./PemeExamTypeTable";

const PemeRecords = () => {
    const [openAddPemeRecordsModal, setOpenAddPemeRecordsModal] =
        React.useState(false);

    const handleCloseAddPemeRecordsModal = (reload) => {
        setOpenAddPemeRecordsModal(false);
        if (reload) {
            // Reload the data or perform any action after closing the modal
        }
    };

    const records = [
        {date: "May 1, 2025", exam: "Annual Physical Exam", dueDate: "May 2, 2026", progress: "7/7", status: "Clear"},
        {date: "May 3, 2025", exam: "Drug Test", dueDate: "May 4, 2025", progress: "7/7", status: "Clear"},
    ];

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
      width: "100%",  // fixed width for table container
      minWidth: 300,
      backgroundColor: "white",
      borderRadius: 2,
      boxShadow: 1,
      padding: 2,
      overflow: "hidden",
    }}
  >
    <PemeExamTypeTable records={records} />
  </Box>
</Box>
        </Layout>
    );
};

export default PemeRecords;
