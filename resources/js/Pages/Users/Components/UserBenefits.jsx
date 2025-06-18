import React from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useBenefits } from "../../../hooks/useBenefits";

const UserBenefits = ({ userName }) => {
    const {employeeBenefits} = useBenefits({userName: userName});
    const benefits = employeeBenefits.data?.benefits || [];

    return (
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Statutory Benefits </Typography>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Benefit</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Employer</TableCell>
                            <TableCell align="center">Employee</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {benefits.length > 0 ? (
                            benefits.map((benefit, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{benefit.name}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{benefit.number}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>₱{(benefit.employer_contribution).toFixed(2)}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>₱{(benefit.employee_contribution).toFixed(2)}</Typography>                               
                                    </TableCell>
                                </TableRow>
                            ))) :
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                    No Benefits Found
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );
};

export default UserBenefits;
