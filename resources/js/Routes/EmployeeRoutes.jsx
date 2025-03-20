import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Error404 from "../Pages/Errors/Error404";

import Dashboard from "../Pages/Employee/Dashboard/DashboardView";
import AttendanceLogs from "../Pages/Employee/Attendance/AttendanceLogs";
import AttendanceSummary from "../Pages/Employee/Attendance/AttendanceSummary";
import ApplicationList from "../Pages/Employee/Applications/ApplicationList";
import AnnouncementList from "../Pages/Employee/Announcements/AnnouncementList";
import AnnouncementView from "../Pages/Employee/Announcements/AnnouncementView";
import TrainingList from "../Pages/Employee/Trainings/TrainingList";
import TrainingView from "../Pages/Employee/Trainings/TrainingView";
import ProfileEdit from "../Pages/Employee/Profile/ProfileEdit";

import MemberAttendance from "../Pages/Member/MemberAttendance";
import MemberApplication from "../Pages/Member/MemberApplication";
import MemberPayrollDetails from "../Pages/Member/MemberPayrollDetails";
import MemberAnnouncements from "../Pages/Member/MemberAnnouncements";
import MemberTrainings from "../Pages/Member/MemberTrainings";
import MemberEvaluate from "../Pages/Member/MemberEvaluate";
import MemberEvaluation from "../Pages/Member/MemberEvaluation";
import MemberMyEvaluation from "../Pages/Member/MemberMyEvaluation";
import MemberForEvaluation from "../Pages/Member/MemberForEvaluation";
import MemberIncidentReports from "../Pages/Member/MemberIncidentReports";
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

            {/* Application Routes ----------------------------------------- */}
            <Route path="application-list" element={<ProtectedRoute element={<ApplicationList />} user={user} />} />

            {/* Announcement Routes ----------------------------------------- */}
            <Route path="announcements" element={<ProtectedRoute element={<AnnouncementList />} user={user} />} />
            <Route path="announcement/:code" element={<ProtectedRoute element={<AnnouncementView />} user={user} />} />

            <Route path="trainings" element={<ProtectedRoute element={<TrainingList />} user={user} />} />
            <Route path="training/:code" element={<ProtectedRoute element={<TrainingView />} user={user} />} />
            <Route path="training-content/:code" element={<ProtectedRoute element={<ContentView />} user={user} />} />

            {/* Profile Routes ----------------------------------------- */}
            <Route path="profile-edit" element={<ProtectedRoute element={<ProfileEdit />} user={user} />} />

            {/* Old Routes ------------------------------------------------ */}
            {/* ----------------------------------------------------------- */}
            <Route path="member-attendance" element={<ProtectedRoute element={<MemberAttendance />} user={user} />} />
            <Route path="member-application" element={<ProtectedRoute element={<MemberApplication />} user={user} />}
            />
            <Route path="member-payroll-details" element={<ProtectedRoute element={<MemberPayrollDetails />} user={user} />}
            />
            <Route path="member-announcements" element={<ProtectedRoute element={<MemberAnnouncements />} user={user} />}
            />
            <Route path="trainings" element={<ProtectedRoute element={<MemberTrainings />} user={user} />}
            />

            {/* <Route path="evaluation" element={<ProtectedRoute element={<MemberEvaluation />} user={user} />} /> */}
            <Route path="evaluate" element={<ProtectedRoute element={<MemberForEvaluation />} user={user} />}
            />
            <Route path="evaluate/:id" element={<ProtectedRoute element={<MemberEvaluate />} user={user} />}
            />
            <Route path="evaluation" element={<ProtectedRoute element={<MemberMyEvaluation />} user={user} />}
            />
            <Route path="incident-reports" element={<ProtectedRoute element={<MemberIncidentReports />} user={user} />}
            />
        </Routes>
    );
};

export default EmployeeRoutes;
