import { Box, Button, FormControl, FormHelperText, FormGroup, IconButton, InputLabel, TableBody, Table, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent, Divider } from '@mui/material';
import React, { useEffect, useReducer, useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import '../../../../resources/css/calendar.css'

const HrEmployeeAddBank = ({ open, close }) => {
    const [addBank, setAddBank] = useState('');
    const [error, setError] = useState('');
    const [bankData, setBankData] = useState([]);
    const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [titleError, setTitleError] = useState('');


    useEffect(() => {
        axiosInstance.get('/bank', { headers }).then((response) => {
            setBankData(response.data.bank);
        });
    }, [reducerValue])

    const handleSubmitBank = (e) => {
        e.preventDefault();

        // Check for non-alphanumeric characters
        if (!/^[a-zA-Z0-9\s]+$/.test(addBank)) {
            setTitleError('Only alphanumeric characters are allowed.');
            return;
        }

        const formData = new FormData();
        formData.append('bank_name', addBank);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to add this bank?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add-bank', formData, { headers })
                    .then((response) => {
                        console.log('response', response.data)
                        location.reload();
                        forceUpdate();
                    })
                    .catch((error) => {
                        console.log('error', error.response)
                        location.reload();
                    })
            }
        });
    }

    const handleDeleteBank = (id) => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to delete this bank?",
            icon: "warning",
            dangerMode: true,
            allowOutsideClick: false,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.put(`/delete-bank/${id}`, { is_deleted: '1' }, { headers })
                    .then((response) => {
                        location.reload();
                        forceUpdate();
                    })
                    .catch((error) => {
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
                        <Typography className="text-center">Add new Bank</Typography>
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
                                }}
                                    error={!!titleError}>
                                    <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Bank Name</InputLabel>
                                    <input id="demo-simple-select" className='form-control' onChange={(e) => {
                                        setAddBank(e.target.value);
                                        setTitleError(''); // Clear error when input changes
                                    }} type="text" style={{ height: 40 }} />
                                    <FormHelperText>{titleError}</FormHelperText>
                                </FormControl>
                                <FormControl sx={{
                                    marginBottom: 3, width: '20%'
                                }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        onClick={handleSubmitBank}
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
                                    <TableCell colSpan={2}> BANK NAME</TableCell>
                                    <TableCell className='text-center'> ACTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bankData.map((res, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className='text-center'> {index + 1}</TableCell>
                                            <TableCell colSpan={2}> {res.bank_name}</TableCell>
                                            <TableCell className='text-center'>
                                                <Button
                                                    type="submit"
                                                    variant="text"
                                                    style={{ color: 'red' }}
                                                    onClick={() => handleDeleteBank(res.bank_id)}
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

export default HrEmployeeAddBank
