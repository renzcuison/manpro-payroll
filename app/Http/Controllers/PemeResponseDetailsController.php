<?php

namespace App\Http\Controllers;

use App\Models\PemeResponseDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PemeResponseDetailsController extends Controller
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
    public function index()
    {
        $details = PemeResponseDetails::with([
            "response",
            "questionItem",
            "inputType",
        ])->get();

        return response()->json($details);
    }

    public function bulkStore(Request $request)
    {
        $data = $request->validate([
            "details" => "required|array",
            "details.*.peme_response_id" => "required|exists:peme_response,id",
            "details.*.peme_q_item_id" => "required|exists:peme_q_item,id",
            "details.*.peme_q_type_id" => "required|exists:peme_q_type,id",
            "details.*.value_text" => "nullable|string",
            "details.*.value_radio" => "nullable|string",
            "details.*.value_remark" => "nullable|string",
            "details.*.media_id" => "nullable|exists:media,id",
        ]);

        $created = [];
        foreach ($data["details"] as $detail) {
            $created[] = PemeResponseDetails::updateOrCreate(
                [
                    "peme_response_id" => $detail["peme_response_id"],
                    "peme_q_item_id" => $detail["peme_q_item_id"],
                ],
                $detail
            );
        }

        return response()->json(
            [
                "message" => "Details saved successfully",
                "data" => $created,
            ],
            201
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "peme_response_id" => "required|exists:peme_response,id",
            "peme_q_item_id" => "required|exists:peme_q_item,id",
            "peme_q_type_id" => "required|exists:peme_q_type,id",
            "value_text" => "nullable|string",
            "value_radio" => "nullable|string",
            "value_remark" => "nullable|string",
            "media_id" => "nullable|exists:media,id",
        ]);

        $detail = PemeResponseDetails::create($validated);

        return response()->json(
            [
                "message" => "Detail created successfully",
                "data" => $detail,
            ],
            201
        );
    }

    public function attachMedia(Request $request, $id)
    {
        $request->validate([
            "file" => "required|file",
        ]);

        $detail = PemeResponseDetails::findOrFail($id);
        $detail->addMediaFromRequest("file")->toMediaCollection("attachments");

        return response()->json([
            "message" => "Media uploaded and attached successfully",
        ]);
    }

    public function destroy($id)
    {
        $detail = PemeResponseDetails::findOrFail($id);
        $detail->delete();

        return response()->json(["message" => "Detail soft-deleted"]);
    }

    public function restore($id)
    {
        $detail = PemeResponseDetails::withTrashed()->findOrFail($id);
        $detail->restore();

        return response()->json(["message" => "Detail restored"]);
    }

    public function update(Request $request, $id)
    {
        $detail = PemeResponseDetails::findOrFail($id);
        $response = $detail->pemeResponse;

        if (Auth::id() !== $response->user_id && !Auth::user()->is_admin) {
            return response()->json(["message" => "Unauthorized"], 403);
        }

        $validated = $request->validate([
            "value_text" => "nullable|string",
            "value_radio" => "nullable|string",
            "value_remark" => "nullable|string",
            "media_id" => "nullable|exists:media,id",
        ]);

        $detail->update($validated);

        return response()->json([
            "message" => "Detail updated",
            "data" => $detail,
        ]);
    }

    public function show($id)
    {
        try {
            $detail = PemeResponseDetails::with([
                "pemeQuestionItem",
                "pemeQuestionType",
                "media",
            ])->findOrFail($id);
            return response()->json($detail);
        } catch (\Exception $e) {
            Log::error("Detail fetch error: ", ["error" => $e->getMessage()]);
            return response()->json(["message" => "Detail not found"], 404);
        }
    }
}
