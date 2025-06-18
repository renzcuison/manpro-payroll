import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, MenuItem, TextField, FormControl, FormGroup } from "@mui/material";
import Swal from 'sweetalert2';
import { useBenefits } from "../../../../hooks/useBenefits";

const EmployeeBenefitAdd = ({ userName, headers, onClose }) => {
    const {saveEmployeeBenefits, benefits} = useBenefits({loadBenefits: true});

    const [benefitError, setBenefitError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const benefitsData = benefits.data?.benefits || []; 
    const [benefit, setBenefit] = useState('');
    const [number, setNumber] = useState('');
    
    const checkInput = (event) => {
        event.preventDefault();

        if (!benefit) {
            setBenefitError(true);
        } else {
            setBenefitError(false);
        }

        if (!number) {
            setNumberError(true);
        } else {
            setNumberError(false);
        }

        if (benefit == '' || number == '') {
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
                text: "You want to save this benefit?",
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
        const data = { userName: userName, benefit: benefit, number: number };
        saveEmployeeBenefits.mutate({data: data, onSuccessCallback: () => onClose(true)})
    };

    return (
        <Box component="form" sx={{ mt: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
            <FormGroup row={true} className="d-flex justify-content-between">
                <FormControl sx={{ marginBottom: 3, width: '29%', }}>
                    <TextField
                        required
                        select
                        id="benefits"
                        label="Benefit"
                        value={benefit}
                        error={benefitError}
                        onChange={(event) => setBenefit(event.target.value)}
                    >
                        {benefitsData.map((benefit) => (
                            <MenuItem key={benefit.id} value={benefit.id}> {benefit.name} </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                <FormControl sx={{
                    marginBottom: 3, width: '69%'}}>
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

export default EmployeeBenefitAdd;
