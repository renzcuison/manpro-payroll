import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Link } from 'react-router-dom';

import AllowanceAdd from './Modals/AllowanceAdd';

const AllowanceTypes = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);

    const [openAddAllowanceModal, setOpenAddAllowanceModal] = useState(false);

    const [allowances, setAllowances] = useState([]);

    useEffect(() => {
        getAllowanceTypes();
    }, []);

    const getAllowanceTypes = () => {
        setIsLoading(true);
        axiosInstance.get('/allowance/getAllowances', { headers })
            .then((response) => {
                setAllowances(response.data.allowances);
                setIsLoading(false);
            }).catch((error) => {
                console.error('Error fetching allowances:', error);
                setIsLoading(false);
            });
    }

    const handleOpenAddAllowanceModal = () => {
        setOpenAddAllowanceModal(true);
    }

    const handleCloseAddAllowanceModal = () => {
        setOpenAddAllowanceModal(false);
        getAllowanceTypes();
    }

    return (
        <Layout title={"LeaveCreditList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Link to="/admin/employees/allowance" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}></i>
                            </Link>
                            &nbsp; Allowance Types
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddAllowanceModal}>
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
                                            {allowances.length > 0 ? (
                                                allowances.map((allowance) => (
                                                    <TableRow key={allowance.id}>
                                                        <TableCell align="center">{allowance.name}</TableCell>
                                                        <TableCell align="center">{allowance.type}</TableCell>

                                                        {allowance.type === "Amount" && (
                                                            <TableCell align="center">₱{allowance.amount}</TableCell>
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

            </Box>
        </Layout>
    );
};

export default AllowanceTypes;