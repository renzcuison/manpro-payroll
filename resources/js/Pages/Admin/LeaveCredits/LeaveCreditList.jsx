import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, TablePagination } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';

import LeaveCreditDescription from './Modals/LeaveCreditDescription';  // <-- LeaveCreditAdd removed
import LeaveCreditView from './Modals/LeaveCreditView';

const LeaveCreditList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);  // will hold the employee object now
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {
        setIsLoading(true);
        axiosInstance.get('/employee/getEmployeesLeaveCredits', { headers })
            .then((response) => {
                const employeesData = response.data.employees;
                setEmployees(employeesData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
                setIsLoading(false);
            });
    };

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee);  // pass whole object now
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null);
    };

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee?.last_name}, ${employee.first_name} ${employee.middle_name || ''} ${employee.suffix || ''}`.toLowerCase();
        return fullName.includes(searchName.toLowerCase());
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedEmployees = filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Layout title={"LeaveCreditList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Leave Credits
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid container item direction="row" justifyContent="flex-start" xs={4} spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl sx={{ width: '100%' }}>
                                        <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer sx={{ minHeight: 400 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Branch</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Department</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Total Credits</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Used Credits</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Remaining</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedEmployees.length > 0 ? (
                                                paginatedEmployees.map((employee, index) => (
                                                    <TableRow
                                                        key={employee.user_name}
                                                        onClick={() => handleRowClick(employee)}  // pass whole object
                                                        sx={{
                                                            backgroundColor: (page * rowsPerPage + index) % 2 === 0 ? '#f8f8f8' : '#ffffff',
                                                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' }
                                                        }}
                                                    >
                                                        <TableCell>{employee.name || '-'}</TableCell>
                                                        <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                        <TableCell align="center">{employee.department || '-'}</TableCell>
                                                        <TableCell align="center">{Number(employee.total || 0).toFixed(2)}</TableCell>
                                                        <TableCell align="center">{Number(employee.used || 0).toFixed(2)}</TableCell>
                                                        <TableCell align="center">{Number(employee.remaining || 0).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No matching records found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 50]}
                                    component="div"
                                    count={filteredEmployees.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
.
            {/* LeaveCreditView modal as before */}
            {selectedEmployee && (
                <LeaveCreditDescription
                    open={Boolean(selectedEmployee)}
                    onClose={handleCloseModal}
                    employee={selectedEmployee}
                    refreshCredit={fetchEmployees}
                />
            )}
        </Layout>
    );
};

export default LeaveCreditList;
