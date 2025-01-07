<?php

namespace App\Http\Controllers;

use App\Models\ClientsModel;
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
            
                return response()->json([ 'status' => 200, 'shift' => $shift ]);

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
            
                return response()->json([ 'status' => 200, 'shift' => $shift ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }
}
