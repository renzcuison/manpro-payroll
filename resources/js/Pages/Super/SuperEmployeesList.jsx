import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid } from '@mui/material'
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import PageHead from '../../components/Table/PageHead'
import PageToolbar from '../../components/Table/PageToolbar'
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import moment from 'moment';
import HrEmployeeAddModal from '../../components/Modals/HrEmployeeAddModal';
import HrEmployeeAddBranch from '../../components/Modals/HrEmployeeAddBranch';
import SuperEmployeeResetPassword from '../../components/Modals/SuperEmployeeResetPassword';
import HrEmployeeWorkdayModal from '../../components/Modals/HrEmployeeWorkdayModal';
import HrEmployeeBenefits from '../../components/Modals/HrEmployeeBenefits';
import HrEmployeeLoans from '../../components/Modals/HrEmployeeLoans';
import HrEmployeeContributions from '../../components/Modals/HrEmployeeContributions';
import HrChooseAddEmployee from '../../components/Modals/HrChooseAddEmployee';
import HomeLogo from '../../../images/ManProTab.png'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';
import { useSearchParams } from 'react-router-dom'
const headCells = [
    {
        id: 'fname',
        label: 'Name',
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
        id: 'date_hired',
        label: 'Date Hired',
        sortable: true,
    },
    {
        id: 'department',
        label: 'Department',
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

const SuperEmployeesList = () => {
    const { user } = useUser();
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [numberWorkdays, setNumberWorkdays] = useState();
    const [filterEmployee, setFilterEmployee] = useState([]);
    const [openStatus, setOpenStatus] = useState(false)
    const [openBranch, setOpenBranch] = useState(false)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [openBenefit, setOpenBenefit] = useState(false)
    const [openLoan, setOpenLoan] = useState(false)
    const [openContri, setOpenContri] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [openAddEmployee, setOpenAddEmployee] = useState(false)
    const [open, setOpen] = useState(false);
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
        axiosInstance.get(`/employees/${empID}`, { headers }).then((response) => {
            setEmployeeDetails(response.data.employee);
            setFilterEmployee(response.data.employee);
            setNumberWorkdays(response.data.workdays);
        });
    }, [])

    const handleOpenStatus = () => {
        setOpenStatus(true)
    }
    const handleCloseStatus = () => {
        setOpenStatus(false)
    }
    const handleOpenBranch = () => {
        setOpenBranch(true)
    }
    const handleCloseBranch = () => {
        setOpenBranch(false)
    }
    const handleOpenCalendar = () => {
        setOpenCalendar(true)
    }
    const handleCloseCalendar = () => {
        setOpenCalendar(false)
    }
    const handleOpenBenefit = () => {
        setOpenBenefit(true)
    }
    const handleCloseBenefit = () => {
        setOpenBenefit(false)
    }
    const handleOpenLoan = () => {
        setOpenLoan(true)
    }
    const handleCloseLoan = () => {
        setOpenLoan(false)
    }
    const handleOpenContribution = () => {
        setOpenContri(true)
    }
    const handleCloseContribution = () => {
        setOpenContri(false)
    }
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
    const [anchorEl, setAnchorEl] = useState(null);
    const opened = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAddEmployee = () => {
        setOpenAddEmployee(true)

    }
    const handleCloseAddEmployee = () => {
        setOpenAddEmployee(false)
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
            <h5 className='pt-3'>Employees</h5>

            <div className="btn-group" role="group">
                <Button
                    type="button"
                    className="btn btn-sm btn-light mx-5 h-50 mt-15  dropdown-toggle"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded={opened ? 'false' : undefined}
                    aria-controls={opened ? 'dropdown-menu' : undefined}
                    onClick={handleClick}
                    sx={{ border: '1px solid gray' }}
                >
                    <i className="fa fa-gear"></i><span style={{ textTransform: 'none' }}> Add Task</span>
                </Button>
                <Menu
                    id="dropdown-menu"
                    anchorEl={anchorEl}
                    open={opened}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem
                        className="dropdown-item"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleOpenStatus}
                        x-placement="bottom-end"
                        aria-labelledby="btnGroupVerticalDrop1">
                        <i className="fa fa-file-text mr-5"></i>Add Status
                    </MenuItem>
                    <MenuItem
                        className="dropdown-item"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleOpenBranch}
                        x-placement="bottom-end"
                        aria-labelledby="btnGroupVerticalDrop1">
                        <i className="fa fa-code-fork mr-5"></i>Add Branch
                    </MenuItem>
                    <MenuItem
                        className="dropdown-item"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleOpenCalendar}
                        x-placement="bottom-end"
                        aria-labelledby="btnGroupVerticalDrop1">
                        <i className="fa fa-calendar mr-5"></i>Set Work Days
                        <div className="dropdown-divider"></div>
                    </MenuItem>
                    <MenuItem
                        className="dropdown-item"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleOpenBenefit}
                        x-placement="bottom-end"
                        aria-labelledby="btnGroupVerticalDrop1">
                        <i className="fa fa-plus mr-5"></i>Additional Benefits
                    </MenuItem>
                    <MenuItem
                        className="dropdown-item"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleOpenLoan}
                        x-placement="bottom-end"
                        aria-labelledby="btnGroupVerticalDrop1">
                        <i className="fa fa-plus mr-5"></i>Additional Loans
                    </MenuItem>
                    <MenuItem
                        className="dropdown-item"
                        sx={{ cursor: 'pointer' }}
                        onClick={handleOpenContribution}
                        x-placement="bottom-end"
                        aria-labelledby="btnGroupVerticalDrop1">
                        <i className="fa fa-plus mr-5"></i>Employer Contributions
                    </MenuItem>

                </Menu>
            </div>
        </div>
        <div className='block'>
            <div className=" block-content bg-light" style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
                    <PageToolbar handleSearch={handleFilter} />
                    {user.user_type !== 'Super Admin' && (
                        <Button
                            sx={{ marginTop: -1 }}
                            size='small'
                            variant="contained"
                            color="primary"
                            // startIcon={<FileCopyIcon />}
                            onClick={handleAddEmployee}
                        >
                            Add New Employee
                        </Button>
                    )}

                </Grid>

                {/* <Button
                        className="btn btn-sm btn-light mx-5 h-50 mt-15"
                        sx={{ cursor: 'pointer', border: '1px solid gray', paddingBottom: 0, paddingTop: 0 }}
                        onClick={handleAddEmployee}
                    >
                        <span style={{ textTransform: 'none' }}>Add Employee</span>
                    </Button> */}
                {/* <button type="button" className="btn btn-sm btn-primary mx-5 h-50 mt-10" data-toggle="modal" data-target="#add_new_file" id="new_report" onClick={() => setShowEdit(false)}>New Report
                    </button> */}
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
                                            <TableCell>{emp.email}</TableCell>
                                            <TableCell>{emp.contact_number}</TableCell>
                                            <TableCell>{emp.date_hired ? moment(emp.date_hired).format('MMMM D, YYYY') : 'n/a'}</TableCell>
                                            <TableCell>{emp.department ? emp.department : "Not yet assign!"}</TableCell>
                                            <TableCell>{emp.address}</TableCell>
                                            <TableCell>
                                                <div className='d-flex justify-content-start p-1 text-white rounded-lg'><Typography variant='subtitle2' className={(emp.status == "Active") ? "d-flex justify-content-start p-1 text-white rounded-lg bg-success text-center text-white pt-1 pb-1 rounded-lg" : (emp.status == "Terminated") ? "d-flex justify-content-start p-1 text-white rounded-lg bg-warning text-center text-white pt-1 pb-1 rounded-lg" : (emp.status == "Suspended") ? "d-flex justify-content-start p-1 text-white rounded-lg bg-danger text-center text-white pt-1 pb-1 rounded-lg" : "d-flex justify-content-start p-1 text-white rounded-lg bg-dark text-center text-white pt-1 pb-1 rounded-lg"}>{emp.status ?? 'Not yet assign!'}</Typography></div>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction='row' alignItems='center' justifyContent='flex-end'>
                                                    <Button
                                                        className="mr-2"
                                                        size='medium'
                                                        sx={{ cursor: 'pointer', backgroundColor: '#7eb73d', color: 'white', width: '30px', minWidth: 0 }}
                                                        onClick={() => handleSearch(emp.user_id)}
                                                    >
                                                        <i className="fa fa-pencil"></i>
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
        <HrEmployeeAddModal open={openStatus} close={handleCloseStatus} />
        <HrEmployeeAddBranch open={openBranch} close={handleCloseBranch} />
        <HrEmployeeWorkdayModal open={openCalendar} close={handleCloseCalendar} />
        <HrEmployeeBenefits open={openBenefit} close={handleCloseBenefit} />
        <HrEmployeeLoans open={openLoan} close={handleCloseLoan} />
        <HrEmployeeContributions open={openContri} close={handleCloseContribution} />
        <SuperEmployeeResetPassword open={openEdit} close={handleCloseEdit} data={modalData} wkdays={numberWorkdays} empEdit={setEmpEdit} />
        <HrChooseAddEmployee open={openAddEmployee} close={handleCloseAddEmployee} />

    </Layout >

    )
}

export default SuperEmployeesList
