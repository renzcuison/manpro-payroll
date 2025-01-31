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

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class BenefitsController extends Controller
{
    public function checkUser()
    {
        // Log::info("BenefitsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getBenefit(Request $request)
    {
        // log::info("BenefitsController::getBenefit");

        if ($this->checkUser()) {
            $user = Auth::user();
            $benefit = BenefitsModel::where('client_id', $user->client_id)->where('name', $request->name)->first();
    
            return response()->json(['status' => 200, 'benefit' => $benefit]);
        }    
    
        return response()->json(['status' => 200, 'benefit' => null]);
    }

    public function getBenefits(Request $request)
    {
        // log::info("BenefitsController::getBenefits");

        if ($this->checkUser()) {
            $user = Auth::user();
            $benefits = BenefitsModel::where('client_id', $user->client_id)->get();
    
            return response()->json(['status' => 200, 'benefits' => $benefits]);
        }    
    
        return response()->json(['status' => 200, 'benefits' => null]);
    }

    public function saveBenefit(Request $request)
    {
        // log::info("BenefitsController::saveBenefit");

        $validated = $request->validate([
            'benefitName' => 'required',
            'benefitType' => 'required',
            'employeeAmount' => 'required',
            'employerAmount' => 'required',
            'employeePercentage' => 'required',
            'employerPercentage' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $password = Hash::make($request->password);
        
                $benefit = BenefitsModel::create([
                    "name" => $request->benefitName,
                    "type" => $request->benefitType,
                    "employee_percentage" => $request->employeePercentage,
                    "employer_percentage" => $request->employerPercentage,
                    "employee_amount" => $request->employeeAmount,
                    "employer_amount" => $request->employerAmount,
                    "client_id" => $client->id,
                ]);
                
                DB::commit();
            
                return response()->json([ 'status' => 200, 'benefit' => $benefit ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }
}
