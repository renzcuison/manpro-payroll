import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Avatar
} from '@mui/material';
import { Search as SearchIcon, Cancel as CancelIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../utils/axiosConfig';

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
  const getEmployeeNameById = (employeeId) => {
    if (!employeeId) return "Not assigned";
    const employee = allEmployees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Not assigned";
  };

  const getFilteredEmployeeOptions = (positionId) => {
    const searchQuery = searchQueries[positionId] || "";
    return allEmployees.filter(emp => 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSave = async () => {
    const result = await Swal.fire({
      customClass: { container: 'my-swal' },
      title: 'Confirm Assignments',
      text: 'Are you sure you want to save these position assignments?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#177604',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const currentAssignmentsResponse = await axiosInstance.get(
          `/settings/getBranchPositionAssignments/${id}`,
          { headers }
        );
        const currentAssignments = currentAssignmentsResponse.data.assignments || [];
        
        const newAssignmentsToAdd = [];
        
        branchPositions.forEach(position => {
          const positionId = position.id;
          const locallyAssignedEmployeeIds = getAssignedEmployeesForPosition(positionId);
          
          locallyAssignedEmployeeIds.forEach(employeeId => {
            const assignmentExists = currentAssignments.some(
              a => a.branch_position_id === positionId && a.employee_id === employeeId
            );
            
            if (!assignmentExists) {
              newAssignmentsToAdd.push({
                branch_id: id,
                branch_position_id: positionId,
                employee_id: employeeId
              });
            }
          });
        });

        if (newAssignmentsToAdd.length > 0) {
          await axiosInstance.post(
            '/settings/addBranchPositionAssignments',
            { 
              branch_id: id,
              assignments: newAssignmentsToAdd
            },
            { headers }
          );

          for (const assignment of newAssignmentsToAdd) {
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

          Swal.fire({
            customClass: { container: 'my-swal' },
            text: "New position assignments added successfully!",
            icon: "success",
            showConfirmButton: true,
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#177604',
          });
          
          const updatedResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
          setPositionAssignments(updatedResponse.data.position_assignments || []);
          setEmployees(updatedResponse.data.employees || []);
        } else {
          Swal.fire({
            customClass: { container: 'my-swal' },
            text: "No new assignments to add.",
            icon: "info",
            showConfirmButton: true,
            confirmButtonColor: '#177604',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          customClass: { container: 'my-swal' },
          text: "Error adding new assignments!",
          icon: "error",
          showConfirmButton: true,
          confirmButtonColor: '#177604',
        });
      } finally {
        onClose();
      }
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
          <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}>Assign Positions</Typography>
          <IconButton onClick={onClose}>
            <i className="si si-close"></i>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
        <Box component="form" sx={{ mt: 3, my: 3 }}>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            Position Assignments
          </Typography>

          {branchPositions.map(position => (
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }} key={position.id}>
              <InputLabel id={`position-${position.id}-label`}>
                {position.name}
              </InputLabel>
              <Select
                labelId={`position-${position.id}-label`}
                id={`position-${position.id}-select`}
                multiple
                value={getAssignedEmployeesForPosition(position.id)}
                onChange={(e) => handlePositionAssignmentChange(position.id, e.target.value)}
                label={position.name}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => (
                      <Chip 
                        key={id}
                        label={getEmployeeNameById(id)}
                        onDelete={(e) => {
                          e.stopPropagation();
                          handlePositionAssignmentChange(
                            position.id, 
                            getAssignedEmployeesForPosition(position.id).filter(eid => eid !== id)
                          );
                        }}
                        deleteIcon={<CancelIcon />}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 300 } },
                  onClick: (e) => e.stopPropagation()
                }}
              >
                <MenuItem value="" sx={{ p: 0 }}>
                  <Box sx={{ p: 1, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                    <TextField
                      fullWidth
                      placeholder={`Search ${position.name}`}
                      value={searchQueries[position.id] || ''}
                      onChange={(e) => handleSearchChange(position.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
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

                {getFilteredEmployeeOptions(position.id).map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    <Checkbox
                      checked={getAssignedEmployeesForPosition(position.id).includes(emp.id)}
                    />
                    <ListItemText primary={`${emp.first_name} ${emp.last_name}`} />
                    <Avatar 
                      src={emp.avatar} 
                      sx={{ width: 24, height: 24, ml: 2 }} 
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#177604', color: 'white' }}
              onClick={handleSave}
            >
              <i className="fa fa-floppy-o mr-2"></i> Save Assignments
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPositionsModal;