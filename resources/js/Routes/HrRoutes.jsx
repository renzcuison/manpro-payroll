import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";
import Dashboard from "../Pages/Admin/Dashboard/Dashboard";

const HrRoutes = ({ user }) => {
  const navigate = useNavigate()

  if (!user) {
    navigate('/');
  } else if (user.user_type !== "Admin") {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} user={user} />} />
    </Routes>
  );
};

export default HrRoutes;
