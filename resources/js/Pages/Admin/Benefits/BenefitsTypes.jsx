import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { Link } from 'react-router-dom';
import BenefitsAdd from './Modals/BenefitsAdd';
import { useBenefit } from '../../../hooks/useBenefits';
import BenefitsEdit from './Modals/BenefitsEdit';

const BenefitsTypes = () => {
    const {benefitsData, isBenefitsLoading, refetchBenefits} = useBenefit();
    
    const benefits = benefitsData?.benefits || [];
    const [openAddBenefitsModal, setOpenAddBenefitsModal] = useState(false);
    const [openEditBenefitsModal, setOpenEditBenefitsModal] = useState(false);
    const [selectedBenefit, setSelectedBenefit] = useState(null);

    const handleOpenAddBenefitsModal = () => {
        setOpenAddBenefitsModal(true);
    }

    const handleCloseAddBenefitsModal = (reload) => {
        setOpenAddBenefitsModal(false);
        if(reload){
            refetchBenefits();
        }
    }

    const handleOpenEditBenefitsModal = (incentive) => {
        setSelectedBenefit(incentive);
        setOpenEditBenefitsModal(true);
        
    }
    const handleCloseEditBenefitsModal = (reload) => {
        setOpenEditBenefitsModal(false);
        setSelectedBenefit(null);
        if(reload){
            refetchBenefits();
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
        <Layout title={"BenefitsList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/compensation/benefits" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Statutory Benefits Types
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddBenefitsModal}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isBenefitsLoading? (
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
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Employer's Share </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="center"> Employee's Share </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {benefits.length > 0 ? (
                                                benefits.map((benefit, index) => (
                                                    <TableRow key={benefit.id} onClick={() => handleOpenEditBenefitsModal(benefit)}
                                                    sx={{ backgroundColor: index % 2 === 0 ? '#f8f8f8' : '#ffffff',
                                                     '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' } }}>
                                                        <TableCell align="center">{benefit.name}</TableCell>
                                                        <TableCell align="center">{benefit.type}</TableCell>
                                                        <TableCell align="center">{getPaymentScheduleName(benefit.payment_schedule)}</TableCell>
                                                        {benefit.type === 'Amount' && 
                                                            <>
                                                                <TableCell align="center">
                                                                    ₱ {new Intl.NumberFormat('en-US', 
                                                                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(benefit.employer_amount)}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    ₱ {new Intl.NumberFormat('en-US', 
                                                                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(benefit.employee_amount)}
                                                                </TableCell>
                                                            </>
                                                        }
                                                        {benefit.type === 'Percentage' && 
                                                            <>
                                                                <TableCell align="center">{benefit.employer_percentage}%</TableCell>
                                                                <TableCell align="center">{benefit.employee_percentage}%</TableCell>
                                                            </>
                                                        }
                                                        {benefit.type === "Bracket Amount" && 
                                                        <>
                                                            <TableCell align="center">
                                                                ₱ {new Intl.NumberFormat('en-US', 
                                                                { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(benefit.lowest_employer_share)} - 
                                                                ₱ {new Intl.NumberFormat('en-US', 
                                                                { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(benefit.highest_employer_share)}
                                                            </TableCell> 

                                                           <TableCell align="center">
                                                                ₱ {new Intl.NumberFormat('en-US', 
                                                                { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(benefit.lowest_employee_share)} - 
                                                                ₱ {new Intl.NumberFormat('en-US', 
                                                                { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(benefit.highest_employee_share)}
                                                            </TableCell>                   
                                                        </>
                                                        }   
                                                        {benefit.type === "Bracket Percentage" && 
                                                        <>  
                                                            <TableCell align="center">
                                                                {benefit.lowest_employer_share}% - {benefit.highest_employer_share}%
                                                            </TableCell>

                                                            <TableCell align="center">
                                                                {benefit.lowest_employee_share}% - {benefit.highest_employee_share}%
                                                            </TableCell> 
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
                {openEditBenefitsModal &&
                    <BenefitsEdit open={openEditBenefitsModal} close={handleCloseEditBenefitsModal} benefit={selectedBenefit}/>
                }
                
            </Box>
        </Layout>
    );


}
export default BenefitsTypes;