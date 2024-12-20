import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
import { Table, TableBody, TableCell, TableContainer, TableRow, Select, MenuItem, InputLabel, Box, FormControl, TextField, Typography, FormGroup, IconButton, Button, Icon, TablePagination, CircularProgress } from '@mui/material'
import moment from 'moment'
import PageHead from '../../components/Table/PageHead'
import { getComparator, stableSort } from '../../components/utils/tableUtils'
import PageToolbar from '../../components/Table/PageToolbar'
import PayrollModal from '../../components/Modals/PayrollModal'
import HomeLogo from "../../../images/ManProTab.png";

const headCells = [
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
        id: 'payroll_fromdate',
        label: 'Payroll Date',
        sortable: true,
    },
    {
        id: 'date_from',
        label: 'Payroll Cut-Off',
        sortable: false,
    },
    {
        id: 'grosspay',
        label: 'Grosspay',
        sortable: false,
    },
    {
        id: 'remarks',
        label: 'Type / Status',
        sortable: false,
    },



];

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20)).fill('').map((v, idx) => now - idx);
}

const HrPayrollRecords = () => {
    const queryParameters = new URLSearchParams(window.location.search)
    const [searchParams, setSearchParams] = useSearchParams()
    const [payrollRecord, setPayrollRecord] = useState([])
    const [filterPayroll, setFilterPayroll] = useState([]);
    const [openRecord, setOpenRecord] = useState(false);
    const [recordData, setRecordData] = useState([]);
    const [selectMonth, setSelectMonth] = useState(searchParams.get('month'))
    const [selectYear, setSelectYear] = useState(searchParams.get('year'))
    const [selectCutoff, setSelectCutoff] = useState(searchParams.get('cutoff'))
    const [selectEmpID, setSelectEmpID] = useState(searchParams.get('employeeID'))
    const allYears = years();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getPayrolls(selectCutoff, selectMonth, selectYear)
    }, [selectCutoff, selectMonth, selectYear])

    const getPayrolls = async (selectCutoff, month_val, year_val) => {
        let dates = []
        dates = ['1', selectCutoff, month_val, year_val]
        await axiosInstance.get(`/getPayrollRecord/${selectEmpID}/${dates.join(',')}`, { headers })
            .then((response) => {
                setPayrollRecord(response.data.payrollRecords);
                setFilterPayroll(response.data.payrollRecords);
            })
        setIsLoading(false);
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
        const filtered = payrollRecord.filter(application => `${application?.fname} ${application?.lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setPayrollRecord(filtered);
        } else {
            setPayrollRecord(filterPayroll);
        }
    }
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - payrollRecord.length) : 0;
    // END

    const handleOpenModal = (data) => {
        setOpenRecord(true)
        setRecordData(data)
    }

    const handleCloseModal = () => {
        setOpenRecord(false)
    }

    const handleChangeMonth = (e) => {
        const newMonth = e.target.value
        setSelectMonth(newMonth)
        setSearchParams({ ['month']: newMonth, ['cutoff']: selectCutoff, ['year']: queryParameters.get('year') })
    }

    const handleChangeCutoff = (e) => {
        const newCutoff = e.target.value
        setSelectCutoff(newCutoff)
        setSearchParams({ ['month']: selectMonth, ['cutoff']: newCutoff, ['year']: queryParameters.get('year') })
    }

    const handleChangeYear = (e) => {
        const newYear = e.target.value
        setSelectYear(newYear)
        setSearchParams({ ['month']: selectMonth, ['cutoff']: selectCutoff, ['year']: newYear })
    }

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Records of Payrolls</h5>
                    <div className="btn-group" role="group">
                        <FormControl size="small">
                            <InputLabel id="demo-simple-select-label">Month</InputLabel>
                            <Select labelId="demo-simple-select-label" id="month_attendance" value={selectMonth} label="Month" onChange={handleChangeMonth} sx={{ width: '120px', marginRight: '10px' }} >
                                <MenuItem value={1}>January</MenuItem>
                                <MenuItem value={2}>February</MenuItem>
                                <MenuItem value={3}>March</MenuItem>
                                <MenuItem value={4}>April</MenuItem>
                                <MenuItem value={5}>May</MenuItem>
                                <MenuItem value={6}>June</MenuItem>
                                <MenuItem value={7}>July</MenuItem>
                                <MenuItem value={8}>August</MenuItem>
                                <MenuItem value={9}>September</MenuItem>
                                <MenuItem value={10}>October</MenuItem>
                                <MenuItem value={11}>November</MenuItem>
                                <MenuItem value={12}>December</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small">
                            <InputLabel id="demo-simple-select-label">CutOff</InputLabel>
                            <Select labelId="demo-simple-select-label" id="cutoff" value={selectCutoff} label="Cutoff" onChange={handleChangeCutoff} sx={{ width: '120px', marginRight: '10px' }} >
                                <MenuItem value={1}>First</MenuItem>
                                <MenuItem value={2}>Second</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small">
                            <InputLabel id="demo-simple-select-label">Year</InputLabel>
                            <Select labelId="demo-simple-select-label" id="month_attendance" value={selectYear} label="Year" onChange={handleChangeYear} sx={{ width: '120px', marginRight: '10px' }} >
                                {allYears.map((year, index) => (
                                    <MenuItem key={index} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
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
                                    {stableSort(payrollRecord, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((payrollList, index) => {
                                            return (
                                                <TableRow key={index} hover
                                                    role="checkbox"
                                                    tabIndex={-1}>
                                                    <TableCell>
                                                        {payrollList.profile_pic ? (<img src={location.origin + "/storage/" + payrollList.profile_pic} style={{
                                                            height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                        }} />) : (<img src={HomeLogo} style={{
                                                            height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                        }} />)}
                                                        {payrollList.lname + ","} {payrollList.fname}  {payrollList.mname ? payrollList.mname[0] + "." : ""}</TableCell>
                                                    <TableCell>{payrollList.category ? payrollList.category : 'n/a'}</TableCell>
                                                    <TableCell>{payrollList.department}</TableCell>
                                                    <TableCell>{moment(payrollList.payroll_fromdate).format('MMM.DD') + ' - ' + moment(payrollList.payroll_todate).format('MMM.DD')}</TableCell>
                                                    <TableCell>{payrollList.workdays + 'days'}</TableCell>
                                                    <TableCell>{'₱' + payrollList.monthly_rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>

                                                    <TableCell>
                                                        <div className='d-flex justify-content-start p-1 text-white rounded-lg'>
                                                            <Typography variant='subtitle2' className='p-1 mr-1  text-white rounded-lg' style={{
                                                                backgroundColor: payrollList.processtype != 2 ? '#7697cc' : '#e84b45'
                                                            }}>{payrollList.processtype != 2 ? 'Extended' : 'Unextended'}</Typography>
                                                            <Typography variant='subtitle2' className='p-1  text-white rounded-lg' style={{
                                                                backgroundColor: payrollList.signature != null ? 'green' : payrollList.payroll_status === 1 ? '#eab000' : payrollList.payroll_status === 3 ? '#197ed1' : '#808080'
                                                            }}>{payrollList.signature != null ? 'Signed' : payrollList.payroll_status === 1 ? 'Received' : payrollList.payroll_status === 3 ? 'Sent' : 'Saved'}</Typography>

                                                        </div>
                                                    </TableCell>

                                                    <TableCell>  <div className='d-flex justify-content-end p-0 m-0'><button type="button" onClick={() => handleOpenModal(payrollList)} className="btn btn-success btn-sm mr-2" id="new_report" ><i className="fa fa-pencil"></i>
                                                    </button></div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={payrollRecord.length}
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
                </div>
                {openRecord &&
                    <PayrollModal open={openRecord} close={handleCloseModal} data={recordData} cutoff={selectCutoff} type={2} />
                }
            </Box>
        </Layout>
    )
}

export default HrPayrollRecords
