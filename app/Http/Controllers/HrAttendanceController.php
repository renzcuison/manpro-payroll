<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\HrWorkshifts;
use App\Models\HrWorkday;
use App\Models\HrWorkhour;
use App\Models\HrAttendance;

use DateTime;
use Exception;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

function computeMinutes($min)
{
    $h = floor($min / 60);
    $m = $min - ($h * 60);
    return  $h . 'hrs' . ' ' . $m . 'min';
}

function computeDay($min)
{
    $h = floor($min / 60);
    return  $h . 'hrs';
}
class HrAttendanceController extends Controller
{

    public function getAllAttendance(Request $request, $id)
    {
        // log::info("HrAttendanceController::getAllAttendance");

        $validated = $request->validate([
            'month' => 'required|max:255',
            'year' => 'required|max:255'
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $workdaysCount = DB::table('hr_workdays')
            ->select(DB::raw("*"))
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            ->where('team', '=', $userTeam->team)
            ->whereRaw('MONTH(start_date) = ?', [$validated['month']])
            ->whereRaw('YEAR(start_date) = ?', [$validated['year']])
            ->orderBy('start_date', 'ASC')
            ->get();

        if ($userTeam->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $users = DB::table('user')
                ->select(DB::raw("
        user.user_id,
        user.fname,
        user.mname,
        user.lname,
        user.profile_pic,
        user.department,
        user.work_days,
        user.user_type,
        user.category"))
                ->where('is_deleted', '=', 0)
                ->where('team', $admin->team)
                ->where('user_type', 'Member')
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
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
        user.work_days,
        user.user_type,
        user.category"))
                ->where('is_deleted', '=', 0)
                ->where('team', $userTeam->team)
                ->where('user_type', 'Member')
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }

        $totalAttendance = array();
        foreach ($users as $user) {
            $computeTardiness = 0;
            $tardiness = 0;
            $sumduty = 0;
            $attendance_id = '';
            $morningRecords = 0;
            $countDutyDays = 0;
            $afternoonRecords = 0;
            $timeDiff = array();
            $countAbsences = 0;
            $halfdayMinutes = 0;

            $dutyHours = DB::table('hr_attendance')
                ->select(DB::raw("
                hr_attendance.start_date,
                hr_attendance.attdn_id,
                hr_attendance.user_id,
                hr_attendance.morning_in,
                hr_attendance.morning_out,
                hr_attendance.afternoon_in,
                hr_attendance.afternoon_out,
                hr_workdays.workday_id,
                hr_workdays.hour_id,
                hr_workhours.*"))
                ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                ->join('hr_workhours', 'hr_workhours.hr_workshift_id', '=', 'hr_workdays.hr_workshift_id')
                ->where('hr_attendance.user_id', $user->user_id)
                ->where('hr_attendance.type', '!=', 5)
                ->where('hr_attendance.is_deleted', 0)
                ->whereRaw('MONTH(hr_attendance.start_date) = ?', [$validated['month']])
                ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$validated['year']])
                ->orderBy('hr_attendance.start_date', 'ASC')
                ->get();

            if (!empty($dutyHours)) {
                foreach ($dutyHours as $res) {

                    // log::info($res->hours_morning_in);

                    $attendance_id = $res->attdn_id;
                    $morningDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_morning_in))->format('h A')));
                    $morning_in = date("H:i:s", strtotime($res->morning_in));
                    $morning_out = date("H:i:s", strtotime($res->morning_out));
                    $morning_duty = Carbon::parse($morningDutyTime);
                    $morning_start = Carbon::parse($morning_in);

                    if ($res->morning_in != null || $res->morning_out != null) {
                        $morning_minutes = $morning_start->diffInMinutes($morning_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $morning_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $morningRecords += $morning_minutes;
                    $afternoonDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_afternoon_in))->format('h A')));
                    $afternoon_in = date("H:i:s", strtotime($res->afternoon_in));
                    $afternoon_out = date("H:i:s", strtotime($res->afternoon_out));
                    $afternoon_duty = Carbon::parse($afternoonDutyTime);
                    $afternoon_start = Carbon::parse($afternoon_in);

                    if ($res->afternoon_in != null || $res->afternoon_out != null) {
                        $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $afternoon_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $afternoonRecords += $afternoon_minutes;
                    $minutes =  $morning_minutes + $afternoon_minutes;
                    $timeDiff[] = number_format($minutes / 60, 2);

                    if ($morning_start > $morning_duty) {
                        if ($morning_minutes != null && $morning_minutes < 240) {
                            $computeTardiness +=  $morning_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    if ($afternoon_start > $afternoon_duty) {
                        if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                            $computeTardiness +=  $afternoon_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    $countDutyDays++;
                }
                $sumduty += $halfdayMinutes;
                $total_dutyhours = computeDay($sumduty);

                $totalComputeDays = count($workdaysCount) - $countDutyDays;
                $absenceMinute =  $totalComputeDays * 480;


                $computeTotalhrs =  ($sumduty - $computeTardiness) > ($absenceMinute + $countAbsences) ? ($sumduty - $computeTardiness) - ($absenceMinute + $countAbsences) : ($absenceMinute + $countAbsences) - ($sumduty - $computeTardiness);
                $totalhrs = computeMinutes($computeTotalhrs);

                $attendance_details = array('user_type' => $user->user_type, 'attdn_id' => $attendance_id, 'user_id' => $user->user_id, 'fname' => $user->fname, 'mname' => $user->mname, 'lname' => $user->lname, 'profile_pic' => $user->profile_pic, 'department' => $user->department, 'category' => $user->category, 'dutyHours' => $total_dutyhours, 'tardiness' => $tardiness, 'absences' => computeDay($absenceMinute + $countAbsences), 'totalHours' => $totalhrs, 'attendances' => $dutyHours, 'MonthVal' => $validated['month'], 'YearVal' => $validated['year'], 'dutydays' => $countDutyDays);
                if ($timeDiff) {
                    array_push($totalAttendance, $attendance_details);
                }
            } else {
                array_push($totalAttendance, ['user_type' => '', 'attdn_id' => '', 'user_id' => '', 'fname' => '', 'mname' => '', 'lname' => '', 'profile_pic' => '', 'department' => '', 'category' => '', 'dutyHours' => '', 'tardiness' => '', 'absences' => '', 'totalHours' => '', 'attendances' => '']);
            }
        }

        return response()->json([
            'status' => 200,
            'attendance' => $totalAttendance,
            'test' => count($workdaysCount)
        ]);
    }

    public function getTodayPresent(Request $request)
    {
        // log::info("HrAttendanceController::getTodayPresent");

        $validated = $request->validate([
            'day' => 'required|max:255',
            'month' => 'required|max:255',
            'year' => 'required|max:255'
        ]);

        $currentDate = date('Y-m-d', strtotime($validated['year'] . '-' . $validated['month'] . '-' . $validated['day']));

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $workdaysCount = DB::table('hr_workdays')
            ->select(DB::raw("*"))
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            ->where('team', '=', $userTeam->team)
            ->whereRaw('MONTH(start_date) = ?', [$validated['month']])
            ->whereRaw('YEAR(start_date) = ?', [$validated['year']])
            ->orderBy('start_date', 'ASC')
            ->get();

        if ($userTeam->user_type === 'Super Admin') {
            $users = DB::table('user')
                ->select('user_id', 'fname', 'mname', 'lname', 'profile_pic', 'department', 'work_days', 'user_type', 'category', 'hourly_rate', 'daily_rate', 'monthly_rate')
                ->where('is_deleted', '=', 0)
                ->where('user_type', 'Member')
                ->whereExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_attendance')
                        ->whereRaw('user.user_id = hr_attendance.user_id')
                        ->whereDate('hr_attendance.start_date', '=', $currentDate)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', 0);
                })
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        } else {
            $users = DB::table('user')
                ->select('user_id', 'fname', 'mname', 'lname', 'profile_pic', 'department', 'work_days', 'user_type', 'category', 'hourly_rate', 'daily_rate', 'monthly_rate')
                ->where('is_deleted', '=', 0)
                ->where('team', $userTeam->team)
                ->where('user_type', 'Member')
                ->whereExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_attendance')
                        ->whereRaw('user.user_id = hr_attendance.user_id')
                        ->whereDate('hr_attendance.start_date', '=', $currentDate)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', 0);
                })
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }

        $totalAttendance = array();
        foreach ($users as $user) {
            $computeTardiness = 0;
            $tardiness = 0;
            $sumduty = 0;
            $attendance_id = '';
            $morningRecords = 0;
            $countDutyDays = 0;
            $afternoonRecords = 0;
            $timeDiff = array();
            $countAbsences = 0;
            $halfdayMinutes = 0;
            $dutyHours = DB::table('hr_attendance')
                ->select(DB::raw("
                hr_attendance.start_date,
                hr_attendance.attdn_id,
                hr_attendance.user_id,
                hr_attendance.morning_in,
                hr_attendance.morning_out,
                hr_attendance.afternoon_in,
                hr_attendance.afternoon_out,
                hr_workdays.workday_id,
                hr_workdays.hour_id,
                hr_workhours.*"))
                ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                ->join('hr_workhours', 'hr_workhours.hr_workshift_id', '=', 'hr_workdays.hr_workshift_id')
                ->where('hr_attendance.user_id', $user->user_id)
                ->where('hr_attendance.type', '!=', 5)
                ->where('hr_attendance.is_deleted', 0)
                ->whereRaw('MONTH(hr_attendance.start_date) = ?', [$validated['month']])
                ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$validated['year']])
                ->orderBy('hr_attendance.start_date', 'ASC')
                ->get();

            if (!empty($dutyHours)) {
                foreach ($dutyHours as $res) {

                    $attendance_id = $res->attdn_id;
                    $morningDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_morning_in))->format('h A')));
                    $morning_in = date("H:i:s", strtotime($res->morning_in));
                    $morning_out = date("H:i:s", strtotime($res->morning_out));
                    $morning_duty = Carbon::parse($morningDutyTime);
                    $morning_start = Carbon::parse($morning_in);

                    if ($res->morning_in != null || $res->morning_out != null) {
                        $morning_minutes = $morning_start->diffInMinutes($morning_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $morning_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $morningRecords += $morning_minutes;
                    $afternoonDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_afternoon_in))->format('h A')));
                    $afternoon_in = date("H:i:s", strtotime($res->afternoon_in));
                    $afternoon_out = date("H:i:s", strtotime($res->afternoon_out));
                    $afternoon_duty = Carbon::parse($afternoonDutyTime);
                    $afternoon_start = Carbon::parse($afternoon_in);

                    if ($res->afternoon_in != null || $res->afternoon_out != null) {
                        $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $afternoon_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $afternoonRecords += $afternoon_minutes;
                    $minutes =  $morning_minutes + $afternoon_minutes;
                    $timeDiff[] = number_format($minutes / 60, 2);

                    if ($morning_start > $morning_duty) {
                        if ($morning_minutes != null && $morning_minutes < 240) {
                            $computeTardiness +=  $morning_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    if ($afternoon_start > $afternoon_duty) {
                        if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                            $computeTardiness +=  $afternoon_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    $countDutyDays++;
                }
                $sumduty += $halfdayMinutes;
                $total_dutyhours = computeDay($sumduty);

                $totalComputeDays = count($workdaysCount) - $countDutyDays;
                $absenceMinute =  $totalComputeDays * 480;


                $computeTotalhrs =  ($sumduty - $computeTardiness) > ($absenceMinute + $countAbsences) ? ($sumduty - $computeTardiness) - ($absenceMinute + $countAbsences) : ($absenceMinute + $countAbsences) - ($sumduty - $computeTardiness);
                $totalhrs = computeMinutes($computeTotalhrs);

                $attendance_details = array('user_type' => $user->user_type, 'attdn_id' => $attendance_id, 'user_id' => $user->user_id, 'fname' => $user->fname, 'mname' => $user->mname, 'lname' => $user->lname, 'profile_pic' => $user->profile_pic, 'department' => $user->department, 'category' => $user->category, 'dutyHours' => $total_dutyhours, 'tardiness' => $tardiness, 'absences' => computeDay($absenceMinute + $countAbsences), 'totalHours' => $totalhrs, 'attendances' => $dutyHours, 'MonthVal' => $validated['month'], 'YearVal' => $validated['year'], 'dutydays' => $countDutyDays);
                if ($timeDiff) {
                    array_push($totalAttendance, $attendance_details);
                }
            } else {
                array_push($totalAttendance, ['user_type' => '', 'attdn_id' => '', 'user_id' => '', 'fname' => '', 'mname' => '', 'lname' => '', 'profile_pic' => '', 'department' => '', 'category' => '', 'dutyHours' => '', 'tardiness' => '', 'absences' => '', 'totalHours' => '', 'attendances' => '']);
            }
        }

        return response()->json([
            'status' => 200,
            'attendance' => $totalAttendance,
            'test' => count($workdaysCount)
        ]);
    }

    public function getTodayAbsent(Request $request)
    {
        // log::info("HrAttendanceController::getTodayAbsent");

        $validated = $request->validate([
            'day' => 'required|max:255',
            'month' => 'required|max:255',
            'year' => 'required|max:255'
        ]);

        $currentDate = date('Y-m-d', strtotime($validated['year'] . '-' . $validated['month'] . '-' . $validated['day']));

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $workdaysCount = DB::table('hr_workdays')
            ->select(DB::raw("*"))
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            ->where('team', '=', $userTeam->team)
            ->whereRaw('MONTH(start_date) = ?', [$validated['month']])
            ->whereRaw('YEAR(start_date) = ?', [$validated['year']])
            ->orderBy('start_date', 'ASC')
            ->get();

        if ($userTeam->user_type === 'Super Admin') {
            $absentUsers = DB::table('user')
                ->select('user_id', 'fname', 'mname', 'lname', 'profile_pic', 'department', 'work_days', 'user_type', 'category', 'hourly_rate', 'daily_rate', 'monthly_rate')
                ->where('is_deleted', '=', 0)
                ->where('user_type', 'Member')
                ->whereNotExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_attendance')
                        ->whereRaw('user.user_id = hr_attendance.user_id')
                        ->whereDate('hr_attendance.start_date', '=', $currentDate)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', 0);
                })
                ->whereNotExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_applications')
                        ->whereRaw('user.user_id = hr_applications.user_id')
                        ->whereDate('hr_applications.date_from', '=', $currentDate)
                        ->where('hr_applications.status', 'Approved')
                        ->where('hr_applications.is_deleted', 0);
                })
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        } else {
            $absentUsers = DB::table('user')
                ->select('user_id', 'fname', 'mname', 'lname', 'profile_pic', 'department', 'work_days', 'user_type', 'category', 'hourly_rate', 'daily_rate', 'monthly_rate')
                ->where('is_deleted', '=', 0)
                ->where('team', $userTeam->team)
                ->where('user_type', 'Member')
                ->whereNotExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_attendance')
                        ->whereRaw('user.user_id = hr_attendance.user_id')
                        ->whereDate('hr_attendance.start_date', '=', $currentDate)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', 0);
                })
                ->whereNotExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_applications')
                        ->whereRaw('user.user_id = hr_applications.user_id')
                        ->whereDate('hr_applications.date_from', '=', $currentDate)
                        ->where('hr_applications.status', 'Approved')
                        ->where('hr_applications.is_deleted', 0);
                })
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }

        $totalAttendance = array();
        foreach ($absentUsers as $user) {
            $computeTardiness = 0;
            $tardiness = 0;
            $sumduty = 0;
            $attendance_id = '';
            $morningRecords = 0;
            $countDutyDays = 0;
            $afternoonRecords = 0;
            $timeDiff = array();
            $countAbsences = 0;
            $halfdayMinutes = 0;
            $dutyHours = DB::table('hr_attendance')
                ->select(DB::raw("
                hr_attendance.start_date,
                hr_attendance.attdn_id,
                hr_attendance.user_id,
                hr_attendance.morning_in,
                hr_attendance.morning_out,
                hr_attendance.afternoon_in,
                hr_attendance.afternoon_out,
                hr_workdays.workday_id,
                hr_workdays.hour_id,
                hr_workhours.*"))
                ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                ->join('hr_workhours', 'hr_workhours.hr_workshift_id', '=', 'hr_workdays.hr_workshift_id')
                ->where('hr_attendance.user_id', $user->user_id)
                ->where('hr_attendance.type', '!=', 5)
                ->where('hr_attendance.is_deleted', 0)
                ->whereRaw('MONTH(hr_attendance.start_date) = ?', [$validated['month']])
                ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$validated['year']])
                ->orderBy('hr_attendance.start_date', 'ASC')
                ->get();

            if (!empty($dutyHours)) {
                foreach ($dutyHours as $res) {
                    $attendance_id = $res->attdn_id;
                    $morningDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_morning_in))->format('h A')));
                    $morning_in = date("H:i:s", strtotime($res->morning_in));
                    $morning_out = date("H:i:s", strtotime($res->morning_out));
                    $morning_duty = Carbon::parse($morningDutyTime);
                    $morning_start = Carbon::parse($morning_in);

                    if ($res->morning_in != null || $res->morning_out != null) {
                        $morning_minutes = $morning_start->diffInMinutes($morning_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $morning_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $morningRecords += $morning_minutes;
                    $afternoonDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_afternoon_in))->format('h A')));
                    $afternoon_in = date("H:i:s", strtotime($res->afternoon_in));
                    $afternoon_out = date("H:i:s", strtotime($res->afternoon_out));
                    $afternoon_duty = Carbon::parse($afternoonDutyTime);
                    $afternoon_start = Carbon::parse($afternoon_in);

                    if ($res->afternoon_in != null || $res->afternoon_out != null) {
                        $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $afternoon_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $afternoonRecords += $afternoon_minutes;
                    $minutes =  $morning_minutes + $afternoon_minutes;
                    $timeDiff[] = number_format($minutes / 60, 2);

                    if ($morning_start > $morning_duty) {
                        if ($morning_minutes != null && $morning_minutes < 240) {
                            $computeTardiness +=  $morning_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    if ($afternoon_start > $afternoon_duty) {
                        if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                            $computeTardiness +=  $afternoon_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    $countDutyDays++;
                }
                $sumduty += $halfdayMinutes;
                $total_dutyhours = computeDay($sumduty);

                $totalComputeDays = count($workdaysCount) - $countDutyDays;
                $absenceMinute =  $totalComputeDays * 480;


                $computeTotalhrs =  ($sumduty - $computeTardiness) > ($absenceMinute + $countAbsences) ? ($sumduty - $computeTardiness) - ($absenceMinute + $countAbsences) : ($absenceMinute + $countAbsences) - ($sumduty - $computeTardiness);
                $totalhrs = computeMinutes($computeTotalhrs);

                $attendance_details = array('user_type' => $user->user_type, 'attdn_id' => $attendance_id, 'user_id' => $user->user_id, 'fname' => $user->fname, 'mname' => $user->mname, 'lname' => $user->lname, 'profile_pic' => $user->profile_pic, 'department' => $user->department, 'category' => $user->category, 'dutyHours' => $total_dutyhours, 'tardiness' => $tardiness, 'absences' => computeDay($absenceMinute + $countAbsences), 'totalHours' => $totalhrs, 'attendances' => $dutyHours, 'MonthVal' => $validated['month'], 'YearVal' => $validated['year'], 'dutydays' => $countDutyDays);
                if ($timeDiff) {
                    array_push($totalAttendance, $attendance_details);
                }
            } else {
                array_push($totalAttendance, ['user_type' => '', 'attdn_id' => '', 'user_id' => '', 'fname' => '', 'mname' => '', 'lname' => '', 'profile_pic' => '', 'department' => '', 'category' => '', 'dutyHours' => '', 'tardiness' => '', 'absences' => '', 'totalHours' => '', 'attendances' => '']);
            }
        }

        return response()->json([
            'status' => 200,
            'attendance' => $totalAttendance,
            'test' => count($workdaysCount)
        ]);
    }

    public function getTodayLeave(Request $request)
    {
        // log::info("HrAttendanceController::getTodayLeave");

        $validated = $request->validate([
            'day' => 'required|max:255',
            'month' => 'required|max:255',
            'year' => 'required|max:255'
        ]);

        $currentDate = date('Y-m-d', strtotime($validated['year'] . '-' . $validated['month'] . '-' . $validated['day']));

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $workdaysCount = DB::table('hr_workdays')
            ->select(DB::raw("*"))
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            ->where('team', '=', $userTeam->team)
            ->whereRaw('MONTH(start_date) = ?', [$validated['month']])
            ->whereRaw('YEAR(start_date) = ?', [$validated['year']])
            ->orderBy('start_date', 'ASC')
            ->get();

        if ($userTeam->user_type === 'Super Admin') {
            $absentUsers = DB::table('user')
                ->select('user_id', 'fname', 'mname', 'lname', 'profile_pic', 'department', 'work_days', 'user_type', 'category', 'hourly_rate', 'daily_rate', 'monthly_rate')
                ->where('is_deleted', '=', 0)
                ->where('user_type', 'Member')
                ->whereNotExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_attendance')
                        ->whereRaw('user.user_id = hr_attendance.user_id')
                        ->whereDate('hr_attendance.start_date', '=', $currentDate)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', 0);
                })
                ->whereExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_applications')
                        ->whereRaw('user.user_id = hr_applications.user_id')
                        ->whereDate('hr_applications.date_from', '=', $currentDate)
                        ->where('hr_applications.status', 'Approved')
                        ->where('hr_applications.is_deleted', 0);
                })
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        } else {
            $absentUsers = DB::table('user')
                ->select('user_id', 'fname', 'mname', 'lname', 'profile_pic', 'department', 'work_days', 'user_type', 'category', 'hourly_rate', 'daily_rate', 'monthly_rate')
                ->where('is_deleted', '=', 0)
                ->where('team', $userTeam->team)
                ->where('user_type', 'Member')
                ->whereNotExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_attendance')
                        ->whereRaw('user.user_id = hr_attendance.user_id')
                        ->whereDate('hr_attendance.start_date', '=', $currentDate)
                        ->where('hr_attendance.type', '!=', 5)
                        ->where('hr_attendance.is_deleted', 0);
                })
                ->whereExists(function ($query) use ($currentDate) {
                    $query->select(DB::raw(1))
                        ->from('hr_applications')
                        ->whereRaw('user.user_id = hr_applications.user_id')
                        ->whereDate('hr_applications.date_from', '=', $currentDate)
                        ->where('hr_applications.status', 'Approved')
                        ->where('hr_applications.is_deleted', 0);
                })
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }

        $totalAttendance = array();
        foreach ($absentUsers as $user) {
            $computeTardiness = 0;
            $tardiness = 0;
            $sumduty = 0;
            $attendance_id = '';
            $morningRecords = 0;
            $countDutyDays = 0;
            $afternoonRecords = 0;
            $timeDiff = array();
            $countAbsences = 0;
            $halfdayMinutes = 0;
            $dutyHours = DB::table('hr_attendance')
                ->select(DB::raw("
                hr_attendance.start_date,
                hr_attendance.attdn_id,
                hr_attendance.user_id,
                hr_attendance.morning_in,
                hr_attendance.morning_out,
                hr_attendance.afternoon_in,
                hr_attendance.afternoon_out,
                hr_workdays.workday_id,
                hr_workdays.hour_id,
                hr_workhours.*"))
                ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                ->join('hr_workhours', 'hr_workhours.hr_workshift_id', '=', 'hr_workdays.hr_workshift_id')
                ->where('hr_attendance.user_id', $user->user_id)
                ->where('hr_attendance.type', '!=', 5)
                ->where('hr_attendance.is_deleted', 0)
                ->whereRaw('MONTH(hr_attendance.start_date) = ?', [$validated['month']])
                ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$validated['year']])
                ->orderBy('hr_attendance.start_date', 'ASC')
                ->get();

            if (!empty($dutyHours)) {
                foreach ($dutyHours as $res) {
                    $attendance_id = $res->attdn_id;
                    $morningDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_morning_in))->format('h A')));
                    $morning_in = date("H:i:s", strtotime($res->morning_in));
                    $morning_out = date("H:i:s", strtotime($res->morning_out));
                    $morning_duty = Carbon::parse($morningDutyTime);
                    $morning_start = Carbon::parse($morning_in);

                    if ($res->morning_in != null || $res->morning_out != null) {
                        $morning_minutes = $morning_start->diffInMinutes($morning_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $morning_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $morningRecords += $morning_minutes;
                    $afternoonDutyTime = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_afternoon_in))->format('h A')));
                    $afternoon_in = date("H:i:s", strtotime($res->afternoon_in));
                    $afternoon_out = date("H:i:s", strtotime($res->afternoon_out));
                    $afternoon_duty = Carbon::parse($afternoonDutyTime);
                    $afternoon_start = Carbon::parse($afternoon_in);

                    if ($res->afternoon_in != null || $res->afternoon_out != null) {
                        $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty); // 226
                        $halfdayMinutes += 240;
                    } else {
                        $afternoon_minutes = 240;
                        $halfdayMinutes += 240;
                        $countAbsences += 240;
                    }

                    $afternoonRecords += $afternoon_minutes;
                    $minutes =  $morning_minutes + $afternoon_minutes;
                    $timeDiff[] = number_format($minutes / 60, 2);

                    if ($morning_start > $morning_duty) {
                        if ($morning_minutes != null && $morning_minutes < 240) {
                            $computeTardiness +=  $morning_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    if ($afternoon_start > $afternoon_duty) {
                        if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                            $computeTardiness +=  $afternoon_minutes;
                            $tardiness = computeMinutes($computeTardiness);
                        }
                    }
                    $countDutyDays++;
                }
                $sumduty += $halfdayMinutes;
                $total_dutyhours = computeDay($sumduty);

                $totalComputeDays = count($workdaysCount) - $countDutyDays;
                $absenceMinute =  $totalComputeDays * 480;


                $computeTotalhrs =  ($sumduty - $computeTardiness) > ($absenceMinute + $countAbsences) ? ($sumduty - $computeTardiness) - ($absenceMinute + $countAbsences) : ($absenceMinute + $countAbsences) - ($sumduty - $computeTardiness);
                $totalhrs = computeMinutes($computeTotalhrs);

                $attendance_details = array('user_type' => $user->user_type, 'attdn_id' => $attendance_id, 'user_id' => $user->user_id, 'fname' => $user->fname, 'mname' => $user->mname, 'lname' => $user->lname, 'profile_pic' => $user->profile_pic, 'department' => $user->department, 'category' => $user->category, 'dutyHours' => $total_dutyhours, 'tardiness' => $tardiness, 'absences' => computeDay($absenceMinute + $countAbsences), 'totalHours' => $totalhrs, 'attendances' => $dutyHours, 'MonthVal' => $validated['month'], 'YearVal' => $validated['year'], 'dutydays' => $countDutyDays);
                if ($timeDiff) {
                    array_push($totalAttendance, $attendance_details);
                }
            } else {
                array_push($totalAttendance, ['user_type' => '', 'attdn_id' => '', 'user_id' => '', 'fname' => '', 'mname' => '', 'lname' => '', 'profile_pic' => '', 'department' => '', 'category' => '', 'dutyHours' => '', 'tardiness' => '', 'absences' => '', 'totalHours' => '', 'attendances' => '']);
            }
        }

        return response()->json([
            'status' => 200,
            'attendance' => $totalAttendance,
            'test' => count($workdaysCount)
        ]);
    }

    public function getModalAttendanceView($data)
    {
        // log::info("HrAttendanceController::getModalAttendanceView");

        $recordsDate = explode(",", $data);
        $month_val = $recordsDate[0];
        $year_val = $recordsDate[1];
        $user_id = $recordsDate[2];

        $all_attendance = DB::table('hr_attendance')
            ->select(DB::raw("
                hr_attendance.start_date,
                hr_attendance.attdn_id,
                hr_attendance.user_id,
                hr_attendance.morning_in,
                hr_attendance.morning_out,
                hr_attendance.afternoon_in,
                hr_attendance.afternoon_out,
                hr_workdays.workday_id,
                hr_workdays.hour_id,
                hr_workhours.*"))
            ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
            ->join('hr_workhours', 'hr_workhours.hr_workshift_id', '=', 'hr_workdays.hr_workshift_id')
            ->where('hr_attendance.user_id', $user_id)
            ->where('hr_attendance.type', '!=', 5)
            ->where('hr_attendance.is_deleted', 0)
            ->whereRaw('MONTH(hr_attendance.start_date) = ?', [$month_val])
            ->whereRaw('YEAR(hr_attendance.start_date) = ?', [$year_val])
            ->orderBy('hr_attendance.start_date', 'ASC')
            ->get();

        return response()->json([
            'status' => 200,
            'attendanceData' => $all_attendance ?? []
        ]);
    }

    public function addAttendance(Request $request)
    {
        // log::info("HrAttendanceController::addAttendance");

        $attendance = new HrAttendance();

        $attendance->emp_id = $request->input('emp_id');
        $attendance->time_in = $request->input('time_in');
        $attendance->time_out = $request->input('time_out');
        $attendance->attdn_date = $request->input('attdn_date');
        $attendance->save();

        return response()->json([
            'status' => 200,
            'message' => 'Attendance Added Successfully'
        ]);
    }

    public function getWorkdayID(Request $request)
    {
        // log::info("HrAttendanceController::getWorkdayID");

        $data = $request->validate([
            'startDate' => 'required'
        ]);
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $workdayData = DB::table('hr_workdays')
            ->select(DB::raw("
            workday_id"))
            ->where('start_date', '=', $data['startDate'])
            ->where('team', '=', $user->team)
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            ->first();

        return response()->json([
            'status' => 200,
            'message' => $workdayData->workday_id ? $workdayData->workday_id : ''
        ]);
    }

    public function getWorkdayIDFuture(Request $request)
    {
        // log::info("HrAttendanceController::getWorkdayIDFuture");

        $data = $request->validate([
            'startDate' => 'required'
        ]);
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $workdayData = DB::table('hr_workdays')
            ->select(DB::raw("workday_id"))
            ->where('start_date', '>=', $data['startDate'])
            ->where('team', '=', $user->team)
            ->where('type', '=', 1)
            ->get();

        $workday_ids = array();

        foreach ($workdayData as $wrkID) {
            $workday_ids[] = $wrkID->workday_id;
        }

        return response()->json([
            'status' => 200,
            'message' => $workday_ids
        ]);
    }

    public function updateHrAttendance(Request $request)
    {
        // log::info("HrAttendanceController::updateHrAttendance");

        $data = $request->validate([
            'morning_in' => 'nullable',
            'morning_out' => 'nullable',
            'afternoon_in' => 'nullable',
            'afternoon_out' => 'nullable',
            'start_date' => 'required',
            'end_date' => 'required',
            'type' => 'required',
            'user_id' => 'required',
            'status' => 'required',
            'workday_id' => 'required'
        ]);
        $attdn_data = $request->validate([
            'allattendance' => 'nullable|array',
        ]);

        $verifyData = $attdn_data['allattendance'];
        $start_val = array();
        $attendance_id = 0;
        $old_morning_in = '';
        $old_morning_out = '';
        $old_afternoon_in = '';
        $old_afternoon_out = '';
        $start_data = $data['start_date'];
        foreach ($verifyData as $verify) {
            $start_val[] = $verify['start_date'];
            if ($start_data === $verify['start_date']) {
                $attendance_id = $verify['attdn_id'];
                $old_morning_in = $verify['morning_in'];
                $old_morning_out = $verify['morning_out'];
                $old_afternoon_in = $verify['afternoon_in'];
                $old_afternoon_out = $verify['afternoon_out'];
            }
        }
        if (in_array($start_data, $start_val) === true) {
            $updateAttendance = DB::table('hr_attendance')->where('attdn_id', '=', $attendance_id)->update([
                'morning_in' => $data['morning_in'] ? $data['morning_in'] : $old_morning_in,
                'morning_out' => $data['morning_out'] ? $data['morning_out'] : $old_morning_out,
                'afternoon_in' => $data['afternoon_in'] ? $data['afternoon_in'] : $old_afternoon_in,
                'afternoon_out' => $data['afternoon_out'] ? $data['afternoon_out'] : $old_afternoon_out,
            ]);
            if ($updateAttendance) {
                $message = 'Updated Attendance';
            } else {
                $message = 'Fail to update';
            }
        } else {
            $addAttendance = DB::table('hr_attendance')->insert($data);
            if ($addAttendance) {
                $message = 'Added Attendance';
            } else {
                $message = 'Fail to add';
            }
        }
        return response()->json([
            'status' => 200,
            'message' =>  $message
        ]);
    }

    public function updateHrWorkhours(Request $request)
    {
        // log::info("HrAttendanceController::updateHrWorkhours");

        $data = $request->validate([
            'hours_morning_in' => 'nullable',
            'hours_morning_out' => 'nullable',
            'hours_afternoon_in' => 'nullable',
            'hours_afternoon_out' => 'nullable',
            'noon_break' => 'nullable'
        ]);

        $start_date = $request->validate([
            'start_date' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($start_date) {
            $addWorkhours = DB::table('hr_workhours')->insertGetId([
                'hours_morning_in' => $data['hours_morning_in'],
                'hours_morning_out' => $data['hours_morning_out'],
                'hours_afternoon_in' => $data['hours_afternoon_in'],
                'hours_afternoon_out' => $data['hours_afternoon_out'],
                'noon_break' => $data['noon_break'],
                'team' => $user->team
            ]);

            $updateWorkhours = DB::table('hr_workdays')
                ->where('start_date', '>=', $start_date)
                ->where('team', '=', $user->team)
                ->where('type', '=', 1)
                ->where('is_deleted', '=', 0)
                ->update(['hour_id' => $addWorkhours]);

            if ($updateWorkhours) {
                $message = 'Updated Workhours';
            } else {
                $message = 'Fail to update';
            }
        }

        return response()->json([
            'status' => 200,
            'message' =>  $message
        ]);
    }

    public function deleteAttendanceView(Request $request)
    {
        // log::info("HrAttendanceController::deleteAttendanceView");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $attdn_id = $request->validate([
            'attdn_id' => 'required',
        ]);

        $delete_attendance = DB::table('hr_attendance')->where('attdn_id', $attdn_id['attdn_id'])
            ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
        if ($delete_attendance) {
            $message = 'Success';
        } else {
            $message = 'Fail';
        }

        return response()->json([
            'status' => 200,
            'message' =>  $message
        ]);
    }

    public function getAttendance(Request $request)
    {
        // log::info("HrAttendanceController::getAttendance");

        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::where('user_id', $userID)->first();

        if ($request->attendanceId){
            $attendance = HrAttendance::where('attdn_id', $request->attendanceId)->first();
            log::info($attendance);

            $workShift = HrWorkshifts::where('id', $attendance->hr_workshift_id)->first();
            log::info($workShift);

            $workHour = HrWorkhour::where('hr_workShift_id', $workShift->id)->first();
            log::info($workHour);


            if ( $user->user_type === 'Admin' && $user->team === $workShift->team ) {
                return response()->json([
                    'status' => 200,
                    'attendance' => $attendance,
                    'workShift' => $workShift,
                    'workHour' => $workHour,
                ]);
            } else {
                return response()->json([
                    'status' => 401,
                    'attendance' => [],
                    'workShift' =>[],
                    'workHour' =>[],
                ]);
            }
        } 
    }

    public function addEmployeeAttendance(Request $request)
    {
        // log::info("HrAttendanceController::addEmployeeAttendance");

        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::where('user_id', $userID)->first();
        $employee = User::where('user_id', $request->employeeId)->where('team', $user->team)->first();
        
        $workHour = $request->input('workHour');
        $newHours = $request->input('updateStatus');
        $formattedDate = Carbon::createFromFormat('Y-m-d', $request->date)->format('Y-m-d');
        
        $workDay = HrWorkday::where('team', $user->team)
            ->where('hr_workshift_id', $employee->hr_workshift_id)
            ->whereDate('start_date', $formattedDate)
            ->where('is_deleted', 0)
            ->first();

        if ( $workDay ) {

            $exist = HrAttendance::where('status', 'attendance')
                ->where('user_id', $employee->user_id)
                ->where('workday_id', $workDay->workday_id)
                ->where('is_deleted', 0)
                ->first();

            try {
                DB::beginTransaction();
            
                if ( !$exist ) {
        
                    if ( $workHour['noon_break'] === "Yes" ) {

                        $morningInTime = $newHours['split_first_time_in'] . ":00";
                        $morningOutTime = $newHours['split_first_time_out'] . ":00";
                        $afternoonInTime = $newHours['split_second_time_in'] . ":00";
                        $afternoonOutTime = $newHours['split_second_time_out'] . ":00";

                        $morningInDateTime = $formattedDate . ' ' . $morningInTime;
                        $morningOutDateTime = $formattedDate . ' ' . $morningOutTime;
                        $afternoonInDateTime = $formattedDate . ' ' . $afternoonInTime;
                        $afternoonOutDateTime = $formattedDate . ' ' . $afternoonOutTime;

                        $newAttendance = HrAttendance::create([
                            "morning_in" => $morningInDateTime,
                            "morning_out" => $morningOutDateTime,
                            "afternoon_in" => $afternoonInDateTime,
                            "afternoon_out" => $afternoonOutDateTime,
                            "color" => "rgb(250, 34, 34)",
                            "start_date" => $formattedDate . ' 00:00:00',
                            "end_date" => $formattedDate . ' 00:00:00',
                            "type" => 1,
                            "status" => "attendance",
                            "user_id" => $employee->user_id,
                            "workday_id" => $workDay->workday_id,
                            "application_id" => NULL,
                            "hr_workshift_id" => $employee->hr_workshift_id,
                        ]);
                    }
        
                    if ( $workHour['noon_break'] === "No" ) {

                        $regularInTime = $newHours['regular_time_in'] . ":00";
                        $regularOutTime = $newHours['regular_time_out'] . ":00";

                        $regularInDateTime = $formattedDate . ' ' . $regularInTime;
                        $regularOutDateTime = $formattedDate . ' ' . $regularOutTime;

                        $newAttendance = HrAttendance::create([
                            "morning_in" => $regularInDateTime,
                            "afternoon_out" => $regularOutDateTime,
                            "color" => "rgb(250, 34, 34)",
                            "start_date" => $formattedDate,
                            "end_date" => $formattedDate,
                            "type" => 1,
                            "status" => "attendance",
                            "user_id" => $employee->user_id,
                            "workday_id" => $workDay->workday_id,
                            "application_id" => NULL,
                            "status" => "attendance",
                            "status" => $employee->hr_workshift_id,
                        ]);
                    }

                    DB::commit();

                    log::info( $newAttendance );
        
                    return response()->json([ 
                        'status' => "Success",
                        'attendance' => $newAttendance->attdn_id,
                    ]);
                } else {
        
                    log::info("Attendance Exist Already");
        
                    return response()->json([ 
                        'status' => "Attendance Exist",
                        'attendance' => $exist->attdn_id,
                    ]);
                }
            
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
            
                Log::error("Error saving work shift: " . $e->getMessage());
            
                throw $e;
            }
            
        } else {
            return response()->json([ 
                'status' => "No Workday",
            ]);
        }


    }

    public function updateAttendance(Request $request)
    {
        // log::info("HrAttendanceController::updateAttendance");

        $attendance = HrAttendance::where('attdn_id', $request->attendanceId)->first();
    
        if (!$attendance) {
            Log::error('Attendance record not found', ['attendanceId' => $request->attendanceId]);
            return response()->json(['error' => 'Attendance record not found'], 404);
        }
    
        $workHour = $request->input('workHour');
        $newHours = $request->input('updateStatus');
    
        $startDate = $attendance->start_date;
        $startDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $startDate);
    
        // Define a helper function to handle time conversion and appending seconds if needed
        function convertToTime($time) {
            if (is_null($time) || empty($time)) {
                return null;
            }
            return Carbon::createFromFormat('H:i:s', strlen($time) === 5 ? $time . ':00' : $time);
        }
    
        try {
            if ($workHour['noon_break'] === "Yes") {
                // Check and set time only if it's provided
                if (!is_null($newHours['split_first_time_in'])) {
                    $firstTimeIn = convertToTime($newHours['split_first_time_in']);
                    if ($firstTimeIn) {
                        $attendance->morning_in = $startDateTime->copy()->setTime($firstTimeIn->hour, $firstTimeIn->minute, $firstTimeIn->second);
                    }
                }
    
                if (!is_null($newHours['split_first_time_out'])) {
                    $firstTimeOut = convertToTime($newHours['split_first_time_out']);
                    if ($firstTimeOut) {
                        $attendance->morning_out = $startDateTime->copy()->setTime($firstTimeOut->hour, $firstTimeOut->minute, $firstTimeOut->second);
                    }
                }
    
                if (!is_null($newHours['split_second_time_in'])) {
                    $secondTimeIn = convertToTime($newHours['split_second_time_in']);
                    if ($secondTimeIn) {
                        $attendance->afternoon_in = $startDateTime->copy()->setTime($secondTimeIn->hour, $secondTimeIn->minute, $secondTimeIn->second);
                    }
                }
    
                if (!is_null($newHours['split_second_time_out'])) {
                    $secondTimeOut = convertToTime($newHours['split_second_time_out']);
                    if ($secondTimeOut) {
                        $attendance->afternoon_out = $startDateTime->copy()->setTime($secondTimeOut->hour, $secondTimeOut->minute, $secondTimeOut->second);
                    }
                }
    
            } elseif ($workHour['noon_break'] === "No") {
                if (!is_null($newHours['regular_time_in'])) {
                    $timeIn = convertToTime($newHours['regular_time_in']);
                    if ($timeIn) {
                        $attendance->morning_in = $startDateTime->copy()->setTime($timeIn->hour, $timeIn->minute, $timeIn->second);
                    }
                }
    
                if (!is_null($newHours['regular_time_out'])) {
                    $timeOut = convertToTime($newHours['regular_time_out']);
                    if ($timeOut) {
                        $attendance->afternoon_out = $startDateTime->copy()->setTime($timeOut->hour, $timeOut->minute, $timeOut->second);
                    }
                }
            }
    
            // Save changes if any updates were made
            if ($attendance->isDirty()) {
                $attendance->save();
            }
    
        } catch (\Exception $e) {
            Log::error('Error updating attendance', [
                'exception' => $e->getMessage(),
                'attendanceId' => $request->attendanceId,
                'workHour' => $workHour,
                'newHours' => $newHours
            ]);
            return response()->json(['error' => 'Failed to update attendance'], 500);
        }
    
        return response()->json(['success' => 'Attendance updated successfully']);
    }

    public function deleteAttendance(Request $request)
    {
        // log::info("HrAttendanceController::deleteAttendance");

        $attendance = HrAttendance::where('attdn_id', $request->attendanceId)->first();
        $attendance->is_deleted = 1;
        $attendance->save();
    }
    
    public function getUserSchedule(Request $request)
    {
        // log::info("HrAttendanceController::getUserSchedule");

        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::where('user_id', $userID)->first();

        $workShift = HrWorkshifts::where('id', $user->hr_workshift_id)->first();
        $workHour = HrWorkhour::where('hr_workShift_id', $workShift->id)->first();
        log::info($workHour);

        return response()->json([ 'status' => 200, 'workHour' => $workHour, ]);
    }
}
