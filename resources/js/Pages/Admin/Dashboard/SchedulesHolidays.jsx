import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import moment from "moment";
import React from "react";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
const events = [
    {
        title: "Labor Day",
        type: "holiday",
        description: "Happy New Year!",
        startTime: "2022-01-01T00:00:00.000Z",
        endTime: "2022-01-01T23:59:59.999Z",
        color: "#FF69B4",
    },

    {
        title: "Monthly Business Review",
        type: "schedule",
        description: "This is event 1",
        startTime: "2022-01-02T10:00:00.000Z",
        endTime: "2022-01-02T11:00:00.000Z",
        color: "#FF69B4",
    },
    {
        title: "Department Reporting",
        type: "schedule",
        description: "This is event 2",
        startTime: "2022-01-02T12:00:00.000Z",
        endTime: "2022-01-02T13:00:00.000Z",
        color: "#FF69B4",
    },
    {
        title: "Election Day",
        type: "holiday",
        description: "Happy New Year!",
        startTime: "2025-05-12T00:00:00.000Z",
        endTime: "2025-05-12T23:59:59.999Z",
        color: "#FF69B4",
    },
];
function SchedulesHolidays({}) {
    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 5,
                height: "100%",
            }}
        >
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
            />
            <Typography
                variant="h5"
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
                {events?.map((item, index) => (
                    <React.Fragment>
                        <ListItem
                            alignItems="flex-start"
                            secondaryAction={
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#8a8a8a" }}
                                    >
                                        {moment(item.startTime).format(
                                            "MMM. DD, YYYY"
                                        )}
                                    </Typography>
                                </>
                            }
                            sx={{ px: 0 }}
                        >
                            <ListItemAvatar>
                                <Typography
                                    sx={{
                                        color: "primary.main",
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
                                        {item.description}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}

export default SchedulesHolidays;
