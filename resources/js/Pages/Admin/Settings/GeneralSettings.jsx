import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress  } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

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

    const queryParameters = new URLSearchParams(window.location.search)
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalAttendance, setTotalAttendance] = useState([]);
    const [filterAttendance, setFilterAttendance] = useState([]);

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [isLoading, setIsLoading] = useState(true);
    const [clients, setClients] = useState([]);

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    useEffect(() => {
        axiosInstance.get('/clients/getClients', { headers })
            .then((response) => {
                setClients(response.data.clients);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clients:', error);
                setIsLoading(false);
            });
    }, []);
    
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
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1"
                                    onClick={() => { 
                                        window.location.href = "http://127.0.0.1:8080/super-admin/clients-add"; 
                                    }}    
                                >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >    
                                <CircularProgress />
                            </Box>
            
                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                <Typography variant="h5"> Branches </Typography>
            
                                <Button variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1"
                                    onClick={() => { 
                                        window.location.href = "http://127.0.0.1:8080/super-admin/clients-add"; 
                                    }}    
                                >
                                    <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                                </Button>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >    
                                <CircularProgress />
                            </Box>
            
                        </Box>
                    </Grid>
                </Grid>
    
            </Box>
        </Layout >
    )
}

export default GeneralSettings
