import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { Table, TableBody, TableCell, TableContainer, TableRow, Button, TablePagination, Box, CircularProgress } from '@mui/material'
import moment from 'moment'
import PageHead from '../../components/Table/PageHead'
import { getComparator, stableSort } from '../../components/utils/tableUtils'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
import ApplicationAddListModal from '../../components/Modals/ApplicationAddListModal'
import ApplicationEditListModal from '../../components/Modals/ApplicationEditListModal'
import { useSearchParams } from 'react-router-dom'

const headCells = [
    {
        id: 'idx',
        label: '#',
    },
    {
        id: 'Title',
        label: 'Title',
        sortable: true,
    },
    {
        id: 'Percentage',
        label: 'Percentage',
        sortable: true,
    },
    {
        id: 'Date Created',
        label: 'Date Created',
        sortable: true,
    },
];

const HrApplicationList = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [appList, setAppList] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [openAdd, setOpenAdd] = useState(false)
    const [openList, setOpenList] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [appListData, setAppListData] = useState({
        applist_id: '',
        list_name: '',
        percentage: 0
    });

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get(`/applications_list/${empID}`, { headers }).then((response) => {
            setIsLoading(false);
            setAppList(response.data.applicationList)
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

    const handleList = (app_list) => {
        setAppListData(app_list)
        handleOpenList();
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - appList.length) : 0;

    const handleOpenAdd = () => {
        setOpenAdd(true)
    }
    const handleCloseAdd = () => {
        setOpenAdd(false)
    }
    const handleOpenList = () => {
        setOpenList(true)
    }
    const handleCloseList = () => {
        setOpenList(false)
    }

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Type of Applications</h5>

                    <div className="btn-group" role="group">
                        <Button className="btn btn-sm btn-light mx-5 h-50 mt-15" sx={{ cursor: 'pointer', border: '1px solid gray' }} onClick={handleOpenAdd}>
                            <span style={{ textTransform: 'none' }}>Add New</span>
                        </Button>
                    </div>
                </div>
                
                <div className='block'>
                    <div className=" block-content col-lg-12 col-sm-12 ">
                        
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>

                                <TableContainer>
                                    <Table className="table table-md  table-striped  table-vcenter">
                                        <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                        <TableBody>
                                            {stableSort(appList, getComparator(order, orderBy))
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((app_list, index) => {
                                                    return (
                                                        <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleList(app_list)} sx={{ '&:hover': { cursor: 'pointer' } }}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{app_list.list_name}</TableCell>
                                                            <TableCell>{(app_list.percentage * 100).toFixed(0) + '%'}</TableCell>
                                                            <TableCell>{moment(app_list.date_created).format('MMM. D, YYYY')}</TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            {emptyRows > 0 && (
                                                <TableRow style={{ height: 53 * emptyRows, }} >
                                                    <TableCell colSpan={6} />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={appList.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />

                            </>
                        )}

                    </div>
                </div>

                <ApplicationAddListModal open={openAdd} close={handleCloseAdd} />
                <ApplicationEditListModal open={openList} close={handleCloseList} data={appListData} />
            </Box>
        </Layout>
    )
}

export default HrApplicationList
