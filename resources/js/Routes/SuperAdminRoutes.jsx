import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import Clients from "../Pages/SuperAdmin/Clients/ClientsList";

const SuperAdminRoutes = ({ user }) => {
    const navigate = useNavigate()
    
    if (!user) {
        navigate('/');
    } else if (user.user_type !== "SuperAdmin") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route path="clients" element={<ProtectedRoute element={<Clients />} user={user} />} />
        </Routes>
    );
};

export default SuperAdminRoutes;
