import React from "react";
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

const GradientProgressBar = ({ currentProgress, completeProgress, status }) => {
    const progress = (currentProgress / completeProgress) * 100;

    const gradient =
        status === "Rejected"
            ? "linear-gradient(to right, #b71c1c, #ff5252)" // red gradient
            : "linear-gradient(to right, #177604, #E9AE20)"; // default

    return (
        <Box sx={{ width: "100%" }}>
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
    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: '#E9AE20'}}>{part}</mark>
        ) : (
        part
        )
    );
    };

const PemeResponsesTable = ({ responses, onRowClick, search }) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <strong>Date</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Due Date</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Employee</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Branch</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Department</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Progress</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Status</strong>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {responses.map((response) => (
                        <TableRow
                            key={response.id}
                            onClick={onRowClick}
                            sx={{
                                cursor: "pointer",
                                transition: ".15s",
                                "&:hover": { backgroundColor: "#e0e0e0" },
                            }}
                        >
                            <TableCell>{highlightMatch(response.date, search)}</TableCell>
                            <TableCell>{response.dueDate}</TableCell>
                            <TableCell>{highlightMatch(response.employee, search)}</TableCell>
                            <TableCell>{highlightMatch(response.branch, search)}</TableCell>
                            <TableCell>{highlightMatch(response.department, search)}</TableCell>

                            <TableCell>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <GradientProgressBar
                                        currentProgress={
                                            response.currentProgress
                                        }
                                        completeProgress={response.fullProgress}
                                        status={response.status}
                                    ></GradientProgressBar>
                                    <Typography>
                                        {response.currentProgress} /{" "}
                                        {response.fullProgress}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{highlightMatch(response.status, search)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeResponsesTable;
