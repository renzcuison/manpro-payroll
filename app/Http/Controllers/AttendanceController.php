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
        $user = Auth::user();
    
        $latest_attendance = AttendanceLogsModel::where('user_id', $user->id)->latest('created_at')->first();
    
        return response()->json(['status' => 200,'latest_attendance' => $latest_attendance,]);
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
                    "work_hour_id" => $user->workHours->id,
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
}
