<?php

namespace App\Http\Controllers;

use App\Models\BranchApprover;
use Illuminate\Http\Request;

class BranchApproverController extends Controller
{
    public function index()
    {
        return BranchApprover::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'employee_id' => 'required|exists:employees,id',
        ]);

        $approver = BranchApprover::create($validated);

        return response()->json($approver, 201);
    }
}
