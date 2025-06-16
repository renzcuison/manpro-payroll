import React from "react";
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useIncentives } from "../../../hooks/useIncentives";

const UserIncentives = ({userName}) => {
    const {employeeIncentives} = useIncentives(userName);
    const incentives = employeeIncentives.data?.incentives || [];
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
        </Box>
    )
}
export default UserIncentives;