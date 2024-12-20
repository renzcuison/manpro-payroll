<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\HrApplications;
use App\Models\HrApplicationLeave;
use App\Models\HrApplicationList;
use App\Models\HrApplicationStatus;
use App\Models\HrWorkday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ApplicationsMobileController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();

            // Get the latest hours remaining and summing the app_hours for the user
            $latestSickLeave = HrApplications::where('leave_type', 'Sick Leave')
                ->where('user_id', $user->user_id)
                ->latest()
                ->first(['limit_remain']);
            $sickLeaveHours = HrApplications::where('leave_type', "Sick Leave")
                ->where('hr_applications.user_id', $user->user_id)
                ->where('hr_applications.status', "Approved")
                ->sum('app_hours');

            $latestVacationLeave = HrApplications::where('leave_type', 'Vacation Leave')
                ->where('user_id', $user->user_id)
                ->latest()
                ->first(['limit_remain']);
            $vacationLeaveHours = HrApplications::where('leave_type', "Vacation Leave")
                ->where('hr_applications.user_id', $user->user_id)
                ->where('hr_applications.status', "Approved")
                ->sum('app_hours');

            $latestPaidLeave = HrApplications::where('leave_type', 'Paid Leave')
                ->where('user_id', $user->user_id)
                ->latest()
                ->first(['limit_remain']);
            $paidLeaveHours = HrApplications::where('leave_type', "Paid Leave")
                ->where('hr_applications.user_id', $user->user_id)
                ->where('hr_applications.status', "Approved")
                ->sum('app_hours');

            // Calculate remaining sick leave after subtracting new app_hours
            $totalSickLeave = $latestSickLeave ? max(0, $latestSickLeave->limit_remain - $sickLeaveHours) : 0;
            $totalVacationLeave = $latestVacationLeave ? max(0, $latestVacationLeave->limit_remain - $vacationLeaveHours) : 0;
            $totalPaidLeave = $latestPaidLeave ? max(0, $latestPaidLeave->limit_remain - $paidLeaveHours) : 0;

            $applications = HrApplications::where('hr_applications.user_id', $user->user_id)
                ->where('hr_applications.is_deleted', 0)
                ->join('hr_application_status', 'hr_applications.app_status_id', '=', 'hr_application_status.app_status_id')
                ->select('hr_applications.*', 'hr_application_status.color', 'hr_application_status.app_status_name')
                ->get();

            Log::info('this is for the sickleave', ["new limit"=>$totalSickLeave]);
            Log::info('this is for the vacation', ["new limit"=>$totalVacationLeave]);
            Log::info('this is for the paid', ["new limit"=>$totalPaidLeave]);


            if ($applications) {
                return response()->json([
                    'applications' => $applications,
                    'totalSickLeave' => $totalSickLeave,
                    'totalPaidLeave' => $totalPaidLeave,
                    'totalVacationLeave' => $totalVacationLeave,
                ], 200);
            } else {
                return response()->json([
                    'message' => 'No applications found',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function submitApplication(Request $request)
    {
        try {
            $validator = $request->validate([
                'leave_type' => 'required|string',
                'date_from' => 'required|date',
                'date_to' => 'required|date',
                'app_hours' => 'required|integer',
                'comments' => 'required|string',
                'app_file' => 'nullable|file',
            ]);

            $user = Auth::user();
            $pendingExist = HrApplicationStatus::where('app_status_name', 'Pending')
                ->where('team', $user->team)
                ->first();

            $statusApplication = HrApplicationStatus::where('app_status_name', '!=', 'Approved')
                ->where('team', $user->team)
                ->first();

            if ($pendingExist) {
                $statusName = $pendingExist->app_status_name;
                $statusColor = $pendingExist->color;
                $statusID = $pendingExist->app_status_id;
            } else {
                $statusName = $statusApplication->app_status_name;
                $statusColor = $statusApplication->color;
                $statusID = $statusApplication->app_status_id;
            }

            $applicationsList = HrApplicationList::where('list_name', $validator['leave_type'])
                ->where('team', $user->team)
                ->get();

            $application = null;
            $workdays = null;

            $filename = null;
            if ($request->hasFile('app_file')) {
                $file = $request->file('app_file');
                $filename = $file->getClientOriginalName();
                $file->storeAs('public', $filename);
            }

            Log::info('Outside foreach', ["filename"=>$filename]);

            $today = now()->format("Y-m-d H:i:s");

            // Retrieve the latest limit_remain value for the leave type
            $latestLeave = HrApplications::where('leave_type', $validator['leave_type'])
                ->where('user_id', $user->user_id)
                ->latest()
                ->first(['limit_remain']);
            
            // Calculate total approved leave hours for the leave type
            $approvedLeaveHours = HrApplications::where('leave_type', $validator['leave_type'])
                ->where('user_id', $user->user_id)
                ->where('status', 'Approved')
                ->sum('app_hours');

            // Calculate new limit_remain after subtracting approved leave hours and current application hours
            $newLimitRemain = $latestLeave ? max(0, $latestLeave->limit_remain - $approvedLeaveHours) : 0;

            Log::info('this is for the latest leave', ["new limit"=>$latestLeave]);
            Log::info('this is for the submission', ["new limit"=>$newLimitRemain]);

            foreach ($applicationsList as $list) {
                $leaveLimit = HrApplicationLeave::where('appList_id', $list->applist_id)
                    ->where('user_id', $user->user_id)
                    ->first();

                $application = HrApplications::create([
                    'leave_type' => $validator['leave_type'],
                    'percentage' => $list->percentage,
                    'date_from' => $validator['date_from'],
                    'date_to' => $validator['date_to'],
                    'app_file' => $filename,
                    'remarks' => $validator['comments'],
                    'app_hours' => $validator['app_hours'],
                    'user_id' => $user->user_id,
                    'applist_id' => $list->applist_id,
                    'status' => $statusName,
                    'color' => $statusColor,
                    'app_status_id' => $statusID,
                    'limit_remain' => $latestLeave->limit_remain, // Updated limit_remain value
                    'created_at' => $today
                ]);
            }

            $application = HrApplications::select('application_id')
                ->orderBy('application_id', 'desc')
                ->first();

            foreach ($applicationsList as $list) {
                $workdays = HRWorkday::create([
                    'title' => $validator['leave_type'],
                    'start_date' => $validator['date_from'],
                    'end_date' => $validator['date_to'],
                    'type' => 5,
                    'user_id' => $user->user_id,
                    'applist_id' => $list->applist_id,
                    'application_id' => $application->application_id,
                    'status' => $statusApplication->app_status_name,
                    'color' => $statusApplication->color,
                    'percentage' => $list->percentage,
                ]);
            }

            if ($application) {
                return response()->json([
                    'message' => "Application submitted",
                    'application' => $application,
                    'workday' => $workdays
                ], 201);
            } else {
                return response()->json([
                    'message' => "Application failed to submit"
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
