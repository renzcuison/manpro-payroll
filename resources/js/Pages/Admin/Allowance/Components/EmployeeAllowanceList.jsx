import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";


const EmployeeAllowanceList = ({ allowances, onAdd, onEdit }) => {
    return (
        <Box>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Allowance</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Date</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allowances.length > 0 ? (
                            allowances.map((allowance, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{allowance.name}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{allowance.number}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>₱{(allowance.calculated_amount).toFixed(2)}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{dayjs(allowance.created_at).format("MMM DD, YYYY")}</Typography>
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
                                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                    No Allowance Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={onAdd} >
                    <p className="m-0">
                        <i className="fa fa-plus mr-1"></i> Add Allowance
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeAllowanceList;
