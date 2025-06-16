import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Tooltip} from "@mui/material";
import EmployeeBenefitView from "../../Benefits/Modals/EmployeeBenefitView";

const EmployeeBenefits = ({ userName, benefits, onRefresh }) => {
    const [openEmployeeViewBenefit, setOpenEmployeeViewBenefit] = useState(false);
    
    
    const handleCloseViewEmployeeBenefits = () => {
        setOpenEmployeeViewBenefit(true);
    }

    const handleCloseAddEmployeeBenefit = (reload) => {
        setOpenEmployeeViewBenefit(false);
        if(reload){
            onRefresh();    
        }
    }

    return (
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Statutory Benefits </Typography>

                <Button variant="text" sx={{fontSize: 15, textAlign:'right'}} onClick={() => handleCloseViewEmployeeBenefits()}>
                    View
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

            
            {openEmployeeViewBenefit &&
                <EmployeeBenefitView open={openEmployeeViewBenefit} close={handleCloseAddEmployeeBenefit} userName={userName} />
            }
        </Box>
    );
};

export default EmployeeBenefits;
