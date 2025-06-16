import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Tooltip} from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EmployeeIncentiveView from "../../Incentives/Modals/EmployeeIncentiveView";

const EmployeeIncentives = ({userName, incentives, onRefresh}) => {
    const [openEmployeeViewIncentives, setOpenEmployeeViewIncentives] = useState(false);
    
    const handleOpenViewEmployeeIncentive = ()=>{
        setOpenEmployeeViewIncentives(true);
    }
    const handleCloseViewEmployeeIncentive = (reload) => {
        setOpenEmployeeViewIncentives(false);
        if(reload){
            onRefresh();
        }
    }
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Incentives </Typography>

                <Button variant="text" sx={{fontSize: 15, textAlign:'right'}} onClick={() => handleOpenViewEmployeeIncentive()}>
                    View
                </Button>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Incentive</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {incentives.length > 0 ? (
                            incentives.map((allowance, index) => (
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
                                    No Incentives Found
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {openEmployeeViewIncentives && <EmployeeIncentiveView userName={userName}
            open={openEmployeeViewIncentives} close={handleCloseViewEmployeeIncentive}/>}
        </Box>
    )
}
export default EmployeeIncentives;