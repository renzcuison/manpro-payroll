<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MemberDashboardController extends Controller
{
    public function getMemberApplications()
    {
        if (Auth::check()) {
            $userID = Auth::id(); // Get the user ID of the authenticated user
        }
        
        $day = date("d");
        $month = date("m");
        $year = date("Y");
        $applicationData = array();
        $applicationList = DB::table('hr_applications')
            ->select(DB::raw("*"), 'hr_workdays.status as AppStatus', 'hr_workdays.color as AppColor')
            ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
            ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
            ->where('hr_applications.user_id', '=', $userID)
            ->where('hr_applications.is_deleted', 0)
            ->whereRaw('DAY(hr_applications.created_at) = ?', [$day])
            ->whereRaw('MONTH(hr_applications.created_at) = ?', [$month])
            ->whereRaw('YEAR(hr_applications.created_at) = ?', [$year])
            ->orderBy('hr_applications.date_from', 'desc')
            ->get();

        foreach ($applicationList as $application) {
            $applicationData[] = $application;
        }

        return response()->json([
            'status' => 200,
            'applications' => $applicationData
        ]);
    }

    public function getMemberAttendances()
    {
        if (Auth::check()) {
            $userID = Auth::id(); // Get the user ID of the authenticated user
        }

        $attendanceData = array();
        $attendanceList = DB::table('hr_attendance')
            ->select(DB::raw("*"))
            ->join('user', 'hr_attendance.user_id', '=', 'user.user_id')
            ->where('hr_attendance.user_id', '=', $userID)
            ->where('hr_attendance.is_deleted', '=' ,'0')
            ->orderBy('start_date', 'desc')
            ->take(5)
            ->get();

        foreach ($attendanceList as $attendance) {
            $attendanceData[] = $attendance;
        }


        return response()->json([
            'status' => 200,
            'attendances' => $attendanceData

        ]);
    }
}
