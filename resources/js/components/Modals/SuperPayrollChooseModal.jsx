import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import moment from 'moment/moment';

const SuperPayrollChooseModal = ({ open, close, teamID }) => {
    const navigate = useNavigate();

    const handleViewProcess = (id) => {
        navigate('/hr/payroll-process?employeeID=' + id)
    }
    const handleViewRecords = (id) => {
        navigate(`/hr/payroll-records?month=${moment().format('M')}&cutoff=${1}&year=${moment().year()}&employeeID=` + id)
    }
    const handleViewSummary = (id) => {
        navigate(`/hr/payroll-summary?month=${moment().format('M')}&cutoff=${1}&year=${moment().year()}&employeeID=` + id)
    }

    return (
        <>
            <Dialog sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-center",
                    alignItems: "flex-start"
                }
            }}
                open={open} fullWidth maxWidth="xs">
                <Box className="d-flex justify-content-center" sx={{ position: 'relative', marginTop: 2 }} >
                    <DialogTitle>Please Select</DialogTitle>
                    <IconButton sx={{ position: 'absolute', right: 0, marginRight: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <Stack sx={{ margin: '0 auto', width: '80%', pb: 3 }} spacing={3}>
                        <Button variant='contained' sx={{ p: 2, backgroundColor: '#3286d7' }} onClick={() => handleViewProcess(teamID)}>
                            Payroll Process
                        </Button>
                        <Button variant='contained' sx={{ p: 2, backgroundColor: '#7eb73d' }} onClick={() => handleViewRecords(teamID)}>
                            Payroll Records
                        </Button>
                        <Button variant='contained' sx={{ p: 2, backgroundColor: '#eab000' }} onClick={() => handleViewSummary(teamID)}>
                            Payroll Summary
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog >
        </>

    )
}

export default SuperPayrollChooseModal
