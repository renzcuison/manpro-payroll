<?php

namespace App\Http\Controllers;

use App\Models\PemeResponseDetails;
use App\Models\PemeQType;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
// use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
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

    public function download(Media $media)
    {
        $path = $media->getPath();

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found on disk.'], 404);
        }

        return response()->download($path, $media->file_name);
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
                "id" => Crypt::encrypt($detail->id),
                "user_id" => Crypt::encrypt($detail->response->user->id ?? null),
                // "id" => $detail->id,
                // "user_id" => $detail->response->user->id ?? null,
                "question" => $detail->question->question ?? null,
                "input_type" => $inputType,
                "value" => $value,
            ];
        });

        return response()->json($result);
    }

    public function getResponseDetails($id)
    {
        try {

            $responseId = Crypt::decrypt($id);
            // $responseId = $id;

            $details = PemeResponseDetails::with([
                "question",
                "inputType",
                "media",
                "response.user"
            ])
                ->where('peme_response_id', $responseId)
                ->get();

            $result = $details->map(function ($detail) {
                $inputType = $detail->inputType->input_type ?? null;
                $value = $inputType === 'attachment'
                    ? $detail->getFirstMediaUrl('attachments') ?? null
                    : $detail->value;

                return [
                    "id" => Crypt::encrypt($detail->id),
                    "peme_response_id" => Crypt::encrypt($detail->peme_response_id),
                    "peme_q_item_id" => Crypt::encrypt($detail->peme_q_item_id),
                    "peme_q_type_id" => Crypt::encrypt($detail->peme_q_type_id),
                    // "id" => $detail->id,
                    // "peme_response_id" => $detail->peme_response_id,
                    // "peme_q_item_id" => $detail->peme_q_item_id,
                    // "peme_q_type_id" => $detail->peme_q_type_id,
                    "question" => [
                        "id" => Crypt::encrypt($detail->question->id ?? null),
                        // "id" => $detail->question->id ?? null,
                        "question" => $detail->question->question ?? null,
                    ],
                    "input_type" => [
                        "id" => Crypt::encrypt($detail->inputType->id ?? null),
                        // "id" => $detail->inputType->id ?? null,
                        "input_type" => $detail->inputType->input_type ?? null,
                    ],
                    "value" => $value,
                    "media" => $detail->media->map(function ($media) {
                        return [
                            "id" => Crypt::encrypt($media->id),
                            // "id" => $media->id,
                            "url" => $media->getFullUrl(),
                            "file_name" => $media->file_name,
                            "size" => $media->size,
                        ];
                    }),
                ];
            });

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Invalid ID or not found.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function store(Request $request)
    {

        $request = $request->merge([
            'peme_response_id' => Crypt::decrypt($request->peme_response_id),
            'peme_q_item_id' => Crypt::decrypt($request->peme_q_item_id),
            'peme_q_type_id' => Crypt::decrypt($request->peme_q_type_id),
        ]);

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
                "message" => "Item already answered.",
            ], 422);
        }

        $detail = PemeResponseDetails::create($validated);

        $detail->load(['question', 'inputType', 'response.user']);

        return response()->json([
            "message" => "Response saved successfully.",
            "data" => [
                "id" => Crypt::encrypt($detail->id),
                "peme_response_id" => Crypt::encrypt($detail->peme_response_id),
                "peme_q_item_id" => Crypt::encrypt($detail->peme_q_item_id),
                "peme_q_type_id" => Crypt::encrypt($detail->peme_q_type_id),
                // "id" => $detail->id,
                // "peme_response_id" => $detail->peme_response_id,
                // "peme_q_item_id" => $detail->peme_q_item_id,
                // "peme_q_type_id" => $detail->peme_q_type_id,
                "value" => $detail->value,
                "question" => [
                    "id" => Crypt::encrypt($detail->question->id ?? null),
                    // "id" => $detail->question->id ?? null,
                    "question" => $detail->question->question ?? null,
                ],
                "input_type" => [
                    "id" => Crypt::encrypt($detail->inputType->id ?? null),
                    // "id" => $detail->inputType->id ?? null,
                    "input_type" => $detail->inputType->input_type ?? null,
                ],
                "response" => [
                    "id" => Crypt::encrypt($detail->response->id ?? null),
                    // "id" => $detail->response->id ?? null,
                    "user" => [
                        "id" => Crypt::encrypt($detail->response->user->id ?? null),
                        // "id" => $detail->response->user->id ?? null,
                        "name" => $detail->response->user->user_name ?? null,
                    ],
                ],
            ],
        ]);
    }
    public function attachMedia(Request $request, $id)
    {
        $id = Crypt::decrypt($id);

        if (!$request->hasFile('file')) {
            return response()->json(['message' => 'Attachment failed. No files found.'], 400);
        }

        $detail = PemeResponseDetails::with('question', 'inputType')->findOrFail($id);

        $maxFiles = $detail->question->max_files ?? 1;

        $existingCount = $detail->getMedia('attachments')->count();

        $files = $request->file('file');

        if (!is_array($files)) {
            $files = [$files];
        }

        $newFilesCount = count($files);

        if ($existingCount + $newFilesCount > $maxFiles) {
            return response()->json([
                'message' => "You can only upload up to {$maxFiles} file(s) for this question. You currently have {$existingCount} uploaded."
            ], 422);
        }


        $fileSizeLimitMb = $detail->inputType ? $detail->inputType->file_size_limit : null;
        $maxKilobytes = $fileSizeLimitMb ? intval($fileSizeLimitMb * 1024) : null;

        foreach ($files as $file) {
            $rules = ['file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png'];
            if ($maxKilobytes) {
                $rules['file'] .= "|max:$maxKilobytes";
            }
            Validator::make(['file' => $file], $rules)->validate();
        }

        foreach ($files as $file) {
            $detail->addMedia($file)->toMediaCollection('attachments');
        }

        return response()->json([
            'message' => 'Files uploaded successfully.',
        ]);
    }

    public function destroy($id)
    {

        $id = Crypt::decrypt($id);

        $detail = PemeResponseDetails::findOrFail($id);
        $detail->delete();

        return response()->json(["message" => "Response deleted"]);
    }

    public function restore($id)
    {

        $id = Crypt::decrypt($id);

        $detail = PemeResponseDetails::withTrashed()->findOrFail($id);
        $detail->restore();

        return response()->json(["message" => "Response restored"]);
        
    }

    public function update(Request $request, $id)
    {
        $id = Crypt::decrypt($id);

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
                "message" => "Response not found."
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
                "message" => "Another response exists for this question."
            ], 422);
        }

        $detail->update($validated);

        $detail->load(['question', 'inputType', 'response.user']);

        $responseData = $detail->toArray();

        $responseData['id'] = Crypt::encryptString($responseData['id']);
        $responseData['peme_response_id'] = Crypt::encryptString($responseData['peme_response_id']);
        $responseData['peme_q_item_id'] = Crypt::encryptString($responseData['peme_q_item_id']);
        $responseData['peme_q_type_id'] = Crypt::encryptString($responseData['peme_q_type_id']);

        if (isset($responseData['question']['id'])) {
            $responseData['question']['id'] = Crypt::encryptString($responseData['question']['id']);
            $responseData['question']['peme_id'] = Crypt::encryptString($responseData['question']['peme_id']);
        }
        if (isset($responseData['input_type']['id'])) {
            $responseData['input_type']['id'] = Crypt::encryptString($responseData['input_type']['id']);
            $responseData['input_type']['peme_q_item_id'] = Crypt::encryptString($responseData['input_type']['peme_q_item_id']);
        }
        if (isset($responseData['response']['id'])) {
            $responseData['response']['id'] = Crypt::encryptString($responseData['response']['id']);
            $responseData['response']['user_id'] = Crypt::encryptString($responseData['response']['user_id']);
        }
        if (isset($responseData['response']['user']['id'])) {
            $responseData['response']['user']['id'] = Crypt::encryptString($responseData['response']['user']['id']);
        }

        return response()->json([
            "message" => "Response detail updated successfully.",
            "data" => $responseData,
        ]);
    }

    public function show($id)
    {
        try {

            $decryptedId = Crypt::decrypt($id);
            // $decryptedId = $id;

            $detail = PemeResponseDetails::with([
                "question",
                "inputType",
                "media",
            ])->findOrFail($decryptedId);

            return response()->json([
                "id" => Crypt::encrypt($detail->id),
                "peme_response_id" => Crypt::encrypt($detail->peme_response_id),
                "peme_q_item_id" => Crypt::encrypt($detail->peme_q_item_id),
                "peme_q_type_id" => Crypt::encrypt($detail->peme_q_type_id),
                // "id" => $detail->id,
                // "peme_response_id" => $detail->peme_response_id,
                // "peme_q_item_id" => $detail->peme_q_item_id,
                // "peme_q_type_id" => $detail->peme_q_type_id,
                "value" => $detail->value,
                "created_at" => $detail->created_at,
                "updated_at" => $detail->updated_at,
                "deleted_at" => $detail->deleted_at,

                "question" => [
                    "id" => Crypt::encrypt($detail->question->id ?? null),
                    "peme_id" => Crypt::encrypt($detail->question->peme_id ?? null),
                    // "id" => $detail->question->id ?? null,
                    // "peme_id" => $detail->question->peme_id ?? null,
                    "question" => $detail->question->question ?? null,
                    "created_at" => $detail->question->created_at ?? null,
                    "updated_at" => $detail->question->updated_at ?? null,
                    "deleted_at" => $detail->question->deleted_at ?? null,
                ],

                "input_type" => [
                    "id" => Crypt::encrypt($detail->inputType->id ?? null),
                    "peme_q_item_id" => Crypt::encrypt($detail->inputType->peme_q_item_id ?? null),
                    // "id" => $detail->inputType->id ?? null,
                    // "peme_q_item_id" => $detail->inputType->peme_q_item_id ?? null,
                    "input_type" => $detail->inputType->input_type ?? null,
                    "created_at" => $detail->inputType->created_at ?? null,
                    "updated_at" => $detail->inputType->updated_at ?? null,
                    "deleted_at" => $detail->inputType->deleted_at ?? null,
                    "file_size_limit" => $detail->inputType->file_size_limit ?? null,
                ],

                "media" => $detail->media->map(function ($media) {
                    return [
                        "id" => Crypt::encrypt($media->id),
                        "model_id" => Crypt::encrypt($media->model_id),
                        // "id" => $media->id,
                        // "model_id" => $media->model_id,
                        "uuid" => $media->uuid,
                        "collection_name" => $media->collection_name,
                        "name" => $media->name,
                        "file_name" => $media->file_name,
                        "size" => $media->size,
                        "manipulations" => $media->manipulations,
                        "custom_properties" => $media->custom_properties,
                        "generated_conversions" => $media->generated_conversions,
                        "responsive_images" => $media->responsive_images,
                        "order_column" => $media->order_column,
                        "created_at" => $media->created_at,
                        "updated_at" => $media->updated_at,
                        "preview_url" => $media->preview_url,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error("Detail fetch error: ", ["error" => $e->getMessage()]);
            return response()->json(["message" => "Response not found"], 404);
        }
    }
}
