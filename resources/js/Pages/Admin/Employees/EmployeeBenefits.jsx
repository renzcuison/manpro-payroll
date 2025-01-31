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

import BenefitAdd from './Modals/BenefitAdd';

const EmployeeBenefits = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(false);
    const [dataUpdated, setDataUpdated] = useState(false);

    const [openAddBenefitModal, setOpenAddBenefitModal] = useState(false);

    const [benefits, setBenefits] = useState([]);

    const handleOpenAddBenefitModal = () => {
        setOpenAddBenefitModal(true);
    }

    const handleCloseAddBenefitModal = () => {
        setOpenAddBenefitModal(false);
    }

    return (
        <Layout title={"PayrollProcess"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Benefits </Typography>
                        
                        <Button variant="contained" color="primary" onClick={handleOpenAddBenefitModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
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
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Employee Share</TableCell>
                                                <TableCell align="center">Employer Share</TableCell>
                                                <TableCell align="center">Date Added</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {/* {payrolls.map((payroll) => (
                                                <TableRow key={payroll.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                                    <TableCell align="center"></TableCell>
                                                    <TableCell align="left">{payroll.employeeName}</TableCell>
                                                    <TableCell align="center">{payroll.employeeBranch}</TableCell>
                                                    <TableCell align="center">{payroll.employeeDepartment}</TableCell>
                                                    <TableCell align="center">{payroll.role}</TableCell>
                                                    <TableCell align="center">{payroll.payrollDates}</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            ))} */}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>

                {openAddBenefitModal &&
                    <BenefitAdd open={openAddBenefitModal} close={handleCloseAddBenefitModal} />
                }

            </Box>
        </Layout >
    )
}

export default EmployeeBenefits
