import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton
} from "@mui/material";
import Swal from "sweetalert2";

const DepartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [department, setDepartment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editManager, setEditManager] = useState(null);
    const [editSupervisor, setEditSupervisor] = useState(null);
    const [allEmployees, setAllEmployees] = useState([]);

    const [nameError, setNameError] = useState(false);

    useEffect(() => {
        const fetchAllEmployees = async () => {
            try {
                const res = await axiosInstance.get(`/admin/getAllEmployees`, { headers });
                setAllEmployees(res.data.employees|| []);
            } catch (err) {
                console.error("Error fetching employees for dropdown:", err);
            }
        };

        fetchAllEmployees();
    }, []);

    const openEditModal = () => {
        setEditName(department.name);
        setEditManager(allEmployees.find(emp => emp.id === department.manager_id) || null);
        setEditSupervisor(allEmployees.find(emp => emp.id === department.supervisor_id) || null);
        setEditOpen(true);
    };

    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!editName);

        if (!editName) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Department name is required!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This department will be updated",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    handleSaveEdit();
                }
            });
        }
    };

    const handleSaveEdit = async () => {
        try {
            await axiosInstance.put(`/settings/updateDepartment/${id}`, {
                name: editName,
                manager_id: editManager?.id,
                supervisor_id: editSupervisor?.id
            }, { headers });

            // Refresh department data
            setDepartment(prev => ({
                ...prev,
                name: editName,
                manager_name: editManager ? `${editManager.first_name} ${editManager.last_name}` : null,
                manager_avatar: editManager?.avatar,
                supervisor_name: editSupervisor ? `${editSupervisor.first_name} ${editSupervisor.last_name}` : null,
                supervisor_avatar: editSupervisor?.avatar,
                manager_id: editManager?.id,
                supervisor_id: editSupervisor?.id
            }));

            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Department updated successfully!",
                icon: "success",
                showConfirmButton: true,
                confirmButtonText: 'Proceed',
                confirmButtonColor: '#177604',
            }).then(() => {
                setEditOpen(false);
            });
        } catch (err) {
            console.error("Failed to save edits:", err);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Failed to update department!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    useEffect(() => {
        const fetchDepartmentDetails = async () => {
            try {
                const response = await axiosInstance.get(`/settings/getDepartment/${id}`, { headers });
                setDepartment(response.data.department);
                setEmployees(response.data.employees || []);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching department details:", err);
                setError("Failed to load department details");
                setIsLoading(false);
            }
        };

        fetchDepartmentDetails();
    }, [id]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!department) return <Typography>Department not found</Typography>;

    return (
        <Layout title={`Department: ${department.name}`}>
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
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/department/departmentlist" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Department Details
                        </Typography>

                        <Button variant="outlined" onClick={openEditModal}>
                            Edit
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ pl: 2 }}>
                                    <Typography variant="h5" gutterBottom>
                                        <strong>{department.name}</strong>
                                    </Typography>
                                    {department.manager_name && (
                                        <Typography variant="subtitle1" gutterBottom>
                                            <strong>Manager:</strong> 
                                            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                                <Avatar 
                                                    src={department.manager_avatar} 
                                                    sx={{ mr: 2, width: 32, height: 32 }}
                                                />
                                                {department.manager_name}
                                            </Box>
                                        </Typography>
                                    )}
                                    {department.supervisor_name && (
                                        <Typography variant="subtitle1" gutterBottom>
                                            <strong>Supervisor:</strong>
                                            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                                <Avatar 
                                                    src={department.supervisor_avatar} 
                                                    sx={{ mr: 2, width: 32, height: 32 }}
                                                />
                                                {department.supervisor_name}
                                            </Box>
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>

                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                            Employees in this Department
                        </Typography>

                        {employees.length > 0 ? (
                            <TableContainer sx={{ mt: 2, maxHeight: 500 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left">Name</TableCell>
                                            <TableCell align="left">Position</TableCell>
                                            <TableCell align="left">Email</TableCell>
                                            <TableCell align="left">Phone</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {employees.map((emp) => (
                                            <TableRow 
                                                key={emp.id}
                                                hover
                                                sx={{ 
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0, 0, 0, 0.1)"
                                                    }
                                                }}
                                            >
                                                <TableCell align="left">
                                                    <Link
                                                        to={`/admin/employee/${emp.user_name}`}
                                                        style={{
                                                            textDecoration: "none",
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        <Box display="flex" alignItems="center">
                                                            <Avatar 
                                                                src={emp.avatar} 
                                                                sx={{ mr: 2, width: 32, height: 32 }}
                                                            />
                                                            {`${emp.first_name} ${emp.last_name}`}
                                                        </Box>
                                                    </Link>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Link
                                                        to={`/admin/employee/${emp.user_name}`}
                                                        style={{
                                                            textDecoration: "none",
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        {emp.role_id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Link
                                                        to={`/admin/employee/${emp.user_name}`}
                                                        style={{
                                                            textDecoration: "none",
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        {emp.email}
                                                    </Link>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Link
                                                        to={`/admin/employee/${emp.user_name}`}
                                                        style={{
                                                            textDecoration: "none",
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        {emp.phone || '-'}
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                No employees found in this department.
                            </Typography>
                        )}

                        {employees.length > 0 && (
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
                                    {employees.length}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Edit Department Modal */}
            <Dialog
                open={editOpen}
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
                        <IconButton onClick={() => setEditOpen(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off">
                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                            <TextField
                                required
                                id="name"
                                label="Department Name"
                                variant="outlined"
                                value={editName}
                                error={nameError}
                                onChange={(e) => setEditName(e.target.value)}
                                sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}
                            />
                        </FormControl>

                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                            <InputLabel id="manager-label">Manager</InputLabel>
                            <Select
                                labelId="manager-label"
                                id="manager-select"
                                value={editManager?.id || ''}
                                onChange={(e) => {
                                    const selectedManager = allEmployees.find(emp => emp.id === e.target.value);
                                    setEditManager(selectedManager || null);
                                }}
                                label="Manager"
                                sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {allEmployees.map((employee) => (
                                    <MenuItem key={employee.id} value={employee.id}>
                                        {`${employee.first_name} ${employee.last_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                            <InputLabel id="supervisor-label">Supervisor</InputLabel>
                            <Select
                                labelId="supervisor-label"
                                id="supervisor-select"
                                value={editSupervisor?.id || ''}
                                onChange={(e) => {
                                    const selectedSupervisor = allEmployees.find(emp => emp.id === e.target.value);
                                    setEditSupervisor(selectedSupervisor || null);
                                }}
                                label="Supervisor"
                                sx={{
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {allEmployees.map((employee) => (
                                    <MenuItem key={employee.id} value={employee.id}>
                                        {`${employee.first_name} ${employee.last_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                sx={{ backgroundColor: '#177604', color: 'white' }} 
                                className="m-1"
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