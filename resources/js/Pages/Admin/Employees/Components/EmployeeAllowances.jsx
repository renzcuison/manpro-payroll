import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useEmployeeAllowances } from "../../../../hooks/useAllowance";
import EmployeeAddAllowance from "../Modals/EmployeeAddAllowance";

const EmployeeAllowances = ({userName}) => {
    const [openEmployeeAddAllowance, setOpenEmployeeAddAllowance] = useState(false);
    const {data, isLoading, error, refetch} = useEmployeeAllowances(userName);
    const allowances = data?.allowances || [];

    const handleOpenAddEmployeeAllowance = ()=>{
        setOpenEmployeeAddAllowance(true);
    }
    const handleCloseAddEmployeeAllowance = (reload) => {
        setOpenEmployeeAddAllowance(false);
        if(reload){
            refetch();
        }
    }
    return(
        <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Allowances </Typography>

                <Button variant="contained" color="primary" onClick={() => handleOpenAddEmployeeAllowance()}>
                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                </Button>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Allowance</TableCell>
                            <TableCell align="center">Number</TableCell>
                            <TableCell align="right">Amount</TableCell>
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
                                    <TableCell align="right">
                                        <Typography>₱{(allowance.calculated_amount).toFixed(2)}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))) :
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                    No Allowances Found
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {openEmployeeAddAllowance && <EmployeeAddAllowance userName={userName}
            open={openEmployeeAddAllowance} onClose={handleCloseAddEmployeeAllowance}></EmployeeAddAllowance>}
        </Box>
    )
}
export default EmployeeAllowances;