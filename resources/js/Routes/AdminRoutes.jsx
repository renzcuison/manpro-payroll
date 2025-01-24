import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import EmployeesAdd from "../Pages/Admin/Employees/EmployeesAdd";
import EmployeeView from "../Pages/Admin/Employees/EmployeeView";
import EmployeesList from "../Pages/Admin/Employees/EmployeesList";

import EmployeeAttendanceLogs from "../Pages/Admin/Attendance/AttendanceLogs";

import WorkDayView from "../Pages/Admin/WorkDays/WorkDayView";

import WorkshiftsAdd from "../Pages/Admin/WorkShifts/WorkshiftsAdd";
import WorkshiftView from "../Pages/Admin/WorkShifts/WorkshiftView";

import WorkGroupsAdd from "../Pages/Admin/WorkGroups/WorkGroupsAdd";
import WorkGroupView from "../Pages/Admin/WorkGroups/WorkGroupView";

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
            <Route path="employee/:user" element={<ProtectedRoute element={<EmployeeView />} user={user} />} />
            <Route path="employees" element={<ProtectedRoute element={<EmployeesList />} user={user} />} />
            <Route path="employees-add" element={<ProtectedRoute element={<EmployeesAdd />} user={user} />} />

            <Route path="attendance/logs" element={<ProtectedRoute element={<EmployeeAttendanceLogs />} user={user} />} />

            <Route path="settings/general" element={<ProtectedRoute element={<GeneralSettings />} user={user} />} />

            <Route path="workshift/:shift" element={<ProtectedRoute element={<WorkshiftView />} user={user} />} />
            <Route path="workshifts-add" element={<ProtectedRoute element={<WorkshiftsAdd />} user={user} />} />

            <Route path="workgroup/:client/:group" element={<ProtectedRoute element={<WorkGroupView />} user={user} />} />
            <Route path="workgroups-add" element={<ProtectedRoute element={<WorkGroupsAdd />} user={user} />} />

            <Route path="workdays" element={<ProtectedRoute element={<WorkDayView />} user={user} />} />


            {/* <Route path="performance-evaluation-edit/:id" element={<ProtectedRoute element={<HrEvaluationEdit />} user={user} />} /> */}
        </Routes>
    );
};

export default AdminRoutes;
