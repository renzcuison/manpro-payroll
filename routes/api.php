<?php

// New Controllers
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\EmployeesController;



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



// Other Controllers
use App\Http\Controllers\Mobile\AuthMobileController;
use App\Http\Controllers\Desktop\DesktopController;

use Illuminate\Support\Facades\Route;


Route::post('/login', [UserAuthController::class, 'login']);
Route::post('/checkUser', [UserAuthController::class, 'checkUser']);

Route::get('/sendVerifyCode/{id}', [MailController::class, 'verifyCode']);

Route::post('/signup', [UserAuthController::class, 'signup']);

Route::post('/sendForgotPasswordMail/{id}', [MailController::class, 'forgotPasswordMail']);
Route::post('/reset_password', [MemberSettingsController::class, 'resetPassword']);

//Register
Route::post('/create_employee_link', [HrEmployeesController::class, 'createEmployeeLink']);
Route::get('/sendNewEmployeeMailLink/{id}', [MailController::class, 'newEmployeeMailLink']);

//Unprotected
Route::prefix('mobile')->group(function () {
    Route::post('/verify_email', [AuthMobileController::class, 'verifyEmail']);
    Route::post('/forgot_password/send_mail/{id}', [AuthMobileController::class, 'forgotPasswordMail']);
});

Route::prefix('desktop')->group(function () {
    Route::get('/getEmployees', [DesktopController::class, 'getEmployees']);
});

Route::post('/make-call', [VoiceController::class, 'makeCall']);
Route::post('/twiml', [VoiceController::class, 'twiml'])->name('twiml');
Route::post('/handle-recording', [VoiceController::class, 'handleRecording'])->name('handleRecording');
Route::post('/call/status', [VoiceController::class, 'callStatus'])->name('call.status');
Route::get('/token', [VoiceController::class, 'getToken']);

// Protected routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    
    // ---------------------------------------------------------------- Client routes ----------------------------------------------------------------
    Route::get('/auth', [UserAuthController::class, 'index']);
    Route::post('/logout', [UserAuthController::class, 'logout']);

    Route::prefix('clients')->group(function () {
        Route::get('/getClients', [ClientsController::class, 'getClients']);
        Route::post('/saveClient', [ClientsController::class, 'saveClient']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/getRoles', [SettingsController::class, 'getRoles']);
        Route::post('/saveRole', [SettingsController::class, 'saveRole']);

        Route::get('/getStatus', [SettingsController::class, 'getStatus']);
        Route::post('/saveStatus', [SettingsController::class, 'saveStatus']);

        Route::get('/getBranches', [SettingsController::class, 'getBranches']);
        Route::post('/saveBranch', [SettingsController::class, 'saveBranch']);

        Route::get('/getDepartments', [SettingsController::class, 'getDepartments']);
        Route::post('/saveDepartment', [SettingsController::class, 'saveDepartment']);
    });

    Route::prefix('employees')->group(function () {
        Route::post('/saveEmployee', [EmployeesController::class, 'saveEmployee']);
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
    Route::get('/getWorkShift', [HrEmployeesController::class, 'getWorkShift']);
    Route::get('/getWorkshifts', [HrEmployeesController::class, 'getWorkShifts']);
    Route::post('/saveWorkShift', [HrEmployeesController::class, 'saveWorkShift']);
    Route::post('/editWorkShift', [HrEmployeesController::class, 'editWorkShift']);
    Route::post('/deleteWorkShift', [HrEmployeesController::class, 'deleteWorkShift']);
    Route::get('/getWorkShiftEmployees', [HrEmployeesController::class, 'getWorkShiftEmployees']);


    // Evaluation
    Route::post('/saveEvaluation', [EvaluationController::class, 'saveEvaluation']);
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
});
