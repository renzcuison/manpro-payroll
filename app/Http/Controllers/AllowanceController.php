<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\AllowancesModel;
use App\Models\EmployeeAllowancesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
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
        // log::info("AllowanceController::getAllowances");

        if ($this->checkUserAdmin()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $allowances = [];

            foreach ($client->allowances as $allowance) {    
                $allowances[] = [
                    'id' => Crypt::encrypt($allowance->id),
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
        // log::info("AllowanceController::saveAllowance");

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

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function saveEmployeeAllowance(Request $request)
    {
        log::info("AllowanceController::saveEmployeeAllowance");

        $validated = $request->validate([
            'userName' => 'required',
            'allowance' => 'required',
            'number' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employee = UsersModel::where('user_name', $request->userName)->first();

            try {
                DB::beginTransaction();

                $employeeAllowance = EmployeeAllowancesModel::create([
                    "client_id" => $client->id,
                    "user_id" => $employee->id,
                    "allowance_id" => Crypt::decrypt($request->allowance),
                    "number" => $request->number,
                ]);

                log::info($employeeAllowance);

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
        // log::info("EmployeesController::getEmployeeAllowance");

        if ($this->checkUserAdmin()) {
            $employee = UsersModel::where('user_name', $request->username)->first();
            $allowances = [];

            foreach ($employee->allowances as $allowance) {
                $allowances[] = [
                    'name' => $allowance->allowance->name,
                    'number' => $allowance->number,
                    'amount' => $allowance->allowance->amount,
                    'created_at' => $allowance->created_at,
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

                $allowances = EmployeeAllowancesModel::where('user_id', $employee->id)->get();
                $amount = 0;

                foreach ($allowances as $allowance){
                    $amount = $amount + $allowance->allowance->amount;
                }

                $employees[] = [
                    'user_name' => $employee->user_name,
                    'name' => $employee->first_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                    'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                    'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                    'total' => $amount,
                ];
            }

            return response()->json(['status' => 200, 'employees' => $employees]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }
}
