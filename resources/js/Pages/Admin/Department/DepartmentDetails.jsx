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
    MenuItem
} from "@mui/material";
import Swal from "sweetalert2";
import { red } from "@mui/material/colors";

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

    useEffect(() => {
        const fetchDepartmentDetails = async () => {
            try {
                const response = await axiosInstance.get(`/settings/getDepartment/${id}`, { headers });
                setDepartment(response.data.department);
                setEmployees(response.data.employees || []);
                
                // Fetch branches if not already available
                const branchesResponse = await axiosInstance.get('/settings/getBranches', { headers });
                setBranches(branchesResponse.data.branches || []);
            } catch (err) {
                console.error("Error fetching department:", err);
                setError("Failed to load department details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDepartmentDetails();
    }, [id]);

    const filteredEmployees = employees.filter(emp => {
        const nameMatch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchKeyword.toLowerCase());
        const branchMatch = branchFilter === "all" || emp.branch_id === branchFilter;
        return nameMatch && branchMatch;
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!department) return <Typography>Department not found</Typography>;

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
                            <Grid item xs={2}>
                                <Box sx={{ 
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    width: '100%'
                                }}>
                                    {/* Manager */}
                                    <Box sx={{ 
                                        ml:15,
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        bgcolor: '#f9f9f9',
                                        borderRadius: '6px'
                                    }}>
                                        <Avatar 
                                            src={department.manager_avatar} 
                                            sx={{ width: 40, height: 40 }}
                                        />
                                        <TextField
                                            label="Manager"
                                            value={department.manager_name || "Not assigned"}
                                            fullWidth
                                            InputProps={{
                                                readOnly: true,
                                                sx: {
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: 'none'
                                                    }
                                                }
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: 'transparent',
                                                }
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Supervisor */}
                                    <Box sx={{ 
                                        ml:15,
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        bgcolor: '#f9f9f9',
                                        borderRadius: '6px'
                                    }}>
                                        <Avatar 
                                            src={department.supervisor_avatar} 
                                            sx={{ width: 40, height: 40 }}
                                        />
                                        <TextField
                                            label="Supervisor"
                                            value={department.supervisor_name || "Not assigned"}
                                            fullWidth
                                            InputProps={{
                                                readOnly: true,
                                                sx: {
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: 'none'
                                                    }
                                                }
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: 'transparent',
                                                }
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Approver */}
                                    <Box sx={{ 
                                        ml:15,
                                        flex: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        bgcolor: '#f9f9f9',
                                        borderRadius: '6px'
                                    }}>
                                        <Avatar 
                                            src={department.approver_avatar} 
                                            sx={{ width: 40, height: 40 }}
                                        />
                                        <TextField
                                            label="Approver"
                                            value={department.approver_name || "Not assigned"}
                                            fullWidth
                                            InputProps={{
                                                readOnly: true,
                                                sx: {
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: 'none'
                                                    }
                                                }
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: 'transparent',
                                                }
                                            }}
                                        />
                                    </Box>
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
                                                <TableCell align="left">Position</TableCell>
                                                <TableCell align="left">Email</TableCell>
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
                                                    <TableCell align="left">{emp.position}</TableCell>
                                                    <TableCell align="left">{emp.email}</TableCell>
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

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '79%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={department.description || ''}
                                    onChange={(e) => setDepartment({...department, description: e.target.value})}
                                    multiline
                                    rows={4}
                                />
                            </FormControl>

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