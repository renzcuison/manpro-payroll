import { Box, Button, FormControl, FormGroup, IconButton, InputLabel, Typography, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';
import React, { useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const ApplicationEditListModal = ({ open, close, data: { applist_id, list_name, percentage } }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [appType, setAppType] = useState({
        title: '',
        percentage: 0
    });
    const handleSubmitType = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('appID', applist_id);
        formData.append('title', appType.title);
        formData.append('old_title', list_name);
        formData.append('old_percentage', percentage);
        formData.append('percentage', appType.percentage / 100);
        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "You want to update this application?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add_type_application', formData, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            title: "Success!",
                            text: "Application has been updated successfully",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(function () {
                            location.reload();
                        });
                    }
                })
            }
        });

    }
    const handleCloseModal = () => {
        setAppType({
            ...appType,
            title: '',
            percentage: 0
        })
    }
    const handleDeleteList = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('applist_id', applist_id);

        new Swal({
            customClass: {
                container: 'my-swal'
            },
            title: "Are you sure?",
            text: "You want to delete this application?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete_type_application', formData, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        Swal.fire({
                            customClass: {
                                container: 'my-swal'
                            },
                            title: 'Success!',
                            text: 'Application has been deleted successfully',
                            icon: 'success'
                        }).then(function (response) {
                            location.reload();
                        });

                    } else {
                        alert("Error! try again");
                    }
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
                        <Typography className="text-center">Edit List</Typography>
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
                                    marginBottom: 3, width: '75%', '& label.Mui-focused': {
                                        color: '#97a5ba',
                                    },
                                    '& .MuiOutlinedInput-root': {

                                        '&.Mui-focused fieldset': {
                                            borderColor: '#97a5ba',
                                        },
                                    },
                                }}>
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Title</InputLabel>
                                    <input id="demo-simple-select" className='form-control' value={appType.title} placeholder={list_name} onChange={(e) => setAppType({ ...appType, title: e.target.value })} type="text" style={{ height: 40 }} />
                                </FormControl>
                                <FormControl sx={{
                                    marginBottom: 3, width: '20%'
                                }}>
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>%</InputLabel>
                                    <input id="demo-simple-select" className='form-control' defaultValuealue={appType.percentage} placeholder={percentage * 100} onChange={(e) => setAppType({ ...appType, percentage: e.target.value })} type="number" style={{ height: 40 }} min={1} max={100} />
                                </FormControl>

                            </FormGroup>
                            <Stack direction='row' alignItems='center' justifyContent='center' spacing={4}>
                                <Button
                                    disabled={(appType.title || appType.percentage != '') ? false : true}
                                    type="submit"
                                    variant="contained"
                                    sx={{ backgroundColor: '#1565c0', color: 'white' }}
                                    onClick={handleSubmitType}
                                >
                                    <i className="fa fa-plus mr-2 mt-1"></i>Update
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
                                    onClick={handleDeleteList}
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

export default ApplicationEditListModal
