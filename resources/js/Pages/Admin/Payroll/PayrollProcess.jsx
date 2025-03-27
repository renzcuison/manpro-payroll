import React, { useState, useEffect } from 'react'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material'
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

import PayrollDetails from './Modals/PayrollDetails';
import PayrollProcessFilter from './Modals/PayrollProcessFilter';

const PayrollProcess = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(false);
    const [dataUpdated, setDataUpdated] = useState(false);

    const [openPayrollDetailsModal, setOpenPayrollDetailsModal] = useState(false);
    const [openPayrollProcessFilterModal, setOpenPayrollProcessFilterModal] = useState(false);

    const [payrolls, setPayrolls] = useState([]);
    const [selectedPayrolls, setSelectedPayrolls] = useState([]);
    const [selectedPayroll, setSelectedPayroll] = useState('');

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [cutOff, setCutOff] = useState('');

    const getFilter = (data) => {
        const { selectedStartDate, selectedEndDate, selectedBranches, selectedDepartments, selectedCutOff } = data;

        setStartDate(selectedStartDate);
        setEndDate(selectedEndDate);
        setBranches(selectedBranches);
        setDepartments(selectedDepartments);
        setCutOff(selectedCutOff);

        setDataUpdated(true);

        setOpenPayrollProcessFilterModal(false);
    };

    useEffect(() => {
        if (dataUpdated) {
            getProcessedPayroll();
            setDataUpdated(false);
        }
    }, [startDate, endDate, branches, departments, cutOff, dataUpdated]);

    const formattedStartDate = dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const formattedEndDate = dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const getProcessedPayroll = () => {
        console.log("\n");
        console.log("getProcessedPayroll()");

        console.log("Start Date:", formattedStartDate);
        console.log("End Date:", formattedEndDate);
        console.log("Selected Branches:", branches);
        console.log("Selected Departments:", departments);
        console.log("Selected Cut-Off:", cutOff);

        setIsLoading(true);

        const data = {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            branches: branches,
            departments: departments,
            cutOff: cutOff,
        };

        axiosInstance.get(`/payroll/payrollProcess`, { params: data, headers })
            .then((response) => {
                console.log(response);
                setPayrolls(response.data.payrolls);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching payroll calculations:', error);
            });
    };

    
    const checkInput = (event) => {
        event.preventDefault();

        console.log("selectedPayrolls");
        console.log(selectedPayrolls);

        console.log("formattedStartDate");
        console.log(formattedStartDate);

        console.log("formattedEndDate");
        console.log(formattedEndDate);
    
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to save this payrolls?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput(event); 
            }
        });
    };

    const saveInput = (event) => {
        event.preventDefault();
    
        const data = { selectedPayrolls: selectedPayrolls, currentStartDate: formattedStartDate, currentEndDate: formattedEndDate };
    
        Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Saving Payslips...",
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    
        axiosInstance.post('/payroll/savePayrolls', data, { headers })
            .then(response => {
                console.log("Payrolls saved successfully!");
    
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Payrolls saved successfully!",
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                });
            })
            .catch(error => {
                console.error('Error:', error);
    
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Failed to save payrolls. Please try again.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                });
            });
    };
    

    const handleOpenPayrollDetailsModal = (id) => {
        // console.log("Payroll ID:", id)
        // console.log("Start Date:", startDate)
        // console.log("End Date:", endDate)
        // console.log("Cut Off:", cutOff)

        setSelectedPayroll(id);
        setOpenPayrollDetailsModal(true);
    }

    const handleClosePayrollDetailsModal = () => {
        setOpenPayrollDetailsModal(false);
    }

    const handleOpenPayrollProcessFilterModal = () => {
        setOpenPayrollProcessFilterModal(true);
    }

    const handleClosePayrollProcessFilterModal = () => {
        setOpenPayrollProcessFilterModal(false);
    }

    return (
        <Layout title={"PayrollProcess"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Process Payroll </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenPayrollProcessFilterModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Process </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Select</TableCell>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Date</TableCell>
                                                <TableCell align="center">Gross Pay</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {payrolls.length > 0 ? (
                                                payrolls.map((payroll) => {
                                                    const isSelected = selectedPayrolls.includes(payroll.id);

                                                    return (
                                                        <TableRow key={payroll.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { cursor: 'pointer' } }} >
                                                            <TableCell align="center">
                                                                <Checkbox 
                                                                    checked={isSelected}
                                                                    onChange={(event) => {
                                                                        if (event.target.checked) {
                                                                            setSelectedPayrolls((prev) => [...prev, payroll.id]);
                                                                        } else {
                                                                            setSelectedPayrolls((prev) => prev.filter(id => id !== payroll.id));
                                                                        }
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell onClick={() => handleOpenPayrollDetailsModal(payroll.id)} align="left">{payroll.employeeName}</TableCell>
                                                            <TableCell onClick={() => handleOpenPayrollDetailsModal(payroll.id)} align="center">{payroll.employeeBranch}</TableCell>
                                                            <TableCell onClick={() => handleOpenPayrollDetailsModal(payroll.id)} align="center">{payroll.employeeDepartment}</TableCell>
                                                            <TableCell onClick={() => handleOpenPayrollDetailsModal(payroll.id)} align="center">{payroll.role}</TableCell>
                                                            <TableCell onClick={() => handleOpenPayrollDetailsModal(payroll.id)} align="center">{payroll.payrollDates}</TableCell>
                                                            <TableCell onClick={() => handleOpenPayrollDetailsModal(payroll.id)} align="center">{payroll.grossPay}</TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell align="center" colSpan={7} sx={{ color: "text.secondary", p: 1 }}>No Payroll to Process</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    
                        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={checkInput}>
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save </p>
                            </Button>
                        </Box>

                    </Box>
                </Box>

                {openPayrollProcessFilterModal &&
                    <PayrollProcessFilter
                        open={openPayrollProcessFilterModal}
                        close={handleClosePayrollProcessFilterModal}
                        passFilter={getFilter}
                        currentStartDate={startDate}
                        currentEndDate={endDate}
                        currentSelectedBranches={branches}
                        currentSelectedDepartments={departments}
                        currentSelectedCutOff={cutOff}
                    />
                }

                {openPayrollDetailsModal &&
                    <PayrollDetails
                        open={openPayrollDetailsModal}
                        close={handleClosePayrollDetailsModal}
                        selectedPayroll={selectedPayroll}
                        currentStartDate={formattedStartDate}
                        currentEndDate={formattedEndDate}
                    />
                }

            </Box>
        </Layout >
    )
}

export default PayrollProcess
