import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, FormControl, FormGroup, IconButton, InputLabel, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { Table } from 'reactstrap';

const HrEmployeeWorkdayModal = ({ open, close }) => {
    const [addWorkDays, setAddWorkDays] = useState();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const handleStatusChange = (e) => {
        setAddWorkDays(e.target.value);
    }
    const handleSubmitStatus = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('work_days', addWorkDays);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to set this Workdays?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add-workdays', formData, { headers })
                    .then((response) => {
                        console.log('response', response.data)
                        location.reload();
                    })
                    .catch((error) => {
                        console.log('error', error.response)
                        location.reload();
                    })
            }
        });
    }

    return (
        <>
            <Dialog sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-center",
                    alignItems: "flex-start"
                }
            }}
                open={open} fullWidth maxWidth="sm">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle>
                        <Typography className="text-center">Set Work days</Typography>
                    </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <Divider variant="middle" light style={{ borderTop: '4px solid black' }} />
                <DialogContent>
                    <div className="block-content my-20">
                        <Box component="form"
                            sx={{ minWidth: 120 }}
                            noValidate
                            autoComplete="off"
                            // onSubmit={showEdit != true ? handleSubmit : handleEdit}
                            encType="multipart/form-data"
                        >
                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                '& label.Mui-focused': {
                                    color: '#97a5ba',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#97a5ba',
                                    },
                                },
                            }}>
                                <FormControl sx={{
                                    marginBottom: 3, width: '75%', '& label.Mui-focused': {
                                        color: '#97a5ba',
                                    },
                                    '& .MuiOutlinedInput-root': {

                                        '&.Mui-focused fieldset': {
                                            borderColor: '#97a5ba',
                                        },
                                    },
                                }}>
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Number of Days</InputLabel>
                                    <input id="demo-simple-select" className='form-control' onChange={handleStatusChange} type="number" style={{ height: 40 }} />
                                </FormControl>
                                <FormControl sx={{
                                    marginBottom: 3, width: '20%'
                                }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        onClick={handleSubmitStatus}
                                    >
                                        <i className="fa fa-check mr-2 mt-1"></i> Submit
                                    </Button>
                                </FormControl>
                            </FormGroup>
                        </Box>
                    </div>
                </DialogContent >
            </Dialog >
        </>
    )
}

export default HrEmployeeWorkdayModal
