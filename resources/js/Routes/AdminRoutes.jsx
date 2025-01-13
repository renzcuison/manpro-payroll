import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import EmployeesAdd from "../Pages/Admin/Employees/EmployeesAdd";
import EmployeesList from "../Pages/Admin/Employees/EmployeesList";
import EmployeesView from "../Pages/Admin/Employees/EmployeeView";

import WorkshiftsAdd from "../Pages/Admin/WorkShifts/WorkshiftsAdd";
import WorkshiftsView from "../Pages/Admin/WorkShifts/WorkshiftView";

import WorkGroupsAdd from "../Pages/Admin/WorkGroups/WorkGroupsAdd";

import HrEmployeesCalendar from "../Pages/Hr/HrEmployeesCalendar";
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
            {/* <Route path="employee" element={<ProtectedRoute element={<EmployeesView />} user={user} />} /> */}
            <Route path="employee/:user" element={<ProtectedRoute element={<EmployeesView />} user={user} />} />
            <Route path="employees" element={<ProtectedRoute element={<EmployeesList />} user={user} />} />
            <Route path="employees-add" element={<ProtectedRoute element={<EmployeesAdd />} user={user} />} />

            <Route path="settings/general" element={<ProtectedRoute element={<GeneralSettings />} user={user} />} />

            <Route path="workshift/:shift" element={<ProtectedRoute element={<WorkshiftsView />} user={user} />} />
            <Route path="workshifts-add" element={<ProtectedRoute element={<WorkshiftsAdd />} user={user} />} />


            <Route path="workgroups-add" element={<ProtectedRoute element={<WorkGroupsAdd />} user={user} />} />

            

            <Route path="workdays" element={<ProtectedRoute element={<HrEmployeesCalendar />} user={user} />} />


            {/* <Route path="performance-evaluation-edit/:id" element={<ProtectedRoute element={<HrEvaluationEdit />} user={user} />} /> */}
        </Routes>
    );
};

export default AdminRoutes;
