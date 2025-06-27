import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField, FormControl, FormGroup } from "@mui/material";
import Swal from 'sweetalert2';
import { useSaveEmployeeAllowances, useAssignableAllowances } from "../../../../hooks/useAllowances";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";

const EmployeeAllowanceAdd = ({ userName, onClose }) => {
    const {allowancesData, isAllowancesLoading } = useAssignableAllowances(userName);
    const saveEmployeeAllowances = useSaveEmployeeAllowances();
    const allowances = allowancesData?.allowances || [];

    const [allowanceError, setAllowanceError] = useState(false);
    const [allowance, setAllowance] = useState('');

    const checkInput = (event) => {
        event.preventDefault();
        setAllowanceError(!allowance || allowance == '' ? true : false);
        if(!allowance || allowance == ''){
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }
        
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to add this allowance?",
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
    };

    const saveInput = (event) => {
        event.preventDefault();
        const data = { userName: userName, allowance: allowance};
        saveEmployeeAllowances.mutate({data: data, onSuccessCallback: () => onClose(true)});
    };

    if(isAllowancesLoading){
        return <Box display='flex' width='100%' justifyContent='center'> <LoadingSpinner/> </Box>
    }

    return (
        <Box component="form" sx={{ mt: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
            <FormGroup row={true} className="d-flex justify-content-between">
                <FormControl sx={{
                    marginBottom: 3, width: '100%'}}>
                    <TextField
                        required
                        select
                        id="allowance"
                        label="Allowance"
                        value={allowance}
                        error={allowanceError}
                        onChange={(event) => setAllowance(event.target.value)}
                    >
                        {allowances.map((allowance) => (
                            <MenuItem key={allowance.id} value={allowance.id}
                                disabled={Boolean(allowance.disabled)} 
                                sx={Boolean(allowance.disabled) ? { opacity: 0.5 } : {}}>
                                    {allowance.name} 
                            </MenuItem>
                        ))}
                    </TextField>
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

export default EmployeeAllowanceAdd;
