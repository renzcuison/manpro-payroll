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

import AdminDashboard from "./Pages/Admin/Dashboard/Dashboard.jsx";
import EmployeeDashboard from "./Pages/Employee/Dashboard/DashboardView.jsx";
import SuperAdminDashboard from "./Pages/SuperAdmin/Dashboard";

import Error404 from "./Pages/Errors/Error404";

import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import VerifyLogin from "./Pages/VerifyLogin";

import Profile from "./Pages/Users/Profile/Profile.jsx";

import Reports from "./Pages/Reports/Reports.jsx";
import ReportCreate from "./Pages/Reports/ReportCreate.jsx";
import ReportView from "./Pages/Reports/ReportView.jsx";
import ReportEdit from "./Pages/Reports/ReportEdit.jsx";

import HrRoutes from "./Routes/HrRoutes.jsx";

import AdminRoutes from "./Routes/AdminRoutes.jsx";
import EmployeeRoutes from "./Routes/EmployeeRoutes.jsx";
import SuperAdminRoutes from "./Routes/SuperAdminRoutes.jsx";
import { createTheme, ThemeProvider } from "@mui/material";

import AnnouncementPublished from "./Pages/Admin/Announcements/AnnouncementPublished.jsx";
import AnnouncementPending from "./Pages/Admin/Announcements/AnnouncementPending.jsx";
import AnnouncementHidden from "./Pages/Admin/Announcements/AnnouncementHidden.jsx";
import AnnouncementList from "./Pages/Admin/Announcements/AnnouncementList.jsx";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2e7d32",
        },
        secondary: {
            main: "rgb(233, 171, 19,0.7)",
        },
        background: {
            default: "#f5f5f5",
        },
    },
    typography: {
        fontFamily: [
            "Nunito",
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
        ].join(","),
    },
});
function App() {
    const { user, isFetching } = useUser();

    if (isFetching) return null; // or a loading spinner

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
                        user.user_type === "SuperAdmin" ? (
                            <SuperAdminDashboard />
                        ) : user.user_type === "Admin" ? (
                            <AdminDashboard />
                        ) : user.user_type === "Employee" ? (
                            <EmployeeDashboard />
                        ) : (
                            <CheckUser />
                        )
                    ) : (
                        <CheckUser />
                    )
                }
            />

            <Route
                path="/dashboard"
                element={
                    user ? (
                        user.user_type === "SuperAdmin" ? (
                            <SuperAdminDashboard />
                        ) : user.user_type === "Admin" ? (
                            <AdminDashboard />
                        ) : user.user_type === "Employee" ? (
                            <EmployeeDashboard />
                        ) : (
                            <CheckUser />
                        )
                    ) : (
                        <CheckUser />
                    )
                }
            />

            <Route path="/hr/*" element={<HrRoutes user={user} />} />
            <Route path="/admin/*" element={<AdminRoutes user={user} />} />
            <Route
                path="/super-admin/*"
                element={<SuperAdminRoutes user={user} />}
            />
            <Route
                path="/employee/*"
                element={<EmployeeRoutes user={user} />}
            />

            {/* Unprotected Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/:code" element={<Register />} />

            {/* User Profile Routes */}
            <Route
                path="/profile"
                element={user ? <Profile /> : <CheckUser />}
            />

            {/* ----------------------------------------------------------------------------------------------- */}
            {/* GLOBAL ROUTES */}
            <Route
                path="/reports"
                element={user ? <Reports /> : <CheckUser />}
            />
            <Route
                path="/report-create"
                element={user ? <ReportCreate /> : <CheckUser />}
            />
            <Route
                path="/report-view/:id"
                element={user ? <ReportView /> : <CheckUser />}
            />
            <Route
                path="/report-edit/:id"
                element={user ? <ReportEdit /> : <CheckUser />}
            />

            {/* OTHER ROUTES */}
            <Route
                path="/accounting"
                element={user ? <AccountingDashboard /> : <CheckUser />}
            />
            <Route
                path="/accounting/dashboard"
                element={user ? <AccountingDashboard /> : <CheckUser />}
            />
            <Route
                path="/accounting/sales"
                element={user ? <Sales /> : <CheckUser />}
            />
            <Route
                path="/accounting/invoice"
                element={user ? <Invoice /> : <CheckUser />}
            />
            <Route path="/check-user" element={<CheckUser />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verifyLogin" element={<VerifyLogin />} />

            <Route path="/error-404" element={<Error404 />} />
            <Route path="/AnnouncementList" element={user ? <AnnouncementList /> : <CheckUser />} />
            <Route path="/AnnouncementPublished" element={user ? <AnnouncementPublished /> : <CheckUser />} />
            <Route path="/AnnouncementPending" element={user ? <AnnouncementPending /> : <CheckUser />} />
            <Route path="/AnnouncementHidden" element={user ? <AnnouncementHidden /> : <CheckUser />} />

        </Routes>
    );
}

export default App;

if (document.getElementById("app")) {
    const container = document.getElementById("app");
    const root = createRoot(container);
    root.render(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
