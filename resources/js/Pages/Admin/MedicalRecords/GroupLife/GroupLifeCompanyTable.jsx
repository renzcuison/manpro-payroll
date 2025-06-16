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


const highlightMatch = (text, keyword) => {
    if (!keyword) return text;

    const strText = text?.toString?.() ?? ""; // ensures numbers (e.g. 300.00) are handled
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = strText.split(regex);

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

const GroupLifeCompanyTable = ({ rows, onRowClick, search }) => {
    return (
        <TableContainer
            sx={{
                marginTop: 2,
                overflowY: "scroll",
                minHeight: 400,
                maxHeight: 500,
            }}
            style={{ overflowX: "auto" }}
        >
            <Table stickyHeader aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center"> Companies </TableCell>
                        <TableCell align="center"> Plan Type</TableCell>
                        <TableCell align="center"> Payment Type </TableCell>
                        <TableCell align="center"> Employer Share </TableCell>
                        <TableCell align="center"> Employee Share </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography>No Result Found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, idx) => {

                            return (
                                <TableRow
                                    key={idx}
                                    onClick={onRowClick}
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
                                            row.groupLifeName, 
                                            search)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {highlightMatch(
                                            row.planType,
                                            search
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {highlightMatch(
                                            row.paymentType,
                                            search
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {highlightMatch(Number(row.employerShare).toFixed(2), search)}
                                    </TableCell>

                                    <TableCell align="center">
                                        {highlightMatch(Number(row.employeeShare).toFixed(2), search)}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GroupLifeCompanyTable;
