<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\AttendanceSummary;
use App\Models\AttendanceLogsModel;
use App\Models\ApplicationsOvertimeModel;
use App\Models\AttendanceLogsMobileModel;
use App\Models\WorkHoursModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

use Carbon\Carbon;
use stdClass;

class AttendanceController extends Controller
{
    // Authentication
    public function checkUserAdmin()
    {
        // Log::info("AttendanceController::checkUserAdmin");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function checkUserEmployee()
    {
        // Log::info("AttendanceController::checkUserEmployee");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Employee') {
                return true;
            }
        }

        return false;
    }

    // Logs
    public function getAttendanceLogs(Request $request)
    {
        // Log::info("AttendanceController::getAttendanceLogs");
        // Log::info($request);

        if ($this->checkUserAdmin()) {
            $user = Auth::user();
            $clientId = $user->client_id;

            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $rawAttendances = AttendanceLogsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })
                ->whereBetween('timestamp', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
                ->orderBy('timestamp', 'desc')->get();

            $attendances = [];
            foreach ($rawAttendances as $rawAttendance) {
                $employee = UsersModel::select('id', 'first_name', 'middle_name', 'last_name', 'suffix', 'branch_id', 'department_id', 'role_id')
                    ->find($rawAttendance->user_id);

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

    public function getAttendanceAdderLogs(Request $request)
    {
        $user = Auth::user();
        $empId = $request->input('employee');
        $employee = UsersModel::find($empId);

        if ($this->checkUserAdmin() && $user->client_id == $employee->client_id) {
            $attendances = AttendanceLogsModel::with('workHour')
                ->where('user_id', $empId)
                ->whereDate('timestamp', $request->input('date'))
                ->orderBy('timestamp', 'asc')
                ->get();

            $firstIn = null;
            $firstOut = null;
            $secondIn = null;
            $secondOut = null;
            $overtimeIn = null;
            $overtimeOut = null;

            if ($attendances->isNotEmpty()) {
                $dutyIns = $attendances->filter(function ($log) {
                    return $log->action === 'Duty In';
                })->values();
                $dutyOuts = $attendances->filter(function ($log) {
                    return $log->action === 'Duty Out';
                })->values();

                $firstIn = $dutyIns->get(0)->timestamp ?? null;
                $secondIn = $dutyIns->get(1)->timestamp ?? null;

                $firstOut = $dutyOuts->get(0)->timestamp ?? null;
                $secondOut = $dutyOuts->get(1)->timestamp ?? null;

                // Handle overtime
                $overtimeIn = $attendances->firstWhere('action', 'Overtime In')->timestamp ?? null;
                $overOut = $attendances->last(function ($log) {
                    return $log->action === 'Overtime Out';
                });
                $overtimeOut = $overOut->timestamp ?? null;
            }

            $attendanceData = new stdClass();
            $attendanceData->first_in = $firstIn;
            $attendanceData->first_out = $firstOut;
            $attendanceData->second_in = $secondIn;
            $attendanceData->second_out = $secondOut;
            $attendanceData->overtime_in = $overtimeIn;
            $attendanceData->overtime_out = $overtimeOut;

            return response()->json(['status' => 200, 'attendance' => $attendanceData]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Log Sublists
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
        if ($this->checkUserAdmin() && $request->input('employee')) {
            $employeeId = $request->input('employee');
        }

        $attendance = AttendanceLogsModel::where('user_id', $employeeId)
            ->whereDate('timestamp', $workDate)
            ->orderBy('timestamp', 'asc')
            ->get();

        return response()->json(['status' => 200, 'attendance' => $attendance]);
    }

    // Recorders
    public function saveEmployeeAttendance(Request $request)
    {
        log::info("AttendanceController::saveEmployeeAttendance");

        $validated = $request->validate(['action' => 'required']);

        $user = Auth::user();

        if ($validated) {
            try {
                DB::beginTransaction();

                log::info($request);
                log::info($request->action);

                $workHour = WorkHoursModel::find($user->workShift->work_hour_id);
                $attendanceLog = AttendanceLogsModel::create([ "user_id" => $user->id, "work_hour_id" => $workHour->id, "action" => $request->action, "method" => 1 ]);
                
                $day = \Carbon\Carbon::parse($attendanceLog->timestamp)->toDateString();

                $dayStart = Carbon::parse("$day {$workHour->first_time_in}");

                if ($workHour->shift_type === 'Regular') {
                    $dayEnd = Carbon::parse("$day {$workHour->first_time_out}");
                } elseif ($workHour->shift_type === 'Split') {
                    $dayEnd = Carbon::parse("$day {$workHour->second_time_out}");
                }

                log::info("Day Start: " . $dayStart);
                log::info("Day End: " . $dayEnd);

                $action = $attendanceLog->action;
                $summary = AttendanceSummary::where('user_id', $user->id)->where('work_day_start', $dayStart)->where('work_day_end', $dayEnd)->first();

                log::info($summary);

                if ( $summary ) {
                    log::info("Has Summary");

                    if ( $action === "Time In" ) {

                    }

                } else {
                    log::info("Has No Summary");

                    log::info("Creating New Summary");

                    log::info($attendanceLog->id);

                    if ( $action === "Duty In" ) {
                        $summary = AttendanceSummary::create([
                            "user_id" => $user->id,
                            "client_id" => $user->client_id,
                            "work_hour_id" => $workHour->id,
                            
                            "work_day_start" => $dayStart,
                            "work_day_end" => $dayEnd,

                            "work_day_end" => "Regular Day",
                            
                            "latest_log_id" => $attendanceLog->id,
                        ]);
                    }

                    log::info("New Summary");
                    log::info($summary);
                }

                $attendanceLog->attendance_summary_id = $summary->id;
                $attendanceLog->save();


                // log::info("Stopper");
                // dd("Stopper");
                

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                //Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function saveAttendanceSummary()
    {
        log::info("AttendanceController::saveAttendanceSummary");
    }


/*
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
    } */

    // Management
    public function recordEmployeeAttendance(Request $request)
    {
        Log::info("AttendanceController::recordEmployeeAttendance");
        // Log::info($request);

        $user = Auth::user();
        $empId = $request->input('employee');
        $employee = UsersModel::with('workShift')->find($empId);

        if (!$employee || !$employee->workShift) {
            return response()->json(['status' => 404, 'message' => 'Employee Details Not Found'], 404);
        }

        if ($this->checkUserAdmin() && $user->client_id == $employee->client_id) {
            try {
                DB::beginTransaction();

                AttendanceLogsModel::where('user_id', $empId)
                    ->whereDate('timestamp', $request->input('date'))
                    ->delete();

                $logs = [
                    ['action' => 'Duty In', 'timestamp' => $request->input('first_in')],
                    ['action' => 'Duty Out', 'timestamp' => $request->input('first_out')],
                    ['action' => 'Duty In', 'timestamp' => $request->input('second_in')],
                    ['action' => 'Duty Out', 'timestamp' => $request->input('second_out')],
                    ['action' => 'Overtime In', 'timestamp' => $request->input('overtime_in')],
                    ['action' => 'Overtime Out', 'timestamp' => $request->input('overtime_out')],
                ];

                //Log::info($logs);

                foreach ($logs as $log) {
                    if ($log['timestamp']) {
                        AttendanceLogsModel::create([
                            'user_id' => $employee->id,
                            'work_hour_id' => $employee->workShift->work_hour_id,
                            'action' => $log['action'],
                            'timestamp' => $log['timestamp'],
                            'method' => 0,
                        ]);
                    }
                }

                DB::commit();
                return response()->json(['status' => 200, 'message' => 'Attendance recorded successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error recording attendance', ['error' => $e->getMessage()]);
                return response()->json(['status' => 500, 'message' => 'Failed to record attendance: ' . $e->getMessage()], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function addAttendanceLog(Request $request)
    {
        Log::info("AttendanceController::addAttendanceLog");
        //Log::info($request);

        $user = Auth::user();
        $empId = $request->input('employee');
        $employee = UsersModel::with('workShift')->find($empId);

        if (!$employee || !$employee->workShift) {
            return response()->json(['status' => 404, 'message' => 'Employee Details Not Found'], 404);
        }

        if ($this->checkUserAdmin() && $user->client_id == $employee->client_id) {
            try {
                DB::beginTransaction();

                AttendanceLogsModel::create([
                    'action' => $request->input('action'),
                    'timestamp' => $request->input('timestamp'),
                    'user_id' => $empId,
                    'work_hour_id' => $employee->workShift->work_hour_id,
                    'method' => 0,
                ]);

                DB::commit();
                return response()->json(['status' => 200, 'message' => 'Attendance recorded successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error recording attendance', ['error' => $e->getMessage()]);
                return response()->json(['status' => 500, 'message' => 'Failed to record attendance: ' . $e->getMessage()], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editEmployeeAttendance(Request $request)
    {
        //Log::info("AttendanceController::editEmployeeAttendance");
        //Log::info($request);

        $user = Auth::user();
        $attendance = AttendanceLogsModel::with('user')->find($request->input('attendance_id'));
        $employee = $attendance->user;

        if ($this->checkUserAdmin() && $user->client_id == $employee->client_id) {
            try {
                DB::beginTransaction();

                $newType = $request->input('new_type');
                $newTime = Carbon::parse($request->input('timestamp'));

                $attendance->action = $newType;
                $attendance->timestamp = $newTime;
                $attendance->save();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error updating attendance', ['error' => $e->getMessage()]);
                return response()->json(['status' => 500, 'message' => 'Error updating attendance log'], 500);
                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function deleteEmployeeAttendance(Request $request)
    {
        //Log::info("AttendanceController::deleteEmployeeAttendance");
        //Log::info($request);

        $user = Auth::user();
        $attendance = AttendanceLogsModel::with('user')->find($request->input('log_id'));
        $employee = $attendance->user;

        if ($this->checkUserAdmin() && $user->client_id == $employee->client_id) {
            try {
                DB::beginTransaction();

                $attendance->delete();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error deleting attendance', ['error' => $e->getMessage()]);
                return response()->json(['status' => 500, 'message' => 'Error deleting attendance log'], 500);
                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Summaries
    public function getAttendanceSummary(Request $request)
    {
        //Log::info("AttendanceController::getAttendanceSummary");
        //Log::info($request);
        $user = Auth::user();

        if ($this->checkUserAdmin()) {
            $clientId = $user->client_id;
            $month = $request->input('month', Carbon::now()->month);
            $year = $request->input('year', Carbon::now()->year);

            try {
                // Retrieve Employees
                $query = UsersModel::where('client_id', $clientId)
                    ->where('user_type', 'Employee')
                    ->where('employment_status', 'Active')
                    ->with(['branch', 'department', 'role']);

                if ($request->input('branch') > 0) {
                    $query->where('branch_id', $request->input('branch'));
                }
                if ($request->input('department') > 0) {
                    $query->where('department_id', $request->input('department'));
                }

                $employees = $query->get();
                // Retrieve Holidays
                $holidays = $this->getNagerHolidays($year);

                // Attendance Compiler
                $attendanceSummary = $employees->map(function ($employee) use ($month, $year, $holidays) {
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
                    $dutyInFound = false;
                    $overtimeInFound = false;

                    // Determine Workdays (excluding weekends and holidays)
                    $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
                    $endDay = ($year == Carbon::now()->year && $month == Carbon::now()->month) ? Carbon::now()->subDay()->day : $daysInMonth;

                    $workDays = collect(range(1, $endDay))
                        ->map(fn($day) => Carbon::create($year, $month, $day))
                        ->filter(fn($date) => !$date->isWeekend() && !in_array($date->format('Y-m-d'), $holidays))
                        ->map(fn($date) => $date->format('Y-m-d'));

                    // Calculate Absences: Workdays with no logs
                    $loggedDays = $attendanceLogs->keys();
                    $totalAbsences = $workDays->diff($loggedDays)->count();

                    // Process Each Day with Logs
                    foreach ($attendanceLogs as $date => $logs) {
                        if ($date === Carbon::today()->format('Y-m-d')) {
                            continue;
                        }
                        $currentDate = Carbon::parse($date);
                        $today = Carbon::today();
                        $totalDayRendered = 0;

                        // Shift Type
                        $shiftType = $logs->first()->workHour->shift_type ?? 'Regular';

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
                            Carbon::parse($logs->first()->workHour->first_time_out ?? '00:00:00')
                                ->setYear($currentDate->year)
                                ->setMonth($currentDate->month)
                                ->setDay($currentDate->day),
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

                        legato: // Overtime
                        $overtimeStart = Carbon::parse($logs->first()->workHour->over_time_in ?? '00:00:00')
                            ->setYear($currentDate->year)
                            ->setMonth($currentDate->month)
                            ->setDay($currentDate->day);
                        $overtimeEnd = Carbon::parse($logs->first()->workHour->over_time_out ?? '23:59:59')
                            ->setYear($currentDate->year)
                            ->setMonth($currentDate->month)
                            ->setDay($currentDate->day);

                        // Calculate Total Shift Duration
                        $totalShiftDuration = 0;
                        if ($shiftType == "Regular") {
                            $shiftStart = Carbon::parse($logs->first()->workHour->first_time_in);
                            $shiftEnd = Carbon::parse($logs->first()->workHour->first_time_out);
                            $gapStart = Carbon::parse($logs->first()->workHour->break_start);
                            $gapEnd = Carbon::parse($logs->first()->workHour->break_end);
                            $totalShiftDuration = $shiftStart->diffInMinutes($shiftEnd) - $gapStart->diffInMinutes($gapEnd);
                            $totalShiftDuration = max($totalShiftDuration, 0);
                        } elseif ($shiftType == "Split") {
                            $shiftFirstStart = Carbon::parse($logs->first()->workHour->first_time_in);
                            $shiftFirstEnd = Carbon::parse($logs->first()->workHour->first_time_out);
                            $shiftSecondStart = Carbon::parse($logs->first()->workHour->second_time_in);
                            $shiftSecondEnd = Carbon::parse($logs->first()->workHour->second_time_out);
                            $shiftFirstTime = $shiftFirstStart->diffInMinutes($shiftFirstEnd);
                            $shiftSecondTime = $shiftSecondStart->diffInMinutes($shiftSecondEnd);
                            $totalShiftDuration = $shiftFirstTime + $shiftSecondTime;
                        }

                        // Work Hour Preparations
                        $actualStart = null;
                        $actualEnd = null;
                        $gapStart = null;
                        $gapEnd = null;
                        $dutyStart = Carbon::now();
                        $dutyEnd = Carbon::now();

                        // Daily Attendance Recorder
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

                                // Normalize dates to compare times
                                $fixedDutyStart = $dutyStart->setDate($today->year, $today->month, $today->day);
                                $fixedDutyEnd = $dutyEnd->setDate($today->year, $today->month, $today->day);

                                // Determine shift boundaries based on action
                                if ($log->action == "Duty Out") {
                                    switch ($shiftType) {
                                        case "Regular":
                                            $actualStart = $workStartTimes[0];
                                            $actualEnd = $workEndTimes[0];
                                            $gapStart = $breakStart;
                                            $gapEnd = $breakEnd;
                                            break;
                                        case "Split":
                                            $firstPartEnd = $workEndTimes[0];
                                            $secondPartStart = $workStartTimes[1];
                                            if ($dutyStart->format('H:i:s') < $firstPartEnd->format('H:i:s')) {
                                                $actualStart = $workStartTimes[0];
                                                $actualEnd = $firstPartEnd;
                                            } else {
                                                $actualStart = $secondPartStart;
                                                $actualEnd = $workEndTimes[1];
                                            }
                                            break;
                                        default:
                                            $actualStart = $workStartTimes[0];
                                            $actualEnd = $workEndTimes[0];
                                            $gapStart = $breakStart;
                                            $gapEnd = $breakEnd;
                                    }
                                } else { // "Overtime Out"
                                    $actualStart = $overtimeStart;
                                    $actualEnd = $overtimeEnd;
                                }

                                $fixedActualStart = $actualStart->setDate($today->year, $today->month, $today->day);
                                $fixedActualEnd = $actualEnd->setDate($today->year, $today->month, $today->day);
                                $fixedGapStart = $gapStart ? $gapStart->setDate($today->year, $today->month, $today->day) : null;
                                $fixedGapEnd = $gapEnd ? $gapEnd->setDate($today->year, $today->month, $today->day) : null;

                                // Total Hours Calculation
                                if (
                                    $fixedDutyStart->format('H:i:s') < $fixedActualEnd->format('H:i:s') &&
                                    $fixedDutyEnd->format('H:i:s') > $fixedActualStart->format('H:i:s')
                                ) {
                                    $renderedStart = max($fixedDutyStart, $fixedActualStart);
                                    $renderedEnd = min($fixedDutyEnd, $fixedActualEnd);
                                    $minutesRendered = $renderedEnd->diffInMinutes($renderedStart);

                                    // Remove Break Time for Regular Shifts (only for Duty Out)
                                    if ($log->action == "Duty Out" && $shiftType == "Regular" && $fixedGapStart && $fixedGapEnd) {
                                        $overlapStart = max($renderedStart, $fixedGapStart);
                                        $overlapEnd = min($renderedEnd, $fixedGapEnd);

                                        if ($overlapStart->format('H:i:s') < $overlapEnd->format('H:i:s')) {
                                            $totalOverlap = $overlapEnd->diffInMinutes($overlapStart);
                                            $minutesRendered -= $totalOverlap;
                                        }
                                        $minutesRendered = max($minutesRendered, 0);
                                    }

                                    // Assign minutes based on action type
                                    if ($log->action == "Duty Out") {
                                        $totalRendered += $minutesRendered;
                                        $totalDayRendered += $minutesRendered;
                                    } else { // "Overtime Out"
                                        $totalOvertime += $minutesRendered;
                                    }
                                }
                            }
                        }

                        // Calculate Late Time
                        $totalLate += max(0, $totalShiftDuration - $totalDayRendered);
                        // Log::info($date);
                        // Log::info("SD   : " . $totalShiftDuration);
                        // Log::info("SDH  : " . $totalShiftDuration / 60);
                        // Log::info("TR   : " . $totalDayRendered);
                        // Log::info("TRH  : " . $totalDayRendered / 60);
                        // Log::info("TL   : " . $totalLate);
                        // Log::info("TLH  : " . $totalLate / 60);
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

                return response()->json(['status' => 200, 'summary' => $attendanceSummary]);
            } catch (\Exception $e) {
                Log::error("Error in getAttendanceSummary: " . $e->getMessage());
                return response()->json(['status' => 500, 'summary' => null], 500);
            }
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
        if ($this->checkUserAdmin() && $request->input('employee')) {
            $employeeId = $request->input('employee');
        }

        // Fetch and process attendance logs for summary
        $summaryData = AttendanceLogsModel::with('workHour')
            ->where('user_id', $employeeId)
            ->whereBetween('timestamp', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
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

                // Attendance Counters
                $totalRendered = 0;
                $totalOvertime = 0;
                $totalLate = 0;
                $dutyInFound = false;
                $overtimeInFound = false;
                $dutyStart = Carbon::now();
                $dutyEnd = Carbon::now();

                // Total Shift Duration Reader
                if ($logs->first()->workHour->shift_type == "Regular") {
                    $shiftStart = Carbon::parse($logs->first()->workHour->first_time_in);
                    $shiftEnd = Carbon::parse($logs->first()->workHour->first_time_out);
                    $gapStart = Carbon::parse($logs->first()->workHour->break_start);
                    $gapEnd = Carbon::parse($logs->first()->workHour->break_end);

                    $totalShiftDuration = $shiftStart->diffInMinutes($shiftEnd) - $gapStart->diffInMinutes($gapEnd);
                    $totalShiftDuration = max($totalShiftDuration, 0);
                } elseif ($logs->first()->workHour->shift_type == "Split") {
                    $shiftFirstStart = Carbon::parse($logs->first()->workHour->first_time_in);
                    $shiftFirstEnd = Carbon::parse($logs->first()->workHour->first_time_out);
                    $shiftSecondStart = Carbon::parse($logs->first()->workHour->second_time_in);
                    $shiftSecondEnd = Carbon::parse($logs->first()->workHour->second_time_out);

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
                            switch ($log->workHour->shift_type) {
                                case 'Regular':
                                    $actualStart = Carbon::parse($log->workHour->first_time_in);
                                    $actualEnd = Carbon::parse($log->workHour->first_time_out);
                                    $gapStart = Carbon::parse($log->workHour->break_start);
                                    $gapEnd = Carbon::parse($log->workHour->break_end);
                                    break;
                                case 'Split':
                                    $firstPartEnd = Carbon::parse($log->workHour->first_time_out);
                                    $secondPartStart = Carbon::parse($log->workHour->second_time_in);
                                    if ($dutyStart->format('H:i:s') < $firstPartEnd->format('H:i:s')) {
                                        $actualStart = Carbon::parse($log->workHour->first_time_in);
                                        $actualEnd = $firstPartEnd;
                                    } else {
                                        $actualStart = $secondPartStart;
                                        $actualEnd = Carbon::parse($log->workHour->second_time_out);
                                    }
                                    break;
                                default:
                                    $actualStart = $dutyStart;
                                    $actualEnd = $dutyEnd;
                            }
                        } else {
                            $actualStart = Carbon::parse($log->workHour->over_time_in);
                            $actualEnd = Carbon::parse($log->workHour->over_time_out);
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
                            if ($log->action == "Duty Out" && $log->workHour->shift_type == 'Regular' && $fixedGapStart && $fixedGapEnd) {
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
                                // Log::info("---------------------------------");
                                // Log::info("Overtime In  : " . $renderedStart);
                                // Log::info("Overtime Out : " . $renderedEnd);
                                // Log::info("Overtime Rendered For Date " . $date . ": " . $minutesRendered);
                                $totalOvertime += $minutesRendered;
                                //Log::info("Total Overtime As of Date: " . $totalOvertime);
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
        //Log::info("------------------------- END");
        return response()->json(['status' => 200, 'summary' => $summaryData]);
    }

    public function getEmployeeDashboardAttendance()
    {
        //Log::info("WorkScheduleController::getEmployeeDashboardAttendance");

        $user = Auth::user();

        $attendances = AttendanceLogsModel::where('user_id', $user->id)
            ->with('workHour')
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

                // Find End Time
                $endTime = null;
                $workHour = $logs->first()->workHour;
                if ($workHour->shift_type == "Split") {
                    $endTime = Carbon::parse($date . ' ' . $workHour->second_time_out)->toDateTimeString();
                } else {
                    $endTime = Carbon::parse($date . ' ' . $workHour->first_time_out)->toDateTimeString();;
                }

                return [
                    'date' => $date,
                    'time_in' => $timeIn ? $timeIn->timestamp : null,
                    'time_out' => $timeOut ? $timeOut->timestamp : null,
                    'overtime_in' => $overtimeIn ? $overtimeIn->timestamp : null,
                    'overtime_out' => $overtimeOut ? $overtimeOut->timestamp : null,
                    'end_time' => $endTime,
                ];
            })
            ->take(10)
            ->values()
            ->all();

        return response()->json(['status' => 200, 'attendances' => $attendances]);
    }

    // Overtime
    public function getAttendanceOvertime()
    {
        // Log::info("\n");
        // Log::info("AttendanceController::getAttendanceOvertime");

        $user = Auth::user();
        $overtime = [];

        if ($this->checkUserAdmin() || $this->checkUserEmployee()) {
            $employee = UsersModel::find($user->id);
            //Log::info($employee);

            // Get all relevant logs
            $logs = AttendanceLogsModel::where('user_id', $user->id)->whereIn('action', ['Overtime In', 'Overtime Out'])->orderBy('timestamp')->get();

            // Log::info("\n");
            // Log::info("Raw Attendance Logs for User {$user->id}:");
            // Log::info($logs);
            // Log::info("\n");

            // Group logs by date (based on timestamp)
            $groupedLogs = [];
            foreach ($logs as $log) {
                //Log::info("Log action: {$log->action} | timestamp: {$log->timestamp}");
                $date = Carbon::parse($log->timestamp)->format('Y-m-d');
                $groupedLogs[$date][] = $log;
            }


            // Process each day's logs
            foreach ($groupedLogs as $date => $dailyLogs) {
                $in = null;
                $out = null;

                foreach ($dailyLogs as $log) {
                    if ($log->action === 'Overtime In' && !$in) {
                        $in = $log;
                    } elseif ($log->action === 'Overtime Out' && !$out) {
                        $out = $log;
                    }
                }

                // log::info($in);
                // log::info($out);

                if ($in && $out) {
                    $timeIn = Carbon::parse($in->timestamp);
                    $timeOut = Carbon::parse($out->timestamp);
                    $minutes = $timeIn->diffInMinutes($timeOut);

                    $application = ApplicationsOvertimeModel::where('user_id', $user->id)
                        ->where('time_in_id', $in->id)
                        ->where('time_out_id', $out->id)
                        ->select('status', 'reason', 'created_at')
                        ->first();

                    // log::info($date);
                    // log::info($timeIn);
                    // log::info($timeOut);
                    // log::info($minutes);
                    // Log::info($application);

                    $overtime[] = [
                        'date' => $date,
                        'timeIn' => $timeIn->format('H:i:s'),
                        'timeOut' => $timeOut->format('H:i:s'),
                        'minutes' => $minutes,
                        'status' => $application ? $application->status : "Unapplied",
                        'reason' => $application ? $application->reason : null,
                        'requested' => $application ? $application->created_at : null,
                    ];
                }
            }

            //log::info($overtime);

            return response()->json(['status' => 200, 'overtime' => $overtime]);
        } else {
            return response()->json(['status' => 200, 'summary' => null]);
        }
    }

    // Misc
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
