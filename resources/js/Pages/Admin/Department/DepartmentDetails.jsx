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
    Paper,
    Button,
    Avatar,
    Divider,
    Grid,
    TextField,
    Link
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
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        const fetchDepartmentDetails = async () => {
            try {
                const response = await axiosInstance.get(`/settings/getDepartment/${id}`, { headers });
                setDepartment(response.data.department);
                setEmployees(response.data.employees || []);
            } catch (err) {
                console.error("Error fetching department:", err);
                setError("Failed to load department details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDepartmentDetails();
    }, [id]);

    const filteredEmployees = employees.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchKeyword.toLowerCase())
    );

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
                        <Typography variant="h4" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
                            {department.name}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(-1)}
                            sx={{ 
                                backgroundColor: 'white', 
                                color: '#177604',
                                borderColor: '#177604',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    borderColor: '#177604'
                                }
                            }}
                        >
                            Back to Departments
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
                      

                        <Box sx={{ mt: 4 }}>
                           
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                             <TableCell align="center">Department Name</TableCell>
                                            <TableCell align="center">Assigned Manager</TableCell>
                                            <TableCell align="center">Assigned Supervisor</TableCell>
                                            <TableCell align="center">Approver</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                              <TableCell align="center">
                                                {department.name ? (
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
                                                        {department.name}
                                                        </Typography>
                                                    </Box>
                                                ) : "-"}
                                            </TableCell>

                                            <TableCell align="center">
                                                {department.manager_name ? (
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <Avatar 
                                                            src={department.manager_avatar} 
                                                            sx={{ mr: 2, width: 32, height: 32 }}
                                                        />
                                                        {department.manager_name}
                                                    </Box>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                {department.supervisor_name ? (
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <Avatar 
                                                            src={department.supervisor_avatar} 
                                                            sx={{ mr: 2, width: 32, height: 32 }}
                                                        />
                                                        {department.supervisor_name}
                                                    </Box>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                {department.approver_name ? (
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <Avatar 
                                                            src={department.approver_avatar} 
                                                            sx={{ mr: 2, width: 32, height: 32 }}
                                                        />
                                                        {department.approver_name}
                                                    </Box>
                                                ) : "-"}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 3
                                    }}
                                >
                                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                        Employees
                                    </Typography>
                                    <TextField
                                        label="Search Employees"
                                        variant="outlined"
                                        size="small"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        sx={{ width: 300 }}
                                    />
                                </Box>

                                {filteredEmployees.length > 0 ? (
                                    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
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
                                                        <TableCell align="left">{emp.phone || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography sx={{ py: 3, textAlign: 'center' }}>
                                        No employees found in this department.
                                    </Typography>
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
            </Box>
        </Layout>
    );
};

export default DepartmentDetails;