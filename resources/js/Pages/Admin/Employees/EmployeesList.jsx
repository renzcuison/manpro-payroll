import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

const EmployeesList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        axiosInstance.get('/employee/getEmployees', { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
                setIsLoading(false);
            });
    }, []);

    const [blobMap, setBlobMap] = useState({});

    const renderImage = (id, data, mime) => {
        if (!blobMap[id] && data) {
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
        }
        return blobMap[id] || '';
    };

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => URL.revokeObjectURL(url));
            setBlobMap({});
        };
    }, []);

    // Function to wrap every cell in a Link
    const renderLinkCell = (params) => (
        <Link 
            to={`/admin/employee/${params.row.user_name}`} 
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
        >
            {params.value}
        </Link>
    );

    // Columns configuration
    const columns = [
        {
            field: 'avatar',
            headerName: '', // No header
            width: 80, // Set fixed width for avatar
            sortable: false,
            renderCell: (params) => (
                <Link 
                    to={`/admin/employee/${params.row.user_name}`} 
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                    <Avatar src={renderImage(params.row.id, params.row.avatar, params.row.avatar_mime)} />
                </Link>
            ),
        },
        { field: 'name', headerName: 'Employee', flex: 1, renderCell: renderLinkCell },
        { field: 'branch', headerName: 'Branch', flex: 1, renderCell: renderLinkCell },
        { field: 'department', headerName: 'Department', flex: 1, renderCell: renderLinkCell },
        { field: 'role', headerName: 'Role', flex: 1, renderCell: renderLinkCell },
        { field: 'employment_status', headerName: 'Status', flex: 0.7, renderCell: renderLinkCell },
        { field: 'employment_type', headerName: 'Type', flex: 0.7, renderCell: renderLinkCell },
    ];
    
    
    return (
        <Layout title="Employees List">
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }}>
                    
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employees </Typography>

                        <Button id="employee-menu" variant="contained" color="primary">
                            <i className="fa fa-plus"></i> Add
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <DataGrid
                                rows={employees}
                                columns={columns}
                                getRowId={(row) => row.user_name}
                                pageSizeOptions={[5, 10, 20]}
                                disableColumnMenu
                                sx={{ border: 0, width: '100%', cursor: 'pointer' }}
                            />
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout>
    );
};

export default EmployeesList;
