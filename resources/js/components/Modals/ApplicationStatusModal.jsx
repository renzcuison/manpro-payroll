import React, { useEffect, useState } from 'react'
import { Select, MenuItem, Button, InputLabel, Box, FormControl, Typography, FormGroup, IconButton, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const ApplicationStatusModal = ({ open, close, appData: { app_status_id, app_status_name, color, user_id, application_id, workday_id }, triggerChange, setTriggerChange }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [appStatus, setAppStatus] = useState([]);
    const [updateStatus, setUpdateStatus] = useState({
        app_status_id: '',
        app_status_name: '',
        color: ''
    });

    useEffect(() => {
        axiosInstance.get('/get_appplication_status', { headers }).then((response) => {
            setAppStatus(response.data.status);
        });
    }, [])
    const handleSubmitApplication = (e) => {
        e.preventDefault();
        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "Confirm to Update this application?",
            icon: "warning",
            allowOutsideClick: false,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/update-application', {
                    user_id: user_id, workday_id: workday_id, application_id: application_id, status: updateStatus.app_status_name
                        ? updateStatus.app_status_name : app_status_name, color: updateStatus.color ? updateStatus.color : color,
                    status_id: updateStatus.app_status_id ? updateStatus.app_status_id : app_status_id
                }, { headers })
                    .then((response) => {
                        if (response.data.limitApplication === 'Success') {
                            if (response.data.editApplication === 'Success') {
                                Swal.fire({
                                    customClass: {
                                        container: 'my-swal'
                                    },
                                    text: "Application has been updated successfully",
                                    icon: "success",
                                    timer: 1000,
                                    showConfirmButton: false
                                }).then(function (response) {
                                    console.log(response);
                                    location.reload();
                                });
                            } else {
                                Swal.fire({
                                    customClass: {
                                        container: 'my-swal'
                                    },
                                    text: "There was an error updating the application",
                                    icon: "warning",
                                    timer: 1000,
                                    showConfirmButton: false
                                }).then(function (response) {
                                    console.log(response);
                                    location.reload();
                                });
                            }
                        } else {
                            Swal.fire({
                                customClass: {
                                    container: 'my-swal'
                                },
                                text: "Zero leave credit!",
                                icon: "warning",
                            }).then(function (response) {
                                console.log(response);
                                location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.log('error', error.response)
                    })
            } else {
                location.reload()
            }
        });
    }
    const handleChangeButton = (e) => {
        e.preventDefault();
        setTriggerChange(true);
    }
    const handleCloseModal = () => {
        setUpdateStatus({ ...updateStatus, app_status_id: '' })
        setUpdateStatus({ ...updateStatus, app_status_name: '' })
        setUpdateStatus({ ...updateStatus, color: '' })
    }
    const deleteApplication = (e) => {
        e.preventDefault();
        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "to remove this application",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete_applications', {
                    application_id: application_id
                }, { headers })
                    .then((response) => {
                        if (response.data.message === 'Success') {
                            Swal.fire({
                                customClass: {
                                    container: 'my-swal'
                                },
                                title: "Success!",
                                text: "Applcation has been Removed",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false
                            }).then(function () {
                                location.reload()
                            });
                        } else {
                            Swal.fire({
                                customClass: {
                                    container: 'my-swal'
                                },
                                title: "danger!",
                                text: "Something went wrong",
                                icon: "warning",
                                timer: 1000,
                                showConfirmButton: false
                            });
                        }
                    })
                    .catch((error) => {
                        alert('error', error.response)
                    })
            }
        })
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
                        <Typography className="text-center">Application</Typography>
                    </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <div className="block-content my-20">
                        <Box component="form"
                            sx={{ minWidth: 120 }}
                            noValidate
                            autoComplete="off"
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
                                    marginBottom: 3, width: '20%'
                                }}>
                                    <input type="color" style={{ width: '100%', height: '50px' }} value={updateStatus.color || color} disabled={triggerChange ? false : true} onChange={(e) => setUpdateStatus({ ...updateStatus, color: e.target.value })} />
                                </FormControl>
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
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ borderColor: '#97a5ba', }}>Status</InputLabel>
                                    <Select
                                        id="demo-simple-select"
                                        label="Status"
                                        value={updateStatus.app_status_name || app_status_name}
                                        readOnly={triggerChange ? false : true}
                                        onChange={(e) => {
                                            const selectedStatus = appStatus.find(status => status.app_status_name === e.target.value);
                                            setUpdateStatus({
                                                ...updateStatus,
                                                app_status_id: selectedStatus ? selectedStatus.app_status_id : '',
                                                app_status_name: selectedStatus ? selectedStatus.app_status_name : '',
                                                color: selectedStatus ? selectedStatus.color : ''
                                            });
                                        }}
                                        notched={true}
                                        sx={{ width: '100%', }}
                                    >
                                        {appStatus.map((statusList) => (
                                            <MenuItem value={statusList.app_status_name} key={statusList.app_status_id}>{statusList.app_status_name}</MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                            </FormGroup>
                            <Stack direction='row' alignItems='center' justifyContent='center' spacing={4}>
                                <Button
                                    type="submit"
                                    variant='contained'
                                    sx={{ backgroundColor: '#1565c0', color: 'white' }}
                                    onClick={triggerChange ? handleSubmitApplication : handleChangeButton}
                                >
                                    {triggerChange ? <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Submit</p> : <p className='m-0'><i className="fa fa-pencil mr-2 mt-1"></i> Edit</p>}
                                </Button>
                                <Button
                                    type="submit"
                                    variant='contained'
                                    sx={{
                                        backgroundColor: '#ea1c18', color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#ea1c18',
                                        }
                                    }}
                                    onClick={deleteApplication}
                                >
                                    <p className='m-0'><i className="fa fa-trash mr-2 mt-1"></i> Delete</p>
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ApplicationStatusModal
