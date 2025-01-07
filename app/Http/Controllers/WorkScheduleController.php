<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;
use App\Models\EmployeeStatusModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class WorkScheduleController extends Controller
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

    public function saveRegularWorkShift(Request $request)
    {
        log::info("WorkScheduleController::saveRegularWorkShift");

        $validated = $request->validate([
            'shiftName' => 'required',
            'shiftType' => 'required',
            'regularTimeIn' => 'required',
            'regularTimeOut' => 'required',
            'overTimeIn' => 'required',
            'overTimeOut' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            log::info($request);

            // try {
            //     DB::beginTransaction();

            //     $role = EmployeeRolesModel::create([
            //         "name" => $request->name,
            //         "acronym" => $request->acronym,
            //         "status" => "Active",
            //         "client_id" => $client->id,
            //     ]);
                
            //     DB::commit();
            
            //     return response()->json([ 'status' => 200, 'role' => $role ]);

            // } catch (\Exception $e) {
            //     DB::rollBack();

            //     Log::error("Error saving: " . $e->getMessage());

            //     throw $e;
            // }
        }    
    }

}
