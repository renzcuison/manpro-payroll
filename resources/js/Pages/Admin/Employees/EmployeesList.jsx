import React, { useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, Menu, MenuItem, TextField, Grid, Avatar } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";

// Hooks
import { useCSVExport } from "../../../hooks/useCSVExport";
import { useEmployeesData } from "./hooks/useEmployees";
import { useFilteredEmployees } from "./hooks/useEmployees";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const EmployeesList = () => {
    const { exportEmployees } = useCSVExport();
    const { data, isLoading, isError } = useEmployeesData();

    const employees = data?.employees || [];
    const branches = data?.branches || [];
    const departments = data?.departments || [];

    const [searchName, setSearchName] = useState("");
    const [filterByBranch, setFilterByBranch] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const filteredEmployees = useFilteredEmployees(employees, searchName, filterByBranch, filterByDepartment);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    if (isError) {
        return (
            <Layout title="EmployeesList">
                <Box p={4}>
                    <Typography color="error" variant="h6">Failed to load employee data.</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Employees</Typography>
                        <Box>
                            <Button onClick={() => exportEmployees(employees)} variant="contained" color="primary">
                                <p className="m-0"><i className="fa fa-file-excel-o"></i> Export</p>
                            </Button>
                            <Button id="employee-menu" variant="contained" color="primary" sx={{ ml: 1 }} aria-controls={open ? "emp-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleMenuOpen} >
                                <p className="m-0 m"><i className="fa fa-bars mr-2"></i> Menu </p>
                            </Button>
                            <Menu id="emp-menu" anchorEl={anchorEl} open={open} onClose={handleMenuClose} MenuListProps={{ "aria-labelledby": "employee_menu" }} >
                                <MenuItem component={Link} to="/admin/employees/add" onClick={handleMenuClose}> Add Employee </MenuItem>
                                <MenuItem component={Link} to="/admin/employees/import" onClick={handleMenuClose}> Import Employees </MenuItem>
                                <MenuItem component={Link} to="/admin/employees/formlinks" onClick={handleMenuClose}> Employee Form Links </MenuItem>
                            </Menu>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
                        <Grid container sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid container size={12} spacing={2}>

                                <Grid size={6}>
                                    <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value) } />
                                </Grid>

                                <Grid size={3}>
                                    <TextField
                                        select
                                        id="column-view-select"
                                        label="Filter by Branch"
                                        value={filterByBranch}
                                        onChange={(event) => {
                                            setFilterByBranch( event.target.value );
                                        }}
                                        sx={{ width: "100%" }}
                                    >
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.id} value={branch.name} >
                                                {" "}{branch.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={3}>
                                    <TextField
                                        select
                                        id="column-view-select"
                                        label="Filter by Department"
                                        value={filterByDepartment}
                                        onChange={(event) => {
                                            setFilterByDepartment(event.target.value);
                                        }}
                                        sx={{ width: "100%" }}
                                    >
                                        {departments.map((department) => (
                                            <MenuItem key={department.id} value={department.name} >
                                                {" "}{department.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer sx={{ minHeight: 400, maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Type</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredEmployees.length > 0 ? (
                                                filteredEmployees.map((employee) => (
                                                    <TableRow key={employee.id} hover>
                                                        <TableCell align="left">
                                                            <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: "none", color: "inherit" }} >
                                                                <Box display="flex" alignItems="center">
                                                                    <Avatar src={ employee?.media?.length ? employee.media[0]?.original_url : employee?.avatar || "../../../../../images/avatarpic.jpg" } sx={{ mr: 2 }} />
                                                                    {`${employee.last_name}, ${employee.first_name} ${employee.middle_name || ""} ${employee.suffix || ""}`}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell align="center">{employee.branch || ""}</TableCell>
                                                        <TableCell align="center">{employee.department || ""}</TableCell>
                                                        <TableCell align="center">{employee.role || ""}</TableCell>
                                                        <TableCell align="center">{employee.employment_status || ""}</TableCell>
                                                        <TableCell align="center">{employee.employment_type || ""}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No employees found.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {filteredEmployees.length > 0 && (
                                    <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ py: 2 }}>
                                        <Typography sx={{ mr: 2 }}>Number of Employees:</Typography>
                                        <Typography variant="h6" fontWeight="bold"> {filteredEmployees.length} </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default EmployeesList;
