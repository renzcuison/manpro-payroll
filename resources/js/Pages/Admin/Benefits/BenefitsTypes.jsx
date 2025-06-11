import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link } from 'react-router-dom';
import BenefitsAdd from './Modals/BenefitsAdd';
import { useBenefits } from '../../../hooks/useBenefits';


const BenefitsTypes = () => {
    const {data, isLoading, error, refetch} = useBenefits();
    const benefits = data?.benefits || [];
    const [openAddBenefitsModal, setOpenAddBenefitsModal] = useState(false);

    const handleOpenAddBenefitsModal = () => {
        setOpenAddBenefitsModal(true);
    }

    const handleCloseAddBenefitsModal = () => {
        setOpenAddBenefitsModal(false);
        refetch();
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
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Employer's Share </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Employee's Share </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {benefits.length > 0 ? (
                                                benefits.map((benefit) => (
                                                    <TableRow key={benefit.id}>
                                                        <TableCell align="center">{benefit.name}</TableCell>
                                                        <TableCell align="center">{benefit.type}</TableCell>
                                                        {benefit.type === 'Amount' && 
                                                        <>
                                                            <TableCell align="center">₱{benefit.employer_amount}</TableCell>
                                                            <TableCell align="center">₱{benefit.employee_amount}</TableCell>
                                                        </>
                                                        }
                                                        {benefit.type === 'Percentage' && 
                                                        <>
                                                            <TableCell align="center">{benefit.employer_percentage}%</TableCell>
                                                            <TableCell align="center">{benefit.employee_percentage}%</TableCell>
                                                        </>
                                                        }    
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center"> No Incentives </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>

                {openAddBenefitsModal &&
                    <BenefitsAdd open={openAddBenefitsModal} close={handleCloseAddBenefitsModal}/>
                }

            </Box>
        </Layout>
    );


}
export default BenefitsTypes;