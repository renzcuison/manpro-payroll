<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
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
        log::info("SettingsController::saveRole");
        log::info($request);

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $branch = EmployeeRolesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);
                
                DB::commit();
            
                return response()->json([ 'status' => 200, 'branch' => $branch ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
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
            
                return response()->json([ 'status' => 200, 'branch' => $branch ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }

    public function getDepartments(Request $request)
    {
        // Log::info("SettingsController::getDepartments");

        if ($this->checkUser()) {
            $user = Auth::user();
            $departments = DepartmentsModel::where('client_id', $user->client_id)->get();

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
            
                return response()->json([ 'status' => 200, 'department' => $department ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }
}
