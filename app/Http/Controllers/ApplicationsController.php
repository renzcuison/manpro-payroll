<?php

namespace App\Http\Controllers;

use App\Models\ApplicationsModel;
use App\Models\ApplicationsOvertimeModel;
use App\Models\ApplicationTypesModel;
use App\Models\AttendanceLogsModel;
use App\Models\LeaveCreditsModel;
use App\Models\LogsLeaveCreditsModel;
use App\Models\UsersModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

use Carbon\Carbon;

class ApplicationsController extends Controller
{
    public function checkUser()
    {
        // Log::info("ApplicationsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    // Application Lists
    public function getApplications()
    {
        //Log::info("ApplicationsController::getApplications");

        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $apps = ApplicationsModel::where('client_id', $clientId)->orderBy('created_at', 'desc')->get();

            $applications = [];

            foreach ($apps as $app) {
                $employee = $app->user;
                $type = $app->type;

                $applications[] = [
                    'app_id' => $app->id,
                    'app_type_id' => $type->id,
                    'app_type_name' => $type->name,
                    'app_duration_start' => $app->duration_start,
                    'app_duration_end' => $app->duration_end,
                    'app_date_requested' => $app->created_at,
                    'app_status' => $app->status,
                    'emp_user_name' => $employee->user_name,
                    'emp_first_name' => $employee->first_name,
                    'emp_middle_name' => $employee->middle_name,
                    'emp_last_name' => $employee->last_name,
                    'emp_suffix' => $employee->suffix,
                ];
            }

            return response()->json(['status' => 200, 'applications' => $applications]);
        } else {
            return response()->json(['status' => 200, 'applications' => null]);
        }
    }

    public function getMyApplications()
    {
        //Log::info("ApplicationsController::getMyApplications");

        $user = Auth::user();
        $clientId = $user->client_id;

        $applications = ApplicationsModel::where('client_id', $clientId)
            ->where('user_id', $user->id)
            ->get();

        return response()->json(['status' => 200, 'applications' => $applications]);
    }

    public function getDashboardApplications()
    {
        //Log::info("ApplicationsController::getDashboardApplications");

        $user = Auth::user();

        $clientId = $user->client_id;
        $apps = ApplicationsModel::where('user_id', $user->id)
            ->take(10)
            ->get();

        $applications = [];

        foreach ($apps as $app) {
            $employee = $app->user;
            $type = $app->type;

            $applications[] = [
                'app_id' => $app->id,
                'app_type' => $type->name,
                'app_status' => $app->status,
            ];
        }

        return response()->json(['status' => 200, 'applications' => $applications]);
    }

    // Details
    public function getApplicationDetails($id)
    {
        //Log::info("ApplicationsController::getApplicationDetails");
        //Log::info($id);

        $user = Auth::user();

        $app = ApplicationsModel::with(['user', 'type', 'branch', 'department', 'jobTitle'])->find($id);

        if ($this->checkUser() && ($user->client_id == $app->client_id)) {
            $appUser = $app->user;
            $appType = $app->type;
            $branch = $app->branch;
            $department = $app->department;
            $job_title = $app->jobTitle;

            $app->type_id = $appType->id;
            $app->type_name = $appType->name;
            $app->emp_user_name = $appUser->user_name;
            $app->emp_first_name = $appUser->first_name;
            $app->emp_middle_name = $appUser->middle_name ?? '';
            $app->emp_last_name = $appUser->last_name ?? '';
            $app->emp_suffix = $appUser->suffix ?? '';
            $app->emp_branch = $branch->name ?? '';
            $app->emp_department = $department->name ?? '';
            $app->emp_job_title = $job_title->name ?? '';
            if ($appUser->profile_pic && Storage::disk('public')->exists($appUser->profile_pic)) {
                $app->avatar = base64_encode(Storage::disk('public')->get($appUser->profile_pic));
                $app->avatar_mime = mime_content_type(storage_path('app/public/' . $appUser->profile_pic));
            } else {
                $app->avatar = null;
                $app->avatar_mime = null;
            }

            $filenames = [];
            $mediaItems = $app->getMedia('*');

            foreach ($mediaItems as $media) {
                $filenames[] = [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                ];
            }

            unset(
                $app->user,
                $app->client_id,
                $app->user_id,
                $app->media,
                $app->type,
                $app->department,
                $app->branch,
                $app->jobTitle
            );
            return response()->json(['status' => 200, 'application' => $app, 'files' => $filenames ?: null]);
        } else {
            return response()->json(['status' => 200, 'application' => null, 'files' => null]);
        }
    }

    // Application Types
    public function getApplicationTypes()
    {
        //Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;

        $types = ApplicationTypesModel::where('client_id', $clientId)->where('deleted_at', NULL)->get();

        return response()->json(['status' => 200, 'types' => $types]);
    }

    public function editApplicationType(Request $request)
    {
        // Log::info("ApplicationsController::editApplicationType");

        try {
            DB::beginTransaction();

            $applicationType = ApplicationTypesModel::find($request->applicationType);

            $applicationType->name = $request->name;
            $applicationType->is_paid_leave = $request->paidLeave;
            $applicationType->percentage = $request->percentage;
            $applicationType->require_files = $request->requireFiles;
            $applicationType->tenureship_required = $request->tenureship;
            $applicationType->save();

            DB::commit();
            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
    }

    // Functions
    public function saveApplication(Request $request)
    {
        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Application Entry
            $application = ApplicationsModel::create([
                "type_id" => $request->input('type_id'),
                "duration_start" => $request->input('from_date'),
                "duration_end" => $request->input('to_date'),
                "description" => $request->input('description') ?? "",
                "status" => "Pending",
                "leave_used" => $request->input('leave_used'),
                "user_id" => $user->id,
                "client_id" => $user->client_id,
            ]);

            // Adding Files - Documents
            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file) {
                    $application->addMedia($file)
                        ->withCustomProperties(['type' => 'Document'])
                        ->toMediaCollection('documents');
                }
            }

            // Adding Files - Images
            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $file) {
                    $application->addMedia($file)
                        ->withCustomProperties(['type' => 'Image'])
                        ->toMediaCollection('images');
                }
            }

            DB::commit();

            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
    }

    public function editApplication(Request $request)
    {
        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Application Update
            $application = ApplicationsModel::find($request->input('id'));

            $application->type_id = $request->input('type_id');
            $application->duration_start = $request->input('from_date');
            $application->duration_end = $request->input('to_date');
            $application->description = $request->input('description');
            $application->leave_used = $request->input('leave_used');
            $application->save();

            // File Removal Prep
            $deleteFiles = $request->input('deleteAttachments', []);
            if (!is_array($deleteFiles)) {
                $deleteFiles = [];
            }

            // Remove Files
            if (!empty($deleteFiles)) {
                $mediaItems = $application->getMedia('*')->whereIn('id', $deleteFiles);
                foreach ($mediaItems as $media) {
                    $media->delete();
                }
            }

            // Adding Files - Documents
            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file) {
                    $application->addMedia($file)
                        ->withCustomProperties(['type' => 'Document'])
                        ->toMediaCollection('documents');
                }
            }

            // Adding Files - Images
            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $file) {
                    $application->addMedia($file)
                        ->withCustomProperties(['type' => 'Image'])
                        ->toMediaCollection('images');
                }
            }

            DB::commit();

            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error saving: " . $e->getMessage());
            throw $e;
        }
    }

    public function cancelApplication($id)
    {
        //Log::info("ApplicationsController::cancelApplication");

        $application = ApplicationsModel::find($id);

        if (!$application) {
            return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
        }

        if ($application->status !== 'Pending') {
            return response()->json(['status' => 400, 'message' => 'Only pending applications can be cancelled'], 400);
        }

        $application->status = 'Cancelled';
        $application->save();

        return response()->json(['status' => 200, 'message' => 'Application successfully cancelled!'], 200);
    }

    public function manageApplication(Request $request)
    {
        Log::info("ApplicationsController::manageApplication");
        Log::info($request);
        $user = Auth::user();

        $application = ApplicationsModel::find($request->input('app_id'));

        if ($this->checkUser() && ($user->client_id == $application->client_id)) {
            try {
                DB::beginTransaction();
                
                if (!$application) {
                    //Log::error('Application not found for ID: ' . $id);
                    return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
                }
                
                switch ($request->input('app_response')) {
                    case 'Approve':
                        $emp = UsersModel::where('user_name', $request->input('app_emp_username'))->first();
                        $leave = LeaveCreditsModel::where('user_id', $emp->id)->where('application_type_id', $request->input('app_type_id'))->first();

                        $oldLeaveUsed = $leave->used;
                        $usedCredits = number_format($request->input('app_leave_used'), 2, '.', '');
                        $leave->used = $leave->used + $usedCredits;
                        $leave->save();

                        $newLeaveUsed = number_format($oldLeaveUsed + $usedCredits, 2, '.', '');

                        LogsLeaveCreditsModel::create([
                            'user_id' => $user->id,
                            'leave_credit_id' => $leave->id,
                            'action' => 'Approved ' . $usedCredits . ' Credits. ID: ' . $leave->id . ', Prev: ' . $oldLeaveUsed . ', New: ' . $newLeaveUsed . '.',
                        ]);

                        $application->status = "Approved";
                        $message = "Application Approved";
                        break;
                    case 'Decline':
                        $application->status = "Declined";
                        $message = "Application Declined";
                        break;
                }
                $application->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => $message], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                //Log::error("Error managing application: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'An error occurred while managing the application'], 500);
                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Files
    public function getApplicationFiles($id)
    {
        //Log::info("AnnouncementsController::getApplicationFiles");
        $user = Auth::user();

        $application = ApplicationsModel::find($id);
        if (!$application) {
            return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
        }

        $filenames = [];
        $mediaItems = $application->getMedia('*');

        foreach ($mediaItems as $media) {
            $filenames[] = [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
            ];
        }

        return response()->json(['status' => 200, 'filenames' => $filenames ?: null]);
    }

    public function downloadFile($id)
    {
        //Log::info('ApplicationsController::downloadFile');
        $media  = Media::find($id);

        if (!$media) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $filePath = $media->getPath();
        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        return response()->download($filePath, $media->file_name);
    }

    // Leave Credits
    public function getLeaveCredits($userName)
    {
        //Log::info("ApplicationsController::getLeaveCredits");

        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;

            $emp = UsersModel::where('user_name', $userName)->first();
            $leaves = LeaveCreditsModel::where('client_id', $clientId)->where('user_id', $emp->id)->get();

            $leaveCredits = [];

            foreach ($leaves as $leave) {
                $app_type = $leave->type;

                $leaveCredits[] = [
                    'id' => $leave->id,
                    'client_id' => $leave->client_id,
                    'user_id' => $leave->user_id,
                    'app_type_id' => $app_type->id,
                    'app_type_name' => $app_type->name,
                    'credit_number' => $leave->number,
                    'credit_used' => $leave->used,
                ];
            }

            return response()->json(['status' => 200, 'leave_credits' => $leaveCredits]);
        } else {
            return response()->json(['status' => 200, 'leave_credits' => null]);
        }
    }

    public function getMyLeaveCredits()
    {
        //Log::info("ApplicationsController::getMyLeaveCredits");

        $user = Auth::user();

        $clientId = $user->client_id;

        $leaves = LeaveCreditsModel::where('client_id', $clientId)
            ->where('user_id', $user->id)
            ->get();

        $leaveCredits = [];

        foreach ($leaves as $leave) {
            $app_type = $leave->type;

            $leaveCredits[] = [
                'id' => $leave->id,
                'app_type_id' => $app_type->id,
                'app_type_name' => $app_type->name,
                'credit_number' => $leave->number,
                'credit_used' => $leave->used,
            ];
        }

        return response()->json(['status' => 200, 'leave_credits' => $leaveCredits]);
    }

    public function saveLeaveCredits(Request $request)
    {
        //Log::info("ApplicationsController::saveLeaveCredits");
        Log::info($request);
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $employee = UsersModel::where('user_name', $request->input('emp_id'))->first();

                $leave = LeaveCreditsModel::create([
                    'client_id' => $user->client_id,
                    'user_id' => $employee->id,
                    'application_type_id' => $request->input('app_type_id'),
                    'number' => $request->input('credit_count'),
                    'used' => 0
                ]);

                $leaveName = $leave->type->name;

                LogsLeaveCreditsModel::create([
                    'user_id' => $user->id,
                    'leave_credit_id' => $leave->id,
                    'action' => 'Added ' . number_format($request->input('credit_count'), 2) . ' ' . $leaveName . ' credits.',
                ]);

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                //Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editLeaveCredits(Request $request)
    {
        //Log::info("ApplicationsController::editLeaveCredits");
        $user = Auth::user();

        if ($this->checkUser()) {
            try {

                $leaveCredit = LeaveCreditsModel::find($request->input('app_id'));
                $oldLeaveNumber = $leaveCredit->number;

                $leaveCredit->number  = number_format($request->input('credit_count'), 2, '.', '');
                $leaveCredit->save();

                LogsLeaveCreditsModel::create([
                    'user_id' => $user->id,
                    'leave_credit_id' => $leaveCredit->id,
                    'action' => 'Updated Credit ' . $leaveCredit->id . ' from ' . $oldLeaveNumber . ' to ' . $leaveCredit->number . '.',
                ]);

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                //Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
    }

    public function deleteLeaveCredits(Request $request)
    {
        // Log::info("ApplicationsController::deleteLeaveCredits");

        if ($this->checkUser()) {
            try {

                $leaveCredit = LeaveCreditsModel::find($request->input('leaveCredit'));

                if ($leaveCredit) {
                    $leaveCredit->delete();
                    return response()->json(['status' => 200]);
                }

                return response()->json(['status' => 404]);
            } catch (\Exception $e) {
                //Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
    }

    public function getLeaveCreditLogs($userName)
    {
        //Log::info("ApplicationsController::getLeaveCreditLogs");

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                $emp = UsersModel::where('user_name', $userName)->first();
                $logs = LogsLeaveCreditsModel::whereHas('leaveCredit', function ($query) use ($emp) {
                    $query->where('user_id', $emp->id);
                })->orderBy('created_at', 'desc')->get();

                $logData = [];

                foreach ($logs as $log) {
                    $log['username'] = $log->user->user_name;
                    $logData[] = $log->toArray();
                }

                return response()->json(['status' => 200, "logs" => $logData]);
            } catch (\Exception $e) {
                //Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        } else {
            return response()->json(['status' => 200, "logs" => null]);
        }
    }

    // Overtime
    public function saveOvertimeApplication(Request $request)
    {
        // Log::info("ApplicationsController::saveOvertimeApplication");
        // Log::info($request);
        $user = Auth::user();

        try {
            DB::beginTransaction();
            $overtimeDay = $request->input('ot_date');
            $overtimeIn = $request->input('ot_in');
            $overtimeOut = $request->input('ot_out');

            $otTimeIn = "$overtimeDay $overtimeIn";
            $otTimeOut = "$overtimeDay $overtimeOut";

            $timeInDateTime = Carbon::parse($otTimeIn);
            $timeOutDateTime = Carbon::parse($otTimeOut);

            $timeIn = AttendanceLogsModel::where('user_id', $user->id)
                ->where('action', 'Overtime In')
                ->where('timestamp', $timeInDateTime)
                ->first();

            $timeOut = AttendanceLogsModel::where('user_id', $user->id)
                ->where('action', 'Overtime Out')
                ->where('timestamp', $timeOutDateTime)
                ->first();

            ApplicationsOvertimeModel::create([
                'user_id' => $user->id,
                'client_id' => $user->client_id,
                'time_in_id' => $timeIn->id,
                'time_out_id' => $timeOut->id,
                'reason' => $request->input('reason')
            ]);

            DB::commit();

            return response()->json(['status' => 200, 'message' => 'overtime submitted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            //Log::error("Error saving: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'error saving overtime application'], 500);
            throw $e;
        }
    }

    public function getOvertimeApplications()
    {
        Log::info("ApplicationsController::saveOvertimeApplication");
        $user = Auth::user();

        if ($this->checkUser()) {

            $rawApplications = ApplicationsOvertimeModel::where('client_id', $user->client_id)->with(['user', 'timeIn', 'timeOut'])->get();

            $applications = [];
            foreach ($rawApplications as $app) {
                $employee = $app->employee;
                $timeIn = $app->timeIn;
                $timeOut = $app->timeOut;

                $applications[] = [
                    'application' => encrypt($app->id),
                    'time_in' => $timeIn->timestamp,
                    'time_out' => $timeOut->timestamp,
                    'reason' => $app->reason ?? '',
                    'requested' => $app->created_at,
                    'status' => $app->status,
                    'emp_name' => ($employee->first_name ?? '') . ' ' . ($employee->middle_name ?? '') . ' ' . ($employee->last_name ?? '') . ' ' . ($employee->suffix ?? ''),
                    'emp_branch' => $employee->branch->name,
                    'emp_department' => $employee->department->name,
                    'emp_job_title' => $employee->jobTitle->name,
                ];
            }
            return response()->json(['status' => 200, 'applications' => $applications]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function manageOvertimeApplication(Request $request)
    {
        Log::info("ApplicationsController::manageOvertimeApplication");
        Log::info($request);

        $user = Auth::user();

        $id = decrypt($request->input('app_id'));
        $overtime = ApplicationsOvertimeModel::find($id);

        if ($this->checkUser() && ($user->client_id == $overtime->client_id)) {
            $status = $request->input('app_response');
            $message = null;

            switch ($status) {
                case "Approve":
                    $overtime->status = "Approved";
                    $overtime->approved_minutes = $request->input('totalMinutes');
                    $overtime->date = $request->input('date');
                    $message = "Overtime approved successfully";
                    break;
                case "Decline":
                    $overtime->status = "Declined";
                    $message = "Overtime declined successfully";
            }
            $overtime->save();
            return response()->json(['status' => 200, 'message' => $message], 200);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Restrictions
    public function getTenureship()
    {
        //Log::info("ApplicationsController::getTenureship");

        $user = Auth::user();

        $startDate = Carbon::parse($user->date_start);

        $currentDate = Carbon::now();

        $tenureshipMonths = $startDate->diffInMonths($currentDate);

        return response()->json(['status' => 200, 'tenureship' => $tenureshipMonths]);
    }

    public function getFullLeaveDays()
    {
        // Log::info("ApplicationsController::getFullLeaveDays");
        $user = Auth::user();

        $department = $user->department;
        $deptId = $department->id;
        $deptLimit = $department->leave_limit;

        $branch = $user->branch;
        $branchId = $branch->id;
        $branchLimit = $branch->leave_limit;

        $deptFullDates = $this->getFullDayCount("department_id", $deptId, $deptLimit); // Gets Department Capped Dates
        $branchFullDates = $this->getFullDayCount("branch_id", $branchId, $branchLimit); // Gets Branch Capped Dates

        $fullDates = array_values(array_unique(array_merge($deptFullDates, $branchFullDates)));

        return response()->json(['status' => 200, 'fullDates' => $fullDates]);
    }

    public function getFullDayCount(String $column, $id, $limit)
    {
        // Log::info("ApplicationsController::getFullDayCount");

        $date = Carbon::now();
        $applications = ApplicationsModel::whereHas('user', function ($query) use ($column, $id) {
            $query->where($column, $id);
        })
            ->whereNotIn('status', ['Cancelled', 'Declined'])
            ->where('duration_start', '>=', $date)
            ->get();

        $dateCounts = [];
        foreach ($applications as $application) {
            $startDate = Carbon::parse($application->duration_start);
            $endDate = Carbon::parse($application->duration_end);

            $currentDate = $startDate;

            while ($currentDate->lte($endDate)) {
                $dateKey = $currentDate->toDateString();
                if (!isset($dateCounts[$dateKey])) {
                    $dateCounts[$dateKey] = 0;
                }
                $dateCounts[$dateKey]++;
                $currentDate->addDay();
            }
        }

        $fullDates = [];
        foreach ($dateCounts as $date => $count) {
            if ($count >= $limit) {
                $fullDates[] = $date;
            }
        }

        return $fullDates;
    }

    public function getNagerHolidays(Request $request)
    {
        //Log::info("ApplicationsController::getNagerHolidays");
        //Log::info($request);
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));

        $holidays = [];
        $countryCode = 'PH';

        // Fetch holidays for each year in the range
        for ($year = $startDate->year; $year <= $endDate->year; $year++) {
            $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}";

            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (is_array($data)) {
                    foreach ($data as $holiday) {
                        $holidayDates[] = Carbon::parse($holiday['date'])->format('Y-m-d');
                        $holidayNames[] = $holiday['name'];
                    }
                } else {
                    Log::error("Nager.Date API returned invalid data for year {$year}: " . json_encode($data));
                }
            } else {
                Log::error("Failed to fetch holidays from Nager.Date API for year {$year}: " . $response->status());
                Log::error($response->body());
            }
        }
        return response()->json(['status' => 200, 'holiday_dates' => $holidayDates, 'holiday_names' => $holidayNames]);
    }

    public function getGoogleCalendarHolidays(Carbon $startDate, Carbon $endDate)
    {
        //log::info("ApplicationsController::getGoogleCalendarHolidays");

        $apiKey = 'AIzaSyAPJ1Ua6xjhqwbjsucXeUCYYGUnObnJPU8';
        $calendarId = 'en.philippines#holiday@group.v.calendar.google.com';

        // Prepare the API endpoint to fetch holidays within the date range
        $startDateFormatted = $startDate->toIso8601String();
        $endDateFormatted = $endDate->toIso8601String();

        $url = "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events";
        $url .= "?key={$apiKey}&timeMin={$startDateFormatted}&timeMax={$endDateFormatted}&singleEvents=true";

        // Make the API request
        $response = Http::get($url);

        if ($response->successful()) {
            $events = $response->json()['items'];
            $holidays = [];

            foreach ($events as $event) {
                // Extract the date of the holiday and add to the holidays array
                $holidayDate = Carbon::parse($event['start']['date'])->format('Y-m-d');
                $holidays[] = $holidayDate;
            }

            return $holidays;
        } else {
            Log::error("Failed to fetch Google Calendar holidays: " . $response->status());
            log::error($response);
            return [];
        }
    }
}
