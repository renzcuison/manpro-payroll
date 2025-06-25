import React from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useState, useEffect } from 'react';

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
    CircularProgress,
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

const GroupLifeEmployeeTable = ({ employees = [], onRowClick, search, loading, data }) => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        setRows(data);
    }, [data]);
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
                        <TableCell align="center"> Number of Dependents</TableCell>
                        <TableCell align="center"> Enroll Date</TableCell>
                        <TableCell align="center"> Branch </TableCell>
                        <TableCell align="center"> Department</TableCell>
                        <TableCell align="center"> Role</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center">
                            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                                <CircularProgress />
                            </Box>
                        </TableCell>
                    </TableRow>
                    ) :
                    employees.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} align="center">
                                <Typography>No Result Found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        employees.map((response) => {

                            return (
                                <TableRow
                                    key={response.employee_id}
                                    onClick={() => onRowClick(response)}
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
                                                response.employee_name ?? "Unknown",
                                                search)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {highlightMatch(
                                                String(
                                                    response.dependents_count ?? 0),
                                                    search)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {highlightMatch(
                                                response.enroll_date ?? "N/A", 
                                                search)}
                                        </TableCell>
                                        <TableCell align="center">
                                        {highlightMatch(response.branch?.name, search)}
                                        </TableCell>
                                        <TableCell align="center">
                                        {highlightMatch(response.department?.name, search)}
                                        </TableCell>      
                                        <TableCell align="center">
                                        {highlightMatch(response.role?.name, search)}
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