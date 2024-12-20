import { Table, TableBody, TableCell, TableContainer, TableRow, Select, MenuItem, InputLabel, FormControl, TablePagination, Box, CircularProgress, Typography, ButtonGroup } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import AttendanceAddAbsence from '../../components/Modals/AttendanceAddAbsence'
import PageHead from '../../components/Table/PageHead'
import PageToolbar from '../../components/Table/PageToolbar'
import { getComparator, stableSort } from '../../components/utils/tableUtils'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig'
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
        id: 'dutyHours',
        label: 'Duty Hours',
        sortable: true,
    },
    {
        id: 'attdn_date',
        label: 'Tardiness',
        sortable: false,
    },
    {
        id: 'attdn_date',
        label: 'Absences',
        sortable: false,
    },
    {
        id: 'attdn_date',
        label: 'Total Hours',
        sortable: false,
    },
];

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20)).fill('').map((v, idx) => now - idx);
}

const HrAttendance = () => {
    const allYears = years();
    const { empID } = useParams();
    const queryParameters = new URLSearchParams(window.location.search)
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalAttendance, setTotalAttendance] = useState([]);
    const [filterAttendance, setFilterAttendance] = useState([]);
    const [attnd, setAttnd] = useState(searchParams.get('attnd'))
    const [selectDay, setSelectDay] = useState(searchParams.get('day'))
    const [selectMonth, setSelectMonth] = useState(searchParams.get('month'))
    const [selectYear, setSelectYear] = useState(searchParams.get('year'))
    const [selectEmp, setSelectEmp] = useState(searchParams.get('employeeID'))
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [open, setOpen] = useState(false);
    const [openView, setOpenView] = useState(false)
    const [selectedAttendnace, setSelectedAttendnace] = useState(null);
    const [presentAttendnace, setPresentAttendnace] = useState(null);
    const navigate = useNavigate();
   
    const [isLoading, setIsLoading] = useState(true);
    const [showEmployee, setShowEmployee] = useState(false);

    useEffect(() => {
        if (searchParams.get('month') && searchParams.get('year') && searchParams.get('user_id') && !openView) {
            setSelectedAttendnace({
                'month': searchParams.get('month'),
                'year': searchParams.get('year'),
                'user_id': searchParams.get('user_id'),
            });
            setOpenView(true);
        }
    }, [empID, openView]);

    useEffect(() => {
        if (searchParams.get('day') && searchParams.get('month') && searchParams.get('year')) {
            setPresentAttendnace({
                'month': searchParams.get('month'),
                'year': searchParams.get('year'),
                'day': searchParams.get('day'),
            });
        }
    }, []);

    const handleOpen = (attdn) => {
        setOpen(true);
        setSelectedAttendnace({ attdn });
    };
    
    const handleOpenView = (attdn, month, year) => {
        setOpenView(true);
        setSelectedAttendnace({
            'month': month,
            'year': year,
            'user_id': attdn,
        });
        setPresentAttendnace({
            'month': month,
            'year': year,
        });
        navigate(`/hr/attendance?month=${month}&year=${year}&user_id=${attdn}`)
    };

    const handleCloseAbsences = () => {
        setOpen(false)
    }

    const handleCloseView = () => {
        setOpenView(false)
        navigate(`/hr/attendance?month=${selectMonth}&year=${selectYear}`)
        setSelectMonth(selectMonth)
        setSelectYear(selectYear)
    }
    
    useEffect(() => {
        filterChangeMonth(selectDay, selectMonth, selectYear)
    }, [selectDay, selectMonth, selectYear])

    const filterChangeMonth = (day_val, month_val, year_val) => {
        if (attnd === 'present' && day_val) {
            setIsLoading(true);
            axiosInstance.post('/get-today-present', { day: day_val, month: month_val, year: year_val }, { headers })
                .then((response) => {
                    setTotalAttendance(response.data.attendance);
                    setFilterAttendance(response.data.attendance);
                    setIsLoading(false);
                })
        }
        if (attnd === 'absent' && day_val) {
            setIsLoading(true);
            axiosInstance.post('/get-today-absent', { day: day_val, month: month_val, year: year_val }, { headers })
                .then((response) => {
                    setTotalAttendance(response.data.attendance);
                    setFilterAttendance(response.data.attendance);
                    setIsLoading(false);
                })
        }
        if (attnd === 'leave' && day_val) {
            setIsLoading(true);
            axiosInstance.post('/get-today-leave', { day: day_val, month: month_val, year: year_val }, { headers })
                .then((response) => {
                    setTotalAttendance(response.data.attendance);
                    setFilterAttendance(response.data.attendance);
                    setIsLoading(false);
                })
        }
        if (!attnd && month_val && year_val) {
            setIsLoading(true);
            axiosInstance.post(`/get-attendance/${selectEmp}`, { month: month_val, year: year_val }, { headers })
                .then((response) => {
                    setTotalAttendance(response.data.attendance);
                    setFilterAttendance(response.data.attendance);
                    setIsLoading(false);
                })
        }
    }

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
        const filtered = totalAttendance.filter(attdn => `${attdn?.fname} ${attdn?.lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setTotalAttendance(filtered);
        } else {
            setTotalAttendance(filterAttendance);
        }
    }

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalAttendance.length) : 0;

    const handleChangeMonth = (e) => {
        const newMonth = e.target.value
        setSelectMonth(newMonth)
        setSearchParams({
            ['month']: newMonth,
            ['year']: queryParameters.get('year')
        })
    }

    const handleChangeYear = (e) => {
        const newYear = e.target.value
        setSelectYear(newYear)
        setSearchParams({
            ['month']: queryParameters.get('month'),
            ['year']: newYear
        })
    }

    const openEmployeeAttendance = (employee, month, year) => {
        navigate(`/hr/attendance-employee/${month}/${year}/${employee}`)
    };

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 3, alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ pt: 3 }}>
                        {
                            attnd === 'present' ? 'Present Employees' :
                            attnd === 'absent' ? 'Absent Employees' :
                            attnd === 'leave' ? 'On Leave Employees' : 
                            'List of Attendance'
                        }
                    </Typography>

                    <ButtonGroup variant="text" aria-label="month and year selector" sx={{ gap: 1 }}>
                        <FormControl size="small" sx={{ mr: 1 }}>
                            <InputLabel id="month-select-label">Month</InputLabel>
                            <Select labelId="month-select-label" id="month_attendance" value={selectMonth} label="Month" onChange={handleChangeMonth} sx={{ width: 120 }} >
                                <MenuItem value={'01'}>January</MenuItem>
                                <MenuItem value={'02'}>February</MenuItem>
                                <MenuItem value={'03'}>March</MenuItem>
                                <MenuItem value={'04'}>April</MenuItem>
                                <MenuItem value={'05'}>May</MenuItem>
                                <MenuItem value={'06'}>June</MenuItem>
                                <MenuItem value={'07'}>July</MenuItem>
                                <MenuItem value={'08'}>August</MenuItem>
                                <MenuItem value={'09'}>September</MenuItem>
                                <MenuItem value={'10'}>October</MenuItem>
                                <MenuItem value={'11'}>November</MenuItem>
                                <MenuItem value={'12'}>December</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ ml: 1 }}>
                            <InputLabel id="year-select-label">Year</InputLabel>
                            <Select labelId="year-select-label" id="year_attendance" value={selectYear} label="Year" onChange={handleChangeYear} sx={{ width: 120 }} >
                                {allYears.map((year, index) => (
                                    <MenuItem key={index} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ButtonGroup>
                </Box>

                <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <PageToolbar handleSearch={handleFilter} />
                    </Box>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer style={{ overflowX: 'auto' }}>
                                <Table className="table table-md  table-striped  table-vcenter" style={{ minWidth: 'auto' }}>
                                    <PageHead style={{ whiteSpace: 'nowrap' }} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />
                                    <TableBody>
                                        {totalAttendance.length != 0 ?
                                            stableSort(totalAttendance, getComparator(order, orderBy))
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((attdn, index) => {
                                                    if (attdn.is_deleted != 1) {
                                                        return (
                                                            <TableRow key={attdn.user_id} hover role="checkbox" tabIndex={-1} onClick={() => openEmployeeAttendance(attdn.user_id, attdn.MonthVal, attdn.YearVal)} sx={{ '&:hover': { cursor: 'pointer' } }}>
                                                                <TableCell style={{ whiteSpace: 'nowrap' }}>
                                                                    {attdn.profile_pic ? (<img src={location.origin + "/storage/" + attdn.profile_pic} style={{
                                                                        height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                                    }} />) : (<img src={HomeLogo} style={{
                                                                        height: 35, width: 35, borderRadius: 50, objectFit: 'cover', marginRight: 10
                                                                    }} />)}
                                                                    {attdn.lname + ","} {attdn.fname} {attdn.mname ? attdn.mname[0] + "." : ""}
                                                                </TableCell>
                                                                <TableCell>{attdn.category}</TableCell>
                                                                <TableCell>{attdn.department}</TableCell>
                                                                <TableCell>{attdn.dutyHours}</TableCell>
                                                                <TableCell>{attdn.tardiness}</TableCell>
                                                                <TableCell>{attdn.absences}</TableCell>
                                                                <TableCell>{attdn.totalHours}</TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                })
                                            :
                                            <TableRow hover role="checkbox" tabIndex={-1}>
                                                <TableCell colSpan={8} className="text-center">No data Found</TableCell>
                                            </TableRow>
                                        }
                                        {emptyRows > 0 && (
                                            <TableRow style={{ height: 53 * emptyRows, }} >
                                                <TableCell colSpan={6} >No data Found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalAttendance.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ '.MuiTablePagination-actions': { mb: 2 }, '.MuiInputBase-root': { mb: 2 },bgcolor: '#ffffff',borderRadius: '8px'}} />

                        </>
                    )}
                </Box>
                
            </Box>
        </Layout >
    )
}

export default HrAttendance
