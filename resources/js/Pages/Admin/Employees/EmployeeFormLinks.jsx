import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import GenerateFormLink from "./Modals/GenerateFormLink";

const EmployeeFormLinks = () => {
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

    // ----- Generate Form Link
    const [openGenerateFormLink, setOpenGenerateFormLink] = useState(false);
    const handleOpenGenerateFormLink = () => {
        setOpenGenerateFormLink(true);
    }
    const handleCloseGenerateFormLink = () => {
        setOpenGenerateFormLink(false);
    }


    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Form Links </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenGenerateFormLink}>
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
                                                    <TableCell align="left"> {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </TableCell>
                                                    <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                    <TableCell align="center">{employee.department || '-'}</TableCell>
                                                    <TableCell align="center">{employee.role || '-'}</TableCell>
                                                    <TableCell align="center">{employee.employment_type || '-'}</TableCell>
                                                    <TableCell align="center">{employee.employment_status || '-'}</TableCell>
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
            {openGenerateFormLink && (
                <GenerateFormLink
                    open={openGenerateFormLink}
                    close={handleCloseGenerateFormLink}
                />
            )}
        </Layout>
    )
}

export default EmployeeFormLinks