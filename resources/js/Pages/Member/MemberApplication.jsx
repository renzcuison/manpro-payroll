import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { Table, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, TablePagination, CircularProgress } from '@mui/material'
import moment from 'moment'
import PageHead from '../../components/Table/PageHead'
import { getComparator, stableSort } from '../../components/utils/tableUtils'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
import PageToolbar from '../../components/Table/PageToolbar'
import ApplicationStatusModal from '../../components/Modals/ApplicationStatusModal'
import MemberApplicationSubmit from '../../components/Modals/MemberApplicationSubmit'
import Swal from 'sweetalert2'
import '../../../../resources/css/calendar.css'
import { ImportantDevices } from '@mui/icons-material'

const headCells = [
    { id: 'application_id', label: 'ID',                  sortable: true },
    { id: 'leave_type',     label: 'Application Type',    sortable: true },
    { id: 'created_at',     label: 'Date of Application', sortable: true },
    { id: 'date_to',        label: 'Date of Effectivity', sortable: true },
    // { id: 'app_file', label: 'File Uploaded', sortable: false, },
    { label: 'Status', sortable: true, },
];

const MemberApplication = () => {
    const [totalApplcations, setTotalApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [triggerChange, setTriggerChange] = useState(false);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [openSubmit, setOpenSubmit] = useState(false)
    const [appData, setAppData] = useState({
        user_id: '',
        application_id: '',
        workday_id: '',
        // app_file: '',
        status: '',
        color: '',
    });

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/member_applications', { headers })
            .then((response) => {
                setTotalApplications(response.data.applications);
                // location.reload();
                setIsLoading(false);
            })
            .catch((error) => {
                console.log('error', error.response)
                setIsLoading(false);
            })

    }, [])

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

    const handleApplication = (data) => {
        setAppData(data)
        handleOpenEdit();
    }
    const deleteApplication = (data) => {
        new Swal({
            customClass: { container: 'my-swal'},
            title: "Are you sure?",
            text: "to remove this application",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete_applications', {
                    application_id: data
                }, { headers })
                    .then((response) => {
                        if (response.data.message === 'Success') {
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: "Applcation has been Removed",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false
                            }).then(function () {
                                location.reload()
                            });
                        } else {
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "danger!",
                                text: "Something went wrong",
                                icon: "warning",
                                timer: 1000,
                                showConfirmButton: false
                            });
                        }
                    })
                    .catch((error) => {
                        alert('error', error.response)
                    })
            }
        })
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalApplcations.length) : 0;

    const handleOpenSubmit = () => {
        setOpenSubmit(true)
    }
    const handleCloseSubmit = () => {
        setOpenSubmit(false)
    }

    return (
        <Layout>
            <Box sx={{ mx: 12, mt: 4 }}>
                <div className="content-heading d-flex justify-content-between pb-4 p-0">
                    <Typography variant="h5">Applications</Typography>

                    <Button className="btn btn-sm btn-light px-4 mx-5 h-50" sx={{ cursor: 'pointer', border: '1px solid gray', backgroundColor: '#1E5799', color: 'white', borderRadius: '8px' }} onClick={handleOpenSubmit} >
                        <span style={{ textTransform: 'none' }}>Add Application</span>
                    </Button>
                </div>

                <div className='block'>
                    <div className=" block-content col-lg-12 col-sm-12 ">
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>
                                <TableContainer sx={{ p: 4 }} style={{ width: '100%' }}>
                                    <Table className="table table-md table-striped table-vcenter" style={{ tableLayout: 'auto' }}>
                                        <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                        <TableBody>
                                            {totalApplcations.length > 0 ? (
                                                stableSort(totalApplcations, getComparator(order, orderBy))
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((attdn, index) => {
                                                        if (attdn.is_deleted !== 1) {
                                                            return (
                                                                <TableRow key={index} hover role="checkbox" tabIndex={-1}>
                                                                    <TableCell>{attdn.application_id}</TableCell>
                                                                    <TableCell>{attdn.leave_type}</TableCell>
                                                                    <TableCell>{moment(attdn.created_at).format('MMM. DD, YYYY')}</TableCell>
                                                                    <TableCell>{moment(attdn.date_from).format('MMM. DD, YYYY')}  -  {moment(attdn.date_to).format('MMM. DD, YYYY')}</TableCell>
                                                                    {/* <TableCell> */}
                                                                        {/* <Link href={location.origin + "/storage/" + attdn.app_file} target="_blank"> */}
                                                                            {/* {`${attdn.app_file.substr(0, 9)}...`} */}
                                                                        {/* </Link> */}
                                                                    {/* </TableCell> */}
                                                                    <TableCell>
                                                                        {/* <p style={{ backgroundColor: attdn.color, borderRadius: '5%' }} className='p-1 text-center  p-0 m-0 m-1 rounded-lg text-white'>{attdn.status}</p> */}
                                                                        <p style={{ backgroundColor: attdn.color, borderRadius: '5%' }} className='p-1 text-center  p-0 m-0 m-1 rounded-lg text-white'>{attdn.app_status_name}</p>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        }
                                                    })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        No applications
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {emptyRows > 0 && (
                                                <TableRow style={{ height: 53 * emptyRows }}>
                                                    <TableCell colSpan={6} />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={totalApplcations.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{ '.MuiTablePagination-actions': { marginBottom: '20px' }, '.MuiInputBase-root': { marginBottom: '20px' }, p: 4 }}
                                />
                            </>
                        )}
                    </div>
                </div>
                <MemberApplicationSubmit open={openSubmit} close={handleCloseSubmit} />
            </Box>
        </Layout >
    )
}

export default MemberApplication
