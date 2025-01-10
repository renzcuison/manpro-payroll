<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;

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

        $user = Auth::user();            
        $employee = UsersModel::where('client_id', $user->client_id)->where('user_name', $request->username)->first();

        if ($this->checkUser() && $user->client_id == $employee->client_id) {

            $employee->role = "";
            $employee->jobTitle = "";

            if ( $employee->role_id ) {
                $role = EmployeeRolesModel::find($employee->role_id);
                $employee->role = $role->name . " (" . $role->acronym . ")";
            }

            if ( $employee->job_title_id ) {
                $jobTitle = JobTitlesModel::find($employee->job_title_id);
                $employee->jobTitle = $jobTitle->name . " (" . $jobTitle->acronym . ")";
            }

            return response()->json(['status' => 200, 'employee' => $employee]);
        }    

        return response()->json(['status' => 200, 'employee' => null]);
    }

    public function editEmmployeeDetails(Request $request)
    {
        // log::info("EmployeesController::editEmmployeeDetails");

        $user = Auth::user();
        $employee = UsersModel::find($request->id);

        if ($this->checkUser() && $user->client_id == $employee->client_id) {

            try {
                DB::beginTransaction();

                $employee->role_id = $request->selectedRole;
                $employee->branch_id = $request->selectedBranch;
                $employee->job_title_id = $request->selectedJobTitle;
                $employee->department_id = $request->selectedDepartment;

                $employee->employment_type = $request->selectedType;
                $employee->employment_status = $request->selectedStatus;
                $employee->save();
                
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
