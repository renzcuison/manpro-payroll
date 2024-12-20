import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, TableHead, Button, TextField, Tooltip, IconButton, CircularProgress, Box } from '@mui/material'
import Swal from 'sweetalert2'
import { useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';

const HrApplicationLeave = () => {
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
    const [modifiedLeaveLimits, setModifiedLeaveLimits] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get(`/employees/${empID}`, { headers }).then((response) => {
            setIsLoading(false);
            setEmployeeDetails(response.data.employee);
        });
        axiosInstance.get(`/applications_list/${empID}`, { headers }).then((response) => {
            setIsLoading(false);
            setAppList(response.data.applicationListLeave)
        });
        let dates = [];
        dates = [0, 0, empID];
        axiosInstance.get(`/applications_leave/${dates}`, { headers }).then((response) => {
            setIsLoading(false);
            setAppLeave(response.data.applicationLeave)
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
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleUpdate = (e, userId, modifiedData) => {
        e.preventDefault();
        console.log(modifiedData);
        const id = userId
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Confirm to Update this leave credit?",
            icon: "warning",
            allowOutsideClick: false,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.put(`/edit-leave/${id}`, {
                    modifiedLeaveLimits: modifiedData
                }, { headers }).then(function (res) {
                    Swal.fire({
                        customClass: {
                            container: 'my-swal'
                        },
                        text: "Leave credit has been updated successfully",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: false
                    }).then(function (res) {
                        console.log(res);
                        location.reload();
                    });
                })
            } else {
                location.reload()
            }
        });
    }
    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - employeeDetails.length)
            : 0;

    const totalLeft = {};
    const totalAllotted = {};
    employeeDetails.forEach(emp => {
        let userTotalHours = 0;
        let userTotalLeft = 0;
        let userTotalAllotted = 0;
        appLeave
            .filter(item => emp.user_id === item.user_id)
            .forEach(filteredItem => {
                userTotalHours += filteredItem.app_hours ? parseFloat(filteredItem.app_hours) : 0;
                userTotalAllotted += filteredItem.total_limit ? parseFloat(filteredItem.total_limit) : 0;
                userTotalLeft = userTotalAllotted - (userTotalHours / 8);
            });
        totalLeft[emp.user_id] = userTotalLeft;
        totalAllotted[emp.user_id] = userTotalAllotted;
    });

    return (
        <Layout title={"Employees Leave Credit"}>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className="pt-3">Leave Credit</h5>

                    <div className="btn-group" role="group"> </div>
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
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>Total Allotted</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>Total Used</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>Total Left</TableCell>
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
                                                    const userTotalLeft = totalLeft[emp.user_id] || 0;
                                                    const userTotalAllotted = totalAllotted[emp.user_id] || 0;

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
                                                                        <Tooltip title={
                                                                            <>
                                                                                Allotted: {filteredItem.total_limit}<br />
                                                                                Used: {filteredItem.app_hours ? filteredItem.app_hours / 8 : 0}
                                                                            </>
                                                                        } sx={{ background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0', whiteSpace: 'nowrap' }}>
                                                                            <IconButton sx={{ alignItems: 'left', alignContent: 'left', justifyContent: 'left', background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: '0', whiteSpace: 'nowrap' }}>
                                                                                <TextField
                                                                                    size='small'
                                                                                    type='number'
                                                                                    placeholder={filteredItem.leave_limit}
                                                                                    onChange={(e) => {
                                                                                        const newValue = e.target.value;

                                                                                        setModifiedLeaveLimits(prevState => {
                                                                                            const updatedState = { ...prevState };

                                                                                            if (!updatedState[filteredItem.user_id]) {
                                                                                                updatedState[filteredItem.user_id] = [];
                                                                                            }

                                                                                            const existingEntryIndex = updatedState[filteredItem.user_id]
                                                                                                .findIndex(entry => entry.appList_id === filteredItem.appList_id);

                                                                                            if (existingEntryIndex !== -1) {
                                                                                                updatedState[filteredItem.user_id][existingEntryIndex].leave_limit = newValue;
                                                                                                if (newValue >= filteredItem.leave_limit) {
                                                                                                    updatedState[filteredItem.user_id][existingEntryIndex].total_limit = (newValue - filteredItem.leave_limit) + filteredItem.total_limit;
                                                                                                } else {
                                                                                                    updatedState[filteredItem.user_id][existingEntryIndex].total_limit = filteredItem.total_limit - (filteredItem.leave_limit - newValue);
                                                                                                }
                                                                                            } else {
                                                                                                updatedState[filteredItem.user_id].push({
                                                                                                    appList_id: filteredItem.appList_id,
                                                                                                    leave_limit: newValue,
                                                                                                    total_limit: (newValue >= filteredItem.leave_limit) ? (newValue - filteredItem.leave_limit) + filteredItem.total_limit : filteredItem.total_limit - (filteredItem.leave_limit - newValue),
                                                                                                });
                                                                                            }
                                                                                            return updatedState;
                                                                                        });
                                                                                    }}
                                                                                />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                )) :
                                                                appList.length > 0 && appList.map((item, index) => {
                                                                    return (
                                                                        <TableCell key={index}>
                                                                            {0}
                                                                        </TableCell>
                                                                    );
                                                                })}

                                                            <TableCell>{userTotalAllotted}</TableCell>
                                                            <TableCell>{userTotalAllotted - userTotalLeft}</TableCell>
                                                            <TableCell>{userTotalLeft}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    className="mr-2"
                                                                    size="medium"
                                                                    sx={{
                                                                        cursor: 'pointer',
                                                                        backgroundColor: '#7eb73d',
                                                                        color: 'white',
                                                                        width: '30px',
                                                                        minWidth: 0,
                                                                    }}
                                                                    onClick={(e) => handleUpdate(e, emp.user_id, modifiedLeaveLimits[emp.user_id])}
                                                                >
                                                                    <i className="fa fa-check"></i>
                                                                </Button>
                                                            </TableCell>
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
                                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={employeeDetails.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />

                            </>
                        )}

                    </div>
                </div>
            </Box>
        </Layout>
    );
}

export default HrApplicationLeave;
