import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";


const EmployeeBenefitList = ({ benefits,  onAdd, onEdit }) => {
    return (
        <Box>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Benefits</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Employer's Share</TableCell>
                            <TableCell align="center">Employee's Share</TableCell>
                            <TableCell align="center">Date</TableCell>
                            <TableCell align="center">Actions</TableCell>
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
                                    <TableCell align="center">
                                        <Typography>{dayjs(benefit.created_at).format("MMMM DD, YYYY")}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => onEdit(index)} variant="text" sx={{ width: '40px', minWidth: '40px' }}>
                                            <i class="fa fa-pencil-square-o fa-lg"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                    No Benefits Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={onAdd} >
                    <p className="m-0">
                        <i className="fa fa-plus mr-2"></i> Add Benefits
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeBenefitList;
