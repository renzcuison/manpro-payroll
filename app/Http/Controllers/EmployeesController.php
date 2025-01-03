<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\DepartmentsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class EmployeesController extends Controller
{
    public function checkUser()
    {
        // Log::info("EmployeesController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getEmployees(Request $request)
    {
        // log::info("EmployeesController::getEmployees");

        if ($this->checkUser()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employees = $client->employees;

            return response()->json(['status' => 200, 'employees' => $employees]);
        }    

        return response()->json(['status' => 200, 'employees' => null]);
    }

    public function saveEmployee(Request $request)
    {
        // log::info("EmployeesController::saveEmployee");

        $validated = $request->validate([
            'firstName' => 'required',
            'lastName' => 'required',
            'userName' => 'required',
            'emailAddress' => 'required',
            'birthdate' => 'required',
            'password' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            log::info($request);

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $password = Hash::make($request->password);
        
                UsersModel::create([
                    "user_name" => $request->userName,
                    "first_name" => $request->firstName,
                    "middle_name" => $request->middleName,
                    "last_name" => $request->lastName,
                    "suffix" => $request->suffix,
                    "birth_date" => $request->birthdate,
        
                    "address" => $request->address,
                    "contact_number" => $request->phoneNumber,
                    "email" => $request->emailAddress,
                    "password" => $password,
        
                    "user_type" => "Employee",
                    "client_id" => $client->id,
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

    public function getEmployeeDetails(Request $request)
    {
        // log::info("EmployeesController::getEmployeeDetails");

        if ($this->checkUser()) {

            $user = Auth::user();            
            $employee = UsersModel::where('client_id', $user->client_id)->where('user_name', $request->username)->first();

            return response()->json(['status' => 200, 'employee' => $employee]);
        }    

        return response()->json(['status' => 200, 'employee' => null]);
    }
}
