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
        id: "Name",
        label: "Name",
        sortable: true,
    },
    {
        id: "Covered Date",
        label: "Covered Date",
        sortable: true,
    },
    {
        id: "Cutoff Type",
        label: "Cutoff Type",
        sortable: true,
    },
    {
        id: "Gross Pay",
        label: "Gross Pay",
        sortable: true,
    },
    {
        id: "Total Deduction",
        label: "Total Deduction",
        sortable: true,
    },
    {
        id: "Net Pay",
        label: "Net Pay",
        sortable: true,
    },
];

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20))
        .fill("")
        .map((v, idx) => now - idx);
};

const PayrollHistory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const empID = searchParams.get("employeeID");
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [filterEmployee, setFilterEmployee] = useState([]);
    const contentToPrint = useRef();
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
            filter: 'PayrollHistory',
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
                filter: 'PayrollHistory',
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
        let dates = [];
        dates = [month_val, year_val];
        await axiosInstance
            .get(`/getEmployeePayroll-reports/${empID}/${dates.join(",")}`, { headers })
            .then((response) => {
                setEmployeeDetails(response.data.employee);
                setFilterEmployee(response.data.employee);
            });
    };

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - employeeDetails.length) : 0;

    const handleFilter = (event) => {
        const filtered = employeeDetails.filter((employee) =>
            `${employee?.lname} ${employee?.fname} ${employee?.mname}`
                .toLocaleLowerCase()
                .includes(event.target.value.toLocaleLowerCase())
        );
        if (event.target.value != "") {
            setEmployeeDetails(filtered);
        } else {
            setEmployeeDetails(filterEmployee);
        }
    };

    const handleToPrint = useReactToPrint({
        content: () => {
            const combinedContent = document.createElement("div");
            const logoImage = document.createElement("img");

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
        documentTitle: "Employee_Payroll_History_Data",
        onAfterPrint: () => {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Success!",
                text: "Successfully Printed!",
                icon: "success",
                timer: 1000,
                showConfirmButton: false,
            });
        },
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
                        <button type="button" className="printBtn btn btn-warning btn-md mr-2" onClick={handleToPrint} > Print </button>
                    </Grid>
                </Grid>
            </Grid>

            <Box component="div" className="payroll_details px-2" ref={contentToPrint} sx={{ "@media print": { "@page": { size: "12in 11in" }} }} >
                <Grid container alignItems="center" justifyContent="space-between" >
                    <div className="d-flex justify-content-lg-between">
                        <h5>Payroll History</h5>
                    </div>
                </Grid>

                <TableContainer>
                    <Table className="table table-md  table-striped  table-bordered">
                        <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />

                        <TableBody>
                            {stableSort( employeeDetails, getComparator(order, orderBy) )
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map((emp, index) => {
                                    return (
                                        <TableRow key={index} hover role="checkbox" tabIndex={-1} >
                                            <TableCell>
                                                {emp.lname + ","}{" "}
                                                {emp.fname}{" "}
                                                {emp.mname ? emp.mname[0] + "." : ""}
                                            </TableCell>
                                            <TableCell>
                                                {moment( emp.payroll_fromdate ).format( "MMM. D, YYYY" )}
                                                {" "} TO {" "}
                                                {moment(emp.payroll_todate).format("MMM. D, YYYY")}
                                            </TableCell>
                                            <TableCell>
                                                {emp.payroll_cutoff === 1 ? "First" : "Second"}
                                            </TableCell>
                                            <TableCell>
                                                Php {emp.total_earnings}
                                            </TableCell>
                                            <TableCell>
                                                Php{" "} {emp.total_deduction}
                                            </TableCell>
                                            <TableCell>
                                                Php {emp.net_pay}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }} >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={employeeDetails.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ ".MuiTablePagination-selectLabel": { paddingTop: "18px" }, ".MuiTablePagination-displayedRows": { paddingTop: "18px" } }}
            />
        </div>
    );
};

export default PayrollHistory;
