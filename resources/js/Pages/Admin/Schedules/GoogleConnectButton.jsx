import { Button } from "@mui/material";
import React from "react";

const GoogleConnectButton = () => {
    const handleConnect = () => {
        const storedUser = JSON.parse(localStorage.getItem("nasya_user"));
        const apiUrl = import.meta.env.VITE_API_URL;

        window.location.href = `${apiUrl}/google/redirect?token=${storedUser.token}`;
    };

    return (
        <Button onClick={handleConnect} variant="contained">
            Connect to Google Calendar
        </Button>
    );
};

export default GoogleConnectButton;
