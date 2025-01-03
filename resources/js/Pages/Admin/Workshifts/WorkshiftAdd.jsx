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
    const [shiftTypeError, setShiftTypeError] = useState(false);
    const [firstLabelError, setFirstLabelError] = useState(false);

    const [shiftName, setShiftName] = useState('');
    const [shiftType, setShiftType] = useState('');
    const [firstLabel, setFirstLabel] = useState('');
    const [secondLabel, setSecondLabel] = useState('');

    const [regularTimeIn, setRegularTimeIn] = useState('');
    const [regularTimeOut, setRegularTimeOut] = useState('');

    const [splitFirstTimeIn, setSplitFirstTimeIn] = useState('');
    const [splitFirstTimeOut, setSplitFirstTimeOut] = useState('');
    const [splitSecondTimeIn, setSplitSecondTimeIn] = useState('');
    const [splitSecondTimeOut, setSplitSecondTimeOut] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        if ( shiftType == 'regular' ) {
            checkInputRegular(event);
        }

        // if ( shiftType == 'split' ) {
            // checkInputRegular(event);
        // }
    };

    const checkInputRegular = (event) => {
        event.preventDefault();

        if (!shiftName) {
            setShiftNameError(true);
        } else {
            setShiftNameError(false);
        }

        if (!shiftType) {
            setShiftTypeError(true);
        } else {
            setShiftTypeError(false);
        }

        if ( !shiftName || !shiftType ) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            if ( confirm != password ){
                setConfirmError(true);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Password does not match!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            } else {
                new Swal({
                    customClass: { container: "my-swal" },
                    title: "Are you sure?",
                    text: "You want to save this client?",
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
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            shiftName: shiftName,
            shiftType: shiftType,
        };

        axiosInstance.post('/employees/saveEmployee', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Evaluation form saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/admin/employees`);
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
                                    error={shiftTypeError}
                                    onChange={(event) => setShiftType(event.target.value)}
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
                                    <FormControl sx={{ marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
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
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ padding: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']} sx={{ padding: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '27%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                        },
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ padding: '0 !important' }}>
                                            <DemoContainer components={['TimePicker']} sx={{ padding: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
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
                </div> 

            </Box>
        </Layout >
    )
}

export default WorkshiftAdd