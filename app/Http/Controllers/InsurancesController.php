<?php

namespace App\Http\Controllers;

use App\Models\GroupLifeCompany;
use App\Models\GroupLifeCompanyPlan;
use App\Models\GroupLifeEmployeePlan;
use App\Models\GroupLifeDependents;

use App\Models\HMOCompany;
use App\Models\HMOCompanyPlan;
use App\Models\HMOEmployeePlan;
use App\Models\HMODependents;

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


    // Group Life Insurance Companies - Admin
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
        return response()->json(null, 200);
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

    public function getGroupLifePlan($id)
    {
        Log::info("InsurancesController::getGroupLifePlan");

        $user = Auth::user();

        $plan = GroupLifeCompanyPlan::with('company:id,name')
        ->withCount('assignedEmployees')
        ->whereHas('company', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })
        ->findOrFail($id); 

        $formattedPlan = [
            'id' => $plan->id,
            'group_life_company_name' => $plan->company->name,
            'plan_name' => $plan->plan_name,
            'type' => $plan->type,
            'employer_share' => $plan->employer_share,
            'employee_share' => $plan->employee_share,
            'employees_assigned_count' => $plan->assigned_employees_count,
        ];

        return response()->json([
            'status' => 200,
            'plan' => $formattedPlan,
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

        $user = Auth::user();

        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'employer_share' => 'required|numeric|min:0',
            'employee_share' => 'required|numeric|min:0',
        ]);

        $plan = GroupLifeCompanyPlan::where('id', $id)
            ->first();

        if (!$plan) {
            return response()->json(['status' => 404], 404);
        }

        $plan->plan_name = $validated['plan_name'];
        $plan->type = $validated['type'];
        $plan->employer_share = $validated['employer_share'];
        $plan->employee_share = $validated['employee_share'];
        $plan->save();

        return response()->json([
            'status' => 200,
            'plan' => [
                'id' => $plan->id,
                'plan_name' => $plan->plan_name,
                'type' => $plan->type,
                'employer_share' => $plan->employer_share,
                'employee_share' => $plan->employee_share,
            ]
        ]);
    }

    public function deleteGroupLifePlan($id)
    {
        Log::info("InsurancesController::deleteGroupLifePlan");

        $user = Auth::user();

        $plan = GroupLifeCompanyPlan::where('id', $id)
            ->first();

        if (!$plan) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }
        $hasEmployees = GroupLifeEmployeePlan::where('group_life_plan_id', $id)->exists();

        if ($hasEmployees) {
            return response()->json([
                'status' => 400,
            ], 400);
        }
        $plan->delete();

        return response()->json([
            'status' => 200,
        ]);
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
            return response()->json(null, 404);
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

    public function deleteGroupLifeEmployee($id)
    {
        Log::info("InsurancesController::deleteGroupLifeEmployee");

        $employeePlan = GroupLifeEmployeePlan::with('dependents')->find($id);

        if (!$employeePlan) {
            return response()->json([
                'status' => 404,
            ]);
        }

        if ($employeePlan->dependents()->exists()) {
            return response()->json([
                'status' => 400,
            ]);
        }

        $employeePlan->delete();

        return response()->json([
            'status' => 200,
        ]);
    }
    


    public function deleteGroupLifeDependent($id)
    {
        Log::info("InsurancesController::deleteGroupLifeDependent");

        $dependent = GroupLifeDependents::find($id);

        if (!$dependent) {
            return response()->json([
                'status' => 404,
            ]);
        }

        $dependent->delete();

        return response()->json([
            'status' => 200,
        ]);
    }

    // Group Life Insurance Plans - Employee

    //     public function getEmployeeGroupLifePlan($id)
    // {
    //     $user = Auth::user();

    //     // Only allow fetching plans for the logged-in user
    //     $plan = GroupLifeEmployeePlan::with([
    //         'plan.company',
    //         'dependents'
    //     ])->where('employee_id', $user->id)->find($id);

    //     if (!$plan) {
    //         return response()->json(['plan' => null, 'dependents' => []], 404); // For your frontend check
    //     }

    //     return response()->json([
    //         'plan' => [
    //             'group_life_company_name' => $plan->plan->company->name ?? '',
    //             'plan_name' => $plan->plan->plan_name ?? '',
    //             'type' => $plan->plan->type ?? '',
    //             'employer_share' => $plan->plan->employer_share ?? '',
    //             'employee_share' => $plan->plan->employee_share ?? '',
    //             'enroll_date' => $plan->enroll_date,
    //         ],
    //         'dependents' => $plan->dependents->map(function ($dep) {
    //             return [
    //                 'name' => $dep->dependent_name,
    //                 'relationship' => $dep->relationship
    //             ];
    //         }),
    //     ]);
    // }

    public function getEmployeeGroupLifePlan(Request $request)
    {
    Log::info("InsurancesController::getEmployeeGroupLifePlan");

    if (!$this->checkUserEmployee()) {
        return response()->json(['message' => 'Unauthorized.'], 403);
    }

    $user = Auth::user();

    $record = GroupLifeEmployeePlan::with([
        'employee.branch',
        'employee.department',
        'employee.role',
        'dependents',
        'plan.company' // this includes company id & name
    ])
    ->where('employee_id', $user->id)
    ->first(); // Only the current user's plan

    if (!$record) {
        return response()->json(['plan' => null, 'dependents' => []], 404);
    }

    Log::info("Plan record:", ['record' => $record]);

    return response()->json([
        'id' => $record->id,
        'plan_id' => $record->group_life_plan_id,
        'employee_id' => $record->employee_id,
        'employee_name' => $record->employee?->employee_name ?? 'Unknown',
        'enroll_date' => $record->enroll_date,
        'dependents_count' => $record->dependents->count(),
        'dependents' => $record->dependents,

        // Plan (foreign key)
        'plan_name' => $record->plan?->plan_name ?? '',
        'plan_type' => $record->plan?->type ?? '',
        'employer_share' => $record->plan?->employer_share ?? '',
        'employee_share' => $record->plan?->employee_share ?? '',

        // Company (from plan.company)
        'company_id' => $record->plan?->company?->id ?? null,
        'company_name' => $record->plan?->company?->name ?? '',

        // Employee's work info
        'branch' => $record->employee?->branch ?? 'N/A',
        'department' => $record->employee?->department ?? 'N/A',
        'role' => $record->employee?->role ?? 'N/A',
    ]);
    }

    public function addEmployeeDependent(Request $request)
    {
        $request->validate([
            'employee_plan_id' => 'required|integer|exists:group_life_employee_plans,id',
            'name' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',
        ]);

        $dependent = GroupLifeDependents::create([
            'employee_plan_id' => $request->employee_plan_id,
            'name' => $request->name,
            'relationship' => $request->relationship,
        ]);

        return response()->json(['dependent' => $dependent], 201);
    }


    // HMO Insurance Companies - Admin

    public function saveHMOCompanies(Request $request)
    {
        log::info("InsurancesController::saveHMOCompanies");

        if (!$this->checkUserAdmin()) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:64'
        ]);

        log::info($user->client_id);

        $company = HMOCompany::create([
            'name' => $request->name,
            'client_id' => $user->client_id,
        ]);

        return response()->json($company, 201);
    }

    public function getHMOCompanies()
    {
        log::info("InsurancesController::getHMOCompanies");

        $user = Auth::user();

        $rawCompanies = HMOCompany::withCount('plans')->where('client_id', $user->client_id)->get();

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

    public function editHMOCompany(Request $request, $id)
    {
        Log::info("InsurancesController::editHMOCompany");

        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $company = HMOCompany::where('client_id', $user->client_id)
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

    public function deleteHMOCompany($id)
    {
        $company = HMOCompany::withCount('plans')->find($id);

        if ($company->plans_count > 0) {
            return response(null, 400);
        }

        $company->delete();
        return response()->json(null, 200);
    }

    public function getHMOPlans()
        {
        log::info("InsurancesController::getHMOPlans");

        $user = Auth::user();

        $plans = HMOCompanyPlan::whereHas('company', function ($query) use ($user) {
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
                    'hmo_company_name' => $plan->company->name,
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

    public function getHMOPlan($id)
    {
        Log::info("InsurancesController::getHMOPlan");

        $user = Auth::user();

        $plan = HMOCompanyPlan::with('company:id,name')
        ->withCount('assignedEmployees')
        ->whereHas('company', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })
        ->findOrFail($id); 

        $formattedPlan = [
            'id' => $plan->id,
            'hmo_company_name' => $plan->company->name,
            'plan_name' => $plan->plan_name,
            'type' => $plan->type,
            'employer_share' => $plan->employer_share,
            'employee_share' => $plan->employee_share,
            'employees_assigned_count' => $plan->assigned_employees_count,
        ];

        return response()->json([
            'status' => 200,
            'plan' => $formattedPlan,
        ]);
    }

    public function saveHMOPlans(Request $request)
    {
        log::info("InsurancesController::saveHMOPlans");

        $user = Auth::user();
        if (!$user || $user->user_type !== 'Admin') {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $validated = $request->validate([
            'hmo_company_id' => 'required|exists:hmo_companies,id',
            'plan_name' => 'required|string|max:50',
            'type' => 'required|string|max:50',
            'employer_share' => 'required|numeric',
            'employee_share' => 'required|numeric',
        ]);

            $plan = HMOCompanyPlan::create($validated);

            return response()->json($plan, 201);
    }

    public function editHMOPlan(Request $request, $id)
    {
        Log::info("InsurancesController::editHMOPlan");

        $user = Auth::user();

        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'employer_share' => 'required|numeric|min:0',
            'employee_share' => 'required|numeric|min:0',
        ]);

        $plan = HMOCompanyPlan::where('id', $id)
            ->first();

        if (!$plan) {
            return response()->json(['status' => 404], 404);
        }

        $plan->plan_name = $validated['plan_name'];
        $plan->type = $validated['type'];
        $plan->employer_share = $validated['employer_share'];
        $plan->employee_share = $validated['employee_share'];
        $plan->save();

        return response()->json([
            'status' => 200,
            'plan' => [
                'id' => $plan->id,
                'plan_name' => $plan->plan_name,
                'type' => $plan->type,
                'employer_share' => $plan->employer_share,
                'employee_share' => $plan->employee_share,
            ]
        ]);
    }

    public function deleteHMOPlan($id)
    {
        Log::info("InsurancesController::deleteHMOPlan");

        $user = Auth::user();

        $plan = HMOCompanyPlan::where('id', $id)
            ->first();

        if (!$plan) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }
        $hasEmployees = HMOEmployeePlan::where('hmo_plan_id', $id)->exists();

        if ($hasEmployees) {
            return response()->json([
                'status' => 400,
            ], 400);
        }
        $plan->delete();

        return response()->json([
            'status' => 200,
        ]);
    }

    public function getHMOEmployeePlan()
    {
        log::info("InsurancesController::getHMOCompanies");

        $user = Auth::user();

        $rawCompanies = HMOCompany::withCount('plans')->where('client_id', $user->client_id)->get();

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

    public function getHMOEmployeePlanById(Request $request, $id)
    {

        $user = Auth::user();

        try {
            $employee = HMOEmployeePlan::with([
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
                    'hmo_plan_id' => $employee->hmo_plan_id,
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
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function editHMOEmployeePlan(Request $request, $id)
    {
        $validated = $request->validate([
            'enroll_date' => 'required|date',
            'dependents' => 'required|array',
            'dependents.*.id' => 'nullable|integer|exists:hmo_dependents,id',
            'dependents.*.name' => 'required|string|max:255',
            'dependents.*.relationship' => 'required|string|max:100',
        ]);

        $employeePlan = HMOEmployeePlan::with('employee', 'dependents')->find($id);

        if (!$employeePlan) {
            return response()->json(null, 404);
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
            'enroll_date' => $employeePlan->enroll_date,
            'employee_name' => $employeePlan->employee->first_name . ' ' . $employeePlan->employee->last_name,
            'updated_dependents' => $updated,
            'all_dependents' => $employeePlan->dependents,
        ]);
    }


    public function getHMOEmployees(Request $request)
    {
        Log::info("InsurancesController::getAllHMOEmployees");

        $planId = $request->query('plan_id');

        $query = HMOEmployeePlan::with(['employee', 'dependents']);

        if ($planId) {
            $query->where('hmo_plan_id', $planId);
        }

        $employees = $query->get();

        $formatted = $employees->map(function ($record) {
            return [
                'id' => $record->id,
                'plan_id' => $record->hmo_plan_id,
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

    public function saveHMOEmployees(Request $request)
    {
        Log::info("InsurancesController::saveHMOEmployees");

        $validated = $request->validate([
            'hmo_plan_id' => 'required|exists:hmo_plans,id',
            'employee_id' => 'required|exists:users,id', 
            'enroll_date' => 'required|date',
            'dependents' => 'nullable|array',
            'dependents.*.name' => 'required_with:dependents|string|max:255',
            'dependents.*.relationship' => 'required_with:dependents|string|max:100',
        ]);

        $employeePlan = new HMOEmployeePlan([
            'hmo_plan_id' => $validated['hmo_plan_id'],
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
                    'hmo_employee_id' => $employeePlan->id,
                ]);
            }
        }

        $employeePlan->load('employee', 'dependents');

        return response()->json([
            'status' => 201,
            'data' => [
                'plan_id' => $employeePlan->hmo_plan_id,
                'employee_id' => $employeePlan->employee_id,
                'employee_name' => $employeePlan->employee ? $employeePlan->employee->employee_name : 'Unknown',
                'enroll_date' => $employeePlan->enroll_date,
                'dependents_count' => $employeePlan->dependents->count(),
                'dependents' => $employeePlan->dependents,
            ]
        ]);
    }

    public function deleteHMOEmployee($id)
    {
        Log::info("InsurancesController::deleteHMOEmployee");

        $employeePlan = HMOEmployeePlan::with('dependents')->find($id);

        if (!$employeePlan) {
            return response()->json([
                'status' => 404,
            ]);
        }

        if ($employeePlan->dependents()->exists()) {
            return response()->json([
                'status' => 400,
            ]);
        }

        $employeePlan->delete();

        return response()->json([
            'status' => 200,
        ]);
    }


    public function deleteHMODependent($id)
    {
        Log::info("InsurancesController::deleteHMODependent");

        $dependent = HMODependents::find($id);

        if (!$dependent) {
            return response()->json([
                'status' => 404,
            ]);
        }

        $dependent->delete();

        return response()->json([
            'status' => 200,
        ]);
    }

    
    // HMO Insurance Plans - Employee

    public function getEmployeeHMOPlan(Request $request)
    {
    Log::info("InsurancesController::getEmployeeHMOPlan");

    if (!$this->checkUserEmployee()) {
        return response()->json(['message' => 'Unauthorized.'], 403);
    }

    $user = Auth::user();

    $record = HMOEmployeePlan::with([
        'employee.branch',
        'employee.department',
        'employee.role',
        'dependents',
        'plan.company' // this includes company id & name
    ])
    ->where('employee_id', $user->id)
    ->first(); // Only the current user's plan

    if (!$record) {
        return response()->json(['plan' => null, 'dependents' => []], 404);
    }

    Log::info("Plan record:", ['record' => $record]);

    return response()->json([
        'id' => $record->id,
        'plan_id' => $record->hmo_plan_id,
        'employee_id' => $record->employee_id,
        'employee_name' => $record->employee?->employee_name ?? 'Unknown',
        'enroll_date' => $record->enroll_date,
        'dependents_count' => $record->dependents->count(),
        'dependents' => $record->dependents,

        // Plan (foreign key)
        'plan_name' => $record->plan?->plan_name ?? '',
        'plan_type' => $record->plan?->type ?? '',
        'employer_share' => $record->plan?->employer_share ?? '',
        'employee_share' => $record->plan?->employee_share ?? '',

        // Company (from plan.company)
        'company_id' => $record->plan?->company?->id ?? null,
        'company_name' => $record->plan?->company?->name ?? '',

        // Employee's work info
        'branch' => $record->employee?->branch ?? 'N/A',
        'department' => $record->employee?->department ?? 'N/A',
        'role' => $record->employee?->role ?? 'N/A',
    ]);
    }
}
