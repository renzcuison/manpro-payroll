import {
    Dialog,
    Typography,
    DialogTitle,
    Box,
    DialogContent,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Button,
} from "@mui/material";
import React from "react";
import axiosInstance from "@/utils/axiosConfig";
import { useNavigate } from "react-router-dom";

const PemeRecordsAddModal = ({ open, close, records }) => {
    const navigator = useNavigate();

    const [selectedRecord, setSelectedRecord] = React.useState("");
    const [selectedExamID, setSelectedExamID] = React.useState();

    const getJWTHeader = (user) => {
        return {
            Authorization: `Bearer ${user.token}`,
        };
    };

    const handleSelectChange = (event) => {
        setSelectedRecord(event.target.value);
        const selectedExam = records.find(
            (exam) => exam.id === event.target.value
        );

        setSelectedExamID(event.target.value);
        console.log("Selected Exam ID:", selectedExamID);
        console.log("Selected Exam Name:", selectedExam?.name);
    };

    const handleSubmit = async () => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));
        try {
            const payload = {
                peme_id: selectedExamID,
            };
            console.log(payload);
            const response = await axiosInstance.post(
                "/peme-responses",
                payload,
                { headers }
            );
            console.log("Successfully created questionnaire:", response.data);
        } catch (error) {
            console.error("Error creating questionnaire:", error);
            return null;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="md"
            slotProps={{
                sx: {
                    backgroundColor: "#f8f9fa",
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    borderRadius: "20px",
                    minWidth: { xs: "100%", sm: "500px" },
                    maxWidth: "800px",
                },
            }}
        >
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        borderBottom: "1px solid #ccc",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Answer an Exam
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ padding: 5 }}>
                <Box component={`form`} autoComplete="off">
                    <FormControl
                        fullWidth
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            paddingY: 2,
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel id="record-name-label">
                                Select Type of Exam
                            </InputLabel>
                            <Select
                                labelId="record-name-label"
                                id="record-name"
                                value={selectedRecord}
                                label="Select Type of Exam"
                                onChange={handleSelectChange}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 320,
                                        },
                                    },
                                }}
                            >
                                {records.map((exam) => (
                                    <MenuItem
                                        key={exam.id}
                                        value={exam.id} // <-- use exam.id here
                                        sx={{ paddingY: 2 }}
                                    >
                                        {exam.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box>
                                <Button
                                    onClick={close}
                                    variant="contained"
                                    sx={{ backgroundColor: "#727F91" }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    onClick={() => {
                                        handleSubmit();
                                        close(true);
                                    }}
                                    variant="contained"
                                >
                                    Create
                                </Button>
                            </Box>
                        </Box>
                    </FormControl>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PemeRecordsAddModal;
