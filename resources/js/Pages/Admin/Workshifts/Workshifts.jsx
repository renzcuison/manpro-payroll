import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress  } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import moment from 'moment';
import HrAddWorkshiftModal from '../../../components/Modals/HrAddWorkshiftModal';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import { useSearchParams } from 'react-router-dom'

const headCells = [
    {
        id: 'shiftName',
        label: 'Shift Name',
        // sortable: true,
    },
    // {
    //     id: 'shiftType',
    //     label: 'Shift Type',
    //     sortable: true,
    // },
    {
        id: 'workHours',
        label: 'Work Hours',
        // sortable: true,
    },
    {
        id: 'employees',
        label: 'Employees',
        // sortable: true,
    },
    {
        id: 'dateCreated',
        label: 'Date Created',
        // sortable: true,
    },
];

const Workshifts = () => {
    const { user } = useUser();
    const [searchParams, setSearchParams] = useSearchParams()
    const [workshifts, setWorkshifts] = useState([]);
    const [filterWorkshift, setFilterWorkshift] = useState([]);
    const [openAddWorkshift, setOpenAddWorkshift] = useState(false)
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    useEffect(() => {  
        axiosInstance.get(`/getWorkshifts`, { headers })
            .then((response) => {
                // console.log(response);
                setWorkshifts(response.data.workShifts);
                setFilterWorkshift(response.data.workShifts);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
                setLoading(false);
            });
    }, []);

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

    const handleFilter = (event) => {
        const filtered = workshifts.filter(workshift => `${workshift?.description} `.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setWorkshifts(filtered);
        } else {
            setWorkshifts(filterWorkshift);
        }
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - workshifts.length) : 0;

    const handleAddWorkshift = () => {
        setOpenAddWorkshift(true)

    }
    const handleCloseAddWorkshift = () => {
        setOpenAddWorkshift(false)
    }

    const handleRowClick = (workshiftId) => {
        navigate(`/hr/employees-workshift?id=${workshiftId}`);
    };

    return (
        <Layout title={"Workshifts"}>
             <Box sx={{ mx: 12 }}>
                
                <React.Fragment>
                    <div className="content-heading d-flex justify-content-between px-3">
                        <h5 className='pt-3'>Work Shifts</h5>

                        <div className="btn-group" role="group">
                            {user.user_type !== 'Super Admin' && (
                                <Button sx={{ height: '75%', width: '100%', marginTop: -1, bgcolor: '#022e57', color: 'white', }} variant="contained" onClick={handleAddWorkshift} >
                                    Add Shift
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px' }}>
                        <Grid container alignItems="center" justifyContent="flex-end" spacing={2} padding={3}>
                            <PageToolbar handleSearch={handleFilter} />
                        </Grid>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }}>
                                    <Table className="table table-md table-vcenter " style={{ minWidth: 'auto' }}>
                                        <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                        <TableBody>
                                            {stableSort(workshifts, getComparator(order, orderBy))
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((workshift, index) => (
                                                    <TableRow
                                                        key={index}
                                                        role="checkbox"
                                                        tabIndex={-1}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgb(87, 152, 61, 0.5)',
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                        onClick={() => handleRowClick(workshift.id)}
                                                    >
                                                        <TableCell>{workshift.description}</TableCell>
                                                        <TableCell>{workshift.hours}</TableCell>
                                                        <TableCell>{workshift.employeeCount}</TableCell>
                                                        <TableCell>{moment(workshift.created_at).format('MMM. D, YYYY')}</TableCell>
                                                    </TableRow>
                                                ))}
                                            {emptyRows > 0 && (
                                                <TableRow style={{ height: 53 * emptyRows }}>
                                                    <TableCell colSpan={6} />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={workshifts.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ '.MuiTablePagination-actions': { marginBottom: '20px' }, '.MuiInputBase-root': { marginBottom: '20px' } }} />
                            </>
                        )}
                        
                    </div >

                    <HrAddWorkshiftModal open={openAddWorkshift} close={handleCloseAddWorkshift} />
                
                </React.Fragment>
               
            </Box>
        </Layout >
    )
}

export default Workshifts
