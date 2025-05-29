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
    Menu,
    MenuItem,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    FormGroup,
    FormControl
} from "@mui/material";
import { Link } from "react-router-dom";
import DepartmentAdd from "./Modals/DepartmentAdd";
import DepartmentPositionEdit from "./Modals/DepartmentPositionEdit";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";

import Swal from "sweetalert2";


const DepartmentsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [departments, setDepartments] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedColumns, setSelectedColumns] = useState([
        "Assigned Manager",
        "Assigned Supervisor",
        "Number of Employees",
        "Assigned Approver"
    ]);


    //[1] ==> modal and anchor handlers
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseActions = () => {
        setAnchorEl(null);
    };
    const [openDeptPosEditModal, setOpenDeptPosEditModal] = useState(false);
    const [openDeptAddModal, setOpenDeptAddModal] = useState(false);

    const handleOpenDeptPosEditModal = () => {
        setOpenDeptPosEditModal(true);
    } 
    const handleCloseDeptPosEditModal = (reload) => {
        setOpenDeptPosEditModal(false);
        if (reload) {
        }
    };  
    const handleOpenDeptAddModal = () => {
        setOpenDeptAddModal(true);
    } 
    const handleCloseDeptAddModal = (reload) => {
        setOpenDeptAddModal(false);
        if (reload) {
        }
    }; 
    //End of [1]
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch departments
                const deptResponse = await axiosInstance.get("/settings/getDepartments", { headers });
                setDepartments(deptResponse.data.departments || []);
                
                // Fetch all employees for name mapping
                const employeesResponse = await axiosInstance.get('/employee/getEmployees', { headers });
                setAllEmployees(employeesResponse.data.employees || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper function to get employee name by ID
    const getEmployeeNameById = (employeeId) => {
        if (!employeeId) return "-";
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? `${employee.first_name} ${employee.last_name}` : "-";
    };

    // Helper function to get employee avatar by ID
    const getEmployeeAvatarById = (employeeId) => {
        if (!employeeId) return null;
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? employee.avatar : null;
    };

    const filteredDepartments = departments.filter((dept) =>
        dept.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

   

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
                                onClick={handleOpenActions}
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                            >
                                <p className="m-0">
                                    <i className="fa fa-plus mr-2"></i> ACTIONS
                                </p>
                            </Button>
                            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions} >
                                <MenuItem onClick={handleOpenDeptAddModal}> Add Departments </MenuItem>
                                <MenuItem onClick={handleOpenDeptPosEditModal}> Department Position Settings</MenuItem>
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
                                    label="Search Department"
                                    variant="outlined"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                {}
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }} >Department</TableCell>
                                                {selectedColumns.includes("Assigned Manager") && (
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Assigned Manager</TableCell>
                                                )}
                                                {selectedColumns.includes("Assigned Supervisor") && (
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Assigned Supervisor</TableCell>
                                                )}
                                                {selectedColumns.includes("Assigned Approver") && (
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Assigned Approver</TableCell>
                                                )}
                                                {selectedColumns.includes("Number of Employees") && (
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>No. of Employees</TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredDepartments.length > 0 ? (
                                                filteredDepartments.map((dept) => (
                                                    <TableRow 
                                                        key={dept.id}
                                                        hover
                                                        sx={{ 
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(0, 0, 0, 0.1)"
                                                            }
                                                        }}
                                                    >
                                                        <TableCell align="center">
                                                            <Link
                                                                to={`/admin/department/${dept.id}`}
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
                                                                    {dept.name}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>
                                                        {selectedColumns.includes("Assigned Manager") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/department/${dept.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                                        
                                                                        {getEmployeeNameById(dept.manager_id)}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Assigned Supervisor") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/department/${dept.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                                        {getEmployeeNameById(dept.supervisor_id)}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Assigned Approver") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/department/${dept.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                                        {getEmployeeNameById(dept.approver_id)}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Number of Employees") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/department/${dept.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {dept.employees_count || "0"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={selectedColumns.length + 1} align="center">
                                                        No departments found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {filteredDepartments.length > 0 && (
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
                                            Number of Departments:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredDepartments.length}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {openDeptAddModal &&
            <DepartmentAdd open={handleOpenDeptAddModal} close={handleCloseDeptAddModal}></DepartmentAdd>}
            {openDeptPosEditModal &&
            <DepartmentPositionEdit open={handleOpenDeptPosEditModal} close={handleCloseDeptPosEditModal}></DepartmentPositionEdit>}

        </Layout>
    );
};

export default DepartmentsList;