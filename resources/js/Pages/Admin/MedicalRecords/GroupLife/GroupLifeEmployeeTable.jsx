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

const GroupLifeEmployeeTable = ({ employees = [], onRowClick, search }) => {
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
                        <TableCell align="center"> Employee </TableCell>
                        <TableCell align="center"> Dependents</TableCell>
                        <TableCell align="center"> Branch </TableCell>
                        <TableCell align="center"> Department</TableCell>
                        <TableCell align="center"> Role</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {employees.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Typography>No Result Found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        employees.map((response) => {

                            return (
                                <TableRow
                                    key={response.employee}
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
                                            response.employee,
                                            search
                                        )}
                                        </TableCell>
                                        <TableCell align="center">
                                        {highlightMatch(
                                            response.dependents,
                                            search
                                        )}
                                        </TableCell>
                                        <TableCell align="center">
                                        {highlightMatch(
                                            response.branch,
                                            search
                                        )}
                                        </TableCell>
                                        <TableCell align="center">
                                        {highlightMatch(
                                            response.department,
                                            search
                                        )}
                                        </TableCell>      
                                        <TableCell align="center">
                                        {highlightMatch(
                                            response.role,
                                            search
                                        )}
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

export default GroupLifeEmployeeTable;
