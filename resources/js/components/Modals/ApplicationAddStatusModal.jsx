import { Box, Button, FormControl, FormGroup, IconButton, InputLabel, TableBody, Table, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const ApplicationAddStatusModal = ({ open, close }) => {
    const [addStatus, setAddStatus] = useState();
    const [statusData, setStatusData] = useState([]);
    const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));


    useEffect(() => {
        axiosInstance.get('/get_appplication_status', { headers }).then((response) => {
            setStatusData(response.data.status);
        });
    }, [reducerValue])


    const handleStatusChange = (e) => {
        setAddStatus(e.target.value);
    }
    const handleSubmitStatus = (e) => {
        e.preventDefault();
        console.log(addStatus);
        const formData = new FormData();
        formData.append('status_name', addStatus);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to add this status?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add-application-status', formData, { headers })
                    .then((response) => {
                        console.log('response', response.data)
                        // location.reload();
                        forceUpdate();
                    })
                    .catch((error) => {
                        console.log('error', error.response)
                    })
            }
        });
    }

    const handleDeleteStatus = (id) => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to delete this status?",
            icon: "warning",
            dangerMode: true,
            allowOutsideClick: false,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.put(`/delete-application-status/${id}`, { is_deleted: '1' }, { headers })
                    .then((response) => {
                        console.log(response.data.delete_app);
                        forceUpdate();
                    })
                    .catch((error) => {
                        alert('error', error.response)
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
                        <Typography className="text-center">Add new Status</Typography>
                    </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <div className="block-content my-20">
                        <Box component="forms"
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
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Status Name</InputLabel>
                                    <input id="demo-simple-select" className='form-control' onChange={handleStatusChange} type="text" style={{ height: 40 }} />
                                </FormControl>
                                <FormControl sx={{
                                    marginBottom: 3, width: '20%'
                                }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        onClick={handleSubmitStatus}
                                    >
                                        <i className="fa fa-plus mr-2 mt-1"></i> Add
                                    </Button>
                                </FormControl>
                            </FormGroup>
                        </Box>
                    </div>
                    <TableContainer>
                        <Table className="table table-md  table-striped  table-vcenter">
                            <TableHead>
                                <TableRow>
                                    <TableCell className='text-center'> #</TableCell>
                                    <TableCell colSpan={2}> STATUS NAME</TableCell>
                                    <TableCell className='text-center'> ACTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {statusData.map((res, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className='text-center'> {index + 1}</TableCell>
                                            <TableCell colSpan={2}> {res.app_status_name}</TableCell>
                                            <TableCell className='text-center'>
                                                <Button
                                                    type="submit"
                                                    variant="text"
                                                    style={{ color: 'red' }}
                                                    onClick={() => handleDeleteStatus(res.app_status_id)}
                                                >
                                                    <li className='fa fa-trash' style={{ fontSize: 14 }}></li>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ApplicationAddStatusModal