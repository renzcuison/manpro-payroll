<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;
use App\Models\WorkGroupsModel;
use App\Models\BenefitsModel;
use App\Models\UserFormsModel;

// use App\Models\NewModel;
// use App\Models\NewModel;
// use App\Models\NewModel;

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

    private function enrichEmployeeDetails($employee)
    {
        $employee->role = "";
        $employee->jobTitle = "";
        $employee->branch = "";
        $employee->department = "";
        $employee->work_group = "";

        if ($employee->role_id) {
            $role = EmployeeRolesModel::find($employee->role_id);
            $employee->role = $role ? $role->name . " (" . $role->acronym . ")" : "";
        }

        if ($employee->branch_id) {
            $branch = BranchesModel::find($employee->branch_id);
            $employee->branch = $branch ? $branch->name . " (" . $branch->acronym . ")" : "";
        }

        if ($employee->job_title_id) {
            $jobTitle = JobTitlesModel::find($employee->job_title_id);
            $employee->jobTitle = $jobTitle ? $jobTitle->name . " (" . $jobTitle->acronym . ")" : "";
        }

        if ($employee->department_id) {
            $department = DepartmentsModel::find($employee->department_id);
            $employee->department = $department ? $department->name . " (" . $department->acronym . ")" : "";
        }

        if ($employee->work_group_id) {
            $work_group = WorkGroupsModel::find($employee->work_group_id);
            $employee->work_group = $work_group ? $work_group->name : "";
        }

        return $employee;
    }

    public function getEmployees(Request $request)
    {
        // log::info("EmployeesController::getEmployees");

        if ($this->checkUser()) {
            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employees = $client->employees;

            $enrichedEmployees = $employees->map(function ($employee) {
                return $this->enrichEmployeeDetails($employee);
            });

            return response()->json(['status' => 200, 'employees' => $enrichedEmployees]);
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

                return response()->json(['status' => 200]);
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
            $employee = $this->enrichEmployeeDetails($employee);
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
                $employee->work_group_id = $request->selectedWorkGroup;

                $employee->employment_type = $request->selectedType;
                $employee->employment_status = $request->selectedStatus;
                $employee->date_start = $request->startDate;
                $employee->date_end = $request->endDate;
                $employee->save();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function getFormLinks()
    {
        // log::info("EmployeesController::getFormLinks");
        $user = Auth::user();

        if ($this->checkUser()) {

            $formLinks = UserFormsModel::where('client_id', $user->client_id)
                ->get();

            return response()->json(['status' => 200, 'form_links' => $formLinks]);
        }
    }

    public function saveFormLink(Request $request)
    {
        // log::info("EmployeesController::saveFormLink");
        $user = Auth::user();

        if ($this->checkUser()) {

            try {
                DB::beginTransaction();

                $uniqueCode = $this->generateRandomCode(16);
                while (UserFormsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                    //Log::info("Regenerating code: " . $uniqueCode);
                }

                UserFormsModel::create([
                    "client_id" => $user->client_id,
                    "unique_code" => $uniqueCode,
                    "limit" => $request->input('use_limit'),
                    "expiration" => $request->input('expiry_date'),
                    "branch_id" => $request->input('branch'),
                    "department_id" => $request->input('department'),
                    "created_by" => $user->id,
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

    public function deleteFormLink(Request $request)
    {
        // log::info("EmployeesController::deleteFormLink");
        $user = Auth::user();
        Log::info($request);

        if ($this->checkUser()) {

            try {
                DB::beginTransaction();

                UserFormsModel::where('id', $request->input('id'))->update(['deleted_by' => $user->id]);
                UserFormsModel::where('id', $request->input('id'))->delete();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    function generateRandomCode($length)
    {
        // log::info("EmployeesController::generateRandomCode");
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }
}
