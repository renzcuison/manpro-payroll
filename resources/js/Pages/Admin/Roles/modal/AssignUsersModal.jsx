import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Button,
  Avatar,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

const AssignUsersModal = ({ open, onClose, roleId, onAssignSuccess }) => {
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      axiosInstance.get('/settings/getEmployees', { headers }).then(res => {
        const filtered = res.data.filter(emp => emp.role_id !== roleId);
        setAllEmployees(filtered);
        setFilteredEmployees(filtered);
        setSelectedEmployees([]);
        setSearchQuery('');
      });
    }
  }, [open, roleId]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredEmployees(
      allEmployees.filter(
        (emp) =>
          `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(query)
      )
    );
  };

  const toggleSelection = (emp) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.some((e) => e.id === emp.id)
        ? prevSelected.filter((e) => e.id !== emp.id)
        : [...prevSelected, emp]
    );
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'Please select at least one employee.',
        icon: 'warning',
        customClass: { popup: 'swal-popup-zfix' }
      });
      return;
    }

    try {
      const user_ids = selectedEmployees.map((emp) => emp.id);
      await axiosInstance.put(
        `/settings/assignEmployeesToRole/${roleId}`,
        { user_ids },
        { headers }
      );
      Swal.fire({
        title: 'Success',
        text: 'Users assigned to this role.',
        icon: 'success',
        customClass: { popup: 'swal-popup-zfix' }
      });
      onAssignSuccess();
      onClose();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to assign users.',
        icon: 'error',
        customClass: { popup: 'swal-popup-zfix' }
      });
    }
  };

  useEffect(() => {
    const swalStyle = document.createElement('style');
    swalStyle.innerHTML = `.swal-popup-zfix { z-index: 2000 !important; }`;
    document.head.appendChild(swalStyle);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle sx={{ pb: 0 }}>
        Assign Employees to Role
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 2,
          maxHeight: '70vh'
        }}
      >
        <TextField
          label="Search employees"
          placeholder="Start typing to search..."
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
        />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <List>
            {filteredEmployees.map((emp) => (
              <ListItem
                key={emp.id}
                button
                onClick={() => toggleSelection(emp)}
                sx={{
                  borderRadius: 1,
                  backgroundColor: selectedEmployees.some(e => e.id === emp.id)
                    ? 'rgba(25, 118, 210, 0.1)'
                    : 'inherit'
                }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedEmployees.some((e) => e.id === emp.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemAvatar>
                  <Avatar src={emp.avatar || undefined}>
                    {emp.first_name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${emp.first_name} ${emp.last_name}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          borderTop: '1px solid #ccc'
        }}
      >
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleAssign}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUsersModal;
