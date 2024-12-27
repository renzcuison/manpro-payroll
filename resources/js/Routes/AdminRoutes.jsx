import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import EmployeesAdd from "../Pages/Admin/Employees/EmployeesAdd";
import EmployeesList from "../Pages/Admin/Employees/EmployeesList";

import GeneralSettings from "../Pages/Admin/Settings/GeneralSettings";

const AdminRoutes = ({ user }) => {
    const navigate = useNavigate()

    if (!user) {
        navigate('/');
    } else if (user.user_type !== "Admin") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route path="employees" element={<ProtectedRoute element={<EmployeesList />} user={user} />} />
            <Route path="employees-add" element={<ProtectedRoute element={<EmployeesAdd />} user={user} />} />

            <Route path="settings/general" element={<ProtectedRoute element={<GeneralSettings />} user={user} />} />
        </Routes>
    );
};

export default AdminRoutes;
