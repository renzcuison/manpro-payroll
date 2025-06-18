<?php

namespace App\Http\Controllers;

use App\Models\GroupLifeCompany;
use App\Models\GroupLifeCompanyPlan;
use App\Models\GroupLifeEmployeePlan;
use App\Models\UsersModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InsurancesController extends Controller
{
    public function checkUserAdmin()
    {
        // log::info("PayrollController::checkUserAdmin");

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
        // log::info("PayrollController::checkUserEmployee");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Employee') {
                return true;
            }
        }

        return false;
    }

    public function saveGroupLifeCompanies(Request $request)
    {
        log::info("InsurancesController::saveGroupLifeCompanies");

        if (!$this->checkUserAdmin()) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:64'
        ]);

        log::info($user->client_id);

        $company = GroupLifeCompany::create([
            'name' => $request->name,
            'client_id' => $user->client_id,
        ]);

        return response()->json($company, 201);
    }

    public function getGroupLifeCompanies()
    {
        log::info("InsurancesController::getGroupLifeCompanies");

        $user = Auth::user();

        $rawCompanies = GroupLifeCompany::withCount('plans')->where('client_id', $user->client_id)->get();

        $companies = [];

        foreach ($rawCompanies as $company) {
            $companies[] = [
                'id' => $company->id,
                'name' => $company->name,
                'plans' => $company->plans_count,
            ];
        }

        return response()->json([
            'status' => 200,
            'companies' => $companies,
        ]);
    }

    public function getGroupLifePlans()

    {
        log::info("InsurancesController::getGroupLifePlans");

        $user = Auth::user();

        $plans = GroupLifeCompanyPlan::whereHas('company', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })
            ->with('company:id,name')
            ->orderBy('plan_name')
            ->get();

        $formattedPlans = [];

        foreach ($plans as $plan) {
            $formattedPlans[] = [
                'id' => $plan->id,
                'group_life_company_name' => $plan->company->name,
                'plan_name' => $plan->plan_name,
                'type' => $plan->type,
                'employer_share' => $plan->employer_share,
                'employee_share' => $plan->employee_share,
            ];
        }

        return response()->json([
            'status' => 200,
            'plans' => $formattedPlans,
        ]);
    }

    public function saveGroupLifePlans(Request $request)
    {
        log::info("InsurancesController::saveGroupLifePlans");

        $user = Auth::user();
        if (!$user || $user->user_type !== 'Admin') {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $validated = $request->validate([
            'group_life_company_id' => 'required|exists:group_life_companies,id',
            'plan_name' => 'required|string|max:50',
            'type' => 'required|string|max:50',
            'employer_share' => 'required|numeric',
            'employee_share' => 'required|numeric',
        ]);

        $plan = GroupLifeCompanyPlan::create($validated);

        return response()->json($plan, 201);
    }

    public function getGroupLifeEmployeePlan()
    {
        log::info("InsurancesController::getGroupLifeCompanies");

        $user = Auth::user();

        $rawCompanies = GroupLifeCompany::withCount('plans')->where('client_id', $user->client_id)->get();

        $companies = [];

        foreach ($rawCompanies as $company) {
            $companies[] = [
                'id' => $company->id,
                'name' => $company->name,
                'plans' => $company->plans_count,
            ];
        }

        return response()->json([
            'status' => 200,
            'companies' => $companies,
        ]);
    }

    public function getGroupLifeEmployeePlanById(Request $request, $id)
    {

        $user = Auth::user();

        try {
            $employeePlan = GroupLifeEmployeePlan::with([
                'dependents',
                'employee.branch',
                'employee.department'
            ])->findOrFail($id);

            return response()->json([
                'status' => 200,
                'data' => [
                    'id' => $employeePlan->id,
                    'employee_id' => $employeePlan->employee_id,
                    'employee_name' => $employeePlan->employee->first_name . ' ' . $employeePlan->employee->last_name,
                    'group_life_plan_id' => $employeePlan->group_life_plan_id,
                    'enroll_date' => $employeePlan->enroll_date,
                    'branch_id' => $employeePlan->employee->branch_id ?? "",
                    'branch_name' => $employeePlan->employee->branch->name ?? "",
                    'department_id' => $employeePlan->employee->department_id ?? "",
                    'department_name' => $employeePlan->employee->department->name ?? "",
                    'dependents' => $employeePlan->dependents->map(function ($dep) {
                        return [
                            'name' => $dep->dependent_name,
                            'relationship' => $dep->relationship
                        ];
                    }),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => 'Employee plan not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function editGroupLifeEmployeePlan(Request $request, $id)
    {
        $validated = $request->validate([
            'enroll_date' => 'required|date',
            'dependents' => 'required|array',
            'dependents.*.name' => 'required|string|max:255',
            'dependents.*.relationship' => 'required|string|max:100',
        ]);

        $employeePlan = GroupLifeEmployeePlan::with('employee', 'dependents')->find($id);

        if (!$employeePlan) {
            return response()->json(['message' => 'Employee plan not found.'], 404);
        }

        $employeePlan->update([
            'enroll_date' => $validated['enroll_date'],
        ]);

        $existingDependents = $employeePlan->dependents->keyBy(function ($dep) {
            return strtolower($dep->dependent_name);
        });

        $incomingDependents = collect($validated['dependents']);
        $added = [];
        $updated = [];

        foreach ($incomingDependents as $newDep) {
            $nameKey = strtolower($newDep['name']);
            if ($existingDependents->has($nameKey)) {
                $dep = $existingDependents->get($nameKey);

                if ($dep->relationship !== $newDep['relationship']) {
                    $dep->update(['relationship' => $newDep['relationship']]);
                    $updated[] = $dep;
                }

                $existingDependents->forget($nameKey);
            } else {
                $created = $employeePlan->dependents()->create([
                    'dependent_name' => $newDep['name'],
                    'relationship' => $newDep['relationship'],
                ]);
                $added[] = $created;
            }
        }

        $existingDependents->each->delete();
        $employeePlan->load('dependents', 'employee');

        return response()->json([
            'status' => 200,
            'message' => 'Employee plan updated successfully.',
            'enroll_date' => $employeePlan->enroll_date,
            'employee_name' => $employeePlan->employee->first_name . ' ' . $employeePlan->employee->last_name,
            'added_dependents' => $added,
            'updated_dependents' => $updated,
            'all_dependents' => $employeePlan->dependents,
        ]);
    }

    public function getGroupLifeEmployees(Request $request)
    {
        Log::info("InsurancesController::getAllGroupLifeEmployees");

        $planId = $request->query('plan_id');

        $query = GroupLifeEmployeePlan::with(['employee', 'dependents']);

        if ($planId) {
            $query->where('group_life_plan_id', $planId);
        }

        // $employees = GroupLifeEmployeePlan::with(['employee', 'dependents'])->get();

        $employees = $query->get();

        $formatted = $employees->map(function ($record) {
            return [
                'plan_id' => $record->group_life_plan_id,
                'employee_id' => $record->employee_id,
                'employee_name' => $record->employee ? $record->employee->employee_name : 'Unknown',
                'enroll_date' => $record->enroll_date,
                'dependents_count' => $record->dependents->count(),
                'dependents' => $record->dependents
            ];
        });

        return response()->json([
            'status' => 200,
            'employees' => $formatted
        ]);
    }

    public function saveGroupLifeEmployees(Request $request)
    {
        Log::info("InsurancesController::saveGroupLifeEmployees");

        $validated = $request->validate([
            'group_life_plan_id' => 'required|exists:group_life_plans,id',
            'employee_id' => 'required|exists:users,id', // or employees table if applicable
            'enroll_date' => 'required|date',
            'dependents' => 'nullable|array',
            'dependents.*.name' => 'required_with:dependents|string|max:255',
            'dependents.*.relationship' => 'required_with:dependents|string|max:100',
        ]);

        // Save the main employee plan record
        $employeePlan = new GroupLifeEmployeePlan([
            'group_life_plan_id' => $validated['group_life_plan_id'],
            'employee_id' => $validated['employee_id'],
            'enroll_date' => $validated['enroll_date'],
        ]);
        $employeePlan->save();
        $employeePlan->refresh();

        // Save dependents if any
        if (!empty($validated['dependents'])) {
            foreach ($validated['dependents'] as $dependent) {
                $employeePlan->dependents()->create([
                    'dependent_name' => $dependent['name'],
                    'relationship' => $dependent['relationship'],
                    'group_life_employee_id' => $employeePlan->id,
                ]);
            }
        }

        // Eager load employee and dependents for the response
        $employeePlan->load('employee', 'dependents');

        return response()->json([
            'status' => 201,
            'message' => 'Group life employee plan saved successfully.',
            'data' => [
                'plan_id' => $employeePlan->group_life_plan_id,
                'employee_id' => $employeePlan->employee_id,
                'employee_name' => $employeePlan->employee ? $employeePlan->employee->employee_name : 'Unknown',
                'enroll_date' => $employeePlan->enroll_date,
                'dependents_count' => $employeePlan->dependents->count(),
                'dependents' => $employeePlan->dependents,
            ]
        ]);
    }
}
