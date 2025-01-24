import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import AssignShift from '../WorkGroups/Modals/AssignShift';
import EditWorkGroup from '../WorkGroups/Modals/EditWorkGroup';
// import Error404 from "../Pages/Errors/Error404";

import Error404 from "../../Errors/Error404";

const WorkGroupView = () => {
    const { client, group } = useParams();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [showError404, setShowError404] = useState(false);

    const [workGroup, setWorkGroup] = useState([]);
    const [workShift, setWorkShift] = useState([]);
    const [workHours, setWorkHours] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [openAssignShiftModal, setOpenAssignShiftModal] = useState(false);
    const [openEditWorkGroupModal, setOpenEditWorkGroupModal] = useState(false);

    useEffect(() => {
        getWorkGroupDetails();
    }, []);

    const getWorkGroupDetails = () => {

        const data = { client: client, group: group };

        axiosInstance.get(`/workshedule/getWorkGroupDetails`, { params: data, headers })
            .then((response) => {
                const { workGroup, workShift, workHours, employees } = response.data;

                if (!workGroup && !workShift && !workHours && !employees) {
                    setShowError404(true);
                    return;
                }

                setWorkGroup(workGroup);
                setWorkShift(workShift);
                setWorkHours(workHours);
                setEmployees(employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching work group:', error);
            });
    }

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

    const handleOpenAssignShiftModal = () => {
        setOpenAssignShiftModal(true);
    }

    const handleCloseAssignShiftModal = () => {
        setOpenAssignShiftModal(false);
    }

    const handleOpenEditWorkGroupModal = () => {
        setOpenEditWorkGroupModal(true);
    }

    const handleCloseEditWorkGroupModal = () => {
        setOpenEditWorkGroupModal(false);
    }

    if (showError404) {
        return <Error404 />;
    }

    return (
        <Layout title={"WorkGroupView"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Work Group</Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenActions}>
                            Actions
                        </Button>
                        
                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions}>
                            <MenuItem onClick={handleOpenAssignShiftModal}>Assign Shift</MenuItem>
                            <MenuItem onClick={handleOpenEditWorkGroupModal}>Edit Work Group</MenuItem>
                            <MenuItem onClick={handleOpenAssignShiftModal}>Delete Work Group</MenuItem>
                        </Menu>

                    </Box>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                    
                        <Grid item xs={4}>
                            {workShift ? (
                                <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px'}}>

                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <>
                                            <Grid container spacing={4} sx={{ p: 1 }}>
                                                <Grid item xs={4}> Assigned Shift </Grid>
                                                <Grid item xs={8}> {workShift.name} </Grid>
                                            </Grid>

                                            <Grid container spacing={4} sx={{ p: 1 }}>
                                                <Grid item xs={4}> Shift Type </Grid>
                                                <Grid item xs={8}> {workShift.shift_type} </Grid>
                                            </Grid>

                                            <Grid container spacing={4} sx={{ p: 1 }}>
                                                <Grid item xs={4}> {workShift.first_label} </Grid>
                                                <Grid item xs={8}> {formatTime(workHours.first_time_in)} - {formatTime(workHours.first_time_out)} </Grid>
                                            </Grid>

                                            <Grid container spacing={4} sx={{ p: 1 }}>
                                                <Grid item xs={4}> Break </Grid>
                                                <Grid item xs={8}> {formatTime(workHours.break_start)} - {formatTime(workHours.break_end)} </Grid>
                                            </Grid>

                                            {workShift?.shift_type === "Split" && (
                                                <Grid container spacing={4} sx={{ p: 1 }}>
                                                    <Grid item xs={4}>{workShift.second_label}</Grid>
                                                    <Grid item xs={8}>
                                                    {formatTime(workHours.second_time_in)} - {formatTime(workHours.second_time_out)}
                                                    </Grid>
                                                </Grid>
                                            )}

                                            <Grid container spacing={4} sx={{ p: 1 }}>
                                                <Grid item xs={4}> Overtime </Grid>
                                                <Grid item xs={8}> {formatTime(workHours.over_time_in)} - {formatTime(workHours.over_time_out)} </Grid>
                                            </Grid>
                                        </>
                                    )}

                                </Box>
                            ) : <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px'}}>
                                    <Grid container spacing={4} sx={{ p: 1 }}>
                                        <Grid item xs={4}> Assigned Shift </Grid>
                                        <Grid item xs={8}></Grid>
                                    </Grid>

                                    <Grid container spacing={4} sx={{ p: 1 }}>
                                        <Grid item xs={4}> Shift Type </Grid>
                                        <Grid item xs={8}></Grid>
                                    </Grid>

                                    <Grid container spacing={4} sx={{ p: 1 }}>
                                        <Grid item xs={4}> Attendance </Grid>
                                        <Grid item xs={8}></Grid>
                                    </Grid>

                                    <Grid container spacing={4} sx={{ p: 1 }}>
                                        <Grid item xs={4}> Over Time </Grid>
                                        <Grid item xs={8}></Grid>
                                    </Grid>
                                </Box>
                            }
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
                                                    {employees.map((employee, index) => (
                                                        <TableRow
                                                            key={employee.id || index}
                                                            // component={Link}
                                                            // to={`/admin/employee/${employee.user_name}`}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            <TableCell align="left"> {employee.id} {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''} </TableCell>
                                                            <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                            <TableCell align="center">{employee.department || '-'}</TableCell>
                                                            <TableCell align="center">{employee.role || '-'}</TableCell>
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

                {openAssignShiftModal &&
                    <AssignShift open={openAssignShiftModal} close={handleCloseAssignShiftModal} currentShift={workShift.id} workGroup={workGroup} onUpdateWorkGroupDetails={getWorkGroupDetails} />
                }

                {openEditWorkGroupModal &&
                    <EditWorkGroup open={openEditWorkGroupModal} close={handleCloseEditWorkGroupModal} workGroup={workGroup} onUpdateWorkGroupDetails={getWorkGroupDetails} />
                }

            </Box>
        </Layout >
    )
}

export default WorkGroupView
