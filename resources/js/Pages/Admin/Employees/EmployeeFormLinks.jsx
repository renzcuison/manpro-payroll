import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import GenerateFormLink from "./Modals/GenerateFormLink";

const EmployeeFormLinks = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [formLinks, setFormLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ----- Fetch Form Links
    useEffect(() => {
        axiosInstance.get('/employee/getFormLinks', { headers })
            .then((response) => {
                console.log(response.data.form_links);
                setFormLinks(response.data.form_links);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching form links:', error);
                setIsLoading(false);
            });
    }, []);

    // ----- Generate Form Link
    const [openGenerateFormLink, setOpenGenerateFormLink] = useState(false);
    const handleOpenGenerateFormLink = () => {
        setOpenGenerateFormLink(true);
    }
    const handleCloseGenerateFormLink = () => {
        setOpenGenerateFormLink(false);
    }


    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Form Links </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenGenerateFormLink}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Code</TableCell>
                                                <TableCell align="center">Limit</TableCell>
                                                <TableCell align="center">Used</TableCell>
                                                <TableCell align="center">Expiration</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center"></TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {formLinks.map((formlink) => (
                                                <TableRow
                                                    key={formlink.id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    <TableCell align="left">{formlink.unique_code}</TableCell>
                                                    <TableCell align="center">{formlink.limit}</TableCell>
                                                    <TableCell align="center">{formlink.used}</TableCell>
                                                    <TableCell align="center">{dayjs(formlink.expiration).format("MMM D, YYYY h:mm A")}</TableCell>
                                                    <TableCell align="center">{formlink.status}</TableCell>
                                                    <TableCell align="center">{formlink.branch_id || "-"}</TableCell>
                                                    <TableCell align="center">{formlink.department_id || "-"}</TableCell>
                                                    <TableCell align="center">{formlink.unique_code}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>
            </Box>
            {openGenerateFormLink && (
                <GenerateFormLink
                    open={openGenerateFormLink}
                    close={handleCloseGenerateFormLink}
                />
            )}
        </Layout>
    )
}

export default EmployeeFormLinks