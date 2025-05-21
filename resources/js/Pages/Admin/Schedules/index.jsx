import React, { useState } from "react";
import GoogleConnectButton from "./GoogleConnectButton";
import EventForm from "./EventForm";
import CalendarView from "./CalendarView";
import Layout from "../../../components/Layout/Layout";

const ScheduleModule = () => {
    const [refresh, setRefresh] = useState(false);

    const handleEventCreated = () => {
        setRefresh((prev) => !prev); // trigger calendar re-fetch
    };

    return (
        <Layout>
            <h2>Schedules & Events</h2>
            <GoogleConnectButton />
            <EventForm onEventCreated={handleEventCreated} />
            <CalendarView key={refresh} />
        </Layout>
    );
};

export default ScheduleModule;
