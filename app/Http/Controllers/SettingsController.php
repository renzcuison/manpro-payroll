<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;
use App\Models\ApplicationTypesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function checkUser()
    {
        // Log::info("SettingsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getBranches(Request $request)
    {
        // Log::info("SettingsController::getBranches");

        if ($this->checkUser()) {
            $user = Auth::user();
            $branches = BranchesModel::where('client_id', $user->client_id)->get();

            return response()->json(['status' => 200, 'branches' => $branches]);
        }

        return response()->json(['status' => 200, 'branches' => null]);
    }

    public function saveBranch(Request $request)
    {
        // log::info("SettingsController::saveBranch");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $branch = BranchesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "address" => $request->address,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'branch' => $branch]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editBranch(Request $request)
    {
        log::info("SettingsController::editBranch");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $branch = BranchesModel::find($request->input('id'));

            $branch->name = $request->input('name');
            $branch->acronym = $request->input('acronym');
            $branch->address = $request->input('address');
            $branch->status = $request->input('status');
            $branch->leave_limit = $request->input('leave_limit');

            $branch->save();

            return response()->json(['status' => 200]);
        }
    }





    public function getDepartment($id)
    {
    

        if ($this->checkUser()) {

            $department = DepartmentsModel::find($id);
            $employees = UsersModel::where('department_id', $department->id)->get();
            $employeesCount = UsersModel::where('department_id', $department->id)->get();

            return response()->json(['status' => 200, 'department' => $department, 'employees' => $employees, 'employeesCount' => $employeesCount ]);
        }

        return response()->json(['status' => 200, 'departments' => null]);
    }



    
    public function getDepartments(Request $request)
    {
        // Log::info("SettingsController::getDepartments");

        if ($this->checkUser()) {
            $user = Auth::user();
            $departments = DepartmentsModel::where('client_id', $user->client_id)->withCount('employees')->get();

            return response()->json(['status' => 200, 'departments' => $departments]);
        }

        return response()->json(['status' => 200, 'departments' => null]);
    }

    public function saveDepartment(Request $request)
    {
        // log::info("SettingsController::saveDepartment");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $department = DepartmentsModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "description" => $request->description,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'department' => $department]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editDepartment(Request $request)
    {
        log::info("SettingsController::editDepartment");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $department = DepartmentsModel::find($request->input('id'));

            $department->name = $request->input('name');
            $department->acronym = $request->input('acronym');
            $department->description = $request->input('description');
            $department->status = $request->input('status');
            $department->leave_limit = $request->input('leave_limit');

            $department->save();

            return response()->json(['status' => 200]);
        }
    }

    public function getJobTitles(Request $request)
    {
        // Log::info("SettingsController::getJobTitles");

        if ($this->checkUser()) {
            $user = Auth::user();
            $jobTitles = JobTitlesModel::where('client_id', $user->client_id)->get();

            return response()->json(['status' => 200, 'jobTitles' => $jobTitles]);
        }

        return response()->json(['status' => 200, 'jobTitles' => null]);
    }

    public function saveJobTitle(Request $request)
    {
        // log::info("SettingsController::saveJobTitle");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $jobTitle = JobTitlesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'jobTitle' => $jobTitle]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editJobTitle(Request $request)
    {
        log::info("SettingsController::editJobTitle");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $jobTitle = JobTitlesModel::find($request->input('id'));

            $jobTitle->name = $request->input('name');
            $jobTitle->acronym = $request->input('acronym');
            $jobTitle->status = $request->input('status');

            $jobTitle->save();

            return response()->json(['status' => 200]);
        }
    }

    public function getRoles(Request $request)
    {
        // Log::info("SettingsController::getRoles");

        if ($this->checkUser()) {
            $user = Auth::user();
            $roles = EmployeeRolesModel::where('client_id', $user->client_id)->get();

            return response()->json(['status' => 200, 'roles' => $roles]);
        }

        return response()->json(['status' => 200, 'roles' => null]);
    }

    public function saveRole(Request $request)
    {
        // log::info("SettingsController::saveRole");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $role = EmployeeRolesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'role' => $role]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editRole(Request $request)
    {
        //log::info("SettingsController::editRole");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $role = EmployeeRolesModel::find($request->input('id'));

            $role->name = $request->input('name');
            $role->acronym = $request->input('acronym');
            $role->status = $request->input('status');

            $role->save();

            return response()->json(['status' => 200]);
        }
    }

    public function saveApplicationType(Request $request)
    {
        // log::info("SettingsController::saveApplicationType");
        Log::info($request);

        $validated = $request->validate([
            'name' => 'required',
            'tenureship_required' => 'required',
            'require_files' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $role = ApplicationTypesModel::create([
                    "name" => $request->name,
                    "percentage" => 0.00,
                    "require_files" => $request->require_files,
                    "tenureship_required" => $request->tenureship_required,
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'role' => $role]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editApplicationType(Request $request)
    {
        //log::info("SettingsController::editApplicationType");

        $validated = $request->validate([
            'name' => 'required',
            'tenureship_required' => 'required',
            'require_files' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $appType = ApplicationTypesModel::find($request->input('id'));

            $appType->name = $request->input('name');
            $appType->tenureship_required = $request->input('tenureship_required');
            $appType->require_files = $request->input('require_files');

            $appType->save();

            return response()->json(['status' => 200]);
        }
    }
}
