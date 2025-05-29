import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import Layout from "../../../../components/Layout/Layout";
import PemeRecordsAddModal from "./Modals/PemeRecordsAddModal";
import PemeExamTypeTable from "./PemeExamTypeTable";
import PemeOverview from "./PemeOverview";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

const PemeRecords = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigator = useNavigate();

    const [pemeRecords, setPemeRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openAddPemeRecordsModal, setOpenAddPemeRecordsModal] = useState(
        false
    );
    const [search, setSearch] = useState("");

    useEffect(() => {
        axiosInstance
            .get("/pemes", { headers })
            .then((response) => {
                setPemeRecords(response.data);
                setIsLoading(false);
                console.log("DATA", response.data);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                Swal.fire({
                    title: "Error",
                    text:
                        "Failed to fetch PEME records. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                });
                setIsLoading(false);
            });
    }, []);

    const filteredRecords = pemeRecords.filter((record) =>
        [
            dayjs(record.date).format("MMMM D, YYYY"),
            record.exam || record.name,
        ].some((field) =>
            field?.toString().toLowerCase().includes(search.toLowerCase())
        )
    );

    const handleOnRowClick = (recordID) => {
        navigator(
            `/admin/medical-records/peme-records/peme-responses/${recordID}`
        );
    };

    const resultsCount = filteredRecords.length;

    return (
        <Layout title={"Pre-Employment Medical Exam Records"}>
            <Box
                sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}
            >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Pre-Employment Medical Exam Records
                        </Typography>
                        <Button
                            onClick={() => setOpenAddPemeRecordsModal(true)}
                            variant="contained"
                            style={{ color: "#e8f1e6" }}
                        >
                            <i className="fa fa-plus pr-2"></i> Add
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <FormControl
                            variant="outlined"
                            sx={{ width: 652, mb: 1 }}
                        >
                            <InputLabel htmlFor="custom-search">
                                Search Date or Exam
                            </InputLabel>
                            <OutlinedInput
                                id="custom-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                endAdornment={
                                    search && (
                                        <InputAdornment position="end">
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "gray" }}
                                            >
                                                {resultsCount}{" "}
                                                {resultsCount === 1
                                                    ? "Result"
                                                    : "Results"}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                }
                                label="Search Date or Exam"
                            />
                        </FormControl>
                    </Box>

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
                                boxShadow: 1,
                                padding: 2,
                                flexShrink: 0,
                            }}
                        >
                            <PemeOverview records={pemeRecords} />
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
                                label="Search exam, date, or status"
                                variant="outlined"
                                fullWidth
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{ marginBottom: 2 }}
                            />
                            <PemeExamTypeTable
                                records={filteredRecords}
                                onRowClick={handleOnRowClick}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {openAddPemeRecordsModal && (
                <PemeRecordsAddModal
                    open={openAddPemeRecordsModal}
                    close={setOpenAddPemeRecordsModal}
                />
            )}
        </Layout>
    );
};

export default PemeRecords;
