import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, TablePagination, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import EmployeeIncentiveView from './Modals/EmployeeIncentiveView';
import { useEmployeesIncentives } from '../../../hooks/useIncentives';

const EmployeesIncentivesList = () => {
    const { data, isLoading, error, refetch } = useEmployeesIncentives();
    const employees = data?.employees || [];

    const [searchName, setSearchName] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee.user_name);
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null);
        refetch();
    };

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.name}`.toLowerCase();
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

    return(
        <Layout title={"IncentivesList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Incentives</Typography>

                        <Button variant="contained" color="primary" component={Link} to="/admin/employees/incentives-types">
                            <p className='m-0'><i class="fa fa-list" aria-hidden="true"></i> Types </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid container item direction="row" justifyContent="flex-start" xs={4} spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl sx={{ width: '150%'}} >
                                        <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container item direction="row" justifyContent="flex-end" xs={4} spacing={2} ></Grid>
                        </Grid>

                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="left"> Employee Name </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Branch </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Department </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Amount </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedEmployees.length > 0 ? (
                                                paginatedEmployees.map((employee, index) => {
                                                    return (
                                                        <TableRow key={employee.user_name} onClick={() => handleRowClick(employee)} sx={{ backgroundColor: (page * rowsPerPage + index) % 2 === 0 ? '#f8f8f8' : '#ffffff', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }} >
                                                            <TableCell align="left">{employee.name || '-'}</TableCell>
                                                            <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                            <TableCell align="center">{employee.department || '-'}</TableCell>
                                                            <TableCell align="center">₱ {Number(employee.total || 0).toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                        No Employees Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination Controls */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={filteredEmployees.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        labelRowsPerPage="Rows per page:"
                                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
                {selectedEmployee && (
                    <EmployeeIncentiveView open={!!selectedEmployee} close={handleCloseModal} userName={selectedEmployee} />
                )}
            </Box>
        </Layout>
    )

}

export default EmployeesIncentivesList;