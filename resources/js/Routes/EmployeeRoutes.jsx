import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Error404 from "../Pages/Errors/Error404";

import Dashboard from "../Pages/Employee/Dashboard/DashboardView";
import AttendanceLogs from "../Pages/Employee/Attendance/AttendanceLogs";
import AttendanceSummary from "../Pages/Employee/Attendance/AttendanceSummary";
import AttendanceOvertime from "../Pages/Employee/Attendance/AttendanceOvertime";

import ApplicationList from "../Pages/Employee/Applications/ApplicationList";

import PayrollList from "../Pages/Employee/Payroll/PayrollList";

import LoanList from "../Pages/Employee/Loan/LoanList";

import AnnouncementList from "../Pages/Employee/Announcements/AnnouncementList";
import AnnouncementView from "../Pages/Employee/Announcements/AnnouncementView";

import TrainingList from "../Pages/Employee/Trainings/TrainingList";
import TrainingView from "../Pages/Employee/Trainings/TrainingView";

import ProfileEdit from "../Pages/Employee/Profile/ProfileEdit";
import ContentView from "../Pages/Employee/Trainings/ContentView";

const EmployeeRoutes = ({ user }) => {
    const navigate = useNavigate();

    if (!user) {
        navigate("/");
    } else if (user.user_type !== "Employee") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} user={user} />} />

            {/* Attendance Routes ------------------------------------------ */}
            <Route path="attendance-logs" element={<ProtectedRoute element={<AttendanceLogs />} user={user} />} />
            <Route path="attendance-summary" element={<ProtectedRoute element={<AttendanceSummary />} user={user} />} />
            <Route path="attendance-overtime" element={<ProtectedRoute element={<AttendanceOvertime />} user={user} />} />

            {/* Application Routes ----------------------------------------- */}
            <Route path="application-list" element={<ProtectedRoute element={<ApplicationList />} user={user} />} />

            {/* Loan Routes ----------------------------------------- */}
            <Route path="loans" element={<ProtectedRoute element={<LoanList />} user={user} />} />

            {/* Payroll Routes ----------------------------------------- */}
            <Route path="payroll" element={<ProtectedRoute element={<PayrollList />} user={user} />} />

            {/* Announcement Routes ----------------------------------------- */}
            <Route path="announcements" element={<ProtectedRoute element={<AnnouncementList />} user={user} />} />
            <Route path="announcement/:code" element={<ProtectedRoute element={<AnnouncementView />} user={user} />} />

            {/* Training Routes ----------------------------------------- */}
            <Route path="trainings" element={<ProtectedRoute element={<TrainingList />} user={user} />} />
            <Route path="training/:code" element={<ProtectedRoute element={<TrainingView />} user={user} />} />
            <Route path="training-content/:code" element={<ProtectedRoute element={<ContentView />} user={user} />} />

            {/* Profile Routes ----------------------------------------- */}
            <Route path="profile-edit" element={<ProtectedRoute element={<ProfileEdit />} user={user} />} />
        </Routes>
    );
};

export default EmployeeRoutes;
