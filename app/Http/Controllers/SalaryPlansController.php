<?php

namespace App\Http\Controllers;

use App\Models\SalaryPlansModel;
use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\SalaryPlansLogsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;

class SalaryPlansController extends Controller {
    public function checkUser(){
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->user_type == 'Admin') {
                return true;
            }
        }
        return false;
    }

    public function getSalaryPlans(Request $request){
        $user = Auth::user();

        if ($this->checkUser()) {
            $page = (int) $request->input('page', 1); // Default to 1 if not provided
            $limit = (int) $request->input('limit', 10); // Default to 10 if not provided

            $query = SalaryPlansModel::where('client_id', $user->client_id)
                ->whereNull('deleted_at');

            $totalCount = $query->count();

            $salaryPlans = $query
                ->orderBy('salary_grade', 'asc')
                ->skip(($page - 1) * $limit)
                ->take($limit)
                ->get();

            // For each salary plan, count employees with matching salary_grade
            $salaryPlansWithEmployeeCount = $salaryPlans->map(function($plan) use ($user) {
                $employeeCount = UsersModel::where('client_id', $user->client_id)
                    ->where('salary_grade', $plan->salary_grade)
                    ->whereNull('deleted_at')
                    ->count();
                $plan->employee_count = $employeeCount;
                return $plan;
            });

            return response()->json([
                'status' => 200,
                'salaryPlans' => $salaryPlansWithEmployeeCount,
                'totalCount' => $totalCount,
            ]);
        } 

        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    public function saveSalaryGrade(Request $request){
        $validated = $request->validate([
            'salary_grade' => 'required',
            'amount' => 'required',
        ]);

        if ($this->checkUser() && $validated) {
            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $salaryPlan = SalaryPlansModel::create([
                    "salary_grade" => $request->salary_grade,
                    "amount" => $request->amount,
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'salaryPlan' => $salaryPlan]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } 

        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    public function editSalaryGrade(Request $request, $id){
        $validated = $request->validate([
            'salary_grade' => 'required',
            'amount' => 'required',
        ]);

        if ($this->checkUser() && $validated) {
            $user = Auth::user();
            $salaryGrade = SalaryPlansModel::find($request->input('id'));

            $salaryGrade->salary_grade = $request->input('salary_grade');
            $salaryGrade->amount = $request->input('amount');

            $salaryGrade->save();

            return response()->json(['status' => 200]);
        } 

        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    public function deleteSalaryGrade(Request $request){
        $salary_grade = SalaryPlansModel::find($request->salary_grade);

        if ($salary_grade) {
            $salary_grade->delete();
            return response()->json(['message' => 'Salary grade soft deleted successfully.']);
        } else {
            return response()->json(['message' => 'Salary grade not found.'], 404);
        }
    }

    
    public function getSalaryLogs(Request $request)
    {
        $user = Auth::user();

        if ($this->checkUser()) {
            $employee = UsersModel::where('client_id', $user->client_id)
                ->where('user_name', $request->username)
                ->first();
            $rawSalaryLogs = SalaryPlansLogsModel::where('employee_id', $employee->id)
                ->where('client_id', $user->client_id)
                ->get();

            $salaryLogs = [];

            foreach ($rawSalaryLogs as $rawSalaryLog) {
                $employee = UsersModel::find($rawSalaryLog->employee_id);

                // Fetch the admin's name
                $admin = UsersModel::find($rawSalaryLog->admin_id);
                $adminFirstName = $admin ? ($admin->first_name ?? $admin->user_name ?? '-') : '-';
                $adminLastName = $admin ? ($admin->last_name ?? $admin->user_name ?? '-') : '-';

                $salaryLogs[] = [
                    'salaryLog' => encrypt($rawSalaryLog->id),
                    'adminFirstName' => $adminFirstName,
                    'adminLastName' => $adminLastName,
                    'oldSalaryGrade' => $rawSalaryLog->old_salary_grade ?? '-',
                    'oldAmount' => $rawSalaryLog->old_amount ?? '-',
                    'newSalaryGrade' => $rawSalaryLog->new_salary_grade ?? '-',
                    'newAmount' => $rawSalaryLog->new_amount ?? '-',
                    'createdAt' => $rawSalaryLog->created_at ?? '-',
                ];
            }
            
            return response()->json([
                'status' => 200,
                'salaryLogs' => $salaryLogs,
            ]);
        }

        return response()->json(
            ['status' => 403, 'message' => 'Unauthorized'],
            403
        );
    }
}

