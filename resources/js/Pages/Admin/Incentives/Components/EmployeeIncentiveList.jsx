import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, Tooltip} from "@mui/material";
import dayjs from "dayjs";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";

const EmployeeIncentivesList = ({incentives, isLoading, onAdd, onEdit }) => {
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
                            <TableCell align="left">Incentives</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Date</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
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
                                        <Typography>{incentive.number || '-'}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        ₱ {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).
                                        format(incentive.calculated_amount)}
                                    </TableCell>
                                    
                                    <TableCell align="center">
                                        <Typography>{dayjs(incentive.created_at).format("MMM DD, YYYY")}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{incentive.status}</Typography>
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
                                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                    No Incentives Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={onAdd} >
                    <p className="m-0">
                        <i className="fa fa-plus mr-1"></i> Add Incentives
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeIncentivesList;
