<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\HrBank;
use App\Models\HrBranch;
use App\Models\HrStatus;
use App\Models\HrWorkshifts;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HrStatusController extends Controller
{
    public function getStatus()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $status = HrStatus::orderBy('status_name', 'ASC')->get();
        } else {
            $status = HrStatus::where('team', $user->team)->orderBy('status_name', 'ASC')->get();
        }

        return response()->json([
            'status' => 200,
            'status' => $status
        ]);
    }

    public function getBranch()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $branch = HrBranch::orderBy('branch_name', 'ASC')->get();
        } else {
            $branch = HrBranch::where('team', $user->team)->orderBy('branch_name', 'ASC')->get();
        }
        return response()->json([
            'branch' => 200,
            'branch' => $branch
        ]);
    }

    public function getBank()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $bank = HrBank::orderBy('bank_name', 'ASC')->get();
        } else {
            $bank = HrBank::where('team', $user->team)->orderBy('bank_name', 'ASC')->get();
        }
        return response()->json([
            'bank' => 200,
            'bank' => $bank
        ]);
    }

    public function getWorkShifts()
    {
        log::info("HrStatusController::getWorkShifts");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        if ($user->user_type === 'Super Admin') {
            $workShifts = HrWorkshifts::orderBy('bank_name', 'ASC')->get();
        } else {
            $workShifts = HrWorkshifts::where('team', $user->team)->orderBy('description', 'ASC')->get();
        }
        return response()->json([
            'workShifts' => 200,
            'workShifts' => $workShifts
        ]);
    }

    public function addStatus(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $status = new HrStatus();
        $status->status_name = $request->input('status_name');
        $status->team = $user->team;
        $status->save();

        return response()->json([
            `status` => 200,
            `message` => 'Status Added Successfully'
        ]);
    }

    public function addBranch(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $branch = new HrBranch();
        $branch->branch_name = $request->input('branch_name');
        $branch->team = $user->team;
        $branch->save();

        return response()->json([
            `branch` => 200,
            `message` => 'Branch Added Successfully'
        ]);
    }

    public function addBank(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $bank = new HrBank();
        $bank->bank_name = $request->input('bank_name');
        $bank->team = $user->team;
        $bank->save();

        return response()->json([
            `bank` => 200,
            `message` => 'Bank Added Successfully'
        ]);
    }

    public function deleteStatus($id)
    {

        $deleteStatus = HrStatus::find($id);

        if ($deleteStatus) {
            $deleteStatus->delete($id);
            return response()->json([
                `status` => 200,
                `message` => 'Status has been removed'
            ]);
        } else {
            return response()->json([
                `message` => 'Error'
            ], 404);
        }
    }

    public function deleteBranch($id)
    {

        $deleteBranch = HrBranch::find($id);

        if ($deleteBranch) {
            $deleteBranch->delete($id);
            return response()->json([
                `branch` => 200,
                `message` => 'Branch has been removed'
            ]);
        } else {
            return response()->json([
                `message` => 'Error'
            ], 404);
        }
    }

    public function deleteBank($id)
    {

        $deleteBank = HrBank::find($id);

        if ($deleteBank) {
            $deleteBank->delete($id);
            return response()->json([
                `bank` => 200,
                `message` => 'Bank has been removed'
            ]);
        } else {
            return response()->json([
                `message` => 'Error'
            ], 404);
        }
    }

    public function addWorkDays(Request $request)
    {
        $userDetails = request()->all();
        $workDays = $userDetails['work_days'];

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $daily = User::where('is_deleted', 0)->where('user_type', '=', 'Member')->get();
        } else {
            $daily = User::where('is_deleted', 0)->where('team', $user->team)->where('user_type', '=', 'Member')->get();
        }
        $user_id = [];
        $monthly_rate = [];
        foreach ($daily as $val) {
            $user_id[] = $val->user_id;
            $monthly_rate[] = $val->monthly_rate;
        }
        $count = 0;
        foreach ($daily as $drate) {
            if ($drate != null && $workDays != 0) {
                $totalDaily = $monthly_rate[$count] / $workDays;
                $totalHourly = $totalDaily / 8;
                User::where([["is_deleted", 0], ["user_id", $user_id[$count]]])->update(['work_days' => $workDays, 'daily_rate' => round($totalDaily), 'hourly_rate' => round($totalHourly)]);
            } else {
                User::where("is_deleted", 0)->update(['work_days' => $workDays]);
            }
            $count++;
        }

        return response()->json([
            `status` => 200,
            `message` => 'Workdays Added Successfully'
        ]);
    }
}
