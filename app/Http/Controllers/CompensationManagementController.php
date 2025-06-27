<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\AllowancesModel;
use App\Models\BenefitBracket;
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
    
    //#---------------->[endregion AUTH CHECKERS]

    //#---------------->[region INCENTIVES CONTROLLERS]

    public function getEmployeesIncentives(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json([
                'status' => 200,
                'employee_count' => 0,
                'employees' => [],
                'total' => 0,
            ]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        $filterName = strtolower($request->input('name'));
        $filterBranchId = $request->input('branch_id');
        $filterDepartmentId = $request->input('department_id');
        $filterIncentiveId = $request->filled('incentive_id') ? Crypt::decrypt($request->input('incentive_id')) : null;
        $page = max(1, (int)$request->input('page', 1));
        $perPage = max(1, (int)$request->input('per_page', 10));

        $qualifyingEmployeeIds = EmployeeIncentivesModel::whereNull('deleted_at')
        ->when($filterIncentiveId, fn($q) => $q->where('incentive_id', $filterIncentiveId))
        ->pluck('user_id')
        ->unique();

        $query = UsersModel::with(['branch', 'department'])
        ->where('client_id', $client->id)
        ->whereHas('branch')
        ->whereHas('department')
        ->whereIn('id', $qualifyingEmployeeIds)
        ->when($filterName, fn($q) => $q->whereRaw("LOWER(CONCAT(last_name, ', ', first_name)) LIKE ?", ["%$filterName%"]))
        ->when($filterBranchId, fn($q) => $q->where('branch_id', $filterBranchId))
        ->when($filterDepartmentId, fn($q) => $q->where('department_id', $filterDepartmentId));

        $countQuery = (clone $query);
        $total_count = $countQuery->count();
        $employees = $query
        ->offset(($page - 1) * $perPage)
        ->limit($perPage)
        ->get();

        $result = collect();
        $total_amount = 0;

        foreach($employees as $employee){
            $incentives = EmployeeIncentivesModel::with('incentive')
            ->where('user_id', $employee->id)
            ->whereNull('deleted_at')
            ->when($filterIncentiveId, fn($q) => $q->where('incentive_id', $filterIncentiveId))
            ->get();
            
            $baseSalary = floatval($employee->salary);
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
            $result->push([
                'user_name' => $employee->user_name,
                'name' => "{$employee->last_name}, {$employee->first_name} {$employee->middle_name} {$employee->suffix}",
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch_id,
                'department_id' => $employee->department_id,
                'amount' => $amount,
            ]);  
            $total_amount += $amount; 
        }
        return response()->json([
            'status' => 200,
            'employee_count' => $total_count,
            'employees' => $result->values(),
            'total' => $total_amount,
            'current_page' => $page,
        ]);
    }

    public function getEmployeeIncentives(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'incentives' => null]);
        }

        $employee = UsersModel::where('user_name', $request->username)->first();
        $baseSalary = floatval($employee->salary);
        $incentives = [];

        $filterIncentiveId = $request->input('incentive_id');
        $decryptedIncentiveId = null;
        if (!empty($filterIncentiveId)) {
            try {
                $decryptedIncentiveId = Crypt::decrypt($filterIncentiveId);
            } catch (\Exception $e) {
                $decryptedIncentiveId = null;
            }
        }
        foreach($employee->incentives as $incentive){
            if ($decryptedIncentiveId && $incentive->incentive_id != $decryptedIncentiveId) {
                continue; 
            }
            
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
                'payment_schedule' => $incentive->incentive->payment_schedule,
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
                'payment_schedule' => $incentive->payment_schedule,
            ];
        }
        return response()->json(['status' => 200, 'incentives' => $incentives]);
    }

    public function getAssignableincentives(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized']);
        }
        $username = $request->input('username');
        $employee = UsersModel::with('incentives')->where('user_name', $username)->firstOrFail();
        $client = ClientsModel::with('incentives')->findOrFail($employee->client_id);
    
        $assignedIds = $employee->incentives->pluck('incentive_id');
    
        $incentives = $client->incentives->map(function ($incentive) use ($assignedIds) {
            return [
                'id' => Crypt::encrypt($incentive->id),
                'name' => $incentive->name,
                'disabled' => $assignedIds->contains($incentive->id),
            ];
        });
        return response()->json(['status' => 200, 'incentives' => $incentives]);
    }

    public function saveIncentives(Request $request) 
    {
        $validated = $request->validate([
            'name' => 'required',
            'type' => 'required',
            'amount' => 'required',
            'percentage' => 'required',
            'payment_schedule' => 'required',
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
                    "payment_schedule" => $request->payment_schedule,
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

    public function updateIncentives(Request $request){
        $validated = $request->validate([
            'name' => 'required',
            'type' => 'required',
            'amount' => 'required',
            'percentage' => 'required',
            'payment_schedule' => 'required',
        ]);
        if(!$this->checkUserAdmin() && !$validated){
            return response()->json(['status' => 401, 'message' => 'Unauthorized']);  
        }

        try{
            $incentive_id = Crypt::decrypt($request->incentive_id);
        }
        catch(\Exception $e){
            return response()->json(["status" => 403, 'message' => 'Invalid ID']);
        }

        $incentive = IncentivesModel::findOrFail($incentive_id);
        if($incentive){
            try{
                DB::beginTransaction();
                $incentive->name = $request->name;
                $incentive->type = $request->type;
                $incentive->amount = $request->amount;
                $incentive->percentage = $request->percentage;
                $incentive->payment_schedule = $request->payment_schedule;
                $incentive->save();
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
        return response()->json(['status' => 200, 'message' => 'Process Success']);
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
            $emp_incentive->status = $request->status;
            $emp_incentive->save();
        }
        return response()->json(['status' => 200]);
    }
    //---------------->[#endregion INCENTIVES CONTROLLERS]


    //---------------->[#region BENEFITS CONTROLLERS]

    public function getEmployeesBenefits(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json([
                'status' => 200,
                'employees' => [],
                'employee_count' => 0,
                'employee_total' => 0,
                'employer_total' => 0,
                'total' => 0,
            ]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        //filtering variables for name, department, branch search filters and paginations
        $filterName = strtolower($request->input('name'));
        $filterBranchId = $request->input('branch_id');
        $filterDepartmentId = $request->input('department_id');
        $filterBenefitId = $request->filled('benefit_id') ? Crypt::decrypt($request->input('benefit_id')) : null;
        $page = max(1, (int)$request->input('page', 1));
        $perPage = max(1, (int)$request->input('per_page', 10));

        $qualifyingEmployeeIds = EmployeeBenefitsModel::whereNull('deleted_at')
        ->when($filterBenefitId, fn($q) => $q->where('benefit_id', $filterBenefitId))
        ->pluck('user_id')
        ->unique();

        $query = UsersModel::with(['branch', 'department'])
        ->where('client_id', $client->id)
        ->whereHas('branch')
        ->whereHas('department')
        ->whereIn('id', $qualifyingEmployeeIds)
        ->when($filterName, fn($q) => $q->whereRaw("LOWER(CONCAT(last_name, ', ', first_name)) LIKE ?", ["%$filterName%"]))
        ->when($filterBranchId, fn($q) => $q->where('branch_id', $filterBranchId))
        ->when($filterDepartmentId, fn($q) => $q->where('department_id', $filterDepartmentId));
        
        $total_count = (clone $query)->count();
        $employees = $query
        ->offset(($page - 1) * $perPage)
        ->limit($perPage)
        ->get();

        $result = collect();
        $total_employee_amount = 0;
        $total_employer_amount = 0;

        foreach($employees as $employee){
            $benefits = EmployeeBenefitsModel::with('benefit')
            ->where('user_id', $employee->id)
            ->whereNull('deleted_at')
            ->when($filterBenefitId, fn($q) => $q->where('benefit_id', $filterBenefitId))
            ->get();

            $baseSalary = floatval($employee->salary);
            $employee_calc_amount = 0;
            $employer_calc_amount = 0;

            foreach($benefits as $benefit){
                $type = $benefit->benefit->type;
                //->benefit refers to the relationship function located in EmployeeBenefitsModel
                if($type === "Amount"){
                    $employee_calc_amount += $benefit->benefit->employee_amount;
                    $employer_calc_amount += $benefit->benefit->employer_amount;
                }
                else if($type === "Percentage"){
                    $employee_calc_amount += $baseSalary * ($benefit->benefit->employee_percentage / 100);
                    $employer_calc_amount += $baseSalary * ($benefit->benefit->employer_percentage / 100);
                }
                else if ($type === "Bracket Amount") {
                    $brackets = $benefit->benefit->brackets;
                    foreach ($brackets as $bracket) {
                        $start = floatval($bracket->range_start);
                        $end = $bracket->range_end !== null ? floatval($bracket->range_end) : INF; // if end is null, assume open-ended
                        if ($baseSalary >= $start && $baseSalary <= $end) {
                            $employee_calc_amount += floatval($bracket->employee_share);
                            $employer_calc_amount += floatval($bracket->employer_share);
                            break; 
                        }
                    }
                }
                else if ($type === "Bracket Percentage") {
                    $brackets = $benefit->benefit->brackets;
                    foreach ($brackets as $bracket) {
                        $start = floatval($bracket->range_start);
                        $end = $bracket->range_end !== null ? floatval($bracket->range_end) : INF; 
                        if ($baseSalary >= $start && $baseSalary <= $end) {
                            $employee_calc_amount += $baseSalary * ($bracket->employee_share / 100);
                            $employer_calc_amount += $baseSalary * ($bracket->employer_share / 100);
                            break; 
                        }
                    }
                }
            }
            $result->push([
                'user_name' => $employee->user_name,
                'name' => "{$employee->last_name}, {$employee->first_name} {$employee->middle_name} {$employee->suffix}",
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch_id,
                'department_id' => $employee->department_id,
                'employee_amount' => $employee_calc_amount,
                'employer_amount' => $employer_calc_amount,
            ]);
            $total_employee_amount += $employee_calc_amount;
            $total_employer_amount += $employer_calc_amount;
        }

        return response()->json([
            'status' => 200,
            'employees' => $result->values(),
            'employee_total' => $total_employee_amount,
            'employer_total' => $total_employer_amount,
            'employee_count' => $total_count,
            'current_page' => $page,
        ]);
    }

    public function getEmployeeBenefits(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'benefits' => null]);
        }

        $employee = UsersModel::where('user_name', $request->username)->first();
        $baseSalary = floatval($employee->salary);
        $benefits = [];
        $filterBenefitId = $request->input('benefit_id');
        $decryptedBenefitId = null;

        if (!empty($filterBenefitId)) {
            try {
                $decryptedBenefitId = Crypt::decrypt($filterBenefitId);
            } catch (\Exception $e) {
                $decryptedBenefitId = null;
            }
        }
        foreach($employee->benefits as $benefit){
            //skips those that do not match with the inputted benefit id
            if ($decryptedBenefitId && $benefit->benefit_id != $decryptedBenefitId) {
                continue; // skip if not matching filtered benefit id
            }
    
            $employee_amount = 0;
            $employer_amount = 0;
            $type = $benefit->benefit->type;
            if($type == 'Amount'){
                $employee_amount += $benefit->benefit->employee_amount;
                $employer_amount += $benefit->benefit->employer_amount;
            }
            else if($type == "Percentage"){
                $employee_amount += ($baseSalary * ($benefit->benefit->employee_percentage / 100));
                $employer_amount += ($baseSalary * ($benefit->benefit->employer_percentage / 100));
            }
            else if ($type === "Bracket Amount") {
                $brackets = $benefit->benefit->brackets;
                foreach ($brackets as $bracket) {
                    $start = floatval($bracket->range_start);
                    $end = $bracket->range_end !== null ? floatval($bracket->range_end) : INF; // if end is null, assume open-ended
                    if ($baseSalary >= $start && $baseSalary <= $end) {
                        $employee_amount += floatval($bracket->employee_share);
                        $employer_amount += floatval($bracket->employer_share);
                        break; 
                    }
                }
            }
            else if ($type === "Bracket Percentage") {
                $brackets = $benefit->benefit->brackets;
                foreach ($brackets as $bracket) {
                    $start = floatval($bracket->range_start);
                    $end = $bracket->range_end !== null ? floatval($bracket->range_end) : INF; 
                    if ($baseSalary >= $start && $baseSalary <= $end) {
                        $employee_amount += $baseSalary * ($bracket->employee_share / 100);
                        $employer_amount += $baseSalary * ($bracket->employer_share / 100);
                        break; 
                    }
                }
            }

            $benefits[] = [
                'id' => Crypt::encrypt($benefit->id),
                'benefit_id' => Crypt::encrypt($benefit->benefit->id),
                'name' => $benefit->benefit->name,
                'type' => $benefit->benefit->type,
                'number' => $benefit->number,
                'employer_amount' => $benefit->benefit->employer_amount,
                'employee_amount' => $benefit->benefit->employee_amount,
                'employer_percentage' => $benefit->benefit->employer_percentage,
                'employee_percentage' => $benefit->benefit->employee_percentage,
                'employer_contribution' => $employer_amount,
                'employee_contribution' => $employee_amount,
                'payment_schedule' => $benefit->benefit->payment_schedule,
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
        $benefitsRaw = $client->benefits()
        ->with(['brackets' => function ($query) {
            $query->select('id', 'benefit_id', 'range_start', 'range_end', 'employer_share', 'employee_share');
        }])
        ->get();
        $benefits = [];

        foreach ($benefitsRaw as $benefit) {    
            $brackets = $benefit->brackets ?? [];

            $lowestEmployerShare = null;
            $highestEmployerShare = null;
            $lowestEmployeeShare = null;
            $highestEmployeeShare = null;

            if ($brackets->count() > 0) {
                $employerShares = $brackets->pluck('employer_share')->map(function ($val) {
                    return floatval($val);
                });
                $employeeShares = $brackets->pluck('employee_share')->map(function ($val) {
                    return floatval($val);
                });
    
                $lowestEmployerShare = $employerShares->min();
                $highestEmployerShare = $employerShares->max();
                $lowestEmployeeShare = $employeeShares->min();
                $highestEmployeeShare = $employeeShares->max();
            }

            $benefits[] = [
                'id' => Crypt::encrypt($benefit->id),
                'name' => $benefit->name,
                'type' => $benefit->type,
                'employer_amount' => $benefit->employer_amount,
                'employee_amount' => $benefit->employee_amount,
                'employer_percentage' => $benefit->employer_percentage,
                'employee_percentage' => $benefit->employee_percentage,
                'benefit_brackets' => $benefit->brackets ?? [],
                'lowest_employee_share' => $lowestEmployeeShare,
                'highest_employee_share' => $highestEmployeeShare,
                'lowest_employer_share' => $lowestEmployerShare,
                'highest_employer_share' => $highestEmployerShare,
                "payment_schedule" => $benefit->payment_schedule,
            ];
        }
        
        return response()->json(['status' => 200, 'benefits' => $benefits]);
    }

    //for dropdown menu purposes 
    public function getAssignableBenefits(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized']);
        }
        $username = $request->input('username');
        $employee = UsersModel::with('benefits')->where('user_name', $username)->firstOrFail();
        $client = ClientsModel::with('benefits')->findOrFail($employee->client_id);
    
        $assignedIds = $employee->benefits->pluck('benefit_id');
    
        $benefits = $client->benefits->map(function ($benefit) use ($assignedIds) {
            return [
                'id' => Crypt::encrypt($benefit->id),
                'name' => $benefit->name,
                'disabled' => $assignedIds->contains($benefit->id),
            ];
        });
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
            'payment_schedule' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {
            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $type = $request->benefitType;
            $brackets_list = $request->input('brackets_list');

            try {
                DB::beginTransaction();

                $benefit = BenefitsModel::create([
                    "name" => $request->benefitName,
                    "type" => $request->benefitType,
                    "employee_percentage" => $request->employeePercentage,
                    "employer_percentage" => $request->employerPercentage,
                    "employee_amount" => $request->employeeAmount,
                    "employer_amount" => $request->employerAmount,
                    "payment_schedule" => $request->payment_schedule,
                    "client_id" => $client->id,
                ]);

                if(is_array($brackets_list) && !empty($brackets_list && ($type != "Amount" || $type != "Percentage"))){
                    foreach($brackets_list as $bracket){
                        BenefitBracket::create([
                            "benefit_id" => $benefit->id,
                            "range_start" => $bracket['range_start'],
                            "range_end" => $bracket['range_end'],
                            "employer_share" => $bracket['employer_share'],
                            "employee_share" => $bracket['employee_share'],
                        ]);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200, 'message' => "Benefits saved successfully!"]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
    }

    public function updateBenefits(Request $request){
        $validated = $request->validate([
            'benefitName' => 'required',
            'benefitType' => 'required',
            'employeeAmount' => 'required',
            'employerAmount' => 'required',
            'employeePercentage' => 'required',
            'employerPercentage' => 'required',
            'payment_schedule' => 'required',
        ]);

        if(!$this->checkUserAdmin() && !$validated){
            return response()->json(['status' => 401, 'message' => 'Unauthorized']);  
        }

        try{
            $benefit_id = Crypt::decrypt($request->benefit_id);
        }
        catch(\Exception $e){
            return response()->json(["status" => 403, 'message' => 'Invalid ID']);
        }

        $benefit = BenefitsModel::findOrFail($benefit_id);
        $brackets_list = $request->input('brackets_list');
        $type = $request->benefitType;
        if($benefit){
            try{
                DB::beginTransaction();
                $benefit->name = $request->benefitName;
                $benefit->type = $request->benefitType;
                $benefit->employer_amount = $request->employerAmount;
                $benefit->employee_amount = $request->employeeAmount;
                $benefit->employer_percentage = $request->employerPercentage;
                $benefit->employee_percentage = $request->employeePercentage;
                $benefit->payment_schedule = $request->payment_schedule;
                $benefit->save();

                if(is_array($brackets_list) && !empty($brackets_list && ($type != "Amount" || $type != "Percentage")))
                {   
                    //collects id for deletion purposes
                    $submittedIds = [];
                    foreach ($brackets_list as $bracket) {
                        //if the list contains the id key (from the database), update said data
                        if (isset($bracket['id'])) {
                            BenefitBracket::where('id', $bracket['id'])->update([
                                'range_start' => $bracket['range_start'],
                                'range_end' => $bracket['range_end'],
                                'employer_share' => $bracket['employer_share'],
                                'employee_share' => $bracket['employee_share'],
                            ]);
                            $submittedIds[] = $bracket['id'];
                        //else insert it to the table
                        } else {
                            $new = $benefit->brackets()->create([
                                'range_start' => $bracket['range_start'],
                                'range_end' => $bracket['range_end'],
                                'employer_share' => $bracket['employer_share'],
                                'employee_share' => $bracket['employee_share'],
                            ]);
                            $submittedIds[] = $new->id;
                        }
                    }
                    // Delete brackets not in the submitted ID list
                    BenefitBracket::where('benefit_id', $benefit->id)
                        ->whereNotIn('id', $submittedIds)
                        ->delete();
                }    
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
        return response()->json(['status' => 200, 'message' => 'Benefits updated successfully!']);
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
            $emp_benefit->status = $request->status;
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
                    "payment_schedule" => $allowance->payment_schedule,
                ];
            }

            return response()->json(['status' => 200, 'allowances' => $allowances]);
        }

        return response()->json(['status' => 200, 'allowances' => null]);
    }

    public function getAssignableAllowances(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized']);
        }
        $username = $request->input('username');
        $employee = UsersModel::with('allowances')->where('user_name', $username)->firstOrFail();
        $client = ClientsModel::with('allowances')->findOrFail($employee->client_id);
    
        $assignedIds = $employee->allowances->pluck('allowance_id');
            
        $allowances = $client->allowances->map(function ($allowance) use ($assignedIds) {
            return [
                'id' => Crypt::encrypt($allowance->id),
                'name' => $allowance->name,
                'disabled' => $assignedIds->contains($allowance->id),
            ];
        });
        return response()->json(['status' => 200, 'allowances' => $allowances]);
    }

    public function saveAllowance(Request $request)
    {
        // log::info("AllowanceController::saveAllowance");

        $validated = $request->validate([
            'name' => 'required',
            'payment_schedule' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {
            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                AllowancesModel::create([
                    "name" => $request->name,
                    "type" => "Amount",
                    "amount" => 0.00,
                    "percentage" => 0.00,
                    "payment_schedule" => $request->payment_schedule,
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

    public function updateAllowance(Request $request){
        $validated = $request->validate([
            'name' => 'required',
            "payment_schedule" => 'required',
        ]);

        if(!$this->checkUserAdmin() && !$validated){
            return response()->json(['status' => 401, 'message' => 'Unauthorized']);  
        }

        try{
            $id = Crypt::decrypt($request->allowance_id);
        }
        catch(\Exception $e){
            return response()->json(["status" => 403, 'message' => 'Invalid ID']);
        }

        $allowance = AllowancesModel::findOrFail($id);
        
        if($allowance){
            try{
                DB::beginTransaction();
                $allowance->name = $request->name;
                $allowance->payment_schedule = $request->payment_schedule;
                $allowance->save();
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
        return response()->json(['status' => 200, 'message' => 'Process Success']);
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

        $filterAllowanceId = $request->input('allowance_id');
        $decryptedAllowanceId = null;

        if (!empty($filterAllowanceId)) {
            try {
                $decryptedAllowanceId = Crypt::decrypt($filterAllowanceId);
            } catch (\Exception $e) {
                $decryptedAllowanceId = null;
            }
        }
        
        foreach($employee->allowances as $allowance){
            if ($decryptedAllowanceId && $allowance->allowance_id != $decryptedAllowanceId) {
                continue; 
            }

            $amount = 0;
            $type = $allowance->allowance->type;

            if ($type == 'Amount'){
                $amount += $allowance->allowance->amount;
            } else {
                $amount += ($baseSalary * ($allowance->allowance->percentage / 100));
            }
            
            $allowances[] = [
                'id' => Crypt::encrypt($allowance->id),
                'name' => $allowance->allowance->name,
                'number' => $allowance->number,
                'type' => $type,
                'amount' => $allowance->allowance->amount,
                'employee_amount' => (float) $allowance->amount,
                'percentage' => $allowance->allowance->percentage,
                'payment_schedule' => $allowance->allowance->payment_schedule,
                'calculated_amount' => $amount,
                'status' =>$allowance->status,
                'created_at' => $allowance->created_at,
            ];
        }
        return response()->json(['status' => 200, 'allowances' => $allowances]);
    }

    public function getEmployeesAllowance(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json([ 'status' => 200, 'employee_count' => 0, 'employees' => [], 'total' => 0 ]);
        }

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        $filterName = strtolower($request->input('name'));
        $filterBranchId = $request->input('branch_id');
        $filterDepartmentId = $request->input('department_id');
        $filterAllowanceId = $request->filled('allowance_id') ? Crypt::decrypt($request->input('allowance_id')) : null;
        $page = max(1, (int)$request->input('page', 1));
        $perPage = max(1, (int)$request->input('per_page', 10));
        
        //fetch employees that have existing allowance records. If there is a filter prompted in the FE, triggers the when() function
        $qualifyingEmployeeIds = EmployeeAllowancesModel::whereNull('deleted_at')
        ->when($filterAllowanceId, fn($q) => $q->where('allowance_id', $filterAllowanceId))
        ->pluck('user_id')
        ->unique();

        //for filtering employees, based on the previous result above this code ^ (whereHas is to ensure that those with existing department/branch link are included only)
        $query = UsersModel::with(['branch', 'department'])
        ->where('client_id', $client->id)
        ->whereHas('branch')
        ->whereHas('department')
        ->whereIn('id', $qualifyingEmployeeIds);

        //These three only triggers if the corresponding values are not null
        //search name filtering via FE searchbar
        if($filterName){
            $query->whereRaw("LOWER(CONCAT(last_name, ', ', first_name)) LIKE ?", ["%$filterName%"]);
        }
        //branch filtering via FE dropdown
        if($filterBranchId){
            $query->where('branch_id', $filterBranchId);
        }
        if($filterDepartmentId){
            $query->where('department_id', $filterDepartmentId);
        }

        //for employee counting purposes <pagination>
        $countQuery = (clone $query);
        $total_count = $countQuery->count();
        $employees = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        $result = collect();
        $total_amount = 0;

        //allowance calculation purposes
        foreach($employees as $employee){
            $amount = EmployeeAllowancesModel::where('user_id', $employee->id)->sum('amount');

            $result->push([
                'user_name' => $employee->user_name,
                'name' => "{$employee->last_name}, {$employee->first_name} {$employee->middle_name} {$employee->suffix}",
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch_id,
                'department_id' => $employee->department_id,
                'amount' => $amount,
            ]);  
            $total_amount += $amount;
        }
        return response()->json([
            'status' => 200,
            'employee_count' => $total_count,
            'employees' => $result->values(),
            'total' => $total_amount,
            'current_page' => $page,
        ]);
    }

    public function saveEmployeeAllowance(Request $request)
    {
        log::info("AllowanceController::saveEmployeeAllowance");

        $validated = $request->validate([
            'userName' => 'required',
            'allowance' => 'required',
            // 'number' => 'required',
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
                // "number" => $request->number,
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
        $employee_allowance_id = Crypt::decrypt($request->emp_allowance_id);
        $emp_allowance = EmployeeAllowancesModel::findOrFail($employee_allowance_id);

        if($emp_allowance){
            $emp_allowance->amount = $request->amount;
            $emp_allowance->status = $request->status;
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
                    'payment_schedule' => $deduction->payment_schedule,
                ];
            }

            return response()->json(['status' => 200, 'deductions' => $deductions]);
        }
        return response()->json(['status' => 200, 'deductions' => null]);
    }

    public function getAssignableDeductions(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized']);
        }
        $username = $request->input('username');
        $employee = UsersModel::with('deductions')->where('user_name', $username)->firstOrFail();
        $client = ClientsModel::with('deductions')->findOrFail($employee->client_id);
    
        $assignedIds = $employee->deductions->pluck('deduction_id');
    
        $deductions = $client->deductions->map(function ($deduction) use ($assignedIds) {
            return [
                'id' => Crypt::encrypt($deduction->id),
                'name' => $deduction->name,
                'disabled' => $assignedIds->contains($deduction->id),
            ];
        });
        return response()->json(['status' => 200, 'deductions' => $deductions]);
    }

    public function saveDeductions(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'type' => 'required',
            'amount' => 'required',
            'percentage' => 'required',
            'payment_schedule' => 'required'
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
                    "payment_schedule" => $request->payment_schedule,
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

    public function updateDeductions(Request $request){
        $validated = $request->validate([
            'name' => 'required',
            'type' => 'required',
            'amount' => 'required',
            'percentage' => 'required',
            'payment_schedule' => 'required'
        ]);
        if(!$this->checkUserAdmin() && !$validated){
            return response()->json(['status' => 401, 'message' => 'Unauthorized']);  
        }

        try{
            $deduction_id = Crypt::decrypt($request->deduction_id);
        }
        catch(\Exception $e){
            return response()->json(["status" => 403, 'message' => 'Invalid ID']);
        }

        $deduction = DeductionsModel::findOrFail($deduction_id);
        if($deduction){
            try{
                DB::beginTransaction();
                $deduction->name = $request->name;
                $deduction->type = $request->type;
                $deduction->amount = $request->amount;
                $deduction->percentage = $request->percentage;
                $deduction->payment_schedule = $request->payment_schedule;
                $deduction->save();
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
        return response()->json(['status' => 200, 'message' => 'Process Success']);
    }

    public function getEmployeeDeductions(Request $request)
    {
        if(!$this->checkUserAdmin()){
            return response()->json(['status' => 200, 'deductions' => null]);  
        }
        $employee = UsersModel::where('user_name', $request->username)->first();
        $baseSalary = floatval($employee->salary);
        $deductions = [];

        $filterDeductionId = $request->input('deduction_id');
        $decryptedDeductionId = null;
        if (!empty($filterDeductionId)) {
            try {
                $decryptedDeductionId = Crypt::decrypt($filterDeductionId);
            } catch (\Exception $e) {
                $decryptedDeductionId = null;
            }
        }
    
        foreach($employee->deductions as $deduction){
            if ($decryptedDeductionId && $deduction->deduction_id != $decryptedDeductionId) {
                continue; 
            }

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
                'payment_schedule' => $deduction->deduction->payment_schedule,
                'calculated_amount' => $amount,     
                'status' =>$deduction->status,
                'created_at' => $deduction->created_at,
            ];
        }
        return response()->json(['status' => 200, 'deductions' => $deductions]);
    }

    public function getEmployeesDeductions(Request $request)
    {
        if (!$this->checkUserAdmin()) {
            return response()->json([
                'status' => 200,
                'employee_count' => 0,
                'employees' => [],
                'total' => 0,
            ]);
        }
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);
        $filterName = strtolower($request->input('name'));
        $filterBranchId = $request->input('branch_id');
        $filterDepartmentId = $request->input('department_id');
        $filterDeductionId = $request->filled('deduction_id') ? Crypt::decrypt($request->input('deduction_id')) : null;
        $page = max(1, (int)$request->input('page', 1));
        $perPage = max(1, (int)$request->input('per_page', 10));

        $qualifyingEmployeeIds = EmployeeDeductionsModel::whereNull('deleted_at')
        ->when($filterDeductionId, fn($q) => $q->where('deduction_id', $filterDeductionId))
        ->pluck('user_id')
        ->unique();

        $query = UsersModel::with(['branch', 'department'])
        ->where('client_id', $client->id)
        ->whereHas('branch')
        ->whereHas('department')
        ->whereIn('id', $qualifyingEmployeeIds)
        ->when($filterName, fn($q) => $q->whereRaw("LOWER(CONCAT(last_name, ', ', first_name)) LIKE ?", ["%$filterName%"]))
        ->when($filterBranchId, fn($q) => $q->where('branch_id', $filterBranchId))
        ->when($filterDepartmentId, fn($q) => $q->where('department_id', $filterDepartmentId));

        $countQuery = (clone $query);
        $total_count = $countQuery->count();
        $employees = $query
        ->offset(($page - 1) * $perPage)
        ->limit($perPage)
        ->get();

        $result = collect();
        $total_amount = 0;

        foreach($employees as $employee){
            $deductions = EmployeeDeductionsModel::with('deduction')
            ->where('user_id', $employee->id)
            ->whereNull('deleted_at')
            ->when($filterDeductionId, fn($q) => $q->where('deduction_id', $filterDeductionId))
            ->get();
            
            $baseSalary = floatval($employee->salary);
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
            $result->push([
                'user_name' => $employee->user_name,
                'name' => "{$employee->last_name}, {$employee->first_name} {$employee->middle_name} {$employee->suffix}",
                'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                'branch_id' => $employee->branch_id,
                'department_id' => $employee->department_id,
                'amount' => $amount,
            ]);      
        }
        $total_amount += $amount;

        return response()->json([
            'status' => 200,
            'employee_count' => $total_count,
            'employees' => $result->values(),
            'total' => $total_amount,
            'current_page' => $page,
        ]);
    }

    public function saveEmployeeDeductions(Request $request)
    {
        log::info("AllowanceController::saveEmployeeAllowance");

        $validated = $request->validate([
            'userName' => 'required',
            'deduction' => 'required',
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
            $emp_deduction->status = $request->status;
            $emp_deduction->save();
        }
        return response()->json(['status' => 200]);
    }
    //---------------->[#endregion DEDUCTIONS CONTROLLERS]
 
    

    


}
