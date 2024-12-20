import React, { useState } from 'react'
import { InputLabel, FormControl, Typography, IconButton, Dialog, DialogTitle, DialogContent, TextField, Button } from '@mui/material'
import { Box } from '@mui/system';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import '../../../../resources/css/customcss.css'

const PayrollSaveModalConfirmation = ({ data, open, close, closeOrigModal }) => {
    const [verifyValue, setVerifyValue] = useState(false);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const handleConfirmation = (e) => {
        if (e.target.value == 'saved' || e.target.value == 'Saved') {
            setVerifyValue(true)
        } else {
            setVerifyValue(false)
        }
    }
    const handleSavePayroll = () => {
        
        console.log(data);

        axiosInstance.post('/save_payroll', data, { headers })
            .then((response) => {
                if (response.data.data === 'Success') {
                    close()
                    closeOrigModal()
                    Swal.fire({
                        customClass: { container: 'my-swal' }, title: "Success!", text: "Payroll Details has been Saved successfully", icon: "success", timer: 1000, showConfirmButton: false
                    }).then(function () {
                        location.reload();
                    });
                } else {
                    alert("Something went wrong")
                }
            })
            .catch((error) => {
                console.log('error', error.response)
            })
    }

    console.log(data);

    return (
        <Dialog open={open} fullWidth maxWidth="xs">
            <DialogTitle className='d-flex justify-content-between'>
                <Typography align="center" sx={{ marginY: 1 }}>Please input  "<Box component="span" sx={{ color: 'red' }}>Saved</Box>" to Continue</Typography>
            </DialogTitle>
            <DialogContent>
                <TextField sx={{ width: '100%' }} id="standard-basic" label="Type here.." variant="standard" onChange={handleConfirmation} />
                <Box component="div" sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button sx={{ marginTop: 3, marginBottom: 1 }} variant="contained" disabled={verifyValue ? false : true} onClick={handleSavePayroll}>Submit</Button>
                    <Button sx={{ marginTop: 3, marginBottom: 1 }} variant="contained" color="error" onClick={close}>Cancel</Button>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default PayrollSaveModalConfirmation
