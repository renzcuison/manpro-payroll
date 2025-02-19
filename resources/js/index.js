import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import AccountingDashboard from "./Pages/Accounting/AccountingDashboard";

import { queryClient } from "./utils/queryClient";
import { useUser } from "./hooks/useUser";
import Sales from "./Pages/Accounting/Sales";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CheckUser from "./Pages/CheckUser";
import Dashboard from "./Pages/Dashboard";
import Invoice from "./Pages/Accounting/Invoice";

import AdminDashboard from "./Pages/Hr/HrDashboard";
import EmployeeDashboard from "./Pages/Employee/Dashboard/DashboardView.jsx";
import SuperAdminDashboard from "./Pages/SuperAdmin/Dashboard";

import Error404 from "./Pages/Errors/Error404";

import SuperEmployees from "./Pages/Super/SuperEmployees";
import SuperApplications from "./Pages/Super/SuperApplications";
import SuperAttendance from "./Pages/Super/SuperAttendance";
import SuperPayroll from "./Pages/Super/SuperPayroll";
import SuperResetPassword from "./Pages/Super/SuperResetPassword";
import SuperEmployeesList from "./Pages/Super/SuperEmployeesList";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import VerifyLogin from "./Pages/VerifyLogin";

import MemberPersonalDetails from "./Pages/Member/MemberPersonalDetails";
import MemberChangePassword from "./Pages/Member/MemberChangePassword";

import Reports from "./Pages/Reports/Reports.jsx";
import ReportCreate from "./Pages/Reports/ReportCreate.jsx";
import ReportView from "./Pages/Reports/ReportView.jsx";
import ReportEdit from "./Pages/Reports/ReportEdit.jsx";

import HrRoutes from "./Routes/HrRoutes.jsx";


import HrEmployeeAddEmp from "./Pages/Hr/HrEmployeeAddEmp";


import AdminRoutes from "./Routes/AdminRoutes.jsx";
import EmployeeRoutes from "./Routes/EmployeeRoutes.jsx";
import SuperAdminRoutes from "./Routes/SuperAdminRoutes.jsx";

function App() {
    const { user, isFetching } = useUser();
    if (isFetching) return null; // or a loading spinner
  
    return (
      <Routes>

        <Route path="/" element={ user ? (
              user.user_type === 'SuperAdmin' ? ( <SuperAdminDashboard /> ) : user.user_type === 'Admin' ? ( <AdminDashboard /> ) : user.user_type === 'Employee' ? ( <EmployeeDashboard /> ) : ( <CheckUser /> )
            ) : (
              <CheckUser />
            )
          }
        />

        <Route path="/dashboard" element={ user ? (
              user.user_type === 'SuperAdmin' ? ( <SuperAdminDashboard /> ) : user.user_type === 'Admin' ? ( <AdminDashboard /> ) : user.user_type === 'Employee' ? ( <EmployeeDashboard /> ) : ( <CheckUser /> )
            ) : (
              <CheckUser />
            )
          }
        />

        <Route path="/hr/*" element={<HrRoutes user={user} />} />
        <Route path="/admin/*" element={<AdminRoutes user={user} />} />
        <Route path="/super-admin/*" element={<SuperAdminRoutes user={user} />} />
        <Route path="/employee/*" element={<EmployeeRoutes user={user} />} />


        {/* Unprotected Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/:code" element={<Register />} />


























        {/* <Route path="/member/*" element={<MemberRoutes user={user} />} /> */}

        {/* <Route path="/" element={user && user.user_type !== 'Member' && user.user_type !== 'Suspended' ? <VerifyLogin /> : user && user.user_type === 'Member' ? <VerifyLogin /> : <Login />} /> */}

        {/* <Route
            path="/"
            element={
                user ? (
                    user.user_type === 'Admin' ? <AdminDashboard /> :
                    user.user_type === 'SuperAdmin' ? <SuperAdminDashboard /> :
                    user.user_type === 'Member' ? <MemberDashboard /> :
                    user.user_type === 'Suspended' ? <SuspendedMessage /> :
                    <UnauthorizedAccess />
                ) : (
                    <Login />
                )
            }
        /> */}
  
        {/* SUPER ADMIN ROUTES */}
        <Route path="/super/employees" element={user ? <SuperEmployees /> : <CheckUser />} />
        <Route path="/super/applications" element={user ? <SuperApplications /> : <CheckUser />} />
        <Route path="/super/attendance" element={user ? <SuperAttendance /> : <CheckUser />} />
        <Route path="/super/payroll-process" element={user ? <SuperPayroll /> : <CheckUser />} />
        <Route path="/super/reset-password" element={user ? <SuperResetPassword /> : <CheckUser />} />
        <Route path="/super/employee-reset-password" element={user ? <SuperEmployeesList /> : <CheckUser />} />

    
        {/* ----------------------------------------------------------------------------------------------- */}
        {/* GLOBAL ROUTES */}
        <Route path="/reports" element={user ? <Reports /> : <CheckUser />} />
        <Route path="/report-create" element={user ? <ReportCreate /> : <CheckUser />} />
        <Route path="/report-view/:id" element={user ? <ReportView /> : <CheckUser />} />
        <Route path="/report-edit/:id" element={user ? <ReportEdit /> : <CheckUser />} />

        <Route path="/personal-details" element={user ? <MemberPersonalDetails /> : <CheckUser />} />
        <Route path="/change-password" element={user ? <MemberChangePassword /> : <CheckUser />} />

        {/* OTHER ROUTES */}
        <Route path="/accounting" element={user ? <AccountingDashboard /> : <CheckUser />} />
        <Route path="/accounting/dashboard" element={user ? <AccountingDashboard /> : <CheckUser />} />
        <Route path="/accounting/sales" element={user ? <Sales /> : <CheckUser />} />
        <Route path="/accounting/invoice" element={user ? <Invoice /> : <CheckUser />} />
        <Route path="/check-user" element={<CheckUser />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verifyLogin" element={<VerifyLogin />} />

        <Route path="/add-employee" element={<HrEmployeeAddEmp />} />

        <Route path="/error-404" element={<Error404 />} />
      </Routes>
    );
  }
  
  export default App;
  
  if (document.getElementById("app")) {
    const container = document.getElementById("app");
    const root = createRoot(container);
    root.render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }