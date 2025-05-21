// src/components/GoogleCalendar.js
import React, { useEffect } from "react";
import { gapi } from "gapi-script";
import GoogleConnectButton from "../Schedules/GoogleConnectButton";

const CLIENT_ID =
    "406588029203-ujib29mst8i1l8fd7g10r5f6lgu1s046.apps.googleusercontent.com";
const API_KEY = "AIzaSyDl60RWCGHsJfv_HTyKM5VcV9Rnx7GMyBg";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const GoogleCalendar = () => {
    useEffect(() => {
        const initClient = () => {
            gapi.client
                .init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: [
                        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    ],
                    scope: SCOPES,
                })
                .then(() => {
                    // Make sure auth2 is initialized
                    if (!gapi.auth2.getAuthInstance()) {
                        gapi.auth2.init({
                            client_id: CLIENT_ID,
                        });
                    }
                });
        };

        gapi.load("client:auth2", initClient);
    }, []);

    const handleSignIn = () => {
        gapi.auth2.getAuthInstance().signIn();
    };

    const createEvent = () => {
        const event = {
            summary: "Team Meeting",
            location: "Zoom",
            description: "Discuss weekly goals",
            start: {
                dateTime: "2025-10-01T10:00:00+08:00",
                timeZone: "Asia/Manila",
            },
            end: {
                dateTime: "2025-10-01T11:00:00+08:00",
                timeZone: "Asia/Manila",
            },
        };

        gapi.client.calendar.events
            .insert({
                calendarId: "primary",
                resource: event,
            })
            .then((response) => {
                console.log("Event created:", response);
                alert("Event added to Google Calendar");
            });
    };

    return (
        <div>
            <GoogleConnectButton />
            <button onClick={createEvent}>Add Meeting</button>
        </div>
    );
};

export default GoogleCalendar;
