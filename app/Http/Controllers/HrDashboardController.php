<?php

namespace App\Http\Controllers;


use App\Models\User;
use App\Models\Category;
use App\Models\HrBranch;
use App\Models\HrWorkday;
use App\Models\HrAttendance;
use App\Models\HrApplications;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HrDashboardController extends Controller
{
    public function getEmployees($dateToday)
    {
        log::info("HrDashboardController::getEmployees");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = User::where('user_id', $userID)->first();
        $team = $userTeam->team;

        if ($userTeam->user_type === 'Super Admin') {
            $users = User::where('status', '!=', 'Resigned')->where('user_type', 'Member')->where('is_deleted', 0)->get();
        } else {
            $users = User::where('status', '!=', 'Resigned')->where('user_type', "Member")->where('is_deleted', 0)->where('team', $team)->get();
        }

        $workdaysList = HrWorkday::where('start_date', $dateToday)->where('type', 1)->where('is_deleted', 0)->where('team', $team)->first();

        $listOfUsers = array();
        $totalPresent = array();
        $totalOnLeave = array();
        $headCount = 0;
        $averageAge = 0;
        $averageTenure = 0;
        $totalAbsent = 0;
        $totalTrainings = 0;
        $totalAnnouncements = 0;
        $totalApplications = 0;

        $range = [];

        $range1 = $users->where('team', $team)->where('monthly_rate', '>', 10000)->where('monthly_rate', '<', 15001)->count();
        $range2 = $users->where('team', $team)->where('monthly_rate', '>', 15000)->where('monthly_rate', '<', 20001)->count();
        $range3 = $users->where('team', $team)->where('monthly_rate', '>', 20000)->where('monthly_rate', '<', 25001)->count();
        $range4 = $users->where('team', $team)->where('monthly_rate', '>', 25000)->where('monthly_rate', '<', 30001)->count();

        $range = [ $range1, $range2, $range3, $range4 ];

        $branches = HrBranch::where('team', $team)->get();
        $branchNames = array();
        $branchEmployees = array();

        foreach ( $branches as $branch ) {
            $branchNames[] = $branch->branch_name;
            $branchEmployees[] = $users->where('team', $team)->where('category', $branch->branch_name)->count();
        }

        $totalOnLeave = HrApplications::join('user', 'hr_applications.user_id', '=', 'user.user_id')
            ->whereDate('hr_applications.date_from', '<=', $dateToday)
            ->whereDate('hr_applications.date_to', '>=', $dateToday)
            ->where('hr_applications.is_deleted', 0)
            ->where('hr_applications.status', 'Approved')
            ->where('user.team', $team)
            ->get();

        $headCount = count($users);
        
        foreach ($users as $user) {
            $listOfUsers[] = $user->user_id;

            $attendanceList = HrAttendance::where('start_date', $dateToday)->where('type', '!=', 5)->where('is_deleted', 0)->get();

            foreach ($attendanceList as $attendance) {
                if ($attendance->user_id === $user->user_id) {
                    $totalPresent[] = $attendance->user_id;
                }
            }
        }

        $totalAbsent = count($listOfUsers) - (count($totalPresent) + count($totalOnLeave));
        
        if ($users->count() > 0) {
            $totalAge = 0;
            foreach ($users as $user) {
                $birthDate = strtotime($user->bdate);
                $age = date('Y') - date('Y', $birthDate);
          
                if (date('md', $birthDate) > date('md')) {
                    $age--;
                }
          
              $totalAge += $age;
            }
            $averageAge = $totalAge / $users->count();
            $averageAge = floor($totalAge / $users->count());
        }

        if ($users->count() > 0) {
            $totalTenure = 0;
            foreach ($users->where('date_hired') as $user) {
              $hireDate = strtotime($user->date_hired);
              $today = strtotime(date('Y-m-d'));

              $tenureInSeconds = $today - $hireDate;

              $tenureInYears = $tenureInSeconds / (365 * 24 * 60 * 60);
          
              $totalTenure += $tenureInYears;
            }

            if ( $totalTenure < 0 ) {
                $averageTenure = $totalTenure / $users->count();
                $averageTenure = round($totalTenure / $users->where('date_hired')->count(), 2);
            } else {
                $averageTenure = 0;
            }
        }

        $applications = HrApplications::where('status', 'Pending')->get();

        foreach ($applications as $applications) {
            if ( $applications->user->team === $team) {
                $totalApplications++;
            }
        }

        $totalAnnouncements = Category::where('category', 'announcements')->where('team', $team)->count();
        $totalTrainings     = Category::where('category', 'trainings')->where('team', $team)->count();

        return response()->json([
            'status' => 200,
            'present' => count($totalPresent),
            'absent' => $totalAbsent,
            'onLeave' => count($totalOnLeave),
            'workExist' => $workdaysList ? true : false,
            'averageAge' => $averageAge,
            'averageTenure' => $averageTenure,
            'totalApplications' => $totalApplications,
            'totalAnnouncements' => $totalAnnouncements,
            'totalTrainings' => $totalTrainings,
            'range' => $range,
            'branchNames' => $branchNames,
            'branchEmployees' => $branchEmployees,
            'headCount' => $headCount,
        ]);
    }

    public function getAttendances($dateToday)
    {
        $attendanceData = array();

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }


        $user = User::where('user_id', $userID)->first();

        if ($user->user_type === 'Super Admin') {

            $attendanceList = HrAttendance::join('user', 'hr_attendance.user_id', '=', 'user.user_id')
                ->where('hr_attendance.type', '!=', 5)
                ->whereDate('hr_attendance.start_date', $dateToday) // Use whereDate for comparing dates
                ->where('hr_attendance.is_deleted', 0)
                ->where('user.is_deleted', 0)
                ->where('user.user_type', 'Member')
                ->orderBy('user.lname') // You can chain orderBy for clarity
                ->orderBy('user.fname')
                ->orderBy('user.mname')
                ->get();

        } else {
            $attendanceList = DB::table('hr_attendance')
                ->select(DB::raw("*"))
                ->join('user', 'hr_attendance.user_id', '=', 'user.user_id')
                ->where('hr_attendance.type', '!=', 5)
                ->where('hr_attendance.start_date', $dateToday)
                ->where('hr_attendance.is_deleted', 0)
                ->where('user.is_deleted', 0)
                ->where('user.team', $user->team)
                ->where('user.user_type', 'Member')
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        }

        foreach ($attendanceList as $attendance) {
            $attendanceData[] = $attendance;
        }


        return response()->json([
            'status' => 200,
            'attendances' => $attendanceData

        ]);
    }

    public function getApplications($dateToday)
    {
        $day = date("d");
        $month = date("m");
        $year = date("Y");
        $applicationData = array();

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
            $applicationList = DB::table('hr_applications')
                ->select(DB::raw("*"), 'hr_workdays.status as AppStatus', 'hr_workdays.color as AppColor')
                ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
                ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
                ->whereRaw('DAY(created_at) = ?', [$day])
                ->whereRaw('MONTH(created_at) = ?', [$month])
                ->whereRaw('YEAR(created_at) = ?', [$year])
                ->where('user.user_type', 'Member')
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        } else {
            $applicationList = DB::table('hr_applications')
                ->select(DB::raw("*"), 'hr_workdays.status as AppStatus', 'hr_workdays.color as AppColor')
                ->join('hr_workdays', 'hr_applications.application_id', '=', 'hr_workdays.application_id')
                ->join('user', 'hr_applications.user_id', '=', 'user.user_id')
                ->whereRaw('DAY(created_at) = ?', [$day])
                ->whereRaw('MONTH(created_at) = ?', [$month])
                ->whereRaw('YEAR(created_at) = ?', [$year])
                ->where('user.team', $user->team)
                ->where('user.user_type', 'Member')
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get();
        }

        foreach ($applicationList as $application) {
            $applicationData[] = $application;
        }


        return response()->json([
            'status' => 200,
            'applications' => $applicationData
        ]);
    }

    public function getAnalytics($date)
    {
        $string_parts = explode(",", $date);
        $month = $string_parts[0];
        $year = $string_parts[1];

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($userTeam->user_type === 'Super Admin') {

            $users = DB::table('user')
                ->select(DB::raw("
            user.user_id,
            user.fname,
            user.mname,
            user.lname,
            user.profile_pic,
            user.department,
            user.user_type,
            user.hourly_rate,
            user.daily_rate,
            user.monthly_rate,
            user.work_days,
            user.category"))
                ->where('user_type', 'Member')
                ->where('is_deleted', '!=', 1)
                ->get();
        } else {

            $users = DB::table('user')
                ->select(DB::raw("
            user.user_id,
            user.fname,
            user.mname,
            user.lname,
            user.profile_pic,
            user.department,
            user.user_type,
            user.hourly_rate,
            user.daily_rate,
            user.monthly_rate,
            user.work_days,
            user.category"))
                ->where('team', $userTeam->team)
                ->where('user_type', 'Member')
                ->where('is_deleted', '!=', 1)
                ->get();
        }

        $months = array('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12');
        $all_months = array(
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July ',
            'August',
            'September',
            'October',
            'November',
            'December',
        );
        $current = date('F');
        $month_val = array_search($current, $all_months);

        // Get Application Chart
        $applications = 1;
        $application_january = 0;
        $application_february = 0;
        $application_march = 0;
        $application_april = 0;
        $application_may = 0;
        $application_june = 0;
        $application_july = 0;
        $application_august = 0;
        $application_september = 0;
        $application_october = 0;
        $application_november = 0;
        $application_december = 0;
        $totalApplications = array();

        $userIds = $users->pluck('user_id')->toArray();

        $applicationList = DB::table('hr_applications')
            ->selectRaw('user_id, date_to, app_hours')
            ->whereIn('user_id', $userIds)
            ->where('is_deleted', 0)
            ->where('status', 'Approved')
            ->whereRaw('MONTH(date_to) <= ?', [$month])
            ->whereRaw('YEAR(date_to) = ?', [$year])
            ->orderBy('date_to', 'ASC')
            ->get();

        foreach ($applicationList as $application) {
            if ($application->date_to != null) {
                $formattedStartdate = date("m", strtotime($application->date_to));
                $application_january += $formattedStartdate === '01' ? $application->app_hours : 0;
                $application_february += $formattedStartdate === '02' ? $application->app_hours : 0;
                $application_march += $formattedStartdate === '03' ? $application->app_hours : 0;
                $application_april += $formattedStartdate === '04' ? $application->app_hours : 0;
                $application_may += $formattedStartdate === '05' ? $application->app_hours : 0;
                $application_june += $formattedStartdate === '06' ? $application->app_hours : 0;
                $application_july += $formattedStartdate === '07' ? $application->app_hours : 0;
                $application_august += $formattedStartdate === '08' ? $application->app_hours : 0;
                $application_september += $formattedStartdate === '09' ? $application->app_hours : 0;
                $application_october += $formattedStartdate === '10' ? $application->app_hours : 0;
                $application_november += $formattedStartdate === '11' ? $application->app_hours : 0;
                $application_december += $formattedStartdate === '12' ? $application->app_hours : 0;
            }
        }

        $totalApplications[] = [
            'January' => $application_january,
            'February' => $application_february,
            'March' => $application_march,
            'April' => $application_april,
            'May' => $application_may,
            'June' => $application_june,
            'July' => $application_july,
            'August' => $application_august,
            'September' => $application_september,
            'October' => $application_october,
            'November' => $application_november,
            'December' => $application_december
        ];
        // END

        // Get Workdays Chart
        $workdays_january = 0;
        $workdays_february = 0;
        $workdays_march = 0;
        $workdays_april = 0;
        $workdays_may = 0;
        $workdays_june = 0;
        $workdays_july = 0;
        $workdays_august = 0;
        $workdays_september = 0;
        $workdays_october = 0;
        $workdays_november = 0;
        $workdays_december = 0;
        $totalWorkdays = array();

        $workdayList = DB::table('hr_workdays')
            ->selectRaw('start_date')
            ->where('type', '=', 1)
            ->where('team', '=', $userTeam->team)
            ->where('is_deleted', '=', 0)
            ->whereRaw('MONTH(start_date) <= ?', [$month])
            ->whereRaw('YEAR(start_date) = ?', [$year])
            ->orderBy('start_date', 'ASC')
            ->get();

        foreach ($workdayList as $workday) {
            $formattedStartdate = date("m", strtotime($workday->start_date));
            $workdays_january += $formattedStartdate === '01' ? 1 : 0;
            $workdays_february += $formattedStartdate === '02' ? 1 : 0;
            $workdays_march += $formattedStartdate === '03' ? 1 : 0;
            $workdays_april += $formattedStartdate === '04' ? 1 : 0;
            $workdays_may += $formattedStartdate === '05' ? 1 : 0;
            $workdays_june += $formattedStartdate === '06' ? 1 : 0;
            $workdays_july += $formattedStartdate === '07' ? 1 : 0;
            $workdays_august += $formattedStartdate === '08' ? 1 : 0;
            $workdays_september += $formattedStartdate === '09' ? 1 : 0;
            $workdays_october += $formattedStartdate === '10' ? 1 : 0;
            $workdays_november += $formattedStartdate === '11' ? 1 : 0;
            $workdays_december += $formattedStartdate === '12' ? 1 : 0;
        }

        if ($year === date('Y')) {
            // $num_days = cal_days_in_month(CAL_GREGORIAN,05,$year)
            $totalWorkdays[] = [
                'January' => $workdays_january,
                'February' => $workdays_february,
                'March' => $workdays_march,
                'April' => $workdays_april,
                'May' => $workdays_may,
                'June' =>  $workdays_june,
                'July' =>  $workdays_july,
                'August' => $workdays_august,
                'September' => $workdays_september,
                'October' =>  $workdays_october,
                'November' => $workdays_november,
                'December' =>  $workdays_december
            ];
        }
        // END

        // Get Absence Chart
        $totalAbsent = array();
        $workday_january = 0;
        $workday_february = 0;
        $workday_march = 0;
        $workday_april = 0;
        $workday_may = 0;
        $workday_june = 0;
        $workday_july = 0;
        $workday_august = 0;
        $workday_september = 0;
        $workday_october = 0;
        $workday_november = 0;
        $workday_december = 0;
        $attendance_january = 0;
        $attendance_february = 0;
        $attendance_march = 0;
        $attendance_april = 0;
        $attendance_may = 0;
        $attendance_june = 0;
        $attendance_july = 0;
        $attendance_august = 0;
        $attendance_september = 0;
        $attendance_october = 0;
        $attendance_november = 0;
        $attendance_december = 0;

        $workList = DB::table('hr_workdays')
            ->selectRaw('*')
            ->where('type', '=', 1)
            ->where('team', '=', $userTeam->team)
            ->where('is_deleted', '=', 0)
            ->whereRaw('MONTH(start_date) <= ?', [$month])
            ->whereRaw('YEAR(start_date) = ?', [$year])
            ->orderBy('start_date', 'ASC')
            ->get();

        foreach ($workList as $work) {
            $formattedStartdate = date("m", strtotime($work->start_date));
            $workday_january += $formattedStartdate === '01' ? 1 : 0;
            $workday_february += $formattedStartdate === '02' ? 1 : 0;
            $workday_march += $formattedStartdate === '03' ? 1 : 0;
            $workday_april += $formattedStartdate === '04' ? 1 : 0;
            $workday_may += $formattedStartdate === '05' ? 1 : 0;
            $workday_june += $formattedStartdate === '06' ? 1 : 0;
            $workday_july += $formattedStartdate === '07' ? 1 : 0;
            $workday_august += $formattedStartdate === '08' ? 1 : 0;
            $workday_september += $formattedStartdate === '09' ? 1 : 0;
            $workday_october += $formattedStartdate === '10' ? 1 : 0;
            $workday_november += $formattedStartdate === '11' ? 1 : 0;
            $workday_december += $formattedStartdate === '12' ? 1 : 0;
        }

        foreach ($users as $user) {
            for ($i = 0; $i <= $month_val; $i++) {
                $attendanceList = DB::table('hr_attendance')
                    ->selectRaw('*, count(*) as total_present')
                    ->where('user_id', $user->user_id)
                    ->where('type', '!=', 5)
                    ->where('is_deleted', '!=', 1)
                    ->whereRaw('MONTH(start_date) = ?', $months[$i])
                    ->whereRaw('YEAR(start_date) = ?', [$year])
                    ->orderBy('start_date', 'ASC')
                    ->get();

                foreach ($attendanceList as $attendance) {
                    $formattedStartdate = date("m", strtotime($attendance->start_date));
                    $attendance_january += $formattedStartdate === '01' ? $workday_january - ($workday_january !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_february += $formattedStartdate === '02' ? $workday_february - ($workday_february !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_march += $formattedStartdate === '03' ? $workday_march - ($workday_march !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_april += $formattedStartdate === '04' ? $workday_april - ($workday_april !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_may += $formattedStartdate === '05' ? $workday_may - ($workday_may !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_june += $formattedStartdate === '06' ? $workday_june - ($workday_june !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_july += $formattedStartdate === '07' ? $workday_july - ($workday_july !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_august += $formattedStartdate === '08' ? $workday_august - ($workday_august !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_september += $formattedStartdate === '09' ? $workday_september - ($workday_september !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_october += $formattedStartdate === '10' ? $workday_october - ($workday_october !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_november += $formattedStartdate === '11' ? $workday_november - ($workday_november !== 0 ? $attendance->total_present : 0) : 0;
                    $attendance_december += $formattedStartdate === '12' ? $workday_december - ($workday_december !== 0 ? $attendance->total_present : 0) : 0;
                }
            }
        }
        // $num_days = cal_days_in_month(CAL_GREGORIAN,05,$year)
        $totalAbsent[] = [
            'January' => $month_val >= 0 ? number_format((8 * $attendance_january) - $application_january, 2) : 0,
            'February' => $month_val >= 1 ? number_format((8 * $attendance_february) - $application_february, 2) : 0,
            'March' =>  $month_val >= 2 ? number_format((8 *  $attendance_march) - $application_march, 2) : 0,
            'April' =>  $month_val >= 3 ? number_format((8 * $attendance_april) - $application_april, 2) : 0,
            'May' =>  $month_val >= 4 ? number_format((8 * $attendance_may) - $application_may, 2) : 0,
            'June' =>  $month_val >= 5 ? number_format((8 * $attendance_june) - $application_june, 2) : 0,
            'July' =>  $month_val >= 6 ? number_format((8 * $attendance_july) - $application_july, 2) : 0,
            'August' =>  $month_val >= 7 ? number_format((8 * $attendance_august) - $application_august, 2) : 0,
            'September' =>  $month_val >= 8 ? number_format((8 * $attendance_september) - $application_september, 2) : 0,
            'October' =>  $month_val >= 9 ? number_format((8 * $attendance_october) - $application_october, 2) : 0,
            'November' =>  $month_val >= 10 ? number_format((8 * $attendance_november) - $application_november, 2) : 0,
            'December' =>  $month_val >= 11 ? number_format((8 * $attendance_december) - $application_december, 2) : 0
        ];
        // END

        // Get Tardiness/Undertime Chart
        $tardiness_january = 0;
        $tardiness_february = 0;
        $tardiness_march = 0;
        $tardiness_april = 0;
        $tardiness_may = 0;
        $tardiness_june = 0;
        $tardiness_july = 0;
        $tardiness_august = 0;
        $tardiness_september = 0;
        $tardiness_october = 0;
        $tardiness_november = 0;
        $tardiness_december = 0;
        $undertime_january = 0;
        $undertime_february = 0;
        $undertime_march = 0;
        $undertime_april = 0;
        $undertime_may = 0;
        $undertime_june = 0;
        $undertime_july = 0;
        $undertime_august = 0;
        $undertime_september = 0;
        $undertime_october = 0;
        $undertime_november = 0;
        $undertime_december = 0;
        $morning_minutes = 0;
        $afternoon_minutes = 0;
        $undertimeMorning = 0;
        $totalTardiness = array();
        $totalUndertime = array();
        $testArray = array();

        foreach ($users as $user) {
            if ($month != 0) {
                for ($i = 0; $i < $month_val; $i++) {
                    $tardinessList = DB::table('hr_attendance')
                        ->select(DB::raw("hr_attendance.*, hr_workdays.workday_id,
                        hr_workdays.hour_id, hr_workhours.*"))
                        ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                        ->join('hr_workhours', 'hr_workhours.hour_id', '=', 'hr_workdays.hour_id')
                        ->where('hr_attendance.user_id', $user->user_id)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', '!=', 1)
                        ->whereRaw('MONTH(hr_attendance.start_date) <= ?', [$month])
                        ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$year])
                        ->get();

                    foreach ($tardinessList as $tardiness) {
                        $morningDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_morning_in))->format('h A')));
                        $morningDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_morning_out))->format('h A')));
                        $morning_duty = Carbon::parse($morningDutyTime);
                        $morning_duty_out = Carbon::parse($morningDutyTime_out);
                        $morning_in = date("H:i:s", strtotime($tardiness->morning_in));
                        $morning_out = date("H:i:s", strtotime($tardiness->morning_out));
                        $morning_start = Carbon::parse($morning_in);
                        $morning_end = Carbon::parse($morning_out);

                        $afternoonDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_afternoon_in))->format('h A')));
                        $afternoonDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_afternoon_out))->format('h A')));
                        $afternoon_in = date("H:i:s", strtotime($tardiness->afternoon_in));
                        $afternoon_out = date("H:i:s", strtotime($tardiness->afternoon_out));
                        $afternoon_duty = Carbon::parse($afternoonDutyTime);
                        $afternoon_start = Carbon::parse($afternoon_in);
                        $afternoon_end = Carbon::parse($afternoon_out);


                        if ($morning_start > $morning_duty && $tardiness->morning_in != null && $tardiness->morning_out != null) {
                            $formattedStartdate = date("m", strtotime($tardiness->start_date));
                            $morning_minutes = $morning_start->diffInMinutes($morning_duty); // 226
                            if ($morning_minutes) {
                                $morning_hours = number_format($morning_minutes / 60, 2);
                                $tardiness_january += $formattedStartdate === '01' ? $morning_hours : 0;
                                $tardiness_february += $formattedStartdate === '02' ?  $morning_hours : 0;
                                $tardiness_march += $formattedStartdate === '03' ?  $morning_hours : 0;
                                $tardiness_april += $formattedStartdate === '04' ?  $morning_hours : 0;
                                $tardiness_may += $formattedStartdate === '05' ?  $morning_hours : 0;
                                $tardiness_june += $formattedStartdate === '06' ?  $morning_hours : 0;
                                $tardiness_july += $formattedStartdate === '07' ?  $morning_hours : 0;
                                $tardiness_august += $formattedStartdate === '08' ?  $morning_hours : 0;
                                $tardiness_september += $formattedStartdate === '09' ?  $morning_hours : 0;
                                $tardiness_october += $formattedStartdate === '10' ?  $morning_hours : 0;
                                $tardiness_november += $formattedStartdate === '11' ?  $morning_hours : 0;
                                $tardiness_december += $formattedStartdate === '12' ?  $morning_hours : 0;
                            }
                        }

                        if ($morning_end < $morning_duty_out && $tardiness->morning_in != null && $tardiness->morning_out != null) {
                            $undertimeMorning = $morning_end->diffInMinutes($morning_duty_out);
                            if ($undertimeMorning) {
                                $undertimeMorning_hours = number_format($undertimeMorning / 60, 2);
                                $undertime_january += $formattedStartdate === '01' ?  $undertimeMorning_hours : 0;
                                $undertime_february += $formattedStartdate === '02' ?  $undertimeMorning_hours : 0;
                                $undertime_march += $formattedStartdate === '03' ?  $undertimeMorning_hours : 0;
                                $undertime_april += $formattedStartdate === '04' ?  $undertimeMorning_hours : 0;
                                $undertime_may += $formattedStartdate === '05' ?  $undertimeMorning_hours : 0;
                                $undertime_june += $formattedStartdate === '06' ?  $undertimeMorning_hours : 0;
                                $undertime_july += $formattedStartdate === '07' ?  $undertimeMorning_hours : 0;
                                $undertime_august += $formattedStartdate === '08' ?  $undertimeMorning_hours : 0;
                                $undertime_september += $formattedStartdate === '09' ?  $undertimeMorning_hours : 0;
                                $undertime_october += $formattedStartdate === '10' ?  $undertimeMorning_hours : 0;
                                $undertime_november += $formattedStartdate === '11' ?  $undertimeMorning_hours : 0;
                                $undertime_december += $formattedStartdate === '12' ?  $undertimeMorning_hours : 0;
                            }
                        }

                        if ($afternoon_start > $afternoon_duty && $tardiness->afternoon_in != null && $tardiness->afternoon_out != null) {
                            $formattedStartdate = date("m", strtotime($tardiness->start_date));
                            $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty); // 226
                            if ($afternoon_minutes) {
                                $afternoon_hours = number_format($afternoon_minutes / 60, 2);
                                $tardiness_january += $formattedStartdate === '01' ?  $afternoon_hours : 0;
                                $tardiness_february += $formattedStartdate === '02' ?  $afternoon_hours : 0;
                                $tardiness_march += $formattedStartdate === '03' ?  $afternoon_hours : 0;
                                $tardiness_april += $formattedStartdate === '04' ?  $afternoon_hours : 0;
                                $tardiness_may += $formattedStartdate === '05' ?  $afternoon_hours : 0;
                                $tardiness_june += $formattedStartdate === '06' ?  $afternoon_hours : 0;
                                $tardiness_july += $formattedStartdate === '07' ?  $afternoon_hours : 0;
                                $tardiness_august += $formattedStartdate === '08' ?  $afternoon_hours : 0;
                                $tardiness_september += $formattedStartdate === '09' ?  $afternoon_hours : 0;
                                $tardiness_october += $formattedStartdate === '10' ?  $afternoon_hours : 0;
                                $tardiness_november += $formattedStartdate === '11' ?  $afternoon_hours : 0;
                                $tardiness_december += $formattedStartdate === '12' ?  $afternoon_hours : 0;
                            }
                        }

                        if ($afternoon_end < $afternoonDutyTime_out && $tardiness->afternoon_in != null && $tardiness->afternoon_out != null) {
                            $undertimeAfternoon = $afternoon_end->diffInMinutes($afternoonDutyTime_out);
                            if ($undertimeAfternoon) {
                                $undertimeAfternoon_hours = number_format($undertimeAfternoon / 60, 2);
                                $undertime_january += $formattedStartdate === '01' ?  $undertimeAfternoon_hours : 0;
                                $undertime_february += $formattedStartdate === '02' ?  $undertimeAfternoon_hours : 0;
                                $undertime_march += $formattedStartdate === '03' ?  $undertimeAfternoon_hours : 0;
                                $undertime_april += $formattedStartdate === '04' ?  $undertimeAfternoon_hours : 0;
                                $undertime_may += $formattedStartdate === '05' ?  $undertimeAfternoon_hours : 0;
                                $undertime_june += $formattedStartdate === '06' ?  $undertimeAfternoon_hours : 0;
                                $undertime_july += $formattedStartdate === '07' ?  $undertimeAfternoon_hours : 0;
                                $undertime_august += $formattedStartdate === '08' ?  $undertimeAfternoon_hours : 0;
                                $undertime_september += $formattedStartdate === '09' ?  $undertimeAfternoon_hours : 0;
                                $undertime_october += $formattedStartdate === '10' ?  $undertimeAfternoon_hours : 0;
                                $undertime_november += $formattedStartdate === '11' ?  $undertimeAfternoon_hours : 0;
                                $undertime_december += $formattedStartdate === '12' ?  $undertimeAfternoon_hours : 0;
                            }
                        }
                    }
                }
            } else {
                for ($i = 0; $i < $month_val; $i++) {
                    $tardinessList = DB::table('hr_attendance')
                        ->select(DB::raw("hr_attendance.*, hr_workdays.workday_id,
                        hr_workdays.hour_id,hr_workhours.*"))
                        ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                        ->join('hr_workhours', 'hr_workhours.hour_id', '=', 'hr_workdays.hour_id')
                        ->where('hr_attendance.user_id', $user->user_id)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', '!=', 1)
                        ->whereRaw('MONTH(hr_attendance.start_date) = ?', $months[$i])
                        ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$year])
                        ->get();

                    foreach ($tardinessList as $tardiness) {
                        $morningDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_morning_in))->format('h A')));
                        $morningDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_morning_out))->format('h A')));
                        $morning_duty = Carbon::parse($morningDutyTime);
                        $morning_duty_out = Carbon::parse($morningDutyTime_out);
                        $morning_in = date("H:i:s", strtotime($tardiness->morning_in));
                        $morning_out = date("H:i:s", strtotime($tardiness->morning_out));
                        $morning_start = Carbon::parse($morning_in);
                        $morning_end = Carbon::parse($morning_out);

                        $afternoonDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_afternoon_in))->format('h A')));
                        $afternoonDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($tardiness->hours_afternoon_out))->format('h A')));
                        $afternoon_in = date("H:i:s", strtotime($tardiness->afternoon_in));
                        $afternoon_out = date("H:i:s", strtotime($tardiness->afternoon_out));
                        $afternoon_duty = Carbon::parse($afternoonDutyTime);
                        $afternoon_start = Carbon::parse($afternoon_in);
                        $afternoon_end = Carbon::parse($afternoon_out);


                        if ($morning_start > $morning_duty && $tardiness->morning_in != null && $tardiness->morning_out != null) {
                            $formattedStartdate = date("m", strtotime($tardiness->start_date));
                            $morning_minutes = $morning_start->diffInMinutes($morning_duty); // 226
                            if ($morning_minutes) {
                                $morning_hours = number_format($morning_minutes / 60, 2);
                                $tardiness_january += $formattedStartdate === '01' ?  $morning_hours : 0;
                                $tardiness_february += $formattedStartdate === '02' ?  $morning_hours : 0;
                                $tardiness_march += $formattedStartdate === '03' ?  $morning_hours : 0;
                                $tardiness_april += $formattedStartdate === '04' ?  $morning_hours : 0;
                                $tardiness_may += $formattedStartdate === '05' ?  $morning_hours : 0;
                                $tardiness_june += $formattedStartdate === '06' ?  $morning_hours : 0;
                                $tardiness_july += $formattedStartdate === '07' ?  $morning_hours : 0;
                                $tardiness_august += $formattedStartdate === '08' ?  $morning_hours : 0;
                                $tardiness_september += $formattedStartdate === '09' ?  $morning_hours : 0;
                                $tardiness_october += $formattedStartdate === '10' ?  $morning_hours : 0;
                                $tardiness_november += $formattedStartdate === '11' ?  $morning_hours : 0;
                                $tardiness_december += $formattedStartdate === '12' ?  $morning_hours : 0;
                            }
                        }

                        if ($morning_end < $morning_duty_out && $tardiness->morning_in != null && $tardiness->morning_out != null) {
                            $undertimeMorning = $morning_end->diffInMinutes($morning_duty_out);
                            if ($undertimeMorning) {
                                $undertimeMorning_hours = number_format($undertimeMorning / 60, 2);
                                $undertime_january += $formattedStartdate === '01' ?  $undertimeMorning_hours : 0;
                                $undertime_february += $formattedStartdate === '02' ?  $undertimeMorning_hours : 0;
                                $undertime_march += $formattedStartdate === '03' ?  $undertimeMorning_hours : 0;
                                $undertime_april += $formattedStartdate === '04' ?  $undertimeMorning_hours : 0;
                                $undertime_may += $formattedStartdate === '05' ?  $undertimeMorning_hours : 0;
                                $undertime_june += $formattedStartdate === '06' ?  $undertimeMorning_hours : 0;
                                $undertime_july += $formattedStartdate === '07' ?  $undertimeMorning_hours : 0;
                                $undertime_august += $formattedStartdate === '08' ?  $undertimeMorning_hours : 0;
                                $undertime_september += $formattedStartdate === '09' ?  $undertimeMorning_hours : 0;
                                $undertime_october += $formattedStartdate === '10' ?  $undertimeMorning_hours : 0;
                                $undertime_november += $formattedStartdate === '11' ?  $undertimeMorning_hours : 0;
                                $undertime_december += $formattedStartdate === '12' ?  $undertimeMorning_hours : 0;
                            }
                        }

                        if ($afternoon_start > $afternoon_duty && $tardiness->afternoon_in != null && $tardiness->afternoon_out != null) {
                            $formattedStartdate = date("m", strtotime($tardiness->start_date));
                            $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty); // 226
                            if ($afternoon_minutes) {
                                $afternoon_hours = number_format($afternoon_minutes / 60, 2);
                                $tardiness_january += $formattedStartdate === '01' ?  $afternoon_hours : 0;
                                $tardiness_february += $formattedStartdate === '02' ?  $afternoon_hours : 0;
                                $tardiness_march += $formattedStartdate === '03' ?  $afternoon_hours : 0;
                                $tardiness_april += $formattedStartdate === '04' ?  $afternoon_hours : 0;
                                $tardiness_may += $formattedStartdate === '05' ?  $afternoon_hours : 0;
                                $tardiness_june += $formattedStartdate === '06' ?  $afternoon_hours : 0;
                                $tardiness_july += $formattedStartdate === '07' ?  $afternoon_hours : 0;
                                $tardiness_august += $formattedStartdate === '08' ?  $afternoon_hours : 0;
                                $tardiness_september += $formattedStartdate === '09' ?  $afternoon_hours : 0;
                                $tardiness_october += $formattedStartdate === '10' ?  $afternoon_hours : 0;
                                $tardiness_november += $formattedStartdate === '11' ?  $afternoon_hours : 0;
                                $tardiness_december += $formattedStartdate === '12' ?  $afternoon_hours : 0;
                            }
                        }

                        if ($afternoon_end < $afternoonDutyTime_out && $tardiness->afternoon_in != null && $tardiness->afternoon_out != null) {
                            $undertimeAfternoon = $afternoon_end->diffInMinutes($afternoonDutyTime_out);
                            if ($undertimeAfternoon) {
                                $undertimeAfternoon_hours = number_format($undertimeAfternoon / 60, 2);
                                $undertime_january += $formattedStartdate === '01' ?  $undertimeAfternoon_hours : 0;
                                $undertime_february += $formattedStartdate === '02' ?  $undertimeAfternoon_hours : 0;
                                $undertime_march += $formattedStartdate === '03' ?  $undertimeAfternoon_hours : 0;
                                $undertime_april += $formattedStartdate === '04' ?  $undertimeAfternoon_hours : 0;
                                $undertime_may += $formattedStartdate === '05' ?  $undertimeAfternoon_hours : 0;
                                $undertime_june += $formattedStartdate === '06' ?  $undertimeAfternoon_hours : 0;
                                $undertime_july += $formattedStartdate === '07' ?  $undertimeAfternoon_hours : 0;
                                $undertime_august += $formattedStartdate === '08' ?  $undertimeAfternoon_hours : 0;
                                $undertime_september += $formattedStartdate === '09' ?  $undertimeAfternoon_hours : 0;
                                $undertime_october += $formattedStartdate === '10' ?  $undertimeAfternoon_hours : 0;
                                $undertime_november += $formattedStartdate === '11' ?  $undertimeAfternoon_hours : 0;
                                $undertime_december += $formattedStartdate === '12' ?  $undertimeAfternoon_hours : 0;
                            }
                        }
                    }
                }
            }
        }

        $totalTardiness[] = [
            'January' => $tardiness_january,
            'February' => $tardiness_february,
            'March' => $tardiness_march,
            'April' => $tardiness_april,
            'May' => $tardiness_may,
            'June' => $tardiness_june,
            'July' => $tardiness_july,
            'August' => $tardiness_august,
            'September' => $tardiness_september,
            'October' => $tardiness_october,
            'November' => $tardiness_november,
            'December' => $tardiness_december
        ];

        $totalUndertime[] = [
            'January' => $month_val >= 0 ? $undertime_january : 0,
            'February' => $month_val >= 1 ? $undertime_february : 0,
            'March' =>  $month_val >= 2 ? $undertime_march : 0,
            'April' =>  $month_val >= 3 ? $undertime_april : 0,
            'May' =>  $month_val >= 4 ? $undertime_may : 0,
            'June' =>  $month_val >= 5 ? $undertime_june : 0,
            'July' =>  $month_val >= 6 ? $undertime_july : 0,
            'August' =>  $month_val >= 7 ? $undertime_august : 0,
            'September' =>  $month_val >= 8 ? $undertime_september : 0,
            'October' =>  $month_val >= 9 ? $undertime_october : 0,
            'November' =>  $month_val >= 10 ? $undertime_november : 0,
            'December' =>  $month_val >= 11 ? $undertime_december : 0
        ];
        // END

        // Get History Analytics Chart

        // Salaries
        $salaries_january = 0;
        $salaries_february = 0;
        $salaries_march = 0;
        $salaries_april = 0;
        $salaries_may = 0;
        $salaries_june = 0;
        $salaries_july = 0;
        $salaries_august = 0;
        $salaries_september = 0;
        $salaries_october = 0;
        $salaries_november = 0;
        $salaries_december = 0;
        $totalSalaries = array();
        //END

        // Deductions
        $deduction_january = 0;
        $deduction_february = 0;
        $deduction_march = 0;
        $deduction_april = 0;
        $deduction_may = 0;
        $deduction_june = 0;
        $deduction_july = 0;
        $deduction_august = 0;
        $deduction_september = 0;
        $deduction_october = 0;
        $deduction_november = 0;
        $deduction_december = 0;
        $totalDeduction = array();
        //END

        // Netpay
        $netpay_january = 0;
        $netpay_february = 0;
        $netpay_march = 0;
        $netpay_april = 0;
        $netpay_may = 0;
        $netpay_june = 0;
        $netpay_july = 0;
        $netpay_august = 0;
        $netpay_september = 0;
        $netpay_october = 0;
        $netpay_november = 0;
        $netpay_december = 0;
        $totalNetpay = array();
        //END

        // Benefits
        $benefits_january = 0;
        $benefits_february = 0;
        $benefits_march = 0;
        $benefits_april = 0;
        $benefits_may = 0;
        $benefits_june = 0;
        $benefits_july = 0;
        $benefits_august = 0;
        $benefits_september = 0;
        $benefits_october = 0;
        $benefits_november = 0;
        $benefits_december = 0;
        $totalBenefits = array();
        //END

        $usersList = array();
        foreach ($users as $user) {
            $usersList[] = $user;
            if ($month != 0) {
                $historyList = DB::table('hr_payroll_allrecords')
                    ->select(
                        'payroll_id',
                        'processtype',
                        'payroll_fromdate',
                        'payroll_todate',
                        'total_deduction',
                        'net_pay',
                        'total_earnings'
                    )
                    ->where('emp_id', '=', $user->user_id)
                    ->whereRaw('MONTH(payroll_todate) <= ?', [$month])
                    ->whereRaw('YEAR(payroll_fromdate) = ?', [$year])
                    ->orderBy('payroll_fromdate', 'asc')
                    ->get();

                foreach ($historyList as $history) {
                    $formattedStartdate = date("m", strtotime($history->payroll_todate));

                    $historyListbenefits = DB::table('hr_payroll_benefits')
                        ->select(
                            'hr_payroll_benefits.totalAmount'
                        )
                        ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_payroll_benefits.benefitlist_id')
                        ->where('hr_payroll_benefits.payroll_id', '=', $history->payroll_id)
                        ->where('hr_payroll_benefits.type', 1)
                        ->get();

                    foreach ($historyListbenefits as $historybenefits) {

                        // Benefits
                        $benefits_january += $formattedStartdate === '01' ? $historybenefits->totalAmount : 0;
                        $benefits_february += $formattedStartdate === '02' ? $historybenefits->totalAmount : 0;
                        $benefits_march += $formattedStartdate === '03' ? $historybenefits->totalAmount : 0;
                        $benefits_april += $formattedStartdate === '04' ? $historybenefits->totalAmount : 0;
                        $benefits_may += $formattedStartdate === '05' ? $historybenefits->totalAmount : 0;
                        $benefits_june += $formattedStartdate === '06' ? $historybenefits->totalAmount : 0;
                        $benefits_july += $formattedStartdate === '07' ? $historybenefits->totalAmount : 0;
                        $benefits_august += $formattedStartdate === '08' ? $historybenefits->totalAmount : 0;
                        $benefits_september += $formattedStartdate === '09' ? $historybenefits->totalAmount : 0;
                        $benefits_october += $formattedStartdate === '10' ? $historybenefits->totalAmount : 0;
                        $benefits_november += $formattedStartdate === '11' ? $historybenefits->totalAmount : 0;
                        $benefits_december += $formattedStartdate === '12' ? $historybenefits->totalAmount : 0;
                        //END
                    }
                    //Salary
                    $salaries_january += $formattedStartdate === '01' ? $history->total_earnings : 0;
                    $salaries_february += $formattedStartdate === '02' ? $history->total_earnings : 0;
                    $salaries_march += $formattedStartdate === '03' ? $history->total_earnings : 0;
                    $salaries_april += $formattedStartdate === '04' ? $history->total_earnings : 0;
                    $salaries_may += $formattedStartdate === '05' ? $history->total_earnings : 0;
                    $salaries_june += $formattedStartdate === '06' ? $history->total_earnings : 0;
                    $salaries_july += $formattedStartdate === '07' ? $history->total_earnings : 0;
                    $salaries_august += $formattedStartdate === '08' ? $history->total_earnings : 0;
                    $salaries_september += $formattedStartdate === '09' ? $history->total_earnings : 0;
                    $salaries_october += $formattedStartdate === '10' ? $history->total_earnings : 0;
                    $salaries_november += $formattedStartdate === '11' ? $history->total_earnings : 0;
                    $salaries_december += $formattedStartdate === '12' ? $history->total_earnings : 0;
                    //END
                    //Deduction
                    $deduction_january += $formattedStartdate === '01' ? $history->total_deduction : 0;
                    $deduction_february += $formattedStartdate === '02' ? $history->total_deduction : 0;
                    $deduction_march += $formattedStartdate === '03' ? $history->total_deduction : 0;
                    $deduction_april += $formattedStartdate === '04' ? $history->total_deduction : 0;
                    $deduction_may += $formattedStartdate === '05' ? $history->total_deduction : 0;
                    $deduction_june += $formattedStartdate === '06' ? $history->total_deduction : 0;
                    $deduction_july += $formattedStartdate === '07' ? $history->total_deduction : 0;
                    $deduction_august += $formattedStartdate === '08' ? $history->total_deduction : 0;
                    $deduction_september += $formattedStartdate === '09' ? $history->total_deduction : 0;
                    $deduction_october += $formattedStartdate === '10' ? $history->total_deduction : 0;
                    $deduction_november += $formattedStartdate === '11' ? $history->total_deduction : 0;
                    $deduction_december += $formattedStartdate === '12' ? $history->total_deduction : 0;
                    //END
                    //Netpay
                    $netpay_january += $formattedStartdate === '01' ? $history->net_pay : 0;
                    $netpay_february += $formattedStartdate === '02' ? $history->net_pay : 0;
                    $netpay_march += $formattedStartdate === '03' ? $history->net_pay : 0;
                    $netpay_april += $formattedStartdate === '04' ? $history->net_pay : 0;
                    $netpay_may += $formattedStartdate === '05' ? $history->net_pay : 0;
                    $netpay_june += $formattedStartdate === '06' ? $history->net_pay : 0;
                    $netpay_july += $formattedStartdate === '07' ? $history->net_pay : 0;
                    $netpay_august += $formattedStartdate === '08' ? $history->net_pay : 0;
                    $netpay_september += $formattedStartdate === '09' ? $history->net_pay : 0;
                    $netpay_october += $formattedStartdate === '10' ? $history->net_pay : 0;
                    $netpay_november += $formattedStartdate === '11' ? $history->net_pay : 0;
                    $netpay_december += $formattedStartdate === '12' ? $history->net_pay : 0;
                    //END

                }
            } else {
                for ($i = 0; $i < $month_val; $i++) {
                    $historyList = DB::table('hr_payroll_allrecords')
                        ->select(
                            'payroll_id',
                            'processtype',
                            'payroll_fromdate',
                            'payroll_todate',
                            'total_deduction',
                            'net_pay',
                            'total_earnings'
                        )
                        ->where('emp_id', '=', $user->user_id)
                        ->whereRaw('MONTH(payroll_todate) <= ?', $months[$i])
                        ->whereRaw('YEAR(payroll_fromdate) = ?', [$year])
                        ->orderBy('payroll_fromdate', 'asc')
                        ->get();

                    
                    foreach ($historyList as $history) {
                        $formattedStartdate = date("m", strtotime($history->payroll_todate));

                        $historyListbenefits = DB::table('hr_payroll_benefits')
                            ->select('hr_payroll_benefits.totalAmount')
                            ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_payroll_benefits.benefitlist_id')
                            ->where('hr_payroll_benefits.payroll_id', '=', $history->payroll_id)
                            ->where('hr_payroll_benefits.type', 1)
                            ->get();

                        foreach ($historyListbenefits as $historybenefits) {
                            // Benefits
                            $benefits_january += $formattedStartdate === '01' ? $historybenefits->totalAmount : 0;
                            $benefits_february += $formattedStartdate === '02' ? $historybenefits->totalAmount : 0;
                            $benefits_march += $formattedStartdate === '03' ? $historybenefits->totalAmount : 0;
                            $benefits_april += $formattedStartdate === '04' ? $historybenefits->totalAmount : 0;
                            $benefits_may += $formattedStartdate === '05' ? $historybenefits->totalAmount : 0;
                            $benefits_june += $formattedStartdate === '06' ? $historybenefits->totalAmount : 0;
                            $benefits_july += $formattedStartdate === '07' ? $historybenefits->totalAmount : 0;
                            $benefits_august += $formattedStartdate === '08' ? $historybenefits->totalAmount : 0;
                            $benefits_september += $formattedStartdate === '09' ? $historybenefits->totalAmount : 0;
                            $benefits_october += $formattedStartdate === '10' ? $historybenefits->totalAmount : 0;
                            $benefits_november += $formattedStartdate === '11' ? $historybenefits->totalAmount : 0;
                            $benefits_december += $formattedStartdate === '12' ? $historybenefits->totalAmount : 0;
                            //END
                        }

                        //Salary
                        $salaries_january += $formattedStartdate === '01' ? $history->total_earnings : 0;
                        $salaries_february += $formattedStartdate === '02' ? $history->total_earnings : 0;
                        $salaries_march += $formattedStartdate === '03' ? $history->total_earnings : 0;
                        $salaries_april += $formattedStartdate === '04' ? $history->total_earnings : 0;
                        $salaries_may += $formattedStartdate === '05' ? $history->total_earnings : 0;
                        $salaries_june += $formattedStartdate === '06' ? $history->total_earnings : 0;
                        $salaries_july += $formattedStartdate === '07' ? $history->total_earnings : 0;
                        $salaries_august += $formattedStartdate === '08' ? $history->total_earnings : 0;
                        $salaries_september += $formattedStartdate === '09' ? $history->total_earnings : 0;
                        $salaries_october += $formattedStartdate === '10' ? $history->total_earnings : 0;
                        $salaries_november += $formattedStartdate === '11' ? $history->total_earnings : 0;
                        $salaries_december += $formattedStartdate === '12' ? $history->total_earnings : 0;
                        //END

                        //Deduction
                        $deduction_january += $formattedStartdate === '01' ? $history->total_deduction : 0;
                        $deduction_february += $formattedStartdate === '02' ? $history->total_deduction : 0;
                        $deduction_march += $formattedStartdate === '03' ? $history->total_deduction : 0;
                        $deduction_april += $formattedStartdate === '04' ? $history->total_deduction : 0;
                        $deduction_may += $formattedStartdate === '05' ? $history->total_deduction : 0;
                        $deduction_june += $formattedStartdate === '06' ? $history->total_deduction : 0;
                        $deduction_july += $formattedStartdate === '07' ? $history->total_deduction : 0;
                        $deduction_august += $formattedStartdate === '08' ? $history->total_deduction : 0;
                        $deduction_september += $formattedStartdate === '09' ? $history->total_deduction : 0;
                        $deduction_october += $formattedStartdate === '10' ? $history->total_deduction : 0;
                        $deduction_november += $formattedStartdate === '11' ? $history->total_deduction : 0;
                        $deduction_december += $formattedStartdate === '12' ? $history->total_deduction : 0;
                        //END

                        //Netpay
                        $netpay_january += $formattedStartdate === '01' ? $history->net_pay : 0;
                        $netpay_february += $formattedStartdate === '02' ? $history->net_pay : 0;
                        $netpay_march += $formattedStartdate === '03' ? $history->net_pay : 0;
                        $netpay_april += $formattedStartdate === '04' ? $history->net_pay : 0;
                        $netpay_may += $formattedStartdate === '05' ? $history->net_pay : 0;
                        $netpay_june += $formattedStartdate === '06' ? $history->net_pay : 0;
                        $netpay_july += $formattedStartdate === '07' ? $history->net_pay : 0;
                        $netpay_august += $formattedStartdate === '08' ? $history->net_pay : 0;
                        $netpay_september += $formattedStartdate === '09' ? $history->net_pay : 0;
                        $netpay_october += $formattedStartdate === '10' ? $history->net_pay : 0;
                        $netpay_november += $formattedStartdate === '11' ? $history->net_pay : 0;
                        $netpay_december += $formattedStartdate === '12' ? $history->net_pay : 0;
                        //END
                    }
                }
            }
        }

        $totalSalaries[] = [
            'January' => $salaries_january,
            'February' => $salaries_february,
            'March' => $salaries_march,
            'April' => $salaries_april,
            'May' => $salaries_may,
            'June' => $salaries_june,
            'July' => $salaries_july,
            'August' => $salaries_august,
            'September' => $salaries_september,
            'October' => $salaries_october,
            'November' => $salaries_november,
            'December' => $salaries_december
        ];

        $totalDeduction[] = [
            'January' =>  $deduction_january,
            'February' =>  $deduction_february,
            'March' =>   $deduction_march,
            'April' =>   $deduction_april,
            'May' =>   $deduction_may,
            'June' =>   $deduction_june,
            'July' =>   $deduction_july,
            'August' =>   $deduction_august,
            'September' =>   $deduction_september,
            'October' =>  $deduction_october,
            'November' =>  $deduction_november,
            'December' =>  $deduction_december
        ];

        $totalNetpay[] = [
            'January' =>  $netpay_january,
            'February' =>  $netpay_february,
            'March' =>   $netpay_march,
            'April' =>   $netpay_april,
            'May' =>   $netpay_may,
            'June' =>   $netpay_june,
            'July' =>   $netpay_july,
            'August' =>   $netpay_august,
            'September' =>   $netpay_september,
            'October' =>  $netpay_october,
            'November' =>  $netpay_november,
            'December' =>  $netpay_december
        ];

        $totalBenefits[] = [
            'January' =>  $benefits_january,
            'February' =>  $benefits_february,
            'March' =>   $benefits_march,
            'April' =>   $benefits_april,
            'May' =>   $benefits_may,
            'June' =>   $benefits_june,
            'July' =>   $benefits_july,
            'August' =>   $benefits_august,
            'September' =>   $benefits_september,
            'October' =>  $benefits_october,
            'November' =>  $benefits_november,
            'December' =>  $benefits_december
        ];
        // END

        return response()->json([
            'status' => 200,
            'totalApplications' => $totalApplications[0] ?? null,
            'totalAbsences' => $totalAbsent[0] ?? null,
            'totalTardiness' => $totalTardiness[0] ?? null,
            'totalUndertime' => $totalUndertime[0] ?? null,
            'totalWorkdays' => $totalWorkdays[0] ?? null,
            'totalSalaries' => $totalSalaries[0] ?? null,
            'totalDeduction' => $totalDeduction[0] ?? null,
            'totalNetpay' => $totalNetpay[0] ?? null,
            'totalBenefits' => $totalBenefits[0] ?? null,
            'totalUsers' => $usersList
        ]);
    }
}
