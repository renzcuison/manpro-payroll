<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use App\Models\Peme;
use App\Models\PemeResponse;
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
            "isMultiple" => "nullable|boolean",
        ]);

        $validatedData["name"] = ucwords(strtolower($validatedData["name"]));
        $validatedData["respondents"] = $validatedData["respondents"] ?? 0;
        $validatedData["isVisible"] = $validatedData["isVisible"] ?? 0;
        $validatedData["isEditable"] = $validatedData["isEditable"] ?? 0;
        $validatedData["isMultiple"] = $validatedData["isMultiple"] ?? 0;
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
                    "id" => Crypt::encrypt($peme->id),
                    // "id" => $peme->id,
                    "name" => $peme->name,
                    "created_at" => $peme->created_at,
                ],
            ],
            201
        );
    }

    public function getPemeList()
    {
        $user = Auth::user();

        $query = Peme::select(
            "id",
            "client_id",
            "user_id",
            "name",
            "respondents",
            "isVisible",
            "isEditable",
            "isMultiple",
            "created_at",
            "updated_at",
            "deleted_at"
        )->where("client_id", $user->client_id);

        if ($user->user_type !== 'Admin') {
            $query->where("isVisible", 1);
        }

        $pemeList = $query->orderBy("created_at", "desc")
            ->get()
            ->map(function ($peme) {
                $respondentCount = PemeResponse::where('peme_id', $peme->id)
                    ->distinct('user_id')
                    ->count('user_id');

                return [
                    "id" => Crypt::encrypt($peme->id),
                    "client_id" => Crypt::encrypt($peme->client_id),
                    "user_id" => Crypt::encrypt($peme->user_id),
                    "name" => $peme->name,
                    "respondents" => $peme->respondents,
                    "isVisible" => $peme->isVisible,
                    "isEditable" => $respondentCount > 0 ? 0 : $peme->isEditable,
                    "isMultiple" => $peme->isMultiple,
                    "created_at" => $peme->created_at,
                    "updated_at" => $peme->updated_at,
                    "deleted_at" => $peme->deleted_at,
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

    public function updatePemeSettings(Request $request, $id)
    {
        if (!$this->checkUser()) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $validatedData = $request->validate([
            'isVisible' => 'sometimes|boolean',
            'isEditable' => 'sometimes|boolean',
            'isMultiple' => 'sometimes|boolean',
        ]);

        try {
            $pemeId = Crypt::decrypt($id);
        } catch (\Exception $e) {
            return response()->json(["message" => "Invalid ID"], 400);
        }

        $peme = Peme::find($pemeId);

        if (!$peme) {
            return response()->json(
                ["message" => "PEME record not found"],
                404
            );
        }

        $respondentCount = PemeResponse::where('peme_id', $peme->id)
            ->distinct('user_id')
            ->count('user_id');

        if (array_key_exists('isVisible', $validatedData)) {
            $peme->isVisible = $validatedData['isVisible'];
        }

        if (array_key_exists('isEditable', $validatedData)) {
            if ($respondentCount > 0) {
                $peme->isEditable = 0;
            } else {
                $peme->isEditable = $validatedData['isEditable'];
            }
        } else {
            if ($respondentCount > 0) {
                $peme->isEditable = 0;
            }
        }

        if (array_key_exists('isMultiple', $validatedData)) {
            $peme->isMultiple = $validatedData['isMultiple'];
        }

        $peme->save();

        return response()->json([
            "message" => "Response settings updated successfully.",
            "peme" => [
                "id" => Crypt::encrypt($peme->id),
                "isVisible" => $peme->isVisible,
                "isEditable" => $peme->isEditable,
                "isMultiple" => $peme->isMultiple,
            ],
        ]);
    }

    public function deletePeme($id)
    {
        if (!$this->checkUser()) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        try {
            $pemeId = Crypt::decrypt($id);
        } catch (\Exception $e) {
            return response()->json(["message" => "Invalid ID"], 400);
        }

        $peme = Peme::find($pemeId);

        if (!$peme) {
            return response()->json(["message" => "PEME not found"], 404);
        }

        $peme->delete();

        return response()->json(["message" => "PEME record deleted."]);
    }
}
