import React, { useEffect, useRef, useState } from 'react'
import { InputLabel, FormControl, Typography, IconButton, Dialog, DialogTitle, DialogContent, Box, TableContainer, Table, TableBody, TableRow, TableCell, TablePagination } from '@mui/material'
import moment from 'moment';
import '../../../../resources/css/customcss.css'
import { useReactToPrint } from 'react-to-print';
import HomeLogo from '../../../images/ManPro.png'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import PayrollHistoryModal from './PayrollHistoryModal';
import PageHead from '../Table/PageHead';
import { useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../utils/tableUtils';
const headCells = [
    {
        id: 'description',
        label: 'Description',
        sortable: true,
    },
    {
        id: 'amountTotal',
        label: 'Remaining Amount',
        sortable: true,
    },
    {
        id: 'chooseCutoff',
        label: 'Cutoff',
        sortable: true,
    },
    {
        id: 'created_At',
        label: 'Date',
        sortable: true,
    }

];
const ProfileLoanDetails = ({ open, close, data }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loanData, setLoanData] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        axiosInstance.get(`/loanDetails/${empID}`, { headers })
            .then((response) => {
                setLoanData(response.data.loanData);
            })
    }, [])

    const handleCloseLoanDetails = () => {
        close()
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
        const filtered = loanData.filter(application => `${application?.payroll_fromdate}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setloanData(filtered);
        } else {
            setloanData(filterPayroll);
        }
    }
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - loanData.length) : 0;
    // END
    const handleDeleteList = (benefits_id) => {
        const formData = new FormData();
        formData.append('benefits_id', benefits_id);

        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "You want to delete this list?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete_employee_loan', formData, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            title: "Success!",
                            text: 'Application has been deleted successfully',
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

    return (
        <Dialog open={open} fullWidth maxWidth="md">
            <DialogTitle className='d-flex justify-content-between'>
                <Typography variant="h6" sx={{ paddingTop: 1 }}>Loan Details</Typography>
                <IconButton sx={{ color: 'red' }} onClick={handleCloseLoanDetails}><i className="si si-close" ></i></IconButton>
            </DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table className="table table-md  table-striped  table-vcenter">
                        <PageHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {stableSort(loanData, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((loan, index) => {
                                    return (
                                        <TableRow key={index} hover
                                            role="checkbox"
                                            tabIndex={-1}>

                                            <TableCell>{loan.description}</TableCell>
                                            <TableCell>{'₱ ' + parseFloat(loan.amountTotal).toFixed(2)}</TableCell>
                                            <TableCell>{loan.chooseCutoff == 1 ? 'First' : loan.chooseCutoff == 2 ? 'Second' : 'Both'}</TableCell>
                                            <TableCell>{moment(loan.created_At).format('MMM. DD, YYYY')}</TableCell>
                                            <TableCell>
                                                <div className='d-flex justify-content-end p-0 m-0'>
                                                    <button type="button" className="btn btn-danger btn-sm mr-2" id="new_report" onClick={() => handleDeleteList(loan.benefits_id)}>
                                                        <li className='fa fa-trash' style={{ fontSize: 14 }}></li>
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                <TableCell colSpan={3}>{'₱ ' + parseFloat(data).toFixed(2)}</TableCell>
                            </TableRow>
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={4} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={loanData.length}
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
            </DialogContent>
        </Dialog>
    )
}

export default ProfileLoanDetails
