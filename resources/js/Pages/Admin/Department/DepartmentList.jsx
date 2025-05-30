import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    Button,
    TextField,
    Grid,
    Checkbox,
    ListItemText,
    MenuItem,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    FormGroup,
    FormControl,
    Menu
} from "@mui/material";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import Swal from "sweetalert2";
import DepartmentPositionSettings from "./Modals/DepartmentPositionSettings";
import DepartmentAdd from "./Modals/DepartmentAdd";

const DepartmentList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [branchPositions, setBranchPositions] = useState([]);
    const [departmentPositions, setDepartmentPositions] = useState([]);

    const [departments, setDepartments] = useState([]);

    // Add Department Modal
    const [openModal, setOpenModal] = useState(false);
    
    // Department Positions Settings Modal
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    

    // Add Button Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const departmentResponse = await axiosInstance
                .get("/settings/getDepartmentWithEmployeePosition", {headers});
                setDepartments(departmentResponse.data.departments);
                
                // Fetch branches
                const branchResponse = await axiosInstance.get("/settings/getBranches", { headers });
                setBranches(branchResponse.data.branches || []);
                
                // Fetch all employees for name mapping
                const employeesResponse = await axiosInstance.get('/employee/getEmployees', { headers });
                setAllEmployees(employeesResponse.data.employees || []);

                // Fetch department positions
                const posResponse = await axiosInstance.get('/settings/getDepartmentPositions', { headers });
                setDepartmentPositions(posResponse.data.positions);

                //Fetcj department positions (will be used for the headers);
                const positionsResponse = await axiosInstance.get('/settings/getBranchPositions', { headers });
                setBranchPositions(positionsResponse.data.positions || []);

            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error loading data!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    console.log(departments);

    // Helper function to get employees assigned to a specific branch and position
    const getEmployeesForBranchPosition = (branchId, positionId) => {
        const employeesInBranch = allEmployees.filter(emp => emp.branch_id === branchId && emp.branch_position_id === positionId);
        return employeesInBranch.map(emp => `${emp.first_name} ${emp.last_name}`).join(", ") || "-";
    };
    
    const getEmployeeAvatarById = (employeeId) => {
        if (!employeeId) return null;
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? employee.avatar : null;
    };

    const filteredBranches = branches.filter((bran) =>
        bran.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    // Add Button Dropdown Handlers
    const handleAddClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAddClose = () => {
        setAnchorEl(null);
    };

    const handleAddNew = () => {
        handleAddClose();
        setOpenModal(true);
    };

    const handleSettings = () => {
        handleAddClose();
        setOpenSettingsModal(true);
    };

    return (
        <Layout title={"Departments"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
                            Departments
                        </Typography>

                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={handleAddClick}
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                endIcon={<i className="fa fa-caret-down"></i>}
                            >
                                <p className="m-0">
                                    Actions
                                </p>
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleAddClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                            >
                                <MenuItem onClick={handleAddNew}>
                                    <ListItemText>Add New Department</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleSettings}>
                                    <ListItemText>Department Positions Settings</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Grid>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid item xs={9}>
                                <TextField
                                    fullWidth
                                    label="Search Branch"
                                    variant="outlined"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                {/* Empty grid item for alignment */}
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                        <TableRow >
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                            {departmentPositions.length > 0 ? (
                                            departmentPositions.map((position) => (
                                                <TableCell key={position.id} align="center" sx={{ fontWeight: 'bold' }}>
                                                {position.name}
                                                </TableCell>
                                            ))
                                            ) : (
                                            <TableCell />
                                            )}
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>No. of Employees</TableCell>
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {departments.length > 0 ? (
                                            departments.map((dep) => {
                                            // Flatten all assigned employees for total count
                                            const totalEmployees = dep.assigned_positions
                                                ?.flatMap((assign) => assign.employee_assignments || [])
                                                .length || 0;

                                            return (
                                                <TableRow key={dep.id}>
                                                    {/*<--Department Nam-->*/}
                                                    <TableCell>
                                                        <Link
                                                            to={`/admin/department/${dep.id}`}
                                                            style={{
                                                                textDecoration: "none",
                                                                color: "inherit",
                                                                display: "block",
                                                                width: "100%",
                                                                height: "100%",
                                                                padding: "16px"
                                                            }}
                                                        >
                                                            <Box 
                                                                display="flex" 
                                                                alignItems="center"
                                                                justifyContent="center"
                                                            >
                                                                {dep.name}
                                                            </Box>
                                                        </Link>
                                                    </TableCell>

                                                    {/* Per-Position Employee Names <using departmentPosition state array for consistency> */}
                                                    {departmentPositions.map((position) => {
                                                        // Find the assigned position for this department
                                                        const matchAssigned = dep.assigned_positions?.find(
                                                        (asg) => asg.department_position_id === position.id
                                                        );
                                                        const employees = matchAssigned?.employee_assignments || [];
                                                        console.log(employees);

                                                        return (
                                                        <TableCell key={position.id}>
                                                            {employees.length > 0 ? (
                                                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                                {employees.map((e) => (
                                                                <li key={e.id}>
                                                                    {e.employee?.first_name} {e.employee?.last_name}
                                                                </li>
                                                                ))}
                                                            </ul>
                                                            ) : (
                                                            <i style={{ color: '#999' }}>None</i>
                                                            )}
                                                        </TableCell>
                                                        );
                                                    })}

                                                    {/* Total Employee Count */}
                                                    <TableCell align="center">{totalEmployees}</TableCell>
                                                </TableRow>
                                            );
                                            })
                                        ) : (
                                            <TableRow>
                                            <TableCell colSpan={2 + departmentPositions.length}>
                                                No department found
                                            </TableCell>
                                            </TableRow>
                                        )}
                                        </TableBody>
                                    </Table>
                                    </TableContainer>
                                
                                {filteredBranches.length > 0 && (
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
                                            Number of branches:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredBranches.length}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Add New Branch Modal */}
            {openModal && <DepartmentAdd open={openModal} close={setOpenModal}></DepartmentAdd>}

            {/* Department Positions Settings Modal */}
            {openSettingsModal && <DepartmentPositionSettings open={openSettingsModal} close={setOpenSettingsModal}></DepartmentPositionSettings>}
            
        </Layout>
    );
};

export default DepartmentList;