<?php

namespace App\Http\Controllers;

use App\Models\ClientsModel;
use App\Models\UsersModel;
use App\Models\WorkDaysModel;
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

    public function getWorkShifts(Request $request)
    {
        // log::info("WorkScheduleController::getWorkShifts");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $workShifts = WorkShiftsModel::where('client_id', $client->id)->where('deleted_at', null)->get();

            return response()->json(['status' => 200, 'workShifts' => $workShifts]);
        } 

        return response()->json(['status' => 200, 'workShifts' => null]);   
    }

    public function getWorkShiftLinks(Request $request)
    {
        // log::info("WorkScheduleController::getWorkShiftLinks");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $workShifts = WorkShiftsModel::where('client_id', $client->id)->where('deleted_at', null)->select('name')->get();

            $workShifts = $workShifts->map(function ($workShift) {
                $workShift->link = str_replace(' ', '_', $workShift->name);

                return $workShift;
            });

            return response()->json(['status' => 200, 'workShifts' => $workShifts]);   
        } 

        return response()->json(['status' => 200, 'workShifts' => null]);   
    }

    public function getWorkShiftDetails(Request $request)
    {
        // log::info("WorkScheduleController::getEmployeeDetails");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $shift = str_replace('_', ' ', $request->shift);

            $workShift = WorkShiftsModel::where('client_id', $client->id)->where('deleted_at', null)->where('name', $shift)->first();

            return response()->json(['status' => 200, 'workShift' => $workShift]);   
        } 

        return response()->json(['status' => 200, 'workShifts' => null]);   
    }

    public function saveSplitWorkShift(Request $request)
    {
        // log::info("WorkScheduleController::saveSplitWorkShift");

        $validated = $request->validate([
            'shiftName' => 'required',
            'shiftType' => 'required',

            'firstLabel' => 'required',
            'splitFirstTimeIn' => 'required',
            'splitFirstTimeOut' => 'required',

            'secondLabel' => 'required',
            'splitSecondTimeIn' => 'required',
            'splitSecondTimeOut' => 'required',
            
            'overTimeIn' => 'required',
            'overTimeOut' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $shift = WorkShiftsModel::create([
                    "name" => $request->shiftName,
                    "shift_type" => $request->shiftType,

                    "first_label" => $request->firstLabel,
                    "first_time_in" => $request->splitFirstTimeIn,
                    "first_time_out" => $request->splitFirstTimeOut,

                    "second_label" => $request->secondLabel,
                    "second_time_in" => $request->splitSecondTimeIn,
                    "second_time_out" => $request->splitSecondTimeOut,

                    "over_time_in" => $request->overTimeIn,
                    "over_time_out" => $request->overTimeOut,

                    "client_id" => $client->id,
                ]);
                
                DB::commit();

                $link = str_replace(' ', '_', $shift->name);
            
                return response()->json([ 'status' => 200, 'shift' => $shift, 'link' => $link ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }

    public function saveRegularWorkShift(Request $request)
    {
        // log::info("WorkScheduleController::saveRegularWorkShift");

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

            try {
                DB::beginTransaction();

                $shift = WorkShiftsModel::create([
                    "name" => $request->shiftName,
                    "shift_type" => $request->shiftType,

                    "first_label" => "Attendance",
                    "first_time_in" => $request->regularTimeIn,
                    "first_time_out" => $request->regularTimeOut,

                    "over_time_in" => $request->overTimeIn,
                    "over_time_out" => $request->overTimeOut,

                    "client_id" => $client->id,
                ]);
                
                DB::commit();
            
                $link = str_replace(' ', '_', $shift->name);
            
                return response()->json([ 'status' => 200, 'shift' => $shift, 'link' => $link ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }

    public function getWorkGroups(Request $request)
    {
        // log::info("WorkScheduleController::getWorkGroups");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $workGroups = WorkGroupsModel::where('client_id', $client->id)->where('deleted_at', null)->get();

            return response()->json(['status' => 200, 'workGroups' => $workGroups]);   
        } 

        return response()->json(['status' => 200, 'workGroups' => null]);   
    }

    public function getWorkGroupLinks(Request $request)
    {
        // log::info("WorkScheduleController::getWorkGroupLinks");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $workGroups = WorkGroupsModel::where('client_id', $client->id)->where('deleted_at', null)->select('name')->get();

            $workGroups = $workGroups->map(function ($workGroup) {
                $workGroup->link = str_replace(' ', '_', $workGroup->name);

                return $workGroup;
            });

            return response()->json(['status' => 200, 'workGroups' => $workGroups]);   
        } 

        return response()->json(['status' => 200, 'workGroups' => null]);   
    }

    public function getWorkGroupDetails(Request $request)
    {
        // log::info("WorkScheduleController::getWorkGroupDetails");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $group = str_replace('_', ' ', $request->group);

            $workGroup = WorkGroupsModel::where('client_id', $client->id)->where('deleted_at', null)->where('name', $group)->first();

            $workShift = WorkShiftsModel::select(
                    'name',
                    'shift_type',
                    'first_label',
                    'first_time_in',
                    'first_time_out',
                    'second_label',
                    'second_time_in',
                    'second_time_out',
                    'over_time_in',
                    'over_time_out'
                )->find($workGroup->work_shift_id);

            $employees = UsersModel::where('work_group_id', $workGroup->id)
                ->select('user_name', 'first_name', 'middle_name', 'last_name', 'suffix', 'branch_id', 'department_id', 'role_id', 'job_title_id')
                ->get()
                ->map(function ($employee) {
                    $branch = BranchesModel::find($employee->branch_id);
                    $employee->branch = $branch ? $branch->name . " (" . $branch->acronym . ")" : null;
    
                    $department = DepartmentsModel::find($employee->department_id);
                    $employee->department = $department ? $department->name . " (" . $department->acronym . ")" : null;
    
                    $role = EmployeeRolesModel::find($employee->role_id);
                    $employee->role = $role ? $role->name . " (" . $role->acronym . ")" : null;
    
                    return [
                        'user_name' => $employee->user_name,
                        'first_name' => $employee->first_name,
                        'middle_name' => $employee->middle_name,
                        'last_name' => $employee->last_name,
                        'suffix' => $employee->suffix,
                        'branch' => $employee->branch,
                        'department' => $employee->department,
                        'role' => $employee->role,
                    ];
                });
        
            return response()->json(['status' => 200, 'workGroup' => $workGroup->name, 'workShift' => $workShift, 'employees' => $employees]);   
        } 

        return response()->json(['status' => 200, 'workSGroup' => null]);   
    }

    public function saveWorkGroup(Request $request)
    {
        // log::info("WorkScheduleController::saveWorkGroup");

        $validated = $request->validate([ 'groupName' => 'required' ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            log::info($request);

            try {
                DB::beginTransaction();

                $group = WorkGroupsModel::create([
                    "name" => $request->groupName,
                    "client_id" => $client->id,
                ]);

                $link = str_replace(' ', '_', $group->name);
                
                DB::commit();
                
                return response()->json([ 'status' => 200, 'group' => $group, 'link' => $link ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }

    public function saveWorkGroupShift(Request $request)
    {
        // log::info("WorkScheduleController::saveWorkGroupShift");

        $validated = $request->validate([ 'workGroup' => 'required', 'workShift' => 'required' ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $workGroup = WorkGroupsModel::where('client_id', $client->id)->where('name', $request->workGroup)->first();            

            try {
                DB::beginTransaction();
                
                $workGroup->work_shift_id = $request->workShift;
                $workGroup->save();
                
                DB::commit();
                
                return response()->json([ 'status' => 200 ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }

    public function getWorkDays(Request $request)
    {
        // log::info("WorkScheduleController::getWorkDays");

        $validated = $request->validate(['workGroupId' => 'required']);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser() && $validated && $user->user_type == "Admin") {
            $workDays = WorkDaysModel::where('client_id', $client->id)->where('work_group_id', $request->workGroupId)->where('deleted_at', null)->get();

            return response()->json(['status' => 200, 'workDays' => $workDays]);   
        } 

        return response()->json(['status' => 200, 'workDays' => null]);   
    }
}
