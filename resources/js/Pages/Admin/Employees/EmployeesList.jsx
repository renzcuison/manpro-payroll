import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress  } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

const EmployeesList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        axiosInstance.get('/employees/getEmployees', { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clients:', error);
                setIsLoading(false);
            });
    }, []);

    const handleRowClick = (employee) => {
        navigate(`/admin/employee/${employee.user_name}`);
    };
    
    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Employees </Typography>

                    <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1"
                        onClick={() => { 
                            window.location.href = "http://127.0.0.1:8080/admin/employees-add"; 
                        }}    
                    >
                        <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                    </Button>
                </Box>

                <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Name</TableCell>
                                            <TableCell align="center">Username</TableCell>
                                            <TableCell align="center">Role</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                            <TableCell align="center">Department</TableCell>
                                            <TableCell align="center">Branch</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {employees.map((employee) => (
                                            <TableRow key={employee.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }} onClick={() => handleRowClick(employee)}>
                                                <TableCell align="left">{employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</TableCell>
                                                <TableCell align="center">{employee.user_name}</TableCell>
                                                <TableCell align="center">{employee.branch_id ? '-' : employee.branch_id }</TableCell>
                                                <TableCell align="center">{employee.department_id ? '-' : employee.department_id }</TableCell>
                                                <TableCell align="center">{employee.role_id ? '-' : employee.role_id }</TableCell>
                                                <TableCell align="center">{employee.status_id ? '-' : employee.status_id }</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Box>
        </Layout >
    )
}

export default EmployeesList
