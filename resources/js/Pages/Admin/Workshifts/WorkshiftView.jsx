import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

const WorkshiftView = () => {
    const { id } = useParams();
    const { shift } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState(''); 

    useEffect(() => {
        console.log("ID: " + id);
        console.log("Shift: " + shift);

        const data = {
            id: id,
            shift, shift
        };

        axiosInstance.get(`/workshifts/getWorkShiftDetails`, { params: data, headers })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
            });
    }, []);
    
    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>
    
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Work Shift </Typography>
                </Box>
        
                <Grid container spacing={4} sx={{ mt: 2 }}>

                    <Grid item xs={4}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                            <Typography variant="h5"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }  </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={8}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            
                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={4}>
                                    <Typography> Full Name </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="h6"> {employee.first_name} {employee.middle_name ? '' : employee.middle_name } {employee.last_name} {employee.suffix ? '' : employee.suffix }</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={4}>
                                    <Typography> Email Address </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="h6"> {employee.email}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={4}>
                                    <Typography> Contact Number </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="h6"> {employee.contact_number}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={4} sx={{ py: 1 }}>
                                <Grid item xs={4}>
                                    <Typography> Address </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="h6"> {employee.address}</Typography>
                                </Grid>
                            </Grid>

                        </Box>
                    </Grid>
                </Grid>

            </Box>
        </Layout >
    )
}

export default WorkshiftView
