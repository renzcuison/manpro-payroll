import React, { useState } from "react";
import { Box, Button, MenuItem, TextField, FormControl, FormGroup } from "@mui/material";
import Swal from 'sweetalert2';
import { useSaveEmployeeIncentives, useAssignableIncentives } from "../../../../hooks/useIncentives";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";   

const EmployeeIncentiveAdd = ({ userName, onClose }) => {
    const {incentivesData, isIncentivesLoading} = useAssignableIncentives(userName);
    const saveEmployeeIncentives = useSaveEmployeeIncentives();
    const incentives = incentivesData?.incentives || [];

    const [incentiveError, setIncentiveError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const [incentive, setIncentive] = useState('');
    const [number, setNumber] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        setIncentiveError(!incentive || incentive == '' ? true : false);
        setNumberError(!number || number == '' ? true : false);
        const isFieldsEmpty = (!incentive || incentive == '' || !number || number == '');

        if ( isFieldsEmpty ) {
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
        saveEmployeeIncentives.mutate({data: data, onSuccessCallback: () => onClose(true)});
    };

    if(isIncentivesLoading){
        return <Box display='flex' width='100%' justifyContent='center'> <LoadingSpinner/> </Box>
    }

    return (
        <Box component="form" sx={{ mt: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
            <FormGroup row={true} className="d-flex justify-content-between">
                <FormControl sx={{
                    marginBottom: 3, width: '29%',
                }}>
                    <TextField
                        required
                        select
                        id="incentives"
                        label="Incentives"
                        value={incentive}
                        error={incentiveError}
                        onChange={(event) => setIncentive(event.target.value)}
                    >
                        {incentives.map((incentive) => (
                            <MenuItem key={incentive.id} value={incentive.id}
                                disabled={Boolean(incentive.disabled)} 
                                sx={Boolean(incentive.disabled) ? { opacity: 0.5 } : {}}>
                                    {incentive.name} 
                            </MenuItem>
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

export default EmployeeIncentiveAdd;
