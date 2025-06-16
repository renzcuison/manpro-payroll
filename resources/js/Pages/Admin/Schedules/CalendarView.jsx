import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import dayjs from "dayjs";

// MUI imports
import { Box, Typography, Skeleton, useTheme, Stack } from "@mui/material";
import EventDialog from "../Dashboard/components/EventDialog";

const CalendarView = ({ setCalendarEvents }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    console.log(selectedEvent);
    console.log("Events:", events);

    const handleEventClick = ({ event }) => {
        console.log(event.extendedProps);

        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            description: event.extendedProps.description,
            type: event.extendedProps.type,
            visibility_type: event.extendedProps.visibility_type,
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

            const mappedEvents = res.data
                .map((event) => ({
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
                    description: event.description,
                    visibility_type: event.visibility_type,
                }))
                .sort((a, b) => {
                    return new Date(a.start) - new Date(b.start);
                });

            setEvents(mappedEvents);
            setCalendarEvents(mappedEvents);
        } catch (err) {
            console.error("Error loading events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (event) => {
        try {
            console.log(event);
            setIsDeleting(true);
            if (confirm("Are you sure you want to delete this event?")) {
                const storedUser = localStorage.getItem("nasya_user");
                const headers = storedUser
                    ? getJWTHeader(JSON.parse(storedUser))
                    : [];

                if (event.visibility_type === "public") {
                    await axiosInstance.delete(
                        `/public-event/${event.id.replace("db-", "")}`,
                        {
                            headers,
                        }
                    );
                } else {
                    await axiosInstance.delete(`/google/event/${event.id}`, {
                        headers,
                    });
                }

                alert("Event deleted.");
                setModalOpen(false); // Close the modal
                fetchEvents(); // Refresh calendar
            }

            setIsDeleting(false);
        } catch (error) {
            console.error("Failed to delete event", error);
            alert("Failed to delete event.");
            setIsDeleting(false);
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
                    displayEventTime={false}
                />
            )}

            <EventDialog
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                selectedEvent={selectedEvent}
                onDelete={handleDeleteEvent}
                fetchEvents={fetchEvents}
                isDeleting={isDeleting}
            />
        </Stack>
    );
};

export default CalendarView;
