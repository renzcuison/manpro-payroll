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

    useEffect(() => {

        console.log("================================");
        console.log("selectedPayroll    : " + selectedPayroll);
        console.log("currentStartDate   : " + currentStartDate);
        console.log("currentEndDate     : " + currentEndDate);

        const data = {
            selectedPayroll: selectedPayroll,
            currentStartDate: currentStartDate,
            currentEndDate: currentEndDate,
        };

        axiosInstance.get(`/payroll/payrollDetails`, { params: data, headers })
            .then((response) => {
                console.log(response);
                setPayroll(response.data.payroll);
            })
            .catch((error) => {
                console.error('Error fetching payroll details:', error);
            });

    }, []);

    const checkInput = (event) => {
        event.preventDefault();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '1200px', maxWidth: '1500px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Employee Payslip </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">

                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginTop: '20px' }}>
                            <Box component="div"sx={{backgroundImage: `url(${HomeLogo})`,backgroundSize: 'contain',backgroundRepeat: 'no-repeat',backgroundPosition: 'center', height: 105, width: 300}} />
                            <Typography sx={{ marginTop: '5px', marginBottom: '20px' }}> Online Payslip </Typography>
                            <Typography sx={{ marginTop: '5px', marginBottom: '20px' }}> Pay Period: {formatDate(payroll.startDate)} - {formatDate(payroll.endDate)}</Typography>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                <TableRow>
                                    <TableCell>Dessert (100g serving)</TableCell>
                                    <TableCell align="right">Calories</TableCell>
                                    <TableCell align="right">Fat&nbsp;(g)</TableCell>
                                    <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                                    <TableCell align="right">Protein&nbsp;(g)</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {/* {rows.map((row) => (
                                    <TableRow
                                    key={row.name}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="right">{row.calories}</TableCell>
                                    <TableCell align="right">{row.fat}</TableCell>
                                    <TableCell align="right">{row.carbs}</TableCell>
                                    <TableCell align="right">{row.protein}</TableCell>
                                    </TableRow>
                                ))} */}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default PayrollDetails;