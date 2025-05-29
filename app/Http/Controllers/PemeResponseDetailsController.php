<?php

namespace App\Http\Controllers;

use App\Models\PemeResponseDetails;
use App\Models\PemeQType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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
        ])->get();

        $result = $details->map(function ($detail) {
            return [
                "id" => $detail->id,
                "user" => $detail->response->user->user_name ?? null,
                "question" => $detail->question->question ?? null,
                "input_type" => $detail->inputType->input_type ?? null,
                'value' => $detail->{$detail->inputType->input_type === 'text' ? 'value_text' : (
                    $detail->inputType->input_type === 'remark' ? 'value_remark' : ($detail->inputType->input_type === 'pass_fail' ? 'value_pass_fail' : ($detail->inputType->input_type === 'pos_neg' ? 'value_pos_neg' :
                        'media_id'
                    )))}
            ];
        });

        return response()->json($result);
    }

    // public function bulkStore(Request $request)
    // {
    //     $validated = $request->validate([
    //         'responses' => 'required|array',
    //         'responses.*.peme_response_id' => 'required|exists:peme_response,id',
    //         'responses.*.peme_q_item_id' => 'required|exists:peme_q_item,id',
    //         'responses.*.peme_q_type_id' => [
    //             'required',
    //             Rule::exists('peme_q_type', 'id')->whereNull('deleted_at'),
    //         ],
    //         'responses.*.value_text' => 'nullable|string',
    //         'responses.*.value_pass_fail' => 'nullable|string',
    //         'responses.*.value_pos_neg' => 'nullable|string',
    //         'responses.*.value_remark' => 'nullable|string',
    //         'responses.*.media_id' => 'nullable|exists:media,id',
    //     ]);

    //     $created = [];

    //     foreach ($validated['responses'] as $item) {
    //         $qType = PemeQType::find($item['peme_q_type_id']);
    //         if (!$qType) continue;

    //         $inputType = $qType->input_type;

    //         $duplicateExists = PemeResponseDetails::where('peme_response_id', $item['peme_response_id'])
    //             ->where('peme_q_item_id', $item['peme_q_item_id'])
    //             ->whereHas('inputType', function ($query) use ($inputType) {
    //                 $query->where('input_type', $inputType);
    //             })
    //             ->exists();

    //         if ($duplicateExists) continue;

    //         $allowedFields = [
    //             'text' => ['value_text'],
    //             'remark' => ['value_remark'],
    //             'pass_fail' => ['value_pass_fail'],
    //             'pos_neg' => ['value_pos_neg'],
    //             'attachment' => ['media_id'],
    //         ];

    //         $allowed = $allowedFields[$inputType] ?? [];

    //         $submittedFields = array_filter([
    //             'value_text' => $item['value_text'] ?? null,
    //             'value_pass_fail' => $item['value_pass_fail'] ?? null,
    //             'value_pos_neg' => $item['value_pos_neg'] ?? null,
    //             'value_remark' => $item['value_remark'] ?? null,
    //             'media_id' => $item['media_id'] ?? null,
    //         ], function ($v) {
    //             return $v !== null;
    //         });

    //         $invalidField = false;
    //         foreach ($submittedFields as $field => $value) {
    //             if (!in_array($field, $allowed)) {
    //                 $invalidField = true;
    //                 break;
    //             }
    //         }

    //         if ($invalidField) continue;

    //         $detail = PemeResponseDetails::create($item)->load(['question', 'inputType']);

    //         $created[] = [
    //             "question" => $detail->question->question ?? null,
    //             "input_type" => $detail->inputType->input_type ?? null,
    //             $allowed[0] ?? 'value_text' => $detail->{$allowed[0] ?? 'value_text'},
    //         ];
    //     }

    //     return response()->json([
    //         "message" => count($created) . " responses created successfully",
    //         "data" => $created,
    //     ], 201);
    // }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "peme_response_id" => "required|exists:peme_response,id",
            "peme_q_item_id" => "required|exists:peme_q_item,id",
            "peme_q_type_id" => [
                'required',
                Rule::exists('peme_q_type', 'id')->whereNull('deleted_at'),
            ],
            "value_text" => "nullable|string",
            "value_pass_fail" => "nullable|string",
            "value_pos_neg" => "nullable|string",
            "value_remark" => "nullable|string",
            "media_id" => "nullable|exists:media,id",
        ]);

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
            ->exists();

        if ($duplicateExists) {
            return response()->json([
                "message" => "A response for input type '{$inputType}' has already been submitted for this question.",
            ], 422);
        }

        $allowedFields = [
            'text' => ['value_text'],
            'remark' => ['value_remark'],
            'pass_fail' => ['value_pass_fail'],
            'pos_neg' => ['value_pos_neg'],
            'attachment' => ['media_id'],
        ];

        $allowed = $allowedFields[$inputType] ?? [];

        $submittedFields = array_filter([
            'value_text' => $request->input('value_text'),
            'value_pass_fail' => $request->input('value_pass_fail'),
            'value_pos_neg' => $request->input('value_pos_neg'),
            'value_remark' => $request->input('value_remark'),
            'media_id' => $request->input('media_id'),
        ], function ($v) {
            return $v !== null;
        });
        foreach ($submittedFields as $field => $value) {
            if (!in_array($field, $allowed)) {
                return response()->json([
                    "message" => "Field '{$field}' is not allowed for input type '{$inputType}'."
                ], 422);
            }
        }

        $detail = PemeResponseDetails::create($validated)->load(['question', 'inputType']);

        return response()->json([
            "message" => "Response created successfully",
            "data" => [
                "question" => $detail->question->question ?? null,
                "input_type" => $detail->inputType->input_type ?? null,
                $allowed[0] ?? 'value_text' => $detail->{$allowed[0] ?? 'value_text'},
            ],
        ], 201);
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
        $detail = PemeResponseDetails::findOrFail($id);

        $validated = $request->validate([
            "peme_q_type_id" => [
                'sometimes',
                Rule::exists('peme_q_type', 'id')->whereNull('deleted_at'),
            ],
            "peme_q_item_id" => [
                'sometimes',
                Rule::exists('peme_q_item', 'id')->whereNull('deleted_at'),
            ],
            "value_text" => "nullable|string",
            "value_pass_fail" => "nullable|string",
            "value_pos_neg" => "nullable|string",
            "value_remark" => "nullable|string",
            "media_id" => "nullable|exists:media,id",
        ]);

        $qTypeId = $validated['peme_q_type_id'] ?? $detail->peme_q_type_id;
        $qItemId = $validated['peme_q_item_id'] ?? $detail->peme_q_item_id;

        $qType = PemeQType::where('id', $qTypeId)
            ->where('peme_q_item_id', $qItemId)
            ->whereNull('deleted_at')
            ->first();

        if (!$qType) {
            return response()->json([
                "message" => "Invalid combination of question type and item."
            ], 422);
        }

        $inputType = $qType->input_type;

        $duplicateExists = PemeResponseDetails::where('peme_response_id', $detail->peme_response_id)
            ->where('peme_q_item_id', $qItemId)
            ->whereHas('inputType', function ($query) use ($inputType) {
                $query->where('input_type', $inputType);
            })
            ->where('id', '!=', $detail->id)
            ->exists();

        if ($duplicateExists) {
            return response()->json([
                "message" => "A response for input type '{$inputType}' already exists for this question.",
            ], 422);
        }

        $allowedFields = [
            'text' => ['value_text'],
            'remark' => ['value_remark'],
            'pass_fail' => ['value_pass_fail'],
            'pos_neg' => ['value_pos_neg'],
            'attachment' => ['media_id'],
        ];

        $allowed = $allowedFields[$inputType] ?? [];

        $submittedFields = array_filter([
            'value_text' => $request->input('value_text'),
            'value_pass_fail' => $request->input('value_pass_fail'),
            'value_pos_neg' => $request->input('value_pos_neg'),
            'value_remark' => $request->input('value_remark'),
            'media_id' => $request->input('media_id'),
        ], function ($v) {
            return $v !== null;
        });

        foreach ($submittedFields as $field => $value) {
            if (!in_array($field, $allowed)) {
                return response()->json([
                    "message" => "Field '{$field}' is not allowed for input type '{$inputType}'."
                ], 422);
            }
        }

        $detail->update(array_merge(
            [
                'peme_q_type_id' => $qTypeId,
                'peme_q_item_id' => $qItemId,
            ],
            $request->only($allowed)
        ));

        $detail = $detail->fresh(['question', 'inputType']);

        if (!$detail->question) {
            return response()->json(["message" => "Question relation not loaded or null"], 500);
        }

        if (!$detail->inputType) {
            return response()->json(["message" => "InputType relation not loaded or null"], 500);
        }

        return response()->json([
            "message" => "Response updated successfully",
            "data" => [
                "question" => $detail->question->question ?? null,
                "input_type" => $detail->inputType->input_type ?? null,
                $allowed[0] ?? 'value_text' => $detail->{$allowed[0] ?? 'value_text'},
            ],
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
