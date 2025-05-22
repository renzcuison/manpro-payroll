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
    Paper,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from "@mui/material";
import { Link } from "react-router-dom";

const BranchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branch, setBranch] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editContactNumber, setEditContactNumber] = useState("");

    useEffect(() => {
        const fetchBranchDetails = async () => {
            try {
                const response = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
                setBranch(response.data.branch);
                setEmployees(response.data.employees || []);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching branch details:", err);
                setError("Failed to load branch details");
                setIsLoading(false);
            }
        };

        fetchBranchDetails();
    }, [id]);

    const openEditModal = () => {
        setEditName(branch.name);
        setEditLocation(branch.location);
        setEditContactNumber(branch.contact_number);
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            await axiosInstance.put(`/settings/updateBranch/${id}`, {
                name: editName,
                location: editLocation,
                contact_number: editContactNumber
            }, { headers });

            // Refresh branch data
            setBranch(prev => ({
                ...prev,
                name: editName,
                location: editLocation,
                contact_number: editContactNumber
            }));

            setEditOpen(false);
        } catch (err) {
            console.error("Failed to save edits:", err);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!branch) return <Typography>Branch not found</Typography>;

    return (
        <Layout title={`Branch: ${branch.name}`}>
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
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Branch Details
                        </Typography>
                        <Box>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => navigate(-1)}
                                sx={{ mr: 2 }}
                            >
                                Back to Branches
                            </Button>
                            <Button variant="outlined" onClick={openEditModal}>
                                Edit
                            </Button>
                        </Box>
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
                                        <strong>{branch.name}</strong>
                                    </Typography>
                                    {branch.location && (
                                        <Typography variant="subtitle1" gutterBottom>
                                            <strong>Location:</strong> {branch.location}
                                        </Typography>
                                    )}
                                    {branch.contact_number && (
                                        <Typography variant="subtitle1" gutterBottom>
                                            <strong>Contact Number:</strong> {branch.contact_number}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>

                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                            Employees at this Branch
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
                                No employees found at this branch.
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

            {/* Edit Branch Modal */}
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
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
                        <IconButton onClick={() => setEditOpen(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box sx={{ mt: 3, my: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Branch Name"
                                    variant="outlined"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    variant="outlined"
                                    value={editLocation}
                                    onChange={(e) => setEditLocation(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    variant="outlined"
                                    value={editContactNumber}
                                    onChange={(e) => setEditContactNumber(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button 
                                variant="contained" 
                                sx={{ 
                                    backgroundColor: '#177604', 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#126303'
                                    }
                                }} 
                                onClick={handleSaveEdit}
                            >
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Changes </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchDetails;