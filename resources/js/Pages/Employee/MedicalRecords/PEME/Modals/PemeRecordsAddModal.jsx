import { Dialog, Typography, DialogTitle, Box, DialogContent, FormControl, Select, MenuItem, InputLabel, Button} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const PemeRecordsAddModal = ({ open, close }) => {
    const navigator = useNavigate();

    const [selectedRecord, setSelectedRecord] = React.useState("");

    const handleSubmit = () => {
        console.log("Record Name:", selectedRecord);
        navigator("/employee/medical-records/peme/peme-responses");
        // Backend Save Logic
    };

    const handleSelectChange = (event) => {
        setSelectedRecord(event.target.value);
        console.log("Selected Record:", event.target.value);
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="md"
            SlotProps={{
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
                        <InputLabel id="record-name-label">Select Type of Exam</InputLabel>
                        <Select
                            labelId="record-name-label"
                            id="record-name"
                            value={selectedRecord}
                            label="Select Type of Exam"
                            onChange={handleSelectChange}
                        >
                            
                            <MenuItem value="exam1">Annual Physical Exam</MenuItem>
                            <MenuItem value="exam2">Drug Test</MenuItem>
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
