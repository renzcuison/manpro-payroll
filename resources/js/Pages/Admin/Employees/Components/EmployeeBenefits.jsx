import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useEmployeeBenefits } from "../../../../hooks/useBenefits";

import EmployeeAddBenefit from '../Modals/EmployeeAddBenefit';

const EmployeeBenefits = ({ userName, headers }) => {
    const [openEmployeeAddBenefit, setOpenEmployeeAddBenefit] = useState(false);
    const {data, refetch} = useEmployeeBenefits(userName);
    const benefits = data?.benefits || [];
    
    const handleOpenAddEmployeeBenefit = () => {
        console.log("handleOpenAddEmployeeBenefit()");
        setOpenEmployeeAddBenefit(true);
    }

    const handleCloseAddEmployeeBenefit = (reload) => {
        setOpenEmployeeAddBenefit(false);
        if(reload){
            refetch();
        }
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
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Benefit</TableCell>
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
                <EmployeeAddBenefit open={openEmployeeAddBenefit} onClose={handleCloseAddEmployeeBenefit} userName={userName} />
            }
        </Box>
    );
};

export default EmployeeBenefits;
