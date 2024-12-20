import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Button, Stack, Grid } from '@mui/material'
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import PageHead from '../../components/Table/PageHead'
import PageToolbar from '../../components/Table/PageToolbar'
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import SuperPayrollChooseModal from '../../components/Modals/SuperPayrollChooseModal';
import HomeLogo from '../../../images/ManProTab.png'

const headCells = [
    {
        id: 'team',
        label: 'Company Name',
        sortable: true,
    },
    {
        id: 'email',
        label: 'Email',
        sortable: true,
    },
    {
        id: 'contact_number',
        label: 'Contact Number',
        sortable: true,
    },
    {
        id: 'address',
        label: 'Complete Address',
        sortable: true,
    },
];

const SuperPayroll = () => {
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [numberWorkdays, setNumberWorkdays] = useState();
    const [filterEmployee, setFilterEmployee] = useState([]);
    const [openChoose, setOpenChoose] = useState(false)
    const [userID, setUserID] = useState();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    useEffect(() => {
        axiosInstance.get('/adminEmployees', { headers }).then((response) => {
            setEmployeeDetails(response.data.employee);
            setFilterEmployee(response.data.employee);
            setNumberWorkdays(response.data.workdays);
        });
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
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleFilter = (event) => {
        const filtered = employeeDetails.filter(employee => `${employee?.fname} ${employee?.lname} ${employee?.date_hired} ${employee?.department} ${employee?.category} `.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setEmployeeDetails(filtered);
        } else {
            setEmployeeDetails(filterEmployee);
        }
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - employeeDetails.length) : 0;

    const handleChoose = (id) => {
        setOpenChoose(true)
        setUserID(id)
    }
    const handleCloseChoose = () => {
        setOpenChoose(false)
    }

    return (<Layout title={"Employees"}>
        <div className="content-heading d-flex justify-content-between p-0">
            <h5 className='pt-3'>Payroll</h5>
        </div>
        <div className='block'>
            <div className=" block-content bg-light" style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
                    <PageToolbar handleSearch={handleFilter} />
                </Grid>
                <TableContainer>
                    <Table className="table table-md  table-striped  table-vcenter " >
                        <PageHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {stableSort(employeeDetails, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((emp, index) => {

                                    return (
                                        <TableRow key={index} hover
                                            role="checkbox"
                                            tabIndex={-1}
                                        >
                                            <TableCell>{emp.team}</TableCell>
                                            <TableCell>{emp.email}</TableCell>
                                            <TableCell>{emp.contact_number}</TableCell>
                                            <TableCell>{emp.address}</TableCell>
                                            <TableCell>
                                                <Stack direction='row' alignItems='center' justifyContent='flex-end'>
                                                    <Button
                                                        className="mr-2"
                                                        size='medium'
                                                        sx={{ cursor: 'pointer', backgroundColor: '#3286d7', color: 'white', width: '30px', minWidth: 0 }}
                                                        onClick={() => handleChoose(emp.user_id)}
                                                    >
                                                        <i className="fa fa-search"></i>
                                                    </Button>
                                                </Stack>
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
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={employeeDetails.length}
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
        </div >
        <SuperPayrollChooseModal open={openChoose} close={handleCloseChoose} teamID={userID} />
    </Layout >
    )
}

export default SuperPayroll
