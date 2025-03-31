import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import EmployeesAdd from "../Pages/Admin/Employees/EmployeesAdd";
import EmployeeView from "../Pages/Admin/Employees/EmployeeView";
import EmployeesList from "../Pages/Admin/Employees/EmployeesList";
import EmployeeFormLinks from "../Pages/Admin/Employees/EmployeeFormLinks";

import BenefitView from "../Pages/Admin/Benefits/BenefitView";
import BenefitsList from "../Pages/Admin/Benefits/BenefitsList";

import ApplicationsList from "../Pages/Admin/Applications/ApplicationsList";
import ApplicationTypes from "../Pages/Admin/Applications/ApplicationTypes";

import AnnouncementList from "../Pages/Admin/Announcements/AnnouncementList";

import TrainingsList from "../Pages/Admin/Trainings/TrainingsList";
import TrainingView from "../Pages/Admin/Trainings/TrainingView";

import PerformanceEvaluationAdd from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationAdd";
import PerformanceEvaluationList from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationList";

import DocumentsList from "../Pages/Documents/DocumentsList";

import AttendanceView from "../Pages/Admin/Attendance/AttendanceView";
import AttendanceLogs from "../Pages/Admin/Attendance/AttendanceLogs";
import AttendanceSummary from "../Pages/Admin/Attendance/AttendanceSummary";

import WorkDayView from "../Pages/Admin/WorkDays/WorkDayView";

import WorkshiftsAdd from "../Pages/Admin/WorkShifts/WorkshiftsAdd";
import WorkshiftView from "../Pages/Admin/WorkShifts/WorkshiftView";

import WorkGroupsAdd from "../Pages/Admin/WorkGroups/WorkGroupsAdd";
import WorkGroupView from "../Pages/Admin/WorkGroups/WorkGroupView";

import PayrollProcess from "../Pages/Admin/Payroll/PayrollProcess";
import PayrollRecords from "../Pages/Admin/Payroll/PayrollRecords";

import LoanList from "../Pages/Admin/Loans/LoanList";

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
            <Route path="employees/add" element={<ProtectedRoute element={<EmployeesAdd />} user={user} />} />
            <Route path="employees/formlinks" element={<ProtectedRoute element={<EmployeeFormLinks />} user={user} />} />

            <Route path="employees/benefits" element={<ProtectedRoute element={<BenefitsList />} user={user} />} />
            <Route path="employees/benefits/:benefitName" element={<ProtectedRoute element={<BenefitView />} user={user} />} />

            <Route path="attendance/logs" element={<ProtectedRoute element={<AttendanceLogs />} user={user} />} />
            <Route path="attendance/:user" element={<ProtectedRoute element={<AttendanceView />} user={user} />} />
            <Route path="attendance/summary" element={<ProtectedRoute element={<AttendanceSummary />} user={user} />} />

            <Route path="applications" element={<ProtectedRoute element={<ApplicationsList />} user={user} />} />
            <Route path="application/types" element={<ProtectedRoute element={<ApplicationTypes />} user={user} />} />

            <Route path="announcements" element={<ProtectedRoute element={<AnnouncementList />} user={user} />} />

            <Route path="trainings" element={<ProtectedRoute element={<TrainingsList />} user={user} />} />
            <Route path="training/:code" element={<ProtectedRoute element={<TrainingView />} user={user} />} />

            <Route path="performance-evaluation/add" element={<ProtectedRoute element={<PerformanceEvaluationAdd />} user={user} />} />
            <Route path="performance-evaluation" element={<ProtectedRoute element={<PerformanceEvaluationList />} user={user} />} />

            <Route path="documents" element={<ProtectedRoute element={<DocumentsList />} user={user} />} />

            <Route path="settings/general" element={<ProtectedRoute element={<GeneralSettings />} user={user} />} />

            <Route path="workshift/:client/:shift" element={<ProtectedRoute element={<WorkshiftView />} user={user} />} />
            <Route path="workshifts/add" element={<ProtectedRoute element={<WorkshiftsAdd />} user={user} />} />

            <Route path="workgroup/:client/:group" element={<ProtectedRoute element={<WorkGroupView />} user={user} />} />
            <Route path="workgroups/add" element={<ProtectedRoute element={<WorkGroupsAdd />} user={user} />} />

            <Route path="workdays" element={<ProtectedRoute element={<WorkDayView />} user={user} />} />


            <Route path="payroll/process" element={<ProtectedRoute element={<PayrollProcess />} user={user} />} />
            <Route path="payroll/records" element={<ProtectedRoute element={<PayrollRecords />} user={user} />} />

            <Route path="loan-management" element={<ProtectedRoute element={<LoanList />} user={user} />} />

            {/* <Route path="performance-evaluation-edit/:id" element={<ProtectedRoute element={<HrEvaluationEdit />} user={user} />} /> */}
        </Routes>
    );
};

export default AdminRoutes;
