import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Error404 from "../Pages/Errors/Error404";

import HrDashboard from "../Pages/Hr/HrDashboard";
import HrEmployees from "../Pages/Admin/Employees/HrEmployees";

import HrEmployeeCreate from "../Pages/Hr/HrEmployeeCreate";
import HrProfile from "../Pages/Hr/HrProfile";
import HrEmployeesBenefits from "../Pages/Hr/HrEmployeesBenefits";
import HrEmployeesDeductions from "../Pages/Hr/HrEmployeesDeductions";
import HrEmployeesCalendar from "../Pages/Hr/HrEmployeesCalendar";
// import Workshifts from "../Pages/Admin/Workshifts/Workshifts";
// import Workshift from "../Pages/Admin/Workshifts/Workshift";
import HrApplications from "../Pages/Hr/HrApplications";
import HrApplicationList from "../Pages/Hr/HrApplicationList";
import HrApplicationLeave from "../Pages/Hr/HrApplicationLeave";
import HrAttendance from "../Pages/Hr/HrAttendance";
import HrAttendanceEmployee from "../Pages/Hr/HrAttendanceEmployee";
import HrPayrollProcess from "../Pages/Hr/HrPayrollProcess";
import HrPayrollProcessUnextended from "../Pages/Hr/HrPayrollProcessUnextended";
import HrPayrollProcessExtended from "../Pages/Hr/HrPayrollProcessExtended";
import HrPayrollRecords from "../Pages/Hr/HrPayrollRecords";
import HrPayrollSummary from "../Pages/Hr/HrPayrollSummary";
import HrAnnouncements from "../Pages/Hr/HrAnnouncements";
import HrAnnouncementView from "../Pages/Hr/HrAnnouncementView";
import HrTrainings from "../Pages/Hr/HrTrainings";
import HrEvaluation from "../Pages/Hr/HrEvaluation";
import HrEvaluationAdd from "../Pages/Hr/HrEvaluationAdd";
import HrEvaluationEdit from "../Pages/Hr/HrEvaluationEdit";
import HrEvaluationCreateForm from "../Pages/Hr/HrEvaluationCreateForm";
import HrEvaluationReview from "../Pages/Hr/HrEvaluationReview";
import HrSummaryReports from "../Pages/Hr/HrSummaryReports";
import HrTrainingsView from "../Pages/Hr/HrTrainingsView";
import HrApplicationOvertime from "../Pages/Hr/HrApplicationOvertime";
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
      <Route path="employees" element={<ProtectedRoute element={<HrEmployees />} user={user} />} />
      <Route path="create-employee" element={<ProtectedRoute element={<HrEmployeeCreate />} user={user} />} />
      <Route path="profile" element={<ProtectedRoute element={<HrProfile />} user={user} />} />
      <Route path="employees-benefits" element={<ProtectedRoute element={<HrEmployeesBenefits />} user={user} />} />
      <Route path="employees-deductions" element={<ProtectedRoute element={<HrEmployeesDeductions />} user={user} />} />
      <Route path="workdays" element={<ProtectedRoute element={<HrEmployeesCalendar />} user={user} />} />

      <Route path="workshift" element={<ProtectedRoute element={<Workshift />} user={user} />} />
      {/* <Route path="workshifts" element={<ProtectedRoute element={<Workshifts />} user={user} />} /> */}

      <Route path="applications" element={<ProtectedRoute element={<HrApplications />} user={user} />} />
      <Route path="applications-list" element={<ProtectedRoute element={<HrApplicationList />} user={user} />} />
      <Route path="applications-leave" element={<ProtectedRoute element={<HrApplicationLeave />} user={user} />} />
      <Route path="applications-overtime" element={<ProtectedRoute element={<HrApplicationOvertime />} user={user} />} />

      <Route path="attendance" element={<ProtectedRoute element={<HrAttendance />} user={user} />} />
      <Route path="attendance/:month/:year" element={<ProtectedRoute element={<HrAttendance />} user={user} />} />
      <Route path="attendance-employee/:month/:year/:employeeId" element={<ProtectedRoute element={<HrAttendanceEmployee />} user={user} />} />
      <Route path="payroll-process" element={<ProtectedRoute element={<HrPayrollProcess />} user={user} />} />
      <Route path="payroll-process/unextended" element={<ProtectedRoute element={<HrPayrollProcessUnextended />} user={user} />} />
      <Route path="payroll-process/extended" element={<ProtectedRoute element={<HrPayrollProcessExtended />} user={user} />} />
      <Route path="payroll-records" element={<ProtectedRoute element={<HrPayrollRecords />} user={user} />} />
      <Route path="payroll-summary" element={<ProtectedRoute element={<HrPayrollSummary />} user={user} />} />
      <Route path="announcements" element={<ProtectedRoute element={<HrAnnouncements />} user={user} />} />
      <Route path="announcement-view" element={<ProtectedRoute element={<HrAnnouncementView />} user={user} />} />
      <Route path="trainings" element={<ProtectedRoute element={<HrTrainings />} user={user} />} />
      <Route path="summary-reports" element={<ProtectedRoute element={<HrSummaryReports />} user={user} />} />
      <Route path="trainings-view" element={<ProtectedRoute element={<HrTrainingsView />} user={user} />} />
      <Route path="performance-evaluation" element={<ProtectedRoute element={<HrEvaluation />} user={user} />} />
      <Route path="performance-evaluation-add" element={<ProtectedRoute element={<HrEvaluationAdd />} user={user} />} />
      <Route path="performance-evaluation-edit/:id" element={<ProtectedRoute element={<HrEvaluationEdit />} user={user} />} />
      <Route path="performance-evaluation-create" element={<ProtectedRoute element={<HrEvaluationCreateForm />} user={user} />} />
      <Route path="performance-evaluation-review/:id" element={<ProtectedRoute element={<HrEvaluationReview />} user={user} />} />
    </Routes>
  );
};

export default HrRoutes;
