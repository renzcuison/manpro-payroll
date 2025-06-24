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
use Illuminate\Support\Facades\Crypt;

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
                $planGradeString = $plan->salary_grade;
                if (!empty($plan->salary_grade_version)) {
                    $planGradeString .= '.' . $plan->salary_grade_version;
                }
                $employeeCount = \DB::table('users')
                    ->where('client_id', $user->client_id)
                    ->where('salary_grade', $planGradeString)
                    ->whereNull('deleted_at')
                    ->count();

                return [
                    'id' => encrypt($plan->id),
                    'client_id' => encrypt($plan->client_id),
                    'salary_grade' => $plan->salary_grade,
                    'salary_grade_version' => $plan->salary_grade_version,
                    'amount' => $plan->amount,
                    'employee_count' => $employeeCount,
                    'created_at' => $plan->created_at,
                    'updated_at' => $plan->updated_at,
                ];
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
                    "salary_grade_version" => $request->salary_grade_version,
                    "amount" => $request->amount,
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json([
                    'status' => 200,
                    'salaryPlan' => [
                        'id' => encrypt($salaryPlan->id),
                        'client_id' => encrypt($salaryPlan->client_id),
                        'salary_grade' => $salaryPlan->salary_grade,
                        'salary_grade_version' => $salaryPlan->salary_grade_version,
                        'amount' => $salaryPlan->amount,
                        'created_at' => $salaryPlan->created_at,
                        'updated_at' => $salaryPlan->updated_at,
                    ]
                ]);
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
            $salaryGrade = SalaryPlansModel::find(decrypt($id)); // Decrypt the route param

            if (!$salaryGrade) {
                return response()->json(['status' => 404, 'message' => 'Salary grade not found.'], 404);
            }

            $salaryGrade->salary_grade = $request->input('salary_grade');
            $salaryGrade->salary_grade_version = $request->input('salary_grade_version');
            $salaryGrade->amount = $request->input('amount');

            $salaryGrade->save();

            return response()->json([
                'status' => 200,
                'salaryPlan' => [
                    'id' => encrypt($salaryGrade->id),
                    'client_id' => encrypt($salaryGrade->client_id),
                    'salary_grade' => $salaryGrade->salary_grade,
                    'salary_grade_version' => $salaryGrade->salary_grade_version,
                    'amount' => $salaryGrade->amount,
                    'created_at' => $salaryGrade->created_at,
                    'updated_at' => $salaryGrade->updated_at,
                ]
            ]);
        } 

        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    public function deleteSalaryGrade(Request $request){
        $salaryPlan = SalaryPlansModel::find(decrypt($request->id));
        if ($salaryPlan) {
            $salaryPlan->delete();
            return response()->json([
                'message' => 'Salary grade soft deleted successfully.',
                'id' => encrypt($salaryPlan->id)
            ]);
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

    public function getSalaryPlan(Request $request) {
        $user = Auth::user();
        if ($this->checkUser()) {
            $plan = SalaryPlansModel::where('client_id', $user->client_id)
                ->where('salary_grade', $request->salary_grade)
                ->where(function($q) use ($request) {
                    if ($request->filled('salary_grade_version')) {
                        $q->where('salary_grade_version', $request->salary_grade_version);
                    } else {
                        $q->whereNull('salary_grade_version')->orWhere('salary_grade_version', '');
                    }
                })
                ->first();

            if ($plan) {
                // Add this block to count employees for this grade/version
                $planGradeString = $plan->salary_grade;
                if (!empty($plan->salary_grade_version)) {
                    $planGradeString .= '.' . $plan->salary_grade_version;
                }
                $employeeCount = \DB::table('users')
                    ->where('client_id', $user->client_id)
                    ->where('salary_grade', $planGradeString)
                    ->whereNull('deleted_at')
                    ->count();

                return response()->json([
                    'status' => 200,
                    'salaryPlan' => [
                        'id' => encrypt($plan->id),
                        'client_id' => encrypt($plan->client_id),
                        'salary_grade' => $plan->salary_grade,
                        'salary_grade_version' => $plan->salary_grade_version,
                        'amount' => $plan->amount,
                        'employee_count' => $employeeCount, // <-- add this
                        'created_at' => $plan->created_at,
                        'updated_at' => $plan->updated_at,
                    ]
                ]);
            } else {
                return response()->json(['status' => 404, 'salaryPlan' => null]);
            }
        }
        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    public function getEmployeesBySalaryGrade(Request $request)
    {
        $user = Auth::user();
        if ($this->checkUser()) {
            $salary_grade = $request->input('salary_grade');
            $salary_grade_version = $request->input('salary_grade_version');
            $gradeString = $salary_grade;
            if (!empty($salary_grade_version)) {
                $gradeString .= '.' . $salary_grade_version;
            }

            $employees = \DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.id')
                ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
                ->leftJoin('employee_roles', 'users.role_id', '=', 'employee_roles.id')
                ->where('users.client_id', $user->client_id)
                ->where('users.salary_grade', $gradeString)
                ->whereNull('users.deleted_at')
                ->select(
                    'users.*',
                    'branches.name as branch_name',
                    'branches.acronym as branch_acronym',
                    'departments.name as department_name',
                    'departments.acronym as department_acronym',
                    'employee_roles.name as role_name',
                    'employee_roles.acronym as role_acronym'
                )
                ->get();

            return response()->json([
                'status' => 200,
                'employees' => $employees
            ]);
        }
        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }
}

