import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
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
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import SearchIcon from "@mui/icons-material/Search";

const EditBranchModal = ({ 
    open, 
    onClose, 
    branch, 
    setBranch, 
    branchPositions, 
    positionAssignments, 
    setPositionAssignments, 
    allEmployees,
    id,
    headers,
    refreshBranchData
}) => {
    const [searchQueries, setSearchQueries] = useState({});

    // Helper function to get employee name by ID
    const getEmployeeNameById = (employeeId) => {
        if (!employeeId) return "Not assigned";
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return employee ? `${employee.first_name} ${employee.last_name}` : "Not assigned";
    };

    // Get assigned employee for a specific position
    const getAssignedEmployeeForPosition = (positionId) => {
        const assignment = positionAssignments.find(a => a.branch_position_id === positionId);
        return assignment ? assignment.employee_id : null;
    };

    // Update position assignment
    const handlePositionAssignmentChange = (positionId, employeeId) => {
        const updatedAssignments = [...positionAssignments];
        const existingIndex = updatedAssignments.findIndex(a => a.branch_position_id === positionId);
        
        if (existingIndex >= 0) {
            if (employeeId) {
                updatedAssignments[existingIndex].employee_id = employeeId;
            } else {
                updatedAssignments.splice(existingIndex, 1);
            }
        } else if (employeeId) {
            updatedAssignments.push({
                branch_id: id,
                branch_position_id: positionId,
                employee_id: employeeId
            });
        }
    
        setPositionAssignments(updatedAssignments);
    };

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

    const handleUpdateBranch = async () => {
        try {
            // First update branch details
            const branchResponse = await axiosInstance.post('/settings/editBranch', branch, { headers });
            
            if (branchResponse.data.status === 200) {
                // Update position assignments
                const assignmentsResponse = await axiosInstance.post(
                    '/settings/updateBranchPositionAssignments',
                    { 
                        branch_id: id,
                        assignments: positionAssignments
                    },
                    { headers }
                );

                // Update each employee's branch_position_id in the users table
                for (const assignment of positionAssignments) {
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
                        text: "Branch updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    });
                    onClose();
                    refreshBranchData();
                }
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
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    <IconButton onClick={onClose}><i className="si si-close"></i></IconButton>
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

                    {/* Position Assignments Section */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                        Position Assignments
                    </Typography>
                    
                    {branchPositions.map(position => (
                        <FormControl 
                            key={position.id} 
                            fullWidth 
                            sx={{ 
                                marginBottom: 3,
                                '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { 
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' } 
                                },
                            }}
                        >
                            <InputLabel id={`position-${position.id}-label`}>{position.name}</InputLabel>
                            <Select
                                labelId={`position-${position.id}-label`}
                                id={`position-${position.id}-select`}
                                value={getAssignedEmployeeForPosition(position.id) || ''}
                                label={position.name}
                                onChange={(e) => handlePositionAssignmentChange(position.id, e.target.value)}
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
                                            placeholder={`Search ${position.name} (ID: ${position.id})...`}
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
                                <MenuItem value="">Not assigned</MenuItem>
                                {getFilteredEmployeeOptions(position.id).map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        {`${emp.first_name} ${emp.last_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ))}

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
                            onClick={handleUpdateBranch}
                        >
                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Branch </p>
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default EditBranchModal;