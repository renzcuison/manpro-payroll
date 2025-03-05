<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;
use App\Models\WorkGroupsModel;
use App\Models\BenefitsModel;
use App\Models\EmployeeBenefitsModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class BenefitsController extends Controller
{
    public function checkUser()
    {
        // Log::info("BenefitsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getBenefit(Request $request)
    {
        // log::info("BenefitsController::getBenefit");

        if ($this->checkUser()) {
            $user = Auth::user();
            $benefit = BenefitsModel::where('client_id', $user->client_id)->where('name', $request->name)->first();

            return response()->json(['status' => 200, 'benefit' => $benefit]);
        }

        return response()->json(['status' => 200, 'benefit' => null]);
    }

    public function getBenefits(Request $request)
    {
        // log::info("BenefitsController::getBenefits");

        if ($this->checkUser()) {
            $user = Auth::user();
            $benefits = BenefitsModel::where('client_id', $user->client_id)->get();

            return response()->json(['status' => 200, 'benefits' => $benefits]);
        }

        return response()->json(['status' => 200, 'benefits' => null]);
    }

    public function saveBenefit(Request $request)
    {
        // log::info("BenefitsController::saveBenefit");

        $validated = $request->validate([
            'benefitName' => 'required',
            'benefitType' => 'required',
            'employeeAmount' => 'required',
            'employerAmount' => 'required',
            'employeePercentage' => 'required',
            'employerPercentage' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $password = Hash::make($request->password);

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

    public function addEmployeeBenefit(Request $request)
    {
        // log::info("BenefitsController::addEmployeeBenefit");

        $validated = $request->validate([
            'employee' => 'required',
            'benefit' => 'required',
            'number' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $employeeBenefit = EmployeeBenefitsModel::create([
                    "user_id" => $request->employee,
                    "benefit_id" => $request->benefit,
                    "number" => $request->number,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'employee_benefit' => $employeeBenefit]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function getEmployeeBenefits(Request $request)
    {
        // log::info("BenefitsController::getEmployeeBenefits");

        $user = Auth::user();
        $employee = UsersModel::where('client_id', $user->client_id)->where('user_name', $request->username)->first();

        if ($this->checkUser() && $user->client_id == $employee->client_id) {

            $benefits = [];
            $rawBenefits = EmployeeBenefitsModel::where('user_id', $employee->id)->where('deleted_at', null)->get();

            foreach ($rawBenefits as $rawBenefit) {
                $benefits[] = [
                    'id' => $rawBenefit->id,
                    'benefit' => $rawBenefit->benefit->name,
                    'number' => $rawBenefit->number,
                    'created_at' => $rawBenefit->created_at
                ];
            }

            return response()->json(['status' => 200, 'benefits' => $benefits]);
        }

        return response()->json(['status' => 200, 'benefits' => null]);
    }
}
