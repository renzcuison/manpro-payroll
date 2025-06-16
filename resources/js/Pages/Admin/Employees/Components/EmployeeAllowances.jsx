import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Tooltip} from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EmployeeAllowanceView from "../../Allowance/Modals/EmployeeAllowanceView";

const EmployeeAllowances = ({userName, allowances, onRefresh}) => {
    const [openEmployeeViewAllowance, setOpenEmployeeViewAllowance] = useState(false);

    const handleOpenViewEmployeeAllowance = ()=>{
        setOpenEmployeeViewAllowance(true);
    }
    const handleCloseViewEmployeeAllowance = (reload) => {
        setOpenEmployeeViewAllowance(false);
        if(reload){
            onRefresh();
        }
    }
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Allowances </Typography>

                <Button variant="text" sx={{fontSize: 15, textAlign:'right'}} onClick={() => handleOpenViewEmployeeAllowance()}>
                    View
                </Button>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Allowance</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allowances.length > 0 ? (
                            allowances.map((allowance, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{allowance.name}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{allowance.number}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography>₱{(allowance.calculated_amount).toFixed(2)}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))) :
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                    No Allowances Found
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {openEmployeeViewAllowance && <EmployeeAllowanceView userName={userName}
            open={openEmployeeViewAllowance} close={handleCloseViewEmployeeAllowance}></EmployeeAllowanceView>}
        </Box>
    )
}
export default EmployeeAllowances;