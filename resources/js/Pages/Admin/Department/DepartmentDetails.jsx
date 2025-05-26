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
    InputAdornment
} from "@mui/material";
import Swal from "sweetalert2";
import { red } from "@mui/material/colors";
import SearchIcon from "@mui/icons-material/Search";

const DepartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [department, setDepartment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [branchFilter, setBranchFilter] = useState("all");
    const [openEditModal, setOpenEditModal] = useState(false);
    const [branches, setBranches] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [managerSearch, setManagerSearch] = useState("");
    const [supervisorSearch, setSupervisorSearch] = useState("");
    const [approverSearch, setApproverSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch department details
                const deptResponse = await axiosInstance.get(`/settings/getDepartment/${id}`, { headers });
                setDepartment(deptResponse.data.department);
                setEmployees(deptResponse.data.employees || []);
                
                // Fetch branches
                const branchesResponse = await axiosInstance.get('/settings/getBranches', { headers });
                setBranches(branchesResponse.data.branches || []);
                
                // Fetch all employees for personnel assignment dropdowns
                const employeesResponse = await axiosInstance.get('/employee/getEmployees', { headers });
                setAllEmployees(employeesResponse.data.employees || []);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

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
    
    const filteredEmployees = employees.filter(emp => {
        const nameMatch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchKeyword.toLowerCase());
        const branchMatch = branchFilter === "all" || emp.branch_id === branchFilter;
        return nameMatch && branchMatch;
    });

    // Filter functions for dropdown searches
    const filteredManagerOptions = allEmployees.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(managerSearch.toLowerCase())
    );

    const filteredSupervisorOptions = allEmployees.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(supervisorSearch.toLowerCase())
    );

    const filteredApproverOptions = allEmployees.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(approverSearch.toLowerCase())
    );

    if (error) return (
        <Layout title={"Departments"}>
            <Typography color="error">{error}</Typography>
        </Layout>
    );
    
    if (!department) return (
        <Layout title={"Departments"}>
            <Typography></Typography>
        </Layout>
    );

    return (
        <Layout title={"Departments"}>
            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 'calc(100vh - 200px)' // Adjust based on your header height
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
                                    onClick={() => navigate('/admin/department/departmentlist')}
                                ></i>
                                {department.name} ({department.acronym})
                            </Typography>
                            <Button 
                                variant="contained"
                                onClick={() => setOpenEditModal(true)}
                                sx={{ 
                                    backgroundColor: '#177604',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#126703'
                                    }
                                }}
                            >
                                Edit Department
                            </Button>
                        </Box>
                        
                        <Box
                            sx={{
                                mt: 6,
                                p: 3,
                                bgcolor: "white",
                                borderRadius: "8px",
                                boxShadow: 1,
                            }}
                        >
                            <Grid container>
                     
                            {/* Personnel Section */}
                            <Grid item xs={12}>
                                <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    ml:10,
                                    width: '100%',
                                    px: 2,
                                }}
                                >
                                {[
                                    { role: 'Manager', id: department.manager_id },
                                    { role: 'Supervisor', id: department.supervisor_id },
                                    { role: 'Approver', id: department.approver_id },
                                ].map(({ role, id }) => (
                                    <Box
                                    key={role}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 2,
                                        ml:10,
                                        bgcolor: '#fff',
                                        borderRadius: '6px',
                                        textAlign: 'center',
                                    }}
                                    >
                                    <Avatar
                                        src={getEmployeeAvatarById(id)}
                                        sx={{ width: 90, height: 90, mb: 1 }}
                                    />
                                    <TextField
                                        value={getEmployeeNameById(id)}
                                        fullWidth
                                        InputProps={{
                                        readOnly: true,
                                        sx: {
                                            input: {
                                            textAlign: 'center', // Center text horizontally
                                            },
                                            "& .MuiOutlinedInput-notchedOutline": {
                                            border: 'none',
                                            },
                                        },
                                        }}
                                        sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: 'transparent',
                                        },
                                        }}
                                    />
                                    <Box sx={{ mt: 1, fontWeight: 'medium', fontSize: '0.9rem' }}>
                                        {role}
                                    </Box>
                                    </Box>
                                ))}
                                </Box>
                            </Grid>
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
                            <Box sx={{ mt: 1 }}>
                                <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid rgb(255, 253, 253)" }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Search Employees"
                                             sx={{
                                                    height: 50,              // sets total height
                                                    fontSize: '1',    // sets text size
                                                    padding: '4px 10px',     // sets internal padding
                                                    minWidth: 300,           // optional width
                                                }}
                                            variant="outlined"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} ml={90}>
                                        <FormControl size="medium" fullWidth>
                                            <InputLabel>Filter by Branch</InputLabel>
                                            <Select
                                                value={branchFilter}
                                                onChange={(e) => setBranchFilter(e.target.value)}
                                                label="Filter by Branch"
                                                sx={{
                                                    height: 50,              // sets total height
                                                    fontSize: '1',    // sets text size
                                                    padding: '4px 10px',     // sets internal padding
                                                    minWidth: 300,           // optional width
                                                }}
                                                >
                                                <MenuItem value="all">All Branches</MenuItem>
                                                {branches.map((branch) => (
                                                    <MenuItem key={branch.id} value={branch.id}>
                                                    {branch.name}
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
                                                <TableCell align="left">Name</TableCell>
                                                <TableCell align="left">Branch</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredEmployees.map((emp) => (
                                                <TableRow 
                                                    key={emp.id}
                                                    hover
                                                    sx={{ 
                                                        cursor: "pointer",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0, 0, 0, 0.1)"
                                                        }
                                                    }}
                                                    onClick={() => navigate(`/admin/employee/${emp.user_name}`)}
                                                >
                                                    <TableCell align="left">
                                                        <Box display="flex" alignItems="center">
                                                            <Avatar src={emp.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
                                                            {`${emp.first_name} ${emp.middle_name ? emp.middle_name + ' ' : ''}${emp.last_name}`}
                                                        </Box>
                                                    </TableCell>
                                                
                                                    <TableCell align="left">
                                                        {branches.find(b => b.id === emp.branch_id)?.name || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No employees found in this department.
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

            {/* Edit Department Modal */}
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
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Department </Typography>
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
                                marginBottom: 3, width: '59%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={department.name}
                                    onChange={(e) => setDepartment({...department, name: e.target.value})}
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
                                    value={department.acronym}
                                    onChange={(e) => setDepartment({...department, acronym: e.target.value})}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel id="department-status-label">
                                    Status
                                </InputLabel>
                                <Select
                                    required
                                    labelId="department-status-label"
                                    id="department-status"
                                    value={department.status || 'Active'}
                                    label="Status"
                                    onChange={(e) => setDepartment({...department, status: e.target.value})}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                    <MenuItem value="Disabled">Disabled</MenuItem>
                                </Select>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between">
                            {/* Manager Dropdown with Search */}
                                    <FormControl sx={{ marginBottom: 3, width: '32%' }}>
                                        <InputLabel id="manager-label">Manager</InputLabel>
                                        <Select
                                            labelId="manager-label"
                                            id="manager-select"
                                            value={department.manager_id || ''}
                                            label="Manager"
                                            onChange={(e) => setDepartment({...department, manager_id: e.target.value})}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 300
                                                    }
                                                },
                                                // This prevents the menu from closing when clicking on the search field
                                                onClick: (e) => e.stopPropagation()
                                            }}
                                        >
                                            <MenuItem value="" sx={{ p: 0 }}>
                                                <Box sx={{ p: 1, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="Search manager..."
                                                        value={managerSearch}
                                                        onChange={(e) => setManagerSearch(e.target.value)}
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
                                            <MenuItem value="">Not assigned</MenuItem>
                                            {filteredManagerOptions.map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id}>
                                                    {`${emp.first_name} ${emp.last_name}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    {/* Supervisor Dropdown with Search */}
                                    <FormControl sx={{ marginBottom: 3, width: '32%' }}>
                                        <InputLabel id="supervisor-label">Supervisor</InputLabel>
                                        <Select
                                            labelId="supervisor-label"
                                            id="supervisor-select"
                                            value={department.supervisor_id || ''}
                                            label="Supervisor"
                                            onChange={(e) => setDepartment({...department, supervisor_id: e.target.value})}
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
                                                        placeholder="Search supervisor..."
                                                        value={supervisorSearch}
                                                        onChange={(e) => setSupervisorSearch(e.target.value)}
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
                                            <MenuItem value="">Not assigned</MenuItem>
                                            {filteredSupervisorOptions.map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id}>
                                                    {`${emp.first_name} ${emp.last_name}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Approver Dropdown with Search */}
                                    <FormControl sx={{ marginBottom: 3, width: '32%' }}>
                                        <InputLabel id="approver-label">Approver</InputLabel>
                                        <Select
                                            labelId="approver-label"
                                            id="approver-select"
                                            value={department.approver_id || ''}
                                            label="Approver"
                                            onChange={(e) => setDepartment({...department, approver_id: e.target.value})}
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
                                                        placeholder="Search approver..."
                                                        value={approverSearch}
                                                        onChange={(e) => setApproverSearch(e.target.value)}
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
                                            <MenuItem value="">Not assigned</MenuItem>
                                            {filteredApproverOptions.map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id}>
                                                    {`${emp.first_name} ${emp.last_name}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '19%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    type="number"
                                    id="leave_limit"
                                    label="Leave Limit"
                                    variant="outlined"
                                    value={department.leave_limit || 0}
                                    onChange={(e) => setDepartment({...department, leave_limit: e.target.value})}
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
                                        const response = await axiosInstance.post('/settings/editDepartment', department, { headers });
                                        if (response.data.status === 200) {
                                            Swal.fire({
                                                customClass: { container: 'my-swal' },
                                                text: "Department updated successfully!",
                                                icon: "success",
                                                showConfirmButton: true,
                                                confirmButtonText: 'Proceed',
                                                confirmButtonColor: '#177604',
                                            });
                                            setOpenEditModal(false);
                                            // Refresh the department data
                                            const updatedResponse = await axiosInstance.get(`/settings/getDepartment/${id}`, { headers });
                                            setDepartment(updatedResponse.data.department);
                                        }
                                    } catch (error) {
                                        console.error('Error:', error);
                                        Swal.fire({
                                            customClass: { container: 'my-swal' },
                                            text: "Error updating department!",
                                            icon: "error",
                                            showConfirmButton: true,
                                            confirmButtonColor: '#177604',
                                        });
                                    }
                                }}
                            >
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Department </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default DepartmentDetails;