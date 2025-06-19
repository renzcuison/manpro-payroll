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
  Grid
} from '@mui/material';
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';
import Swal from 'sweetalert2';

const RolesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [role, setRole] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const roleRes = await axiosInstance.get(`/settings/getEmployeeRole/${id}`, { headers });
        console.log(roleRes.data);

        setRole(roleRes.data.role);
        setEmployees(roleRes.data.employees); // ✅ FIXED: get employees directly from response
      } catch (err) {
        Swal.fire('Error', 'Failed to fetch role details.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Layout title="Role Details">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Box sx={{ mx: 'auto', mt: 5, width: { xs: '100%', md: '1400px' } }}>
          {/* Role Name Header */}
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            <i
              className="fa fa-chevron-left"
              aria-hidden="true"
              style={{ fontSize: '80%', cursor: 'pointer', marginRight: 8 }}
              onClick={() => navigate('/admin/roles')}
            ></i>
            Role: {role?.name}
          </Typography>

          {/* Search and Table */}
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
        </Box>
      )}
    </Layout>
  );
};

export default RolesDetails;
