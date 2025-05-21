import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
} from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

const EventForm = ({ onEventCreated }) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : [];

            await axiosInstance.post("/google/event", form, { headers });
            onEventCreated(); // refresh calendar
            setForm({
                title: "",
                description: "",
                start_time: "",
                end_time: "",
            });
            alert("✅ Event created successfully!");
        } catch (error) {
            console.error(error);
            alert("❌ Failed to create event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                ➕ Add New Event
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                    fullWidth
                    name="title"
                    label="Event Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    value={form.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    name="start_time"
                    label="Start Time"
                    type="datetime-local"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    name="end_time"
                    label="End Time"
                    type="datetime-local"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? "Adding..." : "Add Event"}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default EventForm;
