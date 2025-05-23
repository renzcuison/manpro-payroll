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
    Stack,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
} from "@mui/material";
import EventDialog from "../Dashboard/components/EventDialog";
import GoogleConnectButton from "./GoogleConnectButton";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
import moment from "moment";
import { Link } from "react-router-dom";

const CalendarView = ({ setCalendarEvents }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    console.log(selectedEvent);

    const handleEventClick = ({ event }) => {
        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            description: event.extendedProps.description,
            type: event.extendedProps.type,
        });
        setModalOpen(true);
    };

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
                id: event.id,
                title: event.title,
                start: dayjs(event.start).toISOString(),
                end: dayjs(event.end).toISOString(),
                color: event.calendar?.includes("holiday")
                    ? "#e53935"
                    : "#1976d2", // 🔴 red for holidays, blue for schedules
                type: event.calendar?.includes("holiday")
                    ? "holiday"
                    : "schedule",
            }));

            setEvents(mappedEvents);
            setCalendarEvents(mappedEvents);
        } catch (err) {
            console.error("Error loading events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            console.log(eventId);

            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : [];

            await axiosInstance.delete(`/google/event/${eventId}`, { headers });

            alert("Event deleted.");
            setModalOpen(false); // Close the modal
            fetchEvents(); // Refresh calendar
        } catch (error) {
            console.error("Failed to delete event", error);
            alert("Failed to delete event.");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <Stack spacing={2}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                📅 Your Calendar Events
            </Typography>
            {loading ? (
                <Box mt={2}>
                    <Skeleton variant="rectangular" height={400} />
                </Box>
            ) : (
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
                    eventClick={handleEventClick}
                />
            )}

            <EventDialog
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                selectedEvent={selectedEvent}
                onDelete={handleDeleteEvent}
            />
        </Stack>
    );
};

export default CalendarView;
