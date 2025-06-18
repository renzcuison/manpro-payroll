import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, MenuItem, TextField, FormControl, FormGroup } from "@mui/material";
import Swal from 'sweetalert2';
import axiosInstance from "../../../../utils/axiosConfig";

const EmployeeIncentiveAdd = ({ userName, headers, onClose }) => {

    const [incentiveEerror, setIncentiveError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const [incentives, setIncentives] = useState([]);
    const [incentive, setIncentive] = useState('');
    const [number, setNumber] = useState('');

    useEffect(() => {
        axiosInstance.get('/compensation/getIncentives', { headers })
            .then((response) => {
                setIncentives(response.data.incentives);
            }).catch((error) => {
                console.error('Error fetching incentives:', error);
            });
    }, []);

    const checkInput = (event) => {
        event.preventDefault();

        if (!incentive) {
            setIncentiveError(true);
        } else {
            setIncentiveError(false);
        }

        if (!number) {
            setNumberError(true);
        } else {
            setNumberError(false);
        }

        if (incentive == '' || number == '') {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this incentive?",
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

        const data = { userName: userName, incentive: incentive, number: number };

        axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Incentive saved successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        onClose(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Box component="form" sx={{ mt: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                '& label.Mui-focused': { color: '#97a5ba' },
                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
            }}>
                <FormControl sx={{
                    marginBottom: 3, width: '29%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                }}>
                    <TextField
                        required
                        select
                        id="incentives"
                        label="incentive"
                        value={incentive}
                        error={incentiveEerror}
                        onChange={(event) => setIncentive(event.target.value)}
                    >
                        {incentives.map((incentive) => (
                            <MenuItem key={incentive.id} value={incentive.id}> {incentive.name} </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                <FormControl sx={{
                    marginBottom: 3, width: '69%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                }}>
                    <TextField
                        required
                        id="number"
                        label="Number"
                        variant="outlined"
                        value={number}
                        error={numberError}
                        onChange={(e) => setNumber(e.target.value)}
                    />
                </FormControl>
            </FormGroup>

            <Box display="flex" justifyContent="center">
                <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white', mx: 1 }}>
                    <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save </p>
                </Button>
                <Button type="submit" variant="contained" sx={{ backgroundColor: '#636c74', color: 'white', mx: 1 }} onClick={() => onClose(false)}>
                    <p className='m-0'><i className="fa fa-times" aria-hidden="true"></i> Cancel </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeIncentiveAdd;
