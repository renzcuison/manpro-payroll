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
    
    public function saveFirstTimeIn(Request $request)
    {
        // log::info("WorkScheduleController::saveFirstTimeIn");

        log::info($request);

        // [2025-01-23 11:10:30] local.INFO: array (
            // 'date' => 'Thu Jan 23 2025',
            // 'time' => '11:10:28 AM',
            // 'action' => 'Duty In',
        // ) 

        $validated = $request->validate([
            'date' => 'required',
            'time' => 'required',
            'action' => 'required',
        ]);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser() && $validated) {

            try {
                DB::beginTransaction();

                AttendanceLogsModel::create([
                    "user_id" => $user->id,
                    "work_hour_id" => $client->id,
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
