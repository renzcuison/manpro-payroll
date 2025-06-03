import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Error404 from "../Pages/Errors/Error404";

import Dashboard from "../Pages/Admin/Dashboard/Dashboard";

import DepartmentList from "../Pages/Admin/Department/DepartmentList";
import DepartmentDetails from "../Pages/Admin/Department/DepartmentDetails";
import BranchList from "../Pages/Admin/Branches/BranchList";
import BranchDetails from "../Pages/Admin/Branches/BranchDetails";

import EmployeesAdd from "../Pages/Admin/Employees/EmployeesAdd";
import EmployeeView from "../Pages/Admin/Employees/EmployeeView";
import EmployeesList from "../Pages/Admin/Employees/EmployeesList";
import EmployeeFormLinks from "../Pages/Admin/Employees/EmployeeFormLinks";

import LeaveCreditList from "../Pages/Admin/LeaveCredits/LeaveCreditList";

import AllowanceTypes from "../Pages/Admin/Allowance/AllowanceTypes";
import EmployeesAllowanceList from "../Pages/Admin/Allowance/EmployeesAllowanceList";

import BenefitView from "../Pages/Admin/Benefits/BenefitView";
import BenefitsList from "../Pages/Admin/Benefits/BenefitsList";

import ApplicationsList from "../Pages/Admin/Applications/ApplicationsList";
import ApplicationTypes from "../Pages/Admin/Applications/ApplicationTypes";
import OvertimeAppsList from "../Pages/Admin/Applications/OvertimeAppsList";
import OvertimeTypes from "../Pages/Admin/Applications/OvertimeTypes";

import AnnouncementList from "../Pages/Admin/Announcements/AnnouncementList";
import AnnouncementAdd from "../Pages/Admin/Announcements/Modals/AnnouncementAdd";
import AnnouncementPublishFilter from '@/Pages/Admin/Announcements/Modals/AnnouncementPublishFilter';
import AnnouncementTypes from '../Pages/Admin/Announcements/AnnouncementTypes';

import TrainingsList from "../Pages/Admin/Trainings/TrainingsList";
import TrainingView from "../Pages/Admin/Trainings/TrainingView";

import PerformanceEvaluationAdd from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationAdd";
import PerformanceEvaluationFormAcknowledge from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAcknowledge";
import PerformanceEvaluationFormAcknowledgeSign from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAcknowledgeSign";
import PerformanceEvaluationFormAddCategory from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAddCategory";
import PerformanceEvaluationFormAddSection from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAddSection";
import PerformanceEvaluationFormSaveEvaluation from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormSaveEvaluation";
import PerformanceEvaluationFormAddSubcategory from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAddSubcategory";
import PerformanceEvaluationFormPage from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationFormPage';  // Import the new page
import PeEvalTest from '../Pages/Admin/PerformanceEvaluation/PeEvalTest';  // Import the new page

import PerformanceEvaluationList from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationList";
import PerformanceEvaluationForm from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationForm";
import PerformanceEvaluationCreateEvaluation from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationCreateEvaluation";

import AttendanceView from "../Pages/Admin/Attendance/AttendanceView";
import AttendanceLogs from "../Pages/Admin/Attendance/AttendanceLogs";
import AttendanceToday from "../Pages/Admin/Attendance/AttendanceToday";
import AttendanceSummary from "../Pages/Admin/Attendance/AttendanceSummary";

import WorkDayView from "../Pages/Admin/WorkDays/WorkDayView";

import WorkshiftsAdd from "../Pages/Admin/WorkShifts/WorkshiftsAdd";
import WorkshiftView from "../Pages/Admin/WorkShifts/WorkshiftView";

import WorkGroupsAdd from "../Pages/Admin/WorkGroups/WorkGroupsAdd";
import WorkGroupView from "../Pages/Admin/WorkGroups/WorkGroupView";

import PayrollProcess from "../Pages/Admin/Payroll/PayrollProcess";
import PayrollRecords from "../Pages/Admin/Payroll/PayrollRecords";
import PayrollSummary from "../Pages/Admin/Payroll/PayrollSummary";

import LoanList from "../Pages/Admin/Loans/LoanList";

import GeneralSettings from "../Pages/Admin/Settings/GeneralSettings";
import Documents from "../Pages/Admin/Documents";
import AddNewPerimeter from "../Pages/Admin/Perimeters/AddRadiusPerimeter";
import Perimeter from "../Pages/Admin/Perimeters/Perimeters";
import ScheduleModule from "../Pages/Admin/Schedules";
import Milestones from "../Pages/Admin/Milestones";

const AdminRoutes = ({ user }) => {
    const navigate = useNavigate();

    if (!user) {
        navigate("/");
    } else if (user.user_type !== "Admin") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route path="dashboard" element={ <ProtectedRoute element={<Dashboard />} user={user} /> } />

            <Route path="employee/:user" element={<ProtectedRoute element={<EmployeeView />} user={user} />} />
            <Route path="employees" element={<ProtectedRoute element={<EmployeesList />} user={user} /> } />
            <Route path="employees/add" element={<ProtectedRoute element={<EmployeesAdd />} user={user} /> } />
            <Route path="employees/formlinks" element={<ProtectedRoute element={<EmployeeFormLinks />} user={user} /> } />

            <Route path="employees/allowance" element={<ProtectedRoute element={<EmployeesAllowanceList />} user={user} /> } />
            <Route path="employees/allowance-types" element={<ProtectedRoute element={<AllowanceTypes />} user={user} /> } />

            <Route path="employees/benefits" element={<ProtectedRoute element={<BenefitsList />} user={user} /> } />
            <Route path="employees/benefits/:benefitID" element={<ProtectedRoute element={<BenefitView />} user={user} /> } />

            <Route path="department/departmentlist" element={<ProtectedRoute element={<DepartmentList />} user={user} />} />
            <Route path="department/:id" element={<ProtectedRoute element={<DepartmentDetails />} user={user} />} />

            <Route path="branches/branchlist" element={<ProtectedRoute element={<BranchList />} user={user} />} />
            <Route path="branches/:id" element={<ProtectedRoute element={<BranchDetails />} user={user} />} />

            <Route path="attendance/logs" element={<ProtectedRoute element={<AttendanceLogs />} user={user} />} />
            <Route path="attendance/:user" element={<ProtectedRoute element={<AttendanceView />} user={user} />} />
            <Route path="attendance/today" element={<ProtectedRoute element={<AttendanceToday />} user={user} />} />
            <Route path="attendance/summary" element={<ProtectedRoute element={<AttendanceSummary />} user={user} />} />

            <Route path="applications" element={<ProtectedRoute element={<ApplicationsList />} user={user} />} />
            <Route path="application/types" element={<ProtectedRoute element={<ApplicationTypes />} user={user} />} />

            <Route path="application/overtimes" element={<ProtectedRoute element={<OvertimeAppsList />} user={user} /> } />
            <Route path="application/overtime/types" element={<ProtectedRoute element={<OvertimeTypes />} user={user} /> } />

            <Route path="application/leave-credits" element={<ProtectedRoute element={<LeaveCreditList />} user={user} /> } />

            <Route path="announcements" element={<ProtectedRoute element={<AnnouncementList />} user={user} /> } />
            <Route path="announcements/types" element={<AnnouncementTypes />} />
            <Route path="announcements/types/publish-filter" element={<AnnouncementPublishFilter />} />
            <Route path="announcements/add" element={<ProtectedRoute element={<AnnouncementAdd open={true} close={() => window.history.back()} />} user={user} />} />

            <Route path="trainings" element={<ProtectedRoute element={<TrainingsList />} user={user} /> } />
            <Route path="training/:code" element={<ProtectedRoute element={<TrainingView />} user={user} /> } />

            <Route path="performance-evaluation/add" element={<ProtectedRoute element={<PerformanceEvaluationAdd />} user={user} />} />
            <Route path="performance-evaluation/acknowledgment" element={<ProtectedRoute element={<PerformanceEvaluationFormAcknowledge />} user={user} />} />
            <Route path="performance-evaluation/acknowledgment-sign" element={<ProtectedRoute element={<PerformanceEvaluationFormAcknowledgeSign />} user={user} />} />
            <Route path="performance-evaluation/add-category" element={<ProtectedRoute element={<PerformanceEvaluationFormAddCategory />} user={user} />} />
            <Route path="performance-evaluation/add-section" element={<ProtectedRoute element={<PerformanceEvaluationFormAddSection />} user={user} />} />
            <Route path="performance-evaluation/save-evaluation" element={<ProtectedRoute element={<PerformanceEvaluationFormSaveEvaluation />} user={user} />} />
            <Route path="performance-evaluation/subcategory-modal" element={<ProtectedRoute element={<PerformanceEvaluationFormAddSubcategory />} user={user} />} />
            <Route path="performance-evaluation/create-evaluation" element={<ProtectedRoute element={<PerformanceEvaluationCreateEvaluation />} user={user} />} />    
            <Route path="performance-evaluation/form/:formName" element={<ProtectedRoute element={<PerformanceEvaluationFormPage />} user={user} />} />

            <Route path="performance-evaluation/form" element={<ProtectedRoute element={<PerformanceEvaluationForm />} user={user} />} />
            <Route path="performance-evaluation" element={<ProtectedRoute element={<PerformanceEvaluationList />} user={user} />} />
            <Route path="performance-evaluation/forms/:name" element={<ProtectedRoute element={<PerformanceEvaluationCreateEvaluation />} user={user} />} />
            <Route path="performance-evaluation/evalTest" element={<ProtectedRoute element={<PeEvalTest />} user={user} />} />

            <Route path="documents" element={<ProtectedRoute element={<Documents />} user={user} />} />

            <Route path="settings/general" element={<ProtectedRoute element={<GeneralSettings />} user={user} /> } />

            <Route path="perimeters" element={<ProtectedRoute element={<Perimeter />} user={user} />} />
            <Route path="perimeters/add" element={<ProtectedRoute element={<AddNewPerimeter />} user={user} /> } />

            <Route path="workshift/:client/:selectedShift" element={<ProtectedRoute element={<WorkshiftView />} user={user} />} />
            <Route path="workshifts/add" element={<ProtectedRoute element={<WorkshiftsAdd />} user={user} />} />

            <Route path="workgroup/:client/:group" element={<ProtectedRoute element={<WorkGroupView />} user={user} />} />
            <Route path="workgroups/add" element={<ProtectedRoute element={<WorkGroupsAdd />} user={user} />} />

            <Route path="workdays" element={<ProtectedRoute element={<WorkDayView />} user={user} />} />

            <Route path="payroll/process" element={<ProtectedRoute element={<PayrollProcess />} user={user} />} />
            <Route path="payroll/records" element={<ProtectedRoute element={<PayrollRecords />} user={user} />} />
            <Route path="payroll/summary" element={<ProtectedRoute element={<PayrollSummary />} user={user} />} />

            <Route path="loan-management" element={<ProtectedRoute element={<LoanList />} user={user} />} />

            <Route
                path="schedules"
                element={
                    <ProtectedRoute element={<ScheduleModule />} user={user} />
                }
            />

            <Route
                path="milestones"
                element={
                    <ProtectedRoute element={<Milestones />} user={user} />
                }
            />
        </Routes>
    );
};

export default AdminRoutes;