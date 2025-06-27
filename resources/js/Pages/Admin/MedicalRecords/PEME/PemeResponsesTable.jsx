import React from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// MUI components
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Box,
    Typography,
} from "@mui/material";

dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);

const GradientProgressBar = ({ percentage, status }) => {
    const gradient =
        status === "Rejected"
            ? "linear-gradient(to right, #b71c1c, #ff5252)" // red gradient
            : status === "Clear"
                ? "green"
                : "linear-gradient(to right, #177604, #E9AE20)"; // default

    const progress = Number(percentage);

    return (
        <Box sx={{
            width: "100%",
        }}>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 10,
                    borderRadius: 5,
                    [`& .MuiLinearProgress-bar`]: {
                        background: gradient,
                    },
                }}
            />
        </Box>
    );
};

const highlightMatch = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={index} style={{ backgroundColor: "#E9AE20" }}>
                {part}
            </mark>
        ) : (
            part
        )
    );
};

const getDueStatus = (dueDateString) => {
    const today = new Date();
    const dueDate = new Date(dueDateString);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    if (diffDays < 0) {
        const overdueDays = Math.abs(diffDays);
        let message = "";

        if (overdueDays < 7)
            message = `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""
                }`;
        else if (overdueDays < 30) {
            const weeks = Math.floor(overdueDays / 7);
            message = `Overdue by ${weeks} week${weeks > 1 ? "s" : ""}`;
        } else if (overdueDays < 365) {
            const months = Math.floor(overdueDays / 30);
            message = `Overdue by ${months} month${months > 1 ? "s" : ""}`;
        } else {
            const years = Math.floor(overdueDays / 365);
            message = `Overdue by ${years} year${years > 1 ? "s" : ""}`;
        }

        return (
            <span style={{ color: "red", fontWeight: "bold" }}>{message}</span>
        );
    }

    if (diffDays === 0)
        return (
            <span style={{ color: "#E9AE20", fontWeight: "bold" }}>
                Due today
            </span>
        );
    if (diffDays < 7)
        return (
            <span style={{ color: "#E9AE20", fontWeight: "bold" }}>
                Due in {diffDays} day{diffDays !== 1 ? "s" : ""}
            </span>
        );
    if (diffDays < 14) return `Next ${weekdays[dueDate.getDay()]}`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `In ${weeks} week${weeks > 1 ? "s" : ""}`;
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `In ${months} month${months > 1 ? "s" : ""}`;
    }

    const years = Math.floor(diffDays / 365);
    return `In ${years} year${years > 1 ? "s" : ""}`;
};

const PemeResponsesTable = ({ responses, onRowClick, search }) => {
    return (
        <TableContainer style={{ overflowY: "scroll" }} sx={{ height: 400 }}>
            <Table stickyHeader aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center"> Date </TableCell>
                        <TableCell align="center"> Expiry Date </TableCell>
                        <TableCell align="center"> Next Schedule </TableCell>
                        <TableCell align="center"> Employee </TableCell>
                        <TableCell align="center"> Branch </TableCell>
                        <TableCell align="center"> Department </TableCell>
                        <TableCell align="center"> Progress</TableCell>
                        <TableCell align="center"> Status </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {responses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                <Typography>No Result Found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        responses.map((response, index) => {
                            const formattedDate = dayjs(response.date).format(
                                "MMMM D, YYYY"
                            );

                            return response.map((detail, index) => {
                                console.log("DETAILS", detail);
                                return (
                                    <TableRow
                                        key={detail.id || index}
                                        onClick={() =>
                                            onRowClick(detail.response_id)
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            transition: ".15s",
                                            "&:hover": {
                                                backgroundColor: "#e0e0e0",
                                            },
                                        }}
                                    >
                                        <TableCell align="center">
                                            {highlightMatch(
                                                formattedDate,
                                                search
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {dayjs(detail.expiry_date).isValid() ? (
                                                <>
                                                    {dayjs(detail.expiry_date).format("MMMM D, YYYY")}
                                                    <p></p>
                                                    {getDueStatus(detail.expiry_date)}
                                                </>
                                            ) : (
                                                "Pending"
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {dayjs(detail.next_schedule).isValid() ? (
                                                <>
                                                    {dayjs(detail.next_schedule).format("MMMM D, YYYY")}
                                                    <p></p>
                                                    {getDueStatus(detail.next_schedule)}
                                                </>
                                            ) : (
                                                "Pending"
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {highlightMatch(
                                                detail.respondent,
                                                search
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {highlightMatch(
                                                detail.branch,
                                                search
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {highlightMatch(
                                                detail.department,
                                                search
                                            )}
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                {detail.progress ? (
                                                    <>
                                                        <GradientProgressBar
                                                            percentage={
                                                                detail.progress
                                                                    .percent
                                                            }
                                                            status={
                                                                detail.status
                                                            }
                                                        />
                                                        <Typography>
                                                            {
                                                                detail.progress
                                                                    .completed
                                                            }{" "}
                                                            /{" "}
                                                            {
                                                                detail.progress
                                                                    .total
                                                            }
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        <GradientProgressBar
                                                            percentage={0}
                                                            status={
                                                                detail.status
                                                            }
                                                        />
                                                        <Typography>
                                                            0 / 0
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            {highlightMatch(
                                                detail.status,
                                                search
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            });
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeResponsesTable;