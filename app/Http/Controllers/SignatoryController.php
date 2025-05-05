<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Signatory;
use Illuminate\Support\Facades\Log;

class SignatoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $signatories = Signatory::all();

        Log::info($signatories);

        return response()->json([$signatories]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prepared_by' => 'string',
            'approved_by_one' => 'string',
            'approved_by_two' => 'nullable|string',
            'approved_by_three' => 'nullable|string',
        ]);
    
        $signatory = Signatory::create($validated);
    
        return response()->json($signatory, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
