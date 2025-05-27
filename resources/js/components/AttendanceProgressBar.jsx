import { Box, Typography } from "@mui/material";
import React from "react";

function AttendanceProgressBar({ present, late, absent }) {
    const total = present + absent + late;
    const presentPercent = (present / total) * 100;
    const absentPercent = (absent / total) * 100;
    const latePercent = (late / total) * 100;

    const renderSegment = (percent, value, color, label) => (
        <Box
            sx={{
                width: `${percent}%`,
                bgcolor: color,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                color: "#fff",
                fontWeight: 500,
                whiteSpace: "nowrap",
                px: 1,
            }}
        >
            {value > 0 ? `${value}%` : ""}
        </Box>
    );
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    height: 20,
                    borderRadius: 1,
                    overflow: "hidden",
                    backgroundColor: "#e0e0e0",
                    textAlign: "center",
                }}
            >
                {renderSegment(
                    presentPercent,
                    present,
                    "success.main",
                    "Present"
                )}
                {renderSegment(latePercent, late, "warning.main", "Late")}
                {renderSegment(absentPercent, absent, "error.main", "Absent")}
            </Box>
        </>
    );
}

export default AttendanceProgressBar;
