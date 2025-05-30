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
    Tooltip,
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
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
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

                //get all departments, with their respected assigned employees
                const departmentResponse = await axiosInstance
                .get("/settings/getDepartmentWithEmployeePosition", {headers});
                setDepartments(departmentResponse.data.departments);

                // Fetch department positions
                const posResponse = await axiosInstance.get('/settings/getDepartmentPositions', { headers });
                setDepartmentPositions(posResponse.data.positions);
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

    console.log(departments)
    
    const filteredDepartments = departments.filter(dep =>
        dep.name.toLowerCase().includes(searchKeyword.toLowerCase())
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
                                    label="Search Departments"
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
                                        {filteredDepartments.length > 0 ? (
                                            filteredDepartments.map((dep) => {
                                            // Flatten all assigned employees for total count
                                            const totalEmployees = dep.assigned_positions
                                                ?.flatMap((assign) => assign.employee_assignments || [])
                                                .length || 0;

                                            return (
                                                <TableRow key={dep.id}>
                                                    {/*<--Department Name-->*/}
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
                                                    

                                                        return (
                                                        <TableCell key={position.id} align="center">
                                                            {employees.length > 0 ? (
                                                                <Box display="flex" justifyContent="center">
                                                                    {employees.map((e) => (
                                                                        <Tooltip
                                                                        key={e.id}
                                                                        title={`${e.employee?.first_name || ""} ${e.employee?.last_name || ""}`}
                                                                        arrow
                                                                        placement="top"
                                                                        >
                                                                            <Avatar
                                                                            src={e.employee?.avatar_url || "/default-avatar.png"} // Use your default avatar image path
                                                                            alt={`${e.employee?.first_name} ${e.employee?.last_name}`}
                                                                            sx={{ width: 32, height: 32, cursor: "pointer", mx:0.2}}
                                                                            />
                                                                        </Tooltip>
                                                                    ))}
                                                                </Box>
                                                            
                                                            ) : (
                                                            <Typography>--</Typography>
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

            {/* Add New Department Modal */}
            {openModal && <DepartmentAdd open={openModal} close={setOpenModal}></DepartmentAdd>}

            {/* Department Positions Settings Modal */}
            {openSettingsModal && <DepartmentPositionSettings open={openSettingsModal} close={setOpenSettingsModal}></DepartmentPositionSettings>}
            
        </Layout>
    );
};

export default DepartmentList;