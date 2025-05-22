import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const EmployeeDeductions = ({ userName, headers }) => {

    const [benefits, setBenefits] = useState([]);

    // useEffect(() => {
    //     axiosInstance.get(`/benefits/getEmployeeBenefits`, { headers, params: { username: userName } })
    //         .then((response) => {
    //             setBenefits(response.data.benefits);
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching benefits:', error);
    //         });
    // }, []);

    return (
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }} > Deductions </Typography>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"> Name </TableCell>
                            <TableCell align="center"> Deduction Period </TableCell>
                            <TableCell align="center"> Amount </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            benefits.length > 0 ? (
                                benefits.map((benefit, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Typography>{benefit.id}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>{benefit.id}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>{benefit.id}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))) :
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                        No Deductions Found
                                    </TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            {/* <Box display="flex" justifyContent="center" sx={{ mt: '20px', gap: 2 }}> */}
            {/* <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => handleOpenAddEmployeeBenefit()} > */}
            {/* <p className="m-0"> */}
            {/* <i className="fa fa-plus"></i>{" "}Add Benefit */}
            {/* </p> */}
            {/* </Button> */}
            {/* </Box> */}
        </Box>
    );
};

export default EmployeeDeductions;
