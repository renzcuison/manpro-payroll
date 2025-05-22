import { Button } from "@mui/material";
import React from "react";

const GoogleConnectButton = () => {
    const handleConnect = () => {
        const storedUser = JSON.parse(localStorage.getItem("nasya_user"));
        window.location.href = `http://127.0.0.1:8000/api/google/redirect?token=${storedUser.token}`;
    };

    return (
        <Button onClick={handleConnect} variant="contained">
            Connect to Google Calendar
        </Button>
    );
};

export default GoogleConnectButton;
