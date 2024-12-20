import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Button, Typography, CircularProgress, FormGroup, FormControl, InputLabel } from '@mui/material'
import { useUser } from '../../../hooks/useUser';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import HrAddWorkshiftModal from '../../../components/Modals/HrAddWorkshiftModal';

import Swal from 'sweetalert2';

export default function Workshift() {
    const { user } = useUser();
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [announcementsList, setAnnouncementsList] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    const shiftId = queryParams.get('id');

    const [openEditWorkshift, setOpenEditWorkshift] = useState(false)

    const [loading, setLoading] = useState(true);
    const [workShift, setWorkShift] = useState(null);   
    const [workHours, setWorkHours] = useState(null);   
    const [employees, setEmployees] = useState([]);
    const [employeeCount, setEmployeeCount] = useState(0);

    const data = {shiftId: shiftId};
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - employees.length) : 0;

    useEffect(() => {
        if (shiftId) {
            setLoading(true);

            axiosInstance.get(`/getWorkShift`, { params: data, headers })
                .then((response) => {
                    setEmployees(response.data.employees);
                    setWorkShift(response.data.workShift);
                    setWorkHours(response.data.workHours);

                    setEmployeeCount(response.data.employees.length);

                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching work shifts:', error);
                    setLoading(false);
                });
        }
    }, [shiftId]);

    useEffect(() => {
        setLoading(false);
    }, [workShift]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };

        return date.toLocaleString('en-US', options);
    };

    const headCells = [
        {
            id: 'empId',
            label: 'Employee ID',
            // sortable: true,
        },
        {
            id: 'empName',
            label: 'Name',
            // sortable: true,
        },
        {
            id: 'empDepartment',
            label: 'Department',
            // sortable: true,
        },
        {
            id: 'empPosition',
            label: 'Position',
            // sortable: true,
        },
        {
            id: 'empStatus',
            label: 'Status',
            // sortable: true,
        },
    ];

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const openEditWorkShiftModal = () => {
        setOpenEditWorkshift(true)
    };

    const handleCloseEditWorkshift = () => {
        setOpenEditWorkshift(false)
    }

    const handleProfile = (id) => {
        navigate('/hr/profile?employeeID=' + id)
    }

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <React.Fragment>
                    
                    <Box sx={{ backgroundColor: 'background.paper', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', marginTop: '6%', p: 2, width: '100%' }} className="block-content" >

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mx: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', }} >
                                    <Typography variant="h5" sx={{ pt: 3 }}> {workShift ? workShift.description : ''} </Typography>

                                    <Button onClick={openEditWorkShiftModal} variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-pencil-squar0e-o"></i> Edit </p>
                                    </Button>
                                </Box>

                                <Typography></Typography>

                                <TableContainer style={{ overflowX: 'auto', width: '95%' }} sx={{ m: 4 }}>
                                    <Table className="table table-md table-vcenter">
                                        <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                        <TableBody>
                                            {stableSort(employees, getComparator(order, orderBy)).length > 0 ? (
                                                stableSort(employees, getComparator(order, orderBy))
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((emp, index) => (
                                                    <TableRow key={index} role="checkbox" tabIndex={-1} sx={{ '&:hover': { backgroundColor: 'rgb(87, 152, 61, 0.5)', cursor: 'pointer' } }} onClick={() => handleProfile(emp.user_id)}>
                                                        <TableCell>{emp.user_id}</TableCell>
                                                        <TableCell>{emp.lname + ","} {emp.fname} {emp.mname ? emp.mname[0] + "." : ""}</TableCell>
                                                        <TableCell>{emp.department}</TableCell>
                                                        <TableCell>{emp.user_type}</TableCell>
                                                        <TableCell>{emp.status}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center"> No Employee Assigned </TableCell>
                                                </TableRow>
                                            )}
                                            {emptyRows > 0 && stableSort(employees, getComparator(order, orderBy)).length > 0 && (
                                                <TableRow style={{ height: 53 * emptyRows }}>
                                                    <TableCell colSpan={6} />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={employees.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ '.MuiTablePagination-actions': { marginBottom: '20px' }, '.MuiInputBase-root': { marginBottom: '20px' } }} />
                            </>
                        )}
                        
                    </Box>

                    <HrAddWorkshiftModal open={openEditWorkshift} close={handleCloseEditWorkshift} workShift={workShift} workHours={workHours} employeeCount={employeeCount} />
                
                </React.Fragment>
            </Box>
        </Layout>
    );
}
