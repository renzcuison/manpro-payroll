import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField, FormControl, FormGroup } from "@mui/material";
import Swal from 'sweetalert2';
import { useDeduction, useSaveEmployeeDeductions } from "../../../../hooks/useDeductions";

const EmployeeDeductionAdd = ({ userName, onClose }) => {
    const {deductionsData} = useDeduction();
    const saveEmployeeDeductions = useSaveEmployeeDeductions();
    const [deductionError, setDeductionError] = useState(false);

    const deductions = deductionsData?.deductions || []; 
    const [deduction, setDeduction] = useState('');
    const [number, setNumber] = useState('');
    
    const checkInput = (event) => {
        event.preventDefault();

        if (!deduction) {
            setDeductionError(true);
        } else {
            setDeductionError(false);
        }
        if (deduction == '') {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Select a deduction!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this deduction?",
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
        const data = { userName: userName, deduction: deduction, number: number };
        saveEmployeeDeductions.mutate({data: data, onSuccessCallback: () => onClose(true)});
    };

    return (
        <Box component="form" sx={{ mt: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
            <FormGroup row={true} className="d-flex justify-content-between">
                <FormControl sx={{
                    marginBottom: 3, width: '29%'}}>
                    <TextField
                        required
                        select
                        id="deductions"
                        label="Deduction"
                        value={deduction}
                        error={deductionError}
                        onChange={(event) => setDeduction(event.target.value)}
                    >
                        {deductions.map((deduction) => (
                            <MenuItem key={deduction.id} value={deduction.id}> {deduction.name} </MenuItem>
                        ))}
                    </TextField>
                </FormControl>

                <FormControl sx={{
                    marginBottom: 3, width: '69%'}}>
                    <TextField
                        required
                        id="number"
                        label="Number (Optional)"
                        variant="outlined"
                        value={number}
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

export default EmployeeDeductionAdd;
