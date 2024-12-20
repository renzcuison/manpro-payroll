import React, { useEffect, useState } from 'react'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import moment from 'moment';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

const WorkshiftAdd = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    
    const [loading, setLoading] = useState(false);
    const [shiftName, setShiftName] = useState('');
    const [shiftType, setShiftType] = useState('');
    const [firstLabel, setFirstLabel] = useState('');
    const [secondLabel, setSecondLabel] = useState('');
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

    const checkInput = (event) => {
        event.preventDefault();

        console.log("shiftType: " + shiftType);

        if ( shiftType == 'regular' ) {

            console.log("shiftName: " + shiftName);
            console.log("firstLabel: " + firstLabel);
            console.log("regular_time_in: " + updateStatus.regular_time_in);
            console.log("regular_time_out: " + updateStatus.regular_time_out);

            if ( !shiftName || !firstLabel || !updateStatus.regular_time_in || !updateStatus.regular_time_out ) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "All Fields Must Be Filled",
                    icon: "error",
                    showConfirmButton: true
                })
            } else {
                handleSubmit(event);
            }
        }

        if ( shiftType == 'split') {

            console.log("shiftName: " + shiftName);
            console.log("firstLabel: " + firstLabel);
            console.log("split_first_time_in: " + updateStatus.split_first_time_in);
            console.log("split_first_time_out: " + updateStatus.split_first_time_out);
            console.log("split_second_time_in: " + updateStatus.split_second_time_in);
            console.log("split_second_time_out: " + updateStatus.split_second_time_out);

            if ( !shiftName || !firstLabel || !secondLabel || !updateStatus.split_first_time_in || !updateStatus.split_first_time_out || !updateStatus.split_second_time_in || !updateStatus.split_second_time_out ) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "All Fields Must Be Filled",
                    icon: "error",
                    showConfirmButton: true
                })
            } else {
                handleSubmit(event);
            }
        }
    }

    const handleShiftTypeChange = (event) => {
        setShiftType(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        close();
        
        const data = {
            shiftType: shiftType,
            shiftName: shiftName,
            firstLabel: firstLabel,
            secondLabel: secondLabel,
            shiftTime: updateStatus
        };

        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to save this work shift?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel'
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance.post('/saveWorkShift', data, { headers })
                .then(response => {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Work shift has been added successfully",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true
                    }).then(function (response) {
                        location.reload();
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        });
    };

    return (
        <Layout title={"Workshifts"}>
            <Box sx={{ mx: 12, pt: 12 }}>
                <React.Fragment>
                    <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>
                                <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                                    <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }} > Add Work Shift </Typography>

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
                                            <Select labelId="shiftTypeLabel" id="shiftType" value={shiftType} onChange={handleShiftTypeChange} label="Shift Type" style={{ backgroundColor: 'white', width: '100%', height: '40px' }} >
                                                <MenuItem value="regular">Regular Hours</MenuItem>
                                                <MenuItem value="split">Split Hours</MenuItem>
                                            </Select>
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
                                            <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="firstLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Label</InputLabel>
                                                <input id="firstLabel" type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={firstLabel} onChange={(e) => setFirstLabel(e.target.value)} />
                                            </FormControl>

                                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                                <input id="demo-simple-select" type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, regular_time_in: e.target.value })} min={1} max={8} />
                                            </FormControl>

                                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                                <input id="demo-simple-select" type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, regular_time_out: e.target.value })} min={1} max={8} />
                                            </FormControl>
                                        </FormGroup>

                                        <div className="d-flex justify-content-center" id="buttons" style={{ marginTop: '20px' }}>
                                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                                <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Submit</p>
                                            </Button>
                                        </div>
                                    </>
                                    )}

                                    {shiftType === 'split' && (
                                    <>
                                        <Typography>First Attendance</Typography>
                                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                            '& label.Mui-focused': {color: '#97a5ba'},
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                            },
                                        }}>
                                            <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="firstLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Label</InputLabel>
                                                <input id="firstLabel" type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={firstLabel} onChange={(e) => setFirstLabel(e.target.value)} />
                                            </FormControl>

                                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                                <input id="demo-simple-select" type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_in: e.target.value })} min={1} max={8} />
                                            </FormControl>

                                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                                <input id="demo-simple-select" type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_first_time_out: e.target.value })} />
                                            </FormControl>
                                        </FormGroup>

                                        <Typography>Second Attendance</Typography>
                                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                            '& label.Mui-focused': {color: '#97a5ba'},
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                            },
                                        }}>
                                            <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="secondLabel" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Label</InputLabel>
                                                <input id="secondLabel" type="text" className='form-control' style={{ width: '100%', height: '40px' }} value={secondLabel} onChange={(e) => setSecondLabel(e.target.value)} />
                                            </FormControl>

                                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time in</InputLabel>
                                                <input id="demo-simple-select" type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_in: e.target.value })} min={1} max={8} />

                                            </FormControl>

                                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}>Time out</InputLabel>
                                                <input id="demo-simple-select" type="time" className='form-control' style={{ width: '100%', height: '40px' }} onChange={(e) => setUpdateStatus({ ...updateStatus, split_second_time_out: e.target.value })} />

                                            </FormControl>
                                        </FormGroup>

                                        <div className="d-flex justify-content-center" id="buttons" style={{ marginTop: '20px' }}>
                                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                                <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Submit</p>
                                            </Button>
                                        </div>
                                    </>
                                    )}
                                </Box>
                            </>
                        )}
                        
                    </div > 
                </React.Fragment>
            </Box>
        </Layout >
    )
}

export default WorkshiftAdd
