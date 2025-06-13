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
use App\Models\DeductionsModel; 
use App\Models\EmployeeDeductionsModel;

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
            }

            $employees[] = [
                'user_name' => $employee->user_name,
                'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch->id, 
                'department_id' => $employee->department->id,
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
        $baseSalary = floatval($employee->salary);

        $incentives = [];

        foreach($employee->incentives as $incentive){
            $amount = 0;
            $type = $incentive->incentive->type;
            if($type == 'Amount'){
                $amount += $incentive->incentive->amount;
            }
            else{
                $amount += ($baseSalary * ($incentive->incentive->percentage / 100));
            }
            $incentives[] = [
                'id' => Crypt::encrypt($incentive->id),
                'name' => $incentive->incentive->name,
                'number' => $incentive->number,
                'type' => $incentive->incentive->type,
                'amount' => $incentive->incentive->amount,
                'percentage' => $incentive->incentive->percentage,
                'calculated_amount' => $amount,
                'status' =>$incentive->status,
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
                EmployeeIncentivesModel::create([
                    "client_id" => $client->id,
                    "user_id" => $employee->id,
                    "incentive_id" => Crypt::decrypt($request->incentive),
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

    public function updateEmployeeIncentive(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 403]);
        }
        $employee_incentive_id = Crypt::decrypt($request->emp_incentive_id);
        $emp_incentive = EmployeeIncentivesModel::findOrFail($employee_incentive_id);

        if($emp_incentive){
            $emp_incentive->number = $request->number;
            $emp_incentive->save();
        }
        return response()->json(['status' => 200]);
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
                'branch_id' => $employee->branch->id, 
                'department_id' => $employee->department->id,        
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
        $baseSalary = floatval($employee->salary);
        $benefits = [];

        foreach($employee->benefits as $benefit){
            $employee_amount = 0;
            $employer_amount = 0;
            $type = $benefit->benefit->type;
            if($type == 'Amount'){
                $employee_amount += $benefit->benefit->employee_amount;
                $employer_amount += $benefit->benefit->employer_amount;
            }
            else{
                $employee_amount += ($baseSalary * ($benefit->benefit->employee_percentage / 100));
                $employer_amount += ($baseSalary * ($benefit->benefit->employer_percentage / 100));
            }
            $benefits[] = [
                'id' => Crypt::encrypt($benefit->id),
                'name' => $benefit->benefit->name,
                'type' => $benefit->benefit->type,
                'number' => $benefit->number,
                'employer_amount' => $benefit->benefit->employer_amount,
                'employee_amount' => $benefit->benefit->employee_amount,
                'employer_percentage' => $benefit->benefit->employer_percentage,
                'employee_percentage' => $benefit->benefit->employee_percentage,
                'employer_contribution' => $employer_amount,
                'employee_contribution' => $employee_amount,
                'status' => $benefit->status,
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

                EmployeeBenefitsModel::create([
                    "client_id" => $client->id,
                    "user_id" => $employee->id,
                    "benefit_id" => Crypt::decrypt($request->benefit),
                    "number" => $request->number
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

    public function updateEmployeeBenefit(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200]);
        }
        $employee_benefit_id = Crypt::decrypt($request->emp_benefit_id);
        $emp_benefit = EmployeeBenefitsModel::findOrFail($employee_benefit_id);

        if($emp_benefit){
            $emp_benefit->number = $request->number;
            $emp_benefit->save();
        }
        return response()->json(['status' => 200]);
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

    public function getEmployeeAllowance(Request $request)
    {
        // log::info("EmployeesController::getEmployeeAllowance");
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'allowances' => null]);  
        }
        $employee = UsersModel::where('user_name', $request->username)->first();
        $baseSalary = floatval($employee->salary);

        $allowances = [];
        
        
        foreach($employee->allowances as $allowance){
            $amount = 0;
            $type = $allowance->allowance->type;
            if($type == 'Amount'){
                $amount += $allowance->allowance->amount;
            }
            else{
                $amount += ($baseSalary * ($allowance->allowance->percentage / 100));
            }
            $allowances[] = [
                'id' => Crypt::encrypt($allowance->id),
                'name' => $allowance->allowance->name,
                'number' => $allowance->number,
                'type' => $type,
                'amount' => $allowance->allowance->amount,
                'percentage' => $allowance->allowance->percentage,
                'calculated_amount' => $amount,
                'status' =>$allowance->status,
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
            }

            $employees[] = [
                'user_name' => $employee->user_name,
                'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch->id, 
                'department_id' => $employee->department->id,
                'total' => $amount,
            ];
        }
        return response()->json(['status' => 200, 'employees' => $employees]);
    }

    public function saveEmployeeAllowance(Request $request)
    {
        log::info("AllowanceController::saveEmployeeAllowance");

        $validated = $request->validate([
            'userName' => 'required',
            'allowance' => 'required',
            'number' => 'required',
        ]);
        if (!$this->checkUserAdmin() || !$validated) {
            return response()->json(['status' => 403]);
        }
        
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $employee = UsersModel::where('user_name', $request->userName)->first();

        try {
            DB::beginTransaction();

            EmployeeAllowancesModel::create([
                "client_id" => $client->id,
                "user_id" => $employee->id,
                "allowance_id" => Crypt::decrypt($request->allowance),
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

    public function updateEmployeeAllowance(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 403]);
        }
        $employee_deduction_id = Crypt::decrypt($request->emp_allowance_id);
        $emp_allowance = EmployeeAllowancesModel::findOrFail($employee_deduction_id);

        if($emp_allowance){
            $emp_allowance->number = $request->number;
            $emp_allowance->save();
        }
        return response()->json(['status' => 200]);
    }
    //---------------->[#endregion ALLOWANCES CONTROLLERS]


    //---------------->[#region DEDUCTIONS CONTROLLERS]

    public function getDeductions()
    {
        if ($this->checkUserAdmin()) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $deductions = [];

            if(!$client->deductions){
                return response()->json(['status' => 200, 'deductions' => null]);
            }

            foreach ($client->deductions as $deduction) {    
                $deductions[] = [
                    'id' => Crypt::encrypt($deduction->id),
                    'name' => $deduction->name,
                    'type' => $deduction->type,
                    'amount' => $deduction->amount,
                    'percentage' => $deduction->percentage,
                ];
            }

            return response()->json(['status' => 200, 'deductions' => $deductions]);
        }

        return response()->json(['status' => 200, 'deductions' => null]);
    }

    public function saveDeduction(Request $request)
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

                DeductionsModel::create([
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

    public function getEmployeeDeductions(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'deductions' => null]);  
        }
        $employee = UsersModel::where('user_name', $request->username)->first();
        $baseSalary = floatval($employee->salary);

        $deductions = [];
        
        
        foreach($employee->deductions as $deduction){
            $amount = 0;
            $type = $deduction->deduction->type;
            if($type == 'Amount'){
                $amount += $deduction->deduction->amount;
            }
            else{
                $amount += ($baseSalary * ($deduction->deduction->percentage / 100));
            }
            $deductions[] = [
                'id' => Crypt::encrypt($deduction->id),
                'name' => $deduction->deduction->name,
                'number' => $deduction->number,
                'type' => $type,
                'amount' => $deduction->deduction->amount,
                'percentage' => $deduction->deduction->percentage,
                'calculated_amount' => $amount,
                'status' =>$deduction->status,
                'created_at' => $deduction->created_at,
            ];
        }
        return response()->json(['status' => 200, 'deductions' => $deductions]);
    }

    public function getEmployeesDeductions()
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'employees' => null]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $employees = [];
        foreach($client->employees as $employee){  
            $baseSalary = floatval($employee->salary);
            $deductions = EmployeeDeductionsModel::where('user_id', $employee->id)->get();
            $amount = 0;
            foreach($deductions as $deduction){
                $type = $deduction->deduction->type;
                
                if($type == 'Amount'){
                    $amount += $deduction->deduction->amount;
                }
                else if($type == 'Percentage'){
                    $amount += $baseSalary * ($deduction->deduction->percentage / 100);
                }
            }

            $employees[] = [
                'user_name' => $employee->user_name,
                'name' => $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch->id, 
                'department_id' => $employee->department->id,
                'total' => $amount,
            ];
        }
        return response()->json(['status' => 200, 'employees' => $employees]);
    }

    public function saveEmployeeDeductions(Request $request)
    {
        log::info("AllowanceController::saveEmployeeAllowance");

        $validated = $request->validate([
            'userName' => 'required',
            'deduction' => 'required',
            'number' => 'required',
        ]);
        if (!$this->checkUserAdmin() || !$validated) {
            return response()->json(['status' => 403]);
        }
        
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $employee = UsersModel::where('user_name', $request->userName)->first();

        try {
            DB::beginTransaction();

            EmployeeDeductionsModel::create([
                "client_id" => $client->id,
                "user_id" => $employee->id,
                "deduction_id" => Crypt::decrypt($request->deduction),
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

    public function updateEmployeeDeduction(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 403]);
        }
        $employee_deduction_id = Crypt::decrypt($request->emp_deduction_id);
        $emp_deduction = EmployeeDeductionsModel::findOrFail($employee_deduction_id);

        if($emp_deduction){
            $emp_deduction->number = $request->number;
            $emp_deduction->save();
        }
        return response()->json(['status' => 200]);
    }
    //---------------->[#endregion DEDUCTIONS CONTROLLERS]
 
    

    


}
