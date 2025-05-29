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
    Menu
} from "@mui/material";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import Swal from "sweetalert2";

const BranchList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [branchPositions, setBranchPositions] = useState([]);

    // Add Branch Modal
    const [openModal, setOpenModal] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");

    // Branch Positions Settings Modal
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [newPosition, setNewPosition] = useState({
        name: "",
        can_review_request: false,
        can_approve_request: false,
        can_note_request: false,
        can_accept_request: false
    });

    // Add Button Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch branches
                const branchResponse = await axiosInstance.get("/settings/getBranches", { headers });
                setBranches(branchResponse.data.branches || []);
                
                // Fetch all employees for name mapping
                const employeesResponse = await axiosInstance.get('/employee/getEmployees', { headers });
                setAllEmployees(employeesResponse.data.employees || []);

                // Fetch branch positions
                const positionsResponse = await axiosInstance.get('/settings/getBranchPositions', { headers });
                setBranchPositions(positionsResponse.data.positions || []);

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

    // Helper function to get employees assigned to a specific branch and position
    const getEmployeesForBranchPosition = (branchId, positionId) => {
        const employeesInPosition = allEmployees.filter(emp => 
            emp.branch_id === branchId && emp.branch_position_id === positionId
        );
        
        if (employeesInPosition.length === 0) {
            return "-";
        }
        
        return employeesInPosition.map(emp => 
            `${emp.first_name} ${emp.last_name}`
        ).join(", ");
    };

    const filteredBranches = branches.filter((bran) =>
        bran.name.toLowerCase().includes(searchKeyword.toLowerCase())
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


    
    // Add New Branch Functions
    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!name);
        setAcronymError(!acronym);

        if (!name || !acronym) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This branch will be added",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Add",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            name: name,
            acronym: acronym,
            description: description
        };

        axiosInstance.post('/settings/saveBranch', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Branch saved successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        setBranches(prev => [...prev, response.data.branch]);
                        setName("");
                        setAcronym("");
                        setDescription("");
                        setOpenModal(false);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error saving branch!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            });
    };

    // Branch Positions Settings Functions
    const handlePositionChange = (index, field, value) => {
        const updatedPositions = [...branchPositions];
        updatedPositions[index][field] = value;
        setBranchPositions(updatedPositions);
    };

    const savePositionChanges = (index) => {
        const position = branchPositions[index];
        
        axiosInstance.post('/settings/saveBranchPosition', position, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    // Update the local state with the returned position data
                    const updatedPositions = [...branchPositions];
                    updatedPositions[index] = response.data.position;
                    setBranchPositions(updatedPositions);
                    
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Position updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch(error => {
                console.error('Error updating position:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error updating position!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            });
    };

    const addNewPosition = () => {
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

        axiosInstance.post('/settings/saveBranchPosition', newPosition, { headers })
            .then(response => {
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
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch(error => {
                console.error('Error adding position:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error adding position!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            });
    };

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
                        <Typography variant="h4" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
                            Branches 
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
                                    <i className="fa fa-plus mr-2"></i> Add
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
                                    <ListItemText>Add New Branch</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleSettings}>
                                    <ListItemText>Branch Positions Settings</ListItemText>
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
                                    label="Search Branch"
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
                                            <TableRow>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Branch</TableCell>
                                                {branchPositions.map(position => (
                                                    <TableCell key={position.id} align="center" sx={{fontWeight: 'bold'}}>
                                                        {position.name}
                                                    </TableCell>
                                                ))}
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>No. of Employees</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredBranches.length > 0 ? (
                                                filteredBranches.map((branch) => (
                                                    <TableRow 
                                                        key={branch.id}
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
                                                                to={`/admin/branches/${branch.id}`}
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
                                                                    {branch.name}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>
                                                        
                                                        {branchPositions.map(position => (
                                                            <TableCell key={position.id} align="center">
                                                                <Link
                                                                    to={`/admin/branches/${branch.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {getEmployeesForBranchPosition(branch.id, position.id)}
                                                                </Link>
                                                            </TableCell>
                                                        ))}
                                                        
                                                        <TableCell align="center">
                                                            <Link
                                                                to={`/admin/branches/${branch.id}`}
                                                                style={{
                                                                    textDecoration: "none",
                                                                    color: "inherit",
                                                                    display: "block",
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    padding: "16px"
                                                                }}
                                                            >
                                                                {allEmployees.filter(emp => emp.branch_id === branch.id).length}
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={branchPositions.length + 2} align="center">
                                                        No branches found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {filteredBranches.length > 0 && (
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
                                            Number of branches:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredBranches.length}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Add New Branch Modal */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
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
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add New Branch </Typography>
                        <IconButton onClick={() => setOpenModal(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={acronym}
                                    error={acronymError}
                                    onChange={(e) => setAcronym(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={4}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Branch </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Branch Positions Settings Modal */}
            <Dialog
                open={openSettingsModal}
                onClose={() => setOpenSettingsModal(false)}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1200px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Branch Positions Settings </Typography>
                        <IconButton onClick={() => setOpenSettingsModal(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box sx={{ mt: 3, my: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Existing Positions</Typography>
                        
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Position Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Review Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Approve Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Note Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Accept Request</TableCell>
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
                                                    onChange={(e) => handlePositionChange(index, 'name', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_review_request}
                                                    onChange={(e) => handlePositionChange(index, 'can_review_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_approve_request}
                                                    onChange={(e) => handlePositionChange(index, 'can_approve_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_note_request}
                                                    onChange={(e) => handlePositionChange(index, 'can_note_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={position.can_accept_request}
                                                    onChange={(e) => handlePositionChange(index, 'can_accept_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => savePositionChanges(index)}
                                                    sx={{ backgroundColor: '#177604', color: 'white' }}
                                                >
                                                    Save
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="h6" sx={{ mt: 5, mb: 3 }}>Add New Position</Typography>
                        
                        <Box component="form" sx={{ mb: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Position Name"
                                        value={newPosition.name}
                                        onChange={(e) => setNewPosition({...newPosition, name: e.target.value})}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Box display="flex" alignItems="center" height="100%">
                                        <Checkbox
                                            checked={newPosition.can_review_request}
                                            onChange={(e) => setNewPosition({...newPosition, can_review_request: e.target.checked})}
                                        />
                                        <Typography>Can Review</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Box display="flex" alignItems="center" height="100%">
                                        <Checkbox
                                            checked={newPosition.can_approve_request}
                                            onChange={(e) => setNewPosition({...newPosition, can_approve_request: e.target.checked})}
                                        />
                                        <Typography>Can Approve</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Box display="flex" alignItems="center" height="100%">
                                        <Checkbox
                                            checked={newPosition.can_note_request}
                                            onChange={(e) => setNewPosition({...newPosition, can_note_request: e.target.checked})}
                                        />
                                        <Typography>Can Note</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Box display="flex" alignItems="center" height="100%">
                                        <Checkbox
                                            checked={newPosition.can_accept_request}
                                            onChange={(e) => setNewPosition({...newPosition, can_accept_request: e.target.checked})}
                                        />
                                        <Typography>Can Accept</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={1}>
                                    <Button 
                                        variant="contained" 
                                        onClick={addNewPosition}
                                        sx={{ backgroundColor: '#177604', color: 'white' }}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchList;