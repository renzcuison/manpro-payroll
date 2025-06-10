import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance from "../../../../utils/axiosConfig";

const EmployeeBenefitList = ({ userName, headers, onAdd }) => {
    const [benefits, setBenefits] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/compensation/getEmployeeBenefits`, { headers, params: { username: userName },
            }).then((response) => {
                setBenefits(response.data.benefits);
            }).catch((error) => {
                console.error("Error fetching benefits:", error);
            });
    }, []);

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
                            <TableCell align="center">Date Added</TableCell>
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
                                    {benefit.type === 'Amount' &&
                                    <>
                                        <TableCell align="center">
                                            <Typography>₱{benefit.employer_amount}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>₱{benefit.employee_amount}</Typography>
                                        </TableCell>
                                    </>
                                    }
                                    
                                    {benefit.type === 'Percentage' && 
                                    <>
                                        <TableCell align="center">
                                            <Typography>{benefit.employer_percentage}%</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>{benefit.employee_percentage}%</Typography>
                                        </TableCell>
                                    </>
                                    }

                                    <TableCell align="center">
                                        <Typography>{dayjs(benefit.created_at).format("MMM DD YYYY, HH:mm:ss A")}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}>
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
                        <i className="fa fa-plus"></i> Add Benefits
                    </p>
                </Button>
            </Box>
        </Box>
    );
};

export default EmployeeBenefitList;
