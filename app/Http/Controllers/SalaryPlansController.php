<?php

namespace App\Http\Controllers;

use App\Models\SalaryPlansModel;
use App\Models\UsersModel;
use App\Models\ClientsModel;

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

            return response()->json([
                'status' => 200,
                'salaryPlans' => $salaryPlans,
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
}

