import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { Table, TableBody, TableCell, TableContainer, TableRow, Typography, IconButton, Button, TablePagination, Link, Tooltip, Box, CircularProgress } from '@mui/material'
import moment from 'moment'
import PageHead from '../../components/Table/PageHead'
import { getComparator, stableSort } from '../../components/utils/tableUtils'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
import PageToolbar from '../../components/Table/PageToolbar'
import ApplicationStatusModal from '../../components/Modals/ApplicationStatusModal'
import ApplicationAddStatusModal from '../../components/Modals/ApplicationAddStatusModal'
import '../../../../resources/css/calendar.css'
import HomeLogo from "../../../images/ManProTab.png";
import { useSearchParams } from 'react-router-dom'
const headCells = [
    {
        id: 'fname',
        label: 'Name',
        sortable: true,
    },

    {
        id: 'leave_type',
        label: 'Application Type',
        sortable: true,
    },
    {
        id: 'date_from',
        label: 'Date of Application',
        sortable: true,
    },
    {
        id: 'date_to',
        label: 'Date of Effectivity',
        sortable: true,
    },
    {
        id: 'attdn_date',
        label: 'Number of Hours',
        sortable: true,
    },
    {
        id: 'remarks',
        label: 'Remarks',
        sortable: true,
    },
    {
        id: 'app_file',
        label: 'File Uploaded',
        sortable: true,
    },
    {
        label: 'Status',
        sortable: false,
    },
];

const HrApplications = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [totalApplcations, setTotalApplications] = useState([]);
    const [filterApplication, setFilterApplication] = useState([]);
    const [triggerChange, setTriggerChange] = useState(false);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [openStatus, setOpenStatus] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [appData, setAppData] = useState({
        user_id: '',
        application_id: '',
        workday_id: '',
        app_file: '',
        app_status_name: '',
        app_status_id: '',
        color: '',
    });

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get(`/applications/${empID}`, { headers })
            .then((response) => {
                setIsLoading(false);
                setTotalApplications(response.data.applications);
                setFilterApplication(response.data.applications);
            })
            .catch((error) => {
                setIsLoading(false);
                console.log('error', error.response)
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
    const handleFilter = (event) => {
        const filtered = totalApplcations.filter(application => `${application?.fname} ${application?.lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setTotalApplications(filtered);
        } else {
            setTotalApplications(filterApplication);
        }
    }

    const handleApplication = (data) => {
        setAppData(data)
        handleOpenEdit();
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalApplcations.length) : 0;

    const handleOpenStatus = () => {
        setOpenStatus(true)
    }
    const handleCloseStatus = () => {
        setOpenStatus(false)
    }
    const handleOpenEdit = () => {
        setOpenEdit(true)
    }
    const handleCloseEdit = () => {
        setOpenEdit(false)
    }

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>

                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>List of Applications</h5>

                    <div className="btn-group" role="group">
                        <Button className="btn btn-sm btn-light mx-5 h-50 mt-15" sx={{ cursor: 'pointer', border: '1px solid gray' }} onClick={handleOpenStatus}>
                            <span style={{ textTransform: 'none' }}>Add Status</span>
                        </Button>
                    </div>
                </div>

                <div className='block'>
                    <div className=" block-content col-lg-12 col-sm-12 ">
                        <div className='d-flex justify-content-lg-end p-3'>
                            <PageToolbar handleSearch={handleFilter} />
                        </div>
                        
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>

                                <TableContainer style={{ overflowX: 'auto' }}>
                                    <Table className="table table-md table-striped table-vcenter" style={{ minWidth: 'auto' }}>
                                        <PageHead
                                            style={{ whiteSpace: 'nowrap' }}
                                            order={order}
                                            orderBy={orderBy}
                                            onRequestSort={handleRequestSort}
                                            headCells={headCells}
                                        />
                                        <TableBody>
                                            {stableSort(totalApplcations, getComparator(order, orderBy))
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((attdn, index) => {
                                                    if (attdn.is_deleted != 1) {
                                                        return (
                                                            <TableRow key={index} hover
                                                                role="checkbox"
                                                                tabIndex={-1}
                                                                onClick={() => handleApplication(attdn)}
                                                                sx={{
                                                                    '&:hover': {
                                                                        cursor: 'pointer'
                                                                    }
                                                                }}>
                                                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                                                    {attdn.profile_pic ? (<img src={location.origin + "/storage/" + attdn.profile_pic} style={{
                                                                        height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                                    }} />) : (<img src={HomeLogo} style={{
                                                                        height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                                    }} />)}
                                                                    {attdn.lname + ","} {attdn.fname} {attdn.mname ? attdn.mname[0] + "." : ""}</TableCell>
                                                                <TableCell>{attdn.leave_type}</TableCell>
                                                                <TableCell>{moment(attdn.date_from).format('MMM. DD, YYYY')}</TableCell>
                                                                <TableCell>{moment(attdn.date_to).format('MMM. DD, YYYY')}</TableCell>
                                                                <TableCell>{attdn.app_hours + 'hrs'}</TableCell>
                                                                <TableCell>
                                                                    <Tooltip title={attdn.remarks} sx={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                                                                        <IconButton sx={{ alignItems: 'left', alignContent: 'left', justifyContent: 'left' }}>
                                                                            <Typography
                                                                                sx={{
                                                                                    fontSize: '12px',
                                                                                    color: 'black',
                                                                                    lineHeight: 'inherit',
                                                                                    marginTop: 2.5
                                                                                }}
                                                                            >
                                                                                {attdn.remarks ? attdn.remarks.substr(0, 5) + '...' : 'n/a'}
                                                                            </Typography>
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </TableCell>
                                                                <TableCell >
                                                                    <Link href={location.origin + "/storage/" + attdn.app_file} target="_blank">
                                                                        {attdn.app_file.substr(0, 9) + '...'}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <p style={{ backgroundColor: attdn.color, borderRadius: '5%' }} className='p-1 text-center  p-0 m-0 m-1 rounded-lg text-white'>{attdn.app_status_name}</p>
                                                                </TableCell>
                                                            </TableRow>

                                                        )
                                                    }
                                                })}
                                            {emptyRows > 0 && (
                                                <TableRow
                                                    style={{
                                                        height: 53 * emptyRows,
                                                    }}
                                                >
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
                                    sx={{
                                        '.MuiTablePagination-actions': {
                                            marginBottom: '20px'
                                        },
                                        '.MuiInputBase-root': {
                                            marginBottom: '20px'
                                        }
                                    }}
                                />

                            </>
                        )}

                    </div>
                </div>
                <ApplicationStatusModal open={openEdit} close={handleCloseEdit} appData={appData} triggerChange={triggerChange} setTriggerChange={setTriggerChange} />
                <ApplicationAddStatusModal open={openStatus} close={handleCloseStatus} />
            </Box>
        </Layout >
    )
}

export default HrApplications
