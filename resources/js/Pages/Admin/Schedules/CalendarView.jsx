import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import dayjs from "dayjs";

// MUI imports
import {
    Box,
    Card,
    CardContent,
    Typography,
    Skeleton,
    Paper,
    useTheme,
} from "@mui/material";

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const fetchEvents = async () => {
        try {
            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : [];

            const res = await axiosInstance.get(`/google/events`, {
                headers,
            });

            const mappedEvents = res.data.map((event) => ({
                title: event.title,
                start: dayjs(event.start).toISOString(),
                end: dayjs(event.end).toISOString(),
            }));

            setEvents(mappedEvents);
        } catch (err) {
            console.error("Error loading events", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <Card sx={{ boxShadow: 3, borderRadius: 3, overflow: "hidden", p: 2 }}>
            <CardContent>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                >
                    📅 Your Calendar Events
                </Typography>

                {loading ? (
                    <Box mt={2}>
                        <Skeleton variant="rectangular" height={400} />
                    </Box>
                ) : (
                    <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            height="auto"
                            events={events}
                            eventDisplay="block"
                            dayMaxEvents={3}
                            headerToolbar={{
                                start: "prev,next today",
                                center: "title",
                                end: "dayGridMonth,dayGridWeek,dayGridDay",
                            }}
                            contentHeight="auto"
                        />
                    </Paper>
                )}
            </CardContent>
        </Card>
    );
};

export default CalendarView;
