<?php
namespace App\Http\Controllers;

use App\Models\BranchManager;
use Illuminate\Http\Request;

class BranchManagerController extends Controller
{
    public function index()
    {
        return BranchManager::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'employee_id' => 'required|exists:employees,id',
        ]);

        $manager = BranchManager::create($validated);

        return response()->json($manager, 201);
    }
}
