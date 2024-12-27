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

    public function getDepartments(Request $request)
    {
        // Log::info("SettingsController::getDepartments");

        if ($this->checkUser()) {
            $departments = DepartmentsModel::get();

            return response()->json(['status' => 200, 'departments' => $departments]);
        }

        return response()->json(['status' => 200, 'departments' => null]);
    }

    public function saveDepartment(Request $request)
    {
        log::info("SettingsController::saveDepartment");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                DepartmentsModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "description" => $request->description,
                    "status" => "Active",
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
}
