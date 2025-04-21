import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, IconButton } from '@mui/material'
import { Edit } from "@mui/icons-material";
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import RolesAdd from './Modals/RolesAdd';
import BranchesAdd from './Modals/BranchesAdd';
import JobTitlesAdd from './Modals/JobTitlesAdd';
import DepartmentsAdd from './Modals/DepartmentsAdd';

import RolesEdit from './Modals/RolesEdit';
import BranchesEdit from './Modals/BranchesEdit';
import JobTitlesEdit from './Modals/JobTitlesEdit';
import DepartmentsEdit from './Modals/DepartmentsEdit';
import ApplicationTypesAdd from './Modals/ApplicationTypesAdd';
import ApplicationTypesEdit from './Modals/ApplicationTypesEdit';

const GeneralSettings = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isRolesLoading, setIsRolesLoading] = useState(true);
    const [isBranchesLoading, setIsBranchesLoading] = useState(true);
    const [isAppTypesLoading, setIsAppTypesLoading] = useState(true);
    const [isJobTitlesLoading, setIsJobTitlesLoading] = useState(true);
    const [isDepartmentLoading, setIsDepartmentsLoading] = useState(true);

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [appTypes, setAppTypes] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [openAddRolesModal, setOpenAddRolesModal] = useState(false);
    const [openAddBranchModal, setOpenAddBranchModal] = useState(false);
    const [openAddAppTypeModal, setOpenAddAppTypeModal] = useState(false);
    const [openAddJobTitleModal, setOpenAddJobTitleModal] = useState(false);
    const [openAddDepartmentModal, setOpenAddDepartmentModal] = useState(false);

    const [openEditRolesModal, setOpenEditRolesModal] = useState(false);
    const [openEditBranchModal, setOpenEditBranchModal] = useState(false);
    const [openEditAppTypeModal, setOpenEditAppTypeModal] = useState(false);
    const [openEditJobTitleModal, setOpenEditJobTitleModal] = useState(false);
    const [openEditDepartmentModal, setOpenEditDepartmentModal] = useState(false);

    const [loadRole, setLoadRole] = useState([]);
    const [loadBranch, setLoadBranch] = useState([]);
    const [loadAppType, setLoadAppType] = useState([]);
    const [loadJobTitle, setLoadJobTitle] = useState([]);
    const [loadDepartment, setLoadDepartment] = useState([]);

    useEffect(() => {
        fetchBranches();
        fetchDepartments();
        fetchJobTitles();
        fetchRoles();
        fetchAppTypes();
    }, []);

    // Fetch Branches
    const fetchBranches = () => {
        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                setBranches(response.data.branches);
                setIsBranchesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });
    }

    // Add Branch Functions
    const handleOpenAddBranchModal = () => {
        setOpenAddBranchModal(true);
    }

    const handleCloseAddBranchModal = () => {
        setOpenAddBranchModal(false);
        fetchBranches();
    }

    // Edit Branch Functions
    const handleOpenEditBranchModal = (branch) => {
        setLoadBranch(branch)
        setOpenEditBranchModal(true);
    }

    const handleCloseEditBranchModal = () => {
        setOpenEditBranchModal(false);
        fetchBranches();
    }

    // Fetch Departments
    const fetchDepartments = () => {
        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                setDepartments(response.data.departments);
                setIsDepartmentsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
            });
    }

    // Add Department Functions
    const handleOpenAddDepartmentModal = () => {
        setOpenAddDepartmentModal(true);
    }

    const handleCloseAddDepartmentModal = () => {
        setOpenAddDepartmentModal(false);
        fetchDepartments();
    }

    // Edit Department Functions
    const handleOpenEditDepartmentModal = (department) => {
        setLoadDepartment(department)
        setOpenEditDepartmentModal(true);
    }

    const handleCloseEditDepartmentModal = () => {
        setOpenEditDepartmentModal(false);
        fetchDepartments();
    }

    // Fetch Job Titles
    const fetchJobTitles = () => {
        axiosInstance.get('/settings/getJobTitles', { headers })
            .then((response) => {
                setJobTitles(response.data.jobTitles);
                setIsJobTitlesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching job titles:', error);
            });
    }

    // Add Job Title Functions
    const handleOpenAddJobTitleModal = () => {
        setOpenAddJobTitleModal(true);
    }

    const handleCloseAddJobTitleModal = () => {
        setOpenAddJobTitleModal(false);
        fetchJobTitles();
    }

    // Edit Job Title Functions
    const handleOpenEditJobTitleModal = (jobTitle) => {
        setLoadJobTitle(jobTitle);
        setOpenEditJobTitleModal(true);
    }

    const handleCloseEditJobTitleModal = () => {
        setOpenEditJobTitleModal(false);
        fetchJobTitles();
    }

    // Fetch Roles
    const fetchRoles = () => {
        axiosInstance.get('/settings/getRoles', { headers })
            .then((response) => {
                setRoles(response.data.roles);
                setIsRolesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching roles:', error);
            });
    }

    // Add Role Functions
    const handleOpenAddRoleModal = () => {
        setOpenAddRolesModal(true);
    }

    const handleCloseAddRoleModal = () => {
        setOpenAddRolesModal(false);
        fetchRoles();
    }

    // Edit Role Functions
    const handleOpenEditRoleModal = (role) => {
        setLoadRole(role);
        setOpenEditRolesModal(true);
    }

    const handleCloseEditRoleModal = () => {
        setOpenEditRolesModal(false);
        fetchRoles();
    }


    // Fetch Application Types
    const fetchAppTypes = () => {
        axiosInstance.get('/applications/getApplicationTypes', { headers })
            .then((response) => {
                setAppTypes(response.data.types);
                setIsAppTypesLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching application types:', error);
            });
    }

    // Add Role Functions
    const handleOpenAddAppTypeModal = () => {
        setOpenAddAppTypeModal(true);
    }

    const handleCloseAddAppTypeModal = () => {
        setOpenAddAppTypeModal(false);
        fetchAppTypes();
    }

    // Edit Role Functions
    const handleOpenEditAppTypeModal = (appType) => {
        setLoadAppType(appType);
        setOpenEditAppTypeModal(true);
    }

    const handleCloseEditAppTypeModal = () => {
        setOpenEditAppTypeModal(false);
        fetchAppTypes();
    }

    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }} > General Settings </Typography>
                </Box>

                {/* Departments and Branches */}
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {/* Departments */}
                    <Grid size={{ xs: 12, md: 6 }}>
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
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ mt: 3, mb: 1, height: "560px" }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ width: "60%" }}>Name</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Status</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Edit</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {departments.map((department) => (
                                                    <TableRow key={department.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{department.name} ({department.acronym})</TableCell>
                                                        <TableCell align="center">{department.status}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton onClick={() => handleOpenEditDepartmentModal(department)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}

                        </Box>
                    </Grid>
                    {/* Branches */}
                    <Grid size={{ xs: 12, md: 6 }}>
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
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ mt: 3, mb: 1, height: "560px" }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ width: "60%" }}>Name</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Status</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Edit</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {branches.map((branch) => (
                                                    <TableRow key={branch.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{branch.name} ({branch.acronym})</TableCell>
                                                        <TableCell align="center">{branch.status}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton onClick={() => handleOpenEditBranchModal(branch)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </TableCell>
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

                {/* Roles and Titles */}
                <Grid container spacing={4} sx={{ mt: 1 }}>
                    {/* Roles */}
                    <Grid size={{ xs: 12, md: 6 }}>
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
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ mt: 3, mb: 1, height: "560px" }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ width: "60%" }}>Name</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Status</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Edit</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {roles.map((role) => (
                                                    <TableRow key={role.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{role.name} ({role.acronym})</TableCell>
                                                        <TableCell align="center">{role.status}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton onClick={() => handleOpenEditRoleModal(role)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
                    </Grid>
                    {/* Titles */}
                    <Grid size={{ xs: 12, md: 6 }}>
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
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ mt: 3, mb: 1, height: "560px" }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ width: "60%" }}>Name</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Status</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Edit</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {jobTitles.map((jobTitle) => (
                                                    <TableRow key={jobTitle.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{jobTitle.name} ({jobTitle.acronym})</TableCell>
                                                        <TableCell align="center">{jobTitle.status}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton onClick={() => handleOpenEditJobTitleModal(jobTitle)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </TableCell>
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

                {/* Application Types */}
                <Grid container spacing={4} sx={{ mt: 1 }}>
                    {/* Application Types */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Application Types </Typography>

                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenAddAppTypeModal()} >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>

                            {isAppTypesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }} >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <TableContainer style={{ overflowX: 'auto' }} sx={{ mt: 3, mb: 1, height: "560px" }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ width: "80%" }}>Name</TableCell>
                                                    <TableCell align="center" sx={{ width: "20%" }}>Edit</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {appTypes.map((appType) => (
                                                    <TableRow key={appType.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{appType.name}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton onClick={() => handleOpenEditAppTypeModal(appType)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </TableCell>
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

                {openAddBranchModal &&
                    <BranchesAdd open={openAddBranchModal} close={handleCloseAddBranchModal} type={2} />
                }
                {openAddDepartmentModal &&
                    <DepartmentsAdd open={openAddDepartmentModal} close={handleCloseAddDepartmentModal} type={2} />
                }
                {openAddJobTitleModal &&
                    <JobTitlesAdd open={openAddJobTitleModal} close={handleCloseAddJobTitleModal} type={2} />
                }
                {openAddRolesModal &&
                    <RolesAdd open={openAddRolesModal} close={handleCloseAddRoleModal} type={2} />
                }
                {openAddAppTypeModal &&
                    <ApplicationTypesAdd open={openAddAppTypeModal} close={handleCloseAddAppTypeModal} type={2} />
                }

                {openEditBranchModal &&
                    <BranchesEdit open={openEditBranchModal} close={handleCloseEditBranchModal} branchInfo={loadBranch} />
                }
                {openEditDepartmentModal &&
                    <DepartmentsEdit open={openEditDepartmentModal} close={handleCloseEditDepartmentModal} departmentInfo={loadDepartment} />
                }
                {openEditJobTitleModal &&
                    <JobTitlesEdit open={openEditJobTitleModal} close={handleCloseEditJobTitleModal} jobTitleInfo={loadJobTitle} />
                }
                {openEditRolesModal &&
                    <RolesEdit open={openEditRolesModal} close={handleCloseEditRoleModal} roleInfo={loadRole} />
                }
                {openEditAppTypeModal &&
                    <ApplicationTypesEdit open={openEditAppTypeModal} close={handleCloseEditAppTypeModal} appTypeInfo={loadAppType} />
                }
            </Box>
        </Layout >
    )
}

export default GeneralSettings
