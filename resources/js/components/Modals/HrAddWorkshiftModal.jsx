import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css'; // Import styles

const HrAddWorkshiftModal = ({ open, close, workShift, workHours, employeeCount }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const startDate = moment().format('YYYY-MM-DD HH:mm:mm');
    const [shiftName, setShiftName] = useState('');
    const [shiftType, setShiftType] = useState('');
    const [firstLabel, setFirstLabel] = useState('');
    const [secondLabel, setSecondLabel] = useState('');
    const [categoryData, setCategoryData] = useState({
        title: '',
        description: '',
        attached_file: null, // To store the selected file
    });

    const [updateStatus, setUpdateStatus] = useState({
        regular_time_in: '',
        regular_time_out: '',
        split_first_time_in: '',
        split_first_time_out: '',
        split_second_time_in: '',
        split_second_time_out: '',
    });

    const hours_regular_time_in = (updateStatus.regular_time_in != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.regular_time_in + ':00' : '';
    const hours_regular_time_out = (updateStatus.regular_time_out != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.regular_time_out + ':00' : '';
    const hours_split_first_time_in = (updateStatus.split_first_time_in != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.split_first_time_in + ':00' : '';
    const hours_split_first_time_out = (updateStatus.split_first_time_out != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.split_first_time_out + ':00' : '';
    const hours_split_second_time_in = (updateStatus.split_second_time_in != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.split_second_time_in + ':00' : '';
    const hours_split_second_time_out = (updateStatus.split_second_time_out != '') ? moment().format('YYYY-MM-DD') + ' ' + updateStatus.split_second_time_out + ':00' : '';

    useEffect(() => {
        if (workShift && workHours) {
            setShiftName(workShift.description || '');
            setFirstLabel(workHours.morning_label || '');
            setSecondLabel(workHours.afternoon_label || '');

            // Baliktad ang Pag Buhat sa Previous Dev. Medyo dako na ug libug na kung usabon
            // NO = NAAY BREAK
            // YES = WALAY BREAK
            if ( workHours.noon_break === 'No' ) {
                setShiftType("Split");
            } else {
                setShiftType("Regular");
            }
    
            setUpdateStatus({
                regular_time_in: workHours.hours_morning_in || '',
                regular_time_out: workHours.hours_afternoon_out || '',
                split_first_time_in: workHours.hours_morning_in || '',
                split_first_time_out: workHours.hours_morning_out || '',
                split_second_time_in: workHours.hours_afternoon_in || '',
                split_second_time_out: workHours.hours_afternoon_out || ''
            });
        }
    }, [workShift, workHours]);

    const handleSubmit = (event) => {
        event.preventDefault();
    
        const data = {
            shiftId: workShift.id,
            shiftName: shiftName,
            firstLabel: firstLabel,
            secondLabel: secondLabel,
            shiftTime: updateStatus
        };
    
        axiosInstance.post('/editWorkShift', data, { headers })
            .then(response => {
                Swal.fire({
                    customClass: {
                        container: 'my-swal'
                    },
                    text: "Work shift has been edited successfully",
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: true
                }).then(function (response) {
                    location.reload();
                });
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error, if needed
            });
    };

    const handleDeleteWorkShift = () => {
        console.log("Work Shift ID          : " + workShift.id);
        console.log("Employee Count         : " + employeeCount);
        console.log("Work Shift Description : " + workShift.description);

        const shiftId = {
            shiftId: workShift.id,
        };

        const style = document.createElement('style');
        style.innerHTML = `
            .swal2-confirm.custom-inline-button {
                background-color: #E74C3C !important;
                color: white !important;
                border: none !important;
            }
            .swal2-cancel.custom-inline-button {
                background-color: #6c757d !important;
                color: white !important;
                border: none !important;
            }
        `;
        document.head.appendChild(style);
    
        if (employeeCount > 0) {
            Swal.fire({
                customClass: {
                    container: 'my-swal'
                },
                text: "Cannot delete work shift with assigned employee!",
                icon: "error",
                showConfirmButton: true
            })
        } else {
            Swal.fire({
                customClass: {
                    container: 'my-swal'
                },
                text: "Are you sure you want to delete this work shift?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Delete',
                confirmButtonColor: '#ff6042',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then(result => {
                if (result.isConfirmed) {
                    axiosInstance.post('/deleteWorkShift', shiftId, { headers })
                    .then(response => {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            text: "Work shift has been deleted successfully",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true
                        }).then(() => {
                            navigate('/hr/dashboard');
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                } else {
                    console.log('User cancelled the delete action.');
                }
            });
        }
    };
    

    return (
        <>
            {/* <Dialog sx={{ "& .MuiDialog-container": { justifyContent: "flex-center" } }} open={open} fullWidth maxWidth="sm"> */}
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Edit Work Shift</Typography>
                        {/* <Typography variant="h5" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Edit {workShift ? workShift.description : 'Work'} Shift</Typography> */}
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent>
                    <div className="block-content my-20">
                        <div className='row'>
                            <div className="col-lg-12">
                                <Box component="form" sx={{ minWidth: 120 }} onSubmit={handleSubmit} noValidate autoComplete="off" encType="multipart/form-data" >

                                    <Typography>Shift Details</Typography>
                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: '#97a5ba'},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                        },
                                    }}>
                                        <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <InputLabel id="shiftNameLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Shift Name</InputLabel>
                                            <input id="shiftName" type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={shiftName} onChange={(e) => setShiftName(e.target.value)} />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                            },
                                        }}>
                                            <InputLabel id="shiftTypeLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Shift Type</InputLabel>
                                            <input id="shiftType" type="text" className='form-control' style={{ width: '100%', height: '40px', backgroundColor: '#ffffff' }} value={shiftType} readOnly />
                                        </FormControl>
                                    </FormGroup>

                                    {shiftType === "Regular" && (
                                    <>
                                        <Typography>Attendance</Typography>
                                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                            '& label.Mui-focused': {color: '#97a5ba'},
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                            },
                                        }}>
                                            <React.Fragment key="splitHours">
                                                <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Label</InputLabel>
                                                    <input type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={firstLabel} onChange={(e) => setFirstLabel(e.target.value)} />
                                                </FormControl>

                                                <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                                    <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.regular_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, regular_time_in: e.target.value })} />
                                                </FormControl>

                                                <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                                    <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.regular_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, regular_time_out: e.target.value })} />
                                                </FormControl>
                                            </React.Fragment>
                                        </FormGroup>
                                    </>
                                    )}

                                    {shiftType === "Split" && (
                                    <>
                                        <Typography>First Attendance</Typography>
                                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                            '& label.Mui-focused': {color: '#97a5ba'},
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                            },
                                        }}>
                                            <React.Fragment key="splitHours">
                                                <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Label</InputLabel>
                                                    <input type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={firstLabel} onChange={(e) => setFirstLabel(e.target.value)} />
                                                </FormControl>

                                                <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                                    <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_first_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_in: e.target.value })} />
                                                </FormControl>

                                                <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                                    <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_first_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_out: e.target.value })} />
                                                </FormControl>
                                            </React.Fragment>
                                        </FormGroup>

                                        <Typography>Second Attendance</Typography>
                                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                            '& label.Mui-focused': {color: '#97a5ba'},
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                            },
                                        }}>
                                            <React.Fragment key="splitHours">
                                                <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Label</InputLabel>
                                                    <input type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={secondLabel} onChange={(e) => setSecondLabel(e.target.value)} />
                                                </FormControl>

                                                <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                                    <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_second_time_in} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_in: e.target.value })} />
                                                </FormControl>

                                                <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                    },
                                                }}>
                                                    <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                                    <input type="time" className='form-control' style={{ width: '100%', height: '40px' }} value={updateStatus.split_second_time_out} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_out: e.target.value })} />
                                                </FormControl>
                                            </React.Fragment>
                                        </FormGroup>
                                    </>
                                    )}

                                    <Box id="buttons" sx={{ paddingTop: 1, textAlign: 'center', '& .MuiButton-root': { margin: 1 }, }} >
                                        <Button onClick={handleDeleteWorkShift} variant="contained" sx={{ backgroundColor: '#E74C3C', color: 'white' }} >
                                            {/* <i className="fa fa-times mr-2 mt-1"></i> */} Delete
                                        </Button>
                                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} >
                                            {/* <i className="fa fa-plus mr-2 mt-1"></i> */} Save
                                        </Button>
                                    </Box>

                                </Box>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default HrAddWorkshiftModal;
