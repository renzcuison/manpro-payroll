<?php

namespace App\Http\Controllers;

use App\Models\GroupLifeCompany;
use App\Models\GroupLifeCompanyPlan;

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

        DB::table('number_of_plans')->updateOrInsert(
        ['group_life_company_id' => $validated['group_life_company_id']],
        ['count' => DB::raw('count + 1')]
        );

        return response()->json($plan, 201);
    }

}
