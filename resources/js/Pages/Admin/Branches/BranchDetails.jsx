import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditBranchModal from './Modals/EditBranchModal';
import AssignPositionsModal from './Modals/AssignPositionsModal';

const BranchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [branch, setBranch] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [branchPositions, setBranchPositions] = useState([]);
  const [positionAssignments, setPositionAssignments] = useState([]);
  const [searchQueries, setSearchQueries] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const branchResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
        setBranch(branchResponse.data.branch);
        setEmployees(branchResponse.data.employees || []);

        const departmentsResponse = await axiosInstance.get('/settings/getDepartments', { headers });
        setDepartments(departmentsResponse.data.departments || []);

        const employeesResponse = await axiosInstance.get('/employee/getEmployees', { headers });
        setAllEmployees(employeesResponse.data.employees || []);

        const positionsResponse = await axiosInstance.get('/settings/getBranchPositions', { headers });
        setBranchPositions(positionsResponse.data.positions || []);

        const assignmentsResponse = await axiosInstance.get(`/settings/getBranchPositionAssignments/${id}`, { headers });
        setPositionAssignments(assignmentsResponse.data.assignments || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getEmployeeNameById = (employeeId) => {
    if (!employeeId) return 'Not assigned';
    const employee = allEmployees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Not assigned';
  };

  const getAssignedEmployeesForPosition = (positionId) => {
    return positionAssignments
      .filter(a => a.branch_position_id === positionId)
      .map(a => a.employee_id);
  };

  const handlePositionAssignmentChange = (positionId, selectedEmployeeIds) => {
    const updatedAssignments = positionAssignments.filter(
      a => a.branch_position_id !== positionId
    );
    
    selectedEmployeeIds.forEach(employeeId => {
      updatedAssignments.push({
        branch_id: id,
        branch_position_id: positionId,
        employee_id: employeeId
      });
    });

    setPositionAssignments(updatedAssignments);
  };

  const handleSearchChange = (positionId, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [positionId]: value
    }));
  };

  const filteredEmployees = employees.filter(emp => {
    const nameMatch = emp.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const departmentMatch = departmentFilter === 'all' || 
      emp.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return nameMatch && departmentMatch;
  });

  if (error) return (
    <Layout title={'Branches'}>
      <Typography color="error">{error}</Typography>
    </Layout>
  );
  
  if (!branch) return (
    <Layout title={'Branches'}>
      <Typography> </Typography>
    </Layout>
  );

  return (
    <Layout title={'Branches'}>
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 200px)'
        }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
          <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
            <Box
              sx={{
                mt: 5,
                display: 'flex',
                justifyContent: 'space-between',
                px: 1,
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <i
                  className="fa fa-chevron-left"
                  aria-hidden="true"
                  style={{ fontSize: '80%', cursor: 'pointer' }}
                  onClick={() => navigate('/admin/branches/branchlist')}
                ></i>
                {branch.name} ({branch.acronym})
              </Typography>
              <div>
                <Button
                  variant="contained"
                  onClick={handleMenuClick}
                  endIcon={<ArrowDropDownIcon />}
                  sx={{
                    backgroundColor: '#177604',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#126703'
                    }
                  }}
                >
                  Edit 
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={() => {
                    setOpenEditModal(true);
                    handleMenuClose();
                  }}>
                    Edit Branch Details
                  </MenuItem>
                  <MenuItem onClick={() => {
                    setOpenAssignModal(true);
                    handleMenuClose();
                  }}>
                    Assign Positions
                  </MenuItem>
                </Menu>
              </div>
            </Box>

            <Box
              sx={{
                mt: 6,
                p: 3,
                bgcolor: '#ffffff',
                borderRadius: '8px',
              }}
            >
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2} sx={{ pb: 4, borderBottom: '1px solid rgb(255, 253, 253)' }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Search Employees"
                      sx={{
                        height: 50,
                        fontSize: '1',
                        padding: '4px 10px',
                        minWidth: 300,
                      }}
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
                  <Grid item xs={6} ml={90}>
                    <FormControl size="medium" fullWidth>
                      <InputLabel>Filter by Department</InputLabel>
                      <Select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        label="Filter by Department"
                        sx={{
                          height: 50,
                          fontSize: '1',
                          padding: '4px 10px',
                          minWidth: 300,
                        }}
                      >
                        <MenuItem value="all">All Departments</MenuItem>
                        {departments.map((department) => (
                          <MenuItem key={department.id} value={department.name}>
                            {department.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {filteredEmployees.length > 0 ? (
                  <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>Name</TableCell>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>Department</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredEmployees.map((employee, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <TableCell align="left">
                              {employee.name}
                            </TableCell>
                            <TableCell align="left">
                              {employee.department}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No employees found in this branch.
                    </TableCell>
                  </TableRow>
                )}

                {filteredEmployees.length > 0 && (
                  <Box
                    display="flex"
                    sx={{
                      py: 2,
                      pr: 2,
                      width: '100%',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ mr: 2 }}>
                      Number of Employees:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {filteredEmployees.length}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <EditBranchModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        branch={branch}
        setBranch={setBranch}
        headers={headers}
        id={id}
        setBranchData={setBranch}
        setEmployees={setEmployees}
      />

      <AssignPositionsModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        branchPositions={branchPositions}
        allEmployees={allEmployees}
        positionAssignments={positionAssignments}
        handlePositionAssignmentChange={handlePositionAssignmentChange}
        getAssignedEmployeesForPosition={getAssignedEmployeesForPosition}
        searchQueries={searchQueries}
        handleSearchChange={handleSearchChange}
        headers={headers}
        id={id}
        setPositionAssignments={setPositionAssignments}
        setEmployees={setEmployees}

      />
    </Layout>
  );
};

export default BranchDetails;