import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Error404 from "../Pages/Errors/Error404";

import Dashboard from "../Pages/Admin/Dashboard/Dashboard";

import DepartmentList from "../Pages/Admin/Department/DepartmentList";
import DepartmentDetails from "../Pages/Admin/Department/DepartmentDetails";
import BranchList from "../Pages/Admin/Branches/BranchList";
import BranchDetails from "../Pages/Admin/Branches/BranchDetails";

import Roles from "../Pages/Admin/Roles/Roles";
import RolesDetails from "../Pages/Admin/Roles/RolesDetails"; 



import EmployeesAdd from "../Pages/Admin/Employees/EmployeesAdd";
import EmployeeView from "../Pages/Admin/Employees/EmployeeView";
import EmployeesList from "../Pages/Admin/Employees/EmployeesList";
import EmployeeFormLinks from "../Pages/Admin/Employees/EmployeeFormLinks";

import LeaveCreditList from "../Pages/Admin/LeaveCredits/LeaveCreditList";

import AllowanceTypes from "../Pages/Admin/Allowance/AllowanceTypes";
import EmployeesAllowanceList from "../Pages/Admin/Allowance/EmployeesAllowanceList";

import EmployeesIncentivesList from "../Pages/Admin/Incentives/EmployeesIncentivesList";
import IncentivesTypes from "../Pages/Admin/Incentives/IncentivesTypes";

import EmployeesBenefitsList from "../Pages/Admin/Benefits/EmployeesBenefitsList";
import BenefitsTypes from "../Pages/Admin/Benefits/BenefitsTypes";

import EmployeesDeductionsList from "../Pages/Admin/Deductions/EmployeesDeductionsList";
import DeductionsType from "../Pages/Admin/Deductions/DeductionsType";

import BenefitView from "../Pages/Admin/Benefits/BenefitView";

import EmployeeSalaryPlansList from "../Pages/Admin/SalaryPlans/EmployeeSalaryPlansList";
import SalaryPlanView from "../Pages/Admin/SalaryPlans/SalaryPlanView";

import ApplicationsList from "../Pages/Admin/Applications/ApplicationsList";
import ApplicationTypes from "../Pages/Admin/Applications/ApplicationTypes";
import OvertimeAppsList from "../Pages/Admin/Applications/OvertimeAppsList";
import OvertimeTypes from "../Pages/Admin/Applications/OvertimeTypes";

import AnnouncementList from "../Pages/Admin/Announcements/AnnouncementList";
import AnnouncementAdd from "../Pages/Admin/Announcements/Modals/AnnouncementAdd";
import AnnouncementPublishFilter from "@/Pages/Admin/Announcements/Modals/AnnouncementPublishFilter";
import AnnouncementTypes from "../Pages/Admin/Announcements/AnnouncementTypes";

import TrainingsList from "../Pages/Admin/Trainings/TrainingsList";
import TrainingView from "../Pages/Admin/Trainings/TrainingView";

import PerformanceEvaluationAdd from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationAdd";
import PerformanceEvaluationFormAcknowledge from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAcknowledge";
import PerformanceEvaluationFormAcknowledgeSign from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAcknowledgeSign";
import PerformanceEvaluationFormAddCategory from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAddCategory";
import PerformanceEvaluationFormAddSection from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAddSection";
import PerformanceEvaluationFormSaveEvaluation from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormSaveEvaluation";
import PerformanceEvaluationFormAddSubcategory from "../Pages/Admin/PerformanceEvaluation/Modals/PerformanceEvaluationFormAddSubcategory";
import PerformanceEvaluationFormPage from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationFormPage"; // Import the new page
import PeEvalTest from "../Pages/Admin/PerformanceEvaluation/PeEvalTest"; // Import the new page

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

import PemeRecords from "../Pages/Admin/MedicalRecords/PEME/PemeRecords";
import PemeRecordsForm from "../Pages/Admin/MedicalRecords/PEME/Forms/PemeRecordsForm";
import PemeResponses from "../Pages/Admin/MedicalRecords/PEME/PemeResponses";
import PemeQuestionnaireView from "../Pages/Admin/MedicalRecords/PEME/PemeQuestionnaireView";
import PemeQuestionnairePreview from "../Pages/Admin/MedicalRecords/PEME/PemeQuestionnairePreview";

import GroupLifeMasterlist from "../Pages/Admin/MedicalRecords/GroupLife/GroupLifeMasterlist";
import GroupLifeEmployees from "../Pages/Admin/MedicalRecords/GroupLife/GroupLifeEmployees";
import HMOMasterlist from "../Pages/Admin/MedicalRecords/HMO/HMOMasterlist";

import PerformanceEvaluationPreview from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationPreview'
import PerformanceEvaluationResponsePage from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationResponsePage';
import PerformanceEvaluationAnswerPage from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationAnswerPage';
import PerformanceEvaluationCommentorPage from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationCommentorPage'
import PerformanceEvaluationEvaluateePage from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationEvaluateePage';
import PerformanceEvaluationCreatorPage from '../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationCreatorPage'
import PerformanceEvaluationResultPage from "../Pages/Admin/PerformanceEvaluation/PerformanceEvaluationResultPage";

import CommingSoon from "../Pages/Admin/Staffing/CommingSoon";

const AdminRoutes = ({ user }) => {
    const navigate = useNavigate();

    if (!user) {
        navigate("/");
    } else if (user.user_type !== "Admin") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route
            path="performance-evaluation/results"
            element={<ProtectedRoute element={<PerformanceEvaluationResultPage />} user={user} />}
            />
            <Route path="performance-evaluation/preview" element={<ProtectedRoute element={< PerformanceEvaluationPreview/>} user={user} />} />
            {/* <Route path="performance-evaluation/response/:id" element={<ProtectedRoute element={<PerformanceEvaluationResponsePage />} user={user} />} /> */}
            <Route path="performance-evaluation/answer/:id" element={<ProtectedRoute element={<PerformanceEvaluationAnswerPage />} user={user} />} />
            <Route path="performance-evaluation/commentor/:id" element={<ProtectedRoute element={<PerformanceEvaluationCommentorPage />} user={user} />} />
            <Route path="performance-evaluation/evaluatee/:id" element={<ProtectedRoute element={<PerformanceEvaluationEvaluateePage />} user={user} />} />
            <Route path="performance-evaluation/creator/:id" element={<ProtectedRoute element={<PerformanceEvaluationCreatorPage />} user={user} />} />

            <Route path="staffing/onboarding" element={<ProtectedRoute element={<CommingSoon />} user={user} />} />
            <Route path="staffing/offboarding" element={<ProtectedRoute element={<CommingSoon />} user={user} />} />

            <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} user={user} />} />

            <Route path="employee/:user" element={ <ProtectedRoute element={<EmployeeView />} user={user} /> } />
            <Route path="employees" element={ <ProtectedRoute element={<EmployeesList />} user={user} /> } />
            <Route path="employees/add" element={ <ProtectedRoute element={<EmployeesAdd />} user={user} /> } />
            <Route path="employees/formlinks" element={ <ProtectedRoute element={<EmployeeFormLinks />} user={user} /> } />

            <Route path="compensation">
                <Route path="salary-plans" element={<ProtectedRoute element={<EmployeeSalaryPlansList />} user={user} />} />
                <Route path="salary-plans/:gradeParam" element={<ProtectedRoute element={<SalaryPlanView />} user={user} />} />

                <Route path="allowance" element={<ProtectedRoute element={<EmployeesAllowanceList />} user={user} />} />
                <Route path="allowance-types" element={<ProtectedRoute element={<AllowanceTypes />} user={user} />} />

                <Route path="deductions" element={<ProtectedRoute element={<EmployeesDeductionsList />} user={user} />} />
                <Route path="deductions-types" element={<ProtectedRoute element={<DeductionsType />} user={user} />} />

                <Route path="incentives" element={<ProtectedRoute element={<EmployeesIncentivesList />} user={user} />} />
                <Route path="incentives-types" element={<ProtectedRoute element={<IncentivesTypes />} user={user} />} />

                <Route path="benefits" element={<ProtectedRoute element={<EmployeesBenefitsList />} user={user} />} />
                <Route path="benefits-types" element={<ProtectedRoute element={<BenefitsTypes />} user={user} />} />
            </Route>

            <Route path="employees/benefits/:benefitID" element={<ProtectedRoute element={<BenefitView />} user={user} /> } />

            <Route
                path="department/departmentlist"
                element={
                    <ProtectedRoute element={<DepartmentList />} user={user} />
                }
            />
            <Route
                path="department/:id"
                element={
                    <ProtectedRoute
                        element={<DepartmentDetails />}
                        user={user}
                    />
                }
            />

            <Route
                path="branches"
                element={
                    <ProtectedRoute element={<BranchList />} user={user} />
                }
            />
            <Route
                path="branch/:id"
                element={
                    <ProtectedRoute element={<BranchDetails />} user={user} />
                }
            />

            <Route
                path="attendance/logs"
                element={
                    <ProtectedRoute element={<AttendanceLogs />} user={user} />
                }
            />
            <Route
                path="attendance/:user"
                element={
                    <ProtectedRoute element={<AttendanceView />} user={user} />
                }
            />
            <Route
                path="attendance/today"
                element={
                    <ProtectedRoute element={<AttendanceToday />} user={user} />
                }
            />
            <Route
                path="attendance/summary"
                element={
                    <ProtectedRoute
                        element={<AttendanceSummary />}
                        user={user}
                    />
                }
            />

            <Route
                path="applications"
                element={
                    <ProtectedRoute
                        element={<ApplicationsList />}
                        user={user}
                    />
                }
            />
            <Route
                path="application/types"
                element={
                    <ProtectedRoute
                        element={<ApplicationTypes />}
                        user={user}
                    />
                }
            />

            <Route
                path="application/overtimes"
                element={
                    <ProtectedRoute
                        element={<OvertimeAppsList />}
                        user={user}
                    />
                }
            />
            <Route
                path="application/overtime/types"
                element={
                    <ProtectedRoute element={<OvertimeTypes />} user={user} />
                }
            />

            <Route
                path="application/leave-credits"
                element={
                    <ProtectedRoute element={<LeaveCreditList />} user={user} />
                }
            />

            <Route
                path="announcements"
                element={
                    <ProtectedRoute
                        element={<AnnouncementList />}
                        user={user}
                    />
                }
            />
            <Route path="announcements/types" element={<AnnouncementTypes />} />
            <Route
                path="announcements/types/publish-filter"
                element={<AnnouncementPublishFilter />}
            />
            <Route
                path="announcements/add"
                element={
                    <ProtectedRoute
                        element={
                            <AnnouncementAdd
                                open={true}
                                close={() => window.history.back()}
                            />
                        }
                        user={user}
                    />
                }
            />

            <Route
                path="trainings"
                element={
                    <ProtectedRoute element={<TrainingsList />} user={user} />
                }
            />
            <Route
                path="training/:code"
                element={
                    <ProtectedRoute element={<TrainingView />} user={user} />
                }
            />

            <Route
                path="performance-evaluation/add"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationAdd />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/acknowledgment"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormAcknowledge />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/acknowledgment-sign"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormAcknowledgeSign />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/add-category"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormAddCategory />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/add-section"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormAddSection />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/save-evaluation"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormSaveEvaluation />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/subcategory-modal"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormAddSubcategory />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/create-evaluation"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationCreateEvaluation />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/form/:formName"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationFormPage />}
                        user={user}
                    />
                }
            />

            <Route
                path="performance-evaluation/form"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationForm />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationList />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/forms/:name"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationCreateEvaluation />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/form"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationForm />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationList />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/forms/:name"
                element={
                    <ProtectedRoute
                        element={<PerformanceEvaluationCreateEvaluation />}
                        user={user}
                    />
                }
            />
            <Route
                path="performance-evaluation/evalTest"
                element={
                    <ProtectedRoute element={<PeEvalTest />} user={user} />
                }
            />

            <Route
                path="documents"
                element={<ProtectedRoute element={<Documents />} user={user} />}
            />

            <Route
                path="settings/general"
                element={
                    <ProtectedRoute element={<GeneralSettings />} user={user} />
                }
            />

            <Route
                path="perimeters"
                element={<ProtectedRoute element={<Perimeter />} user={user} />}
            />
            <Route
                path="perimeters/add"
                element={
                    <ProtectedRoute element={<AddNewPerimeter />} user={user} />
                }
            />

            <Route
                path="workshift/:client/:selectedShift"
                element={
                    <ProtectedRoute element={<WorkshiftView />} user={user} />
                }
            />
            <Route
                path="workshifts/add"
                element={
                    <ProtectedRoute element={<WorkshiftsAdd />} user={user} />
                }
            />

            <Route
                path="workgroup/:client/:group"
                element={
                    <ProtectedRoute element={<WorkGroupView />} user={user} />
                }
            />
            <Route
                path="workgroups/add"
                element={
                    <ProtectedRoute element={<WorkGroupsAdd />} user={user} />
                }
            />

            <Route
                path="workdays"
                element={
                    <ProtectedRoute element={<WorkDayView />} user={user} />
                }
            />

            <Route
                path="payroll/process"
                element={
                    <ProtectedRoute element={<PayrollProcess />} user={user} />
                }
            />
            <Route
                path="payroll/records"
                element={
                    <ProtectedRoute element={<PayrollRecords />} user={user} />
                }
            />
            <Route
                path="payroll/summary"
                element={
                    <ProtectedRoute element={<PayrollSummary />} user={user} />
                }
            />
            <Route
                path="medical-records/peme-records"
                element={
                    <ProtectedRoute element={<PemeRecords />} user={user} />
                }
            />
            <Route
                path="medical-records/peme-records/peme-form/:PemeID"
                element={
                    <ProtectedRoute element={<PemeRecordsForm />} user={user} />
                }
            />
            <Route
                path="medical-records/peme-records/peme-responses/:PemeID"
                element={
                    <ProtectedRoute element={<PemeResponses />} user={user} />
                }
            />
            <Route
                path="medical-records/peme-records/peme-questionnaire-view/:PemeResponseID"
                element={
                    <ProtectedRoute
                        element={<PemeQuestionnaireView />}
                        user={user}
                    />
                }
            />

            <Route
                path="medical-records/peme-records/peme-questionnaire-preview/:PemeID"
                element={
                    <ProtectedRoute
                        element={<PemeQuestionnairePreview />}
                        user={user}
                    />
                }
            />

            <Route
                path="medical-records/group-life-masterlist-records"
                element={
                    <ProtectedRoute
                        element={<GroupLifeMasterlist />}
                        user={user}
                    />
                }
            />

            <Route
                path="medical-records/group-life-masterlist/group-life-employees/:id"
                element={
                    <ProtectedRoute
                        element={<GroupLifeEmployees />}
                        user={user}
                    />
                }
            />

            <Route
                path="medical-records/hmo-masterlist-records"
                element={
                    <ProtectedRoute element={<HMOMasterlist />} user={user} />
                }
            />
            <Route
                path="loan-management"
                element={<ProtectedRoute element={<LoanList />} user={user} />}
            />
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
