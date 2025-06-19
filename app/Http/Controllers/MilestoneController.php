<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\MilestoneComment;
use App\Models\UsersModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MilestoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            
        $user = Auth::user();
        $milestones = Milestone::with(['user.media'])->where('client_id', $user->client_id)->get();
        
        return response()->json($milestones, 200);

        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 500);
        }
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
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'User not authenticated'], 401);
            }
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'type' => 'required|string',
                'date' => 'required|date',
                'description' => 'nullable|string',
            ]);

            $milestone = Milestone::create([
                'user_id' => $request->input('user_id'),
                'type' => $request->input('type'),
                'date' => $request->input('date'),
                'description' => $request->input('description'),
                'client_id' => $user->client_id,
            ]);
            
            return response()->json(['message' => 'Milestone created successfully'], 201);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
        
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $milestone = Milestone::findOrFail($id);

        return response()->json($milestone);
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
    public function destroy($id): JsonResponse
    {
        $milestone = Milestone::findOrFail($id);
        $milestone->delete();

        return response()->json(['success' => true, 'message' => "Milestone successfully deleted!"]);
    }

    public function SendGreetings(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $validated = $request->validate([
                'comment' => 'required|string',
            ]);

            Log::info($validated);
            $comment = MilestoneComment::create([
                'milestone_id' => $id,
                'user_id' => $user->id,
                'comment' => $request->input('comment')
            ]);
            return response()->
            json(['message' =>
            'Greetings sent successfully'], 201);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage(), 500]);
        }
    }

    public function deleteComment($milestone_id, $comment_id)
    {
        try {
            
        $comment = MilestoneComment::findOrFail($comment_id);
        $comment->delete();

        response()->json([
            'message' => "Delete successfully."
        ]);
        } catch (\Throwable $th) {
            response()->json([
                'errorMsg' => $th->getMessage()
            ]);
        }
    }
}