import React, { useState } from "react";
import GoogleConnectButton from "./GoogleConnectButton";
import EventForm from "./EventForm";
import CalendarView from "./CalendarView";
import Layout from "../../../components/Layout/Layout";
import { Box, Grid, Paper, Stack } from "@mui/material";

const ScheduleModule = () => {
    const [refresh, setRefresh] = useState(false);
    const [events, setEvents] = useState([]);

    const handleEventCreated = () => {
        setRefresh((prev) => !prev); // trigger calendar re-fetch
    };

    return (
        <Layout>
            <Stack spacing={2}>
                <h2>Schedules & Holidays</h2>
                <Box>
                    <GoogleConnectButton />
                </Box>
                <Paper sx={{ p: 5, borderRadius: 5 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <CalendarView
                                key={refresh}
                                setCalendarEvents={setEvents}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, lg: 4 }}>
                            <EventForm
                                onEventCreated={handleEventCreated}
                                events={events}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Stack>
        </Layout>
    );
};

export default ScheduleModule;
