import React from "react";
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useEmployeeIncentives } from "../../../hooks/useIncentives";

const UserIncentives = ({userName}) => {
    const {employeeIncentives} = useEmployeeIncentives(userName);
    const incentives = employeeIncentives?.incentives || [];
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Incentives </Typography>
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
                            incentives.map((incentive, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{incentive.name}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{incentive.number}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        ₱ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(incentive.calculated_amount)}
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
        </Box>
    )
}
export default UserIncentives;