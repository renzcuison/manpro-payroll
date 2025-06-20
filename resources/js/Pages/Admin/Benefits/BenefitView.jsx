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
  IconButton
} from '@mui/material';

const BenefitView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('nasya_user');
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [benefit, setBenefit] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const benefitResponse = await axiosInstance.get(`/benefits/getBenefit/${id}`, { headers });
        setBenefit(benefitResponse.data.benefit);

        const employeesResponse = await axiosInstance.get(`/benefits/getEmployeesByBenefit/${id}`, { headers });
        setEmployees(employeesResponse.data.employees || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (error) return (
    <Layout title={'Benefit Details'}>
      <Typography color="error">{error}</Typography>
    </Layout>
  );
  
  if (!benefit) return (
    <Layout title={'Benefit Details'}>
      <Typography> </Typography>
    </Layout>
  );

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Layout title={'Benefit Details'}>
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
                  onClick={() => navigate('/admin/benefits')}
                ></i>
                {benefit.name}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 6,
                p: 3,
                bgcolor: '#ffffff',
                borderRadius: '8px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Benefit Type: {benefit.type}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {benefit.type === "Percentage" ? (
                    <>
                      Employee Share: {benefit.employee_percentage}% | 
                      Employer Share: {benefit.employer_percentage}%
                    </>
                  ) : (
                    <>
                      Employee Share: ₱{benefit.employee_amount} | 
                      Employer Share: ₱{benefit.employer_amount}
                    </>
                  )}
                </Typography>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2} sx={{ pb: 4, borderBottom: '1px solid rgb(255, 253, 253)' }}>
                  <Grid item xs={12}>
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
                </Grid>

                {filteredEmployees.length > 0 ? (
                  <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>Employee Name</TableCell>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>Department</TableCell>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>Position</TableCell>
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
                            <TableCell align="left">
                              {employee.position}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No employees found with this benefit.
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
    </Layout>
  );
};

export default BenefitView;