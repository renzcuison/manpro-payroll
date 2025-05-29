import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, FormControl, InputLabel, OutlinedInput, InputAdornment } from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import PemeExamTypeTable from "./PemeExamTypeTable";
import PemeOverview from "./PemeOverview";
import dayjs from "dayjs";

const PemeRecords = () => {
    const navigator = useNavigate();

    const [openAddPemeRecordsModal, setOpenAddPemeRecordsModal] =
        React.useState(false);

    const [search, setSearch] = React.useState("");

    const handleCloseAddPemeRecordsModal = (reload) => {
        setOpenAddPemeRecordsModal(false);
        if (reload) {
            // Reload the data or perform any action after closing the modal
        }
    };

    const records = React.useMemo(
        () => [
            {
                exam: "Annual Physical Exam",
                date: "2025-06-02",
            },
            {
                exam: "Drug Test",
                date: "2025-06-01",
            },
        ],
        []
    );

    const filteredRecords = records.filter((record) =>
        [dayjs(record.date).format("MMMM D, YYYY"),
        record.exam
        ].some((field) =>
            field?.toString().toLowerCase().includes(search.toLowerCase())
    ));

    const handleOnRowClick = () => {
        navigator("/admin/medical-records/peme-records/peme-responses");
    };

    const resultsCount = filteredRecords.length;

    return (
        <Layout title={"Pre-Employment Medical Exam Records"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Pre-Employment Medical Exam Records </Typography>
                            <></>

                            <Button
                                onClick={() => setOpenAddPemeRecordsModal(true)}
                                variant="contained"
                                style={{ color: "#e8f1e6" }}
                            >
                                <i className="fa fa-plus pr-2"></i> Add
                            </Button>
                        </Box>

                        <Box>
                            <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                                <FormControl variant="outlined" sx={{ width: 652, mb: 1 }}>
                                <InputLabel htmlFor="custom-search" >Search Date or Exam</InputLabel>
                                <OutlinedInput
                                    id="custom-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    endAdornment={
                                    search && (
                                        <InputAdornment position="end">
                                        <Typography variant="body2" sx={{ color: 'gray' }}>
                                            {resultsCount} {resultsCount === 1 || resultsCount === 0 ? "Result" : "Results"}
                                        </Typography>
                                        </InputAdornment>
                                    )
                                    }
                                    label="Search Date or Exam"
                                    />
                                </FormControl>
                                <Box sx={{ mx: -3, my: -1.5, pl: 3, pr: 3 }}>
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
                                padding: 2,
                                overflow: "hidden",
                            }}
                            >

                            <PemeExamTypeTable records={filteredRecords} onRowClick={handleOnRowClick} search={search} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeRecords;
