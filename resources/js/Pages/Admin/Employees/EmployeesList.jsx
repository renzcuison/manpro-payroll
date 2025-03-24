import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, Avatar, Stack, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

const EmployeesList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    // ----- Fetch Employees
    useEffect(() => {
        axiosInstance.get('/employee/getEmployees', { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clients:', error);
                setIsLoading(false);
            });
    }, []);

    // ----- Menu Items
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employees </Typography>

                        {/*
                        <Link to="/admin/employees/add">
                            <Button variant="contained" color="primary">
                                <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                            </Button>
                        </Link>
                         */}

                        <Button id="employee-menu" variant="contained" color="primary" aria-controls={open ? 'emp-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleMenuOpen} >
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                        <Menu id="emp-menu" anchorEl={anchorEl} open={open} onClose={handleMenuClose} MenuListProps={{ 'aria-labelledby': 'employee_menu' }} >
                            <MenuItem component={Link} to="/admin/employees/add" onClick={handleMenuClose}> Add Employee </MenuItem>
                            <MenuItem component={Link} to="/admin/employees/formlinks" onClick={handleMenuClose}> Employee Form Links </MenuItem>
                        </Menu>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left"></TableCell>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Type</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {employees.map((employee) => (
                                                <TableRow
                                                    key={employee.id}
                                                    component={Link}
                                                    to={`/admin/employee/${employee.user_name}`}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    <TableCell align="center">
                                                        <Avatar
                                                            alt={`${employee.user_name} Profile Pic`}
                                                            src={null}
                                                            sx={{ height: '5%', height: 'width', aspectRatio: '1 / 1', objectFit: 'cover', boxShadow: 3 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="left"> {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </TableCell>
                                                    <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                    <TableCell align="center">{employee.department || '-'}</TableCell>
                                                    <TableCell align="center">{employee.role || '-'}</TableCell>
                                                    <TableCell align="center">{employee.employment_status || '-'}</TableCell>
                                                    <TableCell align="center">{employee.employment_type || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout >
    )
}

export default EmployeesList