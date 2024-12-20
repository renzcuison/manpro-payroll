import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { Box } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation } from 'react-router-dom'; // Assuming you're using React Router
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';

export default function HrAnnouncementView() {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [announcementsList, setAnnouncementsList] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get('category_id');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };

        return date.toLocaleString('en-US', options);
    };

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Announcements</h5>
                </div>
                <div>
                    <p>Category ID: {categoryId}</p>
                    {/* Render announcementsList or other components */}
                </div>
            </Box>
        </Layout>
    );
}
