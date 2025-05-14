import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import perimeter from '../../../Assets/default_perimeter_image.png';

const RadiusPerimeter = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("nasya_user");

    // ✅ Memoize headers to avoid re-triggering useEffect
    const headers = useMemo(() => {
        return getJWTHeader(JSON.parse(storedUser));
    }, [storedUser]);

    const [isLoading, setIsLoading] = useState(true);
    const [perimeters, setPerimeters] = useState([]);

    useEffect(() => {
        const getPerimeter = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.get('/perimeters/getRadiusPerimeters', { headers });
                const data = response.data?.perimeters || [];
                setPerimeters(data);
            } catch (error) {
                console.error('Failed to fetch perimeters:', error);
            } finally {
                setIsLoading(false);
            }
        };

        getPerimeter();
    }, [headers]); // ✅ will now only trigger when headers actually changes

    const renderParameterCard = (name, status,index) => (
        <Box
            key={index}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 1,
                padding: 2,
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                ":hover": {
                    backgroundColor: '#e0e0e0',
                    scale: 1.02,
                    transition: '0.3s',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            <img src={perimeter} alt="perimeter" width={250}/>
            <Typography sx={{color: 'green', fontWeight: 'bold', marginTop: 3 }}>
                {name}
            </Typography>
            <Typography sx={{fontWeight: 'bold', marginTop: 3, bgcolor: status === 'active' ? 'green' : 'red', color: 'white', px: 2, borderRadius: 1, textTransform: 'uppercase' }}>
                {status}
            </Typography>
        </Box>
    );

    return (
        <Layout title="Radius Perimeter">
            <Box>
                <Box sx={{ padding: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, borderBottom: '1px solid #ccc' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Perimeters
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/admin/perimeters/add')}>
                            Add New Perimeter
                        </Button>
                    </Box>

                    {/* Parameter Section */}
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            gap: 2,
                            padding: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {perimeters.length > 0 ? (
                                    perimeters.map((perimeter, index) =>
                                        renderParameterCard(`${perimeter.name}`,`${perimeter.status}`, index)
                                    )
                                ) : (
                                    <Typography variant="body1" sx={{ padding: 1 }}>
                                        No perimeters available.
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default RadiusPerimeter;
