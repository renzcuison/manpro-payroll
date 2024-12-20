<?php

namespace App\Http\Controllers;

use App\Models\HrApplications;
use App\Models\HrApplicationLeave;
use App\Models\HrApplicationList;
use App\Models\HrApplicationStatus;
use App\Models\HrWorkday;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class MemberApplicationsController extends Controller
{
    public function getMemberApplicationsList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $listName = DB::table('hr_application_list')
            ->select('*')
            ->where('is_deleted', 0)
            ->where('team', $user->team)
            ->get();

        $listData = [];
        foreach ($listName as $list) {
            $listData[] = [
                'list' => $list->list_name,
            ];
        }

        return response()->json(['listData' => $listData]);
    }
    public function submitApplication(Request $request)
    {
        log::info("MemberApplicationsController::submitApplication");
        $today = date("Y-m-d H:i:s");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $message = '';
        $validated = $request->validate([
            'leave_type_val' => 'required',
            'date_from_val' => 'required|date',
            'date_to_val' => 'required|date',
            'hours' => 'required',
            'comments' => 'required'
        ]);

        
        if ($validated) {

            $dataToUpdate = [
                'leave_type_val' => $request->input('leave_type_val'),
                'date_from_val' => $request->input('date_from_val'),
                'date_to_val' => $request->input('date_to_val'),
                'hours' => $request->input('hours'),
                'comments' => $request->input('comments'),
            ];

            if ($request->hasFile('proof_docs')) {
                $file = $request->file('proof_docs');
                $filename = $file->getClientOriginalName();
                $destinationPath = storage_path('app/public');
                $file->move($destinationPath, $filename);
                $dataToUpdate['proof_docs'] = $filename;
            }

            try {
                
                $pendingExist = DB::table('hr_application_status')
                    ->select('*')
                    ->where('app_status_name', 'Pending')
                    ->where('team', $user->team)
                    ->first();

                $statusApplication = HrApplicationStatus::where('app_status_name', '!=', 'Approved')->where('team', $user->team)->first();

                if ($pendingExist) {
                    $statusName = $pendingExist->app_status_name;
                    $statusColor = $pendingExist->color;
                    $statusID = $pendingExist->app_status_id;
                } else {
                    $statusName = $statusApplication->app_status_name;
                    $statusColor = $statusApplication->color;
                    $statusID = $statusApplication->app_status_id;
                }

                $listApplication = DB::table('hr_application_list')
                    ->select('*')
                    ->where('list_name', $request->input('leave_type_val'))
                    ->where('team', $user->team)
                    ->get();

                foreach ($listApplication as $list) {
                    $leave_limit = DB::table('hr_application_leave')
                        ->select('*')
                        ->where('appList_id', $list->applist_id)
                        ->where('user_id', $userID)
                        ->first();

                    $applications = DB::table('hr_applications')->insertGetId([
                        'leave_type' => $request->input('leave_type_val'),
                        'percentage' => $list->percentage,
                        'date_from' => $request->input('date_from_val'),
                        'date_to' => $request->input('date_to_val'),
                        'app_file' => $filename,
                        'remarks' => $request->input('comments'),
                        'app_hours' => $request->input('hours'),
                        'user_id' => $userID,
                        'applist_id' => $list->applist_id,
                        'created_at' => $today,
                        // deleted_by
                        'color' => $statusColor,
                        'status' => $statusName,
                        'app_status_id' => $statusID,
                        'limit_remain' => $leave_limit ? ($leave_limit->leave_limit * 8) : 0
                    ]);
                }

                $application = DB::table('hr_applications')
                    ->select('application_id')
                    ->orderBy('application_id', 'desc')
                    ->first();

                foreach ($listApplication as $list) {
                    $workdays = DB::table('hr_workdays')->insertGetId([
                        'title' => $request->input('leave_type_val'),
                        'start_date' => $request->input('date_from_val'),
                        'end_date' => $request->input('date_to_val'),
                        'type' => 5,
                        'user_id' => $userID,
                        'applist_id' => $list->applist_id,
                        'application_id' => $application->application_id,
                        'status' => $statusApplication->app_status_name,
                        'color' => $statusApplication->color,
                        'percentage' => $list->percentage,
                    ]);
                }

            } catch (\Exception $error) {
                $message = 'Something went wrong!' . $error;
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $message
        ]);
    }

    public function getMemberApplications()
    {
        if (Auth::check()) {
            $userID = Auth::id(); // Get the user ID of the authenticated user
        }

        $applications = DB::table('hr_applications')
            ->select(DB::raw("
            user.fname,
            user.mname,
            user.lname,
            user.category,
            user.department,
            user.profile_pic,
            hr_applications.application_id,
            hr_applications.leave_type,
            hr_applications.date_from,
            hr_applications.remarks,
            hr_applications.date_to,
            hr_applications.app_hours,
            hr_applications.limit_remain,
            hr_applications.app_file,
            hr_applications.created_at,
            hr_applications.status,
            hr_workdays.workday_id,
            hr_workdays.user_id,
            hr_application_status.app_status_id,
            hr_application_status.app_status_name,
            hr_application_status.color "))
            ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
            ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
            ->join('hr_application_status', 'hr_applications.app_status_id', '=', 'hr_application_status.app_status_id')
            ->where('hr_applications.is_deleted', '=', 0)
            ->where('hr_applications.user_id', '=', $userID)
            ->orderBy('hr_applications.date_from', 'desc')
            ->get();

        $total_applications = array();
        foreach ($applications as $list) {
            $total_applications[] = $list;
        }

        return response()->json([
            'status' => 200,
            'applications' => $total_applications
        ]);
    }
}
