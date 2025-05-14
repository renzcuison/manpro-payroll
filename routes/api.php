<?php

// New Controllers
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\BenefitsController;
use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\TrainingsController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ApplicationsController;
use App\Http\Controllers\WorkScheduleController;
use App\Http\Controllers\AnnouncementsController;
use App\Http\Controllers\TrainingFormsController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\LoanApplicationsController;
use App\Http\Controllers\SignatoryController;
use App\Http\Controllers\RadiusPerimeterController;

// Old Controllers
use App\Http\Controllers\VoiceController;
use App\Http\Controllers\HrApplicationsController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\HrAttendanceController;
use App\Http\Controllers\HrDashboardController;
use App\Http\Controllers\HrEmployeesController;
use App\Http\Controllers\HrPayrollController;
use App\Http\Controllers\HrProfileController;
use App\Http\Controllers\HrStatusController;
use App\Http\Controllers\HrPayrollSummaryController;
use App\Http\Controllers\MemberApplicationsController;
use App\Http\Controllers\MemberAttendanceController;
use App\Http\Controllers\MemberDashboardController;
use App\Http\Controllers\MemberPayrollDetails;
use App\Http\Controllers\MemberSettingsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\PreviousFilterController;

// Desktop Controller
use App\Http\Controllers\Desktop\DesktopController;
use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [UserAuthController::class, 'login']);
Route::post('/signup', [UserAuthController::class, 'signup']);
Route::post('/checkUser', [UserAuthController::class, 'checkUser']);

Route::post('/saveRegistration', [EmployeesController::class, 'saveRegistration']);

Route::get('/sendVerifyCode/{id}', [MailController::class, 'verifyCode']);
Route::post('/sendForgotPasswordMail/{id}', [MailController::class, 'forgotPasswordMail']);
Route::post('/reset_password', [MemberSettingsController::class, 'resetPassword']);

Route::post('/saveEvaluation', [EvaluationController::class, 'saveEvaluation']);

Route::get('/employeeList', [EmployeesController::class, 'employeeList']);


// Protected routes
Route::group(['middleware' => ['auth:sanctum']], function () {

    // ---------------------------------------------------------------- Client routes ----------------------------------------------------------------
    Route::get('/auth', [UserAuthController::class, 'index']);
    Route::post('/logout', [UserAuthController::class, 'logout']);

    Route::prefix('clients')->group(function () {
        Route::get('/getClients', [ClientsController::class, 'getClients']);
        Route::post('/saveClient', [ClientsController::class, 'saveClient']);
    });

    Route::prefix('admin/documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']); // GET /admin/documents
        Route::post('/store', [DocumentController::class, 'store']);
        Route::post('/edit', [DocumentController::class, 'edit']);
        Route::delete('/{id}', [DocumentController::class, 'destroy']);
    });

    Route::prefix('perimeters')->group(function () {
        Route::get('/getRadiusPerimeters', [RadiusPerimeterController::class, 'getRadiusPerimeters']);
        Route::post('/saveRadiusPerimeter', [RadiusPerimeterController::class, 'saveRadiusPerimeter']);
        Route::get('{id}', [RadiusPerimeterController::class, 'show']);
        Route::put('{id}', [RadiusPerimeterController::class, 'update']);
        Route::delete('{id}', [RadiusPerimeterController::class, 'destroy']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/getBranches', [SettingsController::class, 'getBranches']);
        Route::post('/saveBranch', [SettingsController::class, 'saveBranch']);
        Route::post('/editBranch', [SettingsController::class, 'editBranch']);

        Route::get('/getDepartments', [SettingsController::class, 'getDepartments']);
        Route::post('/saveDepartment', [SettingsController::class, 'saveDepartment']);
        Route::post('/editDepartment', [SettingsController::class, 'editDepartment']);

        Route::get('/getJobTitles', [SettingsController::class, 'getJobTitles']);
        Route::post('/saveJobTitle', [SettingsController::class, 'saveJobTitle']);
        Route::post('/editJobTitle', [SettingsController::class, 'editJobTitle']);

        Route::get('/getRoles', [SettingsController::class, 'getRoles']);
        Route::post('/saveRole', [SettingsController::class, 'saveRole']);
        Route::post('/editRole', [SettingsController::class, 'editRole']);

        Route::post('/saveApplicationType', [SettingsController::class, 'saveApplicationType']);
        Route::post('/editApplicationType', [SettingsController::class, 'editApplicationType']);
    });

    Route::prefix('employee')->group(function () {

        Route::get('/getEmployees', [EmployeesController::class, 'getEmployees']);
        Route::post('/saveEmployee', [EmployeesController::class, 'saveEmployee']);

        Route::get('/getEmployeeLeaveCredits', [EmployeesController::class, 'getEmployeeLeaveCredits']);

        Route::get('/getMyAvatar', [EmployeesController::class, 'getMyAvatar']);
        Route::get('/getMyDetails', [EmployeesController::class, 'getMyDetails']);
        Route::post('/editMyProfile', [EmployeesController::class, 'editMyProfile']);
        Route::get('/getEmployeeDetails', [EmployeesController::class, 'getEmployeeDetails']);
        Route::get('/getEmployeeShortDetails', [EmployeesController::class, 'getEmployeeShortDetails']);
        Route::post('/editEmployeeDetails', [EmployeesController::class, 'editEmployeeDetails']);

        Route::get('/getFormLinks', [EmployeesController::class, 'getFormLinks']);
        Route::post('/saveFormLink', [EmployeesController::class, 'saveFormLink']);
        Route::post('/deleteFormLink', [EmployeesController::class, 'deleteFormLink']);
    });

    Route::prefix('allowance')->group(function () {
        Route::get('/getAllowances', [AllowanceController::class, 'getAllowances']);
        Route::post('/saveAllowance', [AllowanceController::class, 'saveAllowance']);

        Route::get('/getEmployeeAllowance', [AllowanceController::class, 'getEmployeeAllowance']);
        Route::get('/getEmployeesAllowance', [AllowanceController::class, 'getEmployeesAllowance']);
        Route::post('/saveEmployeeAllowance', [AllowanceController::class, 'saveEmployeeAllowance']);
    });

    Route::prefix('benefits')->group(function () {
        Route::get('/getBenefit', [BenefitsController::class, 'getBenefit']);
        Route::get('/getBenefits', [BenefitsController::class, 'getBenefits']);
        Route::post('/saveBenefit', [BenefitsController::class, 'saveBenefit']);

        Route::post('/addEmployeeBenefit', [BenefitsController::class, 'addEmployeeBenefit']);
        Route::get('/getEmployeeBenefits', [BenefitsController::class, 'getEmployeeBenefits']);
    });

    Route::prefix('workshedule')->group(function () {
        Route::get('/getWorkShift', [WorkScheduleController::class, 'getWorkShift']);
        Route::get('/getWorkShifts', [WorkScheduleController::class, 'getWorkShifts']);
        Route::get('/getWorkShiftLinks', [WorkScheduleController::class, 'getWorkShiftLinks']);
        Route::get('/getWorkShiftDetails', [WorkScheduleController::class, 'getWorkShiftDetails']);

        Route::post('/saveSplitWorkShift', [WorkScheduleController::class, 'saveSplitWorkShift']);
        Route::post('/saveRegularWorkShift', [WorkScheduleController::class, 'saveRegularWorkShift']);

        Route::get('/getWorkGroups', [WorkScheduleController::class, 'getWorkGroups']);
        Route::get('/getWorkGroupLinks', [WorkScheduleController::class, 'getWorkGroupLinks']);
        Route::get('/getWorkGroupDetails', [WorkScheduleController::class, 'getWorkGroupDetails']);

        Route::patch('/editWorkGroup', [WorkScheduleController::class, 'editWorkGroup']);
        Route::post('/saveWorkGroup', [WorkScheduleController::class, 'saveWorkGroup']);
        Route::post('/saveWorkGroupShift', [WorkScheduleController::class, 'saveWorkGroupShift']);

        Route::get('/getWorkHours', [WorkScheduleController::class, 'getWorkHours']);

        Route::get('/getWorkDays', [WorkScheduleController::class, 'getWorkDays']);
        Route::post('/saveWorkDay', [WorkScheduleController::class, 'saveWorkDay']);

        Route::get('/getHolidays', [WorkScheduleController::class, 'getHolidays']);
    });

    Route::prefix('attendance')->group(function () {
        Route::get('/getAttendanceLogs', [AttendanceController::class, 'getAttendanceLogs']);
        Route::get('/getAttendanceSummary', [AttendanceController::class, 'getAttendanceSummary']);
        Route::get('/getAttendanceOvertime', [AttendanceController::class, 'getAttendanceOvertime']);
        Route::get('/getEmployeeAttendanceLogs', [AttendanceController::class, 'getEmployeeAttendanceLogs']);
        Route::get('/getEmployeeAttendanceSummary', [AttendanceController::class, 'getEmployeeAttendanceSummary']);
        Route::get('/getEmployeeDashboardAttendance', [AttendanceController::class, 'getEmployeeDashboardAttendance']);

        Route::get('/getEmployeeLatestAttendance', [AttendanceController::class, 'getEmployeeLatestAttendance']);
        Route::get('/getEmployeeWorkDayAttendance', [AttendanceController::class, 'getEmployeeWorkDayAttendance']);

        Route::post('/saveEmployeeAttendance', [AttendanceController::class, 'saveEmployeeAttendance']);
        Route::post('/saveMobileEmployeeAttendance', [AttendanceController::class, 'saveMobileEmployeeAttendance']);

        Route::get('/getAttendanceAdderLogs', [AttendanceController::class, 'getAttendanceAdderLogs']);
        Route::post('/recordEmployeeAttendance', [AttendanceController::class, 'recordEmployeeAttendance']);
        Route::post('/addAttendanceLog', [AttendanceController::class, 'addAttendanceLog']);
        Route::post('/editEmployeeAttendance', [AttendanceController::class, 'editEmployeeAttendance']);
        Route::post('/deleteEmployeeAttendance', [AttendanceController::class, 'deleteEmployeeAttendance']);
    });

    Route::prefix('payroll')->group(function () {
        Route::get('/payrollDetails', [PayrollController::class, 'payrollDetails']);
        Route::get('/payrollProcess', [PayrollController::class, 'payrollProcess']);

        Route::get('/getPayrollRecord', [PayrollController::class, 'getPayrollRecord']);
        Route::get('/getPayrollSummary', [PayrollController::class, 'getPayrollSummary']);
        Route::get('/getEmployeePayrollRecords', [PayrollController::class, 'getEmployeePayrollRecords']);
        Route::get('/getEmployeesPayrollRecords', [PayrollController::class, 'getEmployeesPayrollRecords']);

        Route::post('/savePayroll', [PayrollController::class, 'savePayroll']);
        Route::post('/savePayrolls', [PayrollController::class, 'savePayrolls']);

        Route::post('/storeSignature/{id}', [PayrollController::class, 'storeSignature']);

        Route::post('/deletePayslip', [PayrollController::class, 'deletePayslip']);
    });

    Route::prefix('loans')->group(function () {
        Route::get('/getLoanApplications', [LoanApplicationsController::class, 'getLoanApplications']);
        Route::post('/saveLoanApplication', [LoanApplicationsController::class, 'saveLoanApplication']);
        Route::post('/cancelLoanApplication/{id}', [LoanApplicationsController::class, 'cancelLoanApplication']);
        Route::post('/editLoanApplication', [LoanApplicationsController::class, 'editLoanApplication']);
        Route::get('/getLoanApplicationFiles/{id}', [LoanApplicationsController::class, 'getLoanApplicationFiles']);
        Route::get('/downloadFile/{id}', [LoanApplicationsController::class, 'downloadFile']);

        Route::get('/getLoanDetails/{id}', [LoanApplicationsController::class, 'getLoanDetails']);
        Route::get('/getAllLoanApplications', [LoanApplicationsController::class, 'getAllLoanApplications']);

        Route::post('/updateLoanStatus/{id}', [LoanApplicationsController::class, 'updateLoanStatus']);
        Route::post('/createProposal/{id}', [LoanApplicationsController::class, 'createProposal']);
        Route::post('/respondToProposal/{id}', [LoanApplicationsController::class, 'respondToProposal']);
        Route::get('/getLoanProposal/{id}', [LoanApplicationsController::class, 'getLoanProposal']);

        Route::get('/getCurrentLoans/{employeeId}', [LoanApplicationsController::class, 'getCurrentLoans']);
    });

    Route::prefix('applications')->group(function () {
        // Application, Type Lists
        Route::get('/getApplications', [ApplicationsController::class, 'getApplications']);
        Route::get('/getApplicationTypes', [ApplicationsController::class, 'getApplicationTypes']);
        Route::post('/editApplicationType', [ApplicationsController::class, 'editApplicationType']);
        Route::get('/getMyApplications', [ApplicationsController::class, 'getMyApplications']);
        Route::get('/getDashboardApplications', [ApplicationsController::class, 'getDashboardApplications']);

        // Details
        Route::get('/getApplicationDetails/{id}', [ApplicationsController::class, 'getApplicationDetails']);

        // Restrictions
        Route::get('/getFullLeaveDays', [ApplicationsController::class, 'getFullLeaveDays']);
        Route::get('/getNagerHolidays', [ApplicationsController::class, 'getNagerHolidays']);
        Route::get('/getTenureship', [ApplicationsController::class, 'getTenureship']);

        // Files
        Route::get('/downloadFile/{id}', [ApplicationsController::class, 'downloadFile']);
        Route::get('/getApplicationFiles/{id}', [ApplicationsController::class, 'getApplicationFiles']);

        // Submission, Management
        Route::post('/saveApplication', [ApplicationsController::class, 'saveApplication']);
        Route::post('/editApplication', [ApplicationsController::class, 'editApplication']);
        Route::get('/cancelApplication/{id}', [ApplicationsController::class, 'cancelApplication']);
        Route::post('/manageApplication', [ApplicationsController::class, 'manageApplication']);

        // Leave Credits
        Route::get('/getMyLeaveCredits', [ApplicationsController::class, 'getMyLeaveCredits']);
        Route::get('/getLeaveCredits/{user_name}', [ApplicationsController::class, 'getLeaveCredits']);
        Route::get('/getLeaveCreditLogs/{user_name}', [ApplicationsController::class, 'getLeaveCreditLogs']);

        Route::post('/saveLeaveCredits', [ApplicationsController::class, 'saveLeaveCredits']);
        Route::post('/editLeaveCredits', [ApplicationsController::class, 'editLeaveCredits']);
        Route::post('/deleteLeaveCredits', [ApplicationsController::class, 'deleteLeaveCredits']);


        // Overtime Applications
        Route::post('/saveOvertimeApplication', [ApplicationsController::class, 'saveOvertimeApplication']);

        Route::get('/getOvertimeApplications', [ApplicationsController::class, 'getOvertimeApplications']);
        Route::post('/manageOvertimeApplication', [ApplicationsController::class, 'manageOvertimeApplication']);
    });

    Route::prefix('announcements')->group(function () {
        // Announcement Lists
        Route::get('/getAnnouncements', [AnnouncementsController::class, 'getAnnouncements']);
        Route::get('/getEmployeeAnnouncements', [AnnouncementsController::class, 'getEmployeeAnnouncements']);

        // Management
        Route::post('/saveAnnouncement', [AnnouncementsController::class, 'saveAnnouncement']);
        Route::post('/editAnnouncement', [AnnouncementsController::class, 'editAnnouncement']);
        Route::post('/publishAnnouncement', [AnnouncementsController::class, 'publishAnnouncement']);
        Route::post('/toggleHide/{code}', [AnnouncementsController::class, 'toggleHide']);

        // Details
        Route::get('/getAnnouncementDetails/{code}', [AnnouncementsController::class, 'getAnnouncementDetails']);
        Route::get('/getEmployeeAnnouncementDetails/{code}', [AnnouncementsController::class, 'getEmployeeAnnouncementDetails']);
        Route::get('/getAnnouncementBranchDepts/{code}', [AnnouncementsController::class, 'getAnnouncementBranchDepts']);

        // Files
        Route::get('/downloadFile/{id}', [AnnouncementsController::class, 'downloadFile']);
        Route::get('/getThumbnail/{code}', [AnnouncementsController::class, 'getThumbnail']);
        Route::get('/getPageThumbnails', [AnnouncementsController::class, 'getPageThumbnails']);
        Route::get('/getAnnouncementFiles/{code}', [AnnouncementsController::class, 'getAnnouncementFiles']);
        Route::get('/getEmployeeAnnouncementFiles/{code}', [AnnouncementsController::class, 'getEmployeeAnnouncementFiles']);

        // Acknowledgements
        Route::post('/acknowledgeAnnouncement', [AnnouncementsController::class, 'acknowledgeAnnouncement']);
        Route::get('/getAcknowledgements/{code}', [AnnouncementsController::class, 'getAcknowledgements']);
    });

    Route::prefix('adminDashboard')->group(function () {
        Route::get('/getDashboardData', [AdminDashboardController::class, 'getDashboardData']);
        Route::get('/getAttendanceToday', [AdminDashboardController::class, 'getAttendanceToday']);
        Route::post('/getEmployeeAvatars', [AdminDashboardController::class, 'getEmployeeAvatars']);
    });

    Route::prefix('trainings')->group(function () {
        // Trainings, Training Content
        Route::get('/getTrainings', [TrainingsController::class, 'getTrainings']);
        Route::get('/getTrainingDetails/{code}', [TrainingsController::class, 'getTrainingDetails']);
        Route::get('/getTrainingContent/{code}', [TrainingsController::class, 'getTrainingContent']);
        Route::get('/getContentDetails/{id}', [TrainingsController::class, 'getContentDetails']);

        Route::get('/getEmployeeTrainings', [TrainingsController::class, 'getEmployeeTrainings']);
        Route::get('/getEmployeeTrainingDetails/{code}', [TrainingsController::class, 'getEmployeeTrainingDetails']);
        Route::get('/getEmployeeTrainingContent/{code}', [TrainingsController::class, 'getEmployeeTrainingContent']);
        Route::get('/getEmployeeContentDetails/{id}', [TrainingsController::class, 'getEmployeeContentDetails']);

        // Files
        Route::get('/getSource/{id}', [TrainingsController::class, 'getSource']);
        Route::get('/getPageCovers', [TrainingsController::class, 'getPageCovers']);

        // Management
        Route::post('/saveTraining', [TrainingsController::class, 'saveTraining']);
        Route::post('/editTraining', [TrainingsController::class, 'editTraining']);
        Route::post('/updateTrainingStatus', [TrainingsController::class, 'updateTrainingStatus']);

        Route::post('/saveContent', [TrainingsController::class, 'saveContent']);
        Route::post('/editContent', [TrainingsController::class, 'editContent']);
        Route::post('/removeContent', [TrainingsController::class, 'removeContent']);
        Route::post('/saveContentSettings', [TrainingsController::class, 'saveContentSettings']);

        // Views
        Route::get('/getTrainingViews/{id}', [TrainingsController::class, 'getTrainingViews']);
        Route::post('/handleTrainingViews', [TrainingsController::class, 'handleTrainingViews']);

        // Training Forms
        Route::get('/getFormItems/{id}', [TrainingFormsController::class, 'getFormItems']);
        Route::post('/saveFormItem', [TrainingFormsController::class, 'saveFormItem']);
        Route::post('/editFormItem', [TrainingFormsController::class, 'editFormItem']);
        Route::post('/removeFormItem', [TrainingFormsController::class, 'removeFormItem']);
        Route::post('/saveFormItemSettings', [TrainingFormsController::class, 'saveFormItemSettings']);

        Route::get('/getFormAnalytics/{id}', [TrainingFormsController::class, 'getFormAnalytics']);

        Route::get('/getEmployeeFormDetails/{id}', [TrainingFormsController::class, 'getEmployeeFormDetails']);
        Route::get('/getEmployeeFormReviewer', [TrainingFormsController::class, 'getEmployeeFormReviewer']);
        Route::post('/saveEmployeeFormSubmission', [TrainingFormsController::class, 'saveEmployeeFormSubmission']);
    });


















    // Hr employees
    Route::get('/employeesHistory/{id}/{dates}', [HrEmployeesController::class, 'getEmployeeHistory']);
    Route::get('/additional_benefits_brackets', [HrEmployeesController::class, 'getAdditionalBenefitsBrackets']);
    Route::get('/search-employees/{id}', [HrEmployeesController::class, 'searchEmployees']);
    Route::get('/get_events', [HrEmployeesController::class, 'getCalendarEvents']);
    Route::put('/edit-employees/{id}', [HrEmployeesController::class, 'editEmployee']);
    Route::post('/delete-employees', [HrEmployeesController::class, 'deleteEmployee']);
    Route::post('/add-employees', [HrEmployeesController::class, 'addEmployee']);
    Route::post('/add_event', [HrEmployeesController::class, 'addCalendarEvent']);
    Route::post('/delete_events', [HrEmployeesController::class, 'deleteCalendarEvent']);
    Route::post('/add_additional_benefits', [HrEmployeesController::class, 'AddAdditionalbenefits']);
    Route::post('/delete_additional_benefits', [HrEmployeesController::class, 'deleteAdditionalbenefits']);
    Route::post('/delete_employee_loan', [HrEmployeesController::class, 'deleteEmployeeLoan']);
    Route::post('/create_employee', [HrEmployeesController::class, 'createEmployee']);
    Route::get('/getEmployeePayroll-reports/{id}/{dates}', [HrEmployeesController::class, 'getEmployeePayrollReports']);

    // Super
    Route::get('/adminEmployees', [HrEmployeesController::class, 'getAdminEmployee']);
    Route::get('/employees/{id}', [HrEmployeesController::class, 'getEmployee']);
    Route::get('/additional_benefits/{type}/{id}', [HrEmployeesController::class, 'getAdditionalBenefits']);
    Route::get('/get_events/{id}/{shiftId}', [HrEmployeesController::class, 'getCalendarEvents']);
    Route::get('/applications/{id}', [HrApplicationsController::class, 'getApplications']);
    Route::get('/applications_list/{id}', [HrApplicationsController::class, 'getApplicationsList']);
    Route::get('/salary-increase/{id}/{dates}', [HrEmployeesController::class, 'getSalaryIncrease']);
    Route::post('/get-attendance/{id}', [HrAttendanceController::class, 'getAllAttendance']);
    Route::get('/getPayrollRecord/{id}/{dates}', [HrPayrollController::class, 'getPayrollRecord']);
    Route::get('/employeesBenefit/{id}', [HrEmployeesController::class, 'getEmployeeBenefit']);
    Route::get('/getEmployeePayroll/{id}', [HrEmployeesController::class, 'getEmployeePayroll']);

    // New API for Employees
    Route::get('/getEmployees', [HrEmployeesController::class, 'getEmployees']);

    // Work Shift
    // Route::get('/getWorkShift', [HrEmployeesController::class, 'getWorkShift']);
    // Route::get('/getWorkshifts', [HrEmployeesController::class, 'getWorkShifts']);
    // Route::post('/saveWorkShift', [HrEmployeesController::class, 'saveWorkShift']);
    // Route::post('/editWorkShift', [HrEmployeesController::class, 'editWorkShift']);
    // Route::post('/deleteWorkShift', [HrEmployeesController::class, 'deleteWorkShift']);
    // Route::get('/getWorkShiftEmployees', [HrEmployeesController::class, 'getWorkShiftEmployees']);


    // Evaluation
    // Route::post('/saveEvaluation', [EvaluationController::class, 'saveEvaluation']);
    Route::post('/editEvaluation', [EvaluationController::class, 'editEvaluation']);
    Route::get('/getEvaluation', [EvaluationController::class, 'getEvaluation']);
    Route::get('/getEvaluations', [EvaluationController::class, 'getEvaluations']);
    Route::post('/saveAcknowledgement', [EvaluationController::class, 'saveAcknowledgement']);

    Route::post('/saveCategory', [EvaluationController::class, 'saveCategory']);
    Route::get('/getCategories', [EvaluationController::class, 'getCategories']);

    Route::post('/saveRating', [EvaluationController::class, 'saveRating']);
    Route::post('/editRating', [EvaluationController::class, 'editRating']);
    Route::get('/getRatings', [EvaluationController::class, 'getRatings']);
    Route::get('/getRating', [EvaluationController::class, 'getRating']);

    Route::post('/saveIndicator', [EvaluationController::class, 'saveIndicator']);
    Route::post('/editIndicator', [EvaluationController::class, 'editIndicator']);

    Route::post('/saveEvaluationForm', [EvaluationController::class, 'saveEvaluationForm']);
    Route::get('/getEvaluationAllForms', [EvaluationController::class, 'getEvaluationAllForms']);
    Route::get('/getEvaluationForms', [EvaluationController::class, 'getEvaluationForms']);
    Route::get('/getEvaluationForm', [EvaluationController::class, 'getEvaluationForm']);

    Route::post('/saveEvaluationResponse', [EvaluationController::class, 'saveEvaluationResponse']);
    Route::get('/getEvaluationResponse', [EvaluationController::class, 'getEvaluationResponse']);

    Route::get('/getEmployeeEvaluations', [EvaluationController::class, 'getEmployeeEvaluations']);
    Route::get('/getCategoryResponse', [EvaluationController::class, 'getCategoryResponse']);
    Route::post('/approveEvaluation', [EvaluationController::class, 'approveEvaluation']);


    // Reports
    Route::get('/getReport', [ReportsController::class, 'getReport']);
    Route::get('/getReports', [ReportsController::class, 'getReports']);

    Route::post('/saveReport', [ReportsController::class, 'saveReport']);
    Route::post('/editReport', [ReportsController::class, 'editReport']);

    Route::get('/getReportTypes', [ReportsController::class, 'getReportTypes']);
    Route::post('/saveReportType', [ReportsController::class, 'saveReportType']);
    Route::post('/saveReportViewer', [ReportsController::class, 'saveReportViewer']);


    // Member Attendance
    Route::get('/get_attendance', [MemberAttendanceController::class, 'getCalendarAttendance']);
    Route::post('/add_timein', [MemberAttendanceController::class, 'AddTimeinAttendance']);
    Route::post('/add_timeout', [MemberAttendanceController::class, 'AddTimeoutAttendance']);
    Route::post('/add_timeinAfternoon', [MemberAttendanceController::class, 'AddTimeinAfternoon']);
    Route::post('/add_timeoutAfternoon', [MemberAttendanceController::class, 'AddTimeoutAfternoon']);
    Route::get('/get_time', [MemberAttendanceController::class, 'setgetTimeAttendance']);

    // New Attendance End Points
    Route::get('/getEmployeeWorkShift', [MemberAttendanceController::class, 'getEmployeeWorkShift']);
    Route::get('/getEmployeeAttendance', [MemberAttendanceController::class, 'getEmployeeAttendance']);

    // Member Applications
    Route::get('/member_applications_list', [MemberApplicationsController::class, 'getMemberApplicationsList']);
    Route::post('/submit_application', [MemberApplicationsController::class, 'submitApplication']);
    Route::get('/member_applications', [MemberApplicationsController::class, 'getMemberApplications']);

    // Member Payroll Details
    Route::get('/member_payroll_record', [MemberPayrollDetails::class, 'getMemberPayrollRecord']);
    Route::post('/signature', [MemberPayrollDetails::class, 'updateSignature']);

    // Member Personal Details
    Route::post('/update_profile', [MemberSettingsController::class, 'updateProfile']);
    Route::get('/get_user', [MemberSettingsController::class, 'getUserData']);
    Route::post('/picture', [MemberSettingsController::class, 'updatePicture']);

    // Member Change Password
    Route::post('/change_password', [MemberSettingsController::class, 'changePassword']);

    // Member Dashboard
    Route::get('/dashboard_recentMemberAttendance', [MemberDashboardController::class, 'getMemberAttendances']);
    Route::get('/dashboard_recentMemberApplication', [MemberDashboardController::class, 'getMemberApplications']);

    // Hr Benefits
    Route::get('/benefits', [HrEmployeesController::class, 'getBenefits']);
    Route::post('/add_benefits', [HrEmployeesController::class, 'addBenefits']);
    Route::post('/delete_benefits', [HrEmployeesController::class, 'deletebenefits']);

    // Hr Loans
    Route::get('/loans', [HrEmployeesController::class, 'getLoans']);
    Route::post('/add_loans', [HrEmployeesController::class, 'addLoans']);
    Route::post('/delete_loans', [HrEmployeesController::class, 'deleteLoans']);

    // Hr Contribution
    Route::get('/contribution', [HrEmployeesController::class, 'getContribution']);
    Route::post('/add_contribution', [HrEmployeesController::class, 'addContribution']);
    Route::post('/delete_contribution', [HrEmployeesController::class, 'deleteContribution']);

    // Hr status
    Route::get('/status', [HrStatusController::class, 'getStatus']);
    Route::get('/branch', [HrStatusController::class, 'getBranch']);
    Route::get('/bank', [HrStatusController::class, 'getBank']);
    Route::get('/getWorkShifts', [HrStatusController::class, 'getWorkShifts']);
    Route::post('/add-status', [HrStatusController::class, 'addStatus']);;
    Route::post('/add-branch', [HrStatusController::class, 'addBranch']);
    Route::post('/add-bank', [HrStatusController::class, 'addBank']);
    Route::put('/delete-status/{id}', [HrStatusController::class, 'deleteStatus']);
    Route::put('/delete-branch/{id}', [HrStatusController::class, 'deleteBranch']);
    Route::put('/delete-bank/{id}', [HrStatusController::class, 'deleteBank']);
    Route::post('/add-workdays', [HrStatusController::class, 'addWorkDays']);

    // Hr Dashboard
    Route::get('/dashboard_employees/{dateToday}', [HrDashboardController::class, 'getEmployees']);
    Route::get('/dashboard_recentAttendance/{dateToday}', [HrDashboardController::class, 'getAttendances']);
    Route::get('/dashboard_recentApplication/{dateToday}', [HrDashboardController::class, 'getApplications']);
    Route::get('/dashboard_Analytics/{date}', [HrDashboardController::class, 'getAnalytics']);

    // Hr attendance
    Route::get('/attendance', [HrAttendanceController::class, 'getAttendance']);
    Route::get('/getModalAttendanceView/{userData}', [HrAttendanceController::class, 'getModalAttendanceView']);
    Route::post('/add-attendance', [HrAttendanceController::class, 'addAttendance']);
    Route::post('/get-attendance', [HrAttendanceController::class, 'getAllAttendance']);
    Route::post('/get-today-present', [HrAttendanceController::class, 'getTodayPresent']);
    Route::post('/get-today-absent', [HrAttendanceController::class, 'getTodayAbsent']);
    Route::post('/get-today-leave', [HrAttendanceController::class, 'getTodayLeave']);
    Route::post('/updateHrAttendance', [HrAttendanceController::class, 'updateHrAttendance']);
    Route::post('/updateHrWorkhours', [HrAttendanceController::class, 'updateHrWorkhours']);
    Route::post('/getWorkday', [HrAttendanceController::class, 'getWorkdayID']);
    Route::post('/getWorkdayFuture', [HrAttendanceController::class, 'getWorkdayIDFuture']);
    Route::post('/deleteAttendanceView', [HrAttendanceController::class, 'deleteAttendanceView']);
    Route::get('/attendance-shift', [HrAttendanceController::class, 'getAttendanceShift']);

    // Endpoints Used In Edit Attendance Modal
    Route::get('/getAttendance', [HrAttendanceController::class, 'getAttendance']);
    Route::post('/updateAttendance', [HrAttendanceController::class, 'updateAttendance']);
    Route::post('/deleteAttendance', [HrAttendanceController::class, 'deleteAttendance']);
    Route::post('/addEmployeeAttendance', [HrAttendanceController::class, 'addEmployeeAttendance']);

    Route::get('/getUserSchedule', [HrAttendanceController::class, 'getUserSchedule']);


    // Hr applications
    Route::get('/applications', [HrApplicationsController::class, 'getApplications']);
    Route::get('/applications-reports/{id}/{dates}', [HrApplicationsController::class, 'getApplicationsReports']);
    Route::post('/delete_applications', [HrApplicationsController::class, 'deleteApplications']);
    Route::get('/get_appplication_status', [HrApplicationsController::class, 'getApplicationStatus']);
    Route::post('/add-application-status', [HrApplicationsController::class, 'addApplicationStatus']);
    Route::post('/update-application', [HrApplicationsController::class, 'addApplication']);
    Route::put('/delete-application-status/{id}', [HrApplicationsController::class, 'deleteAppStatus']);
    Route::post('/add-applications-list', [HrApplicationsController::class, 'addAppList']);
    Route::get('/applications_list', [HrApplicationsController::class, 'getApplicationsList']);
    Route::post('/add_type_application', [HrApplicationsController::class, 'addNewType']);
    Route::post('/delete_type_application', [HrApplicationsController::class, 'deleteApplicationList']);
    Route::put('/edit-leave/{id}', [HrApplicationsController::class, 'editLeave']);
    Route::get('/applications_leave/{dates}', [HrApplicationsController::class, 'getApplicationsLeave']);

    // Hr payroll
    Route::post('/payroll_benefits', [HrPayrollController::class, 'getPayrollBenefits']);
    Route::post('/payroll_remainingLoan/{id}', [HrPayrollController::class, 'getPayrollRemainingLoan']);
    Route::get('/payroll/{dates}', [HrPayrollController::class, 'getPayroll']);
    Route::get('/payroll/unextended/{dates}', [HrPayrollController::class, 'getUnextendedPayroll']);
    Route::get('/payroll/extended/{dates}', [HrPayrollController::class, 'getExtendedPayroll']);
    Route::get('/getPayrollRecord/{dates}', [HrPayrollController::class, 'getPayrollRecord']);
    Route::get('/getPayrollSummary/{dates}', [HrPayrollSummaryController::class, 'getPayrollSummary']);
    Route::get('/getPayrollSummaryHistory/{id}/{dates}', [HrPayrollSummaryController::class, 'getPayrollSummaryHistory']);
    Route::get('/payrollRecordBenefits/{id}', [HrPayrollController::class, 'getPayrollRecordBenefits']);
    Route::post('/payrollRecordEarnings', [HrPayrollController::class, 'getPayrollRecordEarnings']);
    Route::post('/add_payroll_summary_employee', [HrPayrollSummaryController::class, 'addPayrollSummaryEmployee']);
    Route::post('/delete_payroll_summary_employee', [HrPayrollSummaryController::class, 'deletePayrollSummaryEmployee']);
    Route::post('/save_payroll', [HrPayrollController::class, 'savePayroll']);
    Route::post('/update_payrollBenefits', [HrPayrollController::class, 'updateManualBenefits']);
    Route::post('/delete_payrollBenefits', [HrPayrollController::class, 'deleteManualBenefits']);
    Route::put('/update_payroll/{id}', [HrPayrollController::class, 'updatePayroll']);
    Route::put('/update_payrollVisibility/{id}', [HrPayrollController::class, 'updatepayrollVisibility']);
    Route::put('/update_payrollHide/{id}', [HrPayrollController::class, 'updatepayrollHide']);
    Route::put('/update_payrollDelete/{id}', [HrPayrollController::class, 'updatepayrollDelete']);

    // Hr Profile
    Route::get('/profile/userData/{id}', [HrProfileController::class, 'getUserData']);
    Route::get('/payrollHistory/{id}', [HrProfileController::class, 'getPayrollHistory']);
    Route::get('/loanDetails/{id}', [HrProfileController::class, 'getLoanData']);

    // Category
    Route::post('/add_category', [CategoriesController::class, 'addCategory']);
    Route::post('/edit_category', [CategoriesController::class, 'editCategory']);
    Route::post('/delete_category', [CategoriesController::class, 'deleteCategory']);
    Route::post('/add_viewers', [CategoriesController::class, 'addViewers']);
    Route::post('/add_answers', [CategoriesController::class, 'addAnswers']);
    Route::post('/add_answer_key', [CategoriesController::class, 'addAnswerKey']);
    Route::get('/getCategory/{category_id}', [CategoriesController::class, 'getCategory']);
    Route::get('/announcements_list', [CategoriesController::class, 'announcementsList']);
    Route::get('/trainings_list', [CategoriesController::class, 'trainingsList']);
    Route::get('/questions_list', [CategoriesController::class, 'questionsList']);
    Route::get('/evaluation_list', [CategoriesController::class, 'evaluationList']);
    Route::get('/member_evaluation_list', [CategoriesController::class, 'memberEvaluationList']);
    // Route::get('/reports_list', [CategoriesController::class, 'reportsList']);
    Route::get('/member_reports_list', [CategoriesController::class, 'memberReportsList']);
    Route::get('/read_by_list', [CategoriesController::class, 'readByList']);
    Route::get('/take_by_list', [CategoriesController::class, 'takeByList']);
    Route::get('/cover', [CategoriesController::class, 'getCover']);
    Route::post('/add-performance', [CategoriesController::class, 'addPerformance']);
    Route::post('/edit-performance', [CategoriesController::class, 'editPerformance']);
    Route::get('/performance', [CategoriesController::class, 'getPerformance']);
    Route::put('/delete-performance/{id}', [CategoriesController::class, 'deletePerformance']);
    Route::post('/add_evaluation', [CategoriesController::class, 'addEvaluation']);
    Route::get('/incidents', [CategoriesController::class, 'getIncident']);
    Route::post('/add_incident', [CategoriesController::class, 'addIncident']);


    // Mailer routes
    Route::get('/mail', [MailController::class, 'referralConfirmationMail']);
    Route::get('/sendPayrollMail/{id}', [MailController::class, 'payrollMail']);
    Route::get('/sendNewEmployeeMail/{id}', [MailController::class, 'newEmployeeMail']);
    Route::get('/sendAnnouncementMail/{id}', [MailController::class, 'newAnnouncementMail']);


    // ---------------------------------------------------------------- End Client Routes ----------------------------------------------------------------

    // ---------------------------------------------------------------- Users Routes ----------------------------------------------------------------
    Route::get('/user/{user_id}', [UserAuthController::class, 'getUserDetailsById']);

    // ---------------------------------------------------------------- Previous Filters ----------------------------------------------------------------
    Route::get('/previousFilter', [PreviousFilterController::class, 'previousFilter']);
    Route::post('/addFilter', [PreviousFilterController::class, 'addFilter']);

    Route::get('/signatories', [SignatoryController::class, 'index']);
    Route::post('/addSignatory', [SignatoryController::class, 'store']);
});



//Register
Route::post('/create_employee_link', [HrEmployeesController::class, 'createEmployeeLink']);
Route::get('/sendNewEmployeeMailLink/{id}', [MailController::class, 'newEmployeeMailLink']);

Route::prefix('desktop')->group(function () {
    Route::get('/getEmployees', [DesktopController::class, 'getEmployees']);
});

Route::post('/make-call', [VoiceController::class, 'makeCall']);
Route::post('/twiml', [VoiceController::class, 'twiml'])->name('twiml');
Route::post('/handle-recording', [VoiceController::class, 'handleRecording'])->name('handleRecording');
Route::post('/call/status', [VoiceController::class, 'callStatus'])->name('call.status');
Route::get('/token', [VoiceController::class, 'getToken']);




require __DIR__ . '/super-admin.php';