import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance from "../../../../utils/axiosConfig";

const EmployeeAllowanceList = ({ userName, headers, onAdd }) => {
    const [allowances, setAllowances] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/allowance/getEmployeeAllowance`, { headers, params: { username: userName },
            }).then((response) => {
                setAllowances(response.data.allowances);
            }).catch((error) => {
                console.error("Error fetching allowances:", error);
            });
    }, []);

    return (
        <Box>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Allowance</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Date Added</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allowances.length > 0 ? (
                            allowances.map((allowance, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography>{allowance.benefit}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{allowance.number}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{allowance.amount}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{dayjs(allowance.created_at).format("MMM DD YYYY, HH:mm:ss A")}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }}>
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
                        <i className="fa fa-plus"></i> Add Allowance
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeAllowanceList;
