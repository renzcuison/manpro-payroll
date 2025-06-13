import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Tooltip} from "@mui/material";
import { useEmployeeIncentives } from "../../../../hooks/useIncentives";
import EmployeeAddAllowance from "../Modals/EmployeeAddAllowance";
import EmployeeAddIncentives from "../Modals/EmployeeAddIncentives";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EmployeeIncentiveView from "../../Incentives/Modals/EmployeeIncentiveView";

const EmployeeIncentives = ({userName}) => {
    const [openEmployeeViewIncentives, setOpenEmployeeViewIncentives] = useState(false);
    const {data, refetch} = useEmployeeIncentives(userName);
    const incentives = data?.incentives || [];  

    const handleOpenViewEmployeeIncentive = ()=>{
        setOpenEmployeeViewIncentives(true);
    }
    const handleCloseViewEmployeeIncentive = (reload) => {
        setOpenEmployeeViewIncentives(false);
        if(reload){
            refetch();
        }
    }
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Incentives </Typography>

                <Tooltip title="Add Incentives">
                    <IconButton color="primary" onClick={() => handleOpenViewEmployeeIncentive()}>
                        <VisibilityOutlinedIcon sx={{fontSize: 30}}/>
                    </IconButton>
                </Tooltip>
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