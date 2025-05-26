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
import React, { useEffect, useState } from "react";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

function EventDialog({
    modalOpen,
    setModalOpen,
    selectedEvent,
    onDelete,
    isDeleting,
    fetchEvents,
}) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        visibility_type: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedEvent) {
            setForm({
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
            });
        }
    }, [selectedEvent]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = async () => {
        try {
            console.log(selectedEvent);

            if (selectedEvent.type === "holiday") {
                alert("Regular holidays can't be edited.");
                return;
            }
            setIsLoading(true);
            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : [];

            const payload = {
                title: form.title,
                description: form.description,
                start_time: form.start_time,
                end_time: form.end_time,
            };

            if (form.visibility_type === "public") {
                await axiosInstance.put(
                    `/public-event/${selectedEvent.id.replace("db-", "")}`,
                    payload,
                    { headers }
                );
            } else {
                await axiosInstance.put(
                    `/google/event/${selectedEvent.id}`,
                    payload,
                    {
                        headers,
                    }
                );
            }

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
                            : form.visibility === "public"
                            ? "Public"
                            : "Private"
                    }
                    color={
                        selectedEvent?.type === "holiday"
                            ? "error"
                            : form.visibility === "public"
                            ? "success"
                            : "primary"
                    }
                    size="small"
                />
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Start Time"
                        name="start_time"
                        type="datetime-local"
                        value={form.start_time}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Time"
                        name="end_time"
                        type="datetime-local"
                        value={form.end_time}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Visibility</InputLabel>
                        <Select
                            name="visibility"
                            value={form.visibility_type}
                            label="Visibility"
                            onChange={handleChange}
                            defaultValue={form.visibility_type}
                            disabled={selectedEvent?.type === "holiday"} // prevent changing holiday type
                        >
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="public">Public</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>

            <DialogActions>
                {selectedEvent?.type !== "holiday" && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdate}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => onDelete(selectedEvent)}
                            loading={isDeleting}
                        >
                            Delete Event
                        </Button>
                    </>
                )}

                <Button onClick={() => setModalOpen(false)} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EventDialog;
