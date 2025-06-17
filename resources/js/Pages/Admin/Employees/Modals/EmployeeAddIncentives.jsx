import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField, FormControl, FormGroup, Dialog, DialogTitle, DialogContent, Typography, IconButton} from "@mui/material";
import Swal from 'sweetalert2';
import { useIncentives } from "../../../../hooks/useIncentives";

const EmployeeAddIncentives = ({userName, open, onClose }) => {

    const {incentives: incentivesTypes, saveEmployeeIncentives} = useIncentives();
    const incentives = incentivesTypes.data?.incentives || [];

    const [incentivesError, setIncentivesError] = useState(false);
    const [numberError, setNumberError] = useState(false);

    const [incentive, setIncentive] = useState('');
    const [number, setNumber] = useState('');

    const checkInput = (event) => {
        event.preventDefault();

        if (!incentive) {
            setIncentivesError(true);
        } else {
            setIncentivesError(false);
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
                text: "You want to add this incentive?",
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
        saveEmployeeIncentives.mutate(data, {
            onSuccess: (response) => {
                if(response.status === 200){
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Incentive added successfully!",
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
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Incentives </Typography>
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
                            id="incentive"
                            label="Incentives"
                            value={incentive}
                            error={incentivesError}
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
                    <Button variant="contained" sx={{ backgroundColor: '#636c74', color: 'white', mx: 1 }} onClick={onClose}>
                        <p className='m-0'><i class="fa fa-times" aria-hidden="true"></i> Cancel </p>
                    </Button>
                </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EmployeeAddIncentives;
