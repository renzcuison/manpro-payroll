import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useEmployeeIncentives } from "../../../../hooks/useIncentives";
import EmployeeAddAllowance from "../Modals/EmployeeAddAllowance";
import EmployeeAddIncentives from "../Modals/EmployeeAddIncentives";

const EmployeeIncentives = ({userName}) => {
    const [openEmployeeAddIncentives, setOpenEmployeeAddIncentives] = useState(false);
    const {data, refetch} = useEmployeeIncentives(userName);
    const incentives = data?.incentives || [];

    const handleOpenAddEmployeeAllowance = ()=>{
        setOpenEmployeeAddIncentives(true);
    }
    const handleCloseAddEmployeeAllowance = (reload) => {
        setOpenEmployeeAddIncentives(false);
        if(reload){
            refetch();
        }
    }
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Incentives </Typography>

                <Button variant="contained" color="primary" onClick={() => handleOpenAddEmployeeAllowance()}>
                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
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
            {openEmployeeAddIncentives && <EmployeeAddIncentives userName={userName}
            open={openEmployeeAddIncentives} onClose={handleCloseAddEmployeeAllowance}/>}
        </Box>
    )
}
export default EmployeeIncentives;