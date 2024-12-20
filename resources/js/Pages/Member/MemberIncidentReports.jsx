import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Button, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';
import PageToolbar from '../../components/Table/PageToolbar';
import PageHead from '../../components/Table/PageHead';
import { getComparator, stableSort } from '../../components/utils/tableUtils';

const headCells = [
    {
        id: 'date',
        label: 'Date',
        sortable: true,
    },
    {
        id: 'number',
        label: 'IR Number',
        sortable: false,
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
        id: 'action',
        label: 'Action',
        sortable: false,
    },
];

export default function MemberIncidentReports() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [reportList, setReportList] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState([]);
    const [openCategoryAdd, setOpenCategoryAdd] = useState(false)
    const [openCategory, setOpenCategory] = useState(false)

    useEffect(() => {
        axiosInstance.get('/member_reports_list', { headers }).then((response) => {
            setReportList(response.data.listData);
            setFilter(response.data.listData);
        });
    }, [])

    const handleDeleteCategory = (data) => {

        new Swal({
            title: "Are you sure?",
            text: "You want to delete this incident report?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete_category', { category_id: data.category_id }, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        Swal.fire({
                            title: "Success!",
                            text: 'Incident report has been deleted successfully',
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(function (response) {
                            location.reload();
                        });
                    } else {
                        alert("Error! try again");
                    }
                })
            }
        });
    }

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
    const handleOpenCategoryAdd = () => {
        setOpenCategoryAdd(true)
    }
    const handleCloseCategoryAdd = () => {
        setOpenCategoryAdd(false)

    }
    const handleOpenCategory = (data) => {
        setOpenCategory(true)
        setReportData(data)
    }
    const handleCloseCategory = () => {
        setOpenCategory(false)

    }

    return (
        <Layout>
            <Grid item sx={{ marginBottom: 2 }}>
                <div className="d-flex justify-content-between align-items-center p-0">
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <h5 className='pt-3' style={{ fontWeight: 'bold' }}>INCIDENT REPORTS</h5>
                        </Grid>
                    </Grid>
                </div>
            </Grid>

            <div className='block'>
                <div className=" block-content col-sm-12 ">
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item sx={{ marginTop: 1.75 }}>
                            {/* <Button variant="contained" sx={{ height: '33px', width: '100%', background: 'linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))', color: 'white', }} onClick={handleOpenCategoryAdd}> Create Report </Button> */}
                        </Grid>
                        <Grid item>
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item sx={{ marginTop: 2.85 }}>
                                    <PageToolbar handleSearch={handleFilter} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <TableContainer style={{ overflowX: 'auto' }}>
                        <Table className="table table-md  table-striped  table-vcenter" style={{ minWidth: 'auto' }}>
                            <PageHead
                                style={{ whiteSpace: 'nowrap' }}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                headCells={headCells}
                            />
                            <TableBody>
                                {reportList.length != 0 ?
                                    stableSort(reportList, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((report, index) => {
                                            return (
                                                <TableRow key={index} hover
                                                    role="checkbox"
                                                    tabIndex={-1}
                                                    onClick={() => handleOpenCategory(report)}
                                                    sx={{
                                                        '&:hover': {
                                                            cursor: 'pointer'
                                                        }
                                                    }}>
                                                    <TableCell>
                                                        {new Date(report.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </TableCell>
                                                    <TableCell>{report.incident_number}</TableCell>
                                                    <TableCell>{report.employee_lname + ', ' + report.employee_fname} {report.employee_mname ? report.employee_mname[0] + "." : ""}</TableCell>
                                                    <TableCell>{report.department}</TableCell>
                                                    <TableCell>{report.designation}</TableCell>
                                                    <TableCell>{report.status}</TableCell>
                                                    <TableCell><IconButton
                                                        sx={{
                                                            color: "red",
                                                            fontSize: 14,
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory(report);
                                                        }}
                                                    >
                                                        <i className="fa fa-trash-o"></i>
                                                    </IconButton></TableCell>
                                                </TableRow>
                                            )
                                        })
                                    :
                                    <TableRow hover
                                        role="checkbox"
                                        tabIndex={-1}>
                                        <TableCell colSpan={8} className="text-center">No data Found</TableCell>
                                    </TableRow>
                                }
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: 53 * emptyRows,
                                        }}
                                    >
                                        <TableCell colSpan={6} >No data Found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={reportList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            '.MuiTablePagination-actions': {
                                marginBottom: '20px'
                            },
                            '.MuiInputBase-root': {
                                marginBottom: '20px'
                            }
                        }}
                    />
                </div>
            </div>

        </Layout >
    )
}
