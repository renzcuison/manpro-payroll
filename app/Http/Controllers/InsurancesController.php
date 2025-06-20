<?php

namespace App\Http\Controllers;

use App\Models\GroupLifeCompany;
use App\Models\GroupLifeCompanyPlan;
use App\Models\GroupLifeEmployeePlan;
use App\Models\GroupLifeDependents;
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

    public function editGroupLifeCompany(Request $request, $id)
    {
        Log::info("InsurancesController::editGroupLifeCompany");

        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $company = GroupLifeCompany::where('client_id', $user->client_id)
                                    ->where('id', $id)
                                    ->first();

        if (!$company) {
            return response()->json([
                'status' => 404,
            ], 404);
        }

        $company->name = $validated['name'];
        $company->save();

        return response()->json([
            'status' => 200,
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
            ]
        ]);
    }

    public function deleteGroupLifeCompany($id)
    {
        $company = GroupLifeCompany::withCount('plans')->find($id);

        if ($company->plans_count > 0) {
            return response(null, 400);
        }

        $company->delete();
        return response()->json(['message' => 'Company soft deleted successfully.'], 200);
    }

    public function getGroupLifePlans()
        {
        log::info("InsurancesController::getGroupLifePlans");

        $user = Auth::user();

        $plans = GroupLifeCompanyPlan::whereHas('company', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })
            ->with('company:id,name')
            ->withCount('assignedEmployees')
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
                    'employees_assigned_count' => $plan->assigned_employees_count
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

    public function editGroupLifePlan(Request $request, $id)
        {
        Log::info("InsurancesController::editGroupLifePlan");

        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'employer_share' => 'required|numeric|min:0',
            'employee_share' => 'required|numeric|min:0',
        ]);

        $plan = GroupLifeCompanyPlan::findOrFail($id);

        $plan->plan_name = $validated['plan_name'];
        $plan->type = $validated['type'];
        $plan->employer_share = $validated['employer_share'];
        $plan->employee_share = $validated['employee_share'];
        $plan->save();

        return response()->json(null, 200);
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
            $employee = GroupLifeEmployeePlan::with([
                'dependents',
                'employee.branch',
                'employee.department'
            ])->findOrFail($id);

            return response()->json([
                'status' => 200,
                'data' => [
                    'id' => $employee->id,
                    'employee_id' => $employee->employee_id,
                    'employee_name' => $employee->employee->first_name . ' ' . $employee->employee->last_name,
                    'group_life_plan_id' => $employee->group_life_plan_id,
                    'enroll_date' => $employee->enroll_date,
                    'branch_id' => $employee->employee->branch_id ?? "",
                    'branch_name' => $employee->employee->branch->name ?? "",
                    'department_id' => $employee->employee->department_id ?? "",
                    'department_name' => $employee->employee->department->name ?? "",
                    'dependents' => $employee->dependents->map(function ($dep) {
                        return [
                            'id' => $dep->id,
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
            'dependents.*.id' => 'nullable|integer|exists:group_life_dependents,id',
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

        $existingDependents = $employeePlan->dependents->keyBy('id');
        $incoming = collect($validated['dependents']);

        $updated = [];

        foreach ($incoming as $depInput) {
            if (isset($depInput['id'])) {
                if ($existingDependents->has($depInput['id'])) {
                    $dep = $existingDependents[$depInput['id']];
                    if (
                        $dep->dependent_name !== $depInput['name'] ||
                        $dep->relationship !== $depInput['relationship']
                    ) {
                        $dep->update([
                            'dependent_name' => $depInput['name'],
                            'relationship' => $depInput['relationship'],
                        ]);
                        $updated[] = $dep;
                    }
                }
            } else {
                $new = $employeePlan->dependents()->create([
                    'dependent_name' => $depInput['name'],
                    'relationship' => $depInput['relationship'],
                ]);
                $updated[] = $new;
            }
        }

        $employeePlan->load('dependents', 'employee');

        return response()->json([
            'status' => 200,
            'message' => 'Employee plan updated successfully.',
            'enroll_date' => $employeePlan->enroll_date,
            'employee_name' => $employeePlan->employee->first_name . ' ' . $employeePlan->employee->last_name,
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
                'id' => $record->id,
                'plan_id' => $record->group_life_plan_id,
                'employee_id' => $record->employee_id,
                'employee_name' => $record->employee ? $record->employee->employee_name : 'Unknown',
                'enroll_date' => $record->enroll_date,
                'dependents_count' => $record->dependents->count(),
                'dependents' => $record->dependents,

                'branch' => $record->employee->branch ?? 'N/A',
                'department' => $record->employee->department ?? 'N/A',
                'role' => $record->employee->role ?? 'N/A',
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
            'employee_id' => 'required|exists:users,id', 
            'enroll_date' => 'required|date',
            'dependents' => 'nullable|array',
            'dependents.*.name' => 'required_with:dependents|string|max:255',
            'dependents.*.relationship' => 'required_with:dependents|string|max:100',
        ]);

        $employeePlan = new GroupLifeEmployeePlan([
            'group_life_plan_id' => $validated['group_life_plan_id'],
            'employee_id' => $validated['employee_id'],
            'enroll_date' => $validated['enroll_date'],
        ]);
        $employeePlan->save();
        $employeePlan->refresh();
        
        if (!empty($validated['dependents'])) {
            foreach ($validated['dependents'] as $dependent) {
                $employeePlan->dependents()->create([
                    'dependent_name' => $dependent['name'],
                    'relationship' => $dependent['relationship'],
                    'group_life_employee_id' => $employeePlan->id,
                ]);
            }
        }

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
