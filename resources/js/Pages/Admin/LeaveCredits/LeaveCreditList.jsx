import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, TablePagination } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link } from 'react-router-dom';

import EmployeeLeaveCredits from '../../../Modals/Employees/EmployeeLeaveCredits';

const LeaveCreditList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [employeeCredits, setEmployeeCredits] = useState({}); // Store leave credits for each employee
    const [searchName, setSearchName] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        // Step 1: Fetch the list of employees
        axiosInstance.get('/employee/getEmployeeLeaveCredits', { headers })
            .then((response) => {
                const employeesData = response.data.employees;
                setEmployees(employeesData);
                setIsLoading(false);

                // Step 2: Fetch leave credits for each employee
                employeesData.forEach((employee) => {
                    axiosInstance.get(`/applications/getLeaveCredits/${employee.user_name}`, { headers })
                        .then((creditResponse) => {
                            const leaveCredits = creditResponse.data.leave_credits || [];

                            // Aggregate credits
                            const totalCredits = leaveCredits.reduce((sum, credit) => sum + Number(credit.credit_number || 0), 0);
                            const usedCredits = leaveCredits.reduce((sum, credit) => sum + Number(credit.credit_used || 0), 0);
                            const remainingCredits = totalCredits - usedCredits;

                            setEmployeeCredits((prev) => ({
                                ...prev,
                                [employee.user_name]: {
                                    totalCredits,
                                    usedCredits,
                                    remainingCredits,
                                },
                            }));
                        })
                        .catch((error) => {
                            console.error(`Error fetching leave credits for ${employee.user_name}:`, error);
                        });
                });
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
                setIsLoading(false);
            });
    }, []);

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee.user_name);
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null);
    };

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.last_name}, ${employee.first_name} ${employee.middle_name || ''} ${employee.suffix || ''}`.toLowerCase();
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
   
    const formatEmployeeName = (employee) => {
        return `${employee.last_name}, ${employee.first_name} ${employee.middle_name || ''} ${employee.suffix || ''}`.trim();
    };

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
                                    <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}} >
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
                                                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                                                    Employee Name
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    Branch
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    Department
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    Total Credits
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    Used Credits
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    Remaining
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedEmployees.length > 0 ? (
                                                paginatedEmployees.map((employee, index) => {
                                                    const credits = employeeCredits[employee.user_name] || { totalCredits: 0, usedCredits: 0, remainingCredits: 0 };

                                                    return (
                                                        <TableRow key={employee.id} onClick={() => handleRowClick(employee)} sx={{ backgroundColor: (page * rowsPerPage + index) % 2 === 0 ? '#f8f8f8' : '#ffffff', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }} >
                                                            <TableCell align="left">
                                                                <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.preventDefault()}> {formatEmployeeName(employee)} </Link>
                                                            </TableCell>
                                                            <TableCell align="center">{employee.branch || 'Davao'}</TableCell>
                                                            <TableCell align="center">{employee.department || 'Unknown'}</TableCell>
                                                            <TableCell align="center">{Number(credits.totalCredits || 0).toFixed(2)}</TableCell>
                                                            <TableCell align="center">{Number(credits.usedCredits || 0).toFixed(2)}</TableCell>
                                                            <TableCell align="center">{Number(credits.remainingCredits || 0).toFixed(2)}</TableCell>
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
            </Box>

            {selectedEmployee && (
                <EmployeeLeaveCredits open={!!selectedEmployee} close={handleCloseModal} userName={selectedEmployee} />
            )}
        </Layout>
    );
};

export default LeaveCreditList;