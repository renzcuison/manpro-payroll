import React, {  useState, useEffect } from 'react'
import { Box, Button, Typography, FormGroup, TextField, FormControl, Menu, MenuItem,  CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Padding } from '@mui/icons-material';

const WorkshiftView = () => {
    const { user } = useUser();
    const { client, selectedShift } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);

    const [shiftNameError, setShiftNameError] = useState(false);
    const [firstLabelError, setFirstLabelError] = useState(false);
    const [secondLabelError, setSecondLabelError] = useState(false);
    const [regularTimeInError, setRegularTimeInError] = useState(false);
    const [regularTimeOutError, setRegularTimeOutError] = useState(false);
    const [splitFirstTimeInError, setSplitFirstTimeInError] = useState(false);
    const [splitFirstTimeOutError, setSplitFirstTimeOutError] = useState(false);
    const [splitSecondTimeInError, setSplitSecondTimeInError] = useState(false);
    const [splitSecondTimeOutError, setSplitSecondTimeOutError] = useState(false);

    const [overTimeInError, setOverTimeInError] = useState(false);
    const [overTimeOutError, setOverTimeOutError] = useState(false);
    const [breakStartError, setBreakStartError] = useState(false);
    const [breakEndError, setBreakEndError] = useState(false);

    const [shiftName, setShiftName] = useState('');
    const [shiftType, setShiftType] = useState('');

    const [firstLabel, setFirstLabel] = useState('');
    const [secondLabel, setSecondLabel] = useState('');

    const [regularTimeIn, setRegularTimeIn] = useState(null);
    const [regularTimeOut, setRegularTimeOut] = useState(null);

    const [splitFirstTimeIn, setSplitFirstTimeIn] = useState(null);
    const [splitFirstTimeOut, setSplitFirstTimeOut] = useState(null);
    const [splitSecondTimeIn, setSplitSecondTimeIn] = useState(null);
    const [splitSecondTimeOut, setSplitSecondTimeOut] = useState(null);

    const [breakStart, setBreakStart] = useState(null);
    const [breakEnd, setBreakEnd] = useState(null);
    
    const [overTimeIn, setOverTimeIn] = useState(null);
    const [overTimeOut, setOverTimeOut] = useState(null);

    const [isEdit, setIsEdit] = useState(false);

    const handleRegularTimeInChange = (newValue) => {
        setRegularTimeIn(newValue);
    };

    const handleRegularTimeOutChange = (newValue) => {
        setRegularTimeOut(newValue);
    };

    const handleSplitFirstTimeInChange = (newValue) => {
        setSplitFirstTimeIn(newValue);
    };

    const handleSplitFirstTimeOutChange = (newValue) => {
        setSplitFirstTimeOut(newValue);

        if (shiftType == "split" ) {
            handleBreakStartChange(newValue);
        }
    };

    const handleSplitSecondTimeInChange = (newValue) => {
        setSplitSecondTimeIn(newValue);

        if (shiftType == "split" ) {
            handleBreakEndChange(newValue);
        }
    };

    const handleSplitSecondTimeOutChange = (newValue) => {
        setSplitSecondTimeOut(newValue);
    };

    const handleOverTimeInChange = (newValue) => {
        setOverTimeIn(newValue);
    };

    const handleOverTimeOutChange = (newValue) => {
        setOverTimeOut(newValue);
    };

    const handleBreakStartChange = (newValue) => {
        setBreakStart(newValue);
    };

    const handleBreakEndChange = (newValue) => {
        setBreakEnd(newValue);
    };

    const handleShiftTypeChange = (newValue) => {
        
        setFirstLabelError(false);
        setSecondLabelError(false);

        setRegularTimeInError(false);
        setRegularTimeOutError(false);

        setSplitFirstTimeInError(false);
        setSplitFirstTimeOutError(false);
        setSplitSecondTimeInError(false);
        setSplitSecondTimeOutError(false);

        setFirstLabel('');
        setSecondLabel('');

        setRegularTimeIn(null);
        setRegularTimeOut(null);
        
        setSplitFirstTimeIn(null);
        setSplitFirstTimeOut(null);
        setSplitSecondTimeIn(null);
        setSplitSecondTimeOut(null);

        setBreakStart(null);
        setBreakEnd(null);

        setOverTimeIn(null);
        setOverTimeOut(null);

        setShiftType(newValue);
    };

    const checkInput = (event) => {
        event.preventDefault();

        if (!shiftName) {
            setShiftNameError(true);
        } else {
            setShiftNameError(false);
        }

        if (overTimeIn === null) {
            setOverTimeInError(true);
        } else {
            setOverTimeInError(false);
        }

        if (overTimeOut === null) {
            setOverTimeOutError(true);
        } else {
            setOverTimeOutError(false);
        }

        if ( shiftType == 'regular' ) {
            checkInputRegular(event);
        }

        if ( shiftType == 'split' ) {
            checkInputSplit(event);
        }
    };

    const checkInputRegular = (event) => {
        event.preventDefault();

        if (regularTimeIn === null) {
            setRegularTimeInError(true);
        } else {
            setRegularTimeInError(false);
        }
    
        if (regularTimeOut === null) {
            setRegularTimeOutError(true);
        } else {
            setRegularTimeOutError(false);
        }

        if (breakStart === null) {
            setBreakStartError(true);
        } else {
            setBreakStartError(false);
        }
    
        if (breakEnd === null) {
            setBreakEndError(true);
        } else {
            setBreakEndError(false);
        }

        if (overTimeIn === null) {
            setOverTimeInError(true);
        } else {
            setOverTimeInError(false);
        }

        if (overTimeOut === null) {
            setOverTimeOutError(true);
        } else {
            setOverTimeOutError(false);
        }

        if ( regularTimeIn === null || regularTimeOut === null || breakStart === null || breakEnd === null || overTimeIn === null || overTimeOut === null ) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this work shift?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInputRegular(event);
                }
            });
        }
    };

    const checkInputSplit = (event) => {
        event.preventDefault();

        if (!firstLabel) {
            setFirstLabelError(true);
        } else {
            setFirstLabelError(false);
        }

        if (!secondLabel) {
            setSecondLabelError(true);
        } else {
            setSecondLabelError(false);
        }

        if (splitFirstTimeIn === null) {
            setSplitFirstTimeInError(true);
        } else {
            setSplitFirstTimeInError(false);
        }
    
        if (splitFirstTimeOut === null) {
            setSplitFirstTimeOutError(true);
        } else {
            setSplitFirstTimeOutError(false);
        }

        if (splitSecondTimeIn === null) {
            setSplitSecondTimeInError(true);
        } else {
            setSplitSecondTimeInError(false);
        }
    
        if (splitSecondTimeOut === null) {
            setSplitSecondTimeOutError(true);
        } else {
            setSplitSecondTimeOutError(false);
        }

        if ( !firstLabel || !secondLabel || splitFirstTimeIn === null || splitFirstTimeOut === null || splitSecondTimeIn === null || splitSecondTimeOut === null ) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this work shift?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInputSplit(event);
                }
            });
        }
    };

    const saveInputRegular = (event) => {
        event.preventDefault();

        const data = {
            shiftName: shiftName,
            shiftType: shiftType,

            firstLabel: "Attendance",
            firstTimeIn: regularTimeIn.format('HH:mm:ss'),
            firstTimeOut: regularTimeOut.format('HH:mm:ss'),

            breakStart: breakStart.format('HH:mm:ss'),
            breakEnd: breakEnd.format('HH:mm:ss'),

            overTimeIn: overTimeIn.format('HH:mm:ss'),
            overTimeOut: overTimeOut.format('HH:mm:ss'),
        };

        axiosInstance.post('/workshedule/saveRegularWorkShift', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Work Shift saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/admin/workshift/${response.data.link}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const saveInputSplit = (event) => {
        event.preventDefault();

        const data = {
            shiftName: shiftName,
            shiftType: shiftType,

            firstLabel: firstLabel,
            firstTimeIn: splitFirstTimeIn.format('HH:mm:ss'),
            firstTimeOut: splitFirstTimeOut.format('HH:mm:ss'),

            secondLabel: secondLabel,
            secondTimeIn: splitSecondTimeIn.format('HH:mm:ss'),
            secondTimeOut: splitSecondTimeOut.format('HH:mm:ss'),

            breakStart: breakStart.format('HH:mm:ss'),
            breakEnd: breakEnd.format('HH:mm:ss'),

            overTimeIn: overTimeIn.format('HH:mm:ss'),
            overTimeOut: overTimeOut.format('HH:mm:ss'),
        };

        axiosInstance.post('/workshedule/saveSplitWorkShift', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Work Shift saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/admin/workshift/${response.data.link}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    useEffect(() => {
        // const data = { client, selectedShift };
        const data = { client, selectedShift };
        
        axiosInstance.get(`/workshedule/getWorkShiftDetails`, { params: data, headers })
            .then((response) => {

                setShiftName(response.data.workShift.name);
                
                console.log("over time in: ", response.data.workHours.shift_type);

                if ( response.data.workShift.shift_type == 'Regular') {
                    setShiftType("regular");
                } else {
                    setShiftType("split");
                    setFirstLabel(response.data.workShift.first_label);
                    setSecondLabel(response.data.workShift.second_label);

                    const firstTimeIn = dayjs(response.data.workHours.first_time_in, 'HH:mm:ss');
                    const firstTimeOut = dayjs(response.data.workHours.first_time_out, 'HH:mm:ss');
                    const secondTimeIn = dayjs(response.data.workHours.second_time_in, 'HH:mm:ss');
                    const secondTimeOut = dayjs(response.data.workHours.second_time_out, 'HH:mm:ss');

                    setSplitFirstTimeIn(firstTimeIn);
                    setSplitFirstTimeOut(firstTimeOut);
                    setSplitSecondTimeIn(secondTimeIn);
                    setSplitSecondTimeOut(secondTimeOut);
                }

                const overTimeIn = dayjs(response.data.workHours.over_time_in, 'HH:mm:ss');
                const overTimeOut = dayjs(response.data.workHours.over_time_out, 'HH:mm:ss');

                setOverTimeIn(overTimeIn);
                setOverTimeOut(overTimeOut);
                
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
            });
    }, []);

    return (
        <Layout title={"AddWorkShift"}>
            <Box sx={{ mx: 2, pt: 8, display: 'flex', justifyContent: 'center'}}>
                <Box component="form" sx={{px: 10, py: 7, mb: 6, width:'100%', maxWidth: '1000px',
                    backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', 
                    borderRadius: '20px', marginBottom: '5%', justifyContent:'center'}} onSubmit={checkInput} 
                    noValidate autoComplete="off" encType="multipart/form-data" 
                >
                    <Typography variant="h4" sx={{ mb: 10, fontWeight: 'bold' }}>View Work Shift</Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/*Shift name and type section*/}
                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                mb:1,
                                '& label.Mui-focused': {color: '#97a5ba'},
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                            }}>
                                <FormControl sx={{ marginBottom: 3, width: {lg:'50%', md:'100%', xs:'100%'},
                                 marginRight: {md:0, lg: 3},'& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                }}>
                                    <TextField
                                        required
                                        id="shiftName"
                                        label="Shift Name"
                                        variant="outlined"
                                        value={shiftName}
                                        error={shiftNameError}
                                        onChange={(e) => setShiftName(e.target.value)}
                                        InputProps={{ readOnly: true }}
                                    />
                                </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: {lg:'45.5%', md:'100%', xs:'100%'}, '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                }}>
                                    <TextField
                                        select
                                        required
                                        id="shiftType"
                                        label="Shift Type"
                                        value={shiftType}
                                        onChange={(event) => handleShiftTypeChange(event.target.value)}
                                        InputProps={{ readOnly: false }}
                                    >
                                        <MenuItem key="regular" value="regular"> Regular Hours </MenuItem>
                                        <MenuItem key="split" value="split"> Split Hours </MenuItem>
                                    </TextField>
                                </FormControl>
                            </FormGroup>

                            {/*shift type conditioning section */}
                            <Typography>Work Hours</Typography>
                            {shiftType === "regular" && (
                                <>
                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: '#97a5ba'},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <TextField
                                                required
                                                id="firstLabel"
                                                label="First Label"
                                                variant="outlined"
                                                value="Attendance"
                                                InputProps={{ readOnly: true }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '20%', alignSelf:'flex-end', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeIn}
                                                    onChange={handleRegularTimeInChange}
                                                    slotProps={{ textField: { error: regularTimeInError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '20%', alignSelf:'flex-end', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeOut}
                                                    onChange={handleRegularTimeOutChange}
                                                    slotProps={{ textField: { error: regularTimeOutError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>

                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: '#97a5ba'},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <TextField
                                                required
                                                id="breakTimeLabel"
                                                label="Break Time"
                                                variant="outlined"
                                                value="Break Time"
                                                InputProps={{ readOnly: true }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '20%', alignSelf:'flex-end',  '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Break Start"
                                                    views={['hours', 'minutes']}
                                                    value={breakStart}
                                                    onChange={handleBreakStartChange}
                                                    slotProps={{ textField: { error: breakStartError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '20%', alignSelf:'flex-end', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    requireds
                                                    label="Break End"
                                                    views={['hours', 'minutes']}
                                                    value={breakEnd}
                                                    onChange={handleBreakEndChange}
                                                    slotProps={{ textField: { error: breakEndError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>
                                </>
                            )}

                            {shiftType === "split" && (
                                <>           
                                    <FormGroup row={true} className="d-flex justify-content-between align-items-center" sx={{
                                        '& label.Mui-focused': {color: '#97a5ba'},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <TextField
                                                required
                                                id="firstLabel"
                                                label="First Label"
                                                variant="outlined"
                                                value={firstLabel}
                                                error={firstLabelError}
                                                onChange={(e) => setFirstLabel(e.target.value)}
                                                InputProps={{ readOnly: true }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end','& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={splitFirstTimeIn}
                                                    onChange={handleSplitFirstTimeInChange}
                                                    slotProps={{ textField: { error: splitFirstTimeInError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end','& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={splitFirstTimeOut}
                                                    onChange={handleSplitFirstTimeOutChange}
                                                    slotProps={{ textField: { error: splitFirstTimeOutError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>

                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: '#97a5ba'},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <TextField
                                                required
                                                id="secondLabel"
                                                label="Second Label"
                                                variant="outlined"
                                                value={secondLabel}
                                                error={secondLabelError}
                                                onChange={(e) => setSecondLabel(e.target.value)}
                                                InputProps={{ readOnly: true }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={splitSecondTimeIn}
                                                    onChange={handleSplitSecondTimeInChange}
                                                    slotProps={{ textField: { error: splitSecondTimeInError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={splitSecondTimeOut}
                                                    onChange={handleSplitSecondTimeOutChange}
                                                    slotProps={{ textField: { error: splitSecondTimeOutError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>
                                </>
                            )}

                            {shiftType && (
                                <>
                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: '#97a5ba'},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <TextField
                                                required
                                                id="overTimeLabel"
                                                label="Over Time"
                                                variant="outlined"
                                                value="Over Time"
                                                InputProps={{ readOnly: true }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end',  '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeIn}
                                                    onChange={handleOverTimeInChange}
                                                    slotProps={{ textField: { error: overTimeInError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeOut}
                                                    onChange={handleOverTimeOutChange}
                                                    slotProps={{ textField: { error: overTimeOutError, required: true, InputProps: { readOnly: true } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>

                                    {/* <div className="d-flex justify-content-center" id="buttons" style={{ marginTop: '20px' }}> */}
                                        {/* <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1"> */}
                                            {/* <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i>Save Shift</p> */}
                                        {/* </Button> */}
                                    {/* </div> */}
                                </>
                            )}

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Monday</TableCell>
                                            <TableCell>Tuesday</TableCell>
                                            <TableCell>Wednesday</TableCell>
                                            <TableCell>Thursday</TableCell>
                                            <TableCell>Friday</TableCell>
                                            <TableCell>Saturday</TableCell>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Box>
        </Layout >
    )
}

export default WorkshiftView