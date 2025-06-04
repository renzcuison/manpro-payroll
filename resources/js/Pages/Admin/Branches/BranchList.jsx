import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, TextField, Grid, Checkbox, ListItemText, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, Avatar, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import Swal from "sweetalert2";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import AddNewBranchModal from '../Branches/Modals/AddNewBranchModal';

const BranchList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [branchPositions, setBranchPositions] = useState([]);
    const [fetchError, setFetchError] = useState(null);

    // Modal states
    const [openAddBranchModal, setOpenAddBranchModal] = useState(false);

    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [newPosition, setNewPosition] = useState({ name: "", can_review_request: false, can_approve_request: false, can_note_request: false, can_accept_request: false });

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setFetchError(null);

            const [branchesRes, employeesRes, positionsRes] = await Promise.all([
                axiosInstance.get("/settings/getBranches", { headers }),
                axiosInstance.get('/employee/getEmployees', { headers }),
                axiosInstance.get('/settings/getBranchPositions', { headers })
            ]);

            setBranches(branchesRes.data?.branches || []);
            setAllEmployees(employeesRes.data?.employees || []);
            setBranchPositions(positionsRes.data?.positions || []);

        } catch (error) {
            console.error("Error in fetchData:", error);
            setFetchError(error.message);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error loading data! Please try again.",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBranches = React.useMemo(() => {
        return branches.filter(bran => bran.name?.toLowerCase().includes(searchKeyword.toLowerCase()) );
    }, [branches, searchKeyword]);

    const getEmployeesForBranchPosition = (branchId, positionId) => {
        const branch = branches.find(b => b.id === branchId);
        if (!branch) return [];

        return allEmployees.filter(emp =>
            emp.branch?.trim().toLowerCase() === branch.name.trim().toLowerCase() && Number(emp.branch_position_id) === Number(positionId)
        );
    };

    const renderEmployeeAvatars = (branchId, positionId) => {
        const employees = getEmployeesForBranchPosition(branchId, positionId);

        if (employees.length === 0) {
            return (
                <Box display="flex" justifyContent="center">
                    <Typography variant="caption" color="textSecondary">-</Typography>
                </Box>
            );
        }


        return (
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
                {employees.map(emp => (
                    <Tooltip key={emp.id} title={`${emp.first_name} ${emp.last_name}`} arrow >
                        {emp.avatar ? (
                            <Avatar src={`data:${emp.avatar_mime};base64,${emp.avatar}`} sx={{ width: 32, height: 32 }} />
                        ) : (
                            <Avatar sx={{ width: 32, height: 32 }}> {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)} </Avatar>
                        )}
                    </Tooltip>
                ))}
            </Box>
        );
    };

    // Modal handlers
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSettings = () => {
        handleMenuClose();
        setOpenSettingsModal(true);
    };

    // Position CRUD operations
    const handlePositionChange = (index, field, value) => {
        const updatedPositions = [...branchPositions];
        updatedPositions[index][field] = value;
        setBranchPositions(updatedPositions);
    };

    const savePositionChanges = async (index) => {
        const position = branchPositions[index];

        try {
            const response = await axiosInstance.post('/settings/saveBranchPosition', position, { headers });

            if (response.data.status === 200) {
                const updatedPositions = [...branchPositions];
                updatedPositions[index] = response.data.position;
                setBranchPositions(updatedPositions);

                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Position updated successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        } catch (error) {
            console.error("Error updating position:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error updating position!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    const addNewPosition = async () => {
        if (!newPosition.name) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Position name is required!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        try {
            const response = await axiosInstance.post('/settings/saveBranchPosition', newPosition, { headers });

            if (response.data.status === 200) {
                setBranchPositions(prev => [...prev, response.data.position]);
                setNewPosition({
                    name: "",
                    can_review_request: false,
                    can_approve_request: false,
                    can_note_request: false,
                    can_accept_request: false
                });
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Position added successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        } catch (error) {
            console.error("Error adding position:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error adding position!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    const renderBranchTable = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }

        if (fetchError) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Error loading data: {fetchError}</Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2, backgroundColor: '#177604' }}
                    >
                        Retry
                    </Button>
                </Box>
            );
        }

        if (branches.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No branches found. Please add a new branch.</Typography>
                </Box>
            );
        }

        if (filteredBranches.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No branches match your search criteria.</Typography>
                </Box>
            );
        }

        return (
            <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                            {branchPositions.map(position => (
                                <TableCell key={position.id} align="center" sx={{ fontWeight: 'bold' }}>
                                    {position.name}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Employees</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBranches.map((branch) => (
                            <TableRow key={branch.id} hover>
                                <TableCell align="center">
                                    <Link to={`/admin/branch/${branch.id}`} style={{ textDecoration: "none", color: "inherit", display: "block", textAlign: "left" }} >
                                        <Typography>{branch.name} ({branch.acronym})</Typography>
                                        <Typography variant="caption" color="textSecondary"> {branch.description ?? ""} </Typography>
                                    </Link>
                                </TableCell>

                                {branchPositions.map(position => (
                                    <TableCell key={`${branch.id}-${position.id}`} align="center">
                                        {renderEmployeeAvatars(branch.id, position.id)}
                                    </TableCell>
                                ))}

                                <TableCell align="center">
                                    {branch.employees_count || "0"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    // Openning and Closing Modals
    const handleOpenAddBranchModal = () => {
        handleMenuClose();
        setOpenAddBranchModal(true);
    }
    const handleCloseAddBranchModal = (reload) => {
        setOpenAddBranchModal(false);
    }

    return (
        <Layout title={"Branches"}>
            <Box sx={{ overflowX: "auto", width: "100%" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Branches
                        </Typography>

                        <Grid item>
                            <Button variant="contained" onClick={handleMenuOpen} endIcon={<ArrowDropDownIcon />} sx={{ backgroundColor: '#177604', color: 'white', '&:hover': { backgroundColor: '#126703' }}}>Menu</Button>
                            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} >
                                <MenuItem onClick={handleOpenAddBranchModal}>
                                    <ListItemText>Add New Branch</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleSettings}>
                                    <ListItemText>Branch Positions Settings</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Grid>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }} >
                        <Grid container spacing={2} sx={{ pb: 4 }}>
                            <Grid item xs={12} md={9}>
                                <TextField
                                    fullWidth
                                    label="Search Branch"
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
                        </Grid>

                        {renderBranchTable()}

                        {filteredBranches.length > 0 && (
                            <Box display="flex" sx={{ py: 2, pr: 2, justifyContent: "flex-end", alignItems: "center" }} >
                                <Typography sx={{ mr: 2 }}>
                                    Showing {filteredBranches.length} of {branches.length} branches
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <AddNewBranchModal open={openAddBranchModal} close={handleCloseAddBranchModal}/>

            {/* Branch Positions Settings Modal */}
            <Dialog open={openSettingsModal} onClose={() => setOpenSettingsModal(false)} fullWidth maxWidth="lg" scroll="paper" >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="bold">Branch Positions Settings</Typography>
                        <IconButton onClick={() => setOpenSettingsModal(false)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>Existing Positions</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Review</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Approve</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Note</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Accept</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {branchPositions.map((position, index) => (
                                        <TableRow key={position.id}>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    value={position.name}
                                                    onChange={(e) =>
                                                        handlePositionChange(index, 'name', e.target.value)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_review_request}
                                                    onChange={(e) =>
                                                        handlePositionChange(index, 'can_review_request', e.target.checked)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_approve_request}
                                                    onChange={(e) =>
                                                        handlePositionChange(index, 'can_approve_request', e.target.checked)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_note_request}
                                                    onChange={(e) =>
                                                        handlePositionChange(index, 'can_note_request', e.target.checked)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_accept_request}
                                                    onChange={(e) =>
                                                        handlePositionChange(index, 'can_accept_request', e.target.checked)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => savePositionChanges(index)}
                                                    sx={{
                                                        backgroundColor: '#177604',
                                                        '&:hover': { backgroundColor: '#126903' }
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom>Add New Position</Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Position Name"
                                    value={newPosition.name}
                                    onChange={(e) =>
                                        setNewPosition({ ...newPosition, name: e.target.value })
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Box display="flex" alignItems="center">
                                    <Checkbox
                                        checked={newPosition.can_review_request}
                                        onChange={(e) =>
                                            setNewPosition({ ...newPosition, can_review_request: e.target.checked })
                                        }
                                    />
                                    <Typography>Review</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Box display="flex" alignItems="center">
                                    <Checkbox
                                        checked={newPosition.can_approve_request}
                                        onChange={(e) =>
                                            setNewPosition({ ...newPosition, can_approve_request: e.target.checked })
                                        }
                                    />
                                    <Typography>Approve</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Box display="flex" alignItems="center">
                                    <Checkbox
                                        checked={newPosition.can_note_request}
                                        onChange={(e) =>
                                            setNewPosition({ ...newPosition, can_note_request: e.target.checked })
                                        }
                                    />
                                    <Typography>Note</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Box display="flex" alignItems="center">
                                    <Checkbox
                                        checked={newPosition.can_accept_request}
                                        onChange={(e) =>
                                            setNewPosition({ ...newPosition, can_accept_request: e.target.checked })
                                        }
                                    />
                                    <Typography>Accept</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={1}>
                                <Button
                                    variant="contained"
                                    onClick={addNewPosition}
                                    sx={{
                                        backgroundColor: '#177604',
                                        '&:hover': { backgroundColor: '#126903' }
                                    }}
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchList;