import React from 'react';
import { Navigate, Route } from 'react-router-dom';

const ProtectedRoute = ({ element, user }) => {
  return user ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
