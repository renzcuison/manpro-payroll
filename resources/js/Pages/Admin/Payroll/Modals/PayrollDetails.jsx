import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Checkbox,
    istItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

import HomeLogo from '../../../../../images/ManPro.png'

const PayrollDetails = ({ open, close, selectedPayroll, currentStartDate, currentEndDate }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [payroll, setPayroll] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [summaries, setSummaries] = useState([]);

    const [paidLeaves, setPaidLeaves] = useState([]);
    const [unpaidLeaves, setUnpaidLeaves] = useState([]);

    const [earnings, setEarnings] = useState([]);
    const [deductions, setDeductions] = useState([]);

    useEffect(() => {

        // console.log("================================");
        // console.log("selectedPayroll    : " + selectedPayroll);
        // console.log("currentStartDate   : " + currentStartDate);
        // console.log("currentEndDate     : " + currentEndDate);

        const data = {
            selectedPayroll: selectedPayroll,
            currentStartDate: currentStartDate,
            currentEndDate: currentEndDate,
        };

        axiosInstance.get(`/payroll/payrollDetails`, { params: data, headers })
            .then((response) => {
                setPayroll(response.data.payroll);
                setBenefits(response.data.benefits);
                setSummaries(response.data.summaries);

                setPaidLeaves(response.data.paid_leaves);
                setUnpaidLeaves(response.data.unpaid_leaves);

                setEarnings(response.data.earnings);
                setDeductions(response.data.deductions);

                getEmployeeData(response.data.payroll.employeeId);
            })
            .catch((error) => {
                console.error('Error fetching payroll details:', error);
            });

    }, []);

    const getEmployeeData = (employeeId) => {
        const data = { username: employeeId };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setEmployee(response.data.employee);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    };

    const checkInput = (event) => {
        event.preventDefault();
    
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to save this payslip?",
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
    
        const data = {
            selectedPayroll: selectedPayroll,
            currentStartDate: currentStartDate,
            currentEndDate: currentEndDate,
        };
    
        console.log(data);
    
        axiosInstance.post('/payroll/savePayroll', data, { headers })
            .then(response => {
                console.log("Payroll saved successfully!", response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
    
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '1200px', maxWidth: '1500px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Employee Payslip </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 5, pb: 5 }}>
                    <Box component="form" sx={{ mt: 3, py: 6, bgcolor: '#ffffff' }} noValidate autoComplete="off" encType="multipart/form-data">

                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 1 }}>
                            <Box component="div" sx={{ backgroundImage: `url(${HomeLogo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', height: 105, width: 300 }} />
                            <Typography sx={{ marginTop: '5px' }}> Online Payslip </Typography>
                            <Typography sx={{ marginTop: '5px' }}> Pay Period: {formatDate(payroll.startDate)} - {formatDate(payroll.endDate)}</Typography>
                        </Box>

                        <Grid container spacing={4} sx={{ px: 8 }}>
                            <Grid item xs={6}>
                                <TableContainer sx={{ mt: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="left">Employee Name</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="left"> {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="left">Role</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="left"> {employee.role} </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="left">Department</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="left"> {employee.department} </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={6}>
                                <TableContainer sx={{ mt: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="left">Employment Type</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="left"> {employee.employment_type} </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="left">Title</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="left"> {employee.jobTitle} </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="left">Branch</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="left"> {employee.branch} </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>

                        <Grid container spacing={4} sx={{ px: 8 }}>
                            <Grid item xs={4}>
                                <TableContainer sx={{ mt: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center">Monthly Rate</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {payroll ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(payroll.perMonth) : "0"} </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={4}>
                                <TableContainer sx={{ mt: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center">Daily Rate</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {payroll ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(payroll.perDay) : "0"} </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={4}>
                                <TableContainer sx={{ mt: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center">Hourly Rate</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {payroll ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(payroll.perHour) : "0"} </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>

                        <Grid container spacing={4} sx={{ px: 8 }}>
                            <Grid item xs={4}>
                                <TableContainer sx={{ my: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center" colSpan={2}>Earnings</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {earnings.map((earning) => (
                                                <TableRow key={earning.name}>
                                                    <TableCell sx={{ border: '1px solid #ccc' }}>{earning.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {earnings ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(earning.amount) : "Loading..."}</TableCell>
                                                </TableRow>
                                            ))}

                                            {paidLeaves.map((paidLeave) => (
                                                <TableRow key={paidLeave.name}>
                                                    <TableCell sx={{ border: '1px solid #ccc' }}>{paidLeave.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {paidLeaves ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(paidLeave.amount) : "Loading..."}</TableCell>
                                                </TableRow>
                                            ))}

                                            {unpaidLeaves.map((unpaidLeave) => (
                                                <TableRow key={unpaidLeave.name}>
                                                    <TableCell sx={{ border: '1px solid #ccc' }}>{unpaidLeave.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right"> -{unpaidLeaves ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(unpaidLeave.amount) : "Loading..."}</TableCell>
                                                </TableRow>
                                            ))}

                                            {deductions.map((deduction) => (
                                                <TableRow key={deduction.name}>
                                                    <TableCell sx={{ border: '1px solid #ccc' }}>{deduction.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right">
                                                        {deductions
                                                            ? deduction.amount === 0
                                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(deduction.amount)
                                                                : `-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Math.abs(deduction.amount))}`
                                                            : "Loading..."
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}


                                            {/* <TableRow> */}
                                                {/* <TableCell sx={{ border: '1px solid #ccc' }}>Dispute</TableCell> */}
                                                {/* <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0)} </TableCell> */}
                                            {/* </TableRow> */}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={4}>
                                <TableContainer sx={{ my: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center" colSpan={2}>Employer Share</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {benefits.map((benefit) => (
                                                <TableRow key={benefit.name}>
                                                    <TableCell sx={{ border: '1px solid #ccc' }}>{benefit.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {benefits ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(benefit.employerAmount) : "Loading..."}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TableContainer sx={{ my: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center" colSpan={2}>Loans</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ border: '1px solid #ccc' }}>Balance</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0)} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ border: '1px solid #ccc' }}>Payment</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0)} </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ border: '1px solid #ccc' }}>Remaining</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0)} </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={4}>
                                <TableContainer sx={{ my: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center" colSpan={2}>Employee Contribution</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {benefits.map((benefit) => (
                                                <TableRow key={benefit.name}>
                                                    <TableCell sx={{ border: '1px solid #ccc' }}>{benefit.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {benefits ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(benefit.employeeAmount) : "Loading..."}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TableContainer sx={{ my: 4, border: '1px solid #ccc' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center" colSpan={2}>Tax</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ border: '1px solid #ccc' }}>Tax</TableCell>
                                                <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0)} </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>

                        <Grid container spacing={4} sx={{ px: 8 }}>
                            {summaries.map((summary) => (
                                <Grid item xs={4} key={summary.name}>
                                    <TableContainer sx={{ mb: 4, border: '1px solid #ccc' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                                    <TableCell sx={{ border: '1px solid #ccc', fontWeight: 'bold' }} align="center">{summary.name}</TableCell>
                                                    <TableCell sx={{ border: '1px solid #ccc' }} align="right"> {summaries ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(summary.amount) : "Loading..."}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={checkInput}>
                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save </p>
                        </Button>
                    </Box>

                </DialogContent>
            </Dialog >
        </>
    )
}

export default PayrollDetails;