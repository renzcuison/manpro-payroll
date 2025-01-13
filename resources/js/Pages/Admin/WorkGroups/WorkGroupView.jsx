import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

const WorkGroupView = () => {
    const { group } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);

    const [workGroup, setWorkGroup] = useState([]);
    const [workShift, setWorkShift] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const data = { group };

        axiosInstance.get(`/workshedule/getWorkGroupDetails`, { params: data, headers })
            .then((response) => {
                setWorkGroup(response.data.workGroup);
                setWorkShift(response.data.workShift);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching work group:', error);
            });
    }, []);

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleCloseActions = () => {
        setAnchorEl(null);
    };

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const isAM = hours < 12;
        const formattedHours = hours % 12 || 12;
        const period = isAM ? 'AM' : 'PM';
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }  

    return (
        <Layout title={"Clients"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Work Group</Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenActions}>
                            Actions
                        </Button>
                        
                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions}>
                            <MenuItem>Assign Shift</MenuItem>
                            <MenuItem>Edit Work Group</MenuItem>
                            <MenuItem>Delete Work Group</MenuItem>
                        </Menu>

                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                    
                        <Grid item xs={4}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px'}}>
                                
                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={4}> Assigned Shift </Grid>
                                    <Grid item xs={8}> {workShift.name} </Grid>
                                </Grid>

                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={4}> Shift Type </Grid>
                                    <Grid item xs={8}> {workShift.shift_type} </Grid>
                                </Grid>

                                {workShift.shift_type === "Regular" ? (
                                    <Grid container spacing={4} sx={{ p: 1 }}>
                                        <Grid item xs={4}> Attendance </Grid>
                                        <Grid item xs={8}> {formatTime(workShift.regular_time_in)} - {formatTime(workShift.regular_time_out)} </Grid>
                                    </Grid>
                                ) : workShift.shift_type === "Split" ? (
                                    <>
                                        <Grid container spacing={4} sx={{ p: 1 }}>
                                            <Grid item xs={4}> {workShift.split_first_label} </Grid>
                                            <Grid item xs={8}> {formatTime(workShift.split_first_time_in)} - {formatTime(workShift.split_first_time_out)} </Grid>
                                        </Grid>
                                        <Grid container spacing={4} sx={{ p: 1 }}>
                                            <Grid item xs={4}> {workShift.split_second_label} </Grid>
                                            <Grid item xs={8}> {formatTime(workShift.split_second_time_in)} - {formatTime(workShift.split_second_time_out)} </Grid>
                                        </Grid>
                                    </>
                                ) : null}


                                <Grid container spacing={4} sx={{ p: 1 }}>
                                    <Grid item xs={4}> Overtime </Grid>
                                    <Grid item xs={8}> {formatTime(workShift.over_time_in)} - {formatTime(workShift.over_time_out)} </Grid>
                                </Grid>

                            </Box>
                        </Grid>

                        <Grid item xs={8}>
                            <Box sx={{ mb: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

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
                                                        <TableCell align="center">Name</TableCell>
                                                        <TableCell align="center">Branch</TableCell>
                                                        <TableCell align="center">Department</TableCell>
                                                        <TableCell align="center">Role</TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {employees.map((employee) => (
                                                        <TableRow
                                                            key={employee.id}
                                                            component={Link}
                                                            to={`/admin/employee/${employee.user_name}`}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            <TableCell align="left"> {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </TableCell>
                                                            <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                            <TableCell align="center">{employee.department || '-'}</TableCell>
                                                            <TableCell align="center">{employee.role || '-'}</TableCell>
                                                            <TableCell align="center">{employee.employment_type || '-'}</TableCell>
                                                            <TableCell align="center">{employee.employment_status || '-'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </Box>
                        </Grid>


                    </Grid>
                </Box>
            </Box>
        </Layout >
    )
}

export default WorkGroupView
