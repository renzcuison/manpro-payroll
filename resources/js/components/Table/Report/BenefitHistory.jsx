import React, { useEffect, useRef, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Grid, TableHead, FormControl, InputLabel, Select, MenuItem, Box, TextField, Typography } from '@mui/material'

import PageHead from '../../../components/Table/PageHead'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useSearchParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print';

import dayjs from 'dayjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import PageToolbar from '../PageToolbar'

const headCells = [
    {
        id: 'Name',
        label: 'Name',
        sortable: true,
    },
    {
        id: 'Benefit Title',
        label: 'Benefit Title',
        sortable: true,
        subheader: 'SSS',
    },
    {
        id: 'Amount',
        label: 'Amount',
        sortable: true,
    },
    {
        id: 'Category',
        label: 'Category',
        sortable: true,
    },
    {
        id: 'Date Created',
        label: 'Date Created',
        sortable: true,
    },
];

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20)).fill('').map((v, idx) => now - idx);
}

const BenefitHistory = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [employeeBenefits, setEmployeeBenefits] = useState([]);
    const contentToPrint = useRef()
    const [payrollRecord, setPayrollRecord] = useState([]);
    const [filterPayroll, setFilterPayroll] = useState([]);
    const [payrollFrom, setPayrollFrom] = useState();
    const [payrollTo, setPayrollTo] = useState();
    const [totalGrosspay, setTotalGrossPay] = useState();
    const [totalSSSEmps, setTotalSSSEmps] = useState();
    const [totalSSSEmpr, setTotalSSSEmpr] = useState();
    const [totalPhilEmps, setTotalPhilEmps] = useState();
    const [totalPhilEmpr, setTotalPhilEmpr] = useState();
    const [totalPGIBIGEmps, setTotalPGIBIGEmps] = useState();
    const [totalPGIBIGEmpr, setTotalPGIBIGEmpr] = useState();
    const [totalDeduction, setTotalDeduction] = useState();
    const [totalNetpay, setTotalNetpay] = useState();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const allYears = years();

    const [selectMonth, setSelectMonth] = useState(searchParams.get('month'))
    const [selectYear, setSelectYear] = useState(searchParams.get('year'))
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {

        const date = dayjs(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD');

        const data = {
            module: 'SummaryReports',
            page: 'SummaryReports',
            filter: 'BenefitsHistory',
            date: date,
        };

        axiosInstance.get(`/previousFilter`, { params: data, headers })
            .then((response) => {

                if ( response.data.hasRecord === true ) {
                    const dateString = response.data.record.date;    
                    const dateObject = new Date(dateString);
                    
                    dateObject.setUTCDate(1);
                    dateObject.setUTCHours(0, 0, 0, 0);
                    
                    const timestampInMilliseconds = dateObject.getTime();
                    const [year, month] = dateString.split('-');

                    setSelectedDate(dayjs(timestampInMilliseconds));
                    setSelectMonth(month);
                    setSelectYear(year);
        
                    setSearchParams({['month']: month, ['year']: year });
                } else {
                    setSelectedDate(date);
                }
                
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
            });
        
        getEmployee(selectMonth, selectYear)
        
    }, [selectMonth, selectYear]);

    const handleChange = (newValue) => {
        if (newValue) {
            const month = (newValue.month() + 1).toString().padStart(2, '0');
            const year = newValue.year();

            const newDate = dayjs(`${year}-${month}-01`, 'YYYY-MM-DD');

            setSearchParams({ ['month']: month, ['year']: year });
            setSelectedDate(newDate);
            setSelectMonth(month);
            setSelectYear(year);

            const data = {
                module: 'SummaryReports',
                page: 'SummaryReports',
                filter: 'BenefitsHistory',
                date: newDate.format('YYYY-MM-DD'),
            };
    
            axiosInstance.post('/addFilter', data, { headers })
                .then(response => {
                    getEmployee(selectMonth, selectYear)
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    };    

    const getEmployee = async (month_val, year_val) => {
        let dates = []
        dates = [month_val, year_val]
        await axiosInstance.get(`/getPayrollSummaryHistory/${empID}/${dates.join(',')}`, { headers })
            .then((response) => {
                setPayrollRecord(response.data.payrollRecords);
                setFilterPayroll(response.data.payrollRecords);
            })
    }

    // useEffect(() => {
    //     axiosInstance.get(`/getPayrollSummaryHistory/${empID}`, { headers }).then((response) => {
    //         setPayrollRecord(response.data.payrollRecords);
    //         setFilterPayroll(response.data.payrollRecords);
    //         setPayrollFrom(response.data.payroll_from);
    //         setPayrollTo(response.data.payroll_to);
    //         setTotalGrossPay(response.data.total_grosspay);
    //         setTotalSSSEmps(response.data.total_sss_emps);
    //         setTotalSSSEmpr(response.data.total_sss_empr);
    //         setTotalPhilEmps(response.data.total_phil_emps);
    //         setTotalPhilEmpr(response.data.total_phil_empr);
    //         setTotalPGIBIGEmps(response.data.total_pgbig_emps);
    //         setTotalPGIBIGEmpr(response.data.total_pgbig_empr);
    //         setTotalDeduction(response.data.total_all_deduct);
    //         setTotalNetpay(response.data.total_all_pay);
    //     });
    // }, [])

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

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - payrollRecord.length) : 0;

    const handleFilter = (event) => {
        const filtered = payrollRecord.filter(employee => `${employee?.lname} ${employee?.fname} ${employee?.mname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()));
        if (event.target.value != '') {
            setPayrollRecord(filtered);
        } else {
            setPayrollRecord(filterPayroll);
        }
    }

    const handleToPrint = useReactToPrint({
        content: () => {
            const combinedContent = document.createElement('div');
            const logoImage = document.createElement('img');

            logoImage.className = "logoNasya d-flex justify-content-center";
            logoImage.src = location.origin + "/images/ManPro.png";
            logoImage.style.height = "70px";
            logoImage.style.width = "200px";
            logoImage.style.margin = "0 auto";
            logoImage.style.display = "block";
            logoImage.style.marginTop = "30px";

            combinedContent.appendChild(logoImage);
            combinedContent.appendChild(contentToPrint.current.cloneNode(true));

            return combinedContent;
        },
        documentTitle: 'Employee_Benefits_History_Data',
        onAfterPrint: () => {
            Swal.fire({
                customClass: { container: 'my-swal' },
                title: 'Success!',
                text: 'Successfully Printed!',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });

    const customDatePickerStyles = { width: '50px' };

    return (
        <div>
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <div></div>
                <Grid item xs={6} container justifyContent="flex-end">
                    <FormControl size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker', 'DatePicker', 'DatePicker']}>
                            <DatePicker
                                label='Month and Year'
                                views={['month', 'year']}
                                size="small"
                                sx={customDatePickerStyles}
                                renderInput={(params) => <TextField {...params} size="small" />}
                                onChange={handleChange}
                                value={selectedDate}
                                minDate={dayjs('2023-01-01')}
                                maxDate={dayjs('2034-12-31')}
                            />
                            </DemoContainer>
                        </LocalizationProvider>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container alignItems="center" justifyContent="space-between">
                <div></div>
                <Grid item xs={6} container justifyContent="flex-end">
                    <PageToolbar handleSearch={handleFilter} />
                    <Grid item sx={{ paddingTop: 1.5 }}>
                        <button type="button" className="printBtn btn btn-warning btn-md mr-2" onClick={handleToPrint}>Print</button>
                    </Grid>
                </Grid>
            </Grid>

            <Box component="div" className="payroll_details px-2" ref={contentToPrint} sx={{ "@media print": { "@page": { size: "12in 11in" }} }} >
                <Grid container alignItems="center" justifyContent="space-between">
                    <div className='d-flex justify-content-lg-between'>
                        <h5>Benefits History</h5>
                    </div>
                </Grid>

                <TableContainer>
                    <Table className="table table-md  table-striped  table-bordered">
                        {/* <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} /> */}
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Employee Name </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={6}> Statutory Benefits </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={4}> Other Benefits </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Tax </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Covered Date </TableCell>
                            </TableRow>
                            <TableRow sx={{ borderTop: 1, borderColor: "#e4e7ed", }}>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> SSS </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Philhealth </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Pagibig </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Insurance </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> 13th Month Pay </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Leave Credit </TableCell>
                            </TableRow>
                            <TableRow sx={{ borderTop: 1, borderColor: "#e4e7ed" }} >
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {stableSort( payrollRecord, getComparator(order, orderBy) )
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map((payrollList, index) => {
                                    const isEmptyRow =
                                        payrollList.fname === '' ||
                                        payrollList.lname === '' ||
                                        payrollList.sss_employers === '' ||
                                        payrollList.sss_employee === '' ||
                                        payrollList.phil_employers === '' ||
                                        payrollList.phil_employee === '' ||
                                        payrollList.pbg_employers === '' ||
                                        payrollList.pbg_employee === '' ||
                                        payrollList.tax === '' ||
                                        payrollList.loan === '' ||
                                        payrollList.todate === '';
                                    return !isEmptyRow ? (
                                        <TableRow key={index} hover tabIndex={-1} >
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ height: 35, padding: 0, margin: 0, paddingTop: 1 }} >
                                                    {payrollList.lname}{", "}
                                                    {payrollList.fname}{" "}
                                                    {payrollList.mname ? payrollList.mname[0] + "." : ""}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.sss_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.sss_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.phil_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.phil_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.pbg_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.pbg_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.insure_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.insure_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.incentives?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.allowance?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {payrollList?.tax?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(payrollList.todate))}
                                            </TableCell>
                                        </TableRow>
                                    ) : null;
                                })}
                            {emptyRows > 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={payrollRecord.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ '.MuiTablePagination-selectLabel': { paddingTop: '18px' }, '.MuiTablePagination-displayedRows': { paddingTop: '18px' } }}
            />
        </div>
    )
}

export default BenefitHistory
