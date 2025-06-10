import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance from "../../../../utils/axiosConfig";

const EmployeeIncentivesList = ({ userName, headers, onAdd }) => {
    const [incentives, setIncentives] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/compensation/getEmployeeIncentives`, { headers, params: { username: userName },
            }).then((response) => {
                setIncentives(response.data.incentives);
            }).catch((error) => {
                console.error("Error fetching incentives:", error);
            });
    }, []);

    console.log(incentives);
    return (
        <Box>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Incentives</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="center">Value</TableCell>
                            <TableCell align="center">Date Added</TableCell>
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
                                        <Typography>{incentive.number}</Typography>
                                    </TableCell>
                                    {incentive.type === 'Amount' &&
                                    <TableCell align="center">
                                        <Typography>₱{incentive.amount}</Typography>
                                    </TableCell>}
                                    {incentive.type === 'Percentage' &&
                                    <TableCell align="center">
                                        <Typography>{incentive.percentage}%</Typography>
                                    </TableCell>}
                                    <TableCell align="center">
                                        <Typography>{dayjs(incentive.created_at).format("MMM DD YYYY, HH:mm:ss A")}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }}>
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
                        <i className="fa fa-plus"></i> Add Incentives
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeIncentivesList;
