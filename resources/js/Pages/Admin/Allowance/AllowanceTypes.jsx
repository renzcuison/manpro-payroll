import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { Link } from 'react-router-dom';
import { useAllowance } from '../../../hooks/useAllowances';

import AllowanceAdd from './Modals/AllowanceAdd';
import AllowanceEdit from './Modals/AllowanceEdit';

const AllowanceTypes = () => {
    const {allowancesData, isAllowancesLoading, refetchAllowances} = useAllowance();
    const allowances = allowancesData?.allowances || [];

    const [openAddAllowanceModal, setOpenAddAllowanceModal] = useState(false);
    const [openEditAllowanceModal, setOpenEditAllowanceModal] = useState(false);
    const [selectedAllowance, setSelectedAllowance] = useState(null);

    const handleOpenAddAllowanceModal = () => {
        setOpenAddAllowanceModal(true);
    }

    const handleCloseAddAllowanceModal = () => {
        setOpenAddAllowanceModal(false);
        refetchAllowances();
    }

    const handleOpenEditAllowanceModal = (allowance) => {
        setOpenEditAllowanceModal(true);
        setSelectedAllowance(allowance);
    }
    const handleCloseEditAllowanceModal = (reload) => {
        setOpenEditAllowanceModal(false);
        setSelectedAllowance(null);
        if(reload){
            refetchAllowances();
        }
    }
    
    const getPaymentScheduleName = (scheduleNum) => {
        let scheduleName = '';
        switch(scheduleNum){
            case 1: scheduleName = 'One Time - First Cutoff'; break;
            case 2: scheduleName = 'One Time - Second Cutoff'; break;
            case 3: scheduleName = 'Split - First & Second Cutoff'; break;
        }
        return scheduleName;
    }
    return (
        <Layout title={"LeaveCreditList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/compensation/allowance" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Allowances Types
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddAllowanceModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isAllowancesLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Name </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Type </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Payment Schedule </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Amount/Percentage </TableCell>
                                                
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {allowances.length > 0 ? (
                                                allowances.map((allowance, index) => (
                                                    <TableRow key={allowance.id} onClick={() => handleOpenEditAllowanceModal(allowance)}
                                                    sx={{ backgroundColor: index % 2 === 0 ? '#f8f8f8' : '#ffffff',
                                                     '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }}>
                                                        <TableCell align="center">{allowance.name}</TableCell>
                                                        <TableCell align="center">{allowance.type}</TableCell>
                                                        <TableCell align="center">{getPaymentScheduleName(allowance.payment_schedule)}</TableCell>

                                                        {allowance.type === "Amount" && (
                                                            <TableCell align="center">
                                                                ₱ {new Intl.NumberFormat('en-US', 
                                                                { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(allowance.amount)}
                                                            </TableCell>
                                                        )}

                                                        {allowance.type === "Percentage" && (
                                                            <TableCell align="center">{allowance.percentage}%</TableCell>
                                                        )}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center"> No Allowances </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>

                {openAddAllowanceModal &&
                    <AllowanceAdd open={openAddAllowanceModal} close={handleCloseAddAllowanceModal}/>
                }
                {openEditAllowanceModal &&
                    <AllowanceEdit open={openEditAllowanceModal} close={handleCloseEditAllowanceModal} allowance={selectedAllowance}/>
                }

            </Box>
        </Layout>
    );
};

export default AllowanceTypes;