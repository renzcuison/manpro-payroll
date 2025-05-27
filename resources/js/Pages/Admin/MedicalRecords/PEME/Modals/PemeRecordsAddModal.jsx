import {
    Dialog,
    Typography,
    DialogTitle,
    Box,
    DialogContent,
    FormControl,
    TextField,
    Button,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from'@/utils/axiosConfig';

const PemeRecordsAddModal = ({ open, close }) => {
    const [recordName, setRecordName] = React.useState("");
    const navigator = useNavigate();
     const getJWTHeader = (user) => {
        return {
        Authorization: `Bearer ${user.token}`, 
    };
    };

    const handleSubmit = async () => {
     console.log("Record Name:", recordName);

    if (!recordName.trim()) {
        alert("Please enter exam name.");
        return;
    }

    const storedUser = localStorage.getItem("nasya_user"); 
    const headers = getJWTHeader(JSON.parse(storedUser));
    try {
        const response = await axiosInstance.post(
        "/pemes",
        { name: recordName },
        { headers }
        );
        console.log("Successfully created questionnaire:", response.data); 
        close(true); 
    } catch (error) {
        console.error("Error creating questionnaire:", error);
    }
    }
    const handleTextFieldChange = (event) => {
        setRecordName(event.target.value);
        console.log(recordName);
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="md"
            PaperProps={{
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
                        Create Record
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
                        <TextField
                            required
                            fullWidth
                            label="Record Name"
                            variant="outlined"
                            onChange={handleTextFieldChange}
                        />

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
                                    Confirm
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
