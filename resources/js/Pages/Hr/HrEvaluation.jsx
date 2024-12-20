import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Button, Grid, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, Box, Typography, CircularProgress } from '@mui/material';
import HrCategoryEditModal from '../../components/Modals/HrCategoryEditModal';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';
import PageToolbar from '../../components/Table/PageToolbar';
import PageHead from '../../components/Table/PageHead';
import { getComparator, stableSort } from '../../components/utils/tableUtils';

import { useNavigate } from 'react-router-dom';

const headCells = [
    {
        id: 'date',
        label: 'Date',
        sortable: true,
    },
    {
        id: 'fname',
        label: 'Name',
        sortable: true,
    },
    {
        id: 'department',
        label: 'Department',
        sortable: true,
    },
    {
        id: 'designation',
        label: 'Designation',
        sortable: true,
    },
    {
        id: 'status',
        label: 'Status',
        sortable: false,
    },
];

export default function HrEvaluation() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();
    const [evaluationList, setEvaluationList] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterEval, setFilterEval] = useState([]);

    const [loading, setLoading] = useState(true);
    const [evaluations, setEvaluations] = useState([])

    useEffect(() => {
        setLoading(true);
        axiosInstance.get(`/getEvaluations`, { headers })
            .then((response) => {
                setEvaluations(response.data.evaluations);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching evaluations:', error);
                setLoading(false);
            });

        setLoading(true);
        axiosInstance.get('/getEvaluationAllForms', { headers })
            .then((response) => {
                setEvaluationList(response.data.evaluationForms);
                setFilterEval(response.data.listData);
                setLoading(false);
            });
    }, []);


    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - evaluationList.length) : 0;

    const handleFilter = (event) => {
        const filtered = evaluationList.filter(list => `${list?.employee_fname} ${list?.employee_lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setEvaluationList(filtered);
        } else {
            setEvaluationList(filterEval);
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

    const [anchorEl, setAnchorEl] = useState(null);
    const opened = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Layout title={"Evaluation"}>
            <Box sx={{ mx: 12 }}>

                <Grid item sx={{ marginTop: 6, marginBottom: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={0} >
                        <Typography variant="h5" component="h5" > PERFORMANCE EVALUATION </Typography>
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
                                        <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} onClick={() => navigate('/hr/performance-evaluation-create')}>
                                            CREATE EVALUATION
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Grid  container alignItems="center" justifyContent="space-between">
                                            <Grid item>
                                                <PageToolbar handleSearch={handleFilter} />
                                            </Grid>
                                            <Grid item>
                                                <Box>
                                                    <Button type="button" className="btn btn-sm btn-light mx-5 h-50 dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded={opened ? 'false' : undefined} aria-controls={opened ? 'dropdown-menu' : undefined} variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} onClick={handleClick} >
                                                        Forms
                                                    </Button>

                                                    <Menu id="dropdown-menu" anchorEl={anchorEl} open={opened} onClose={handleClose} MenuListProps={{ 'aria-labelledby': 'basic-button' }} >
                                                        {evaluations.map((evaluation) => (
                                                            <MenuItem key={evaluation.id} onClick={() => navigate(`/hr/performance-evaluation-edit/${evaluation.id}`)} >
                                                                {evaluation.name}
                                                            </MenuItem>
                                                        ))}
                                                        <MenuItem onClick={() => navigate('/hr/performance-evaluation-add')} className="dropdown-item" sx={{ cursor: 'pointer' }} aria-labelledby="btnGroupVerticalDrop1" >
                                                            + New Form
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <TableContainer sx={{ paddingTop: 2 }} style={{ overflowX: 'auto' }}>
                                    <Table className="table table-md table-striped table-vcenter" style={{ minWidth: 'auto' }}>
                                        <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                        <TableBody>
                                            {evaluationList.length !== 0 ? (
                                                stableSort(evaluationList, getComparator(order, orderBy))
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((evaluation, index) => (
                                                        <TableRow key={index} hover role="checkbox" tabIndex={-1} sx={{ '&:hover': { cursor: 'pointer' } }} onClick={() => navigate(`/hr/performance-evaluation-review/${evaluation.id}`)} >
                                                            <TableCell> {new Date(evaluation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </TableCell>
                                                            <TableCell> {evaluation.employee.lname + ', ' + evaluation.employee.fname} {' '} {evaluation.employee.mname ? evaluation.employee.mname[0] + '.' : ''} </TableCell>
                                                            <TableCell> {evaluation.employee ? evaluation.employee.department : '-'} </TableCell>
                                                            <TableCell> {evaluation.employee ? evaluation.employee.category : '-'} </TableCell>
                                                            <TableCell> {evaluation.status} </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow hover role="checkbox" tabIndex={-1}>
                                                    <TableCell colSpan={8} className="text-center"> No data Found </TableCell>
                                                </TableRow>
                                            )}
                                            {emptyRows > 0 && (
                                                <TableRow style={{ height: 53 * emptyRows }}>
                                                    <TableCell colSpan={8}>No data Found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={evaluationList.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{'.MuiTablePagination-actions': { marginBottom: '20px' },'.MuiInputBase-root': { marginBottom: '20px' }}}
                                />
                            </>
                        )}
                        
                </Box>

                {/* <HrCategoryAddEvaluation open={openCategoryAdd} close={handleCloseCategoryAdd} category="performance evaluation" /> */}
                {/* <HrCategoryEvaluate open={openCategory} close={handleCloseCategory} category="performance evaluation" data={evaluationData} /> */}
                {/* <HrCategoryAddSettings open={openSettingsAdd} close={handleCloseSettingsAdd} category={selected} /> */}
                {/* <HrCategoryEditModal open={openCategoryEdit} close={handleCloseCategoryEdit} category="performance evaluation" data={categoryData} /> */}

            </Box>
        </Layout >
    )
}
