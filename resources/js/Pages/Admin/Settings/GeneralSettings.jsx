import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress  } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import RolesAdd from '../Settings/Modals/RolesAdd';
import BranchesAdd from '../Settings/Modals/BranchesAdd';
import JobTitlesAdd from '../Settings/Modals/JobTitlesAdd';
import DepartmentsAdd from '../Settings/Modals/DepartmentsAdd';

const GeneralSettings = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isRolesLoading, setIsRolesLoading] = useState(true);
    const [isBranchesLoading, setIsBranchesLoading] = useState(true);
    const [isJobTitlesLoading, setIsJobTitlesLoading] = useState(true);
    const [isDepartmentLoading, setIsDepartmentsLoading] = useState(true);

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [openAddRolesModal, setOpenAddRolesModal] = useState(false);
    const [openAddBranchModal, setOpenAddBranchModal] = useState(false);
    const [openAddJobTitleModal, setOpenAddJobTitleModal] = useState(false);
    const [openAddDepartmentModal, setOpenAddDepartmentModal] = useState(false);

    useEffect(() => {
        axiosInstance.get('/settings/getRoles', { headers })
            .then((response) => {
                setRoles(response.data.roles);
                setIsRolesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                setBranches(response.data.branches);
                setIsBranchesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getJobTitles', { headers })
            .then((response) => {
                setJobTitles(response.data.jobTitles);
                setIsJobTitlesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                setDepartments(response.data.departments);
                setIsDepartmentsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
            });
    }, []);

    // Roles Functions
    const handleOpenAddRoleModal = () => {
        setOpenAddRolesModal(true);
    }

    const handleCloseAddRoleModal = () => {
        setOpenAddRolesModal(false);
    }

    const handleUpdateRoles = (newRole) => {
        setRoles((prevRoles) => [...prevRoles, newRole]);
    };


    // Branch Functions
    const handleOpenAddBranchModal = () => {
        setOpenAddBranchModal(true);
    }

    const handleCloseAddBranchModal = () => {
        setOpenAddBranchModal(false);
    }

    const handleUpdateBranches = (newBranch) => {
        setBranches((prevBranches) => [...prevBranches, newBranch]);
    };


    // Job Title Functions
    const handleOpenAddJobTitleModal = () => {
        setOpenAddJobTitleModal(true);
    }

    const handleCloseAddJobTitleModal = () => {
        setOpenAddJobTitleModal(false);
    }

    const handleUpdateJobTitles = (newJobTitle) => {
        setJobTitles((prevJobTitles) => [...prevJobTitles, newJobTitle]);
    }


    // Department Functions
    const handleOpenAddDepartmentModal = () => {
        setOpenAddDepartmentModal(true);
    }

    const handleCloseAddDepartmentModal = () => {
        setOpenAddDepartmentModal(false);
    }

    const handleUpdateDepartments = (newDepartment) => {
        setDepartments((prevDepartments) => [...prevDepartments, newDepartment]);
    };

    
    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>
    
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }} > General Settings </Typography>
                </Box>
        
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Departments </Typography>
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenAddDepartmentModal()} >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>

                            {isDepartmentLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }} >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Name</TableCell>
                                                    <TableCell align="center">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {departments.map((department) => (
                                                    <TableRow key={department.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{department.name} ({department.acronym})</TableCell>
                                                        <TableCell align="center">{department.status}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}

                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Branches </Typography>
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenAddBranchModal()} >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>
                            
                            {isBranchesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }} >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Name</TableCell>
                                                    <TableCell align="center">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {branches.map((branch) => (
                                                    <TableRow key={branch.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{branch.name} ({branch.acronym})</TableCell>
                                                        <TableCell align="center">{branch.status}</TableCell>
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

                <Grid container spacing={4} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Employee Roles </Typography>
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenAddRoleModal()} >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>
                            
                            {isRolesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }} >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Name</TableCell>
                                                    <TableCell align="center">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {roles.map((role) => (
                                                    <TableRow key={role.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{role.name} ({role.acronym})</TableCell>
                                                        <TableCell align="center">{role.status}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Job Titles </Typography>
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenAddJobTitleModal()} >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>
                            
                            {isJobTitlesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }} >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Name</TableCell>
                                                    <TableCell align="center">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {jobTitles.map((jobTitle) => (
                                                    <TableRow key={jobTitle.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{jobTitle.name} ({jobTitle.acronym})</TableCell>
                                                        <TableCell align="center">{jobTitle.status}</TableCell>
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

                {openAddRolesModal &&
                    <RolesAdd open={openAddRolesModal} close={handleCloseAddRoleModal} onUpdateRoles={handleUpdateRoles} type={2} />
                }
    
                {openAddBranchModal &&
                    <BranchesAdd open={openAddBranchModal} close={handleCloseAddBranchModal} onUpdateBranches={handleUpdateBranches} type={2} />
                }
                    
                {openAddJobTitleModal &&
                    <JobTitlesAdd open={openAddJobTitleModal} close={handleCloseAddJobTitleModal} onUpdateJobTitles={handleUpdateJobTitles} type={2} />
                }

                {openAddDepartmentModal &&
                    <DepartmentsAdd open={openAddDepartmentModal} close={handleCloseAddDepartmentModal} onUpdateDepartments={handleUpdateDepartments} type={2} />
                }

            </Box>
        </Layout >
    )
}

export default GeneralSettings
