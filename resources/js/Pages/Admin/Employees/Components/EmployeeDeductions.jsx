import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Tooltip} from "@mui/material";
import EmployeeDeductionView from "../../Deductions/Modals/EmployeeDeductionView";

const EmployeeDeductions = ({userName, deductions, onRefresh}) => {
    const [openEmployeeViewDeductions, setOpenEmployeeViewDeductions] = useState(false);
    
    const handleOpenViewEmployeeDeduction = ()=>{
        setOpenEmployeeViewDeductions(true);
    }
    const handleCloseEmployeeViewDeductions = (reload) => {
        setOpenEmployeeViewDeductions(false);
        if(reload){
            onRefresh();
        }
    }
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Deductions </Typography>

                <Button variant="text" sx={{fontSize: 15, textAlign:'right'}} onClick={() => handleOpenViewEmployeeDeduction()}>
                    View
                </Button>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Deduction</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deductions.length > 0 ? (
                            deductions.map((deduction, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{deduction.name}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{deduction.number}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography>₱{(deduction.calculated_amount).toFixed(2)}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))) :
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                    No Deductions Found
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {openEmployeeViewDeductions && <EmployeeDeductionView userName={userName}
            open={openEmployeeViewDeductions} close={handleCloseEmployeeViewDeductions}/>}
        </Box>
    )
}
export default EmployeeDeductions;