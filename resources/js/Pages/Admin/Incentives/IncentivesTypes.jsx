import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link } from 'react-router-dom';
import { useIncentives } from '../../../hooks/useIncentives';

import IncentivesAdd from './Modals/IncentivesAdd';

const IncentivesTypes = () => {
    const { incentives: incentivesQuery } = useIncentives();
    const incentives = incentivesQuery.data?.incentives || [];
    const [openAddIncentiveseModal, setOpenAddIncentivesModal] = useState(false);

    const handleOpenAddIncentiveseModal = () => {
        setOpenAddIncentivesModal(true);
    }

    const handleCloseAddIncentiveseModal = () => {
        setOpenAddIncentivesModal(false);
        refetch();
    }

    return (
        <Layout title={"IncentivesList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/employees/incentives" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Incentives Types
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddIncentiveseModal}>
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
                                            {incentives.length > 0 ? (
                                                incentives.map((incentive) => (
                                                    <TableRow key={incentive.id}>
                                                        <TableCell align="center">{incentive.name}</TableCell>
                                                        <TableCell align="center">{incentive.type}</TableCell>

                                                        {incentive.type === "Amount" && (
                                                            <TableCell align="center">₱{incentive.amount}</TableCell>
                                                        )}

                                                        {incentive.type === "Percentage" && (
                                                            <TableCell align="center">{incentive.percentage}%</TableCell>
                                                        )}
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

                {openAddIncentiveseModal &&
                    <IncentivesAdd open={openAddIncentiveseModal} close={handleCloseAddIncentiveseModal}/>
                }

            </Box>
        </Layout>
    );


}
export default IncentivesTypes;