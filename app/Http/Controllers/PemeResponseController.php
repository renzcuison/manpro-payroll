<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\PemeResponse;

class PemeResponseController extends Controller
{
    public function checkUser()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->user_type === "Admin") {
                return true;
            }
        }
        return false;
    }

    public function index()
    {
        $user = Auth::user();

        $responses = $user->user_type === "Admin"
            ? PemeResponse::with(['peme.user'])->latest()->get()
            : PemeResponse::where("user_id", $user->id)
            ->with(['peme.user'])
            ->latest()
            ->get();

        $responses = $responses->map(function ($response) {
            $expiryDate = $response->expiry_date
                ? $response->expiry_date->format("Y-m-d H:i:s")
                : null;

            $nextSchedule = $response->next_schedule
                ? $response->next_schedule->format("Y-m-d H:i:s")
                : null;

            return [
                "response_id" => $response->id,
                "peme" => $response->peme->name ?? 'null',
                "user" => $response->user->user_name ??
                    'null',
                "expiry_date" => $expiryDate,
                "next_schedule" => $nextSchedule,
                "status" => ucfirst($response->status),
                "branch" => $response->peme->branch ?? 'null',
                "department" => $response->peme->department ?? 'null',
            ];
        });

        return response()->json($responses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "peme_id" => "required|exists:peme,id",
            "expiry_date" => "nullable|date",
            "next_schedule" => "nullable|date",
        ]);

        if (
            PemeResponse::where("user_id", Auth::id())
            ->where("peme_id", $validated["peme_id"])
            ->exists()
        ) {
            return response()->json(
                [
                    "message" =>
                    "You have already submitted a response for this form.",
                ],
                409
            );
        }

        $response = PemeResponse::create([
            "user_id" => Auth::id(),
            "peme_id" => $validated["peme_id"],
            "expiry_date" => $validated["expiry_date"] ?? null,
            "next_schedule" => $validated["next_schedule"] ?? null,
            "status" => "pending",
        ]);

        return response()->json(
            [
                "message" => "Response saved.",
                "data" => $response,
            ],
            201
        );
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            "status" => "required|in:pending,clear,rejected",
        ]);

        $response = PemeResponse::findOrFail($id);
        $response->status = $validated["status"];
        $response->save();

        return response()->json([
            "message" => "Status updated.",
            "data" => $response,
        ]);
    }
    public function show($id)
    {
        $response = PemeResponse::with([
            'details',
            'details.question',
            'details.type',
            'peme',
            'user',
        ])->findOrFail($id);

        return response()->json([
            'response_id' => $response->id,
            'peme' => $response->peme->name ?? 'null',
            'user' => $response->user->user_name ?? 'null',
            'expiry_date' => optional($response->expiry_date)->format('Y-m-d H:i:s'),
            'next_schedule' => optional($response->next_schedule)->format('Y-m-d H:i:s'),
            'status' => ucfirst($response->status),
            'branch' => $response->peme->branch ?? 'null',
            'department' => $response->peme->department ?? 'null',
            'details' => $response->details,
        ]);
    }
    public function filter(Request $request)
    {
        $validated = $request->validate([
            "status" => "sometimes|in:pending,clear,rejected",
            "from" => "sometimes|date",
            "to" => "sometimes|date",
        ]);

        $query = PemeResponse::query();

        if (!empty($validated["status"])) {
            $query->where("status", $validated["status"]);
        }

        if (!empty($validated["from"]) && !empty($validated["to"])) {
            $query->whereBetween("created_at", [
                $validated["from"],
                $validated["to"],
            ]);
        }

        return response()->json($query->with("user")->get());
    }

    public function summary($pemeId)
    {
        $counts = PemeResponse::where("peme_id", $pemeId)
            ->selectRaw("status, COUNT(*) as total")
            ->groupBy("status")
            ->pluck("total", "status");

        return response()->json([
            "peme_id" => $pemeId,
            "summary" => $counts,
        ]);
    }

    public function destroy($id)
    {
        $response = PemeResponse::findOrFail($id);
        $response->delete();

        return response()->json([
            "message" => "Response deleted.",
        ]);
    }

    public function restore($id)
    {
        $response = PemeResponse::withTrashed()->findOrFail($id);
        $response->restore();

        return response()->json(["message" => "Response restored."]);
    }
}
