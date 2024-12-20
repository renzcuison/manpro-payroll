<?php

use App\Http\Controllers\VoiceController;
use App\Http\Controllers\CallSchedulingController;
use App\Http\Controllers\ContactAuthController;
use App\Http\Controllers\FormsController;
use App\Http\Controllers\HrApplicationsController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\MySupportController;
use App\Http\Controllers\PortalUpdatesController;
use App\Http\Controllers\ReviewMaterialsController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\PracticeTestsController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\HrAttendanceController;
use App\Http\Controllers\HrDashboardController;
use App\Http\Controllers\HrEmployeesController;
use App\Http\Controllers\HrPayrollController;
use App\Http\Controllers\HrProfileController;
use App\Http\Controllers\HrStatusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HrPayrollSummaryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CorporateController;
use App\Http\Controllers\FinanceTransactionController;
use App\Http\Controllers\AccountingController;
use App\Http\Controllers\MemberApplicationsController;
use App\Http\Controllers\MemberAttendanceController;
use App\Http\Controllers\MemberDashboardController;
use App\Http\Controllers\MemberPayrollDetails;
use App\Http\Controllers\MemberSettingsController;
use App\Http\Controllers\CategoriesController;


use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\ReportsController;

use App\Http\Controllers\PreviousFilterController;
use App\Http\Controllers\MobileAppController;

// php artisan make:controller Mobile/AuthMobileController
use App\Http\Controllers\Mobile\AuthMobileController;
use App\Http\Controllers\Mobile\DashboardMobileController;
use App\Http\Controllers\Mobile\AttendanceMobileController;
use App\Http\Controllers\Mobile\ApplicationsMobileController;
use App\Http\Controllers\Mobile\PayrollMobileController;
use App\Http\Controllers\Mobile\HrApplicationListMobileController;
use App\Http\Controllers\Mobile\CategoryMobileController;
use App\Http\Controllers\Mobile\UserMobileController;

use App\Http\Controllers\Desktop\DesktopController;

// C:\xampp\htdocs\ManProPayroll-Intern\app\Http\Controllers\Desktop

use App\Models\HrApplications;
use App\Mail\ReferralMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;



Route::post('/login', [UserAuthController::class, 'login']);
Route::post('/checkUser', [UserAuthController::class, 'checkUser']);

Route::get('/sendVerifyCode/{id}', [MailController::class, 'verifyCode']);





Route::post('/auth/signup', [ContactAuthController::class, 'signup']);
Route::post('/auth/login', [ContactAuthController::class, 'login']);
Route::post('/signup', [UserAuthController::class, 'signup']);


Route::post('/getVerificationCode', [ContactAuthController::class, 'getVerificationCode']);
Route::post('/verifyVerificationCode', [ContactAuthController::class, 'verifyVerificationCode']);

Route::post('/verifyEmail', [ContactAuthController::class, 'verifyEmail']);
Route::post('/user/forgot-password', [ContactAuthController::class, 'forgotPasswordAction']);
Route::post('/sendForgotPasswordMail/{id}', [MailController::class, 'forgotPasswordMail']);
Route::post('/reset_password', [MemberSettingsController::class, 'resetPassword']);


// Social Login
Route::post('/social/login/facebook', [ContactAuthController::class, 'facebook']);
Route::post('/social/login/google', [ContactAuthController::class, 'google']);
Route::post('/social/login/apple', [ContactAuthController::class, 'apple']);

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

    Route::get('/user/delete', [ContactAuthController::class, 'deleteAccount']);
    Route::post('/logout', [UserAuthController::class, 'logout']);

    Route::put('/user/update-user', [ContactAuthController::class, 'updateProfile']);
    Route::get('/users/{userId}', [ContactAuthController::class, 'getUserDetailsById']);
    Route::put('/auth/push-token', [ContactAuthController::class, 'addPushToken']);
    Route::put('/user/link-facebook', [ContactAuthController::class, 'linkFacebookAccount']);
    Route::put('/user/link-google', [ContactAuthController::class, 'linkGoogleAccount']);
    Route::post('/user/image-upload', [ContactAuthController::class, 'imageUpload']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'getTotals']);
    Route::get('/dashboard/assignedTasks', [DashboardController::class, 'getAssignedTasks']);

    // News Feed Routes
    Route::get('/portalUpdates/news-feeds', [PortalUpdatesController::class, 'index']);
    Route::post('/portalUpdates/news-feeds/like-or-unlike', [PortalUpdatesController::class, 'likeUnlikeFeed']);
    Route::post('/portalUpdates/news-feeds/post-comment', [PortalUpdatesController::class, 'commentFeed']);

    // FAQS
    Route::get('portalUpdates/faqs', [PortalUpdatesController::class, 'getFAQS']);

    // Notifications
    Route::get('/user/notifications', [PortalUpdatesController::class, 'portalUpdatesNotifications']);
    Route::put('/user/notifications/mark-notifications', [PortalUpdatesController::class, 'portalUpdatesMarkNotifications']);

    // PortalUpdate Navigation
    Route::get('/navigation/{type}', [PortalUpdatesController::class, 'getPortalUpdateNavigation']);

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

    // Services Routes
    Route::get('/services', [ServicesController::class, 'index']);
    Route::get('services/requirements/{taskId}', [ServicesController::class, 'allRequirements']);
    Route::get('services/field/{spaceId}', [ServicesController::class, 'allFields']);
    Route::get('/services/finance-phase/{spaceId}', [ServicesController::class, 'financePhaseBySpaceId']);
    Route::get('/services/procedures', [ServicesController::class, 'allProcedures']);
    Route::get('/services/payment-transactions', [ServicesController::class, 'getPaymentTransaction']);
    Route::get('/services/space', [ServicesController::class, 'getSpaces']);
    Route::get('/services/list/{list_id}', [ServicesController::class, 'getListData']);                     // get Steps and its statuses data accordingly.
    Route::get('/services/status_clients/{status_id}', [ServicesController::class, 'getClientsByStatus']);  // get Steps and its statuses data accordingly.
    Route::get('/services/task/{task_id}', [ServicesController::class, 'getTaskData']);  // get Steps and its statuses data accordingly.

    // Referrals
    Route::get('/referrals', [ReferralController::class, 'getReferrals']);
    Route::get('/referrals/all', [ReferralController::class, 'index']);
    Route::get('/referrals/show/{id}', [ReferralController::class, 'show']);
    Route::get('/referrals/comments/{id}', [ReferralController::class, 'getReferralCommentsById']);
    Route::delete('/referrals/comments/{id}', [ReferralController::class, 'destroy']);
    Route::post('/referrals/add_comment', [ReferralController::class, 'add_comment']);
    Route::put('/referrals', [ReferralController::class, 'claimAmount']);

    // Manage Clients
    Route::get('/clients', [ContactController::class, 'index']);

    // Forms
    Route::get('/portalUpdates/forms', [FormsController::class, 'index']);
    Route::get('/portalUpdates/forms/{formId}', [FormsController::class, 'getFormFieldInputById']);
    Route::put('/portalUpdates/forms', [FormsController::class, 'editForm']);


    // Review Materials
    Route::get('/portalUpdates/review-material', [ReviewMaterialsController::class, 'index']);
    Route::get('/portalUpdates/review-material/{materialId}', [ReviewMaterialsController::class, 'getReviewMaterialById']);

    // Portal Updates
    Route::get('/portalUpdates/practice-test/tests', [PracticeTestsController::class, 'index']);
    Route::get('/portalUpdates/practice-test/{test_id}', [PracticeTestsController::class, 'show']);
    Route::get('/portalUpdates/practice-test/result/{test_id}', [PracticeTestsController::class, 'showResult']);
    Route::post('/portalUpdates/practice-test/submit-answer', [PracticeTestsController::class, 'submitAnswer']);
    Route::post('/portalUpdates/practice-test/update-result', [PracticeTestsController::class, 'updateResult']);
    Route::get('/portalUpdates/practice-test/correct-answer-count/{testId}', [PracticeTestsController::class, 'correctAnswerCount']);

    // Call Scheduling
    Route::get('/callScheduling/schedules', [CallSchedulingController::class, 'index']);
    Route::post('/callScheduling/schedules', [CallSchedulingController::class, 'create']);

    // Mailer routes

    Route::get('/mail', [MailController::class, 'referralConfirmationMail']);
    Route::get('/sendPayrollMail/{id}', [MailController::class, 'payrollMail']);
    Route::get('/sendNewEmployeeMail/{id}', [MailController::class, 'newEmployeeMail']);
    Route::get('/sendAnnouncementMail/{id}', [MailController::class, 'newAnnouncementMail']);

    // My Support

    Route::post('/addmysupport', [MySupportController::class, 'create']);
    Route::get('/addmysupport/{id}', [MySupportController::class, 'show']);
    Route::put('/addmysupport/{id}', [MySupportController::class, 'update']);
    Route::delete('/addmysupport/{id}', [MySupportController::class, 'delete']);
    Route::get('/mySupport', [MySupportController::class, 'getMySupport']);

    // ---------------------------------------------------------------- End Client Routes ----------------------------------------------------------------

    // ---------------------------------------------------------------- Users Routes ----------------------------------------------------------------
    Route::get('/user/{user_id}', [UserAuthController::class, 'getUserDetailsById']);
    Route::get('/services/all', [ServicesController::class, 'getServices']);
    Route::get('/services/financePhase/{phase_id}', [ServicesController::class, 'getFinancePhaseById']);
    Route::get('/services/requirementsFields/{service_id}', [ServicesController::class, 'getRequirementsBySpace']);
    Route::get('/services/requirement/{requirement_id}', [ServicesController::class, 'getRequirementById']);
    Route::get('/services/allWithLists', [ServicesController::class, 'getServicesWithLists']);
    Route::get('/services/lists/{list_id}', [ServicesController::class, 'showList']);
    Route::get('/services/lists/statuses/{list_id}', [ServicesController::class, 'showStatusesByList']);
    Route::post('/services/lists/statuses/sort', [ServicesController::class, 'sortStatuses']);
    Route::get('/services/lists/status/{list_id}', [ServicesController::class, 'showStatus']);
    Route::put('/services/lists/status/update', [ServicesController::class, 'updateStatus']);
    Route::delete('/services/lists/status/delete/{status_id}', [ServicesController::class, 'deleteStatus']);
    Route::post('/services/lists/status/add', [ServicesController::class, 'addStatus']);
    Route::get('/services/lists/tags/{list_id}', [ServicesController::class, 'showTagsByList']);
    Route::get('/services/lists/finance/{service_id}', [ServicesController::class, 'showFinanceByService']);
    Route::get('/services/{service_id}', [ServicesController::class, 'show']);
    Route::put('/services/updateServiceName', [ServicesController::class, 'updateServiceName']);
    Route::put('/services/updateListName', [ServicesController::class, 'updateListName']);
    Route::put('/services/updateRequirementName', [ServicesController::class, 'updateRequirementName']);
    Route::put('/services/updateRequirementOption', [ServicesController::class, 'updateRequirementOption']);
    Route::post('/services/requirements/sort', [ServicesController::class, 'saveSortedRequirements']);
    Route::post('/services/addNewList', [ServicesController::class, 'createList']);
    Route::post('/services/requirements/addNewRequirement', [ServicesController::class, 'addNewRequirement']);
    Route::post('/services/addNewRequirementOption', [ServicesController::class, 'createReqOption']);
    Route::delete('/services/requirement/{requirement_id}', [ServicesController::class, 'deleteRequirementField']);
    Route::delete('/services/deleteRequirementOption/{requirement_id}', [ServicesController::class, 'deleteRequirementOption']);
    Route::put('/services/finance/editName', [ServicesController::class, 'updateFinanceOptionName']);
    Route::delete('/services/finance/finance_option/{id}', [ServicesController::class, 'deleteFinanceOption']);
    Route::post('/services/finance/finance_option/add', [ServicesController::class, 'createFinanceOption']);
    Route::put('/services/finance/finance_option/update', [ServicesController::class, 'updateFinanceOption']);
    Route::put('/services/finance/sortFields', [ServicesController::class, 'sortFinanceFields']);
    Route::put('/services/finance/updateFinanceName', [ServicesController::class, 'updateFinanceName']);
    Route::post('/services/finance/add', [ServicesController::class, 'createFinancePhase']);
    Route::delete('/services/finance/{id}', [ServicesController::class, 'deleteFinancePhase']);
    Route::delete('/services/tags/{id}', [ServicesController::class, 'deleteTag']);
    Route::get('/services/tags/{id}', [ServicesController::class, 'showTag']);
    Route::put('/services/tags/update', [ServicesController::class, 'updateTag']);
    Route::post('/services/tags/add', [ServicesController::class, 'createTag']);
    Route::get('/services/steps/all', [ServicesController::class, 'stepsWithStatuses']);
    Route::post('/services/steps/add', [ServicesController::class, 'addStep']);
    Route::put('/services/steps/update', [ServicesController::class, 'updateStep']);
    Route::delete('/services/steps/delete/{step_id}', [ServicesController::class, 'deleteStep']);
    Route::get('/services/fields/{service_id}', [ServicesController::class, 'showFieldByServiceId']);
    Route::post('/services/fields/sort', [ServicesController::class, 'sortFields']);
    Route::post('/services/fields/add', [ServicesController::class, 'addField']);
    Route::put('/services/fields/update', [ServicesController::class, 'updateField']);
    Route::delete('/services/fields/{field_id}', [ServicesController::class, 'deleteField']);
    Route::get('/services/fields/options/{field_id}', [ServicesController::class, 'fetchFieldOptions']);
    Route::delete('/services/fields/options/{field_id}', [ServicesController::class, 'deleteFieldOptions']);
    Route::put('/services/fields/options/update', [ServicesController::class, 'updateOptionFieldname']);
    Route::put('/services/fields/options/updateIcon', [ServicesController::class, 'updateOptionFieldIcon']);
    Route::post('/services/fields/options/add', [ServicesController::class, 'addOptionField']);
    Route::post('/services/fields/fix', [ServicesController::class, 'migrateAssignedStatusFields']);
    Route::get('/services/fields/statuses/{list_id}', [ServicesController::class, 'fetchFieldsWithStatuses']);
    Route::delete('/services/fields/statuses/{field_id}', [ServicesController::class, 'unassignFieldToStatus']);
    Route::get('/services/fields/unassigned/{list_id}', [ServicesController::class, 'fetchUnassignedFields']);
    Route::put('/services/fields/assign', [ServicesController::class, 'assignFieldToStatus']);
    Route::get('/services/status', [ServicesController::class, 'getAllStatuses']);


    // ---------------------------------------------------------------- Accounting Routes ----------------------------------------------------------------
    Route::put('/accounting/transaction/gross', [AccountingController::class, 'addTransactionToGross']);
    Route::get('/accounting/dashboard', [AccountingController::class, 'index']);
    Route::get('/accounting/transactions', [AccountingController::class, 'transactions']);
    Route::get('/accounting/summaryTransactions', [AccountingController::class, 'summaryTransactions']);
    Route::get('/accounting/accounts', [AccountingController::class, 'getAccounts']);
    Route::get('/accounting/methods', [AccountingController::class, 'getMethods']);
    Route::put('/accounting/pay', [AccountingController::class, 'payLiability']);
    Route::get('/accounting/fetchTransactionsByClientPhase/{id}', [AccountingController::class, 'fetchTransactionsByClientPhase']);
    Route::get('/accounting/rate', [AccountingController::class, 'getRate']);


    // ---------------------------------------------------------------- Corporate Routes ----------------------------------------------------------------
    Route::get('/corporate', [CorporateController::class, 'index']);


    // ---------------------------------------------------------------- Finance Transaction Routes ----------------------------------------------------------------
    Route::post('/finance/addPayment', [FinanceTransactionController::class, 'paymentSettle']);
    Route::post('/finance/addPaymentBlast', [FinanceTransactionController::class, 'paymentSettleBlast']);
    Route::post('/finance/migrate', [FinanceTransactionController::class, 'migrateTransactionsToAccounting']);


    // ---------------------------------------------------------------- Tasks Routes ----------------------------------------------------------------
    Route::get('/tasks/duetasks', [TaskController::class, 'getAllUsersWithDueTasks']);
    Route::get('/tasks/data/{task_id}', [TaskController::class, 'show']);
    Route::get('/tasks/user/{task_id}', [TaskController::class, 'getContactByTaskId']);
    Route::get('/task/tags/{task_id}', [TaskController::class, 'getTaskTags']);
    Route::get('/task/assignedUsers/{task_id}', [TaskController::class, 'getAssignedUsersByTaskId']);
    Route::get('/tasks/note/{task_id}', [TaskController::class, 'getTaskNote']);
    Route::get('/tasks/statuses/{list}', [TaskController::class, 'getStatusesByListId']);
    Route::put('/tasks/setPriority', [TaskController::class, 'setPriority']);


    // ---------------------------------------------------------------- Previous Filters ----------------------------------------------------------------
    Route::get('/previousFilter', [PreviousFilterController::class, 'previousFilter']);
    Route::post('/addFilter', [PreviousFilterController::class, 'addFilter']);
});
