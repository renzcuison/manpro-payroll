import React from "react";
import { useEffect } from "react";
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
    CircularProgress
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
    loading,
}) => {
    useEffect(() => {
        if (hasRespondents && editable === 1) {
            axiosInstance.patch(
                `/updatePemeSettings/${PemeID}`,
                { isEditable: 0 },
                { headers }
            ).then(() => {
                setEditable(0);
            }).catch((error) => {
                console.error("error", error);
            });
        }
    }, [hasRespondents, editable, PemeID, headers, setEditable]);

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
                text: `Multiple responses ${newValue ? "enabled" : "disabled"
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
            setEditable(newValue ? 1 : 0);
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
                    Settings
                </Typography>
            </DialogTitle>

            <DialogContent
                sx={{
                    flex: 1,
                    padding: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {loading || visible === null || editable === null || multiple === null ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <CircularProgress size={40} sx={{ color: "#2e7d32" }} />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ mt: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={visible}
                                        onClick={handleVisibilityToggle}
                                        sx={{ transform: "scale(1.2)" }}
                                    />
                                }
                                label={`Visibility`}
                                labelPlacement="start"
                                sx={{
                                    columnGap: 1,
                                    "& .MuiFormControlLabel-label": {
                                        fontSize: "1.1rem",
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={multiple}
                                        onClick={handleMultipleToggle}
                                        sx={{ transform: "scale(1.2)" }}
                                    />
                                }
                                label={`Multiple`}
                                labelPlacement="start"
                                sx={{
                                    columnGap: 1.3,
                                    "& .MuiFormControlLabel-label": {
                                        fontSize: "1.1rem",
                                    }
                                }}
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
                                        sx={{ transform: "scale(1.2)" }}
                                    />
                                }
                                label={`Editable`}
                                labelPlacement="start"
                                sx={{
                                    columnGap: 1,
                                    "& .MuiFormControlLabel-label": {
                                        fontSize: "1.1rem",
                                    }
                                }}
                            />
                            <Typography
                                sx={{
                                    color: "rgba(201, 42, 42, 1)",
                                    fontWeight: "bold",
                                    fontSize: "12px"
                                }}
                            >
                                {hasRespondents ? "Responses already exist." : ""}
                            </Typography>
                        </Box>
                    </>
                )}
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
