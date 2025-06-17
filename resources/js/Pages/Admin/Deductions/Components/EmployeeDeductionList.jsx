import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, Typography, Tooltip} from "@mui/material";
import dayjs from "dayjs";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";


const EmployeeDeductionList = ({ deductions, isLoading, onAdd, onEdit }) => {
    if(isLoading){
        return (
            <Box display='flex' justifyContent='center'>
                <LoadingSpinner/>
            </Box>
        )
    }
    return (
        <Box>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Benefits</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Date</TableCell>
                            <TableCell align="center">Actions</TableCell>
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
                                        <Typography>{deduction.number || '-'}</Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        ₱ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).
                                        format(deduction.calculated_amount)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{dayjs(deduction.created_at).format("MMMM DD, YYYY")}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Edit">
                                            <Button onClick={() => onEdit(index)} variant="text" sx={{ width: '40px', minWidth: '40px' }}>
                                                <i className="fa fa-pencil-square-o fa-lg"/>
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                    No Deductions Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={onAdd} >
                    <p className="m-0">
                        <i className="fa fa-plus mr-2"></i> Add Deductions
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeDeductionList;
