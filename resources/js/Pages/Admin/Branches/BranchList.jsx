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
    
    // Table settings state with defaults
    const [tableSettings, setTableSettings] = useState({
        client_id: "",
        with_manager: true,
        with_supervisor: true,
        with_approver: true,
        manager_limit: 1,
        supervisor_limit: 1,
        approver_limit: 1
    });

    const [openModal, setOpenModal] = useState(false);
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");
    
    // For dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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

                // Fetch branch settings
                const settingsResponse = await axiosInstance.get('/settings/getBranchSettings', { headers });
                if (settingsResponse.data.settings) {
                    setTableSettings(settingsResponse.data.settings);
                    // Also save to localStorage as fallback
                    localStorage.setItem("branchTableSettings", JSON.stringify(settingsResponse.data.settings));
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                // Fallback to localStorage if API fails
                const savedSettings = localStorage.getItem("branchTableSettings");
                if (savedSettings) {
                    setTableSettings(JSON.parse(savedSettings));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper function to get employee name by ID
    const getEmployeeNameById = (employeeId) => {
        if (!employeeId) return "-";
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? `${employee.first_name} ${employee.last_name}` : "-";
    };

    // Helper function to get employee avatar by ID
    const getEmployeeAvatarById = (employeeId) => {
        if (!employeeId) return null;
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? employee.avatar : null;
    };

    const filteredBranches = branches.filter((bran) =>
        bran.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

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
            });
    };

    const handleSettingsChange = (field, value) => {
        setTableSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveSettings = async () => {
        try {
            const response = await axiosInstance.post(
                '/settings/saveBranchSettings', 
                tableSettings,
                { headers }
            );
            
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Settings saved successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                setOpenSettingsModal(false);
                // Also save to localStorage as fallback
                localStorage.setItem("branchTableSettings", JSON.stringify(tableSettings));
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Failed to save settings",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
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
                                onClick={handleMenuClick}
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                endIcon={<i className="fa fa-caret-down"></i>}
                            >
                                <p className="m-0">
                                    <i className="fa fa-plus mr-2"></i> Add
                                </p>
                            </Button>
                            
                            <Menu
                                anchorEl={anchorEl}
                                open={openMenu}
                                onClose={handleMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                            >
                                <MenuItem onClick={() => {
                                    setOpenModal(true);
                                    handleMenuClose();
                                }}>
                                    <i className="fa fa-plus mr-2"></i> Add Branch
                                </MenuItem>
                                <MenuItem onClick={() => {
                                    setOpenSettingsModal(true);
                                    handleMenuClose();
                                }}>
                                    <i className="fa fa-cog mr-2"></i> Settings
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
                                                {tableSettings.with_manager && (
                                                    <TableCell align="center"sx={{fontWeight: 'bold'}}>Assigned Manager</TableCell>
                                                )}
                                                {tableSettings.with_supervisor && (
                                                    <TableCell align="center" sx={{fontWeight: 'bold'}}>Assigned Supervisor</TableCell>
                                                )}
                                                {tableSettings.with_approver && (
                                                    <TableCell align="center" sx={{fontWeight: 'bold'}}>Assigned Approver</TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredBranches.length > 0 ? (
                                                filteredBranches.map((bran) => (
                                                    <TableRow 
                                                        key={bran.id}
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
                                                                to={`/admin/branches/${bran.id}`}
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
                                                                    {bran.name}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>
                                                        {tableSettings.with_manager && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                                        {getEmployeeNameById(bran.manager_id)}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {tableSettings.with_supervisor && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                                        {getEmployeeNameById(bran.supervisor_id)}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {tableSettings.with_approver && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                                        {getEmployeeNameById(bran.approver_id)}
                                                                    </Box>
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={
                                                        1 + // Branch column
                                                        (tableSettings.with_manager ? 1 : 0) +
                                                        (tableSettings.with_supervisor ? 1 : 0) +
                                                        (tableSettings.with_approver ? 1 : 0)
                                                    } align="center">
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

            {/* Add Branch Modal */}
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
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Branch </Typography>
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

            {/* Settings Modal */}
            <Dialog
                open={openSettingsModal}
                onClose={() => setOpenSettingsModal(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Table Settings </Typography>
                        <IconButton onClick={() => setOpenSettingsModal(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box sx={{ mt: 3, my: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Branch Settings:</Typography>

                        <FormGroup>
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Client ID"
                                    variant="outlined"
                                    value={tableSettings.client_id}
                                    onChange={(e) => handleSettingsChange('client_id', e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Checkbox
                                    checked={tableSettings.with_manager}
                                    onChange={(e) => handleSettingsChange('with_manager', e.target.checked)}
                                    color="primary"
                                />
                                <Typography>Show Manager Column</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Checkbox
                                    checked={tableSettings.with_supervisor}
                                    onChange={(e) => handleSettingsChange('with_supervisor', e.target.checked)}
                                    color="primary"
                                />
                                <Typography>Show Supervisor Column</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Checkbox
                                    checked={tableSettings.with_approver}
                                    onChange={(e) => handleSettingsChange('with_approver', e.target.checked)}
                                    color="primary"
                                />
                                <Typography>Show Approver Column</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Manager Limit"
                                    type="number"
                                    variant="outlined"
                                    value={tableSettings.manager_limit}
                                    onChange={(e) => handleSettingsChange('manager_limit', e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Supervisor Limit"
                                    type="number"
                                    variant="outlined"
                                    value={tableSettings.supervisor_limit}
                                    onChange={(e) => handleSettingsChange('supervisor_limit', e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Approver Limit"
                                    type="number"
                                    variant="outlined"
                                    value={tableSettings.approver_limit}
                                    onChange={(e) => handleSettingsChange('approver_limit', e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{ inputProps: { min: 0 } }}
                                />
                            </Box>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button 
                                variant="contained" 
                                sx={{ backgroundColor: '#177604', color: 'white' }} 
                                className="m-1"
                                onClick={saveSettings}
                            >
                                <p className='m-0'><i className="fa fa-check mr-2 mt-1"></i> Apply Settings </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchList;