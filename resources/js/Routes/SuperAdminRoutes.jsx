import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import Employees from "../Pages/Admin/Employees/HrEmployees";

const SuperAdminRoutes = ({ user }) => {
    const navigate = useNavigate()

    console.log("SuperAdminRoutes");
    console.log(user);

    if (!user) {
        navigate('/');
    } else if (user.user_type !== "SuperAdmin") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route path="employees" element={<ProtectedRoute element={<Employees />} user={user} />} />
        </Routes>
    );
};

export default SuperAdminRoutes;
