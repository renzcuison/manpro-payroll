import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

const ProfileBenefits = ({ userName, headers }) => {
    const [benefits, setBenefits] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/benefits/getEmployeeBenefits`, { headers, params: { username: userName } })
            .then((response) => {
                setBenefits(response.data.benefits);
            })
            .catch((error) => {
                console.error('Error fetching benefits:', error);
            });
    }, []);
    return (
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Statutory Benefits </Typography>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Benefit</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Employer</TableCell>
                            <TableCell align="center">Employee</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {benefits?.length > 0 ? (
                            benefits.map((benefit, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{benefit.benefit}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{benefit.number}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{(benefit.employer_contribution).toFixed(2)}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{(benefit.employee_contribution).toFixed(2)}</Typography>  
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

export default ProfileBenefits;
