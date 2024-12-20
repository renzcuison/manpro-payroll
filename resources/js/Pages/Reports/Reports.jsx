import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Button, Grid, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, Box, Typography, CircularProgress } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';
import PageToolbar from '../../components/Table/PageToolbar';
import PageHead from '../../components/Table/PageHead';
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ReportGmailerrorredSharp } from '@mui/icons-material';

const headCells = [
    {
        id: 'date',
        label: 'Date',
        sortable: false,
    },
    {
        id: 'title',
        label: 'Title',
        sortable: true,
    },
    {
        id: 'type',
        label: 'Type',
        sortable: false,
    },
    {
        id: 'period',
        label: 'Period',
        sortable: true,
    },
];

export default function Reports() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [reportList, setReportList] = useState([]);
    const [reports, setReports] = useState([]);

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [filter, setFilter] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/getReports', { headers }).then((response) => {
            setReports(response.data.reports);
            setReportList(response.data.reports);
            
            setLoading(false);
        });
    }, [])

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reportList.length) : 0;

    const handleFilter = (event) => {
        const filtered = reportList.filter(list => `${list?.employee_fname} ${list?.employee_lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setReportList(filtered);
        } else {
            setReportList(filter);
        }
    }

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

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                
                <Grid item sx={{ marginTop: 6, marginBottom: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={0} >
                        <Typography variant="h5" component="h5" > DOCUMENTS </Typography> {/* CLIENT WANT TO CHANGE REPORT TO DOCUMENTS */}
                    </Box>
                </Grid>

                <Box sx={{ backgroundColor: 'background.paper', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', width: '100%', paddingLeft: 4, paddingRight: 4 }} className="block-content" >

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Grid container alignItems="center" justifyContent="space-between">
                                
                                <Grid item>
                                    <Button variant="contained" onClick={() => navigate('/report-create')} sx={{ backgroundColor: '#177604', color: 'white' }} >
                                        Create Document
                                    </Button>
                                </Grid>

                                <Grid item>
                                    <PageToolbar handleSearch={handleFilter} />
                                </Grid>
                            </Grid>

                            <TableContainer style={{ overflowX: 'auto' }}>
                                <Table className="table table-md  table-striped  table-vcenter" style={{ minWidth: 'auto' }}>
                                    <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                    <TableBody>

                                        {reports.length !== 0 ? (
                                            stableSort(reportList, getComparator(order, orderBy))
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((report, index) => (
                                                    <TableRow key={index} hover role="checkbox" tabIndex={-1} sx={{ '&:hover': { cursor: 'pointer' } }} onClick={() => navigate(`/report-view/${report.id}`)} >
                                                        <TableCell> {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </TableCell>
                                                        <TableCell> {report.title} </TableCell>
                                                        <TableCell> {report.report_type.type_name} </TableCell>
                                                        <TableCell> {new Date(report.period_from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(report.period_to).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow style={{ height: 53 * emptyRows }}>
                                                <TableCell colSpan={4} >No data Found</TableCell>
                                            </TableRow>
                                        )}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={reports.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ '.MuiTablePagination-actions': { marginBottom: '20px' }, '.MuiInputBase-root': { marginBottom: '20px' } }}
                            />
                        </>
                    )}

                </Box>

            </Box>
        </Layout >
    )
}
