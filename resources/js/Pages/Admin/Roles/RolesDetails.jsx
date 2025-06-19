import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  Avatar,
  Tooltip,
  Grid,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material';
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';
import Swal from 'sweetalert2';

const AssignUsersModal = ({ open, onClose, roleId, onAssignSuccess }) => {
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    if (open) {
      axiosInstance.get('/settings/getEmployees', { headers }).then(res => {
        const filtered = res.data.filter(emp => emp.role_id !== roleId);
        setAllEmployees(filtered);
        setSelectedEmployees([]);
      });
    }
  }, [open, roleId]);

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      Swal.fire('Warning', 'Please select at least one employee.', 'warning');
      return;
    }

    try {
      const user_ids = selectedEmployees.map(emp => emp.id);
      await axiosInstance.put(
        `/settings/assignEmployeesToRole/${roleId}`,
        { user_ids },
        { headers }
      );
      Swal.fire('Success', 'Users assigned to this role.', 'success');
      onAssignSuccess();
      onClose();
    } catch (err) {
      Swal.fire('Error', 'Failed to assign users.', 'error');
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
          isOptionEqualToValue={(option, value) => option.id === value.id}
          disableCloseOnSelect
          onChange={(e, newValue) => setSelectedEmployees(newValue)}
          value={selectedEmployees}
          renderInput={(params) => (
            <TextField {...params} label="Search and select employees" />
          )}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              {`${option.first_name} ${option.last_name}`}
            </li>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleAssign}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RolesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [role, setRole] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await axiosInstance.get(`/settings/getEmployeeRole/${id}`, { headers });
      setRole(res.data.role);
      setEmployees(res.data.employees || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch role details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (key, value) => {
    setRole(prev => ({ ...prev, [key]: value }));
  };

  const savePermissions = async () => {
    try {
      await axiosInstance.put(`/settings/updateEmployeeRole/${id}`, role, { headers });
      Swal.fire('Success', 'Permissions updated!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update permissions.', 'error');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Layout title="Role Details">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Box sx={{ mx: 'auto', mt: 5, width: { xs: '100%', md: '1400px' } }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            <i
              className="fa fa-chevron-left"
              aria-hidden="true"
              style={{ fontSize: '80%', cursor: 'pointer', marginRight: 8 }}
              onClick={() => navigate('/admin/roles')}
            ></i>
            {role?.name}
          </Typography>

          {/* Permissions Box */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              p: 3,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
              mb: 4
            }}
          >
            <TextField label="Position" value={role?.name || ''} disabled sx={{ width: 200 }} />
            <Box><Checkbox checked={role?.can_review_request || false} onChange={(e) => handlePermissionChange('can_review_request', e.target.checked)} />Review</Box>
            <Box><Checkbox checked={role?.can_approve_request || false} onChange={(e) => handlePermissionChange('can_approve_request', e.target.checked)} />Approve</Box>
            <Box><Checkbox checked={role?.can_note_request || false} onChange={(e) => handlePermissionChange('can_note_request', e.target.checked)} />Note</Box>
            <Box><Checkbox checked={role?.can_accept_request || false} onChange={(e) => handlePermissionChange('can_accept_request', e.target.checked)} />Accept</Box>
            <Button variant="contained" onClick={savePermissions} sx={{ backgroundColor: '#177604', '&:hover': { backgroundColor: '#126903' } }}>Save</Button>
            <Button variant="outlined" onClick={() => setAssignModalOpen(true)} sx={{ ml: 'auto' }}>Assign Employees</Button>
          </Box>

          {/* Employee List */}
          <Box sx={{ bgcolor: '#ffffff', p: 3, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Search Employees"
                  fullWidth
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <i className="fa fa-search mr-2" style={{ marginRight: 8 }} />
                    )
                  }}
                />
              </Grid>
            </Grid>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Tooltip title={`${emp.first_name} ${emp.last_name}`}>
                            <Avatar
                              src={emp.avatar ? `data:${emp.avatar_mime};base64,${emp.avatar}` : undefined}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            >
                              {!emp.avatar && `${emp.first_name[0]}${emp.last_name[0]}`}
                            </Avatar>
                          </Tooltip>
                          {`${emp.first_name} ${emp.last_name}`}
                        </Box>
                      </TableCell>
                      <TableCell>{role?.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Typography variant="body1" fontWeight="bold">
                Total Employees: {filteredEmployees.length}
              </Typography>
            </Box>
          </Box>

          {/* Assign Users Modal */}
          <AssignUsersModal
            open={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            roleId={role?.id}
            onAssignSuccess={fetchDetails}
          />
        </Box>
      )}
    </Layout>
  );
};

export default RolesDetails;
