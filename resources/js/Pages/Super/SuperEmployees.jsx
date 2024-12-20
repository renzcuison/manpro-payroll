import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Typography, Button, Stack, Grid } from '@mui/material'
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import PageHead from '../../components/Table/PageHead'
import PageToolbar from '../../components/Table/PageToolbar'
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import HrEmployeeEditModal from '../../components/Modals/HrEmployeeEditModal';
import HrChooseAddEmployee from '../../components/Modals/HrChooseAddEmployee';
import SuperEmployeesChooseModal from '../../components/Modals/SuperEmployeesChooseModal';
import HomeLogo from '../../../images/ManProTab.png'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const headCells = [
    {
        id: 'fname',
        label: 'Name',
        sortable: true,
    },
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
    {
        id: 'status',
        label: 'Status',
        sortable: true,
    },

];

const SuperEmployees = () => {
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [numberWorkdays, setNumberWorkdays] = useState();
    const [filterEmployee, setFilterEmployee] = useState([]);
    const [openEdit, setOpenEdit] = useState(false)
    const [openAddEmployee, setOpenAddEmployee] = useState(false)
    const [openChoose, setOpenChoose] = useState(false)
    const [userID, setUserID] = useState();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const [empEdit, setEmpEdit] = useState(false);
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [modalData, setModalData] = useState({
        user_id: '',
        fname: '',
        mname: '',
        lname: '',
        address: '',
        contact_number: '',
        email: '',
        bdate: '',
        user_type: '',
        status: '',
        hourly_rate: '',
        daily_rate: '',
        monthly_rate: '',
        department: '',
        category: '',
        date_hired: '',
        sss: '',
        philhealth: '',
        pagibig: '',
        atm: '',
    });
    const navigate = useNavigate();
    useEffect(() => {
        axiosInstance.get('/adminEmployees', { headers }).then((response) => {
            setEmployeeDetails(response.data.employee);
            setFilterEmployee(response.data.employee);
            setNumberWorkdays(response.data.workdays);
        });
    }, [])

    const handleOpenEdit = () => {
        setOpenEdit(true)
    }
    const handleCloseEdit = () => {
        setOpenEdit(false)
    }
    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearch = async (id) => {
        const empdetails = await axiosInstance.get(`/search-employees/${id}`, { headers })
        setModalData(empdetails.data.update_employee)
        setEmpEdit(true);
        handleOpenEdit();
    }

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

    const handleProfile = (id) => {
        navigate('/hr/profile?employeeID=' + id)
    }

    const handleAddEmployee = () => {
        setOpenAddEmployee(true)

    }
    const handleCloseAddEmployee = () => {
        setOpenAddEmployee(false)
    }
    const handleChoose = (id) => {
        setOpenChoose(true)
        setUserID(id)
    }
    const handleCloseChoose = () => {
        setOpenChoose(false)
    }
    const handleDeleteEmployee = (id) => {
        const formData = new FormData();
        formData.append('id', id);

        new Swal({
            title: "Are you sure?",
            text: "You want to delete this employee?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete-employees', formData, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        Swal.fire({
                            title: "Success!",
                            text: 'Employee has been deleted successfully',
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

    return (<Layout title={"Employees"}>
        <div className="content-heading d-flex justify-content-between p-0">
            <h5 className='pt-3'>Administrators</h5>
        </div>
        <div className='block'>
            <div className=" block-content bg-light" style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
                    <PageToolbar handleSearch={handleFilter} />

                    <Button
                        sx={{ marginTop: -1 }}
                        size='small'
                        variant="contained"
                        color="primary"
                        onClick={handleAddEmployee}
                    >
                        Add New Employee
                    </Button>
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
                                            <TableCell>
                                                {emp.profile_pic ? <img src={location.origin + "/storage/" + emp.profile_pic} style={{
                                                    height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                }} /> : <img src={HomeLogo} style={{
                                                    height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                }} />}
                                                {emp.fname} {emp.lname}</TableCell>
                                            <TableCell>{emp.team}</TableCell>
                                            <TableCell>{emp.email}</TableCell>
                                            <TableCell>{emp.contact_number}</TableCell>
                                            <TableCell>{emp.address}</TableCell>
                                            <TableCell>
                                                <div className='d-flex justify-content-start p-1 text-white rounded-lg'><Typography variant='subtitle2' className={(emp.status == "Active") ? "d-flex justify-content-start p-1 text-white rounded-lg bg-success text-center text-white pt-1 pb-1 rounded-lg" : (emp.status == "Terminated") ? "d-flex justify-content-start p-1 text-white rounded-lg bg-warning text-center text-white pt-1 pb-1 rounded-lg" : (emp.status == "Suspended") ? "d-flex justify-content-start p-1 text-white rounded-lg bg-danger text-center text-white pt-1 pb-1 rounded-lg" : "d-flex justify-content-start p-1 text-white rounded-lg bg-dark text-center text-white pt-1 pb-1 rounded-lg"}>{emp.status ?? 'Not yet assign!'}</Typography></div>
                                            </TableCell>
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
                                                    <Button
                                                        className="mr-2"
                                                        size='medium'
                                                        sx={{ cursor: 'pointer', backgroundColor: '#7eb73d', color: 'white', width: '30px', minWidth: 0 }}
                                                        onClick={() => handleSearch(emp.user_id)}
                                                    >
                                                        <i className="fa fa-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        className="mr-2"
                                                        size='medium'
                                                        sx={{ cursor: 'pointer', backgroundColor: '#eab000', color: 'white', width: '30px', minWidth: 0 }}
                                                        onClick={() => handleProfile(emp.user_id)}
                                                    >
                                                        <i className="fa fa-arrow-right"></i>
                                                    </Button>
                                                    <Button
                                                        className="mr-2"
                                                        size='medium'
                                                        sx={{ cursor: 'pointer', backgroundColor: '#ea1c18', color: 'white', width: '30px', minWidth: 0 }}
                                                        onClick={() => handleDeleteEmployee(emp.user_id)}
                                                    >
                                                        <i className="fa fa-trash"></i>
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
        <HrEmployeeEditModal open={openEdit} close={handleCloseEdit} data={modalData} wkdays={numberWorkdays} empEdit={setEmpEdit} />
        <HrChooseAddEmployee open={openAddEmployee} close={handleCloseAddEmployee} />
        <SuperEmployeesChooseModal open={openChoose} close={handleCloseChoose} teamID={userID} />
    </Layout >
    )
}

export default SuperEmployees
