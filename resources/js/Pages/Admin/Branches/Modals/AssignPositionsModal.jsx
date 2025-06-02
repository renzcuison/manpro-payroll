import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiDialog: {
      styleOverrides: {
        root: {
          zIndex: '1300 !important',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#177604',
            },
            '&:hover fieldset': {
              borderColor: '#177604', 
            },
            '&.Mui-focused fieldset': {
              borderColor: '#177604', 
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#177604', 
          '&:hover': {
            backgroundColor: '#125a03', 
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#177604', 
          '&.Mui-checked': {
            color: '#177604', 
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#177604', 
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#177604', 
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#177604', 
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#177604',
          },
        },
      },
    },
  },
});

const AssignPositionsModal = ({
  open,
  onClose,
  branchPositions,
  allEmployees,
  positionAssignments,
  handlePositionAssignmentChange,
  getAssignedEmployeesForPosition,
  searchQueries,
  handleSearchChange,
  headers,
  id,
  setPositionAssignments,
  setEmployees
}) => {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [newlySelectedEmployees, setNewlySelectedEmployees] = useState([]);
  const [selectedForRemoval, setSelectedForRemoval] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [currentlyAssigned, setCurrentlyAssigned] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      const fetchAssignedEmployees = async () => {
        try {
          const response = await axiosInstance.get(
            `/settings/getBranchPositionAssignments/${id}`,
            { headers }
          );
          const assignments = response.data.assignments || [];
          
          const assignedEmps = allEmployees.filter(emp => emp.branch_position_id !== null);
          setAssignedEmployees(assignedEmps);
          
          if (selectedPosition) {
            const assignedToPosition = assignments
              .filter(a => a.branch_position_id === selectedPosition)
              .map(a => allEmployees.find(e => e.id === a.employee_id))
              .filter(Boolean);
            setCurrentlyAssigned(assignedToPosition);
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
        }
      };
      fetchAssignedEmployees();
    }
  }, [open, selectedPosition, id, allEmployees, headers]);

  useEffect(() => {
    if (selectedPosition && activeTab === 0) {
      const query = searchQueries[selectedPosition]?.toLowerCase() || '';
      const filtered = allEmployees.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(query) &&
        !currentlyAssigned.some(a => a.id === emp.id)
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
      setNewlySelectedEmployees([]);
    }
  }, [selectedPosition, searchQueries, allEmployees, currentlyAssigned, activeTab]);

  const handlePositionChange = (event) => {
    setSelectedPosition(event.target.value);
    setNewlySelectedEmployees([]);
    setSelectedForRemoval([]);
  };

  const handleEmployeeToggle = (employeeId) => {
    setNewlySelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleRemoveToggle = (employeeId) => {
    setSelectedForRemoval(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSearch = (e) => {
    handleSearchChange(selectedPosition, e.target.value);
  };

  const handleAssignedSearch = (e) => {
    setAssignedSearchQuery(e.target.value.toLowerCase());
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedForRemoval([]);
  };

  const handleSave = async () => {
    if (newlySelectedEmployees.length === 0) {
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "No new assignments to add",
        icon: "info",
        confirmButtonColor: '#177604',
      });
      return;
    }

    const result = await Swal.fire({
      customClass: { container: 'my-swal' },
      title: 'Confirm Assignments',
      text: `Add ${newlySelectedEmployees.length} new assignment(s) to this position?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#177604',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add them',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setIsSaving(true);
      
      const newAssignments = newlySelectedEmployees.map(employeeId => ({
        branch_id: id,
        branch_position_id: selectedPosition,
        employee_id: employeeId
      }));

      await axiosInstance.post(
        '/settings/addBranchPositionAssignments',
        { 
          branch_id: id,
          assignments: newAssignments
        },
        { headers }
      );

      for (const employeeId of newlySelectedEmployees) {
        await axiosInstance.post(
          '/employee/updateEmployeeBranchPosition',
          {
            employee_id: employeeId,
            branch_position_id: selectedPosition
          },
          { headers }
        );
      }

      const updatedResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
      setPositionAssignments(updatedResponse.data.position_assignments || []);
      setEmployees(updatedResponse.data.employees || []);

      const newlyAssigned = allEmployees.filter(emp => newlySelectedEmployees.includes(emp.id));
      setCurrentlyAssigned(prev => [...prev, ...newlyAssigned]);
      setAssignedEmployees(prev => [...prev, ...newlyAssigned]);
      setNewlySelectedEmployees([]);

      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "New assignments added successfully!",
        icon: "success",
        confirmButtonColor: '#177604',
      });
    } catch (error) {
      console.error('Error saving assignments:', error);
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "Error adding new assignments!",
        icon: "error",
        confirmButtonColor: '#177604',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAssignments = async () => {
    if (selectedForRemoval.length === 0) {
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "No assignments selected for removal",
        icon: "info",
        confirmButtonColor: '#177604',
      });
      return;
    }

    const result = await Swal.fire({
      customClass: { container: 'my-swal' },
      title: 'Confirm Removal',
      text: `Remove ${selectedForRemoval.length} assignment(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#177604',
      confirmButtonText: 'Yes, remove them',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setIsRemoving(true);

      for (const employeeId of selectedForRemoval) {
        await axiosInstance.post(
          '/employee/updateEmployeeBranchPosition',
          {
            employee_id: employeeId,
            branch_position_id: null
          },
          { headers }
        );
      }

      setAssignedEmployees(prev => prev.filter(emp => !selectedForRemoval.includes(emp.id)));
      setCurrentlyAssigned(prev => prev.filter(emp => !selectedForRemoval.includes(emp.id)));
      
      setEmployees(prev => prev.map(emp => 
        selectedForRemoval.includes(emp.id) ? { ...emp, branch_position_id: null } : emp
      ));

      setPositionAssignments(prev => 
        prev.filter(assignment => !selectedForRemoval.includes(assignment.employee_id))
      );

      setSelectedForRemoval([]);

      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "Assignments removed successfully!",
        icon: "success",
        confirmButtonColor: '#177604',
      });
    } catch (error) {
      console.error('Error removing assignments:', error);
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "Error removing assignments!",
        icon: "error",
        confirmButtonColor: '#177604',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = allEmployees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : '';
  };

  const getPositionName = (positionId) => {
    const position = branchPositions.find(p => p.id === positionId);
    return position ? position.name : 'No position';
  };

  const renderAvatar = (employee) => {
    if (employee.avatar) {
      return (
        <Avatar 
          src={employee.avatar.startsWith('data:') ? employee.avatar : `data:image/png;base64,${employee.avatar}`}
          sx={{ width: 32, height: 32 }}
        />
      );
    }
    return (
      <Avatar sx={{ width: 32, height: 32 }}>
        {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
      </Avatar>
    );
  };

  const filteredAssignedEmployees = assignedEmployees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(assignedSearchQuery) &&
    (!selectedPosition || emp.branch_position_id === selectedPosition)
  );

  console.log('All Employees:', allEmployees);
console.log('Assigned Employees:', assignedEmployees);

  return (
    <ThemeProvider theme={theme}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            zIndex: 1300,
            padding: '16px',
            borderRadius: '20px',
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Manage Position Assignments
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#177604' }}>Select Position</InputLabel>
              <Select
                value={selectedPosition}
                color='success'
                onChange={handlePositionChange}
                label="Select Position"
              >
                {branchPositions.map(position => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="assignment tabs">
              <Tab label="Assign Employees" />
              <Tab label="Currently Assigned" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <>
              {selectedPosition ? (
                <>
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search employees to add..."
                      value={searchQueries[selectedPosition] || ''}
                      onChange={handleSearch}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Box>

                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List dense>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(employee => (
                          <ListItem
                            key={employee.id}
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                checked={newlySelectedEmployees.includes(employee.id)}
                                onChange={() => handleEmployeeToggle(employee.id)}
                              />
                            }
                            disablePadding
                          >
                            <ListItemButton onClick={() => handleEmployeeToggle(employee.id)}>
                              <Tooltip title={`${employee.first_name} ${employee.last_name}`} arrow>
                                {renderAvatar(employee)}
                              </Tooltip>
                              <ListItemText
                                primary={getEmployeeName(employee.id)}

                                sx={{ ml: 2 }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                          {searchQueries[selectedPosition] ? 
                            "No matching employees found" : 
                            "Search for employees to add to this position"}
                        </Typography>
                      )}
                    </List>
                  </Box>

                  {newlySelectedEmployees.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        New assignments for this position:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {newlySelectedEmployees.map(empId => {
                          const employee = allEmployees.find(e => e.id === empId);
                          return (
                            <Tooltip key={empId} title={`${getEmployeeName(empId)} (Branch: ${employee?.branch || 'N/A'})`} arrow>
                              {renderAvatar(employee)}
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  Please select a position to assign employees
                </Typography>
              )}
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search assigned employees..."
                  value={assignedSearchQuery}
                  onChange={handleAssignedSearch}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Box>
              
              {filteredAssignedEmployees.length > 0 ? (
                <>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List dense>
                      {filteredAssignedEmployees.map(employee => (
                        <ListItem
                          key={employee.id}
                          secondaryAction={
                            <Checkbox
                              edge="end"
                              checked={selectedForRemoval.includes(employee.id)}
                              onChange={() => handleRemoveToggle(employee.id)}
                            />
                          }
                          disablePadding
                        >
                          <ListItemButton onClick={() => handleRemoveToggle(employee.id)}>
                            <Tooltip title={`${employee.first_name} ${employee.last_name}`} arrow>
                              {renderAvatar(employee)}
                            </Tooltip>
                            <ListItemText
                              primary={getEmployeeName(employee.id)}
                              secondary={
                                <>
                                  <div>Position: {getPositionName(employee.branch_position_id)}</div>
 
                                </>
                              }
                              sx={{ ml: 2 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  {selectedForRemoval.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected for removal:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedForRemoval.map(empId => {
                          const employee = allEmployees.find(e => e.id === empId);
                          return (
                            <Tooltip key={empId} title={`${getEmployeeName(empId)} (Branch: ${employee?.branch || 'N/A'})`} arrow>
                              {renderAvatar(employee)}
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                  {assignedSearchQuery ? 
                    "No matching assigned employees found" : 
                    "No employees currently assigned to positions"}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}  sx={{ color: 'black' }}>
            Close
          </Button>
          {activeTab === 0 ? (
            <Button
              onClick={handleSave}
              color="primary"
              variant="contained"
              disabled={!selectedPosition || newlySelectedEmployees.length === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : 'Add Assignments'}
            </Button>
          ) : (
            <Button
              onClick={handleRemoveAssignments}
              color="error"
              variant="contained"
              disabled={selectedForRemoval.length === 0 || isRemoving}
              startIcon={<DeleteIcon />}
              sx={{
                backgroundColor: '#d32f2f', 
                '&:hover': {
                  backgroundColor: '#b71c1c', 
                },
              }}
            >
              {isRemoving ? 'Removing...' : `Remove (${selectedForRemoval.length})`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default AssignPositionsModal;