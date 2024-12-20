import React, { useState } from 'react';
import { Box, Button, FormControl, FormGroup, IconButton, InputLabel, TableBody, Table, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent, FormHelperText } from '@mui/material';
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';

const ApplicationAddListModal = ({ open, close }) => {
    const [addTitle, setAddTitle] = useState({
        title: '',
        percentage: 0,
    });
    const [titleError, setTitleError] = useState(''); // State for the title error
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const handleSubmitStatus = (e) => {
        e.preventDefault();

        // Check for non-alphanumeric characters in the "Title" input
        if (!/^[a-zA-Z0-9\s]+$/.test(addTitle.title)) {
            setTitleError('Only alphanumeric characters are allowed.');
            return;
        } else {
            setTitleError(''); // Clear the error message when input is valid
        }

        console.log(addTitle.percentage / 100);
        const formData = new FormData();
        formData.append('title', addTitle.title);
        formData.append('percentage', addTitle.percentage / 100);

        new Swal({
            customClass: {
                container: 'my-swal',
            },
            title: "Are you sure?",
            text: "You want to add this Application?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add-applications-list', formData, { headers })
                    .then((response) => {
                        if (response.data.message === 'Success') {
                            Swal.fire({
                                customClass: {
                                    container: 'my-swal',
                                },
                                title: "Success!",
                                text: "Application has been added successfully",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false
                            }).then(function (response) {
                                console.log(response);
                                location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.log('error', error.response);
                    });
            }
        });
    };

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
                        <Typography className="text-center">Add New Application List</Typography>
                    </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
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
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Title</InputLabel>
                                    <input
                                        id="demo-simple-select"
                                        className='form-control'
                                        onChange={(e) => {
                                            setAddTitle({ ...addTitle, title: e.target.value });
                                            setTitleError(''); // Clear the error message when input changes
                                        }}
                                        type="text"
                                        style={{ height: 40 }}
                                    />
                                    <FormHelperText error>{titleError}</FormHelperText> {/* Display the error message */}
                                </FormControl>
                                <FormControl sx={{
                                    marginBottom: 3, width: '20%'
                                }}>
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>%</InputLabel>
                                    <input id="demo-simple-select" className='form-control' onChange={(e) => setAddTitle({ ...addTitle, percentage: e.target.value })} type="number" style={{ height: 40 }} min={1} max={100} />
                                </FormControl>

                            </FormGroup>
                            <div className='d-flex justify-content-center mt-20'>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    onClick={handleSubmitStatus}
                                >
                                    <i className="fa fa-plus mr-2 mt-1"></i>Submit
                                </Button>
                            </div>
                        </Box>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ApplicationAddListModal;
