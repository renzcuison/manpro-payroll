import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { Link } from 'react-router-dom';
import DeductionsAdd from './Modals/DeductionsAdd';
import DeductionsEdit from './Modals/DeductionsEdit';
import { useDeductions } from '../../../hooks/useDeductions';

const DeductionsType = () => {
    const {deductions: deductionQuery} = useDeductions({loadDeductions: true});
    const deductions = deductionQuery.data?.deductions || [];

    const [openAddDeductionsModal, setOpenAddDeductonsModal] = useState(false);
    const [openEditDeductionsModal, setOpenEditDeductionsModal] = useState(false);
    const [selectedDeduction, setSelectedDeduction] = useState(null);

    const handleOpenAddDeductionsModal = () => {
        setOpenAddDeductonsModal(true);
    }

    const handleCloseAddDeductionsModal = () => {
        setOpenAddDeductonsModal(false);
        deductionQuery.refetch();
    }

    const handleOpenEditAllowanceModal = (deduction) => {
        setOpenEditDeductionsModal(true);
        setSelectedDeduction(deduction);
    }
    const handleCloseEditDeductionsModal = (reload) => {
        setOpenEditDeductionsModal(false);
        setSelectedDeduction(null);
        if(reload){
            deductionQuery.refetch();
        }
    }

    return (
        <Layout title={"DeductionsList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/compensation/deductions" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Deductions Types
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddDeductionsModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {deductions.isLoading ? (
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
                                            {deductions.length > 0 ? (
                                                deductions.map((deduction, index) => (
                                                    <TableRow key={deduction.id} onClick={() => handleOpenEditAllowanceModal(deduction)}
                                                    sx={{ backgroundColor: index % 2 === 0 ? '#f8f8f8' : '#ffffff',
                                                     '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }}>
                                                        <TableCell align="center">{deduction.name}</TableCell>
                                                        <TableCell align="center">{deduction.type}</TableCell>
                                                        {deduction.type === 'Amount' && 
                                                        <TableCell align="center">
                                                            ₱ {new Intl.NumberFormat('en-US', 
                                                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(deduction.amount)}
                                                         </TableCell>
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
                    <DeductionsAdd open={openAddDeductionsModal} close={handleCloseAddDeductionsModal}/>
                }
                {openEditDeductionsModal &&
                    <DeductionsEdit open={openEditDeductionsModal} close={handleCloseEditDeductionsModal} deduction={selectedDeduction}/>
                }
            </Box>
        </Layout>
    );


}
export default DeductionsType;