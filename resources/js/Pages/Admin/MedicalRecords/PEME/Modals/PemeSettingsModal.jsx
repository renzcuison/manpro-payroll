import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Switch,
    FormControlLabel,
    Typography,
    Box,
} from "@mui/material";
import Swal from "sweetalert2";
import axiosInstance from "@/utils/axiosConfig";

const PemeSettingsModal = ({
    open,
    onClose,
    visible,
    setVisible,
    PemeID,
    pemeRecords,
    headers,
}) => {
    const handleVisibilityToggle = async () => {
        const isCurrentlyVisible = visible;

        if (isCurrentlyVisible) {
            Swal.fire({
                title: "Hide this PEME Exam?",
                text: `You are about to hide "${pemeRecords?.peme || "this PEME Exam"}".`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Hide",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d33",
                customClass: { container: "my-swal" },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await axiosInstance.patch(
                            `/updatePemeSettings/${PemeID}`,
                            { isVisible: 0 },
                            { headers }
                        );
                        setVisible(false);
                        Swal.fire({
                            icon: "success",
                            text: `PEME exam hidden successfully.`,
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    } catch (error) {
                        console.error("Visibility toggle failed:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Failed to update visibility.",
                        });
                    }
                }
            });
        } else {
            try {
                await axiosInstance.patch(
                    `/updatePemeSettings/${PemeID}`,
                    { isVisible: 1 },
                    { headers }
                );
                setVisible(true);
            } catch (error) {
                console.error("Visibility toggle failed:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to update visibility.",
                });
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    backgroundColor: "#f8f9fa",
                    width: { xs: "100%", md: "25vw" },
                    borderRadius: "20px",
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <DialogTitle sx={{ pb: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Exam Settings
                </Typography>
            </DialogTitle>

            <DialogContent
                sx={{
                    flex: 1,
                    padding: 3,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={visible}
                                onClick={handleVisibilityToggle}
                            />
                        }
                        label={`Exam Visibility: ${visible ? "Visible" : "Hidden"}`}
                    />
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: 3,
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        backgroundColor: "#727F91",
                        "&:hover": {
                            backgroundColor: "#5e6b7a",
                        },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PemeSettingsModal;
