import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress  } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const headCells = [
    {
        id: 'name',
        label: 'Name',
        sortable: true,
    },
    {
        id: 'package',
        label: 'Package',
        sortable: true,
    },
    {
        id: 'status',
        label: 'Status',
        sortable: true,
    },
];

const ClientsList = () => {
    const { empID } = useParams();
    const navigate = useNavigate();

    const queryParameters = new URLSearchParams(window.location.search)
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalAttendance, setTotalAttendance] = useState([]);
    const [filterAttendance, setFilterAttendance] = useState([]);

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
   
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleFilter = (event) => {
        const filtered = totalAttendance.filter(attdn => `${attdn?.fname} ${attdn?.lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setTotalAttendance(filtered);
        } else {
            setTotalAttendance(filterAttendance);
        }
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalAttendance.length) : 0;

    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 3, alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ pt: 3 }}> Clients </Typography>

                    <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                        <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                    </Button>
                </Box>

                <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <PageToolbar handleSearch={handleFilter} />
                    </Box>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer style={{ overflowX: 'auto' }}>
                                <Table className="table table-md  table-striped  table-vcenter" style={{ minWidth: 'auto' }}>
                                    <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                    <TableBody>
                                        {emptyRows > 0 && (
                                            <TableRow style={{ height: 53 * emptyRows, }} >
                                                <TableCell colSpan={6} >No data Found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalAttendance.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ '.MuiTablePagination-actions': { mb: 2 }, '.MuiInputBase-root': { mb: 2 },bgcolor: '#ffffff',borderRadius: '8px'}} />
                        </>
                    )}
                </Box>
                
            </Box>
        </Layout >
    )
}

export default ClientsList
