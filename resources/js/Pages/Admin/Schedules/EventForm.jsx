import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Skeleton,
    Stack,
} from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
import moment from "moment";
import GoogleConnectButton from "./GoogleConnectButton";
import { Link } from "react-router-dom";

const EventForm = ({ onEventCreated, events }) => {
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
        <Box>
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
            <Divider sx={{ borderStyle: "dashed", my: 2 }} />
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: "#4d4d4d",
                }}
            >
                Schedules & Holidays
            </Typography>

            <Box maxHeight={200} sx={{ overflowY: "scroll" }}>
                {loading ? (
                    <Stack spacing={1} mt={2}>
                        <Skeleton variant="rectangular" height={30} />
                        <Skeleton variant="rectangular" height={30} />
                        <Skeleton variant="rectangular" height={30} />
                    </Stack>
                ) : (
                    <Stack>
                        {events.length > 0 ? (
                            <List
                                sx={{
                                    bgcolor: "background.paper",
                                }}
                            >
                                {events?.map((item, index) => (
                                    <React.Fragment>
                                        <ListItem
                                            key={index}
                                            alignItems="flex-start"
                                            secondaryAction={
                                                <>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#8a8a8a",
                                                        }}
                                                    >
                                                        {item.type === "holiday"
                                                            ? "Holiday"
                                                            : "Event"}
                                                    </Typography>
                                                </>
                                            }
                                            sx={{ px: 0 }}
                                        >
                                            <ListItemAvatar>
                                                <Typography
                                                    sx={{
                                                        color:
                                                            item.type ===
                                                            "holiday"
                                                                ? "#e53935"
                                                                : "primary.main",
                                                    }}
                                                >
                                                    {item.type == "schedule" ? (
                                                        <PiCalendarHeart
                                                            size={32}
                                                        />
                                                    ) : (
                                                        <PiCalendarStar
                                                            size={32}
                                                        />
                                                    )}
                                                </Typography>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption">
                                                        {moment(
                                                            item.start
                                                        ).format(
                                                            "MMM. DD, YYYY"
                                                        )}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        <Divider
                                            variant="inset"
                                            component="li"
                                        />
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Stack spacing={2}>
                                <Typography
                                    variant="caption"
                                    width="100%"
                                    sx={{
                                        color: "primary.main",
                                        textAlign: "center",
                                        fontWeight: "bold",
                                    }}
                                >
                                    No data found..
                                </Typography>

                                <GoogleConnectButton />
                            </Stack>
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default EventForm;
