<?php

namespace App\Http\Controllers;

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

    public function checkWorkHour(Request $request)
    {
        // Log::info("WorkScheduleController::checkWorkHour");

        if ($this->checkUser()){
            $existing = WorkHoursModel::
                where('first_time_in', $request->firstTimeIn)->
                where('first_time_out', $request->firstTimeOut)->
                where('second_time_in', $request->secondTimeIn)->
                where('second_time_out', $request->secondTimeOut)->
                where('over_time_in', $request->overTimeIn)->
                where('over_time_out', $request->overTimeOut)->
                first();

            if ($existing) {
                $workHour = $existing;
            } else {
                try {
                    DB::beginTransaction();
    
                    $workHour = WorkHoursModel::create([
                        "first_time_in" => $request->firstTimeIn,
                        "first_time_out" => $request->firstTimeOut,
    
                        "second_time_in" => $request->secondTimeIn,
                        "second_time_out" => $request->secondTimeOut,
    
                        "over_time_in" => $request->overTimeIn,
                        "over_time_out" => $request->overTimeOut,
                    ]);
                    
                    DB::commit();
    
                } catch (\Exception $e) {
                    DB::rollBack();
    
                    Log::error("Error saving: " . $e->getMessage());
    
                    throw $e;
                }

            }

            return $workHour;
        }

        return false;
    }

    public function getWorkShift(Request $request)
    {
        // log::info("WorkScheduleController::getWorkShift");

        $user = Auth::user();

        $group = WorkGroupsModel::find($user->work_group_id);
        $shift = WorkShiftsModel::find($group->work_shift_id);
        $hour = WorkHoursModel::find($shift->work_hour_id);

        return response()->json(['status' => 200, 'shift' => $shift, 'hour' => $hour]);
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
            'firstTimeIn' => 'required',
            'firstTimeOut' => 'required',

            'secondLabel' => 'required',
            'secondTimeIn' => 'required',
            'secondTimeOut' => 'required',
            
            'overTimeIn' => 'required',
            'overTimeOut' => 'required',
        ]);

        $workHour  = $this->checkWorkHour($request);

        if ($this->checkUser() && $validated && $workHour) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $shift = WorkShiftsModel::create([
                    "name" => $request->shiftName,
                    "shift_type" => $request->shiftType,
                    "first_label" => $request->firstLabel,
                    "second_label" => $request->secondLabel,
                    "work_hour_id" => $workHour->id,
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

            'firstLabel' => 'required',
            'firstTimeIn' => 'required',
            'firstTimeOut' => 'required',
            
            'overTimeIn' => 'required',
            'overTimeOut' => 'required',
        ]);

        $workHour  = $this->checkWorkHour($request);

        if ($this->checkUser() && $validated && $workHour) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $shift = WorkShiftsModel::create([
                    "name" => $request->shiftName,
                    "shift_type" => $request->shiftType,
                    "first_label" => "Attendance",
                    "work_hour_id" => $workHour->id,
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
                'second_label',
                'work_hour_id',
            )->find($workGroup->work_shift_id);
    
            $workHours = WorkHoursModel::select(
                'first_time_in',
                'first_time_out',
                'second_time_in',
                'second_time_out',
                'over_time_in',
                'over_time_out',
            )->find($workShift->work_hour_id);

            unset($workShift->work_hour_id);

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
        
            return response()->json(['status' => 200, 'workGroup' => $workGroup->name, 'workShift' => $workShift, 'workHours' => $workHours, 'employees' => $employees]);   
        } 

        return response()->json(['status' => 200, 'workSGroup' => null]);   
    }

    public function saveWorkGroup(Request $request)
    {
        // log::info("WorkScheduleController::saveWorkGroup");

        $validated = $request->validate([ 'groupName' => 'required' ]);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser() && $validated) {

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

    public function saveWorkDay(Request $request)
    {
        log::info("WorkScheduleController::saveWorkDay");
        log::info($request);

        $validated = $request->validate([
            'selectedWorkGroup' => 'required',
            'startDate' => 'required',
            'endDate' => 'required',
            'color' => 'required',
        ]);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $workGroup = WorkGroupsModel::find($request->selectedWorkGroup);
        $workShift = WorkShiftsModel::find($workGroup->work_shift_id);

        log::info($workShift);

        if ($this->checkUser() && $validated && $user->user_type == "Admin") {

            try {
                DB::beginTransaction();

                $workDay = WorkDaysModel::create([
                    "title" => "Work Day",
                    "start_date" => $request->startDate,
                    "end_date" => $request->endDate,
    
                    "client_id" => $client->id,
                    "work_group_id" => $request->selectedWorkGroup,
                    
                    "name" => $request->groupName,
                    "client_id" => $client->id,
                ]);
    
                DB::commit();
                
                return response()->json(['status' => 200, 'workDay' => $workDay]);   

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }

        } 

        return response()->json(['status' => 200, 'workDay' => null]);   
    }

    public function getHolidays(Request $request)
    {
        // log::info("WorkScheduleController::getHolidays");

        $validated = $request->validate(['workGroupId' => 'required']);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser() && $user->user_type == "Admin") {
            $workDays = WorkDaysModel::where('client_id', $client->id)->where('work_group_id', $request->workGroupId)->where('deleted_at', null)->get();

            return response()->json(['status' => 200, 'workDays' => $workDays]);   
        } 

        return response()->json(['status' => 200, 'workDays' => null]);   
    }
}
