import React, {  useState, useEffect } from 'react'
import { Box, Button, Typography, FormGroup, TextField, FormControl, Menu, MenuItem, InputLabel } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Padding } from '@mui/icons-material';

const WorkshiftAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

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

    const [overTimeIn, setOverTimeIn] = useState(null);
    const [overTimeOut, setOverTimeOut] = useState(null);

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
    };

    const handleSplitSecondTimeInChange = (newValue) => {
        setSplitSecondTimeIn(newValue);
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

        if ( regularTimeIn === null || regularTimeOut === null || overTimeIn === null || overTimeOut === null ) {
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
            regularTimeIn: regularTimeIn,
            regularTimeOut: regularTimeOut,
            overTimeIn: overTimeIn,
            overTimeOut: overTimeOut,
        };

        axiosInstance.post('/workshifts/saveRegularWorkShift', data, { headers })
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
                        navigate(`/admin/workhours`);
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
            splitFirstTimeIn: splitFirstTimeIn,
            splitFirstTimeOut: splitFirstTimeOut,

            secondLabel: secondLabel,
            splitSecondTimeIn: splitSecondTimeIn,
            splitSecondTimeOut: splitSecondTimeOut,

            overTimeIn: overTimeIn,
            overTimeOut: overTimeOut,
        };

        axiosInstance.post('/workshifts/saveSplitWorkShift', data, { headers })
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
                        navigate(`/admin/workhours`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"AddWorkShift"}>
            <Box sx={{ mx: 10, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}>Add Work Shift</Typography>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                />
                            </FormControl>

                           <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    required
                                    id="shiftType"
                                    label="Shift Type"
                                    value={shiftType}
                                    onChange={(event) => handleShiftTypeChange(event.target.value)}
                                >
                                    <MenuItem key="regular" value="regular"> Regular Hours </MenuItem>
                                    <MenuItem key="split" value="split"> Split Hours </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        {shiftType === 'regular' && (
                            <>
                                <Typography>Attendance</Typography>
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': {color: '#97a5ba'},
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                    },
                                }}>
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeIn}
                                                    onChange={handleRegularTimeInChange}
                                                    slotProps={{ textField: { error: regularTimeInError, required: true } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeOut}
                                                    onChange={handleRegularTimeOutChange}
                                                    slotProps={{ textField: { error: regularTimeOutError, required: true } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': {color: '#97a5ba'},
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                    },
                                }}>
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeIn}
                                                    onChange={handleOverTimeInChange}
                                                    slotProps={{ textField: { error: overTimeInError, required: true } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeOut}
                                                    onChange={handleOverTimeOutChange}
                                                    slotProps={{ textField: { error: overTimeOutError, required: true } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <div className="d-flex justify-content-center" id="buttons" style={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i>Submit</p>
                                    </Button>
                                </div>
                            </>
                        )}

                        {shiftType === 'split' && (
                            <>
                                <Typography>Attendance</Typography>
                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': {color: '#97a5ba'},
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                    },
                                }}>
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={splitFirstTimeIn}
                                                    onChange={handleSplitFirstTimeInChange}
                                                    slotProps={{ textField: { error: splitFirstTimeInError } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={splitFirstTimeOut}
                                                    onChange={handleSplitFirstTimeOutChange}
                                                    slotProps={{ textField: { error: splitFirstTimeOutError } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': {color: '#97a5ba'},
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                    },
                                }}>
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={splitSecondTimeIn}
                                                    onChange={handleSplitSecondTimeInChange}
                                                    slotProps={{ textField: { error: splitSecondTimeInError } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={splitSecondTimeOut}
                                                    onChange={handleSplitSecondTimeOutChange}
                                                    slotProps={{ textField: { error: splitSecondTimeOutError } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                    '& label.Mui-focused': {color: '#97a5ba'},
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                    },
                                }}>
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeIn}
                                                    onChange={handleOverTimeInChange}
                                                    slotProps={{ textField: { error: overTimeInError, required: true } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeOut}
                                                    onChange={handleOverTimeOutChange}
                                                    slotProps={{ textField: { error: overTimeOutError, required: true } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <div className="d-flex justify-content-center" id="buttons" style={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i>Submit</p>
                                    </Button>
                                </div>
                            </>
                        )}

                    </Box>
                </div> 

            </Box>
        </Layout >
    )
}

export default WorkshiftAdd