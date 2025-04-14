import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import HrDashboard from "../Pages/Hr/HrDashboard";

import HrProfile from "../Pages/Hr/HrProfile";

import HrAttendance from "../Pages/Hr/HrAttendance";
import HrAttendanceEmployee from "../Pages/Hr/HrAttendanceEmployee";

import HrTrainings from "../Pages/Hr/HrTrainings";

import HrSummaryReports from "../Pages/Hr/HrSummaryReports";
import HrTrainingsView from "../Pages/Hr/HrTrainingsView";

import { useReactToPrint } from 'react-to-print';

const HrRoutes = ({ user }) => {
  const navigate = useNavigate()

  if (!user) {
    navigate('/');
  } else if (user.user_type !== "Admin") {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<ProtectedRoute element={<HrDashboard />} user={user} />} />
      <Route path="profile" element={<ProtectedRoute element={<HrProfile />} user={user} />} />

      {/* <Route path="workshift" element={<ProtectedRoute element={<Workshift />} user={user} />} /> */}
      {/* <Route path="workshifts" element={<ProtectedRoute element={<Workshifts />} user={user} />} /> */}

      <Route path="attendance" element={<ProtectedRoute element={<HrAttendance />} user={user} />} />
      <Route path="attendance/:month/:year" element={<ProtectedRoute element={<HrAttendance />} user={user} />} />
      <Route path="attendance-employee/:month/:year/:employeeId" element={<ProtectedRoute element={<HrAttendanceEmployee />} user={user} />} />

      <Route path="trainings" element={<ProtectedRoute element={<HrTrainings />} user={user} />} />
      <Route path="summary-reports" element={<ProtectedRoute element={<HrSummaryReports />} user={user} />} />
      <Route path="trainings-view" element={<ProtectedRoute element={<HrTrainingsView />} user={user} />} />
    </Routes>
  );
};

export default HrRoutes;
