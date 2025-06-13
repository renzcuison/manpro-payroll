import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { Link } from 'react-router-dom';
import DeductionsAdd from './Modals/DeductionsAdd';
import { useDeductions } from '../../../hooks/useDeductions';

const DeductionsType = () => {
    const {deductions} = useDeductions();

    const deductionsData = deductions.data?.deductions || [];
    const [openAddDeductionsModal, setOpenAddDeductonsModal] = useState(false);

    const handleOpenAddBenefitsModal = () => {
        setOpenAddDeductonsModal(true);
    }

    const handleCloseAddBenefitsModal = () => {
        setOpenAddDeductonsModal(false);
        deductions.refetch();
    }

    return (
        <Layout title={"BenefitsList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/employees/benefits" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Benefits Types
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddBenefitsModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
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
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Amount/Percentage </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deductionsData.length > 0 ? (
                                                deductionsData.map((deduction) => (
                                                    <TableRow key={deduction.id}>
                                                        <TableCell align="center">{deduction.name}</TableCell>
                                                        <TableCell align="center">{deduction.type}</TableCell>
                                                        {deduction.type === 'Amount' && 
                                                        <>
                                                            <TableCell align="center">₱{deduction.amount}</TableCell>
                                                        </>
                                                        }
                                                        {deduction.type === 'Percentage' && 
                                                        <>
                                                            <TableCell align="center">{deduction.percentage}%</TableCell>
                                                        </>
                                                        }    
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center"> No Deductions </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>

                {openAddDeductionsModal &&
                    <DeductionsAdd open={openAddDeductionsModal} close={handleCloseAddBenefitsModal}/>
                }

            </Box>
        </Layout>
    );


}
export default DeductionsType;