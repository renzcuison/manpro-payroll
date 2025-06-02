import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
    Avatar,
    FormControl,
    FormControlLabel,
    Checkbox,
    ListItemText,
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";

import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import { useEmployees } from "./hooks/useEmployees";

const EmployeesList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);

    const [searchName, setSearchName] = useState("");
    const [filterByBranch, setFilterByBranch] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");

    useEffect(() => {
        axiosInstance
            .get("/employee/getEmployees", { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
                setIsLoading(false);
            });

        axiosInstance
            .get("/settings/getDepartments", { headers })
            .then((response) => {
                const fetchedDepartments = response.data.departments;
                setDepartments(fetchedDepartments);
                const allDepartmentIds = fetchedDepartments.map(
                    (department) => department.id
                );
                setSelectedDepartments(allDepartmentIds);
            })
            .catch((error) => {
                console.error("Error fetching departments:", error);
            });

        axiosInstance
            .get("/settings/getBranches", { headers })
            .then((response) => {
                const fetchedBranches = response.data.branches;
                setBranches(fetchedBranches);
                const allBranchIds = fetchedBranches.map((branch) => branch.id);
                setSelectedBranches(allBranchIds);
            })
            .catch((error) => {
                console.error("Error fetching branches:", error);
            });
    }, []);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const [blobMap, setBlobMap] = useState({});

    const renderImage = (id, data, mime) => {
        if (!blobMap[id]) {
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            const newBlob = URL.createObjectURL(blob);

            setBlobMap((prev) => ({ ...prev, [id]: newBlob }));

            return newBlob;
        } else {
            return blobMap[id];
        }
    };
    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.first_name} ${
            employee.middle_name || ""
        } ${employee.last_name} ${employee.suffix || ""}`.toLowerCase();
        const matchedName = fullName.includes(searchName.toLowerCase());
        const matchedBranchDept =
            (filterByBranch === "" || employee["branch"] === filterByBranch) &&
            (filterByDepartment === "" ||
                employee["department"] === filterByDepartment);
        return matchedName && matchedBranchDept;
    });

    return (
        <Layout title={"EmployeesList"}>
            <Box
                sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}
            >
                <Box>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}
                            Employees{" "}
                        </Typography>

                        <Button
                            id="employee-menu"
                            variant="contained"
                            color="primary"
                            aria-controls={open ? "emp-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                            onClick={handleMenuOpen}
                        >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add{" "}
                            </p>
                        </Button>
                        <Menu
                            id="emp-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            MenuListProps={{
                                "aria-labelledby": "employee_menu",
                            }}
                        >
                            <MenuItem
                                component={Link}
                                to="/admin/employees/add"
                                onClick={handleMenuClose}
                            >
                                {" "}
                                Add Employee{" "}
                            </MenuItem>
                            <MenuItem
                                component={Link}
                                to="/admin/employees/formlinks"
                                onClick={handleMenuClose}
                            >
                                {" "}
                                Employee Form Links{" "}
                            </MenuItem>
                        </Menu>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid
                            container
                            sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}
                        >
                            <Grid container size={12} spacing={2}>
                                {/*<---Name Search field--->*/}
                                <Grid size={6}>
                                    <TextField
                                        id="searchName"
                                        label="Search Name"
                                        variant="outlined"
                                        value={searchName}
                                        onChange={(e) =>
                                            setSearchName(e.target.value)
                                        }
                                    />
                                </Grid>
                                {/*<---Branch filter field--->*/}
                                <Grid size={3}>
                                    <TextField
                                        select
                                        id="column-view-select"
                                        label="Filter by Branch"
                                        value={filterByBranch}
                                        onChange={(event) => {
                                            console.log(
                                                "Selected branch:",
                                                event.target.value
                                            );
                                            setFilterByBranch(
                                                event.target.value
                                            );
                                        }}
                                        sx={{ width: "100%" }}
                                    >
                                        {branches.map((branch) => (
                                            <MenuItem
                                                key={branch.id}
                                                value={branch.name}
                                            >
                                                {" "}
                                                {branch.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/*<---Department filter field--->*/}
                                <Grid size={3}>
                                    <TextField
                                        select
                                        id="column-view-select"
                                        label="Filter by Department"
                                        value={filterByDepartment}
                                        onChange={(event) => {
                                            console.log(
                                                "Selected department:",
                                                event.target.value
                                            );
                                            setFilterByDepartment(
                                                event.target.value
                                            );
                                        }}
                                        sx={{ width: "100%" }}
                                    >
                                        {departments.map((department) => (
                                            <MenuItem
                                                key={department.id}
                                                value={department.name}
                                            >
                                                {" "}
                                                {department.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/*<---Main Employee List table--->*/}
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer
                                    style={{ overflowX: "auto" }}
                                    sx={{ minHeight: 400, maxHeight: 500 }}
                                >
                                    <Table
                                        stickyHeader
                                        aria-label="employee table"
                                    >
                                        {/*<--Table Header Section-->*/}
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    align="center"
                                                    scope="col"
                                                >
                                                    {" "}
                                                    Name{" "}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    scope="col"
                                                >
                                                    {" "}
                                                    Branch{" "}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    scope="col"
                                                >
                                                    {" "}
                                                    Department{" "}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    scope="col"
                                                >
                                                    {" "}
                                                    Role{" "}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    scope="col"
                                                >
                                                    {" "}
                                                    Status{" "}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    scope="col"
                                                >
                                                    {" "}
                                                    Type{" "}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        {/*<--Table Body Section-->*/}
                                        <TableBody>
                                            {filteredEmployees?.length > 0 ? (
                                                filteredEmployees?.map(
                                                    (employee) => (
                                                        <TableRow
                                                            key={employee.id}
                                                            sx={{
                                                                "&:last-child td, &:last-child th":
                                                                    {
                                                                        border: 0,
                                                                    },
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        "rgba(0, 0, 0, 0.1)",
                                                                    cursor: "pointer",
                                                                },
                                                            }}
                                                        >
                                                            <TableCell align="left">
                                                                <Link
                                                                    to={`/admin/employee/${employee.user_name}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                        color: "inherit",
                                                                    }}
                                                                >
                                                                    <Box
                                                                        display="flex"
                                                                        sx={{
                                                                            alignItems:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            src={renderImage(
                                                                                employee.id,
                                                                                employee.avatar,
                                                                                employee.avatar_mime
                                                                            )}
                                                                            sx={{
                                                                                mr: 2,
                                                                            }}
                                                                        />
                                                                        {
                                                                            employee.first_name
                                                                        }{" "}
                                                                        {employee.middle_name ||
                                                                            ""}{" "}
                                                                        {
                                                                            employee.last_name
                                                                        }{" "}
                                                                        {employee.suffix ||
                                                                            ""}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>

                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/employee/${employee.user_name}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                        color: "inherit",
                                                                    }}
                                                                >
                                                                    {employee.branch ||
                                                                        ""}
                                                                </Link>
                                                            </TableCell>

                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/employee/${employee.user_name}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                        color: "inherit",
                                                                    }}
                                                                >
                                                                    {employee.department ||
                                                                        ""}
                                                                </Link>
                                                            </TableCell>

                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/employee/${employee.user_name}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                        color: "inherit",
                                                                    }}
                                                                >
                                                                    {employee.role ||
                                                                        ""}
                                                                </Link>
                                                            </TableCell>

                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/employee/${employee.user_name}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                        color: "inherit",
                                                                    }}
                                                                >
                                                                    {employee.employment_status ||
                                                                        ""}
                                                                </Link>
                                                            </TableCell>

                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/employee/${employee.user_name}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                        color: "inherit",
                                                                    }}
                                                                >
                                                                    {employee.employment_type ||
                                                                        ""}
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        align="center"
                                                    >
                                                        {" "}
                                                        No employees found.{" "}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {filteredEmployees?.length > 0 && (
                                    <Box
                                        display="flex"
                                        sx={{
                                            py: 2,
                                            pr: 2,
                                            width: "100%",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography sx={{ mr: 2 }}>
                                            {" "}
                                            Number of Employees:{" "}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {" "}
                                            {filteredEmployees?.length}{" "}
                                        </Typography>
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
