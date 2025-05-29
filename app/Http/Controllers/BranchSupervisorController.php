<?php
namespace App\Http\Controllers;

use App\Models\BranchSupervisor;
use Illuminate\Http\Request;

class BranchSupervisorController extends Controller
{
    public function index()
    {
        return BranchSupervisor::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'employee_id' => 'required|exists:employees,id',
        ]);

        $supervisor = BranchSupervisor::create($validated);

        return response()->json($supervisor, 201);
    }
}
