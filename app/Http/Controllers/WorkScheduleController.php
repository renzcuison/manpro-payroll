<?php

namespace App\Http\Controllers;

use App\Models\ClientsModel;
use App\Models\WorkGroupsModel;
use App\Models\WorkShiftsModel;

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

    public function getWorkShiftLinks(Request $request)
    {
        // log::info("WorkScheduleController::getWorkShiftLinks");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $workShifts = WorkShiftsModel::where('client_id', $client->id)->where('deleted_at', null)->select('name')->get();

            $workShifts = $workShifts->map(function ($workShift) use ($client) {
                $workShift->link = str_replace(' ', '_', $workShift->name);
                $workShift->unique_code = $client->unique_code;

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

            log::info($request);

            try {
                DB::beginTransaction();

                $shift = WorkShiftsModel::create([
                    "name" => $request->shiftName,
                    "shift_type" => $request->shiftType,

                    "split_first_label" => $request->firstLabel,
                    "split_first_time_in" => $request->splitFirstTimeIn,
                    "split_first_time_out" => $request->splitFirstTimeOut,

                    "split_second_label" => $request->secondLabel,
                    "split_second_time_in" => $request->splitSecondTimeIn,
                    "split_second_time_out" => $request->splitSecondTimeOut,

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

            log::info($request);

            try {
                DB::beginTransaction();

                $shift = WorkShiftsModel::create([
                    "name" => $request->shiftName,
                    "shift_type" => $request->shiftType,

                    "regular_time_in" => $request->regularTimeIn,
                    "regular_time_out" => $request->regularTimeOut,

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

    public function saveWorkGroup(Request $request)
    {
        // log::info("WorkScheduleController::saveWorkGroup");

        $validated = $request->validate([
            'groupName' => 'required',
        ]);

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
}
