import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const AssignShift = ({ open, close, currentShift, workGroup, onUpdateWorkGroupDetails }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);

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

    const [workShifts, setWorkShifts] = useState([]);

    const [selectedShiftError, setSelectedShiftError] = useState(false);
    const [selectedShift, setSelectedShift] = useState("");

    useEffect(() => {
        axiosInstance.get(`/workshedule/getWorkShifts`, { headers })
            .then((response) => {
                if ( response.data.status === 200 ) {
                    setWorkShifts(response.data.workShifts);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });

        console.log("currentShift: " + currentShift);

        if (currentShift != "" ) {
            setSelectedShift(currentShift ? currentShift : "");
            getWorkShift(currentShift);
        }
    }, []);

    const handleSelectWorkShift = (shiftId) => {
        setSelectedShift(shiftId);
        const selectedWorkShift = workShifts.find(shift => shift.id === shiftId);
        getWorkShift(selectedWorkShift);
    };

    const getWorkShift = (selectedWorkShift) => {

        const data = { shift, selectedWorkShift };

        axiosInstance.get(`/workshedule/getWorkShiftDetails`, { params: data, headers })
            .then((response) => {

                setShiftName(response.data.workShift.name);

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
    }

    const checkInput = (event) => {
        event.preventDefault();

        console.log("checkInput");
        console.log(selectedShift);

        if (selectedShift === "") {
            setSelectedShiftError(true);
        } else {
            setSelectedShiftError(false);
        }

        if ( selectedShift === "" ) {
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
                text: "You want to assign this work shift?",
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
        }

    };

    const saveInput = (event) => {

        console.log(workShift);


        event.preventDefault();

        const data = { workGroup: workGroup.id, workShift: selectedShift };

        axiosInstance.post('/workshedule/saveWorkGroupShift', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    onUpdateWorkGroupDetails(onUpdateWorkGroupDetails);

                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Role saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const isAM = hours < 12;
        const formattedHours = hours % 12 || 12;
        const period = isAM ? 'AM' : 'PM';
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }  

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Assign Work Shift </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    id="workShift"
                                    label="Work Shift"
                                    error={selectedShiftError}
                                    value={selectedShift}
                                    onChange={(event) => handleSelectWorkShift(event.target.value)}
                                >
                                    {workShifts.map((shift) => (
                                        <MenuItem key={shift.id} value={shift.id}> {shift.name} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </FormGroup>


                        {selectedShift != "" && (
                            <>
                                {shiftType === "regular" && (
                                    <>
                                        <Typography>Work Hours</Typography>
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
                                                    InputProps={{ readOnly: true }}
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
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
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
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
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
                                                    id="breakTimeLabel"
                                                    label="Break Time"
                                                    variant="outlined"
                                                    value="Break Time"
                                                    InputProps={{ readOnly: true }}
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
                                                            label="Break Start"
                                                            views={['hours', 'minutes']}
                                                            value={breakStart}
                                                            slotProps={{ textField: { required: true, InputProps: { readOnly: true } } }}
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
                                                            requireds
                                                            label="Break End"
                                                            views={['hours', 'minutes']}
                                                            value={breakEnd}
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
                                                        />
                                                    </DemoContainer>
                                                </LocalizationProvider>
                                            </FormControl>
                                        </FormGroup>
                                    </>
                                )}

                                {shiftType === "split" && (
                                    <>
                                        <Typography>Work Hours</Typography>
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
                                                    id="firstLabel"
                                                    label="First Label"
                                                    variant="outlined"
                                                    value={firstLabel}
                                                    InputProps={{ readOnly: true }}
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
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
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
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
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
                                                    InputProps={{ readOnly: true }}
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
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
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
                                                            slotProps={{ textField: { InputProps: { readOnly: true } } }}
                                                        />
                                                    </DemoContainer>
                                                </LocalizationProvider>
                                            </FormControl>
                                        </FormGroup>
                                    </>
                                )}

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
                                            id="overTimeLabel"
                                            label="Over Time"
                                            variant="outlined"
                                            value="Over Time"
                                            InputProps={{ readOnly: true }}
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
                                                    slotProps={{ textField: { InputProps: { readOnly: true } } }}
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
                                                    slotProps={{ textField: { InputProps: { readOnly: true } } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}


                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Assign Shift </p>
                            </Button>
                        </Box>
                        
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default AssignShift;
