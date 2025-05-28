<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MilestoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $milestones = Milestone::all();
        
        return response()->
        json($milestones, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        //
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