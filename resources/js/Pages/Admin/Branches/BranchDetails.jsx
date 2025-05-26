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
    const [departments, setDepartments] = useState([]);
    const [managerSearch, setManagerSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch branch details
                const branchResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
                console.log(branchResponse.data);
                setBranch(branchResponse.data.branch);
                setEmployees(branchResponse.data.employees || []);

                // Fetch departments
                const departmentsResponse = await axiosInstance.get('/settings/getDepartments', { headers });
                setDepartments(departmentsResponse.data.departments || []);

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
        // This assumes the branch data includes manager, supervisor, approver relations
        if (branch.manager && employeeId === branch.manager.id) {
            return `${branch.manager.first_name} ${branch.manager.last_name}`;
        }
        if (branch.supervisor && employeeId === branch.supervisor.id) {
            return `${branch.supervisor.first_name} ${branch.supervisor.last_name}`;
        }
        if (branch.approver && employeeId === branch.approver.id) {
            return `${branch.approver.first_name} ${branch.approver.last_name}`;
        }
        return "Not assigned";
    };

    // Helper function to get employee avatar by ID
    const getEmployeeAvatarById = (employeeId) => {
        if (!employeeId) return null;
        // This assumes the branch data includes manager, supervisor, approver relations
        if (branch.manager && employeeId === branch.manager.id) {
            return branch.manager.avatar;
        }
        if (branch.supervisor && employeeId === branch.supervisor.id) {
            return branch.supervisor.avatar;
        }
        if (branch.approver && employeeId === branch.approver.id) {
            return branch.approver.avatar;
        }
        return null;
    };

    const filteredEmployees = employees.filter(emp => {
        const nameMatch = emp.name.toLowerCase().includes(searchKeyword.toLowerCase());
        const departmentMatch = departmentFilter === "all" || emp.department.toLowerCase().includes(departmentFilter.toLowerCase());
        return nameMatch && departmentMatch;
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!branch) return <Typography>Branch not found</Typography>;

    return (
        <Layout title={"Branches"}>
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
                                onClick={() => navigate('/admin/branch/branchlist')}
                            ></i>
                            {branch.name} ({branch.code})
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
                            Edit Branch
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
                                        ml: 10,
                                        width: '100%',
                                        px: 2,
                                    }}
                                >
                                    {[
                                        { role: 'Manager', id: branch.manager_id },
                                        { role: 'Supervisor', id: branch.supervisor_id },
                                        { role: 'Approver', id: branch.approver_id },
                                    ].map(({ role, id }) => (
                                        <Box
                                            key={role}
                                            sx={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                p: 2,
                                                ml: 10,
                                                bgcolor: '#fff',
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Avatar
                                                src={getEmployeeAvatarById(id)}
                                                sx={{ width: 60, height: 60, mb: 1 }}
                                            />
                                            <TextField
                                                value={getEmployeeNameById(id)}
                                                fullWidth
                                                InputProps={{
                                                    readOnly: true,
                                                    sx: {
                                                        input: {
                                                            textAlign: 'center',
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
                                            height: 50,
                                            fontSize: '1',
                                            padding: '4px 10px',
                                            minWidth: 300,
                                        }}
                                        variant="outlined"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
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
                                                <TableCell align="left">Name</TableCell>
                                                <TableCell align="left">Department</TableCell>
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
                                    <TableCell colSpan={2} align="center">
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
                                    id="code"
                                    label="Code"
                                    variant="outlined"
                                    value={branch.code}
                                    onChange={(e) => setBranch({ ...branch, code: e.target.value })}
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
                            {/* Manager Dropdown with Search */}
                            <FormControl sx={{ marginBottom: 3, width: '49%' }}>
                                <InputLabel id="manager-label">Manager</InputLabel>
                                <Select
                                    labelId="manager-label"
                                    id="manager-select"
                                    value={branch.manager_id || ''}
                                    label="Manager"
                                    onChange={(e) => setBranch({ ...branch, manager_id: e.target.value })}
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
                                    {/* You would need to fetch all employees for this dropdown */}
                                </Select>
                            </FormControl>

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
                                        const response = await axiosInstance.post('/settings/editBranch', branch, { headers });
                                        if (response.data.status === 200) {
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
        </Layout>
    );
};

export default BranchDetails;