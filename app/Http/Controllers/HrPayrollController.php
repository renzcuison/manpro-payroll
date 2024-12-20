<?php

namespace App\Http\Controllers;

use App\Models\HrPayroll;
use Carbon\Carbon;
use Exception;

use App\Models\User;
use App\Models\HrPayrollAllRecord;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class HrPayrollController extends Controller
{
    public function to_fixed($number, $decimals)
    {
        return floatval(number_format($number, $decimals, '.', ""));
    }

    public function getPayroll($dates)
    {
        $string_parts = explode(",", $dates);
        $month = $string_parts[0];
        $day = $string_parts[1];
        $year = $string_parts[2];
        $from = '';
        $to = '';

        if ($day === '15') {
            $from = '01';
            $to = '15';
        } else {
            $from = '16';
            $to = '30';
        }


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
            ->where('is_deleted', '=', 0)
            ->get();

        $total_payroll = array();
        foreach ($users as $user) {
            $timeDiff = array();
            $countWorkday = 0;
            $computeTardiness = 0;
            $computeAbsences = 0;
            $payrollStatus = 0;
            $absences = 0;
            $tardiness = 0;
            $morningRecords = 0;
            $afternoonRecords = 0;
            $displayFromDate = date($year . '-' . $month . '-' . $from);
            $displayToDate = date($year . '-' . $month . '-' . $to);
            $fromDate = date($year . '-' . $month . '-' . $from . ' ' . '00:00:00');
            $toDate = date($year . '-' . $month . '-' . $to . ' ' . '00:00:00');
            $dates = array($fromDate, $toDate);
            $fromDateStatus = date($year . '-' . $month . '-' . $from);
            $countApplications = 0;
            $daysDifference = '';
            $workdays = DB::table('hr_workdays')
                ->select(DB::raw("
                percentage,
                start_date,
                end_date,
                type,
                user_id
                "))
                ->where('type', '=', 1)
                ->whereBetween('start_date', $dates)
                ->get();

            $submittedApplications = DB::table('hr_applications')
                ->select(DB::raw("*"))
                ->where('user_id', $user->user_id)
                ->whereBetween('date_from', $dates)
                ->get();

            $attendanceList = DB::table('hr_attendance')
                ->select(DB::raw("
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
                ->whereBetween('hr_attendance.start_date', $dates)
                ->get();

            if (!empty($attendanceList)) {
                foreach ($submittedApplications as $apps) {
                    $fromDateApp = date("Y-m-d H:i:s", strtotime($apps->date_from));
                    $toDateApp = date("Y-m-d H:i:s", strtotime($apps->date_to));

                    $fromDateApps = Carbon::parse($fromDateApp);
                    $toDateApps = Carbon::parse($toDateApp);

                    $daysDifference = $fromDateApps->diffInDays($toDateApps);
                    $countApplications = 480 * ($daysDifference != 0 ? $daysDifference : 1);
                }
                foreach ($attendanceList as $res) {
                    $payroll_recordsData = DB::table('hr_payroll_allrecords')
                        ->select(DB::raw("payroll_status"))
                        ->where('emp_id', '=', $res->user_id)
                        ->where('payroll_fromdate', $fromDateStatus)
                        ->get();

                    if ($res->morning_in && $res->morning_out || $res->afternoon_in && $res->afternoon_out) {
                        $morningDutyTime_in = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_morning_in))->format('h A')));
                        $morningDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_morning_out))->format('h A')));
                        $morning_in = date("H:i:s", strtotime($res->morning_in));
                        $morning_out = date("H:i:s", strtotime($res->morning_out));
                        $morning_duty_in = Carbon::parse($morningDutyTime_in);
                        $morning_duty_out = Carbon::parse($morningDutyTime_out);
                        $morning_start = Carbon::parse($morning_in);
                        $morning_end = Carbon::parse($morning_out);

                        if ($res->morning_in != null && $res->morning_out != null) {
                            $morning_minutes = $morning_start->diffInMinutes($morning_duty_in);
                            if ($morning_end <= $morning_duty_out) {
                                $undertimeMorning = $morning_end->diffInMinutes($morning_duty_out);
                            } else {
                                $undertimeMorning = 0;
                            }
                        } else {
                            $morning_minutes = 240;
                            $undertimeMorning = 0;
                        }

                        $morningRecords += $morning_minutes;
                        $afternoonDutyTime_in = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_afternoon_in))->format('h A')));
                        $afternoonDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($res->hours_afternoon_out))->format('h A')));
                        $afternoon_in = date("H:i:s", strtotime($res->afternoon_in));
                        $afternoon_out = date("H:i:s", strtotime($res->afternoon_out));
                        $afternoon_duty_in = Carbon::parse($afternoonDutyTime_in);
                        $afternoon_duty_out = Carbon::parse($afternoonDutyTime_out);
                        $afternoon_start = Carbon::parse($afternoon_in);
                        $afternoon_end_time = date("Y-m-d H:i:s", strtotime($res->afternoon_out));
                        $afternoon_end = Carbon::parse($afternoon_out);

                        if ($res->afternoon_in != null && $res->afternoon_out != null) {
                            $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty_in);
                            if ($afternoon_end <= $afternoonDutyTime_out) {
                                $undertimeAfternoon = $afternoon_end->diffInMinutes($afternoon_duty_out);
                            } else {
                                $undertimeAfternoon = 0;
                            }
                        } else {
                            $afternoon_minutes = 240;
                            $undertimeAfternoon = 0;
                        }

                        $afternoonRecords += $afternoon_minutes;
                        $minutes =  $morning_minutes + $afternoon_minutes;
                        $timeDiff[] = number_format($minutes / 60, 2);

                        if ($morning_start > $morning_duty_in) {
                            if ($morning_minutes != null && $morning_minutes < 240) {
                                $computeTardiness +=  $morning_minutes;
                                $tardiness = $computeTardiness;
                            }
                        }
                        if ($afternoon_start > $afternoon_duty_in) {
                            if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                                $computeTardiness +=  $afternoon_minutes;
                                $tardiness = $computeTardiness;
                            }
                        }

                        if ($res->morning_in === null) {
                            $computeAbsences +=  $morning_minutes;
                            $absences = $computeAbsences;
                            $testAbsence[] = $computeAbsences;
                        }
                        if ($res->afternoon_in === null) {
                            $computeAbsences +=  $afternoon_minutes;
                            $absences = $computeAbsences;
                        }
                        $countWorkday++;
                    }
                }

                $payroll_verify = DB::table('hr_payroll_allrecords')
                    ->select(DB::raw("*"))
                    ->where('emp_id', '=', $user->user_id)
                    ->where('payroll_fromdate', '=', $displayFromDate)
                    ->where('payroll_todate', '=', $displayToDate)
                    ->get();


                foreach ($payroll_verify as $payroll) {
                    if ($payroll->signature != null) {
                        $payrollStatus = 1;
                    } else {
                        if ($payroll->payroll_status != 1) {
                            $payrollStatus = 2;
                        } else {
                            $payrollStatus = 3;
                        }
                    }
                }
                if ($timeDiff) {
                    $total_payroll[] = [
                        'user_type' => $user->user_type,
                        'user_id' => $user->user_id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'profile_pic' => $user->profile_pic,
                        'department' => $user->department,
                        'category' => $user->category,
                        'workdays' => count($workdays),
                        'tardiness' => $tardiness,
                        'absences' => ($countApplications - (count($workdays) - count($attendanceList)) * 480)  + $absences,
                        'undertime' => $undertimeMorning + $undertimeAfternoon,
                        'monthly_rate' => $user->monthly_rate,
                        'fromDate' => $displayFromDate,
                        'toDate' => $displayToDate,
                        'status' => $payroll_recordsData[0]->payroll_status ?? null
                    ];
                }
            } else {
                array_push($total_payroll, [
                    'user_type' => '',
                    'user_id' => '',
                    'fname' => '',
                    'mname' => '',
                    'lname' => '',
                    'profile_pic' => '',
                    'department' => '',
                    'category' => '',
                    'workdays' => '',
                    'tardiness' => '',
                    'absences' => '',
                    'undertime' => '',
                    'monthly_rate' => '',
                    'fromDate' => '',
                    'toDate' => '',
                    'status' => '',
                ]);
            }
        }
        return response()->json([
            'status' => 200,
            'payroll' => $total_payroll,
            'status' => ($countWorkday != count($workdays)) ? 'On Going' : 'Complete',
            'receiver' => $payrollStatus
        ]);
    }

    public function getUnextendedPayroll($dates)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $unextededDates = explode(",", $dates);
        $month = $unextededDates[0];
        $from = $unextededDates[1];
        $to = $unextededDates[2];
        $year = $unextededDates[3];
        $cutoff = $unextededDates[4];

        $branch = request()->input('branch');

        if ($branch !== 'null') {
            $users = User::select([
                'user_id',
                'fname',
                'mname',
                'lname',
                'profile_pic',
                'department',
                'user_type',
                'hourly_rate',
                'daily_rate',
                'monthly_rate',
                'work_days',
                'category',
                'hr_workshift_id',
            ])
            ->where('is_deleted', 0)
            ->where('category', $branch)
            ->where('team', $userTeam->team)
            ->orderBy('lname')
            ->orderBy('fname')
            ->orderBy('mname')
            ->get();
        } else {
            $users = User::select([
                'user_id',
                'fname',
                'mname',
                'lname',
                'profile_pic',
                'department',
                'user_type',
                'hourly_rate',
                'daily_rate',
                'monthly_rate',
                'work_days',
                'category',
                'hr_workshift_id',
            ])
            ->where('is_deleted', 0)
            ->where('team', $userTeam->team)
            ->orderBy('lname')
            ->orderBy('fname')
            ->orderBy('mname')
            ->get();
        }

        $total_payrollUnextended = array();
        foreach ($users as $user) {
            $timeDiff = array();
            $countAttendance = array();
            $morningRecords = 0;
            $afternoonRecords = 0;
            $countWorkday = 0;
            $computeTardiness = 0;
            $computeAbsences = 0;
            $payrollStatus = 0;
            $absences = 0;
            $tardiness = 0;
            $fromDate = date($year . '-' . $month . '-' . $from . ' ' . '00:00:00');
            $toDate = date($year . '-' . $month . '-' . $to . ' ' . '00:00:00');
            $dates = array($fromDate, $toDate);
            $displayFromDate = date($year . '-' . $month . '-' . $from);
            $displayToDate = date($year . '-' . $month . '-' . $to);
            $fromDate = date($year . '-' . $month . '-' . $from . ' ' . '00:00:00');
            $toDate = date($year . '-' . $month . '-' . $to . ' ' . '00:00:00');
            $countApplications = 0;
            $daysDifference = '';

            // $user = User::findOrFail($user->user_id);

            $workdays = DB::table('hr_workdays')
                ->select(DB::raw("percentage, start_date, end_date, type, user_id"))
                ->where('type', '=', 1)
                ->where('is_deleted', '=', 0)
                ->whereBetween('start_date', $dates)
                ->where('team', '=', $userTeam->team)
                ->where('hr_workshift_id', '=', $user->hr_workshift_id)
                ->get();

            $submittedApplications = DB::table('hr_applications')
                ->select(DB::raw("*"))
                ->where('user_id', $user->user_id)
                ->where('is_deleted', '=', 0)
                // ->where('leave_type', '==', 'Paid Leave')
                ->where('status', '==', 'Approved')
                ->whereBetween('date_from', $dates)
                ->get();

                $attendanceList = DB::table('hr_attendance')
                ->select(DB::raw("
                    hr_attendance.attdn_id,
                    hr_attendance.user_id,
                    hr_attendance.morning_in,
                    hr_attendance.morning_out,
                    hr_attendance.afternoon_in,
                    hr_attendance.afternoon_out,
                    hr_workdays.workday_id,
                    hr_workdays.hour_id,
                    hr_workhours.*"
                ))
                ->join('hr_workdays', 'hr_workdays.workday_id', '=', 'hr_attendance.workday_id')
                ->join('hr_workhours', 'hr_workhours.hr_workshift_id', '=', 'hr_workdays.hr_workshift_id')
                ->where('hr_attendance.user_id', $user->user_id)
                ->where('hr_attendance.type', '!=', 5)
                ->where('hr_attendance.is_deleted', '=', 0)
                ->whereBetween('hr_attendance.start_date', $dates)
                ->get();

            if (!empty($attendanceList)) {
                foreach ($submittedApplications as $apps) {
                    $fromDateApp = date("Y-m-d H:i:s", strtotime($apps->date_from));
                    $toDateApp = date("Y-m-d H:i:s", strtotime($apps->date_to));

                    $fromDateApps = Carbon::parse($fromDateApp);
                    $toDateApps = Carbon::parse($toDateApp);

                    $daysDifference = $fromDateApps->diffInDays($toDateApps);
                    $countApplications = 480 * ($daysDifference != 0 ? $daysDifference : 1);
                }

                foreach ($attendanceList as $attendance) {
                    if ($attendance->morning_in && $attendance->morning_out || $attendance->afternoon_in && $attendance->afternoon_out) {
                        $countAttendance[] = $attendance;
                        $morningDutyTime_in = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_morning_in))->format('h A')));
                        $morningDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_morning_out))->format('h A')));
                        $morning_in = date("H:i:s", strtotime($attendance->morning_in));
                        $morning_out = date("H:i:s", strtotime($attendance->morning_out));
                        $morning_duty_in = Carbon::parse($morningDutyTime_in);
                        $morning_duty_out = Carbon::parse($morningDutyTime_out);
                        $morning_start = Carbon::parse($morning_in);
                        $morning_end = Carbon::parse($morning_out);

                        if ($attendance->morning_in != null && $attendance->morning_out != null) {
                            $morning_minutes = $morning_start->diffInMinutes($morning_duty_in);
                            if ($morning_end <= $morning_duty_out) {
                                $undertimeMorning = $morning_end->diffInMinutes($morning_duty_out);
                            } else {
                                $undertimeMorning = 0;
                            }
                        } else {
                            $morning_minutes = 240;
                            $undertimeMorning = 0;
                        }

                        $morningRecords += $morning_minutes;
                        $afternoonDutyTime_in = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_afternoon_in))->format('h A')));
                        $afternoonDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_afternoon_out))->format('h A')));
                        $afternoon_in = date("H:i:s", strtotime($attendance->afternoon_in));
                        $afternoon_out = date("H:i:s", strtotime($attendance->afternoon_out));
                        $afternoon_duty_in = Carbon::parse($afternoonDutyTime_in);
                        $afternoon_duty_out = Carbon::parse($afternoonDutyTime_out);
                        $afternoon_start = Carbon::parse($afternoon_in);
                        $afternoon_end_time = date("Y-m-d H:i:s", strtotime($attendance->afternoon_out));
                        $afternoon_end = Carbon::parse($afternoon_out);

                        if ($attendance->afternoon_in != null && $attendance->afternoon_out != null) {
                            $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty_in);
                            if ($afternoon_end <= $afternoonDutyTime_out) {
                                $undertimeAfternoon = $afternoon_end->diffInMinutes($afternoon_duty_out);
                            } else {
                                $undertimeAfternoon = 0;
                            }
                        } else {
                            $afternoon_minutes = 240;
                            $undertimeAfternoon = 0;
                        }

                        $afternoonRecords += $afternoon_minutes;
                        $minutes =  $morning_minutes + $afternoon_minutes;
                        $timeDiff[] = number_format($minutes / 60, 2);

                        if ($morning_start > $morning_duty_in) {
                            if ($morning_minutes != null && $morning_minutes < 240) {
                                $computeTardiness +=  $morning_minutes;
                                $tardiness = $computeTardiness;
                            }
                        }

                        if ($afternoon_start > $afternoon_duty_in) {
                            if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                                $computeTardiness +=  $afternoon_minutes;
                                $tardiness = $computeTardiness;
                            }
                        }

                        if ($attendance->morning_in === null) {
                            $computeAbsences +=  $morning_minutes;
                            $absences = $computeAbsences;
                            $testAbsence[] = $computeAbsences;
                        }

                        if ($attendance->afternoon_in === null) {
                            $computeAbsences +=  $afternoon_minutes;
                            $absences = $computeAbsences;
                        }
                        
                        $countWorkday++;
                    }
                }


                $payroll_cutOff = DB::table('hr_payroll_allrecords')
                    ->select(DB::raw("*"))
                    ->where('emp_id', '=', $user->user_id)
                    ->where('payroll_cutoff', '=', $cutoff)
                    ->where('payroll_fromdate', $fromDate)
                    ->where('is_deleted', '=', 0)
                    ->get();

                $cutoffStatus = count($payroll_cutOff) != 0 ? 1 : 0;

                $payroll_verify = DB::table('hr_payroll_allrecords')
                    ->select(DB::raw("*"))
                    ->where('emp_id', '=', $user->user_id)
                    ->where('payroll_fromdate', '=', $displayFromDate)
                    ->where('payroll_todate', '=', $displayToDate)
                    ->where('is_deleted', '=', 0)
                    ->get();


                foreach ($payroll_verify as $payroll) {
                    if ($payroll->signature != null) {
                        $payrollStatus = 1;
                    } else {
                        if ($payroll->payroll_status != 1) {
                            $payrollStatus = 2;
                        } else {
                            $payrollStatus = 3;
                        }
                    }
                }

                if ($timeDiff && $cutoffStatus != 1) {

                    $totalAttendances = (count($workdays) - count($countAttendance)) * 480;

                    if ($countApplications < $totalAttendances) {
                        $absencesVal = $totalAttendances - $countApplications + $absences;
                    } else {
                        $absencesVal = $countApplications - $totalAttendances + $absences;
                    }

                    $total_payrollUnextended[] = [
                        'user_type' => $user->user_type,
                        'user_id' => $user->user_id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'profile_pic' => $user->profile_pic,
                        'department' => $user->department,
                        'category' => $user->category,
                        'workdays' => count($workdays),
                        'tardiness' => $tardiness,
                        'absences' =>  $absencesVal,
                        'undertime' => $undertimeMorning + $undertimeAfternoon,
                        'monthly_rate' => $user->monthly_rate,
                        'daily_rate' => $user->daily_rate,
                        'hourly_rate' => $user->hourly_rate,
                        'fromDate' => $displayFromDate,
                        'toDate' => $displayToDate,
                        'status' => null
                    ];
                }
            } else {
                array_push($total_payrollUnextended, [
                    'user_type' => '',
                    'user_id' => '',
                    'fname' => '',
                    'mname' => '',
                    'lname' => '',
                    'profile_pic' => '',
                    'department' => '',
                    'category' => '',
                    'workdays' => '',
                    'tardiness' => '',
                    'absences' => '',
                    'undertime' => '',
                    'monthly_rate' => '',
                    'daily_rate' => '',
                    'hourly_rate' => '',
                    'fromDate' => '',
                    'toDate' => '',
                    'status' => '',
                ]);
            }
        }

        return response()->json([
            'status' => 200,
            'payrollUnextended' => $total_payrollUnextended,
            'status' => ($countWorkday != count($workdays)) ? 'On Going' : 'Complete',
            'receiver' => $payrollStatus
        ]);
    }

    // ------------------------------------------------------

    public function getExtendedPayroll($dates)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $unextededDates = explode(",", $dates);
        $fromDate = $unextededDates[0];
        $toDate = $unextededDates[1];
        $cutoff = $unextededDates[2];
        $fromDateFormatted = date($fromDate . ' ' . '00:00:00');
        $toDateFormatted = date($toDate . ' ' . '00:00:00');
        $dates = array($fromDateFormatted, $toDateFormatted);
        $displayFromDate = date($fromDateFormatted);
        $displayToDate = date($toDateFormatted);

        $branch = request()->input('branch');

        if ($branch !== 'null') {
            $users = User::select([
                'user_id',
                'fname',
                'mname',
                'lname',
                'profile_pic',
                'department',
                'user_type',
                'hourly_rate',
                'daily_rate',
                'monthly_rate',
                'work_days',
                'category',
                'hr_workshift_id',
            ])
            ->where('is_deleted', '=', 0)
            ->where('category', '=', $branch)
            ->where('team', '=', $userTeam->team)
            ->orderBy('lname', 'asc')
            ->orderBy('fname', 'asc')
            ->orderBy('mname', 'asc')
            ->get();
        } else {
            $users = User::select([
                'user_id',
                'fname',
                'mname',
                'lname',
                'profile_pic',
                'department',
                'user_type',
                'hourly_rate',
                'daily_rate',
                'monthly_rate',
                'work_days',
                'category',
                'hr_workshift_id',
            ])
            ->where('is_deleted', '=', 0)
            ->where('team', '=', $userTeam->team)
            ->orderBy('lname', 'asc')
            ->orderBy('fname', 'asc')
            ->orderBy('mname', 'asc')
            ->get();
        }

        $total_payrollExtended = array();
        foreach ($users as $user) {
            $timeDiff = array();
            $countAttendance = array();
            $morningRecords = 0;
            $afternoonRecords = 0;
            $countWorkday = 0;
            $computeTardiness = 0;
            $computeAbsences = 0;
            $payrollStatus = 0;
            $absences = 0;
            $tardiness = 0;
            $countApplications = 0;
            $daysDifference = '';

            $workdays = DB::table('hr_workdays')
                ->select(DB::raw("percentage, start_date, end_date, type, user_id"))
                ->where('type', '=', 1)
                ->where('is_deleted', '=', 0)
                ->whereBetween('start_date', $dates)
                ->where('team', '=', $userTeam->team)
                ->where('hr_workshift_id', '=', $user->hr_workshift_id)
                ->get();

            $submittedApplications = DB::table('hr_applications')
                ->select(DB::raw("*"))
                ->where('user_id', $user->user_id)
                ->where('is_deleted', '=', 0)
                // ->where('leave_type', '==', 'Paid Leave')
                ->where('status', '==', 'Approved')
                ->whereBetween('date_from', $dates)
                ->get();

            $attendanceList = DB::table('hr_attendance')
                ->select(DB::raw("
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
                ->where('hr_attendance.is_deleted', '=', 0)
                ->whereBetween('hr_attendance.start_date', $dates)
                ->get();

            $payroll_cutOff = DB::table('hr_payroll_allrecords')
                ->select(DB::raw("*"))
                ->where('emp_id', '=', $user->user_id)
                ->where('payroll_cutoff', '=', $cutoff)
                ->where('payroll_fromdate', $fromDateFormatted)
                ->where('is_deleted', '=', 0)
                ->get();

            $cutoffStatus = count($payroll_cutOff) != 0 ? 1 : 0;

            $payroll_verify = DB::table('hr_payroll_allrecords')
                ->select(DB::raw("*"))
                ->where('emp_id', '=', $user->user_id)
                ->where('payroll_fromdate', '=', $displayFromDate)
                ->where('payroll_todate', '=', $displayToDate)
                ->where('is_deleted', '=', 0)
                ->get();

            if (!empty($attendanceList)) {
                foreach ($payroll_verify as $payroll) {
                    if ($payroll->signature != null) {
                        $payrollStatus = 1;
                    } else {
                        if ($payroll->payroll_status != 1) {
                            $payrollStatus = 2;
                        } else {
                            $payrollStatus = 3;
                        }
                    }
                }
                foreach ($submittedApplications as $apps) {
                    $fromDateApp = date("Y-m-d H:i:s", strtotime($apps->date_from));
                    $toDateApp = date("Y-m-d H:i:s", strtotime($apps->date_to));

                    $fromDateApps = Carbon::parse($fromDateApp);
                    $toDateApps = Carbon::parse($toDateApp);

                    $daysDifference = $fromDateApps->diffInDays($toDateApps);
                    $countApplications = 480 * ($daysDifference != 0 ? $daysDifference : 1);
                }
                foreach ($attendanceList as $attendance) {
                    if ($attendance->morning_in && $attendance->morning_out || $attendance->afternoon_in && $attendance->afternoon_out) {
                        $countAttendance[] = $attendance;
                        $morningDutyTime_in = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_morning_in))->format('h A')));
                        $morningDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_morning_out))->format('h A')));
                        $morning_in = date("H:i:s", strtotime($attendance->morning_in));
                        $morning_out = date("H:i:s", strtotime($attendance->morning_out));
                        $morning_duty_in = Carbon::parse($morningDutyTime_in);
                        $morning_duty_out = Carbon::parse($morningDutyTime_out);
                        $morning_start = Carbon::parse($morning_in);
                        $morning_end = Carbon::parse($morning_out);

                        if ($attendance->morning_in != null && $attendance->morning_out != null) {
                            $morning_minutes = $morning_start->diffInMinutes($morning_duty_in);
                            if ($morning_end <= $morning_duty_out) {
                                $undertimeMorning = $morning_end->diffInMinutes($morning_duty_out);
                            } else {
                                $undertimeMorning = 0;
                            }
                        } else {
                            $morning_minutes = 240;
                            $undertimeMorning = 0;
                        }

                        $morningRecords += $morning_minutes;
                        $afternoonDutyTime_in = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_afternoon_in))->format('h A')));
                        $afternoonDutyTime_out = date('Y-m-d H:i:s', strtotime('today ' . (new Carbon($attendance->hours_afternoon_out))->format('h A')));
                        $afternoon_in = date("H:i:s", strtotime($attendance->afternoon_in));
                        $afternoon_out = date("H:i:s", strtotime($attendance->afternoon_out));
                        $afternoon_duty_in = Carbon::parse($afternoonDutyTime_in);
                        $afternoon_duty_out = Carbon::parse($afternoonDutyTime_out);
                        $afternoon_start = Carbon::parse($afternoon_in);
                        $afternoon_end = Carbon::parse($afternoon_out);

                        if ($attendance->afternoon_in != null && $attendance->afternoon_out != null) {
                            $afternoon_minutes = $afternoon_start->diffInMinutes($afternoon_duty_in);
                            if ($afternoon_end <= $afternoonDutyTime_out) {
                                $undertimeAfternoon = $afternoon_end->diffInMinutes($afternoon_duty_out);
                            } else {
                                $undertimeAfternoon = 0;
                            }
                        } else {
                            $afternoon_minutes = 240;
                            $undertimeAfternoon = 0;
                        }

                        $afternoonRecords += $afternoon_minutes;
                        $minutes =  $morning_minutes + $afternoon_minutes;
                        $timeDiff[] = number_format($minutes / 60, 2);

                        if ($morning_start > $morning_duty_in) {
                            if ($morning_minutes != null && $morning_minutes < 240) {
                                $computeTardiness +=  $morning_minutes;
                                $tardiness = $computeTardiness;
                            }
                        }
                        if ($afternoon_start > $afternoon_duty_in) {
                            if ($afternoon_minutes != null && $afternoon_minutes < 240) {
                                $computeTardiness +=  $afternoon_minutes;
                                $tardiness = $computeTardiness;
                            }
                        }

                        if ($attendance->morning_in === null) {
                            $computeAbsences +=  $morning_minutes;
                            $absences = $computeAbsences;
                            $testAbsence[] = $computeAbsences;
                        }
                        if ($attendance->afternoon_in === null) {
                            $computeAbsences +=  $afternoon_minutes;
                            $absences = $computeAbsences;
                        }
                    }
                }
                if ($timeDiff && $cutoffStatus != 1) {
                    $totalAttendances = (count($workdays) - count($countAttendance)) * 480;
                    if ($countApplications < $totalAttendances) {
                        $absencesVal = $totalAttendances - $countApplications + $absences;
                    } else {
                        $absencesVal = $countApplications - $totalAttendances + $absences;
                    }

                    $total_payrollExtended[] = [
                        'user_type' => $user->user_type,
                        'user_id' => $user->user_id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'profile_pic' => $user->profile_pic,
                        'department' => $user->department,
                        'category' => $user->category,
                        'workdays' => count($workdays),
                        'tardiness' => $tardiness,
                        'absences' =>  $absencesVal,
                        'undertime' => $undertimeMorning + $undertimeAfternoon,
                        'monthly_rate' => $user->monthly_rate,
                        'daily_rate' => $user->daily_rate,
                        'hourly_rate' => $user->hourly_rate,
                        'fromDate' => $displayFromDate,
                        'toDate' => $displayToDate,
                        'status' => null
                    ];
                }
            } else {
                array_push($total_payrollExtended, [
                    'user_type' => '',
                    'user_id' => '',
                    'fname' => '',
                    'mname' => '',
                    'lname' => '',
                    'profile_pic' => '',
                    'department' => '',
                    'category' => '',
                    'workdays' => '',
                    'tardiness' => '',
                    'absences' => '',
                    'undertime' => '',
                    'monthly_rate' => '',
                    'daily_rate' => '',
                    'hourly_rate' => '',
                    'fromDate' => '',
                    'toDate' => '',
                    'status' => '',
                ]);
            }
        }
        return response()->json([
            'status' => 200,
            'payrollUnextended' => $total_payrollExtended,
            'status' => ($countWorkday != count($workdays)) ? 'On Going' : 'Complete',
            'receiver' => $payrollStatus
        ]);
    }

    public function getPayrollRecord($id, $dates)
    {
        log::info("HrPayrollController::getPayrollRecord");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = User::find($userID);

        log::info($user);

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $recordsDate = explode(",", $dates);
        $processtype = $recordsDate[0];
        $cutoff = $recordsDate[1];
        $monthRecord = $recordsDate[2];

        $yearRecord = $recordsDate[3];

        $allrecords_payroll = array();
        $userRecord_payroll = array();

        $payrollList = DB::table('hr_payroll_allrecords')
            ->select(
                'hr_payroll_allrecords.*',
                'user.fname',
                'user.mname',
                'user.lname'
            )
            ->join('user', 'hr_payroll_allrecords.emp_id', '=', 'user.user_id')
            ->where('hr_payroll_allrecords.payroll_cutoff', '=', $cutoff)
            ->where('hr_payroll_allrecords.is_deleted', '=', 0)
            ->whereRaw('MONTH(hr_payroll_allrecords.payroll_todate) = ?', [$monthRecord])
            ->whereRaw('YEAR(hr_payroll_allrecords.payroll_fromdate) = ?', [$yearRecord])
            ->orderBy('user.lname', 'asc')
            ->orderBy('user.fname', 'asc')
            ->orderBy('user.mname', 'asc')
            ->get();

        foreach ($payrollList as $payroll) {
            array_push($allrecords_payroll, $payroll);

            if ($userTeam->user_type === 'Super Admin') {
                $admin = DB::table('user')->select('*')->where('user_id', $id)->first();

                $userRecord = DB::table('user')
                    ->select(DB::raw("
                        user.user_id,
                        user.fname,
                        user.mname,
                        user.lname,
                        user.profile_pic,
                        user.department,
                        user.user_type,
                        user.work_days,
                        user.category"))
                    ->where('user_id', $payroll->emp_id)
                    ->where('team', $admin->team)
                    ->where('is_deleted', '=', 0)
                    ->get();
            } else {
                $userRecord = DB::table('user')
                    ->select(DB::raw("
                        user.user_id,
                        user.fname,
                        user.mname,
                        user.lname,
                        user.profile_pic,
                        user.department,
                        user.user_type,
                        user.work_days,
                        user.category"))
                    ->where('user_id', $payroll->emp_id)
                    ->where('team', $userTeam->team)
                    ->where('is_deleted', '=', 0)
                    ->get();
            }

            foreach ($userRecord as $user) {

                $thirteenthMonthPay = 0;

                if ( $user->user_id == 315 ) {
                    $records = HrPayrollAllRecord::where('emp_id', 315)->get();

                    foreach ( $records as $record) {
                        $thirteenthMonthPay = $thirteenthMonthPay + $record->basic_pay ;
                        log::info($record);
                    }

                    // log::info( "thirteenthMonthPay = " . $thirteenthMonthPay);
                    log::info( "thirteenthMonthPay = " . $thirteenthMonthPay/12);
                }


                // $totalThirteenthMonth = DB::table('hr_payroll_allrecords')
                    // ->select(DB::raw('SUM(total_earnings) as total_thirteenth_month'))
                    // ->join('user', 'hr_payroll_allrecords.emp_id', '=', 'user.user_id')
                    // ->where('hr_payroll_allrecords.emp_id', '=', $user->user_id)
                    // ->where('hr_payroll_allrecords.is_deleted', '=', 0)
                    // ->first();
                // if ($totalThirteenthMonth) {
                    // $totalThirteenthMonth = $totalThirteenthMonth->total_thirteenth_month; 
                // } else {
                    // $totalThirteenthMonth = 0; 
                // }

                // log::info( $user->fname . " " . $user->mname . " " . $user->lname);
                // log::info( "Thirteenth Month Pay: " . $totalThirteenthMonth );

                $userRecord_payroll[] = [
                    'user_type' => $user->user_type,
                    'user_id' => $user->user_id,
                    'fname' => $user->fname,
                    'mname' => $user->mname,
                    'lname' => $user->lname,
                    'profile_pic' => $user->profile_pic,
                    'department' => $user->department,
                    'category' => $user->category,
                    'basic_pay' => $payroll->basic_pay,
                    'monthly_rate' => $payroll->monthly_rate,
                    'daily_rate' => $payroll->daily_rate,
                    'hourly_rate' => $payroll->hourly_rate,
                    'total_earnings' => $payroll->total_earnings,
                    'payroll_id' => $payroll->payroll_id,
                    'absences' => $payroll->absences,
                    'signature' => $payroll->signature,
                    'payroll_fromdate' => $payroll->payroll_fromdate,
                    'payroll_todate' => $payroll->payroll_todate,
                    'payroll_cutoff' => $payroll->payroll_cutoff,
                    'payroll_status' => $payroll->payroll_status,
                    'workdays' => $payroll->workdays,
                    'processtype' => $payroll->processtype,
                    'remaining_loan' => $payroll->remaining_loan
                ];
            }
        }
        
        return response()->json([
            'status' => 200,
            'payrollRecords' => $userRecord_payroll,
            'allRecords' => $allrecords_payroll,
            'test' => $processtype
        ]);
    }

    public function  getPayrollRecordBenefits($id)
    {
        $payroll_Allrecords = DB::table('hr_payroll_allrecords')
            ->select(DB::raw("*"))
            ->where('payroll_id', '=', $id)
            ->where('is_deleted', '=', 0)
            ->get();

        $payroll_recordsEarnings = DB::table('hr_payroll_earnings')
            ->select(DB::raw('*'), DB::raw('SUM(total_earnings) as total_earnings'))
            ->where('payroll_id', $id)
            ->where('is_deleted', 0)
            ->groupBy('applist_id')
            ->get();

        $payroll_recordsBenefits = DB::table('hr_payroll_benefits')
            ->select(DB::raw("*"))
            ->where('payroll_id', '=', $id)
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            ->get();

        $payroll_recordsLoan = DB::table('hr_payroll_benefits')
            ->select(DB::raw("*"))
            ->where('payroll_id', '=', $id)
            ->where('type', '=', 2)
            ->where('is_deleted', '=', 0)
            ->get();

        $payroll_recordscontribution = DB::table('hr_payroll_benefits')
            ->select(DB::raw("*"))
            ->where('payroll_id', '=', $id)
            ->where('type', '=', 3)
            ->where('is_deleted', '=', 0)
            ->get();

        $payroll_recordstaxes = DB::table('hr_payroll_benefits')
            ->select(DB::raw("*"))
            ->where('payroll_id', '=', $id)
            ->where('type', '=', 4)
            ->where('is_deleted', '=', 0)
            ->get();

        $allrecords_data = array();
        $earnings_data = array();
        $benefits_data = array();
        $loan_data = array();
        $contribution_data = array();
        $taxes_data = array();
        $leaveAbsence = 0;
        $leaveAbsenceGross = 0;
        foreach ($payroll_recordsEarnings as $earningslist) {
            $earningsData = DB::table('hr_application_list')
                ->select(DB::raw("*"))
                ->where('applist_id', '=', $earningslist->applist_id)
                ->where('is_deleted', '=', 0)
                ->get();
            foreach ($earningsData as $list) {
                array_push($earnings_data, [
                    'applist_id' => $list->applist_id,
                    'list_name' => $list->list_name,
                    'totalAmount' => $earningslist->total_earnings,
                    'status' => $earningslist->status
                ]);
                $leaveAbsence += $earningslist->status === 'Approved' ? $earningslist->leaveAbsence : 0;
                $leaveAbsenceGross += ($earningslist->status === 'Approved' && stripos($list->list_name, 'overtime') === false) ? $earningslist->leaveAbsence : 0;
            }
        }

        foreach ($payroll_Allrecords as $alllist) {
            array_push($earnings_data, [
                'payroll_id' => $alllist->payroll_id,
                'list_name' => 'Incentives',
                'totalAmount' => $alllist->incentives
            ]);
            array_push($earnings_data, [
                'payroll_id' => $alllist->payroll_id,
                'list_name' => 'Allowance',
                'totalAmount' => $alllist->allowance
            ]);
            array_push($earnings_data, [
                'list_name' => 'Absences',
                'totalAmount' => $alllist->absences
            ]);
            array_push($earnings_data, [
                'list_name' => 'Tardiness',
                'totalAmount' => $alllist->tardiness
            ]);
            array_push($earnings_data, [
                'list_name' => 'Undertime',
                'totalAmount' => $alllist->undertime
            ]);
            $allrecords_data = $alllist;
        }

        foreach ($payroll_recordsBenefits as $benefitlist) {
            $benefitsData = DB::table('hr_employee_benefits_list')
                ->select(DB::raw("*"))
                ->where('benefitlist_id', '=', $benefitlist->benefitlist_id)
                ->get();
            foreach ($benefitsData as $list) {
                array_push($benefits_data, [
                    'list_name' => $list->title,
                    'totalAmount' => $benefitlist->totalAmount,
                    'addbenefit_id' => $benefitlist->addbenefit_id
                ]);
            }
        }
        foreach ($payroll_recordsLoan as $loanlist) {
            $loanData = DB::table('hr_employee_benefits_list')
                ->select(DB::raw("*"))
                ->where('benefitlist_id', '=', $loanlist->benefitlist_id)
                ->get();
            foreach ($loanData as $list) {
                array_push($loan_data, [
                    'list_name' => $list->title,
                    'totalAmount' => $loanlist->totalAmount,
                    'addbenefit_id' => $loanlist->addbenefit_id,
                    'amountTotal' => $loanlist->amountTotal,
                    'benefitlist_id' => $loanlist->benefitlist_id,
                ]);
            }
        }
        foreach ($payroll_recordscontribution as $contrilist) {
            $contriData = DB::table('hr_employee_benefits_list')
                ->select(DB::raw("*"))
                ->where('benefitlist_id', '=', $contrilist->benefitlist_id)
                ->get();
            foreach ($contriData as $list) {
                array_push($contribution_data, [
                    'list_name' => $list->title,
                    'totalAmount' => $contrilist->totalAmount,
                    'addbenefit_id' => $contrilist->addbenefit_id
                ]);
            }
        }

        foreach ($payroll_recordstaxes as $taxeslist) {
            $taxesData = DB::table('hr_employee_benefits_list')
                ->select(DB::raw("*"))
                ->where('benefitlist_id', '=', $taxeslist->benefitlist_id)
                ->get();
            foreach ($taxesData as $list) {
                array_push($taxes_data, [
                    'list_name' => $list->title,
                    'totalAmount' => $taxeslist->totalAmount,
                    'addbenefit_id' => $taxeslist->addbenefit_id
                ]);
            }
        }

        return response()->json([
            'status' => 200,
            'allrecords' => $allrecords_data,
            'earnings_data' => $earnings_data,
            'benefitsRecords' => $benefits_data,
            'loan_data' => $loan_data,
            'contribution_data' => $contribution_data,
            'taxes_data' => $taxes_data,
            'test' => $allrecords_data,
            'leaveAbsence' => number_format($leaveAbsence, 2),
            'leaveAbsenceGross' => number_format($leaveAbsenceGross, 2)
        ]);
    }

    public function getPayrollBenefits(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->where('is_deleted', 0)
            ->first();

        $payrollData = $request->validate([
            'payrollData' => 'required|array',
            'cutoff' => 'required',
            'basic_rate' => 'required',
        ]);
        $allrecords = array($payrollData['payrollData']);
        $cutoff = $payrollData['cutoff'];
        $basic_rate = $payrollData['basic_rate'];

        foreach ($allrecords as $list) {
            $user_id = $list['user_id'];
            $start_date = $list['fromDate'];
            $to_date = $list['toDate'];

            $fromDate = date($start_date . ' ' . '00:00:00');
            $toDate = date($to_date . ' ' . '00:00:00');
            $verifyBenefitsData = DB::table("hr_employee_benefits")->select("*")->where("emp_id", $user_id)->where("isupdate", 1)->where('is_deleted', 0)->get();

            $benefits_data_manual = DB::table('hr_employee_benefits_list')->select(
                'hr_employee_benefits_list.benefitlist_id',
                'hr_employee_benefits_list.title',
                'hr_employee_benefits_list.type',
                DB::raw("(SELECT SUM(hr_employee_benefits.amount)  FROM hr_employee_benefits
              WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id AND hr_employee_benefits.isupdate = 1 AND emp_id = $user_id) as totalAmount"),
                DB::raw("(SELECT taxable FROM hr_employee_benefits
                  WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                  AND hr_employee_benefits.isupdate = 1 AND emp_id = $user_id LIMIT 1) as taxable"),
                DB::raw("(SELECT exempt FROM hr_employee_benefits
                  WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                  AND hr_employee_benefits.isupdate = 1 AND emp_id = $user_id LIMIT 1) as exempt"),
                DB::raw("(SELECT amountTotal FROM hr_employee_benefits
                    WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                    AND hr_employee_benefits.isupdate = 1 AND emp_id = $user_id LIMIT 1) as amountTotal"),
                DB::raw("(SELECT chooseCutoff FROM hr_employee_benefits
                    WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                    AND hr_employee_benefits.isupdate = 1 AND emp_id = $user_id LIMIT 1) as chooseCutoff"),
                DB::raw("(SELECT is_deleted FROM hr_employee_benefits
                        WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                        AND hr_employee_benefits.isupdate = 1 AND emp_id = $user_id LIMIT 1) as is_deleted")
            )
                ->where('hr_employee_benefits_list.team', $user->team)
                ->where('hr_employee_benefits_list.is_deleted', 0)
                ->get();
            $benefits_data_general = DB::table('hr_employee_benefits_list')
                ->select(
                    'hr_employee_benefits_list.benefitlist_id',
                    'hr_employee_benefits_list.title',
                    'hr_employee_benefits_list.type',
                    DB::raw("(SELECT SUM(hr_employee_benefits.amount)  FROM hr_employee_benefits
              WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id AND hr_employee_benefits.isupdate = 0 AND emp_id = $user_id
            ) as totalAmount"),
                    DB::raw("(SELECT taxable FROM hr_employee_benefits
                      WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                      AND hr_employee_benefits.isupdate = 0 AND emp_id = $user_id LIMIT 1) as taxable"),
                    DB::raw("(SELECT exempt FROM hr_employee_benefits
                      WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                      AND hr_employee_benefits.isupdate = 0 AND emp_id = $user_id LIMIT 1) as exempt"),
                    DB::raw("(SELECT amountTotal FROM hr_employee_benefits
                        WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                        AND hr_employee_benefits.isupdate = 0 AND emp_id = $user_id LIMIT 1) as amountTotal"),
                    DB::raw("(SELECT chooseCutoff FROM hr_employee_benefits
                            WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                            AND hr_employee_benefits.isupdate = 0 AND emp_id = $user_id LIMIT 1) as chooseCutoff"),
                    DB::raw("(SELECT is_deleted FROM hr_employee_benefits
                                    WHERE hr_employee_benefits.benefitlist_id = hr_employee_benefits_list.benefitlist_id
                                    AND hr_employee_benefits.isupdate = 0 AND emp_id = $user_id LIMIT 1) as is_deleted")
                )
                ->where('hr_employee_benefits_list.team', $user->team)
                ->where('hr_employee_benefits_list.is_deleted', 0)
                ->get();

            $benefitsAlldata = array();
            $loanAlldata = array();
            $contributeAlldata = array();
            $taxesAlldata = array();
            $ManualData = count($verifyBenefitsData) != 0 ? $benefits_data_manual : $benefits_data_general;

            $payroll_remainingLoans = DB::table('hr_employee_benefits')
                ->select('amountTotal', 'amount')
                ->where('emp_id', '=', $user_id)
                ->where('type', 2)
                ->where('team', $user->team)
                ->where('is_deleted', 0)
                ->get();

            $sumAmountTotal = 0;
            $sumAmount = 0;

            foreach ($payroll_remainingLoans as $loan) {
                $sumAmountTotal += $loan->amountTotal;
            }

            foreach ($ManualData as $val) {
                if ($val->type === 1) {
                    array_push($benefitsAlldata, [
                        'benefitlist_id' => $val->benefitlist_id,
                        'title' => $val->title,
                        'totalAmount' => $val->totalAmount,
                        'type' => $val->type,
                        'taxable' => $val->taxable,
                        'exempt' => $val->exempt,
                        'amountTotal' => $val->amountTotal,
                        'chooseCutoff' => $val->chooseCutoff,
                    ]);
                }
                if ($val->type === 2 && $val->is_deleted === 0) {
                    array_push($loanAlldata, [
                        'benefitlist_id' => $val->benefitlist_id,
                        'title' => $val->title,
                        'totalAmount' => ($cutoff == $val->chooseCutoff || $val->chooseCutoff == 3) ? $val->totalAmount : 0,
                        'type' => $val->type,
                        'taxable' => $val->taxable,
                        'exempt' => $val->exempt,
                        'amountTotal' => $val->amountTotal,
                        'chooseCutoff' => $val->chooseCutoff,
                    ]);

                    if ($cutoff == $val->chooseCutoff || $val->chooseCutoff == 3) {
                        $sumAmount += $val->totalAmount;
                    }
                }
                if ($val->type === 3) {
                    array_push($contributeAlldata, [
                        'benefitlist_id' => $val->benefitlist_id,
                        'title' => $val->title,
                        'totalAmount' => $val->totalAmount,
                        'type' => $val->type,
                        'taxable' => $val->taxable,
                        'exempt' => $val->exempt,
                        'amountTotal' => $val->amountTotal,
                        'chooseCutoff' => $val->chooseCutoff,
                    ]);
                }
                if ($val->type === 4) {
                    array_push($taxesAlldata, [
                        'benefitlist_id' => $val->benefitlist_id,
                        'title' => $val->title,
                        'totalAmount' => $val->totalAmount,
                        'type' => $val->type,
                        'taxable' => $val->taxable,
                        'exempt' => $val->exempt,
                        'amountTotal' => $val->amountTotal,
                        'chooseCutoff' => $val->chooseCutoff,
                    ]);
                }
            }
        }
        $earnignsAllData = array();
        $earningsData = DB::table('hr_application_list')
            ->select(
                'hr_application_list.applist_id',
                'hr_application_list.list_name',
                'hr_application_list.percentage',
                DB::raw("COUNT(hr_applications.leave_type) as totalApplications"),
                DB::raw("SUM(CASE WHEN hr_applications.status = 'Approved' THEN hr_applications.app_hours ELSE 0 END) as total_hours"),
                'hr_applications.status'
            )
            ->leftJoin('hr_applications', function ($join) use ($user_id, $fromDate, $toDate) {
                $join->on('hr_application_list.applist_id', '=', 'hr_applications.applist_id')
                    ->where('hr_applications.is_deleted', '!=', 1)
                    ->where('hr_applications.user_id', '=', $user_id)
                    ->whereBetween('hr_applications.date_from', [$fromDate, $toDate]);
            })
            ->where('hr_application_list.team', $user->team)
            ->where('hr_application_list.is_deleted', 0)
            ->groupBy('hr_application_list.applist_id', 'hr_application_list.list_name', 'hr_application_list.percentage', 'hr_applications.status')
            ->get();

        $leaveAbsence = 0;
        foreach ($earningsData as $earnings) {
            $app_id = $earnings->applist_id;
            $list_name = $earnings->list_name;
            $percentage = $earnings->percentage;
            $total_hours = $earnings->total_hours;
            $num_days = floatval(number_format(($total_hours / 8), 2, '.', ""));
            $showLeaves = 0;
            $deductLeave = 0;
            $hourly_rate = 0;
            $additional = 0;
            $overtime_rate = 0;

            // if ($list_name != 'Paid Leave' && $list_name != 'Overtime Regular Holiday' && $list_name != 'Overtime Rest day' && $list_name != 'Overtime Special Holiday') {
            if ($percentage != 0) {

                if ( $list_name == "Regular Overtime" || $list_name == "Overtime Rest day" ) {
                    $hourly_rate = $basic_rate / 8;
                    $additional = $hourly_rate * $percentage;
                    $overtime_rate = $hourly_rate + $additional;
                    $showLeaves = $overtime_rate * $total_hours;
                } else {
                    $showLeaves = ($basic_rate * $percentage) * $num_days;
                }

                $deductLeave = ($basic_rate * $percentage) * $num_days;
                
            } else {
                $showLeaves = $basic_rate;
            }

            $leaveAbsence = (stripos($list_name, 'leave') !== false) ? floatval($basic_rate) * floatval($num_days) : 0;

            array_push($earnignsAllData, [
                'applist_id' => $app_id,
                'list_name' => $list_name,
                'totalAmount' => floatval(number_format($showLeaves, 2, '.', "")),
                'deductLeave' => $deductLeave,
                'status' => $earnings->status,
                'leaveAbsence' => $leaveAbsence,
                'total_hours' => $total_hours
            ]);
        }
        if (!$earningsData) {
            array_push($earnignsAllData, [
                'applist_id' => '',
                'list_name' => '',
                'totalAmount' => '',
                'deductLeave' => '',
                'status' => '',
                'leaveAbsence' => '',
                'total_hours' => ''
            ]);
        }

        return response()->json([
            'status' => 200,
            'earningsData' => $earnignsAllData,
            'benefitsAlldata' => $benefitsAlldata,
            'loanAlldata' => $loanAlldata,
            'contributeAlldata' => $contributeAlldata,
            'taxesAlldata' => $taxesAlldata,
            'test' => $earnignsAllData,
            'remainingLoan' => $payroll_remainingLoans ? $sumAmountTotal - $sumAmount : 0,
        ]);
    }

    public function getPayrollRemainingLoan(Request $request, $id)
    {
        $payrollData = $request->validate([
            'payrollData' => 'required|array',
        ]);

        $allrecords = array($payrollData['payrollData']);

        foreach ($allrecords as $list) {
            $user_id = $list['user_id'];

            $payroll_remainingLoans = DB::table('hr_payroll_benefits')
                ->select('amountTotal', 'totalAmount')
                ->where('emp_id', '=', $user_id)
                ->where('payroll_id', '=', $id)
                ->where('type', 2)
                ->get();

            $sumAmountTotal = 0;
            $sumAmount = 0;

            foreach ($payroll_remainingLoans as $loan) {
                $sumAmountTotal += $loan->amountTotal;
                $sumAmount += $loan->totalAmount;
            }
        }
        return response()->json([
            'status' => 200,
            'remainingLoan' => $payroll_remainingLoans ? $sumAmountTotal - $sumAmount : 0
        ]);
    }

    public function getSavedPayroll(Request $request)
    {
        $payroll_records =  $request->validate([
            'emp_id' => 'required',
            'payroll_fromdate' => 'required',
            'payroll_todate' => 'required'
        ]);

        $payroll_recordsData = DB::table('hr_payroll_allrecords')
            ->select(DB::raw("*"))
            ->join('hr_payroll_earnings', 'hr_payroll_earnings.payroll_id', '=', 'hr_payroll_allrecords.payroll_id')
            ->join('hr_payroll_benefits', 'hr_payroll_benefits.payroll_id', '=', 'hr_payroll_allrecords.payroll_id')
            ->where('emp_id', '=', $payroll_records['emp_id'])
            ->where('payroll_fromdate', '=', $payroll_records['payroll_fromdate'])
            ->where('payroll_todate', '=', $payroll_records['payroll_todate'])
            ->where('hr_payroll_allrecords.is_deleted', '=', 0)
            ->get();

        $payoll_savedata = array();
        foreach ($payroll_recordsData as $list) {
            $payoll_savedata[] = $list;
        }

        return response()->json([
            'status' => 200,
            'payrollSaved' => $payroll_recordsData,
        ]);
    }

    public function savePayroll(Request $request)
    {
        $payroll_records =  $request->validate([
            'emp_id' => 'required',
            'payroll_fromdate' => 'nullable',
            'payroll_todate' => 'nullable',
            'payroll_cutoff' => 'nullable',
            'basic_pay' => 'nullable',
            'monthly_rate' => 'nullable',
            'daily_rate' => 'nullable',
            'hourly_rate' => 'nullable',
            'workdays' => 'nullable',
            'overtime_hours' => 'nullable',
            'overtime' => 'nullable',
            'total_earnings' => 'nullable',
            'total_gross' => 'nullable',
            'total_deduction' => 'nullable',
            'total_contribution' => 'nullable',
            'remaining_loan' => 'nullable',
            'total_loan_deduct' => 'nullable',
            'total_taxes' => 'nullable',
            'net_pay' => 'nullable',
            'incentives' => 'nullable',
            'allowance' => 'nullable',
            'absences' => 'nullable',
            'tardiness' => 'nullable',
            'undertime' => 'nullable',
            'processtype' => 'nullable',
        ]);

        $payroll_earnings =  $request->validate([
            'earningsData' => 'nullable|array',

        ]);
        $payroll_benefits =  $request->validate([
            'benefitsData' => 'nullable|array',
        ]);

        try {
            DB::table('hr_payroll_allrecords')->insert($payroll_records);
            $payroll_id = DB::getPdo()->lastInsertId();


            $earnings_data = $payroll_earnings['earningsData'];
            foreach ($earnings_data as $list) {
                DB::table('hr_payroll_earnings')->insert(
                    array(
                        'payroll_id' => $payroll_id,
                        'applist_id' => $list['applist_id'],
                        'total_earnings' => $list['total_earnings'],
                        'status' => $list['status'],
                        'leaveAbsence' => $list['leaveAbsence'],
                    )
                );
            }

            $benefits_data = $payroll_benefits['benefitsData'];
            foreach ($benefits_data as $list) {
                DB::table('hr_payroll_benefits')->insert(
                    array(
                        'payroll_id' => $payroll_id,
                        'benefitlist_id' => $list['benefitlist_id'],
                        'list_name' => $list['list_name'],
                        'totalAmount' => $list['totalAmount'],
                        'type' => $list['type'],
                        'taxable' => $list['taxable'],
                        'exempt' => $list['exempt'],
                        'amountTotal' => $list['amountTotal'],
                        'emp_id' => $payroll_records['emp_id'],
                    )
                );

                DB::table('hr_employee_benefits')->where('type', 2)->where('benefitlist_id', $list['benefitlist_id'])->where('emp_id', $payroll_records['emp_id'])
                    ->update(['amountTotal' => ($list['amountTotal'] - $list['totalAmount'])]);
            }
            $message = "Success";
        } catch (Exception $e) {
            $message = $e;
        }

        return response()->json([
            'status' => 200,
            'data' => "Success",
            'test' => $payroll_records
        ]);
    }

    public function updateManualBenefits(Request $request)
    {
        $benefitsUpdatedData = $request->validate([
            'emp_id' => 'required',
            'isupdated' => 'required',
            'benefitsList' => 'required'
        ]);

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $benefitsUpdatedData['emp_id'])
            ->first();

        $verifyManualBenefits = DB::table("hr_employee_benefits")->where("emp_id", $benefitsUpdatedData['emp_id'])->where("isupdate", $benefitsUpdatedData['isupdated'])->get();
        try {
            $benefits_listData = $benefitsUpdatedData['benefitsList'];
            foreach ($benefits_listData as $list) {
                $benefitsData = DB::table("hr_employee_benefits_list")->where("benefitlist_id", $list['benefitlist_id'])->get();
                foreach ($benefitsData as $val) {
                    if (count($verifyManualBenefits) != 0) {

                        $getBenefit = DB::table('hr_employee_benefits')->where('emp_id', $benefitsUpdatedData['emp_id'])->where('benefitlist_id', $list['benefitlist_id'])->get();

                        if (count($getBenefit) != 0) {
                            DB::table('hr_employee_benefits')->where('emp_id', $benefitsUpdatedData['emp_id'])->where('benefitlist_id', $list['benefitlist_id'])->where('type', $list['type'])->update([
                                'amount' => $list['totalAmount'],
                            ]);
                        } else {
                            DB::table('hr_employee_benefits')->insert([
                                'description' => $val->title,
                                'amount' => $list['totalAmount'],
                                'type' => $list['type'],
                                'benefitlist_id' => $list['benefitlist_id'],
                                'emp_id' => $benefitsUpdatedData['emp_id'],
                                'isupdate' => $benefitsUpdatedData['isupdated'],
                                'team' => $userTeam->team,
                                'taxable' => $list['taxable'],
                                'exempt' => $list['exempt'],
                                'chooseCutoff' => $list['chooseCutoff'],
                                'amountTotal' => $list['amountTotal']
                            ]);
                        }
                    } else {
                        DB::table('hr_employee_benefits')->insert([
                            'description' => $val->title,
                            'amount' => $list['totalAmount'],
                            'type' => $list['type'],
                            'benefitlist_id' => $list['benefitlist_id'],
                            'emp_id' => $benefitsUpdatedData['emp_id'],
                            'isupdate' => $benefitsUpdatedData['isupdated'],
                            'team' => $userTeam->team,
                            'taxable' => $list['taxable'],
                            'exempt' => $list['exempt'],
                            'chooseCutoff' => $list['chooseCutoff'],
                            'amountTotal' => $list['amountTotal']
                        ]);
                    }
                }
                $message = 'Success';
            }
        } catch (Exception $e) {
            $message = $e->getMessage();
        }

        return response()->json([
            'status' => 200,
            'updatedBenefits' => $message,
        ]);
    }

    public function deleteManualBenefits(Request $request)
    {
        $deleteBenefits = $request->validate([
            'emp_id' => 'required'
        ]);
        try {
            DB::table("hr_employee_benefits")->where("emp_id", $deleteBenefits['emp_id'])->where("isupdate", 1)->delete();
            $message = 'Success';
        } catch (Exception $e) {
            $message =  $e;
        }


        return response()->json([
            'status' => 200,
            'deleteBenefits' => $message,
        ]);
    }

    public function updatePayroll($id, Request $request)
    {
        $earnings_data =  $request->validate([
            'earningsData' => 'required|array'
        ]);
        $benefits_records = $request->validate([
            'benefitsData' => 'nullable|array'
        ]);
        $update_records =  $request->validate([
            'incentives' => 'nullable',
            'allowance' => 'nullable',
            'total_earnings' => 'required',
            'total_deduction' => 'required',
            'total_contribution' => 'nullable',
            'remaining_loan' => 'nullable',
            'total_loan_deduct' => 'nullable',
            'total_taxes' => 'nullable',
            'net_pay' => 'required',
        ]);

        try {

            foreach ($earnings_data['earningsData'] as $earnings) {
                DB::table('hr_payroll_earnings')->where('payroll_id', $id)->where('applist_id', $earnings['applist_id'])->update([
                    'total_earnings' => $earnings['total_earnings']
                ]);
            }

            foreach ($benefits_records['benefitsData'] as $list) {
                DB::table('hr_payroll_benefits')->where('payroll_id', $id)->where('addbenefit_id', $list['addbenefit_id'])->update([
                    'totalAmount' => $list['totalAmount'],
                ]);
            }

            DB::table('hr_payroll_allrecords')->where('payroll_id', $id)->update($update_records);
            $message = "Success";
        } catch (Exception $e) {
            $message = $e;
        }
        return response()->json([
            'status' => 200,
            'updatePayroll' => $message
        ]);
    }

    public function updatepayrollVisibility(Request $request, $id)
    {
        $update_visibility =  $request->validate([
            'payroll_status' => 'required',
        ]);

        try {
            DB::table('hr_payroll_allrecords')->where('payroll_id', $id)->update([
                'payroll_status' => $update_visibility['payroll_status']
            ]);
            $message = "Success";
        } catch (Exception $e) {
            $message = $e;
        }

        return response()->json([
            'status' => 200,
            'payrollStatus' => $message,
        ]);
    }

    public function updatepayrollHide(Request $request, $id)
    {
        $update_visibility =  $request->validate([
            'payroll_status' => 'required',
        ]);

        try {
            DB::table('hr_payroll_allrecords')->where('payroll_id', $id)->update([
                'payroll_status' => $update_visibility['payroll_status']
            ]);

            $message = "Success";
        } catch (Exception $e) {
            $message = $e;
        }

        return response()->json([
            'status' => 200,
            'payrollStatus' => $message,
        ]);
    }

    public function updatepayrollDelete(Request $request, $id)
    {
        $payrollData = $request->validate([
            'payrollData' => 'required|array',

        ]);

        $allrecords = array($payrollData['payrollData']);

        $benefits_records = $request->validate([
            'benefitsData' => 'nullable|array'
        ]);

        try {
            foreach ($allrecords as $userList) {
                $user_id = $userList['user_id'];

                foreach ($benefits_records['benefitsData'] as $list) {
                    DB::table('hr_employee_benefits')
                        ->where('type', 2)
                        ->where('benefitlist_id', $list['benefitlist_id'])
                        ->where('emp_id', $user_id)
                        ->increment('amountTotal', $list['totalAmount']);
                }
            }

            DB::table('hr_payroll_allrecords')->where('payroll_id', $id)->delete();
            DB::table('hr_payroll_earnings')->where('payroll_id', $id)->delete();
            DB::table('hr_payroll_benefits')->where('payroll_id', $id)->delete();

            $message = "Success";
        } catch (Exception $e) {
            $message = $e;
        }

        return response()->json([
            'status' => 200,
            'payrollStatus' => $message,
        ]);
    }
}
