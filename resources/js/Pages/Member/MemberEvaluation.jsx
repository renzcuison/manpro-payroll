import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Grid, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, Box, Typography } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';
import PageHead from '../../components/Table/PageHead';
import { getComparator, stableSort } from '../../components/utils/tableUtils';

const headCells = [
    {
        id: 'date',
        label: 'Date Evaluated',
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
    {
        id: 'rating',
        label: 'Rating',
        sortable: false,
    },
    {
        id: 'remarks',
        label: 'Remarks',
        sortable: false,
    },
];

export default function MemberEvaluation() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [evaluationList, setEvaluationList] = useState([]);
    const [evaluationData, setEvaluationData] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openCategory, setOpenCategory] = useState(false)
    const [categoryData, setCategoryData] = useState({ title: '', description: '', attached_file: null });

    useEffect(() => {
        axiosInstance.get('/member_evaluation_list', { headers }).then((response) => {
            setEvaluationList(response.data.listData);
        });
    }, [])

    const handleChange = (event) => {
        if (event.target.name === 'attached_file') {
            // Handle file input separately
            setCategoryData({
                ...categoryData,
                attached_file: event.target.files[0],
            });
        } else {
            // Handle other input fields
            setCategoryData({
                ...categoryData,
                [event.target.name]: event.target.value,
            });
        }
    };

    const handleAddCategory = (event) => {
        event.preventDefault();

        const formData = new FormData();

        formData.append('title', categoryData.title);
        formData.append('description', categoryData.description);
        formData.append('attached_file', categoryData.attached_file);
        formData.append('category', "performance evaluation");

        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to add this performance evaluation?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add_category', formData, { headers }).then(function (response) {
                    location.reload();
                })
                    .catch((error) => {
                        console.log(error)
                        location.reload();
                    })
            } else {
                location.reload();
            }
        });
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - evaluationList.length) : 0;

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

    const handleOpenCategory = (data) => {
        setOpenCategory(true)
        setEvaluationData(data)
    }

    const handleCloseCategory = () => {
        setOpenCategory(false)
    }

    return (
        <Layout>
            <Box sx={{ mx: 12, my: 6 }}>

                <Grid item sx={{ marginTop: 6, marginBottom: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={0} >
                        <Typography variant="h5" component="h5" > PERFORMANCE EVALUATION </Typography>
                    </Box>
                </Grid>

                <TableContainer style={{ overflowX: 'auto' }}>
                    <Table className="table table-md  table-striped  table-vcenter" style={{ minWidth: 'auto' }}>
                        <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                        <TableBody>
                            {evaluationList.length != 0 ?
                                stableSort(evaluationList, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((evaluation, index) => {
                                        return (
                                            <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleOpenCategory(evaluation)} sx={{ '&:hover': { cursor: 'pointer' } }}>
                                                <TableCell> {new Date(evaluation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', })} </TableCell>
                                                <TableCell>{evaluation.employee_lname + ', ' + evaluation.employee_fname} {evaluation.employee_mname ? evaluation.employee_mname[0] + "." : ""}</TableCell>
                                                <TableCell>{evaluation.department}</TableCell>
                                                <TableCell>{evaluation.designation}</TableCell>
                                                <TableCell>{evaluation.status}</TableCell>
                                                <TableCell>{evaluation.overall_rating_from + ' - ' + evaluation.overall_rating_to}</TableCell>
                                                <TableCell>{evaluation.overall_rating_name ? evaluation.overall_rating_name : 'Not Yet Evaluated'}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                :
                                <TableRow hover role="checkbox" tabIndex={-1}>
                                    <TableCell colSpan={8} className="text-center">No Evaluation</TableCell>
                                </TableRow>
                            }

                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }} >
                                    <TableCell colSpan={6} >No data Found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={evaluationList.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ '.MuiTablePagination-actions': { marginBottom: '20px' }, '.MuiInputBase-root': { marginBottom: '20px' } }} />
            </Box>
        </Layout >
    )
}
