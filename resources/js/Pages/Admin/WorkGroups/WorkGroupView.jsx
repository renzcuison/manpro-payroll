import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PropTypes from 'prop-types';
import PageHead from '../../../components/Table/PageHead';
import PageToolbar from '../../../components/Table/PageToolbar';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';

import Swal from 'sweetalert2';

import AssignShift from '../WorkGroups/Modals/AssignShift';
import EditWorkGroup from '../WorkGroups/Modals/EditWorkGroup';
import Error404 from "../../Errors/Error404";

const WorkGroupView = () => {
    const { client, group } = useParams();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};

    const [isLoading, setIsLoading] = useState(true);
    const [showError404, setShowError404] = useState(false);

    const [shiftId, setShiftId] = useState("");

    const [workGroup, setWorkGroup] = useState(null);
    const [workShift, setWorkShift] = useState(null);
    const [workShift_Name, setWorkShift_Name] = useState(null);
    const [workShift_Type, setworkShift_Type] = useState(null);
    const [workHours, setWorkHours] = useState(null);
    const [employees, setEmployees] = useState([]);

    const [openAssignShiftModal, setOpenAssignShiftModal] = useState(false);
    const [openEditWorkGroupModal, setOpenEditWorkGroupModal] = useState(false);

    const [availableShifts, setAvailableShifts] = useState([]);
    const [isAssignShiftModalLoading, setIsAssignShiftModalLoading] = useState(false);


    useEffect(() => {
        if (Object.keys(headers).length > 0) {
            getWorkGroupDetails();
        } else {
            console.error("User not found in localStorage. Cannot fetch work group details.");
        }
    }, [client, group, storedUser]);

    const getWorkGroupDetails = () => {
        setIsLoading(true);
        const data = { client: client, group: group };

        axiosInstance.get(`/workshedule/getWorkGroupDetails`, { params: data, headers })
            .then((response) => {
                const { workGroup, workShift, workHours, employees, workShift_Name } = response.data;

                console.log("workGroup: "+ JSON.stringify(workGroup));

                if (!workGroup) {
                    setShowError404(true);
                    setIsLoading(false);
                    return;
                }

                setWorkGroup(workGroup || null);
                setWorkShift(workShift || null);
                setWorkShift_Name(workShift_Name.name || null);
                setworkShift_Type(workShift_Name.shift_type || null);
                setWorkHours(workHours || null);
                setEmployees(employees || []);

                if (workShift) {
                    setShiftId(workShift.id);
                } else {
                    setShiftId("");
                }

                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching work group:', error);
                setIsLoading(false);
            });
    }

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseActions = () => {
        setAnchorEl(null);
    };

    function formatTime(time) {
        if (!time) return 'N/A';
        try {
            const [hours, minutes] = time.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return 'Invalid Time';
            const isAM = hours < 12;
            const formattedHours = hours % 12 || 12;
            const period = isAM ? 'AM' : 'PM';
            return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        } catch (error) {
            console.error("Error formatting time:", time, error);
            return 'Error';
        }
    }

    const handleOpenAssignShiftModal = () => {
        handleCloseActions();
        setIsAssignShiftModalLoading(true);

        axiosInstance.get(`/workshedule/getAvailableShifts`, { params: { client: client }, headers })
            .then(response => {
                setAvailableShifts(response.data.shifts || []);
                setIsAssignShiftModalLoading(false);
                setOpenAssignShiftModal(true);
            })
            .catch(error => {
                console.error('Error fetching available shifts:', error);
                setIsAssignShiftModalLoading(false);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load available shifts. Please try again.',
                });
            });
    }

    const handleCloseAssignShiftModal = () => {
        setOpenAssignShiftModal(false);
        setAvailableShifts([]);
    }

    const handleOpenEditWorkGroupModal = () => {
        handleCloseActions();
        setOpenEditWorkGroupModal(true);
    }

    const handleCloseEditWorkGroupModal = () => {
        setOpenEditWorkGroupModal(false);
    }

    const handleDeleteWorkGroup = () => {
        handleCloseActions();
        Swal.fire({
            customClass: { container: 'my-swal' },
            text: `Are you sure you want to delete work group "${workGroup?.name || 'this group'}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#d32f2f',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const data = { groupId: workGroup?.id };
                if (!workGroup?.id) {
                    Swal.showValidationMessage('Work group ID not found.');
                    return false;
                }

                return axiosInstance.delete(`/workshedule/deleteWorkGroup/${workGroup.id}`, { headers })
                    .then(response => {
                        if (response.data.success) {
                            return response.data;
                        } else {
                            throw new Error(response.data.message || 'Failed to delete work group.');
                        }
                    })
                    .catch(error => {
                        Swal.showValidationMessage(`Delete failed: ${error.message || error}`);
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Work group has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/admin/work-groups');
            }
        });
    }

    if (showError404) {
        return <Error404 />;
    }

    return (
        <Layout title={workGroup?.name ? `${workGroup.name} Work Group` : "Work Group View"}>
            <Box sx={{ mx: 'auto', width: '100%', px: { xs: 1, md: 3 } }}>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        View Work Group
                    </Typography>

                    <Button variant="contained" color="primary" onClick={handleOpenActions}>
                        Actions
                    </Button>

                    <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions}>
                        <MenuItem onClick={handleOpenAssignShiftModal} disabled={isLoading || isAssignShiftModalLoading}>
                            {isAssignShiftModalLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                            Assign Shift
                        </MenuItem>
                        <MenuItem onClick={handleOpenEditWorkGroupModal} disabled={isLoading || !workGroup}>Edit Work Group</MenuItem>
                        <MenuItem onClick={handleDeleteWorkGroup} disabled={isLoading || !workGroup}>Delete Work Group</MenuItem>
                    </Menu>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'}}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px', height: '100%'}}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold'}}>Group Details</Typography>
                                <Grid container spacing={2} sx={{display: 'flex', justifyContent: 'space-around'}}>
                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Group Name:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">{workGroup?.name || 'N/A'}</Typography>
                                        </Grid>
                                    </Box>

                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Assigned Shift:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">{workShift_Name || 'Unassigned'}</Typography>
                                        </Grid>
                                    </Box>

                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Shift Type:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">{workShift_Type || 'N/A'}</Typography>
                                        </Grid>
                                    </Box>

                                    {workShift && (
                                        <>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="subtitle1" fontWeight="bold">{workShift.first_label || 'Attendance'}:</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={8}>
                                                <Typography variant="body1">{formatTime(workHours?.first_time_in)} - {formatTime(workHours?.first_time_out)}</Typography>
                                            </Grid>

                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="subtitle1" fontWeight="bold">Break:</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={8}>
                                                <Typography variant="body1">{formatTime(workHours?.break_start)} - {formatTime(workHours?.break_end)}</Typography>
                                            </Grid>

                                            {workShift.shift_type === "Split" && (
                                                <>
                                                    <Grid item xs={6} sm={4}>
                                                        <Typography variant="subtitle1" fontWeight="bold">{workShift.second_label || 'Attendance'}:</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={8}>
                                                        <Typography variant="body1">{formatTime(workHours?.second_time_in)} - {formatTime(workHours?.second_time_out)}</Typography>
                                                    </Grid>
                                                </>
                                            )}

                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="subtitle1" fontWeight="bold">Overtime:</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={8}>
                                                <Typography variant="body1">{formatTime(workHours?.over_time_in)} - {formatTime(workHours?.over_time_out)}</Typography>
                                            </Grid>
                                        </>
                                    )}

                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8} sx={{width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'}}>
                            <Box sx={{ mb: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Assigned Employees</Typography>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 200 }}>
                                    <Table aria-label="employees table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Name</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Branch</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Department</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Role</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {employees.length > 0 ? (
                                                employees.map((employee, index) => (
                                                    <TableRow
                                                        key={employee.id || index}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        <TableCell align="left">
                                                            {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                                                        </TableCell>
                                                        <TableCell align="center">{employee.branch || '-'}</TableCell>
                                                        <TableCell align="center">{employee.department || '-'}</TableCell>
                                                        <TableCell align="center">{employee.role || '-'}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        No employees assigned to this work group.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Grid>
                    </Grid>
                )}


            </Box>

            {/* Modals */}
            {openAssignShiftModal && (
                <AssignShift
                    open={openAssignShiftModal}
                    close={handleCloseAssignShiftModal}
                    currentShift={shiftId}
                    workGroup={workGroup}
                    availableShifts={availableShifts}
                    onUpdateWorkGroupDetails={getWorkGroupDetails}
                />
            )}

            {openEditWorkGroupModal && (
                <EditWorkGroup
                    open={openEditWorkGroupModal}
                    close={handleCloseEditWorkGroupModal}
                    workGroup={workGroup}
                    onUpdateWorkGroupDetails={getWorkGroupDetails}
                />
            )}

        </Layout >
    );
}

export default WorkGroupView;