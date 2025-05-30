<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use App\Models\Peme;
use Carbon\Carbon;

class PemeController extends Controller
{
    public function checkUser()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->user_type == "Admin") {
                return true;
            }
        }
        return false;
    }

    public function createPeme(Request $request)
    {

        log::info("PemeController::createPeme");
        if (!$this->checkUser()) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $validatedData = $request->validate([
            "name" => "required|string|max:50",
            "respondents" => "nullable|integer",
            "isVisible" => "nullable|boolean",
            "isEditable" => "nullable|boolean",
        ]);

        $validatedData["name"] = ucwords(strtolower($validatedData["name"]));
        $validatedData["respondents"] = $validatedData["respondents"] ?? 0;
        $validatedData["isVisible"] = $validatedData["isVisible"] ?? 0;
        $validatedData["isEditable"] = $validatedData["isEditable"] ?? 0;
        $validatedData["medical_record_id"] = 1;
        $validatedData["response_date"] = Carbon::now()->toDateString();

        $user = Auth::user();
        if (!$user || !$user->client_id) {
            return response()->json(
                ["message" => "Client ID not found for user."],
                400
            );
        }

        $validatedData["user_id"] = $user->id;
        $validatedData["client_id"] = $user->client_id;

        $exists = Peme::where("name", $validatedData["name"])
            ->where("medical_record_id", $validatedData["medical_record_id"])
            ->where("client_id", $validatedData["client_id"])
            ->exists();

        if ($exists) {
            return response()->json(
                ["message" => "Duplicate record exists."],
                409
            );
        }

        $peme = Peme::create($validatedData);

        return response()->json(
            [
                "message" => "Exam created successfully.",
                "peme" => [
                    "id" => Crypt::encryptString($peme->id),
                    "name" => $peme->name,
                    "created_at" => $peme->created_at,
                ],
            ],
            201
        );
    }

    public function getPemeList()
    {

        log::info("PemeController::getPemeList");

        if (!$this->checkUser()) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $user = Auth::user();

        $pemeList = Peme::select("id", "created_at", "name")
            ->where("client_id", $user->client_id)
            ->orderBy("created_at", "desc")
            ->get()
            ->map(function ($peme) {
                return [
                    "id" => Crypt::encrypt($peme->id),
                    "date" => Carbon::parse($peme->created_at)->format(
                        "F d, Y"
                    ),
                    "name" => $peme->name,
                ];
            });

        return response()->json($pemeList);
    }

    public function getPemeStats()
    {
        $clientId = Auth::user()->client_id;

        $data = Peme::where("client_id", $clientId)
            ->select("id", "name", "respondents")
            ->get()
            ->map(function ($peme) {
                return [
                    'id' => Crypt::encrypt($peme->id),
                    'name' => $peme->name,
                    'respondents' => $peme->respondents,
                ];
            });

        return response()->json($data);
    }
}
