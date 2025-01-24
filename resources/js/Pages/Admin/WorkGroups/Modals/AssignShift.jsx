import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';

const AssignShift = ({ open, close, currentShift, workGroup, onUpdateWorkGroupDetails }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [workShift, setWorkShift] = useState([]);
    const [workShifts, setWorkShifts] = useState([]);

    const [selectedShiftError, setSelectedShiftError] = useState(false);
    const [selectedShift, setSelectedShift] = useState("");

    useEffect(() => {
        console.log(workGroup);
        // console.log(workShift);

        setSelectedShift(currentShift ? currentShift : '');

        axiosInstance.get(`/workshedule/getWorkShifts`, { headers })
            .then((response) => {
                if ( response.data.status === 200 ) {
                    setWorkShifts(response.data.workShifts);
                }
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    }, []);

    const handleSelectWorkShift = (shiftId) => {
        setSelectedShift(shiftId);
        const selectedWorkShift = workShifts.find(shift => shift.id === shiftId);
        setWorkShift(selectedWorkShift);
    };

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const isAM = hours < 12;
        const formattedHours = hours % 12 || 12;
        const period = isAM ? 'AM' : 'PM';
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
        event.preventDefault();

        const data = { workGroup: workGroup, workShift: workShift.id };

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

                        {workShift.shift_type === "Regular" && (
                            <>
                                <Typography sx={{ marginBottom: 3 }} >Attendance</Typography>

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
                                            label="Label"
                                            variant="outlined"
                                            value="Attendance"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeIn"
                                            label="Time In"
                                            variant="outlined"
                                            value={formatTime(workShift.first_time_in)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeOut"
                                            label="Time Out"
                                            variant="outlined"
                                            value={formatTime(workShift.first_time_out)}
                                        />
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
                                            label="Label"
                                            variant="outlined"
                                            value="Over Time"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeIn"
                                            label="Time In"
                                            variant="outlined"
                                            value={formatTime(workShift.over_time_in)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeOut"
                                            label="Time Out"
                                            variant="outlined"
                                            value={formatTime(workShift.over_time_out)}
                                        />
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {workShift.shift_type === "Split" && (
                            <>
                                <Typography sx={{ marginBottom: 3 }} >Attendance</Typography>

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
                                            label="Label"
                                            variant="outlined"
                                            value="Attendance"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeIn"
                                            label="Time In"
                                            variant="outlined"
                                            value={formatTime(workShift.first_time_in)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeOut"
                                            label="Time Out"
                                            variant="outlined"
                                            value={formatTime(workShift.first_time_out)}
                                        />
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
                                            label="Label"
                                            variant="outlined"
                                            value="Attendance"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="secondTimeIn"
                                            label="Time In"
                                            variant="outlined"
                                            value={formatTime(workShift.second_time_in)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="secondTimeOut"
                                            label="Time Out"
                                            variant="outlined"
                                            value={formatTime(workShift.second_time_out)}
                                        />
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
                                            label="Label"
                                            variant="outlined"
                                            value="Over Time"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeIn"
                                            label="Time In"
                                            variant="outlined"
                                            value={formatTime(workShift.over_time_in)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <TextField
                                            required
                                            id="firstTimeOut"
                                            label="Time Out"
                                            variant="outlined"
                                            value={formatTime(workShift.over_time_out)}
                                        />
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
