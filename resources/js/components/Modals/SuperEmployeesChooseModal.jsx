import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const SuperEmployeesChooseModal = ({ open, close, teamID }) => {
    const navigate = useNavigate();

    const handleViewEmployees = (id) => {
        navigate('/hr/employees?employeeID=' + id)
    }
    const handleViewBenefits = (id) => {
        navigate('/hr/employees-benefits?employeeID=' + id)
    }
    const handleViewWorkdays = (id) => {
        navigate('/hr/workdays?employeeID=' + id)
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
                        <Button variant='contained' sx={{ p: 2, backgroundColor: '#3286d7' }} onClick={() => handleViewEmployees(teamID)}>
                            List of Employees
                        </Button>
                        <Button variant='contained' sx={{ p: 2, backgroundColor: '#7eb73d' }} onClick={() => handleViewBenefits(teamID)}>
                            List of Benefits
                        </Button>
                        <Button variant='contained' sx={{ p: 2, backgroundColor: '#eab000' }} onClick={() => handleViewWorkdays(teamID)}>
                            Set Workdays
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog >
        </>

    )
}

export default SuperEmployeesChooseModal
