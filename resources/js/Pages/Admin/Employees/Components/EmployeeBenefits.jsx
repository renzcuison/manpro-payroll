import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

import EmployeeAddBenefit from '../Modals/EmployeeAddBenefit';

const EmployeeBenefits = ({ userName, headers }) => {

    const [openEmployeeAddBenefit, setOpenEmployeeAddBenefit] = useState(false);
    
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

    const handleOpenAddEmployeeBenefit = () => {
        console.log("handleOpenAddEmployeeBenefit()");
        setOpenEmployeeAddBenefit(true);
    }
    const handleCloseAddEmployeeBenefit = () => {
        console.log("handleCloseAddEmployeeBenefit()");
        setOpenEmployeeAddBenefit(false);
    }

    return (
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Statutory Benefits </Typography>

                <Button variant="contained" color="primary" onClick={() => handleOpenAddEmployeeBenefit()}>
                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                </Button>
            </Box>

            <TableContainer>
                <Table size="small">
                    {/* <TableHead>
                        <TableRow>
                            <TableCell align="center" rowSpan={2}>Benefit</TableCell>
                            <TableCell align="center" rowSpan={2}>Number</TableCell>
                            <TableCell align="center" colSpan={2}>Contribution</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">Employer</TableCell>
                            <TableCell align="center">Employee</TableCell>
                        </TableRow>
                    </TableHead> */}
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Benefit</TableCell>
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
                                        <Typography>{benefit.benefit}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography>{benefit.number}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography> </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography> </Typography>
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

            
            {openEmployeeAddBenefit &&
                <EmployeeAddBenefit open={openEmployeeAddBenefit} close={handleCloseAddEmployeeBenefit} userName={userName} />
            }
        </Box>
    );
};

export default EmployeeBenefits;
