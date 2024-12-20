<?php

namespace App\Http\Controllers;

use App\Models\HrApplications;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class HrApplicationsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    public function getApplications($id)
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

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
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
            hr_workdays.workday_id,
            hr_workdays.user_id,
            hr_application_status.app_status_id,
            hr_application_status.app_status_name,
            hr_application_status.color "))
                ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
                ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
                ->join('hr_application_status', 'hr_applications.app_status_id', '=', 'hr_application_status.app_status_id')
                ->where('hr_applications.is_deleted', '=', 0)
                ->where('user.team', $admin->team)
                ->where('user.user_type', 'Member')
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        } else {

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
            hr_workdays.workday_id,
            hr_workdays.user_id,
            hr_application_status.app_status_id,
            hr_application_status.app_status_name,
            hr_application_status.color "))
                ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
                ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
                ->join('hr_application_status', 'hr_applications.app_status_id', '=', 'hr_application_status.app_status_id')
                ->where('hr_applications.is_deleted', '=', 0)
                ->where('user.team', $user->team)
                ->where('user.user_type', 'Member')
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        }

        $total_applications = array();
        foreach ($applications as $list) {
            $total_applications[] = $list;
        }

        return response()->json([
            'status' => 200,
            'applications' => $total_applications
        ]);
    }
    public function getApplicationsReports($id, $dates)
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

        $recordsDate = explode(",", $dates);
        $monthRecord = $recordsDate[0];
        $yearRecord = $recordsDate[1];

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
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
            hr_workdays.workday_id,
            hr_workdays.color,
            hr_workdays.user_id,
            hr_workdays.`status` "))
                ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
                ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
                ->where('hr_applications.is_deleted', '=', 0)
                ->where('user.team', $admin->team)
                ->where('user.user_type', 'Member')
                ->whereRaw('MONTH(hr_applications.date_from) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_applications.date_from) = ?', [$yearRecord])
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        } else {

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
            hr_workdays.workday_id,
            hr_workdays.color,
            hr_workdays.user_id,
            hr_workdays.`status` "))
                ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
                ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
                ->where('hr_applications.is_deleted', '=', 0)
                ->where('user.team', $user->team)
                ->where('user.user_type', 'Member')
                ->whereRaw('MONTH(hr_applications.date_from) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_applications.date_from) = ?', [$yearRecord])
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        }

        $total_applications = array();
        foreach ($applications as $list) {
            $total_applications[] = $list;
        }

        return response()->json([
            'status' => 200,
            'applications' => $total_applications
        ]);
    }

    public function deleteApplications(Request $request)
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

        $app_id = $request->validate([
            'application_id' => 'required'
        ]);

        try {
            $delete_apps = DB::table('hr_applications')->where('application_id', $app_id['application_id'])
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            $delete_apps_workdays = DB::table('hr_workdays')->where('application_id', $app_id['application_id'])
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);

            if ($delete_apps && $delete_apps_workdays) {
                $message = "Success";
            } else {
                $message = "Something went wrong";
            }
        } catch (Exception $e) {
            $message = "Error";
        }

        return response()->json([
            'status' => 200,
            'message' => $message
        ]);
    }

    public function addApplication(Request $request)
    {
        $applicationStatus = $request->validate([
            'user_id' => 'required',
            'workday_id' => 'required',
            'application_id' => 'required',
            'status' => 'required',
            'color' => 'required',
            'status_id' => 'required'
        ]);
        if ($applicationStatus) {
            $exist = DB::table('hr_applications')
                ->select('*')
                ->where('application_id', $applicationStatus['application_id'])
                ->orderBy('created_at', 'DESC')
                ->first();

            $leave_limit = DB::table('hr_application_leave')
                ->select('*')
                ->where('appList_id', $exist->applist_id)
                ->where('user_id', $applicationStatus['user_id'])
                ->first();

            if ($leave_limit->leave_limit <= 0 && $applicationStatus['status'] === 'Approved') {
                if (strpos(strtolower($leave_limit->title), 'leave') === false) {
                    $leaveLimit = DB::table('hr_application_leave')->where('user_id', $applicationStatus['user_id'])->where('appList_id', $exist->applist_id)->update(['app_hours' => $exist->app_hours]);
                    $workdays = DB::table('hr_workdays')->where('workday_id', $applicationStatus['workday_id'])->update(['status' => $applicationStatus['status'], 'color' => $applicationStatus['color']]);
                    $status = DB::table('hr_applications')->where('application_id', $applicationStatus['application_id'])->update(['app_status_id' => $applicationStatus['status_id'], 'status' => $applicationStatus['status'], 'color' => $applicationStatus['color']]);
                    $color = DB::table('hr_application_status')->where('app_status_id', $applicationStatus['status_id'])->update(['color' => $applicationStatus['color']]);

                    $leaveCreditSum = DB::table('hr_application_leave')
                        ->where('user_id', $applicationStatus['user_id'])
                        ->where('title', 'LIKE', '%leave%')
                        ->sum('leave_limit');

                    $isUpdated = User::where('user_id', $applicationStatus['user_id'])->update(['limit' => $leaveCreditSum]);
                    $messageLimit = "Success";
                } else {
                    $messageLimit = "Fail";
                }
            } else {
                if ($applicationStatus['status'] !== $exist->status) {
                    if ($applicationStatus['status'] === 'Approved') {
                        $newUserLimit = (($leave_limit->leave_limit * 8) - $exist->app_hours) / 8;
                    } else {
                        $newUserLimit = (($leave_limit->leave_limit * 8) + $exist->app_hours) / 8;
                    }
                } else {
                    $newUserLimit = $leave_limit->leave_limit;
                }

                $leaveLimit = DB::table('hr_application_leave')->where('user_id', $applicationStatus['user_id'])->where('appList_id', $exist->applist_id)->update(['leave_limit' => $newUserLimit, 'app_hours' => $exist->app_hours]);
                $workdays = DB::table('hr_workdays')->where('workday_id', $applicationStatus['workday_id'])->update(['status' => $applicationStatus['status'], 'color' => $applicationStatus['color']]);
                $status = DB::table('hr_applications')->where('application_id', $applicationStatus['application_id'])->update(['app_status_id' => $applicationStatus['status_id'], 'status' => $applicationStatus['status'], 'color' => $applicationStatus['color'], 'limit_remain' => floatval(number_format($newUserLimit * 8, 2, '.', ""))]);
                $color = DB::table('hr_application_status')->where('app_status_id', $applicationStatus['status_id'])->update(['color' => $applicationStatus['color']]);

                $leaveCreditSum = DB::table('hr_application_leave')
                    ->where('user_id', $applicationStatus['user_id'])
                    ->where('title', 'LIKE', '%leave%')
                    ->sum('leave_limit');

                $isUpdated = User::where('user_id', $applicationStatus['user_id'])->update(['limit' => $leaveCreditSum]);
                $messageLimit = "Success";
            }
            $message = "Success";
        } else {
            $message = "Fail";
        }

        return response()->json([
            'status' => 200,
            'editApplication' => $message,
            'limitApplication' => $messageLimit,
        ]);
    }

    public function getApplicationStatus()
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

        $getStatus = DB::table('hr_application_status')->select(DB::raw("*"))->where("is_deleted", "!=", "1")->where("team", "=", $user->team)->orderBy('app_status_name', 'ASC')->get();

        return response()->json([
            'status' => 200,
            'status' => $getStatus
        ]);
    }

    public function addApplicationStatus(Request $request)
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

        $status_name = $request->validate([
            'status_name' => 'required'
        ]);

        $insert_status = DB::table('hr_application_status')->insert(
            array(
                'app_status_name' => $status_name['status_name'],
                'team' => $user->team,
            )
        );
        return response()->json([
            'status' => 200,
            'data' => $insert_status
        ]);
    }

    public function deleteAppStatus(Request $reqeust, $id)
    {

        $deleteStatus = $reqeust->validate([
            'is_deleted' => 'required'
        ]);
        $status = DB::table('hr_application_status')->where('app_status_id', $id)->update(['is_deleted' => $deleteStatus['is_deleted']]);

        if ($status) {
            $message = "Success";
        } else {
            $message = "Fail";
        }
        return response()->json([
            'status' => 200,
            'delete_app' => $message
        ]);
    }

    // Application List
    public function addAppList(Request $request)
    {
        $today = now()->format("Y-m-d H:i:s");
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $status_name = $request->validate([
            'title' => 'required',
            'percentage' => 'required',
        ]);

        $insert_status = DB::table('hr_application_list')->insert(
            array(
                'list_name' => $status_name['title'],
                'percentage' => $status_name['percentage'],
                'team' => $user->team
            )
        );

        if ($insert_status) {
            $message = "Success";
        } else {
            $message = "Error";
        }

        $employee = DB::table('user')
            ->select('*')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->where('user_type', 'Member')
            ->get();

        $appList = DB::table('hr_application_list')
            ->select('*')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->get();

        foreach ($employee as $emp) {
            foreach ($appList as $list) {
                $existingRecord = DB::table('hr_application_leave')
                    ->where('appList_id', $list->applist_id)
                    ->where('user_id', $emp->user_id)
                    ->exists();

                if (!$existingRecord) {
                    $insert_leave = DB::table('hr_application_leave')->insert(
                        array(
                            'appList_id' => $list->applist_id,
                            'user_id' => $emp->user_id,
                            'title' => $list->list_name,
                            'team' => $user->team,
                            'created_at' => $today,
                        )
                    );
                }
            }
        }


        return response()->json([
            'status' => 200,
            'message' => $message
        ]);
    }
    public function getApplicationsList($id)
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

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $applications = DB::table('hr_application_list')
                ->select(DB::raw("
                applist_id,
                list_name,
                percentage,
                date_created"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $admin->team)
                ->get();

            $applicationsLeave = DB::table('hr_application_list')
                ->select(DB::raw("
            applist_id,
            list_name,
            percentage,
            date_created"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $admin->team)
                ->where('list_name', 'LIKE', '%leave%')
                ->get();

            $applicationsOvertime = DB::table('hr_application_list')
                ->select(DB::raw("
                applist_id,
                list_name,
                percentage,
                date_created"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $admin->team)
                ->where('list_name', 'NOT LIKE', '%leave%')
                ->get();
        } else {
            $applications = DB::table('hr_application_list')
                ->select(DB::raw("
        applist_id,
        list_name,
        percentage,
        date_created"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $user->team)
                ->get();

            $applicationsLeave = DB::table('hr_application_list')
                ->select(DB::raw("
            applist_id,
            list_name,
            percentage,
            date_created"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $user->team)
                ->where('list_name', 'LIKE', '%leave%')
                ->get();

            $applicationsOvertime = DB::table('hr_application_list')
                ->select(DB::raw("
        applist_id,
        list_name,
        percentage,
        date_created"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $user->team)
                ->where('list_name', 'NOT LIKE', '%leave%')
                ->get();
        }
        $total_applications = array();
        foreach ($applications as $list) {
            $total_applications[] = $list;
        }

        $total_applications_leave = array();
        foreach ($applicationsLeave as $list) {
            $total_applications_leave[] = $list;
        }

        $total_applications_overtime = array();
        foreach ($applicationsOvertime as $list) {
            $total_applications_overtime[] = $list;
        }

        return response()->json([
            'status' => 200,
            'applicationList' => $total_applications,
            'applicationListLeave' => $total_applications_leave,
            'applicationListOvertime' => $total_applications_overtime
        ]);
    }
    public function getApplicationsLeave($date)
    {
        $string_parts = explode(",", $date);
        $dateFrom = $string_parts[0];
        $dateTo = $string_parts[1];
        $id = $string_parts[2];

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $applicationsLeave = DB::table('hr_application_leave')
                ->select(DB::raw("*"))
                ->where('team', '=', $admin->team)
                ->where('title', 'LIKE', '%leave%')
                ->get();
            $applicationsOvertime = DB::table('hr_application_leave')
                ->select(DB::raw("*"))
                ->where('team', '=', $admin->team)
                ->where('title', 'NOT LIKE', '%leave%')
                ->get();
        } else {
            $applicationsLeave = DB::table('hr_application_leave')
                ->select(DB::raw("*"))
                ->where('team', '=', $user->team)
                ->where('title', 'LIKE', '%leave%')
                ->get();
            $applicationsOvertime = DB::table('hr_application_leave')
                ->select(DB::raw("*"))
                ->where('team', '=', $user->team)
                ->where('title', 'NOT LIKE', '%leave%')
                ->get();
        }

        $leave_credit = array();
        foreach ($applicationsLeave as $list) {
            $getLeaveHours = DB::table('hr_applications')
                ->select(DB::raw("SUM(app_hours) as total_hours"))
                ->where('user_id', '=', $list->user_id)
                ->where('applist_id', '=', $list->appList_id)
                ->where('is_deleted', '=', 0)
                ->where('status', '=', 'Approved')
                ->first();

            $leave_credit[] = [
                'leave_id' => $list->leave_id,
                'appList_id' => $list->appList_id,
                'user_id' => $list->user_id,
                'title' => $list->title,
                'app_hours' => $getLeaveHours->total_hours ?? 0,
                'leave_limit' => $list->leave_limit,
                'total_limit' => $list->total_limit,
                'team' => $list->team,
                'created_at' => $list->created_at,
                'modified_at' => $list->modified_at,
            ];
        }

        $overtime = array();
        foreach ($applicationsOvertime as $over) {
            $getOvertimeHours = DB::table('hr_applications')
                ->select(DB::raw("SUM(app_hours) as total_hours"))
                ->where('user_id', '=', $over->user_id)
                ->where('applist_id', '=', $over->appList_id)
                ->where('is_deleted', '=', 0)
                ->where('status', '=', 'Approved')
                ->whereBetween('date_from', [$dateFrom, $dateTo])
                ->first();

            $overtime[] = [
                'leave_id' => $over->leave_id,
                'appList_id' => $over->appList_id,
                'user_id' => $over->user_id,
                'title' => $over->title,
                'app_hours' => $getOvertimeHours->total_hours ?? 0,
                'leave_limit' => $over->leave_limit,
                'total_limit' => $over->total_limit,
                'team' => $over->team,
                'created_at' => $over->created_at,
                'modified_at' => $over->modified_at,
            ];
        }

        return response()->json([
            'status' => 200,
            'applicationLeave' => $leave_credit,
            'applicationOvertime' => $overtime
        ]);
    }
    public function addNewType(Request $request)
    {
        $validate = $request->validate([
            'appID' => 'required',
            'title' => 'nullable|string|max:255',
            'percentage' => 'nullable',
            'old_title' => 'nullable|string|max:255',
            'old_percentage' => 'nullable'
        ]);

        try {
            if ($validate['title'] != null) {
                $titleVerify = $validate['title'];
            } else {
                $titleVerify = $validate['old_title'];
            }
            if ($validate['percentage'] != 0) {
                $percentageVerify = $validate['percentage'];
            } else {
                $percentageVerify = $validate['old_percentage'];
            }

            DB::table('hr_application_list')->where('applist_id', $validate['appID'])->update(['list_name' => $titleVerify, 'percentage' => $percentageVerify]);
            DB::table('hr_workdays')->where('applist_id', $validate['appID'])->update(['percentage' => $percentageVerify]);
            DB::table('hr_applications')->where('applist_id', $validate['appID'])->update(['percentage' => $percentageVerify]);
            DB::table('hr_application_leave')->where('appList_id', $validate['appID'])->update(['title' => $titleVerify]);

            $message = "Success";
            return response()->json([
                'status' => 200,
                'message' => $message
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'message' => $e
            ]);
        }
    }

    public function deleteApplicationList(Request $request)
    {
        $delete = $request->validate([
            'applist_id' => 'nullable'
        ]);

        $delete_list = DB::table('hr_application_list')->where('applist_id', $delete['applist_id'])->delete();
        $delete_leave = DB::table('hr_application_leave')->where('appList_id', $delete['applist_id'])->delete();

        if ($delete_list) {
            $message = "Success";
        } else {
            $message = "Error";
        }
        return response()->json([
            'status' => 200,
            'message' => $message
        ]);
    }

    public function editLeave(Request $request, $id)
    {
        $modifiedLeaveLimits = $request->input('modifiedLeaveLimits');

        foreach ($modifiedLeaveLimits as $entry) {
            $appListId = $entry['appList_id'];
            $leaveLimit = $entry['leave_limit'];
            $totalLimit = $entry['total_limit'];

            DB::table('hr_application_leave')
                ->where('user_id', $id)
                ->where('appList_id', $appListId)
                ->update(['leave_limit' => $leaveLimit, 'total_limit' => $totalLimit]);
            DB::table('hr_applications')
                ->where('user_id', $id)
                ->where('applist_id', $appListId)
                ->update(['limit_remain' => $leaveLimit * 8]);
        }

        $leaveCreditSum = DB::table('hr_application_leave')
            ->where('user_id', $id)
            ->where('title', 'LIKE', '%leave%')
            ->sum('leave_limit');

        $isUpdated = User::where('user_id', $id)->update(['limit' => $leaveCreditSum]);

        if ($isUpdated) {
            return response()->json([
                'status' => 200,
                'message' => 'Update successful'
            ]);
        } else {
            return response()->json([
                'message' => 'Update failed'
            ], 400);
        }
    }
}
