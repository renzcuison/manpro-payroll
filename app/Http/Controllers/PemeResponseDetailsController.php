<?php

namespace App\Http\Controllers;

use App\Models\PemeResponseDetails;
use App\Models\PemeQType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\Rule;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Validation\ValidationException;

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
            "response.user",
            "question",
            "inputType",
            "media"
        ])->get();

        $result = $details->map(function ($detail) {
            $inputType = $detail->inputType->input_type ?? null;
            $value = $inputType === 'attachment'
                ? $detail->getFirstMediaUrl('attachment') ?? null
                : $detail->value;

            return [
                "id" => $detail->id,
                "user" => $detail->response->user->user_name ?? null,
                "question" => $detail->question->question ?? null,
                "input_type" => $inputType,
                "value" => $value,
            ];
        });

        return response()->json($result);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            "peme_response_id" => "required|exists:peme_response,id",
            "peme_q_item_id" => "required|exists:peme_q_item,id",
            "peme_q_type_id" => [
                "required",
                Rule::exists('peme_q_type', 'id')->whereNull('deleted_at'),
            ],
            "value" => "nullable|string|max:512",
        ]);

        $existing = PemeResponseDetails::where('peme_response_id', $validated['peme_response_id'])
            ->where('peme_q_item_id', $validated['peme_q_item_id'])
            ->where('peme_q_type_id', $validated['peme_q_type_id'])
            ->first();

        if ($existing) {
            return response()->json([
                "message" => "This question already has a response for the given input type.",
            ], 422);
        }

        $detail = PemeResponseDetails::create($validated);

        return response()->json([
            "message" => "Response detail saved successfully.",
            "data" => $detail->load(['question', 'inputType', 'response.user']),
        ]);
    }

    public function attachMedia(Request $request, $id)
    {

        if (!$request->hasFile('file')) {
            return response()->json(['message' => 'Attachment failed.'], 400);
        }

        $detail = PemeResponseDetails::with('inputType')->findOrFail($id);

        $fileSizeLimitMb = $detail->inputType ? $detail->inputType->file_size_limit : null;

        if ($fileSizeLimitMb) {
            $maxKilobytes = intval($fileSizeLimitMb * 1024);
            $request->validate([
                'file' => "required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:$maxKilobytes",
            ]);
        } else {
            $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png',
            ]);
        }

        $detail->addMediaFromRequest('file')->toMediaCollection('attachments');

        return response()->json([
            'message' => 'Attachment successful.',
        ]);
    }

    public function destroy($id)
    {
        $detail = PemeResponseDetails::findOrFail($id);
        $detail->delete();

        return response()->json(["message" => "Response deleted"]);
    }

    public function restore($id)
    {
        $detail = PemeResponseDetails::withTrashed()->findOrFail($id);
        $detail->restore();

        return response()->json(["message" => "Response restored"]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            "peme_response_id" => "required|exists:peme_response,id",
            "peme_q_item_id" => "required|exists:peme_q_item,id",
            "peme_q_type_id" => [
                'required',
                Rule::exists('peme_q_type', 'id')->whereNull('deleted_at'),
            ],
            "value" => "nullable|string|max:512",
        ]);

        $detail = PemeResponseDetails::find($id);

        if (!$detail) {
            return response()->json([
                "message" => "Response detail not found."
            ], 404);
        }

        $qType = PemeQType::find($validated['peme_q_type_id']);
        if (!$qType) {
            return response()->json([
                "message" => "Invalid question type."
            ], 422);
        }

        $inputType = $qType->input_type;

        $duplicateExists = PemeResponseDetails::where('peme_response_id', $validated['peme_response_id'])
            ->where('peme_q_item_id', $validated['peme_q_item_id'])
            ->whereHas('inputType', function ($query) use ($inputType) {
                $query->where('input_type', $inputType);
            })
            ->where('id', '!=', $id)
            ->exists();

        if ($duplicateExists) {
            return response()->json([
                "message" => "Another response with the same input type exists for this question."
            ], 422);
        }

        $detail->update($validated);

        return response()->json([
            "message" => "Response detail updated successfully.",
            "data" => $detail->load(['question', 'inputType', 'response.user']),
        ]);
    }


    public function show($id)
    {
        try {
            $detail = PemeResponseDetails::with([
                "question",
                "inputType",
                "media",
            ])->findOrFail($id);
            return response()->json($detail);
        } catch (\Exception $e) {
            Log::error("Detail fetch error: ", ["error" => $e->getMessage()]);
            return response()->json(["message" => "Response not found"], 404);
        }
    }
}
