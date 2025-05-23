import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    GlobalStyles,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Skeleton,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import GoogleConnectButton from "../Schedules/GoogleConnectButton";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import EventDialog from "./components/EventDialog";
import interactionPlugin from "@fullcalendar/interaction";

function SchedulesHolidays({ setSelectedDate }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleEventClick = ({ event }) => {
        setSelectedEvent({
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
        <Paper
            sx={{
                p: 3,
                borderRadius: 5,
                height: "100%",
            }}
        >
            {loading ? (
                <Box mt={2}>
                    <Skeleton variant="rectangular" height={400} />
                </Box>
            ) : (
                <>
                    {" "}
                    <GlobalStyles
                        styles={{
                            ".fc": { fontSize: "10px" },
                            ".fc-toolbar-title": { fontSize: "12px" },
                            ".fc-daygrid-day-number": { fontSize: "10px" },
                            ".fc-event": {
                                fontSize: "9px",
                                padding: "1px 2px",
                            },
                            ".fc-theme-standard": {
                                marginTop: 0,
                                marginBottom: 10,
                            },
                        }}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            width: "100%",
                        }}
                    >
                        <Box
                            sx={{
                                transformOrigin: "top center",
                                width: "100%",
                            }}
                        >
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                height="auto"
                                dayMaxEventRows={2}
                                events={events}
                                eventClick={handleEventClick}
                                dateClick={(arg) => {
                                    setSelectedDate(arg.dateStr); // '2025-05-22'
                                }}
                            />
                            <EventDialog
                                modalOpen={modalOpen}
                                setModalOpen={setModalOpen}
                                selectedEvent={selectedEvent}
                            />
                        </Box>
                    </Box>
                </>
            )}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: "#4d4d4d",
                }}
            >
                Schedules & Holidays
            </Typography>

            <List
                sx={{
                    bgcolor: "background.paper",
                }}
            >
                {events?.slice(0, 3).map((item, index) => (
                    <React.Fragment>
                        <ListItem
                            key={index}
                            alignItems="flex-start"
                            secondaryAction={
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#8a8a8a" }}
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
                                            item.type === "holiday"
                                                ? "#e53935"
                                                : "primary.main",
                                    }}
                                >
                                    {item.type == "schedule" ? (
                                        <PiCalendarHeart size={32} />
                                    ) : (
                                        <PiCalendarStar size={32} />
                                    )}
                                </Typography>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        {item.title}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption">
                                        {moment(item.start).format(
                                            "MMM. DD, YYYY"
                                        )}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>
            {loading ? (
                <Stack spacing={1} mt={2}>
                    <Skeleton variant="rectangular" height={30} />
                    <Skeleton variant="rectangular" height={30} />
                    <Skeleton variant="rectangular" height={30} />
                </Stack>
            ) : (
                <Stack>
                    {events.length > 0 ? (
                        <Box
                            component={Link}
                            to={"/admin/schedules"}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "primary.main",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                }}
                            >
                                View all..
                            </Typography>
                        </Box>
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
        </Paper>
    );
}

export default SchedulesHolidays;
