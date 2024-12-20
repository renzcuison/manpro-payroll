import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, CircularProgress } from '@mui/material'
import moment from 'moment'
import PageHead from '../../../components/Table/PageHead'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig'
import Swal from 'sweetalert2'
import HrEmployeeAdditionalBenefitModal from '../../Modals/HrEmployeeAdditionalBenefitModal'
import '../../../../../resources/css/calendar.css'
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
        label: 'Percentage/Brackets/Amount',
        sortable: true,
    },
    {
        id: 'Date Created',
        label: 'Date Created',
        sortable: true,
    },
];

const EmployeeContribution = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [listData, setListData] = useState([]);
    const [bracketData, setBracketData] = useState([]);
    const [openModal, setOpenModal] = useState(false)
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [showButtonIndex, setShowButtonIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        axiosInstance.get(`/additional_benefits/${3}/${empID}`, { headers }).then((response) => {
            setListData(response.data.data)
            setIsLoading(false);
        })

        axiosInstance.get(`/additional_benefits_brackets`, { headers }).then((response) => {
            setBracketData(response.data.data)
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
    const handleDeleteList = (benefitlist_id) => {
        const formData = new FormData();
        formData.append('benefitlist_id', benefitlist_id);

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
                axiosInstance.post('/delete_additional_benefits', formData, { headers }).then((response) => {
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

    const handleOpenModal = () => {
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listData.length) : 0;

    function bracketList(id) {
        return bracketData
            .filter((bracket) => bracket.benefit_id === id)
            .map((bracket, index) => (
                <div key={index}>
                    {`${bracket.rangeFrom ? bracket.rangeFrom.toString() : 0} TO ${bracket.rangeTo ? bracket.rangeTo.toString() : 0} = ${bracket.share ? bracket.share.toString() + '%' : 0 + '%'}`}
                </div>
            ));
    }
    const handleRowClick = (index) => {
        setShowButtonIndex(index);
    };

    return (
        <div>
            <div className='d-flex justify-content-lg-between'>
                <h5>Contribution</h5>
                <button type="button" className="btn btn-sm btn-light mx-5 h-50" data-toggle="modal" data-target="#add_new_list" id="new_report" onClick={handleOpenModal}>Add New List
                </button>
            </div>
           
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>

                <TableContainer>
                    <Table className="table table-md  table-striped  table-vcenter">
                        <PageHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {stableSort(listData, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((list, index) => {
                                    return (
                                        <TableRow key={index} hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            onClick={() => handleRowClick(index)}
                                            sx={{
                                                '&:hover': {
                                                    cursor: 'pointer'
                                                }
                                            }}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{list.title}</TableCell>
                                            {list.chooseType === 'Percentage' ?
                                                <><TableCell>{list.percentage}%</TableCell></>
                                                : list.chooseType === 'Amount' ?
                                                    <><TableCell>{list.amount}</TableCell></>
                                                    : <><TableCell>{bracketList(list.benefitlist_id)}</TableCell></>}
                                            <TableCell>{moment(list.date_created).format('MMM. D, YYYY')}</TableCell>
                                            <TableCell>
                                                {showButtonIndex === index && (
                                                    <div className='d-flex justify-content-end p-0 m-0'>
                                                        <button type="button" className="btn btn-danger btn-sm mr-2" id="new_report" onClick={() => handleDeleteList(list.benefitlist_id)}>
                                                            <li className='fa fa-trash' style={{ fontSize: 14 }}></li>
                                                        </button>
                                                    </div>
                                                )}
                                            </TableCell>
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
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={listData.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />

                </>
            )}

            <HrEmployeeAdditionalBenefitModal open={openModal} close={handleCloseModal} type={3} benefitData={null} />
        </div>
    )
}

export default EmployeeContribution
