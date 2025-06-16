import React from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useDeductions } from "../../../hooks/useDeductions";

const UserDeductions = ({ userName }) => {
    const {employeeDeductions} = useDeductions(userName);

    const deductions = employeeDeductions.data?.deductions || [];

    return (
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Deductions </Typography>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Deduction</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Amount</TableCell>
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
                                    <TableCell align="center">
                                        <Typography>₱{(deduction.calcuated_amount).toFixed(2)}</Typography>
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

        </Box>
    );
};

export default UserDeductions;
