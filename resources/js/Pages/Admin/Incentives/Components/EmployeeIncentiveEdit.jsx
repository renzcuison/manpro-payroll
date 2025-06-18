import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField,  FormControl, FormGroup } from "@mui/material";
import Swal from "sweetalert2";
import { useIncentives } from "../../../../hooks/useIncentives";

const EmployeeIncentiveEdit = ({incentives, onClose}) => {
    const {updateEmployeeIncentive} = useIncentives();
    const [number, setNumber] = useState(incentives?.number)
    const [selectedStatus, setSelectedStatus] = useState(incentives?.status);

    const checkInput = (event) => {
        event.preventDefault();
        if(!number || number === ''){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Number must not be empty!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            }).then(()=>{
                return;
            });
        }
        Swal.fire({
            customClass: { container: 'my-swal' },
            title: "Are you sure?",
            text: "Update this incentive",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Confirm",
            showCancelButton: true,
            confirmButtonColor: '#177604',
        }).then((res) => {
            if(res.isConfirmed){
                saveBenefit(event);
            }
        });
    }

    const saveBenefit = (event) => {
        event.preventDefault();
        const data = {emp_incentive_id: incentives.id, number: number, status: selectedStatus}
        updateEmployeeIncentive.mutate({data: data, onSuccessCallback: () => onClose(true)});
    }

    return (
        <>
            <Box component="form" sx={{ mt: 3, my: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data">
                <FormGroup row={true} className="d-flex justify-content-between" sx={{mb:4}}>
                    <FormControl sx={{
                     width: '35%', '& label.Mui-focused': { color: '#97a5ba' },
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                }}>
                        <TextField
                            label={'Incentives'}
                            value={incentives.name}
                            InputProps={{ readOnly: true }}
                         />                    
                    </FormControl>

                    <FormControl sx={{width:'30%'}}>
                        <TextField
                            label={'Number'}
                            value={number}
                            onChange={(event) => setNumber(event.target.value)}
                         />                    
                    </FormControl> 
                    <FormControl sx={{width:'30%'}}>
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
export default EmployeeIncentiveEdit;