import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, TableHead, TextField, FormControl, InputLabel, OutlinedInput, Grid, Box, CircularProgress } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import moment from 'moment';

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20))
        .fill("")
        .map((v, idx) => now - idx);
};

const HrApplicationOvertime = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const empID = searchParams.get('employeeID');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem('nasya_user');
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [appList, setAppList] = useState([]);
    const [appLeave, setAppLeave] = useState([]);
    const [dateFrom, setDateFrom] = useState(moment().format('YYYY-MM-DD'));
    const [dateTo, setDateTo] = useState(moment().format('YYYY-MM-DD'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get(`/employees/${empID}`, { headers }).then((response) => {
            setIsLoading(false);
            setEmployeeDetails(response.data.employee);
        });
        axiosInstance.get(`/applications_list/${empID}`, { headers }).then((response) => {
            setIsLoading(false);
            setAppList(response.data.applicationListOvertime)
        });

        getOvertimeHours(dateFrom, dateTo, empID);

    }, [dateFrom, dateTo]);

    const getOvertimeHours = (dateFrom, dateTo, empID) => {
        let dates = [];
        dates = [dateFrom, dateTo, empID];

        axiosInstance.get(`/applications_leave/${dates}`, { headers }).then((response) => {
            setAppLeave(response.data.applicationOvertime)
        });
    };

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

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - employeeDetails.length) : 0;

    const totalLeftOvertime = {};
    employeeDetails.forEach(emp => {
        let userTotalOvertime = 0;
        appLeave
            .filter(item => emp.user_id === item.user_id)
            .forEach(filteredItem => {
                userTotalOvertime += filteredItem.app_hours ? parseFloat(filteredItem.app_hours) : 0;
            });
        totalLeftOvertime[emp.user_id] = userTotalOvertime;
    });

    const handleDateFromChange = (event) => {
        setDateFrom(event.target.value);
    };

    const handleDateToChange = (event) => {
        setDateTo(event.target.value);
    };

    return (
        <Layout title={"Employees Leave Credit"}>
            <Box sx={{ mx: 12 }}>
                {/* <div className="content-heading d-flex justify-content-between p-0">
                    <Grid container direction="row" alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <h5 className="pt-3">Overtime</h5>
                        </Grid>

                        <Grid item>
                            <Grid container justifyContent="space-between">
                                <FormControl sx={{
                                    marginBottom: 3,
                                    width: '48%',
                                    '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)',
                                        backgroundColor: '#f0f2f5',
                                        paddingLeft: '6px',
                                        paddingRight: '6px',
                                    },
                                }} variant="outlined">
                                    <InputLabel shrink={true} htmlFor="date-from-input">Date From</InputLabel>
                                    <OutlinedInput
                                        id="date-from-input"
                                        value={dateFrom}
                                        onChange={handleDateFromChange}
                                        type="date"
                                        style={{ height: 50, cursor: 'pointer' }}
                                    />
                                </FormControl>
                                <FormControl sx={{
                                    marginBottom: 3,
                                    width: '48%',
                                    '& .MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)',
                                        backgroundColor: '#f0f2f5',
                                        paddingLeft: '6px',
                                        paddingRight: '6px',
                                    },
                                }} variant="outlined">
                                    <InputLabel shrink={true} htmlFor="date-to-input">Date To</InputLabel>
                                    <OutlinedInput
                                        id="date-to-input"
                                        value={dateTo}
                                        onChange={handleDateToChange}
                                        type="date"
                                        style={{ height: 50, cursor: 'pointer' }}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </div> */}

                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Overtime</h5>

                    <div className="btn-group" role="group">
                        <Grid container justifyContent="space-between">
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)', backgroundColor: '#f0f2f5', paddingLeft: '6px', paddingRight: '6px', }, }} variant="outlined">
                                <InputLabel shrink={true} htmlFor="date-from-input">Date From</InputLabel>
                                <OutlinedInput id="date-from-input" value={dateFrom} onChange={handleDateFromChange} type="date" style={{ height: 50, cursor: 'pointer' }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)', backgroundColor: '#f0f2f5', paddingLeft: '6px', paddingRight: '6px', }, }} variant="outlined">
                                <InputLabel shrink={true} htmlFor="date-to-input">Date To</InputLabel>
                                <OutlinedInput id="date-to-input" value={dateTo} onChange={handleDateToChange} type="date" style={{ height: 50, cursor: 'pointer' }} />
                            </FormControl>
                            
                        </Grid>
                    </div>
                </div>

                <div className="block">
                    <div className="block-content">
                        
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>

                                <TableContainer style={{ overflowX: 'auto' }}>
                                    <Table className="table table-md  table-striped  table-vcenter" style={{ minWidth: 'auto' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>NAME</TableCell>
                                                {appList.length > 0 && appList.map((item, index) => {
                                                    return (
                                                        <TableCell key={index} style={{ whiteSpace: 'nowrap' }}>
                                                            {item.list_name}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>Total Approved Overtime</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stableSort(
                                                employeeDetails,
                                                getComparator(order, orderBy)
                                            )
                                                .slice(
                                                    page * rowsPerPage,
                                                    page * rowsPerPage + rowsPerPage
                                                )
                                                .map((emp, index) => {
                                                    const userTotalOvertime = totalLeftOvertime[emp.user_id] || 0;

                                                    return (
                                                        <TableRow
                                                            key={index}
                                                            hover
                                                            role="checkbox"
                                                            tabIndex={-1}
                                                        >
                                                            <TableCell style={{ whiteSpace: 'nowrap' }}>{emp.lname + ","} {emp.fname} {emp.mname ? emp.mname[0] + "." : ""}</TableCell>
                                                            {appLeave.length > 0 ? appLeave
                                                                .filter(item => emp.user_id === item.user_id)
                                                                .map((filteredItem, index) => (
                                                                    <TableCell key={index} style={{ whiteSpace: 'nowrap', width: 'auto' }}>
                                                                        <TextField
                                                                            size='small'
                                                                            type='number'
                                                                            value={filteredItem.app_hours}
                                                                            disabled={true}
                                                                        />
                                                                    </TableCell>
                                                                )) :
                                                                appList.length > 0 && appList.map((item, index) => {
                                                                    return (
                                                                        <TableCell key={index}>
                                                                            {0}
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            <TableCell>{userTotalOvertime}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            {emptyRows > 0 && (
                                                <TableRow
                                                    style={{
                                                        height: 53 * emptyRows,
                                                    }}
                                                >
                                                    <TableCell colSpan={7} />
                                                </TableRow>
                                            )}
                                        </TableBody>

                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={employeeDetails.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />

                            </>
                        )}

                    </div>
                </div>
            </Box>
        </Layout>
    );
}

export default HrApplicationOvertime;
