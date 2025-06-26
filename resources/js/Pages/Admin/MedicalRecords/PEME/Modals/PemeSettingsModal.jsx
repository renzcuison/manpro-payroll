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
    multiple,
    setMultiple,
    editable,
    setEditable,
    PemeID,
    pemeRecords,
    headers,
    hasRespondents,
}) => {
    const handleMultipleToggle = async () => {
        const newValue = multiple ? 0 : 1;

        try {
            await axiosInstance.patch(
                `/updatePemeSettings/${PemeID}`,
                { isMultiple: newValue },
                { headers }
            );
            setMultiple(!!newValue);
            Swal.fire({
                icon: "success",
                text: `Multiple responses ${
                    newValue ? "enabled" : "disabled"
                }.`,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            console.error("Multiple toggle failed:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update multiple setting.",
            });
        }
    };

    const handleEditableToggle = async () => {
        const newValue = editable ? 0 : 1;

        try {
            await axiosInstance.patch(
                `/updatePemeSettings/${PemeID}`,
                { isEditable: newValue },
                { headers }
            );
            setEditable(!!newValue);
            Swal.fire({
                icon: "success",
                text: `Editing has been ${newValue ? "enabled" : "disabled"}.`,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            console.error("Editable toggle failed:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update editable setting.",
            });
        }
    };

    const handleVisibilityToggle = async () => {
        const newValue = visible ? 0 : 1;

        try {
            await axiosInstance.patch(
                `/updatePemeSettings/${PemeID}`,
                { isVisible: newValue },
                { headers }
            );
            setVisible(!!newValue);
            Swal.fire({
                icon: "success",
                text: `PEME exam is now ${newValue ? "visible" : "hidden"}.`,
                toast: true,
                position: "top-end",
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
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    backgroundColor: "#f8f9fa",
                    width: { xs: "100%", md: "23vw" },
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
                        label={`Visibility: ${visible ? "Public" : "Hidden"}`}
                    />
                </Box>

                <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={multiple}
                                onClick={handleMultipleToggle}
                            />
                        }
                        label={`Response: ${multiple ? "Multiple" : "Single"}`}
                    />
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editable}
                                onClick={handleEditableToggle}
                                disabled={hasRespondents}
                            />
                        }
                        label={`Editable: ${editable ? "Yes" : "No"}`}
                    />
                    <Typography
                        sx={{
                            color: "rgba(201, 42, 42, 1)",
                            fontWeight: "bold",
                        }}
                    >
                        {hasRespondents ? "Drafts currently exist" : ""}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: 3,
                    mt: -3,
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
