import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableFooter, TableCell, TableContainer, TableRow, Box, Typography,
     Grid, TextField, FormControl, CircularProgress, TablePagination, Button, MenuItem } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { Link, useNavigate } from 'react-router-dom';

import EmployeeAllowanceView from './Modals/EmployeeAllowanceView';
import { useEmployeesAllowances, useAllowance } from '../../../hooks/useAllowances';
import { useDepartments } from '../../../hooks/useDepartments';
import { useBranches } from '../../../hooks/useBranches';

const EmployeesAllowanceList = () => {
    const [searchName, setSearchName] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(0);
    const [selectedAllowance, setSelectedAllowance] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filters = {
        name: searchName,
        branchId: selectedBranch,
        departmentId: selectedDepartment,
        allowanceId: selectedAllowance,
    };
    const pagination = {
        page: page + 1,
        per_page: rowsPerPage,
    };
    
    const {allowancesData} = useAllowance();
    const {employeesAllowances, isEmployeesAllowancesLoading, refetchEmployeesAllowances} = useEmployeesAllowances(filters, pagination);
    const { departments: departmentData } = useDepartments({loadDepartments: true});
    const { data: branchesData } = useBranches();

    const employees = employeesAllowances?.employees || [];
    const allowances = allowancesData?.allowances || [];
    const total = employeesAllowances?.total || 0;
    const count = employeesAllowances?.employee_count || 0;

    const departments = departmentData.data?.departments || [];
    const branches = branchesData?.branches || [];

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee.user_name);
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null);
        refetchEmployeesAllowances();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
   
    return (
        <Layout title={"LeaveCreditList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Allowances </Typography>

                        <Button variant="contained" color="primary" component={Link} to="/admin/compensation/allowance-types">
                            <p className='m-0'><i className="fa fa-list" aria-hidden="true"></i> Types </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid container size={12} direction="row" justifyContent="flex-start" xs={4} spacing={2}>
                                <Grid size={6}>
                                    <FormControl sx={{width:'50%'}}>
                                        <TextField id="searchName" label="Search Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)}/>
                                    </FormControl>
                                </Grid>
                                
                                <Grid size={2}>
                                    <TextField
                                        select
                                        id="allowance-view-select"
                                        label="Filter Calculation by Type"
                                        value={selectedAllowance}
                                        onChange={(event) => {
                                            setSelectedAllowance( event.target.value );
                                        }}
                                        sx={{ width: "100%" }}
                                    >   
                                        <MenuItem value={0}>All Allowances</MenuItem>
                                        {allowances.map((allowance) => (
                                            <MenuItem key={allowance.id} value={allowance.id}>
                                                {" "}{allowance.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <TextField
                                        select
                                        id="branch-view-select"
                                        label="Filter by Branch"
                                        value={selectedBranch}
                                        onChange={(event) => {
                                            setSelectedBranch(event.target.value );
                                        }}
                                        sx={{ width: "100%" }}
                                    >   
                                        <MenuItem value={0}>All Branches</MenuItem>
                                        {branches.map((branch) => (
                                            <MenuItem key={branch.id} value={branch.id}>
                                                {" "}{branch.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={2}>
                                    <TextField
                                        select
                                        id="department-view-select"
                                        label="Filter by Department"
                                        value={selectedDepartment}
                                        onChange={(event) => {
                                            setSelectedDepartment(event.target.value);
                                        }}
                                        sx={{ width: "100%" }}
                                    >   
                                        <MenuItem value={0}>All Departments</MenuItem>
                                        {departments.map((department, index) => (
                                            <MenuItem key={department.id} value={department.id}>
                                                {" "}{department.name}{" "}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                            <Grid container item direction="row" justifyContent="flex-end" xs={4} spacing={2} ></Grid>
                        </Grid>

                        {isEmployeesAllowancesLoading ? (
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
                                            {employees.length > 0 ? (
                                                <>
                                                {employees.map((employee, index) => {
                                                    return (
                                                        <TableRow key={employee.user_name} onClick={() => handleRowClick(employee)} sx={{ backgroundColor: (page * rowsPerPage + index) % 2 === 0 ? '#f8f8f8' : '#ffffff', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }} >
                                                            <TableCell align="left">{employee.name || '-'}</TableCell>
                                                            <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                            <TableCell align="center">{employee.department || '-'}</TableCell>
                                                            <TableCell align="center">
                                                                ₱ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(employee.amount)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow sx={{ backgroundColor: (page * rowsPerPage + employees.length) % 2 === 0 ? 
                                                '#f8f8f8' : '#ffffff', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }}>
                                                    <TableCell align='left'>
                                                        <Typography sx={{fontWeight: 'bold'}}>TOTAL:</Typography>
                                                    </TableCell>
                                                    <TableCell colSpan={2}/> 
                                                    <TableCell align="center">
                                                        <Typography sx={{fontWeight: 'bold'}}>
                                                            ₱ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)}
                                                        </Typography>
                                                    </TableCell>  
                                                </TableRow>
                                                </>
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
                                        count={count}
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
                    <EmployeeAllowanceView open={!!selectedEmployee} close={handleCloseModal} userName={selectedEmployee} allowance={selectedAllowance}/>
                )}
            </Box>
        </Layout>
    );
};

export default EmployeesAllowanceList;