import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, Avatar, FormControl, FormControlLabel, Checkbox, ListItemText } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

const LeaveCreditList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    const [applicationTypes, setApplicationTypes] = useState([]);

    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        axiosInstance.get('/employee/getEmployeeLeaveCredits', { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clients:', error);
                setIsLoading(false);
            });

        axiosInstance.get("/applications/getApplicationTypes", { headers })
            .then((response) => {
                setApplicationTypes(response.data.types);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching application types:", error);
                setIsLoading(false);
            });
    }, []);

    const [blobMap, setBlobMap] = useState({});

    const renderImage = (id, data, mime) => {
        if (!blobMap[id]) {
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            const newBlob = URL.createObjectURL(blob);

            setBlobMap((prev) => ({ ...prev, [id]: newBlob }));

            return newBlob;
        } else {
            return blobMap[id];
        }
    }

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name} ${employee.suffix || ''}`.toLowerCase();
        return fullName.includes(searchName.toLowerCase());
    });

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Leave Credits </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid container item direction="row" justifyContent="flex-start" xs={4} spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <TextField
                                            id="searchName"
                                            label="Search Name"
                                            variant="outlined"
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container item direction="row" justifyContent="flex-end" xs={4} spacing={2}></Grid>
                        </Grid>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Name</TableCell>
                                                {applicationTypes.map((appType) => (
                                                    <TableCell key={appType.name} align="center">{appType.name}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredEmployees.map((employee) => (
                                                <TableRow key={employee.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                                    <TableCell align="left">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                                <Avatar src={renderImage(employee.id, employee.avatar, employee.avatar_mime)} sx={{ mr: 2 }} />
                                                                {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                                                            </Box>
                                                        </Link>
                                                    </TableCell>

                                                    {applicationTypes.map((appType) => (
                                                        <TableCell align="center">{appType.id}</TableCell>
                                                    ))}
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
        </Layout >
    )
}

export default LeaveCreditList