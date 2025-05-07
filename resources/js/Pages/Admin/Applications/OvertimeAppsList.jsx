import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableRow,
    TablePagination, Box, Typography, CircularProgress, Chip,
    Grid, TextField, MenuItem, Checkbox, ListItemText
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import { getComparator, stableSort } from "../../../components/utils/tableUtils";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import ViewOvertime from "./Modals/ViewOvertime";

const headCells = [
    { id: "time_in", label: "Date", sortable: true },
    { id: "emp_name", label: "Employee", sortable: true },
    { id: "reason", label: "Reason", sortable: false },
    { id: "time", label: "Time", sortable: false },
    { id: "status", label: "Status", sortable: false },
];

const OvertimeAppsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [overtimes, setOvertimes] = useState([]);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("emp_name");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openViewOvertime, setOpenViewOvertime] = useState(false);
    const [loadOvertime, setLoadOvertime] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(["Pending", "Approved", "Declined"]);

    useEffect(() => {
        fetchOvertime();
    }, []);

    const fetchOvertime = () => {
        setIsLoading(true);
        axiosInstance
            .get("/applications/getOvertimeApplications", { headers })
            .then((response) => {
                setOvertimes(response.data.applications);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching applications:", error);
                setIsLoading(false);
            });
    };

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenViewOvertime = (overtime) => {
        setLoadOvertime(overtime);
        setOpenViewOvertime(true);
    };

    const handleCloseViewOvertime = (reload) => {
        setOpenViewOvertime(false);
        if (reload) {
            fetchOvertime();
        }
    };

    // Apply filters: by name and by status
    const filteredOvertimes = overtimes.filter(overtime =>
        overtime.emp_name.toLowerCase().includes(searchName.toLowerCase()) &&
        selectedStatus.includes(overtime.status)
    );

    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Overtime Applications
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
                        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                            {/* Search Name - Left Side */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id="searchName"
                                    label="Search Name"
                                    variant="outlined"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    fullWidth
                                />
                            </Grid>

                            {/* Filter by Status - Right Side */}
                            <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                                <Box sx={{ width: "250px" }}>
                                    <TextField
                                        select
                                        id="status-filter"
                                        label="Filter by Status"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        SelectProps={{
                                            multiple: true,
                                            renderValue: (selected) => selected.join(", "),
                                        }}
                                        fullWidth
                                    >
                                        {["Pending", "Approved", "Declined"].map((option) => (
                                            <MenuItem key={option} value={option}>
                                                <Checkbox checked={selectedStatus.includes(option)} />
                                                <ListItemText primary={option} />
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }}>
                                    <Table>
                                        <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                        <TableBody>
                                            {filteredOvertimes.length > 0 ? (
                                                stableSort(filteredOvertimes, getComparator(order, orderBy))
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((overtime, index) => (
                                                        <TableRow
                                                            key={overtime.application}
                                                            onClick={() => handleOpenViewOvertime(overtime)}
                                                            sx={{
                                                                p: 1,
                                                                backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff",
                                                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" }
                                                            }}
                                                        >
                                                            <TableCell>{dayjs(overtime.time_in).format("MMMM D, YYYY")}</TableCell>
                                                            <TableCell>{overtime.emp_name}</TableCell>
                                                            <TableCell>{overtime.reason}</TableCell>
                                                            <TableCell>{dayjs(overtime.time_in).format("hh:mm:ss A")} - {dayjs(overtime.time_out).format("hh:mm:ss A")}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={overtime.status}
                                                                    color={
                                                                        overtime.status === "Approved" ? "success" :
                                                                            overtime.status === "Declined" ? "error" : "warning"
                                                                    }
                                                                    sx={{ fontWeight: "bold", px: 1 }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                        No Applications Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={filteredOvertimes.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{
                                        ".MuiTablePagination-actions": { mb: 2 },
                                        ".MuiInputBase-root": { mb: 2 },
                                        bgcolor: "#ffffff",
                                        borderRadius: "8px"
                                    }}
                                />
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {openViewOvertime && (
                <ViewOvertime open={openViewOvertime} close={handleCloseViewOvertime} overtime={loadOvertime} />
            )}
        </Layout>
    );
};

export default OvertimeAppsList;
