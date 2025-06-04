import React, { useEffect, useState } from "react";
import {
    Table, TableHead, TableBody, TableCell, TableContainer, TableRow,
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

import DateRangePicker from '../../../components/DateRangePicker';

import ViewOvertime from "./Modals/ViewOvertime";

const headCells = [
    { id: "employee", label: "Employee", sortable: true },
    { id: "branch", label: "Branch", sortable: false },
    { id: "department", label: "Department", sortable: false },
    { id: "reason", label: "Reason", sortable: false },
    { id: "date", label: "Date", sortable: false },
    { id: "time", label: "Time", sortable: false },
    { id: "status", label: "Status", sortable: false },
];

const OvertimeAppsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [overtimes, setOvertimes] = useState([]);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("date");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openViewOvertime, setOpenViewOvertime] = useState(false);
    const [loadOvertime, setLoadOvertime] = useState(null);

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [searchName, setSearchName] = useState("");
    const [filterByStatus, setFilterByStatus] = useState("");
    const [filterByBranch, setFilterByBranch] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");

    const [rangeStartDate, setRangeStartDate] = useState(null);
    const [rangeEndDate, setRangeEndDate] = useState(null);

    useEffect(() => {
        fetchOvertime();

        axiosInstance.get("/settings/getDepartments", { headers })
            .then((response) => {
                const fetchedDepartments = response.data.departments;
                setDepartments(fetchedDepartments);
            }).catch((error) => {
                console.error("Error fetching departments:", error);
            });

        axiosInstance.get("/settings/getBranches", { headers })
            .then((response) => {
                const fetchedBranches = response.data.branches;
                setBranches(fetchedBranches);
            }).catch((error) => {
                console.error("Error fetching branches:", error);
            });
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
    const filteredOvertimes = overtimes.filter(overtime => {
        // Filter by Employee Name (case-insensitive)
        const nameMatch = overtime.emp_name.toLowerCase().includes(searchName.toLowerCase());

        // Filter by Date Range
        const appDate = dayjs(overtime.time_in);
        const dateMatch = 
            (!rangeStartDate || !rangeEndDate) || 
            (appDate.isSameOrAfter(rangeStartDate, 'day') && appDate.isSameOrBefore(rangeEndDate, 'day'));

        // Filter by Branch
        const branchMatch = !filterByBranch || overtime.emp_branch === filterByBranch;

        // Filter by Department
        const departmentMatch = !filterByDepartment || overtime.emp_department === filterByDepartment;

        // Filter by Status
        const statusMatch = !filterByStatus || overtime.status === filterByStatus;

        // Return true only if all filters match
        return nameMatch && dateMatch && branchMatch && departmentMatch && statusMatch;
    })
    .sort(getComparator(order, orderBy));  // Sort according to the `order` and `orderBy` states


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
                        <Grid container sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid container size={12} spacing={2}>
                                <Grid size={2}>
                                    <TextField sx={{ width: "100%" }} id="searchName" label="Search Employee Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value) } />
                                </Grid>

                                <Grid size={2}></Grid>
                                
                                <Grid size={2}>
                                    <TextField select id="column-view-select" sx={{ width: "100%" }} label="Filter by Branch" value={filterByBranch} onChange={(event) => { setFilterByBranch( event.target.value ) }}>
                                        <MenuItem value="">All Branches</MenuItem>
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.id} value={branch.name}>{" "}{branch.name}{" "}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <TextField select id="column-view-select" sx={{ width: "100%" }} label="Filter by Department" value={filterByDepartment} onChange={(event) => { setFilterByDepartment( event.target.value ) }}>
                                        <MenuItem value="">All Departments</MenuItem>
                                        {departments.map((department) => (
                                            <MenuItem key={department.id} value={department.name} > {" "} {department.name}{" "} </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <TextField select id="column-view-select" sx={{ width: "100%" }} label="Filter by Status" value={filterByStatus} onChange={(event) => { setFilterByStatus( event.target.value ) }}>
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Paid">Paid</MenuItem>
                                        <MenuItem value="Declined">Declined</MenuItem>
                                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <DateRangePicker 
                                        label="Filter by Date of Applications"
                                        onRangeChange={(start, end) => {
                                            setRangeStartDate(start);
                                            setRangeEndDate(end);
                                        }}
                                    />
                                </Grid>

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
                                        {/* <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} /> */}
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center"> Employee </TableCell>
                                                <TableCell align="center"> Branch </TableCell>
                                                <TableCell align="center"> Department </TableCell>
                                                <TableCell align="center"> Reason </TableCell>
                                                <TableCell align="center"> Date </TableCell>
                                                <TableCell align="center"> Time </TableCell>
                                                <TableCell align="center"> Status </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredOvertimes.length > 0 ? (
                                                filteredOvertimes
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((overtime, index) => (
                                                        <TableRow key={overtime.application} onClick={() => handleOpenViewOvertime(overtime)} sx={{ p: 1, backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" } }} >
                                                            <TableCell>{overtime.emp_name}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>{overtime.emp_branch}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>{overtime.emp_department}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", maxWidth: "200px", overflow: "hidden",  textOverflow: "ellipsis",  whiteSpace: "nowrap" }}>
                                                                {overtime.reason.length > 100 ? `${overtime.reason.slice(0, 100)}...` : overtime.reason}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>{dayjs(overtime.time_in).format("MMMM D, YYYY")}</TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {dayjs(overtime.time_in).format("hh:mm:ss A")} - {dayjs(overtime.time_out).format("hh:mm:ss A")}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Chip
                                                                    label={overtime.status}
                                                                    color={ overtime.status === "Approved" ? "success" : overtime.status === "Declined" ? "error" : "warning" }
                                                                    sx={{ fontWeight: "bold", px: 1 }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", p: 1 }}>
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
