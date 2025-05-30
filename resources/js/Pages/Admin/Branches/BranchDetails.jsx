import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import Layout from "../../../components/Layout/Layout";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Avatar,
    Grid,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    FormGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Checkbox,
    ListItemText,
    Chip,
    Menu
} from "@mui/material";
import Swal from "sweetalert2";
import { red } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const BranchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branch, setBranch] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openAssignModal, setOpenAssignModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [branchPositions, setBranchPositions] = useState([]);
    const [positionAssignments, setPositionAssignments] = useState([]);
    const [searchQueries, setSearchQueries] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch branch details
                const branchResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
                setBranch(branchResponse.data.branch);
                setEmployees(branchResponse.data.employees || []);

                // Fetch departments
                const departmentsResponse = await axiosInstance.get('/settings/getDepartments', { headers });
                setDepartments(departmentsResponse.data.departments || []);

                // Fetch all employees for personnel assignment dropdowns
                const employeesResponse = await axiosInstance.get('/employee/getEmployees', { headers });
                setAllEmployees(employeesResponse.data.employees || []);

                // Fetch branch positions
                const positionsResponse = await axiosInstance.get('/settings/getBranchPositions', { headers });
                setBranchPositions(positionsResponse.data.positions || []);

                // Fetch current position assignments for this branch
                const assignmentsResponse = await axiosInstance.get(`/settings/getBranchPositionAssignments/${id}`, { headers });
                setPositionAssignments(assignmentsResponse.data.assignments || []);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Helper function to get employee name by ID
    const getEmployeeNameById = (employeeId) => {
        if (!employeeId) return "Not assigned";
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? `${employee.first_name} ${employee.last_name}` : "Not assigned";
    };

    // Helper function to get employee avatar by ID
    const getEmployeeAvatarById = (employeeId) => {
        if (!employeeId) return null;
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? employee.avatar : null;
    };

    // Get assigned employees for a specific position (now returns array)
    const getAssignedEmployeesForPosition = (positionId) => {
        return positionAssignments
            .filter(a => a.branch_position_id === positionId)
            .map(a => a.employee_id);
    };

    // Update position assignments (now handles multiple employees)
    const handlePositionAssignmentChange = (positionId, selectedEmployeeIds) => {
        // First remove all existing assignments for this position
        const updatedAssignments = positionAssignments.filter(
            a => a.branch_position_id !== positionId
        );
        
        // Then add new assignments for each selected employee
        selectedEmployeeIds.forEach(employeeId => {
            updatedAssignments.push({
                branch_id: id,
                branch_position_id: positionId,
                employee_id: employeeId
            });
        });

        setPositionAssignments(updatedAssignments);
    };

    const filteredEmployees = employees.filter(emp => {
        const nameMatch = emp.name.toLowerCase().includes(searchKeyword.toLowerCase());
        const departmentMatch = departmentFilter === "all" || emp.department.toLowerCase().includes(departmentFilter.toLowerCase());
        return nameMatch && departmentMatch;
    });

    // Filter function for dropdown searches
    const getFilteredEmployeeOptions = (positionId) => {
        const searchQuery = searchQueries[positionId] || "";
        return allEmployees.filter(emp => 
            `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleSearchChange = (positionId, value) => {
        setSearchQueries(prev => ({
            ...prev,
            [positionId]: value
        }));
    };

    const handleSelectAll = (positionId) => {
        const allIds = getFilteredEmployeeOptions(positionId).map(emp => emp.id);
        const currentIds = getAssignedEmployeesForPosition(positionId);
        const newIds = currentIds.length === allIds.length ? [] : allIds;
        handlePositionAssignmentChange(positionId, newIds);
    };

    const handleSaveAssignments = async () => {
        try {
            // 1. Get current assignments to check for duplicates
            const currentAssignmentsResponse = await axiosInstance.get(
                `/settings/getBranchPositionAssignments/${id}`,
                { headers }
            );
            const currentAssignments = currentAssignmentsResponse.data.assignments || [];
            
            // 2. Prepare only new assignments to add
            const newAssignmentsToAdd = [];
            
            // For each position in our local state
            branchPositions.forEach(position => {
                const positionId = position.id;
                const locallyAssignedEmployeeIds = getAssignedEmployeesForPosition(positionId);
                
                // Check each selected employee to see if assignment already exists
                locallyAssignedEmployeeIds.forEach(employeeId => {
                    const assignmentExists = currentAssignments.some(
                        a => a.branch_position_id === positionId && a.employee_id === employeeId
                    );
                    
                    if (!assignmentExists) {
                        newAssignmentsToAdd.push({
                            branch_id: id,
                            branch_position_id: positionId,
                            employee_id: employeeId
                        });
                    }
                });
            });

            if (newAssignmentsToAdd.length === 0) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "No new assignments to add.",
                    icon: "info",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                return;
            }

            // 3. Add only new position assignments
            const assignmentsResponse = await axiosInstance.post(
                '/settings/addBranchPositionAssignments',
                { 
                    branch_id: id,
                    assignments: newAssignmentsToAdd
                },
                { headers }
            );

            // 4. Update each employee's branch_position_id
            for (const assignment of newAssignmentsToAdd) {
                if (assignment.employee_id) {
                    await axiosInstance.post(
                        '/employee/updateEmployeeBranchPosition',
                        {
                            employee_id: assignment.employee_id,
                            branch_position_id: assignment.branch_position_id
                        },
                        { headers }
                    );
                }
            }

            if (assignmentsResponse.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "New position assignments added successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                });
                
                // Refresh the data
                const updatedResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
                setPositionAssignments(updatedResponse.data.position_assignments || []);
                setEmployees(updatedResponse.data.employees || []);
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error adding new assignments!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } finally {
            setOpenAssignModal(false);
        }
    };

    if (error) return (
        <Layout title={"Branches"}>
            <Typography color="error">{error}</Typography>
        </Layout>
    );
    
    if (!branch) return (
        <Layout title={"Branches"}>
            <Typography> </Typography>
        </Layout>
    );

    return (
        <Layout title={"Branches"}>
            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 'calc(100vh - 200px)'
                }}>
                    <LoadingSpinner />
                </Box>
            ) : (
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
                            <Typography variant="h4" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i
                                    className="fa fa-chevron-left"
                                    aria-hidden="true"
                                    style={{ fontSize: '80%', cursor: 'pointer' }}
                                    onClick={() => navigate('/admin/branches/branchlist')}
                                ></i>
                                {branch.name} ({branch.acronym})
                            </Typography>
                            <div>
                                <Button
                                    variant="contained"
                                    onClick={handleMenuClick}
                                    endIcon={<ArrowDropDownIcon />}
                                    sx={{
                                        backgroundColor: '#177604',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#126703'
                                        }
                                    }}
                                >
                                    Edit 
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    <MenuItem onClick={() => {
                                        setOpenEditModal(true);
                                        handleMenuClose();
                                    }}>
                                        Edit Branch Details
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        setOpenAssignModal(true);
                                        handleMenuClose();
                                    }}>
                                        Assign Positions
                                    </MenuItem>
                                </Menu>
                            </div>
                        </Box>

                        <Box
                            sx={{
                                mt: 6,
                                p: 3,
                                bgcolor: "#ffffff",
                                borderRadius: "8px",
                            }}
                        >
                            <Box sx={{ mt: 1 }}>
                                <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid rgb(255, 253, 253)" }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Search Employees"
                                            sx={{
                                                height: 50,
                                                fontSize: '1',
                                                padding: '4px 10px',
                                                minWidth: 300,
                                            }}
                                            variant="outlined"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            InputProps={{
                                        startAdornment: (
                                            <i className="fa fa-search mr-2"></i>
                                        )
                                    }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} ml={90}>
                                        <FormControl size="medium" fullWidth>
                                            <InputLabel>Filter by Department</InputLabel>
                                            <Select
                                                value={departmentFilter}
                                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                                label="Filter by Department"
                                                sx={{
                                                    height: 50,
                                                    fontSize: '1',
                                                    padding: '4px 10px',
                                                    minWidth: 300,
                                                }}
                                            >
                                                <MenuItem value="all">All Departments</MenuItem>
                                                {departments.map((department) => (
                                                    <MenuItem key={department.id} value={department.name}>
                                                        {department.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {filteredEmployees.length > 0 ? (
                                    <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{fontWeight: 'bold'}}>Name</TableCell>
                                                    <TableCell align="left" sx={{fontWeight: 'bold'}}>Department</TableCell>
                                                    
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredEmployees.map((employee, index) => (
                                                    <TableRow
                                                        key={index}
                                                        hover
                                                        sx={{
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(0, 0, 0, 0.1)"
                                                            }
                                                        }}
                                                    >
                                                        <TableCell align="left">
                                                            {employee.name}
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            {employee.department}
                                                        </TableCell>
                                                    
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            No employees found in this branch.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {filteredEmployees.length > 0 && (
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
                                            Number of Employees:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredEmployees.length}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Edit Branch Modal */}
            <Dialog
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Branch </Typography>
                        <IconButton onClick={() => setOpenEditModal(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={branch.name}
                                    onChange={(e) => setBranch({ ...branch, name: e.target.value })}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={branch.acronym}
                                    onChange={(e) => setBranch({ ...branch, acronym: e.target.value })}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel id="branch-status-label">
                                    Status
                                </InputLabel>
                                <Select
                                    required
                                    labelId="branch-status-label"
                                    id="branch-status"
                                    value={branch.status || 'Active'}
                                    label="Status"
                                    onChange={(e) => setBranch({ ...branch, status: e.target.value })}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                    <MenuItem value="Disabled">Disabled</MenuItem>
                                </Select>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between">
                            {/* Address */}
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    value={branch.address}
                                    onChange={(e) => setBranch({ ...branch, address: e.target.value })}
                                    multiline
                                    rows={3}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between">
                            {/* Contact Number */}
                            <FormControl sx={{
                                marginBottom: 3, width: '49%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="contact_number"
                                    label="Contact Number"
                                    variant="outlined"
                                    value={branch.contact_number}
                                    onChange={(e) => setBranch({ ...branch, contact_number: e.target.value })}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                className="m-1"
                                onClick={async () => {
                                    try {
                                        // First update branch details
                                        const branchResponse = await axiosInstance.post('/settings/editBranch', branch, { headers });
                                        
                                        if (branchResponse.data.status === 200) {
                                            Swal.fire({
                                                customClass: { container: 'my-swal' },
                                                text: "Branch updated successfully!",
                                                icon: "success",
                                                showConfirmButton: true,
                                                confirmButtonText: 'Proceed',
                                                confirmButtonColor: '#177604',
                                            });
                                            setOpenEditModal(false);
                                            // Refresh the branch data
                                            const updatedResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
                                            setBranch(updatedResponse.data.branch);
                                            setEmployees(updatedResponse.data.employees || []);
                                        }
                                    } catch (error) {
                                        console.error('Error:', error);
                                        Swal.fire({
                                            customClass: { container: 'my-swal' },
                                            text: "Error updating branch!",
                                            icon: "error",
                                            showConfirmButton: true,
                                            confirmButtonColor: '#177604',
                                        });
                                    }
                                }}
                            >
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Branch </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Assign Positions Modal */}
            <Dialog
                open={openAssignModal}
                onClose={() => setOpenAssignModal(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Assign Positions </Typography>
                        <IconButton onClick={() => setOpenAssignModal(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} noValidate autoComplete="off" encType="multipart/form-data" >
                        {/* Position Assignments Section */}
                        <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                            Position Assignments
                        </Typography>

                        {branchPositions.map(position => (
                       <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel id={`position-${position.id}-label`}>
                            {position.name}
                        </InputLabel>
                        <Select
                            labelId={`position-${position.id}-label`}
                            id={`position-${position.id}-select`}
                            multiple
                            value={getAssignedEmployeesForPosition(position.id)}
                            onChange={(e) => handlePositionAssignmentChange(position.id, e.target.value)}
                            label={position.name}
                            renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((id) => (
                                <Chip 
                                    key={id}
                                    label={getEmployeeNameById(id)}
                                    onDelete={(e) => {
                                    e.stopPropagation();
                                    handlePositionAssignmentChange(
                                        position.id, 
                                        getAssignedEmployeesForPosition(position.id).filter(eid => eid !== id)
                                    );
                                    }}
                                    deleteIcon={<CancelIcon />}
                                    size="small"
                                />
                                ))}
                            </Box>
                            )}
                            MenuProps={{
                            PaperProps: {
                                style: {
                                maxHeight: 300
                                }
                            },
                            onClick: (e) => e.stopPropagation()
                            }}
                        >
                                    <MenuItem value="" sx={{ p: 0 }}>
                                        <Box sx={{ p: 1, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                                            <TextField
                                                fullWidth
                                                placeholder={`Search ${position.name}`}
                                                value={searchQueries[position.id] || ''}
                                                onChange={(e) => handleSearchChange(position.id, e.target.value)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                }}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                variant="standard"
                                                sx={{ p: 1 }}
                                                autoFocus
                                            />
                                        </Box>
                                    </MenuItem>

                                    {getFilteredEmployeeOptions(position.id).map((emp) => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            <Checkbox
                                                checked={getAssignedEmployeesForPosition(position.id).includes(emp.id)}
                                            />
                                            <ListItemText primary={`${emp.first_name} ${emp.last_name}`} />
                                            <Avatar 
                                                src={emp.avatar} 
                                                sx={{ width: 24, height: 24, ml: 2 }} 
                                            />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ))}

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                className="m-1"
                                onClick={handleSaveAssignments}
                            >
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Assignments </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchDetails;