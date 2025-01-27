<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLogsModel;
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
        // Log::info("WorkScheduleController::checkUser");

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
        // log::info("WorkScheduleController::getEmployeeLatestAttendance");

        $user = Auth::user();
    
        $latest_attendance = AttendanceLogsModel::where('user_id', $user->id)->latest('created_at')->first();
    
        return response()->json(['status' => 200,'latest_attendance' => $latest_attendance,]);
    }

    public function getEmployeeWorkDayAttendance()
    {
        // Log::info("WorkScheduleController::getEmployeeWorkDayAttendance");
    
        $user = Auth::user();
        $currentDate = Carbon::now()->toDateString();
        $attendance = AttendanceLogsModel::where('user_id', $user->id)->whereDate('timestamp', $currentDate)->get();

        return response()->json([ 'status' => 200, 'attendance' => $attendance ]);
    }
    
    public function saveEmployeeAttendance(Request $request)
    {
        // log::info("WorkScheduleController::saveEmployeeAttendance");

        $validated = $request->validate([ 'action' => 'required' ]);

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
                
                return response()->json([ 'status' => 200 ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function getAttendanceLogs()
    {
        // Log::info("WorkScheduleController::getAttendanceLogs");
    
        if ($this->checkUser()) {
            $user = Auth::user();
            $clientId = $user->client_id;
    
            $attendances = AttendanceLogsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })->get();
    
            return response()->json(['status' => 200, 'attendances' => $attendances]);
        }
    
        return response()->json(['status' => 200, 'attendances' => null]);
    }

    public function getEmployeeAttendanceLogs(Request $request) 
    {
        // Log::info("WorkScheduleController::getAttendanceLogs");

        Log::info($request);

        $user = Auth::user();
        $fromDate = $request->input('from_date'); 
        $toDate = $request->input('to_date'); 
        $action = $request->input('action');
        
        $query = AttendanceLogsModel::where('user_id', $user->id)
            ->whereBetween('timestamp', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);

        if ($action !== 'All') {
            $query->where('action', $action);
        }

        $attendances = $query->get();

        return response()->json(['status' => 200, 'attendances' => $attendances]);
    }

    public function getEmployeeAttendanceSummary(Request $request)
    {
        Log::info("WorkScheduleController::getEmployeeAttendanceSummary");

        $user = Auth::user();
        $fromDate = $request->input('summary_from_date'); 
        $toDate = $request->input('summary_to_date'); 
        
        // Fetch and process attendance logs for summary
        $summaryData = DB::table('attendance_logs as al')
            ->join('work_hours as wh', 'al.work_hour_id', '=', 'wh.id')
            ->where('al.user_id', $user->id)
            ->whereBetween('al.timestamp', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->select('al.*', 'wh.shift_type', 'wh.first_time_in', 'wh.first_time_out', 'wh.second_time_in', 'wh.second_time_out', 'wh.over_time_in', 'wh.over_time_out', 'wh.break_start', 'wh.break_end')
            ->orderBy('al.timestamp', 'asc')
            ->get()
            ->groupBy(function($log) {
                return Carbon::parse($log->timestamp)->format('Y-m-d');
            })
            ->map(function($logs, $date) {
                // Find first time in
                $timeIn = $logs->firstWhere('action', 'Duty In');
                
                // Find last time out
                $timeOut = $logs->last(function($log) {
                    return $log->action == 'Duty Out';
                });

                // Find first overtime in
                $overtimeIn = $logs->firstWhere('action', 'Overtime In');
                
                // Find last overtime out
                $overtimeOut = $logs->last(function($log) {
                    return $log->action == 'Overtime Out';
                });

                // Attendance Counters
                $totalTime = 0;
                $totalOT = 0;
                $count = $logs->count();
                $overtimeInFound = false;
                
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
                        if ($log->action == "Duty Out") {
                            switch ($log->shift_type) {
                                case 'Regular':
                                    $workHoursStart = Carbon::parse($log->first_time_in);
                                    $workHoursEnd = Carbon::parse($log->first_time_out);
                                    $breakStart = Carbon::parse($log->break_start);
                                    $breakEnd = Carbon::parse($log->break_end);
                                    break;
                                case 'Split':
                                    if ($workStart->isBefore(Carbon::parse($log->first_time_out))){
                                        $workHoursStart = Carbon::parse($log->first_time_in);
                                        $workHoursEnd = Carbon::parse($log->first_time_out);
                                    } else {
                                        $workHoursStart = Carbon::parse($log->second_time_in);
                                        $workHoursEnd = Carbon::parse($log->second_time_out);
                                    }
                                    break;
                                default:
                                    $workHoursStart = $workStart;
                                    $workHoursEnd = $workEnd;
                            }
                        } else {
                            $workHoursStart = Carbon::parse($workHour->over_time_in);
                            $workHoursEnd = Carbon::parse($workHour->over_time_out);
                        }

                        // Total Hours Calculation [MAIN]
                        if($workStart->isBefore($workHoursEnd) && $workEnd->isAfter($workHoursStart)) {
                            $startWithinWorkHours = max($workStart, $workHoursStart);
                            $endWithinWorkHours = min($workEnd, $workHoursEnd);
                            
                            $timeWorked = $startWithinWorkHours->diffInMinutes($endWithinWorkHours);
                            
                            if ($log->action == "Duty Out" && $log->shift_type == 'Regular') {
                                $breakOverlapStart = max($startWithinWorkHours, $breakStart);
                                $breakOverlapEnd = min($endWithinWorkHours, $breakEnd);
                                
                                if ($breakOverlapStart->isBefore($breakOverlapEnd)) {
                                    $breakOverlap = $breakOverlapStart->diffInMinutes($breakOverlapEnd);
                                    $timeWorked -= $breakOverlap;
                                }
                                
                                $timeWorked = max($timeWorked, 0); 
                            }
                        
                            if ($log->action == "Duty Out") {
                                $totalTime += $timeWorked;
                            } else {
                                $totalOT += $timeWorked;
                            }
                        }
                    }


                }

                return [
                    'date' => $date,
                    'time_in' => $timeIn ? $timeIn->timestamp : null,
                    'time_out' => $timeOut ? $timeOut->timestamp : null,
                    'overtime_in' => $overtimeIn ? $overtimeIn->timestamp : null,
                    'overtime_out' => $overtimeOut ? $overtimeOut->timestamp : null,
                    'total_time' => $totalTime,
                    'total_ot' => $totalOT,
                    'is_late' => $count
                ];
            })
            ->values()
            ->all();

        return response()->json(['status' => 200, 'summary' => $summaryData]);
    }
    
}
