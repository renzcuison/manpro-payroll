import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useForm, Controller } from "react-hook-form";

function EventDialog({
    modalOpen,
    setModalOpen,
    selectedEvent,
    onDelete,
    isDeleting,
    fetchEvents,
}) {
    const [isLoading, setIsLoading] = useState(false);
    console.log("Selected Event:", selectedEvent);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            start_time: "",
            end_time: "",
            visibility_type: "private",
            status: "waiting",
        },
    });

    useEffect(() => {
        if (selectedEvent) {
            reset({
                id: selectedEvent.id,
                title: selectedEvent.title || "",
                description: selectedEvent.description || "",
                start_time: dayjs(selectedEvent.start).format(
                    "YYYY-MM-DDTHH:mm"
                ),
                end_time: dayjs(selectedEvent.end).format("YYYY-MM-DDTHH:mm"),
                visibility_type:
                    selectedEvent.visibility_type === "public"
                        ? "public"
                        : "private",
                status: selectedEvent.status || "waiting",
            });
        }
    }, [selectedEvent, reset]);

    const onSubmit = async (data) => {
        try {
            if (selectedEvent.type === "holiday") {
                alert("Regular holidays can't be edited.");
                return;
            }

            setIsLoading(true);
            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : [];

            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("start_time", data.start_time);
            formData.append("end_time", data.end_time);
            formData.append("status", data.status);
            formData.append("visibility", data.visibility_type);
            formData.append("_method", "put");

            const requestUrl = `/google/event/${selectedEvent.id}`;

            await axiosInstance.post(requestUrl, formData, { headers });

            alert("Event updated successfully.");
            setModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update event.");
        } finally {
            setIsLoading(false);
        }
    };

    const visibility = watch("visibility_type");

    return (
        <Dialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selectedEvent?.type === "holiday" ? (
                    <PiCalendarStar color="#e53935" size={24} />
                ) : (
                    <PiCalendarHeart color="#1976d2" size={24} />
                )}
                <Typography variant="h6" component="div">
                    {selectedEvent?.title}
                </Typography>
                <Chip
                    label={
                        selectedEvent?.type === "holiday"
                            ? "Holiday"
                            : visibility === "public"
                            ? "Public"
                            : "Private"
                    }
                    color={
                        selectedEvent?.type === "holiday"
                            ? "error"
                            : visibility === "public"
                            ? "success"
                            : "primary"
                    }
                    size="small"
                />
            </DialogTitle>

            <DialogContent dividers>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField
                            label="Title"
                            fullWidth
                            {...register("title", { required: true })}
                        />
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                            {...register("description")}
                        />
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register("start_time", { required: true })}
                        />
                        <TextField
                            label="End Time"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register("end_time", { required: true })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Visibility</InputLabel>
                            <Controller
                                name="visibility_type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Visibility"
                                        {...field}
                                        disabled={
                                            selectedEvent?.type === "holiday"
                                        }
                                    >
                                        <MenuItem value="private">
                                            Private
                                        </MenuItem>
                                        <MenuItem value="public">
                                            Public
                                        </MenuItem>
                                    </Select>
                                )}
                            />
                        </FormControl>
                        {visibility === "public" && (
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Status"
                                            {...field}
                                            disabled={
                                                selectedEvent?.type ===
                                                "holiday"
                                            }
                                        >
                                            <MenuItem value="waiting">
                                                Waiting
                                            </MenuItem>
                                            <MenuItem value="done">
                                                Done
                                            </MenuItem>
                                            <MenuItem value="suspended">
                                                Suspended
                                            </MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        )}
                    </Stack>
                    <DialogActions sx={{ mt: 2 }}>
                        {selectedEvent?.type !== "holiday" && (
                            <>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => onDelete(selectedEvent)}
                                    disabled={isDeleting}
                                >
                                    Delete Event
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => setModalOpen(false)}
                            variant="outlined"
                        >
                            Close
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EventDialog;
