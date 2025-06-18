import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField,  FormControl, FormGroup, InputAdornment } from "@mui/material";
import Swal from "sweetalert2";
import { useAllowances } from "../../../../hooks/useAllowances";

const EmployeeAllowanceEdit = ({allowances, onClose}) => {
    const {updateEmployeeAllowance} = useAllowances();
    // const [number, setNumber] = useState(allowances?.number)
    const [selectedStatus, setSelectedStatus] = useState(allowances?.status);

    const checkInput = (event) => {
        event.preventDefault();
        Swal.fire({
            customClass: { container: 'my-swal' },
            title: "Are you sure?",
            text: "Update this allowance",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Confirm",
            showCancelButton: true,
            confirmButtonColor: '#177604',
        }).then((res) => {
            if(res.isConfirmed){
                saveAllowance(event);
            }
        });
    }

    const saveAllowance = (event) => {
        event.preventDefault();
        const data = {emp_allowance_id: allowances.id, status: selectedStatus}
        updateEmployeeAllowance.mutate({data: data, onSuccessCallback: () => onClose(true)})
    }

    return (
        <>
            <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                <FormGroup row={true} className="d-flex justify-content-between" sx={{mb:4}}>
                    <FormControl sx={{
                     width: '65%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                }}>
                        <TextField
                            label={'Allowance'}
                            value={allowances.name}
                            InputProps={{ readOnly: true }}
                         />                    
                    </FormControl>

                    {/* <FormControl sx={{width:'30%'}}>
                        <TextField
                            label={'Number'}
                            value={number}
                            onChange={(event) => setNumber(event.target.value)}
                         />                    
                    </FormControl>  */}

                    <FormControl sx={{width:'32%'}}>
                        <TextField
                            select
                            id="status"
                            label="Status"
                            value={selectedStatus}
                            onChange={(event) => setSelectedStatus(event.target.value)}
                        >
                            <MenuItem key="Active" value="Active"> Active </MenuItem>
                            <MenuItem key="Inactive" value="Inactive"> Inactive </MenuItem>
                        </TextField>
                    </FormControl>
                </FormGroup>  
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Button type="submit" variant="contained" sx={{backgroundColor: 'green', mx:1}}>
                        <i className="fa fa-floppy-o mr-2"/>Update
                    </Button>
                    <Button onClick={() => onClose(false)} variant="contained" sx={{backgroundColor: 'gray', mx:1}}>
                        <i className="si si-close mr-2"/>Cancel
                    </Button>
                </Box>
            </Box>
        </>
    )
}
export default EmployeeAllowanceEdit;