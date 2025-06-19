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
use App\Models\EmployeeBenefitsModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;

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
        // Log::info("BenefitsController::getBenefit");

        try {
            $decryptedId = Crypt::decryptString($request->id);
        } catch (\Exception $e) {
            return response()->json(['status' => 400, 'message' => 'Invalid ID']);
        }
    
        if ($this->checkUser()) {
            $user = Auth::user();
            $benefit = BenefitsModel::where('client_id', $user->client_id)->where('id', $decryptedId)->first();
    
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
    
            $benefits->transform(function ($benefit) {
                $benefit->uid = Crypt::encryptString($benefit->id);
                return $benefit;
            });
    
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

                return response()->json(['status' => 200, 'benefit' => $benefit]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function addEmployeeBenefit(Request $request)
    {
        // log::info("BenefitsController::addEmployeeBenefit");

        $validated = $request->validate([
            'userName' => 'required',
            'benefit' => 'required',
            'number' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $employee = UsersModel::where('user_name', $request->userName)->first();

                $employeeBenefit = EmployeeBenefitsModel::create([
                    "user_id" => $employee->id,
                    "benefit_id" => $request->benefit,
                    "number" => $request->number,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'employee_benefit' => $employeeBenefit]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function getEmployeeBenefits(Request $request)
    {
        // log::info("BenefitsController::getEmployeeBenefits");

        $user = Auth::user();
        $employee = UsersModel::where('client_id', $user->client_id)->where('user_name', $request->username)->first();

        if ($this->checkUser() && $user->client_id == $employee->client_id) {

            $benefits = [];
            $baseSalary = floatval($employee->salary);
            $rawBenefits = EmployeeBenefitsModel::with('benefit')->where('user_id', $employee->id)->where('deleted_at', null)->get();
            
            foreach ($rawBenefits as $rawBenefit) {
                $benefit = $rawBenefit->benefit;
                $employeeContribution = ($baseSalary * ($benefit->employee_percentage / 100)) + $benefit->employee_amount;
                $employerContribution = ($baseSalary * ($benefit->employer_percentage / 100)) + $benefit->employer_amount;
                $benefits[] = [
                    'id' => $rawBenefit->id,
                    'benefit' => $rawBenefit->benefit->name,
                    'number' => $rawBenefit->number,
                    'employee_contribution' => $employeeContribution,
                    'employer_contribution' => $employerContribution,
                    'created_at' => $rawBenefit->created_at
                ];
            }

            return response()->json(['status' => 200, 'benefits' => $benefits]);
        }

        return response()->json(['status' => 200, 'benefits' => null]);
    }



    
public function updateEmployeeBenefit(Request $request)
{
    $validator = Validator::make($request->all(), [
        'id' => 'required|integer|exists:employee_benefits,id',
        'username' => 'required|string|max:255',
        'benefit_id' => 'required|integer|exists:benefits,id',
        'number' => 'required|string|max:255'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
       
        $employeeBenefit = EmployeeBenefit::where('id', $request->id)
            ->where('username', $request->username)
            ->firstOrFail();

        $employeeBenefit->update([
            'benefit_id' => $request->benefit_id,
            'number' => $request->number
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee benefit updated successfully',
            'data' => $employeeBenefit
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Employee benefit not found'
        ], 404);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to update employee benefit',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
