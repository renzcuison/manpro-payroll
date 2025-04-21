<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\AllowancesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AllowanceController extends Controller
{
    public function checkUserAdmin()
    {
        // Log::info("AllowanceController::checkUserAdmin");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function checkUserEmployee()
    {
        // Log::info("AllowanceController::checkUserEmployee");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Employee') {
                return true;
            }
        }

        return false;
    }

    public function getAllowances()
    {
        log::info("AllowanceController::getAllowances");

        if ($this->checkUserAdmin()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $allowances = [];

            foreach ($client->allowances as $allowance) {
                log::info($allowance);
    
                $allowances[] = [
                    'id' => Hash::make($allowance->id),
                    'name' => $allowance->name,
                    'type' => $allowance->type,
                    'amount' => $allowance->amount,
                    'percentage' => $allowance->percentage,
                ];
            }

            return response()->json(['status' => 200, 'allowances' => $allowances]);
        }

        return response()->json(['status' => 200, 'allowances' => null]);
    }

    public function saveAllowance(Request $request)
    {
        log::info("AllowanceController::saveAllowance");
        log::info($request);

        $validated = $request->validate([
            'name' => 'required',
            'type' => 'required',
            'amount' => 'required',
            'percentage' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $allowance = AllowancesModel::create([
                    "name" => $request->name,
                    "type" => $request->type,
                    "amount" => $request->amount,
                    "percentage" => $request->percentage,
                    "client_id" => $client->id,
                ]);

                log::info($allowance);

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }
    
    public function getEmployeeAllowance(Request $request)
    {
        log::info("EmployeesController::getEmployeeAllowance");
        log::info($request);

        if ($this->checkUserAdmin()) {

            $employee = UsersModel::where('user_name', $request->username)->first();
            log::info($employee);
            $allowances = [];

            foreach ($employee->allowances as $allowance) {
                log::info($allowance);

                $allowances[] = [
                    'id' => $allowance->id,
                ];
            }

            return response()->json(['status' => 200, 'allowances' => $allowances]);
        }

        return response()->json(['status' => 200, 'allowances' => null]);
    }

    public function getEmployeesAllowance()
    {
        // log::info("EmployeesController::getEmployeesAllowance");

        if ($this->checkUserAdmin()) {
            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employees = [];

            foreach ( $client->employees as $employee ) {
                $employees[] = [
                    'user_name' => $employee->user_name,
                    'name' => $employee->first_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                    'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                    'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                    'total' => $employee->allowances->sum('amount'),
                ];
            }

            return response()->json(['status' => 200, 'employees' => $employees]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }
}
