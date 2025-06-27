import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField, FormControl, FormGroup } from "@mui/material";
import Swal from 'sweetalert2';
import { useSaveEmployeeBenefits, useAssignableBenefits } from "../../../../hooks/useBenefits";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";

const EmployeeBenefitAdd = ({ userName, onClose }) => {
    const { benefitsData, isBenefitsLoading } = useAssignableBenefits(userName);
    const saveEmployeeBenefits = useSaveEmployeeBenefits();

    const [benefitError, setBenefitError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const benefits = benefitsData?.benefits || [];    
    const [benefit, setBenefit] = useState('');
    const [number, setNumber] = useState('');
    
    const checkInput = (event) => {
        event.preventDefault();
        setBenefitError(!benefit || benefit == '' ? true : false);
        setNumberError(!number || number == '' ? true : false);

        if ( benefitError || numberError ) {
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

    if(isBenefitsLoading){
        return <Box display='flex' width='100%' justifyContent='center'> <LoadingSpinner/> </Box>
    }

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
                        {benefits.map((benefit) => (
                            <MenuItem key={benefit.id} value={benefit.id}
                            disabled={Boolean(benefit.disabled)} 
                            sx={Boolean(benefit.disabled) ? { opacity: 0.5 } : {}}>
                                {benefit.name} </MenuItem>
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
