<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GroupLifePlanModel;
use Illuminate\Support\Facades\Auth;

class GroupLifePlanController extends Controller
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

    public function store(Request $request)
    {

    if (!$this->checkUserAdmin()) {
        return response()->json(["message" => "Unauthorized"], 403);
    }
        
        $validated = $request->validate([
            'group_life_company_id' => 'required|exists:group_life_companies,id',
            'plan_name' => 'required|string|max:50',
            'type' => 'required|string|max:50',
            'employer_share' => 'required|numeric',
            'employee_share' => 'required|numeric',
        ]);

        // $plan = GroupLifePlanModel::create([
        //     'group_life_company_id' => $request->group_life_company_id,
        //     'plan_name' => $request->plan_name,
        //     'type' => $request->type,
        //     'employer_share' => $request ->employer_share,
        //     'employee_share' => $request ->employee_share
        // ]);

        $plan = GroupLifePlanModel::create($validated);

        return response()->json($plan, 201);
    }

public function index()
{
    $plans = GroupLifePlanModel::with('company:id,name')->orderBy('plan_name')->get();

    return $plans->map(function($plan) {
        return [
            'id' => $plan->id,
            'group_life_company_name' => $plan->company->name,
            'plan_name' => $plan->plan_name,
            'type' => $plan->type,
            'employer_share' => $plan->employer_share,
            'employee_share' => $plan->employee_share,
        ];
    });
}
    public function show($id)
        {
        // Return a single plan for the detail page
        return GroupLifePlan::findOrFail($id);
        }
}