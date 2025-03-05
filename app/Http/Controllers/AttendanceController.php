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

            // Get the month's name from Carbon
            $monthName = Carbon::createFromFormat('m', $month)->monthName;

            //Log::info($monthName);
            //Log::info($year);

            try {
                $employees = UsersModel::where('client_id', $clientId)
                    ->where('user_type', 'Employee')
                    ->where('employment_status', 'Active')
                    ->get();

                $attendanceSummary = $employees->map(function ($employee) use ($month, $year) {
                    $attendanceLogs = AttendanceLogsModel::with('workHour')
                        ->where('user_id', $employee->id)
                        ->whereYear('timestamp', $year)
                        ->whereMonth('timestamp', $month)
                        ->orderBy('timestamp', 'asc')
                        ->get()
                        ->groupBy(function ($log) {
                            return Carbon::parse($log->timestamp)->format('Y-m-d');
                        });

                    $totalRenderedMinutes = 0;
                    $totalLateSeconds = 0;
                    $totalAbsences = 0;
                    $totalShiftMinutes = 0;
                    $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
                    $endDay = ($year == Carbon::now()->year && $month == Carbon::now()->month) ? Carbon::now()->day : $daysInMonth;

                    //Log::info($endDay);

                    foreach (range(1, $endDay) as $day) {
                        $currentDate = Carbon::create($year, $month, $day)->startOfDay();
                        $logs = $attendanceLogs->get($currentDate->format('Y-m-d'));
                        $currentDate = Carbon::create($year, $month, $day)->startOfDay();
                        $logs = $attendanceLogs->get($currentDate->format('Y-m-d'));

                        if ($logs) {
                            $shiftType = $logs->first()->workHour->shift_type ?? 'Regular';
                            $workStart = Carbon::parse($logs->first()->workHour->first_time_in ?? '00:00:00')
                                ->setYear($currentDate->year)
                                ->setMonth($currentDate->month)
                                ->setDay($currentDate->day);
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
                            $breakStart = Carbon::parse($logs->first()->workHour->break_start ?? '00:00:00')
                                ->setYear($currentDate->year)
                                ->setMonth($currentDate->month)
                                ->setDay($currentDate->day);
                            $breakEnd = Carbon::parse($logs->first()->workHour->break_end ?? '00:00:00')
                                ->setYear($currentDate->year)
                                ->setMonth($currentDate->month)
                                ->setDay($currentDate->day);

                            $totalShiftMinutes = $shiftType === 'Split'
                                ? $workEndTimes[0]->diffInMinutes($workEndTimes[0]) + $workEndTimes[1]->diffInMinutes($workEndTimes[1])
                                : max(0, $workEndTimes[0]->diffInMinutes($workStart) - $breakStart->diffInMinutes($breakEnd));

                            $dutyIn = $logs->firstWhere('action', 'Duty In');
                            $dutyOut = $logs->last(fn($log) => $log->action === 'Duty Out');
                            $overtimeIn = $logs->firstWhere('action', 'Overtime In');
                            $overtimeOut = $logs->last(fn($log) => $log->action === 'Overtime Out');

                            if ($dutyIn && $dutyOut) {
                                $workStartNormalized = Carbon::parse($dutyIn->timestamp)
                                    ->setYear($currentDate->year)
                                    ->setMonth($currentDate->month)
                                    ->setDay($currentDate->day);
                                $workEndNormalized = Carbon::parse($dutyOut->timestamp)
                                    ->setYear($currentDate->year)
                                    ->setMonth($currentDate->month)
                                    ->setDay($currentDate->day);
                                $workHoursStart = $workStart;
                                $workHoursEnd = $workEndTimes[0];

                                $startWithinShift = max($workStartNormalized, $workHoursStart);
                                $endWithinShift = min($workEndNormalized, $workHoursEnd);

                                $renderedMinutes = $startWithinShift->diffInMinutes($endWithinShift);
                                if (Carbon::parse($dutyIn->timestamp)->gt($workStart)) {
                                    $lateStart = Carbon::parse($dutyIn->timestamp)
                                        ->setYear($currentDate->year)
                                        ->setMonth($currentDate->month)
                                        ->setDay($currentDate->day);
                                    $totalLateSeconds += max(0, $lateStart->diffInSeconds($workStart));
                                }
                                $totalRenderedMinutes += $renderedMinutes;

                                if ($shiftType === 'Regular' && $breakStart->lt($endWithinShift) && $breakEnd->gt($startWithinShift)) {
                                    $breakOverlapStart = max($startWithinShift, $breakStart);
                                    $breakOverlapEnd = min($endWithinShift, $breakEnd);
                                    $breakMinutes = $breakOverlapStart->diffInMinutes($breakOverlapEnd);
                                    $totalRenderedMinutes -= min($breakMinutes, $renderedMinutes);
                                }
                            }

                            if ($overtimeIn && $overtimeOut) {
                                $overtimeStart = Carbon::parse($overtimeIn->timestamp)
                                    ->setYear($currentDate->year)
                                    ->setMonth($currentDate->month)
                                    ->setDay($currentDate->day);
                                $overtimeEnd = Carbon::parse($overtimeOut->timestamp)
                                    ->setYear($currentDate->year)
                                    ->setMonth($currentDate->month)
                                    ->setDay($currentDate->day);
                                $totalRenderedMinutes += $overtimeStart->diffInMinutes($overtimeEnd);
                            }
                        } else {
                            $totalAbsences++;
                        }

                        // Ensure totalShiftMinutes is used only when logs exist
                        if ($logs) {
                            $totalLateSeconds += max(0, $totalShiftMinutes * 60 - $totalRenderedMinutes * 60); // Convert to seconds
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
                        'total_minutes' => $totalRenderedMinutes,
                        'total_late' => $totalLateSeconds,
                        'total_absences' => $totalAbsences,
                    ];
                })->all();

                // /Log::info($attendanceSummary);

                return response()->json(['status' => 200, 'attendance_summary' => $attendanceSummary]);
            } catch (\Exception $e) {
                Log::error("Error in getAttendanceSummary: " . $e->getMessage());
                return response()->json(['status' => 500, 'attendance_summary' => null], 500);
            }
        } else {
            return response()->json(['status' => 200, 'attendance_summary' => null]);
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
                $totalTime = 0;
                $totalOT = 0;
                $totalLate = 0;
                $dutyInFound = false;
                $overtimeInFound = false;
                $workStart = Carbon::now();
                $workEnd = Carbon::now();

                // Total Shift Time Reader
                if ($logs->first()->shift_type == "Regular") {
                    $shiftStart = Carbon::parse($logs->first()->first_time_in);
                    $shiftEnd = Carbon::parse($logs->first()->first_time_out);
                    $breakStart = Carbon::parse($logs->first()->break_start);
                    $breakEnd = Carbon::parse($logs->first()->break_end);

                    $totalShiftTime = $shiftStart->diffInMinutes($shiftEnd) - $breakStart->diffInMinutes($breakEnd);
                    $totalShiftTime = max($totalShiftTime, 0);
                } elseif ($logs->first()->shift_type == "Split") {
                    $shiftFirstStart = Carbon::parse($logs->first()->first_time_in);
                    $shiftFirstEnd = Carbon::parse($logs->first()->first_time_out);
                    $shiftSecondStart = Carbon::parse($logs->first()->second_time_in);
                    $shiftSecondEnd = Carbon::parse($logs->first()->second_time_out);

                    $shiftFirstTime = $shiftFirstStart->diffInMinutes($shiftFirstEnd);
                    $shiftSecondTime = $shiftSecondStart->diffInMinutes($shiftSecondEnd);
                    $totalShiftTime = $shiftFirstTime + $shiftSecondTime;
                } else {
                    $totalShiftTime = 0;
                }

                // Rendered Hours Calculator
                foreach ($logs as $log) {
                    if ($log->action == "Duty In" || $log->action == "Overtime In") {
                        if ($log->action == "Duty In") {
                            $workStart = Carbon::parse($log->timestamp);
                            $dutyInFound = true;
                            $overtimeInFound = false;
                        } else {
                            $workStart = Carbon::parse($log->timestamp);
                            $overtimeInFound = true;
                            $dutyInFound = false;
                        }
                    } elseif (($dutyInFound && $log->action == "Duty Out") || ($overtimeInFound && $log->action == "Overtime Out")) { // Recorded Duty Out & Calculations
                        $workEnd = Carbon::parse($log->timestamp);
                        $dutyInFound = false;
                        $overtimeInFound = false;

                        // Total Hours Calculation [PREP]
                        $workHoursStart = null;
                        $workHoursEnd = null;
                        $breakStart = null;
                        $breakEnd = null;
                        if ($log->action == "Duty Out") {
                            switch ($log->shift_type) {
                                case 'Regular':
                                    $workHoursStart = Carbon::parse($log->first_time_in);
                                    $workHoursEnd = Carbon::parse($log->first_time_out);
                                    $breakStart = Carbon::parse($log->break_start);
                                    $breakEnd = Carbon::parse($log->break_end);
                                    break;
                                case 'Split':
                                    $firstPartEnd = Carbon::parse($log->first_time_out);
                                    $secondPartStart = Carbon::parse($log->second_time_in);
                                    if ($workStart->format('H:i:s') < $firstPartEnd->format('H:i:s')) {
                                        $workHoursStart = Carbon::parse($log->first_time_in);
                                        $workHoursEnd = $firstPartEnd;
                                    } else {
                                        $workHoursStart = $secondPartStart;
                                        $workHoursEnd = Carbon::parse($log->second_time_out);
                                    }
                                    break;
                                default:
                                    $workHoursStart = $workStart;
                                    $workHoursEnd = $workEnd;
                            }
                        } else {
                            $workHoursStart = Carbon::parse($log->over_time_in);
                            $workHoursEnd = Carbon::parse($log->over_time_out);
                        }

                        // Total Hours Calculation [MAIN]
                        if (
                            $workStart->format('H:i:s') < $workHoursEnd->format('H:i:s')
                            &&
                            $workEnd->format('H:i:s') > $workHoursStart->format('H:i:s')
                        ) {
                            // Normalizes dates to exclusively compare time
                            $today = Carbon::today();
                            $workStartNormalized = $workStart->setDate($today->year, $today->month, $today->day);
                            $workEndNormalized = $workEnd->setDate($today->year, $today->month, $today->day);
                            $workHoursStartNormalized = $workHoursStart->setDate($today->year, $today->month, $today->day);
                            $workHoursEndNormalized = $workHoursEnd->setDate($today->year, $today->month, $today->day);
                            $breakStartNormalized = $breakStart ? $breakStart->setDate($today->year, $today->month, $today->day) : null;
                            $breakEndNormalized = $breakEnd ? $breakEnd->setDate($today->year, $today->month, $today->day) : null;

                            $startWithinWorkHours = max($workStartNormalized, $workHoursStartNormalized);
                            $endWithinWorkHours = min($workEndNormalized, $workHoursEndNormalized);

                            $timeWorked = $startWithinWorkHours->diffInMinutes($endWithinWorkHours);

                            // Remove Rendered Time during Break
                            if ($log->action == "Duty Out" && $log->shift_type == 'Regular' && $breakStartNormalized && $breakEndNormalized) {
                                $breakOverlapStart = max($startWithinWorkHours, $breakStartNormalized);
                                $breakOverlapEnd = min($endWithinWorkHours, $breakEndNormalized);

                                if ($breakOverlapStart->format('H:i:s') < $breakOverlapEnd->format('H:i:s')) {
                                    $breakOverlap = $breakOverlapStart->diffInMinutes($breakOverlapEnd);
                                    $timeWorked -= $breakOverlap;
                                }

                                $timeWorked = max($timeWorked, 0);
                            }

                            if ($log->action == "Duty Out") {
                                $totalTime += $timeWorked;
                            } else { // action is "Overtime Out"
                                $totalOT += $timeWorked;
                            }
                        }
                    }
                }

                $totalLate = $totalShiftTime - $totalTime;

                return [
                    'date' => $date,
                    'time_in' => $timeIn ? $timeIn->timestamp : null,
                    'time_out' => $timeOut ? $timeOut->timestamp : null,
                    'overtime_in' => $overtimeIn ? $overtimeIn->timestamp : null,
                    'overtime_out' => $overtimeOut ? $overtimeOut->timestamp : null,
                    'total_time' => $totalTime,
                    'total_ot' => $totalOT,
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
}
