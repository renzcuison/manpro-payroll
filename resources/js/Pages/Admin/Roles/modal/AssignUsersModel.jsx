import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Checkbox,
  Button
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';

const AssignUsersModal = ({ open, onClose, roleId, onAssignSuccess }) => {
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));
  console.log("Stored User:", storedUser);
  console.log("Headers:", headers);

  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    if (open) {
      console.log("Modal opened - fetching employees...");

      axiosInstance.get('/settings/getEmployees', { headers })
        .then(res => {
          console.log("Raw Response:", res);
          console.log("res.data:", res.data);

          const employees = Array.isArray(res.data)
            ? res.data
            : res.data.employees ?? [];

          console.log("Parsed Employees:", employees);
          setAllEmployees(employees);
        })
        .catch(err => {
          console.error("Failed to fetch employees:", err);
        });
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const ids = selectedEmployees.map(emp => emp.id);
      console.log("Submitting user IDs:", ids);

      await axiosInstance.put(
        `/settings/assignEmployeesToRole/${roleId}`,
        { user_ids: ids },
        { headers }
      );
      console.log("Assignment successful");
      onAssignSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to assign employees:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Employees to Role</DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          options={allEmployees}
          getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
          renderInput={(params) => <TextField {...params} label="Select Employees" />}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              {`${option.first_name} ${option.last_name}`}
            </li>
          )}
          value={selectedEmployees}
          onChange={(e, value) => {
            console.log("Selected employees:", value);
            setSelectedEmployees(value);
          }}
          disableCloseOnSelect
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} color="primary">
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUsersModal;
