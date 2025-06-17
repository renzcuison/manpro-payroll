<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GroupLifeCompanyModel;
use Illuminate\Support\Facades\Auth;

class GroupLifeCompanyController extends Controller
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
        
        $request->validate([
            'name' => 'required|string|max:64'
        ]);

        $company = GroupLifeCompanyModel::create([
            'name' => $request->name,
        ]);

        return response()->json($company, 201);
    }

    public function index()
    {
        return GroupLifeCompanyModel::orderBy('name')->get();
    }
}