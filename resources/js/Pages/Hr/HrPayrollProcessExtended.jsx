import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
import { Table, TableBody, TableCell, TableContainer, TableRow, Button, TablePagination, Typography, Checkbox } from '@mui/material'
import moment from 'moment'
import PageHead from '../../components/Table/PageHead'
import { getComparator, stableSort } from '../../components/utils/tableUtils'
import PageToolbar from '../../components/Table/PageToolbar'
import PayrollModal from '../../components/Modals/PayrollModal'
import PayrollSaveModalConfirmationAll from '../../components/Modals/PayrollSaveModalConfirmationAll'
import HomeLogo from "../../../images/ManProTab.png";
import Swal from 'sweetalert2'

const HrPayrollProcessExtended = () => {
    const queryParameters = new URLSearchParams(window.location.search)
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectBranch, setSelectBranch] = useState(searchParams.get('branch'))
    const [selectFromDate, setSelectFromDate] = useState(searchParams.get('fromDate'))
    const [selectToDate, setSelectToDate] = useState(searchParams.get('toDate'))
    const [selectCutoff, setSelectCutoff] = useState(searchParams.get('cutoff'))
    const [totalPayroll, setTotalPayroll] = useState([]);
    const [payrollData, setPayrolldata] = useState(null);
    const [payrollStatus, setPayrollstatus] = useState();
    const [receiverStatus, setReceiverStatus] = useState();
    const [filterApplication, setFilterApplication] = useState([]);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openPayroll, setOpenPayroll] = useState(false);
    const navigate = useNavigate()
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        filterPayroll(selectFromDate, selectToDate, selectCutoff)
    }, [selectFromDate, selectToDate, selectCutoff])

    const filterPayroll = async (from_val, to_val, selectCutoff) => {
        let dates = []
        dates = [from_val, to_val, selectCutoff]
        await axiosInstance.get(`/payroll/extended/${dates.join(',')}`, { headers, params: { branch: selectBranch } })
            .then((response) => {
                setTotalPayroll(response.data.payrollUnextended);
                setFilterApplication(response.data.payrollUnextended);
                setPayrollstatus(response.data.status)
                setReceiverStatus(response.data.receiver);
            })
            .catch((error) => {
                console.log('error', error.response)
            })
    }
    // FOR TABLE SORTING DATA ETC..
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
        const filtered = totalPayroll.filter(application => `${application?.fname} ${application?.lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setTotalPayroll(filtered);
        } else {
            setTotalPayroll(filterApplication);
        }
    }
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalPayroll.length) : 0;
    // END

    const handleOpenModal = (payrollList) => {
        setOpenPayroll(true);
        setPayrolldata(payrollList)
    }

    const handleCloseModal = () => {
        setOpenPayroll(false)
    }

    const handleBacktoProccess = () => {
        window.location.replace('/hr/payroll-process')
    }

    const handleSelectAll = () => {
        if (selected.length === totalPayroll.length) {
            setSelected([]);
        } else {
            const allIds = totalPayroll.map(row => row.user_id);
            setSelected(allIds);
        }
    };


    const isRowSelected = (id) => selected.indexOf(id) !== -1;

    const handleSelectOne = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }

        setSelected(newSelected);
    };
    const headCells = [
        {
            id: 'select',
            label: (
                <div
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={handleSelectAll}
                >
                    <input
                        type="checkbox"
                        style={{
                            width: '17.5px',
                            height: '17.5px',
                            marginLeft: '12.5px',
                            marginRight: '5px',
                        }}
                        checked={selected.length === totalPayroll.length}
                        onChange={() => { }}
                    /> Select All
                </div>
            ),
            sortable: false,
        },
        {
            id: 'fname',
            label: 'Name',
            sortable: true,
        },
        {
            id: 'category',
            label: 'Designation',
            sortable: true,
        },
        {
            id: 'department',
            label: 'Department',
            sortable: true,
        },
        {
            id: 'leave_type',
            label: 'Payroll Date',
            sortable: false,
        },
        {
            id: 'date_from',
            label: 'Payroll Cut-Off',
            sortable: false,
        },
        {
            id: 'date_to',
            label: 'Gross Pay',
            sortable: true,
        },
        {
            id: 'remarks',
            label: 'Status',
            sortable: false,
        },
        // {
        //     id: 'selectAll',
        //     label: '',
        //     sortable: false,
        // },
        // {
        //     id: 'select',
        //     label: (
        //         <div
        //             style={{
        //                 cursor: 'pointer',
        //                 display: 'flex',
        //                 alignItems: 'center',
        //             }}
        //             onClick={handleSelectAll}
        //         >
        //             <input
        //                 type="checkbox"
        //                 style={{
        //                     width: '17.5px',
        //                     height: '17.5px',
        //                     marginLeft: '12.5px',
        //                 }}
        //                 checked={selected.length === totalPayroll.length}
        //                 onChange={() => { }}
        //             />
        //         </div>
        //     ),
        //     sortable: false,
        // },
    ];

    const [openConfirmation, setOpenConfirmation] = useState(false)
    const handleSavePayroll = (e) => {
        e.preventDefault();
        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "You want to save this Payroll Details?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                setOpenConfirmation(true)
            }
        });
    }
    const handleCloseConfirmation = () => {
        setOpenConfirmation(false)
    }

    return (
        <Layout>
            <div className="content-heading d-flex justify-content-start p-0">
                <div style={{ marginTop: 10, marginBottom: 5, marginRight: 2 }}>
                    <Button
                        type="submit"
                        variant="outlined"
                        onClick={handleBacktoProccess}
                    >
                        <i className="fa fa-arrow-left mr-2"></i>Back
                    </Button>
                </div>
                <h5 className='pt-3 pl-10'>Payroll</h5>
            </div>
            <div className='block'>
                <div className=" block-content col-sm-12 ">
                    <div className='d-flex justify-content-lg-end p-3'>
                        <PageToolbar handleSearch={handleFilter} />
                        {/* handleSearch={handleFilter}  */}
                        {/* <button type="button" className="btn btn-sm btn-primary mx-5 h-50 mt-10" data-toggle="modal" data-target="#add_attendance" id="new_report" >Add Atttendance
                            </button> */}
                    </div>
                    <TableContainer>
                        <Table className="table table-md  table-striped  table-vcenter">
                            <PageHead
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                headCells={headCells}
                            />
                            <TableBody>
                                {stableSort(totalPayroll, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((payrollList, index) => {
                                        return (
                                            <TableRow key={index} hover
                                                role="checkbox"
                                                tabIndex={-1}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isRowSelected(payrollList.user_id)}
                                                        onChange={() => handleSelectOne(payrollList.user_id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {payrollList.profile_pic ? (<img src={location.origin + "/storage/" + payrollList.profile_pic} style={{
                                                        height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                    }} />) : (<img src={HomeLogo} style={{
                                                        height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                    }} />)}
                                                    {payrollList.lname + ","} {payrollList.fname} {payrollList.mname ? payrollList.mname[0] + "." : ""}</TableCell>
                                                <TableCell>{payrollList.category ? payrollList.category : 'n/a'}</TableCell>
                                                <TableCell>{payrollList.department}</TableCell>
                                                <TableCell>{moment(payrollList.fromDate).format('MMM.DD') + ' - ' + moment(searchParams.get('toDate')).format('MMM.DD')}</TableCell>
                                                <TableCell>{payrollList.workdays + 'days'}</TableCell>
                                                <TableCell>{'₱' + payrollList.monthly_rate}</TableCell>
                                                <TableCell>
                                                    <div className='d-flex justify-content-start p-1 text-white rounded-lg'>
                                                        <Typography variant="subtitle2" className='text-white rounded-lg p-1' style={{
                                                            backgroundColor: payrollStatus != 'Complete' ? 'gray' : 'green'
                                                        }}>{receiverStatus === 1 ? 'Received' : receiverStatus === 3 ? 'Sent' : payrollStatus}</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell>  <div className='d-flex justify-content-end p-0 m-0'><button type="button" onClick={() => handleOpenModal(payrollList)} className="btn btn-success btn-sm mr-2" id="new_report" ><i className="fa fa-pencil"></i>
                                                </button></div></TableCell>

                                            </TableRow>
                                        )
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
                    {selected.length !== 0 &&
                        <button type="button" className="btn btn-success btn-md mr-2" onClick={handleSavePayroll}>Save
                        </button>}
                    {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {selected.length !== 0 && (
                            <button
                                type="button"
                                className="btn btn-success btn-md mr-2"
                                onClick={handleSavePayroll}
                            >
                                Save
                            </button>
                        )}
                    </div> */}

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalPayroll.length}
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
                {openPayroll && (
                    <PayrollModal open={openPayroll} close={handleCloseModal} data={payrollData} cutoff={selectCutoff} type={1} processtype={2} />
                )}

            </div>
            {openConfirmation && selected.length > 0 && (
                <PayrollSaveModalConfirmationAll
                    selectedUsers={selected}
                    totalPayroll={totalPayroll}
                    selectCutoff={selectCutoff}
                    processtype={2}
                    open={openConfirmation}
                    close={handleCloseConfirmation}
                    closeOrigModal={close}
                />
            )}

        </Layout>
    )
}

export default HrPayrollProcessExtended
