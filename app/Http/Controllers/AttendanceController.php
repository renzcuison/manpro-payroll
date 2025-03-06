<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLogsModel;
use App\Models\AttendanceLogsMobileModel;
use App\Models\ClientsModel;
use App\Models\UsersModel;
use App\Models\WorkDaysModel;
use App\Models\WorkHoursModel;
use App\Models\WorkGroupsModel;
use App\Models\WorkShiftsModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function checkUser()
    {
        // Log::info("AttendanceController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getEmployeeLatestAttendance()
    {
        // log::info("AttendanceController::getEmployeeLatestAttendance");

        $user = Auth::user();

        $latest_attendance = AttendanceLogsModel::where('user_id', $user->id)->latest('created_at')->first();

        return response()->json(['status' => 200, 'latest_attendance' => $latest_attendance,]);
    }

    public function getEmployeeWorkDayAttendance(Request $request)
    {
        // Log::info("AttendanceController::getEmployeeWorkDayAttendance");
        $workDate = $request->input('work_date');

        $user = Auth::user();

        $employeeId = $user->id;
        if ($this->checkUser() && $request->input('employee')) {
            $employeeId = $request->input('employee');
        }

        $attendance = AttendanceLogsModel::where('user_id', $employeeId)->whereDate('timestamp', $workDate)->get();

        return response()->json(['status' => 200, 'attendance' => $attendance]);
    }

    public function saveEmployeeAttendance(Request $request)
    {
        // log::info("AttendanceController::saveEmployeeAttendance");

        $validated = $request->validate(['action' => 'required']);

        $user = Auth::user();

        if ($validated) {
            try {
                DB::beginTransaction();

                AttendanceLogsModel::create([
                    "user_id" => $user->id,
                    "work_hour_id" => $user->workShift->work_hour_id,
                    "action" => $request->action,
                    "method" => 1,
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

    public function saveMobileEmployeeAttendance(Request $request)
    {
        // log::info("AttendanceController::saveMobileEmployeeAttendance");

        $validated = $request->validate(['action' => 'required']);

        $user = Auth::user();

        if ($validated) {
            try {
                DB::beginTransaction();

                $attendance = AttendanceLogsModel::create([
                    "user_id" => $user->id,
                    "work_hour_id" => $user->workShift->work_hour_id,
                    "action" => $request->action,
                    "method" => 1,
                ]);

                $dateTime = now()->format('YmdHis');

                if ($request->hasFile('image')) {
                    $image = $request->file('image');
                    $imageName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $image->getClientOriginalExtension();
                    $imagePath = $image->storeAs('attendance/mobile', $imageName, 'public');
                    AttendanceLogsMobileModel::create([
                        "attendance_id" => $attendance->id,
                        "path" => $imagePath
                    ]);
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                //Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function recordEmployeeAttendance(Request $request)
    {
        //log::info("AttendanceController::recordEmployeeAttendance");
        $validated = $request->validate(['action' => 'required']);

        $user = Auth::user();

        if ($this->checkUser() && $validated) {
            $employee = UsersModel::where('client_id', $user->client_id)->where('id', $request->input('employee'))->first();
            try {
                DB::beginTransaction();

                AttendanceLogsModel::create([
                    "user_id" => $employee->id,
                    "work_hour_id" => $employee->workShift->work_hour_id,
                    "action" => $request->input('action'),
                    "timestamp" => $request->input('timestamp'),
                    "method" => 1,
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

    public function getAttendanceLogs()
    {
        // Log::info("AttendanceController::getAttendanceLogs");

        if ($this->checkUser()) {
            $user = Auth::user();
            $clientId = $user->client_id;

            $attendances = [];
            $rawAttendances = AttendanceLogsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })->orderBy('timestamp', 'desc')->get();

            foreach ($rawAttendances as $rawAttendance) {
                $employee = UsersModel::select('id', 'first_name', 'middle_name', 'last_name', 'suffix', 'branch_id', 'department_id', 'role_id')->find($rawAttendance->user_id);

                $attendances[] = [
                    'id' => $rawAttendance->id,
                    'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                    'branch' => $employee->branch->name ?? '-',
                    'department' => $employee->department->name ?? '-',
                    'role' => $employee->role->name ?? '-',
                    'timeStamp' => $rawAttendance->timestamp,
                    'action' => $rawAttendance->action,
                ];
            }


            return response()->json(['status' => 200, 'attendances' => $attendances]);
        }

        return response()->json(['status' => 200, 'attendances' => null]);
    }

    public function getEmployeeAttendanceLogs(Request $request)
    {
        // Log::info("AttendanceController::getEmployeeAttendanceLogs");

        $user = Auth::user();
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $action = $request->input('action');

        $query = AttendanceLogsModel::where('user_id', $user->id)
            ->whereBetween('timestamp', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);

        if ($action !== 'All') {
            $query->where('action', $action);
        }

        $attendances = $query->orderBy('timestamp', 'desc')->get();

        return response()->json(['status' => 200, 'attendances' => $attendances]);
    }

    public function getAttendanceSummary(Request $request)
    {
        //Log::info("AttendanceController::getAttendanceSummary");
        //Log::info($request);
        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $month = $request->input('month', Carbon::now()->month);
            $year = $request->input('year', Carbon::now()->year);

            try {
                // Retrieve Employees
                $employees = UsersModel::where('client_id', $clientId)
                    ->where('user_type', 'Employee')
                    ->where('employment_status', 'Active')
                    ->with(['branch', 'department', 'role'])
                    ->get();

                // Retrieve Holidays
                $holidays = $this->getNagerHolidays($year);

                // Attendance Compiler
                $attendanceSummary  = $employees->map(function ($employee) use ($month, $year, $holidays) {
                    // Retrieve Daily Logs per Employee
                    $attendanceLogs = AttendanceLogsModel::with('workHour')
                        ->where('user_id', $employee->id)
                        ->whereYear('timestamp', $year)
                        ->whereMonth('timestamp', $month)
                        ->orderBy('timestamp', 'asc')
                        ->get()
                        ->groupBy(function ($log) {
                            return Carbon::parse($log->timestamp)->format('Y-m-d');
                        });

                    // Data Prep
                    $totalRendered = 0;         // minutes
                    $totalOvertime = 0;         // minutes
                    $totalLate = 0;             // minutes
                    $totalAbsences = 0;         // days
                    $totalShiftDuration = 0;    // minutes
                    $dutyInFound = false;
                    $overtimeInFound = false;

                    $dutyStart = Carbon::now();
                    $dutyEnd = Carbon::now();

                    // Loop Variables
                    $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
                    $endDay = ($year == Carbon::now()->year &&  $month == Carbon::now()->month) ? Carbon::now()->day : $daysInMonth;

                    // Compiler Loop
                    foreach (range(1, $endDay) as $day) {
                        // Data Prep
                        $currentDate = Carbon::create($year, $month, $day)->startOfDay();

                        if (!$currentDate->isWeekend() && !in_array($currentDate->format('Y-m-d'), $holidays)) {
                            $logs = $attendanceLogs->get($currentDate->format('Y-m-d'));

                            // Attendance Found for the Day'
                            if ($logs) {
                                // Shift Type
                                $shiftType = $logs->first()->workHour->shift_type ?? 'Regular';
                                // Day Marker
                                $today = Carbon::today();

                                // Start-End Times
                                $workStartTimes = [
                                    Carbon::parse($logs->first()->workHour->first_time_in ?? '00:00:00')
                                        ->setYear($currentDate->year)
                                        ->setMonth($currentDate->month)
                                        ->setDay($currentDate->day),

                                    Carbon::parse($logs->first()->workHour->second_time_in ?? '00:00:00')
                                        ->setYear($currentDate->year)
                                        ->setMonth($currentDate->month)
                                        ->setDay($currentDate->day),
                                ];

                                $workEndTimes = [
                                    // Regular
                                    Carbon::parse($logs->first()->workHour->first_time_out ?? '00:00:00')
                                        ->setYear($currentDate->year)
                                        ->setMonth($currentDate->month)
                                        ->setDay($currentDate->day),
                                    //Split
                                    Carbon::parse($logs->first()->workHour->second_time_out ?? '00:00:00')
                                        ->setYear($currentDate->year)
                                        ->setMonth($currentDate->month)
                                        ->setDay($currentDate->day),
                                ];

                                // Breaks
                                $breakStart = Carbon::parse($logs->first()->workHour->break_start ?? '00:00:00')
                                    ->setYear($currentDate->year)
                                    ->setMonth($currentDate->month)
                                    ->setDay($currentDate->day);
                                $breakEnd = Carbon::parse($logs->first()->workHour->break_end ?? '00:00:00')
                                    ->setYear($currentDate->year)
                                    ->setMonth($currentDate->month)
                                    ->setDay($currentDate->day);

                                // Shift Duration
                                $totalShiftDuration = null;

                                // Work Hour Preparations
                                $actualStart = null;
                                $actualEnd = null;
                                $gapStart = null;
                                $gapEnd = null;

                                // Daily Attendance Recorder
                                foreach ($logs as $log) {

                                    if ($log->action == "Duty In" || $log->action == "Overtime In") {
                                        if ($log->action == "Duty In") {
                                            $dutyStart = Carbon::parse($log->timestamp)->setDate($today->year, $today->month, $today->day);
                                            $dutyInFound = true;
                                            $overtimeInFound = false;
                                        } else {
                                            $dutyStart = Carbon::parse($log->timestamp)->setDate($today->year, $today->month, $today->day);
                                            $overtimeInFound = true;
                                            $dutyInFound = false;
                                        }
                                    } else if (($dutyInFound && $log->action == "Duty Out") || ($overtimeInFound && $log->action == "Overtime Out")) {
                                        $dutyEnd = Carbon::parse($log->timestamp)->setDate($today->year, $today->month, $today->day);
                                        $dutyInFound = false;
                                        $overtimeInFound = false;

                                        switch ($shiftType) {
                                            case "Regular":
                                                //Log::info("Regular");
                                                $actualStart = $workStartTimes[0]->setDate($today->year, $today->month, $today->day);
                                                $actualEnd = $workEndTimes[0]->setDate($today->year, $today->month, $today->day);
                                                $gapStart = $breakStart->setDate($today->year, $today->month, $today->day);
                                                $gapEnd = $breakEnd->setDate($today->year, $today->month, $today->day);
                                                $totalShiftDuration = max(0, $workEndTimes[0]->diffInMinutes($workStartTimes[0]) - $breakStart->diffInMinutes($breakEnd));
                                                //Log::info('Actual Start:    ' . $actualStart);
                                                //Log::info('Actual End:      ' . $actualEnd);
                                                //Log::info('Duration         ' . $totalShiftDuration);
                                                break;
                                            case "Split":
                                                //Log::info("Split");
                                                $gapStart = $workEndTimes[0]->setDate($today->year, $today->month, $today->day);
                                                $gapEnd = $workStartTimes[1]->setDate($today->year, $today->month, $today->day);
                                                if ($dutyStart->format('H:i:s') < $gapStart->format('H:i:s')) {
                                                    $actualStart = $workStartTimes[0]->setDate($today->year, $today->month, $today->day);
                                                    $actualEnd = $gapStart;
                                                } else {
                                                    $actualStart = $gapEnd;
                                                    $actualEnd = $workEndTimes[1]->setDate($today->year, $today->month, $today->day);
                                                }
                                                $totalShiftDuration = $actualEnd->diffInMinutes($actualStart);
                                                //Log::info('Actual Start:    ' . $actualStart);
                                                //Log::info('Actual End:      ' . $actualEnd);
                                                //Log::info('Duration         ' . $totalShiftDuration);
                                                break;
                                            default: // Use "Regular" by default
                                                //Log::info("Default");
                                                $actualStart = $workStartTimes[0]->setDate($today->year, $today->month, $today->day);
                                                $actualEnd = $workEndTimes[0]->setDate($today->year, $today->month, $today->day);
                                                $gapStart = $breakStart->setDate($today->year, $today->month, $today->day);
                                                $gapEnd = $breakEnd->setDate($today->year, $today->month, $today->day);
                                                $totalShiftDuration = max(0, $workEndTimes[0]->diffInMinutes($workStartTimes[0]) - $breakStart->diffInMinutes($breakEnd));
                                                //Log::info($totalShiftDuration);
                                                break;
                                        }

                                        //Calculations
                                        $renderedStart = max($dutyStart, $actualStart);
                                        $renderedEnd = min($dutyEnd, $actualEnd);
                                        $minutesRendered = $renderedEnd->diffInMinutes($renderedStart);

                                        // Remove Break Time 
                                        if ($log->shift_type == "Regular" && $gapStart && $gapEnd) {
                                            $overlapStart = max($renderedStart, $gapStart);
                                            $overlapEnd = min($renderedEnd, $gapEnd);

                                            if ($overlapStart->format('H:i:s') < $overlapEnd->format('H:i:s')) {
                                                $totalOverlap = $overlapEnd->diffInMinutes($overlapStart);
                                                $minutesRendered -= $totalOverlap;
                                            }
                                            $minutesRendered = max($minutesRendered, 0);
                                        }

                                        if ($log->action == "Duty Out") {
                                            $totalRendered += $minutesRendered;
                                            $totalLate += max(0, $totalShiftDuration - $minutesRendered);
                                        } else { // "Overtime Out"
                                            $totalOvertime += $minutesRendered;
                                        }

                                        // Log::info('Render           ' . $minutesRendered);
                                        // Log::info('Total:           ' . $totalRendered);
                                        // Log::info('Late             ' . $totalLate);
                                    }
                                }
                            } else { // No Attendance Found, Employee is Absent
                                //Log::Info('Absent For The Day');
                                $totalAbsences++;
                            }
                        } else {
                            // do nothing, skip day
                        }
                    }

                    $branchInfo = $employee->branch
                        ? "{$employee->branch->name} ({$employee->branch->acronym})"
                        : 'N/A';

                    $departmentInfo = $employee->department
                        ? "{$employee->department->name} ({$employee->department->acronym})"
                        : 'N/A';

                    return [
                        'emp_id' => $employee->id,
                        'emp_user_name' => $employee->user_name,
                        'emp_first_name' => $employee->first_name,
                        'emp_middle_name' => $employee->middle_name,
                        'emp_last_name' => $employee->last_name,
                        'emp_suffix' => $employee->suffix,
                        'emp_branch' => $branchInfo,
                        'emp_department' => $departmentInfo,
                        'emp_role' => $employee->role->name ?? 'N/A',
                        'total_rendered' => $totalRendered,
                        'total_late' => $totalLate,
                        'total_absences' => $totalAbsences,
                        'total_overtime' => $totalOvertime,
                    ];
                })->all();
            } catch (\Exception $e) {
                Log::error("Error in getAttendanceSummary: " . $e->getMessage());
                return response()->json(['status' => 500, 'summary' => null], 500);
            }
            return response()->json(['status' => 200, 'summary' => $attendanceSummary]);
        } else {
            return response()->json(['status' => 200, 'summary' => null]);
        }
    }

    public function getEmployeeAttendanceSummary(Request $request)
    {
        //Log::info("WorkScheduleController::getEmployeeAttendanceSummary");

        $user = Auth::user();
        $fromDate = $request->input('summary_from_date');
        $toDate = $request->input('summary_to_date');

        $employeeId = $user->id;
        if ($this->checkUser() && $request->input('employee')) {
            $employeeId = $request->input('employee');
        }
        // Fetch and process attendance logs for summary
        $summaryData = DB::table('attendance_logs as al')
            ->join('work_hours as wh', 'al.work_hour_id', '=', 'wh.id')
            ->where('al.user_id', $employeeId)
            ->whereBetween('al.timestamp', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->select('al.*', 'wh.shift_type', 'wh.first_time_in', 'wh.first_time_out', 'wh.second_time_in', 'wh.second_time_out', 'wh.over_time_in', 'wh.over_time_out', 'wh.break_start', 'wh.break_end')
            ->orderBy('al.timestamp', 'asc')
            ->get()
            ->groupBy(function ($log) {
                return Carbon::parse($log->timestamp)->format('Y-m-d');
            })
            ->sortKeysDesc()
            ->map(function ($logs, $date) {
                // Find first time in
                $timeIn = $logs->firstWhere('action', 'Duty In');

                // Find last time out
                $timeOut = $logs->last(function ($log) {
                    return $log->action == 'Duty Out';
                });

                // Find first overtime in
                $overtimeIn = $logs->firstWhere('action', 'Overtime In');

                // Find last overtime out
                $overtimeOut = $logs->last(function ($log) {
                    return $log->action == 'Overtime Out';
                });

                // Attendance Counters
                $totalRendered = 0;
                $totalOvertime = 0;
                $totalLate = 0;
                $dutyInFound = false;
                $overtimeInFound = false;
                $dutyStart = Carbon::now();
                $dutyEnd = Carbon::now();

                // Total Shift Duration Reader
                if ($logs->first()->shift_type == "Regular") {
                    $shiftStart = Carbon::parse($logs->first()->first_time_in);
                    $shiftEnd = Carbon::parse($logs->first()->first_time_out);
                    $gapStart = Carbon::parse($logs->first()->break_start);
                    $gapEnd = Carbon::parse($logs->first()->break_end);

                    $totalShiftDuration = $shiftStart->diffInMinutes($shiftEnd) - $gapStart->diffInMinutes($gapEnd);
                    $totalShiftDuration = max($totalShiftDuration, 0);
                } elseif ($logs->first()->shift_type == "Split") {
                    $shiftFirstStart = Carbon::parse($logs->first()->first_time_in);
                    $shiftFirstEnd = Carbon::parse($logs->first()->first_time_out);
                    $shiftSecondStart = Carbon::parse($logs->first()->second_time_in);
                    $shiftSecondEnd = Carbon::parse($logs->first()->second_time_out);

                    $shiftFirstTime = $shiftFirstStart->diffInMinutes($shiftFirstEnd);
                    $shiftSecondTime = $shiftSecondStart->diffInMinutes($shiftSecondEnd);
                    $totalShiftDuration = $shiftFirstTime + $shiftSecondTime;
                } else {
                    $totalShiftDuration = 0;
                }

                // Rendered Minutes Calculator
                foreach ($logs as $log) {
                    if ($log->action == "Duty In" || $log->action == "Overtime In") {
                        if ($log->action == "Duty In") {
                            $dutyStart = Carbon::parse($log->timestamp);
                            $dutyInFound = true;
                            $overtimeInFound = false;
                        } else {
                            $dutyStart = Carbon::parse($log->timestamp);
                            $overtimeInFound = true;
                            $dutyInFound = false;
                        }
                    } elseif (($dutyInFound && $log->action == "Duty Out") || ($overtimeInFound && $log->action == "Overtime Out")) {
                        $dutyEnd = Carbon::parse($log->timestamp);
                        $dutyInFound = false;
                        $overtimeInFound = false;

                        // Total Hours Calculation [PREP]
                        $actualStart = null;
                        $actualEnd = null;
                        $gapStart = null;
                        $gapEnd = null;
                        if ($log->action == "Duty Out") {
                            switch ($log->shift_type) {
                                case 'Regular':
                                    $actualStart = Carbon::parse($log->first_time_in);
                                    $actualEnd = Carbon::parse($log->first_time_out);
                                    $gapStart = Carbon::parse($log->break_start);
                                    $gapEnd = Carbon::parse($log->break_end);
                                    break;
                                case 'Split':
                                    $firstPartEnd = Carbon::parse($log->first_time_out);
                                    $secondPartStart = Carbon::parse($log->second_time_in);
                                    if ($dutyStart->format('H:i:s') < $firstPartEnd->format('H:i:s')) {
                                        $actualStart = Carbon::parse($log->first_time_in);
                                        $actualEnd = $firstPartEnd;
                                    } else {
                                        $actualStart = $secondPartStart;
                                        $actualEnd = Carbon::parse($log->second_time_out);
                                    }
                                    break;
                                default:
                                    $actualStart = $dutyStart;
                                    $actualEnd = $dutyEnd;
                            }
                        } else {
                            $actualStart = Carbon::parse($log->over_time_in);
                            $actualEnd = Carbon::parse($log->over_time_out);
                        }

                        // Total Hours Calculation [MAIN]
                        if (
                            $dutyStart->format('H:i:s') < $actualEnd->format('H:i:s')
                            &&
                            $dutyEnd->format('H:i:s') > $actualStart->format('H:i:s')
                        ) {
                            // Normalizes dates to exclusively compare time
                            $today = Carbon::today();
                            $fixedDutyStart = $dutyStart->setDate($today->year, $today->month, $today->day);
                            $fixedDutyEnd = $dutyEnd->setDate($today->year, $today->month, $today->day);
                            $fixedActualStart = $actualStart->setDate($today->year, $today->month, $today->day);
                            $fixedActualEnd = $actualEnd->setDate($today->year, $today->month, $today->day);
                            $fixedGapStart = $gapStart ? $gapStart->setDate($today->year, $today->month, $today->day) : null;
                            $fixedGapEnd = $gapEnd ? $gapEnd->setDate($today->year, $today->month, $today->day) : null;

                            $renderedStart = max($fixedDutyStart, $fixedActualStart);
                            $renderedEnd = min($fixedDutyEnd, $fixedActualEnd);
                            $minutesRendered = $renderedEnd->diffInMinutes($renderedStart);

                            // Remove Rendered Time during Break
                            if ($log->action == "Duty Out" && $log->shift_type == 'Regular' && $fixedGapStart && $fixedGapEnd) {
                                $breakOverlapStart = max($renderedStart, $fixedGapStart);
                                $breakOverlapEnd = min($renderedEnd, $fixedGapEnd);

                                if ($breakOverlapStart->format('H:i:s') < $breakOverlapEnd->format('H:i:s')) {
                                    $breakOverlap = $breakOverlapStart->diffInMinutes($breakOverlapEnd);
                                    $minutesRendered -= $breakOverlap;
                                }

                                $minutesRendered = max($minutesRendered, 0);
                            }

                            if ($log->action == "Duty Out") {
                                $totalRendered += $minutesRendered;
                            } else { // action is "Overtime Out"
                                $totalOvertime += $minutesRendered;
                            }
                        }
                    }
                }

                $totalLate = $totalShiftDuration - $totalRendered;

                return [
                    'date' => $date,
                    'time_in' => $timeIn ? $timeIn->timestamp : null,
                    'time_out' => $timeOut ? $timeOut->timestamp : null,
                    'overtime_in' => $overtimeIn ? $overtimeIn->timestamp : null,
                    'overtime_out' => $overtimeOut ? $overtimeOut->timestamp : null,
                    'total_rendered' => $totalRendered,
                    'total_overtime' => $totalOvertime,
                    'late_time' => $totalLate
                ];
            })
            ->values()
            ->all();

        return response()->json(['status' => 200, 'summary' => $summaryData]);
    }

    public function getEmployeeDashboardAttendance()
    {
        //Log::info("WorkScheduleController::getEmployeeDashboardAttendance");

        $user = Auth::user();

        $attendances = AttendanceLogsModel::where('user_id', $user->id)
            ->orderBy('timestamp', 'asc')
            ->get()
            ->groupBy(function ($log) {
                return Carbon::parse($log->timestamp)->format('Y-m-d');
            })
            ->sortKeysDesc()
            ->map(function ($logs, $date) {
                // Find first time in
                $timeIn = $logs->firstWhere('action', 'Duty In');

                // Find last time out
                $timeOut = $logs->last(function ($log) {
                    return $log->action == 'Duty Out';
                });

                // Find first overtime in
                $overtimeIn = $logs->firstWhere('action', 'Overtime In');

                // Find last overtime out
                $overtimeOut = $logs->last(function ($log) {
                    return $log->action == 'Overtime Out';
                });

                return [
                    'date' => $date,
                    'time_in' => $timeIn ? $timeIn->timestamp : null,
                    'time_out' => $timeOut ? $timeOut->timestamp : null,
                    'overtime_in' => $overtimeIn ? $overtimeIn->timestamp : null,
                    'overtime_out' => $overtimeOut ? $overtimeOut->timestamp : null,
                ];
            })
            ->take(10)
            ->values()
            ->all();

        return response()->json(['status' => 200, 'attendances' => $attendances]);
    }

    public function getNagerHolidays($year)
    {
        $holidays = [];
        $countryCode = 'PH';

        $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}";

        $response = Http::get($url);

        if ($response->successful()) {
            $data = $response->json();

            // Log the API response for debugging
            // Log::info("Nager.Date API Response for {$year}: " . json_encode($data));

            // Ensure $data is an array before iterating
            if (is_array($data)) {
                foreach ($data as $holiday) {
                    $holidays[] = Carbon::parse($holiday['date'])->format('Y-m-d');
                }
            } else {
                Log::error("Nager.Date API returned invalid data for year {$year}: " . json_encode($data));
            }
        } else {
            Log::error("Failed to fetch holidays from Nager.Date API for year {$year}: " . $response->status());
            Log::error($response->body());
        }

        return $holidays;
    }
}
