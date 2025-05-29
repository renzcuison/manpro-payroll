<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\UsersModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class MilestoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $milestones = Milestone::with('user.media')->where('client_id', $user->client_id)->get();
        
        return response()->
        json($milestones, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): JsonResponse
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        
        $user = Auth::user();
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'client_id' =>$user->client_id,
        ]);

        $milestone = Milestone::create($validated);
        return response()->
        json(['message' =>
        'Milestone created successfully'], 201);
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Milestone $milestone): Response
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Milestone $milestone): Response
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Milestone $milestone): RedirectResponse
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Milestone $milestone): RedirectResponse
    {
        //
    }
}