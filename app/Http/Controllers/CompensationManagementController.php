<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\AllowancesModel;
use App\Models\EmployeeAllowancesModel;
use App\Models\IncentivesModel;
use App\Models\EmployeeIncentivesModel;
use App\Models\BenefitsModel;
use App\Models\EmployeeBenefitsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class CompensationManagementController extends Controller
{   
    // #---------------->[region AUTH CHECKERS]
    
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

    //---------------->[#endregion AUTH CHECKERS]

    
    // #---------------->[region INCENTIVES CONTROLLERS]

    public function getEmployeesIncentives()
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'employees' => null]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $employees = [];

        foreach($client->employees as $employee){
            $baseSalary = floatval($employee->salary);
            $incentives = EmployeeIncentivesModel::where('user_id', $employee->id)->get();
            $amount = 0;


            foreach($incentives as $incentive){
                $type = $incentive->incentive->type;
                if($type == 'Amount'){
                    $amount += $incentive->incentive->amount;
                }
                else if($type == 'Percentage'){
                    $amount += $baseSalary * ($incentive->incentive->percentage / 100);
                }
                $amount = $amount + $incentive->incentive->amount;
            }

            $employees[] = [
                'user_name' => $employee->user_name,
                'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'total' => $amount,
            ];
        }
        return response()->json(['status' => 200, 'employees' => $employees]);
    }

    public function getEmployeeIncentives(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'incentives' => null]);
        }

        $employee = UsersModel::where('user_name', $request->username)->first();
        $incentives = [];

        foreach($employee->incentives as $incentive){
            $incentives[] = [
                'name' => $incentive->incentive->name,
                'number' => $incentive->number,
                'type' => $incentive->incentive->type,
                'amount' => $incentive->incentive->amount,
                'percentage' => $incentive->incentive->percentage,
                'created_at' => $incentive->created_at,
            ];
        }
        return response()->json(['status' => 200, 'incentives' => $incentives]);
    }

    public function getIncentives() {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'incentives' => null]);
        }

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $incentives = [];

        foreach ($client->incentives as $incentive) {    
            $incentives[] = [
                'id' => Crypt::encrypt($incentive->id),
                'name' => $incentive->name,
                'type' => $incentive->type,
                'amount' => $incentive->amount,
                'percentage' => $incentive->percentage,
            ];
        }
        return response()->json(['status' => 200, 'incentives' => $incentives]);
    }

    public function saveIncentives(Request $request) 
    {
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

                IncentivesModel::create([
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

    public function saveEmployeeIncentives(Request $request)
    {
        $validated = $request->validate([
            'userName' => 'required',
            'incentive' => 'required',
            'number' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employee = UsersModel::where('user_name', $request->userName)->first();

            try {
                DB::beginTransaction();
                $employeeIncentives = EmployeeIncentivesModel::updateOrCreate([
                    "client_id" => $client->id,
                    "user_id" => $employee->id,
                    "incentive_id" => Crypt::decrypt($request->incentive),
                ],[
                    "number" => $request->number,
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
    //---------------->[#endregion INCENTIVES CONTROLLERS]


    //---------------->[#region BENEFITS CONTROLLERS]

    public function calculateBenefits($rawBenefit, $baseSalary) {
        $benefit = $rawBenefit->benefit;
        $employeeContribution = ($baseSalary * ($benefit->employee_percentage / 100)) + $benefit->employee_amount;
        $employerContribution = ($baseSalary * ($benefit->employer_percentage / 100)) + $benefit->employer_amount;
        
        return [
            'employee_contribution' => $employeeContribution,
            'employer_contribution' => $employerContribution
        ];
    }

    public function getEmployeesBenefits()
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'benefits' => null]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $employees = [];

        foreach ($client->employees as $employee){
            $benefits = [];
            $employee_total = 0;
            $employer_total = 0;
            $baseSalary = floatval($employee->salary);
            $rawBenefits = EmployeeBenefitsModel::with('benefit')->where('user_id', $employee->id)->where('deleted_at', null)->get();
            foreach ($rawBenefits as $rawBenefit) {

                $benefitCalc = $this->calculateBenefits($rawBenefit, $baseSalary);
                $benefits[] = $benefitCalc;

                $employee_total += $benefitCalc['employee_contribution'];
                $employer_total += $benefitCalc['employer_contribution'];
            }

            $employees[] = [
                'user_name' => $employee->user_name,
                'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'benefits' => $benefits,
                'employee_amount' => $employee_total,
                'employer_amount' => $employer_total,
            ];   
        }
        return response()->json(['status' => 200, 'employees' => $employees]);
    }

    public function getEmployeeBenefits(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'benefits' => null]);
        }

        $employee = UsersModel::where('user_name', $request->username)->first();
        $benefits = [];

        foreach($employee->benefits as $benefit){
            $benefits[] = [
                'name' => $benefit->benefit->name,
                'type' => $benefit->benefit->type,
                'number' => $benefit->number,
                'employer_amount' => $benefit->benefit->employer_amount,
                'employee_amount' => $benefit->benefit->employee_amount,
                'employer_percentage' => $benefit->benefit->employer_percentage,
                'employee_percentage' => $benefit->benefit->employee_percentage,
                'created_at' => $benefit->created_at,
            ];
        }
        return response()->json(['status' => 200, 'benefits' => $benefits]);
    }

    public function getBenefits()
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'benefits' => null]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $benefits = [];

        foreach ($client->benefits as $benefit) {    
            $benefits[] = [
                'id' => Crypt::encrypt($benefit->id),
                'name' => $benefit->name,
                'type' => $benefit->type,
                'employer_amount' => $benefit->employer_amount,
                'employee_amount' => $benefit->employee_amount,
                'employer_percentage' => $benefit->employer_percentage,
                'employee_percentage' => $benefit->employee_percentage,
            ];
        }
        
        return response()->json(['status' => 200, 'benefits' => $benefits]);
    }

    public function saveBenefits(Request $request)
    {
        $validated = $request->validate([
            'benefitName' => 'required',
            'benefitType' => 'required',
            'employeeAmount' => 'required',
            'employerAmount' => 'required',
            'employeePercentage' => 'required',
            'employerPercentage' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

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

    public function saveEmployeeBenefits(Request $request)
    {
        $validated = $request->validate([
            'userName' => 'required',
            'benefit' => 'required',
            'number' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employee = UsersModel::where('user_name', $request->userName)->first();
            try {
                DB::beginTransaction();

                EmployeeBenefitsModel::updateOrCreate([
                    "client_id" => $client->id,
                    "user_id" => $employee->id,
                    "benefit_id" => Crypt::decrypt($request->benefit),
                ],[
                    "number" => $request->number,
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

    //---------------->[#endregion BENEFITS CONTROLLERS]


    //---------------->[#region ALLOWANCES CONTROLLERS]

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
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'allowances' => null]);  
        }
        $employee = UsersModel::where('user_name', $request->username)->first();
        $allowances = [];
        
        foreach($employee->allowances as $allowance){
            $allowances[] = [
                'name' => $allowance->allowance->name,
                'number' => $allowance->number,
                'type' => $allowance->allowance->type,
                'amount' => $allowance->allowance->amount,
                'percentage' => $allowance->allowance->percentage,
                'created_at' => $allowance->created_at,
            ];
        }
        return response()->json(['status' => 200, 'allowances' => $allowances]);
    }

    public function getEmployeesAllowance()
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'employees' => null]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $employees = [];
        foreach($client->employees as $employee){  
            $baseSalary = floatval($employee->salary);
            $allowances = EmployeeAllowancesModel::where('user_id', $employee->id)->get();
            $amount = 0;
            foreach($allowances as $allowance){
                $type = $allowance->allowance->type;
                
                if($type == 'Amount'){
                    $amount += $allowance->allowance->amount;
                }
                else if($type == 'Percentage'){
                    $amount += $baseSalary * ($allowance->allowance->percentage / 100);
                }
                $amount = $amount + $allowance->allowance->amount;
            }

            $employees[] = [
                'user_name' => $employee->user_name,
                'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'total' => $amount,
            ];
        }
        return response()->json(['status' => 200, 'employees' => $employees]);
    }

    //---------------->[#endregion ALLOWANCES CONTROLLERS]
 
    

    


}
