import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress  } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import BranchesAdd from '../Settings/Modals/BranchesAdd';
import DepartmentsAdd from '../Settings/Modals/DepartmentsAdd';

const headCells = [
    {
        id: 'id',
        label: 'ID',
        sortable: true,
    },
    {
        id: 'name',
        label: 'Name',
        sortable: true,
    },
    {
        id: 'package',
        label: 'Package',
        sortable: true,
    },
    {
        id: 'status',
        label: 'Status',
        sortable: true,
    },
];

const GeneralSettings = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');

    const [isBranchesLoading, setIsBranchesLoading] = useState(true);
    const [isDepartmentLoading, setIsDepartmentLoading] = useState(true);

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [openAddBranchModal, setOpenAddBranchModal] = useState(false);
    const [openAddDepartmentModal, setOpenAddDepartmentModal] = useState(false);

    useEffect(() => {
        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                setDepartments(response.data.departments);
                setIsDepartmentLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
                setIsDepartmentLoading(false);
            });
    }, []);

    const handleOpenDepartment = (data) => {
        setOpenAddDepartmentModal(true);
    }

    const handleCloseDepartment = (data) => {
        setOpenAddDepartmentModal(false);
    }
    
    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>
    
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                    {/* <Typography variant="h5" sx={{ pt: 3 }}> General Settings </Typography> */}
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }} > General Settings </Typography>
                </Box>
        
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Departments </Typography>
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenDepartment()} >
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
                                                    <TableCell align="cemter">Name</TableCell>
                                                    <TableCell align="cemter">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {departments.map((department) => (
                                                    <TableRow key={department.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                                        <TableCell align="left">{department.name} ({department.acronym})</TableCell>
                                                        <TableCell align="left">{department.status}</TableCell>
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
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" onClick={() => handleOpenDepartment()} >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }} >    
                                <CircularProgress />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
    
                {openAddBranchModal &&
                    <BranchesAdd open={openAddBranchModal} close={handleCloseBranch} type={2} />
                }

                {openAddDepartmentModal &&
                    <DepartmentsAdd open={openAddDepartmentModal} close={handleCloseDepartment} type={2} />
                }

            </Box>
        </Layout >
    )
}

export default GeneralSettings
