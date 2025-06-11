import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField, FormControl, FormGroup, Dialog, DialogTitle, DialogContent, Typography, IconButton} from "@mui/material";
import Swal from 'sweetalert2';
import axiosInstance, {getJWTHeader} from "../../../../utils/axiosConfig";
import { useAllowances, useSaveEmployeeAllowance } from "../../../../hooks/useAllowance";

const EmployeeAddAllowance = ({userName, open, onClose }) => {

    const saveEmployeeAllowance = useSaveEmployeeAllowance();
    const {data, isLoading, error, refetch} = useAllowances();
    const allowances = data?.allowances || [];
    const [allowanceError, setAllowanceError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const [allowance, setAllowance] = useState('');
    const [number, setNumber] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        if (!allowance) {
            setAllowanceError(true);
        } else {
            setAllowanceError(false);
        }

        if (!number) {
            setNumberError(true);
        } else {
            setNumberError(false);
        }

        if (allowance == '' || number == '') {
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
        }
    };

    const saveInput = (event) => {
        event.preventDefault();
        const data = { userName: userName, allowance: allowance, number: number };
        saveEmployeeAllowance.mutate(data, {
            onSuccess: (response) => {
                if(response.status === 200){
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Allowance added successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        onClose(true);
                    });
                }
            },
            onError: (error) =>{
                console.error('Error:', error);
            }
        });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa',
             boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Allowance </Typography>
                        <IconButton onClick={() => onClose(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
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
                            id="allowance"
                            label="Allowance"
                            value={allowance}
                            error={allowanceError}
                            onChange={(event) => setAllowance(event.target.value)}
                        >
                            {allowances.map((allowance) => (
                                <MenuItem key={allowance.id} value={allowance.id}> {allowance.name} </MenuItem>
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
                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#636c74', color: 'white', mx: 1 }} onClick={onClose}>
                        <p className='m-0'><i class="fa fa-times" aria-hidden="true"></i> Cancel </p>
                    </Button>
                </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EmployeeAddAllowance;
