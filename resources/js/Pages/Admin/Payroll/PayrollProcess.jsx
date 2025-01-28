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

import PayrollProcessFilter from './Modals/PayrollProcessFilter';

const PayrollProcess = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(false);

    const [openPayrollProcessFilterModal, setOpenPayrollProcessFilterModal] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedCutOff, setSelectedCutOff] = useState('');

    const getProcessedPayroll = (data) => {
        console.log("Processed Payroll Data:", data);
    
        // Example usage:
        const { startDate, endDate, selectedBranches, selectedDepartments, selectedCutOff } = data;
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);
        console.log("Selected Branches:", selectedBranches);
        console.log("Selected Departments:", selectedDepartments);
        console.log("Selected Cut-Off:", selectedCutOff);
    };
    
    const handleOpenPayrollProcessFilterModal = () => {
        setOpenPayrollProcessFilterModal(true);
    }

    const handleClosePayrollProcessFilterModal = () => {
        setOpenPayrollProcessFilterModal(false);
    }

    return (
        <Layout title={"PayrollProcess"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Process Payroll </Typography>
                        
                        <Button variant="contained" color="primary" onClick={handleOpenPayrollProcessFilterModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Process </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
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
                                                <TableCell align="center">Payroll Date</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {/* {employees.map((employee) => (
                                                <TableRow
                                                    key={employee.id}
                                                    component={Link}
                                                    to={`/admin/employee/${employee.user_name}`}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    <TableCell align="left"> {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </TableCell>
                                                    <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                    <TableCell align="center">{employee.department || '-'}</TableCell>
                                                    <TableCell align="center">{employee.role || '-'}</TableCell>
                                                    <TableCell align="center">{employee.employment_type || '-'}</TableCell>
                                                    <TableCell align="center">{employee.employment_status || '-'}</TableCell>
                                                </TableRow>
                                            ))} */}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>

                {openPayrollProcessFilterModal &&
                    <PayrollProcessFilter 
                        open={openPayrollProcessFilterModal}
                        close={handleClosePayrollProcessFilterModal}
                        onUpdateProcessedPayroll={getProcessedPayroll}
                        currentStartDate={startDate}
                        currentEndDate={endDate}
                        currentSelectedBranches={selectedBranches}
                        currentSelectedDepartments={selectedDepartments}
                        currentSelectedCutOff={selectedCutOff}
                    />
                }

            </Box>
        </Layout >
    )
}

export default PayrollProcess
