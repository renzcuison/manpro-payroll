<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\WorkHoursModel;
use App\Models\WorkGroupsModel;
use App\Models\WorkShiftsModel;
use App\Models\AttendanceLogsModel;

use App\Models\WorkDaysModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PayrollController extends Controller
{
    public function checkUser()
    {
        // Log::info("PayrollController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function payrollProcess(Request $request)
    {
        // log::info("PayrollController::payrollProcess");
        // log::info($request);
    
        $user = Auth::user();
    
        if ($this->checkUser()) {

            $logs = AttendanceLogsModel::whereHas('user', function ($query) use ($user) {
                $query->where('client_id', $user->client_id);
            })->get();
    
            $groupedLogs = $logs->groupBy(function ($log) {
                return \Carbon\Carbon::parse($log->timestamp)->toDateString();
            })->map(function ($logs, $date) {
                $totalMinutes = 0;
    
                $sortedLogs = $logs->sortBy('timestamp');
    
                for ($i = 0; $i < $sortedLogs->count() - 1; $i++) {
                    $currentLog = $sortedLogs[$i];
                    $nextLog = $sortedLogs[$i + 1];
    
                    if ($currentLog->action === 'Duty In' && $nextLog->action === 'Duty Out') {
                        $start = \Carbon\Carbon::parse($currentLog->timestamp);
                        $end = \Carbon\Carbon::parse($nextLog->timestamp);
                        $totalMinutes += $start->diffInMinutes($end);
                    }
                }
    
                return [ 'date' => $date, 'totalMinutes' => $totalMinutes ];
            })->values();
    
            return response()->json(['status' => 200, 'logs' => $groupedLogs]);
        }
    
        return response()->json(['status' => 200, 'logs' => null]);
    }
    
    
}
