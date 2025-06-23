<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use App\Models\PemeResponse;
use App\Models\Peme;
use Illuminate\Support\Facades\DB;
use App\Models\PemeResponseDetails;
use App\Models\PemeQItem;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Validator;

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

        $responses = PemeResponse::where("user_id", $user->id)
            ->with(['peme.questions.types', 'details', 'peme.user'])
            ->latest()
            ->get();

        $responses = $responses->map(function ($response) {
            $expiryDate = $response->expiry_date
                ? $response->expiry_date->format("Y-m-d")
                : null;

            $nextSchedule = $response->next_schedule
                ? $response->next_schedule->format("Y-m-d")
                : null;

            $questions = $response->peme->questions ?? collect();
            $details = $response->details ?? collect();

            $detailMap = [];
            foreach ($details as $detail) {
                $qID = (int) $detail->peme_q_item_id;
                $tID = (int) $detail->peme_q_type_id;
                $detailMap[$qID][$tID] = $detail;
            }

            $totalQuestions = $questions->count();
            $answeredQuestions = 0;

            foreach ($questions as $question) {
                $allAnswered = $question->types->every(function ($type) use (
                    $question,
                    $detailMap
                ) {
                    $matchedDetail =
                        $detailMap[(int) $question->id][(int) $type->id] ??
                        null;
                    return $matchedDetail &&
                        $matchedDetail->value !== null &&
                        trim($matchedDetail->value) !== '';
                });

                if ($allAnswered) {
                    $answeredQuestions++;
                }
            }

            return [
                "date" => $response->created_at->format("Y-m-d"),
                "response_id" => Crypt::encrypt($response->id),
                // "response_id" => $response->id,
                "peme_id" => Crypt::encrypt($response->peme_id),
                // "peme_id" => $response->peme_id,
                "peme" => $response->peme->name,
                "user_id" => Crypt::encrypt($response->user_id) ?? 'null',
                "name" => $response->user
                    ? $response->user->user_name
                    : 'null',
                "expiry_date" => $expiryDate,
                "next_schedule" => $nextSchedule,
                "status" => ucfirst($response->status),
                "isDraft" => $response->isDraft,
                "progress" => [
                    "completed" => $answeredQuestions,
                    "total" => $totalQuestions,
                    "percent" =>
                    $totalQuestions > 0
                        ? round(
                            ($answeredQuestions / $totalQuestions) * 100
                        )
                        : 0,
                ],
            ];
        });

        return response()->json($responses);
    }

    public function store(Request $request)
    {

        $request->merge([
            'peme_id' => Crypt::decrypt($request->peme_id),
        ]);

        $validated = $request->validate([
            "peme_id" => "required|exists:peme,id",
            "expiry_date" => "nullable|date",
            "next_schedule" => "nullable|date",
        ]);

        // new code block
        $peme = Peme::findOrFail($validated['peme_id']);

        if (!$peme->isMultiple) {
            $alreadyExists = PemeResponse::where("user_id", Auth::id())
                ->where("peme_id", $validated["peme_id"])
                ->exists();

            if ($alreadyExists) {
                return response()->json([
                    "message" => "You have already submitted a response for this form.",
                ], 409);
            }
        }

        $response = PemeResponse::create([
            "user_id" => Auth::id(),
            "peme_id" => $validated["peme_id"],
            "expiry_date" => $validated["expiry_date"] ?? null,
            "next_schedule" => $validated["next_schedule"] ?? null,
            "status" => "pending",
        ]);

        $respondentsCount = PemeResponse::where(
            'peme_id',
            $validated['peme_id']
        )
            ->distinct('user_id')
            ->count('user_id');

        Peme::where('id', $validated['peme_id'])->update([
            'respondents' => $respondentsCount,
        ]);

        return response()->json(
            [
                "message" => "Response saved.",
                "data" => [
                    "id" => Crypt::encrypt($response->id),
                    "peme_id" => Crypt::encrypt($response->peme_id),
                    "user_id" => Crypt::encrypt($response->user_id),
                    // "id" => $response->id,
                    // "peme_id" => $response->peme_id,
                    // "user_id" => $response->user_id,
                    "expiry_date" => $response->expiry_date,
                    "next_schedule" => $response->next_schedule,
                    "status" => $response->status,
                    "created_at" => $response->created_at,
                    "updated_at" => $response->updated_at,
                ],
            ],
            201
        );
    }

    public function storeAll(Request $request)
    {
        $validated = $request->validate([
            'peme_response_id' => 'required|string',
            'responses' => 'required|array',
            'responses.*.peme_q_item_id' => 'required|string',
            'responses.*.peme_q_type_id' => 'required|string',
            'responses.*.value' => 'nullable|string|max:512',
            'responses.*.files' => 'nullable|array',
            'responses.*.files.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png',
            'responses.*.existing_file_ids' => 'nullable|array',
            'isDraft' => 'required|boolean',
        ]);

        // foreach ($request->input('responses', []) as $index => $response) {
        //     $files = data_get($request->allFiles(), "responses.$index.files", []);
        //     $files = is_array($files) ? $files : [$files];
        // }

        $pemeResponseId = Crypt::decrypt($validated['peme_response_id']);
        $pemeResponse = PemeResponse::where('id', $pemeResponseId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $questionIdsInRequest = collect($validated['responses'])
            ->pluck('peme_q_item_id')
            ->map(fn($id) => $id)
            ->toArray();

        $requiredQuestionIds = PemeQItem::where('peme_id', $pemeResponse->peme_id)
            ->where('isRequired', 1)
            ->pluck('id')
            ->toArray();

        $missing = array_diff($requiredQuestionIds, $questionIdsInRequest);

        if (!empty($missing) && !$validated['isDraft']) {
            return response()->json([
                'message' => 'Some questions are missing responses.',
                'missing_question_ids' => array_map(fn($id) => Crypt::encrypt($id), $missing),
            ], 422);
        }

        $results = [];
        DB::beginTransaction();

        try {
            $pemeResponse->isDraft = $validated['isDraft'];
            $pemeResponse->save();

            foreach ($validated['responses'] as $index => $response) {
                $questionId = Crypt::decrypt($response['peme_q_item_id']);
                $typeId = Crypt::decrypt($response['peme_q_type_id']);

                $existing = PemeResponseDetails::where([
                    'peme_response_id' => $pemeResponseId,
                    'peme_q_item_id' => $questionId,
                    'peme_q_type_id' => $typeId,
                ])->first();

                if ($existing) {
                    $existing->update(['value' => $response['value'] ?? null]);
                    $detail = $existing;
                } else {
                    $detail = PemeResponseDetails::create([
                        'peme_response_id' => $pemeResponseId,
                        'peme_q_item_id' => $questionId,
                        'peme_q_type_id' => $typeId,
                        'value' => $response['value'] ?? null,
                    ]);
                }

                $existingIds = array_map('strval', $response['existing_file_ids'] ?? []);
                $mediaItems = $detail->getMedia('attachments');

                foreach ($mediaItems as $media) {
                    if (!in_array((string)$media->id, $existingIds, true)) {
                        $media->delete();
                    }
                }

                $files = data_get($request->allFiles(), "responses.$index.files", []);
                if (!is_array($files)) {
                    $files = [$files];
                }

                if (count($files)) {
                    $maxFiles = $detail->question->max_files;
                    $existingCount = $detail->getMedia('attachments')->count();
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

                        $media = $detail->addMedia($file)->toMediaCollection('attachments');
                    }
                }

                $detail->load(['question', 'inputType', 'response.user']);

                $results[] = [
                    "id" => Crypt::encrypt($detail->id),
                    "peme_response_id" => Crypt::encrypt($detail->peme_response_id),
                    "peme_q_item_id" => Crypt::encrypt($detail->peme_q_item_id),
                    "peme_q_type_id" => Crypt::encrypt($detail->peme_q_type_id),
                    "value" => $detail->value,
                    "question" => [
                        "id" => Crypt::encrypt($detail->question->id ?? null),
                        "question" => $detail->question->question ?? null,
                    ],
                    "input_type" => [
                        "id" => Crypt::encrypt($detail->inputType->id ?? null),
                        "input_type" => $detail->inputType->input_type ?? null,
                    ],
                    "response" => [
                        "id" => Crypt::encrypt($detail->response->id ?? null),
                        "user" => [
                            "id" => Crypt::encrypt($detail->response->user->id ?? null),
                            "name" => $detail->response->user->user_name ?? null,
                        ],
                    ],
                ];
            }

            DB::commit();

            return response()->json([
                "message" => $validated['isDraft']
                    ? "Response saved as draft."
                    : "Response successful.",
                "isDraft" => $pemeResponse->isDraft,
                "saved_count" => count($results),
                "data" => $results,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                "message" => "Error saving responses: " . $e->getMessage(),
                "error" => $e->getMessage(),
            ], 500);
        }
    }

    public function updateResponse(Request $request, $id)
    {
        $id = Crypt::decrypt($id);

        $request->merge([
            'status' => strtolower($request->input('status')),
        ]);

        $validated = $request->validate([
            'status' => 'required|in:pending,clear,rejected',
            'expiry_date' => 'nullable|date',
            'next_schedule' => 'nullable|date',
            'isDraft' => 'nullable|boolean',
        ]);

        $response = PemeResponse::findOrFail($id);

        $response->status = $validated['status'];

        if (array_key_exists('isDraft', $validated)) {
            $response->isDraft = $validated['isDraft'];
        }
        if (isset($validated['expiry_date'])) {
            $response->expiry_date = $validated['expiry_date'];
        }
        if (isset($validated['next_schedule'])) {
            $response->next_schedule = $validated['next_schedule'];
        }

        $response->save();

        return response()->json([
            'message' => 'Status and dates updated.',
            'data' => [
                'id' => Crypt::encrypt($response->id),
                'status' => $response->status,
                'isDraft' => $response->isDraft,
                'expiry_date' => $response->expiry_date,
                'next_schedule' => $response->next_schedule,
            ],
        ]);
    }

    public function show($id)
    {
        $id = Crypt::decrypt($id);

        $responses = PemeResponse::where('peme_id', $id)
            ->with([
                'peme.questions.types',
                'peme.user.branch',
                'peme.user.department',
                'user',
                'details'
            ])
            ->latest()
            ->get();

        $allDetails = PemeResponseDetails::whereHas('response', function ($query) use ($id) {
            $query->where('peme_id', $id);
        })->with(['media', 'response'])->get();

        $detailMap = [];
        foreach ($allDetails as $detail) {
            $responseId = $detail->peme_response_id;
            $qID = (int) $detail->peme_q_item_id;
            $tID = (int) $detail->peme_q_type_id;
            $detailMap[$responseId][$qID][$tID] = $detail;
        }

        $result = $responses->map(function ($response) use ($detailMap) {
            $questions = $response->peme->questions;
            $details = $detailMap[$response->id] ?? [];

            $questionsOutput = $questions->map(function ($question) use ($details) {
                $inputTypesWithValues = $question->types->map(function ($type) use ($question, $details) {
                    $matchedDetail = $details[$question->id][$type->id] ?? null;

                    return [
                        'id' => Crypt::encrypt($type->id),
                        'input_type' => $type->input_type,
                        'value' => $matchedDetail->value ?? null,
                    ];
                });

                return [
                    'question_id' => Crypt::encrypt($question->id),
                    'question_text' => $question->question,
                    'input_type' => $inputTypesWithValues,
                ];
            });

            $totalQuestions = $questionsOutput->count();
            $answeredQuestions = 0;

            foreach ($questionsOutput as $q) {
                $allAnswered = collect($q['input_type'])->every(function ($input) {
                    return $input['value'] !== null && trim($input['value']) !== '';
                });

                if ($allAnswered) {
                    $answeredQuestions++;
                }
            }

            $user = $response->user;
            $fullName = $user->first_name . ' ' . ($user->middle_name ? $user->middle_name . ' ' : '') . $user->last_name;

            return [
                'response_id' => Crypt::encrypt($response->id),
                'peme_id' => Crypt::encrypt($response->peme_id),
                // 'peme_id' => $response->peme_id,
                'user_id' => Crypt::encrypt($response->user_id),
                'respondent' => $fullName,
                'branch' => $response->peme->user->branch->name ?? 'null',
                'department' => $response->peme->user->department->name ?? 'null',
                'status' => ucfirst($response->status),
                'isDraft' => $response->isDraft,
                'expiry_date' => optional($response->expiry_date)->format('Y-m-d H:i:s'),
                'next_schedule' => optional($response->next_schedule)->format('Y-m-d H:i:s'),
                'response_details_id' => $response->details->pluck('id'),
                'progress' => [
                    'completed' => $answeredQuestions,
                    'total' => $totalQuestions,
                    'percent' => $totalQuestions > 0 ? round(($answeredQuestions / $totalQuestions) * 100) : 0,
                ],
                'questions' => $questionsOutput,
            ];
        });

        return response()->json($result);
    }

    // public function show($id)
    // {
    //     $id = Crypt::decrypt($id);

    //     $response = PemeResponse::with([
    //         'peme.questions.types',
    //         'peme.user.branch',
    //         'peme.user.department',
    //         'user',
    //         'details',
    //     ])->findOrFail($id);

    //     $allDetails = PemeResponseDetails::whereHas('response', function (
    //         $query
    //     ) use ($response) {
    //         $query->where('peme_id', $response->peme_id);
    //     })
    //         ->with(['media', 'response'])
    //         ->get();

    //     $detailMap = [];
    //     foreach ($allDetails as $detail) {
    //         $qID = (int) $detail->peme_q_item_id;
    //         $tID = (int) $detail->peme_q_type_id;
    //         $detailMap[$qID][$tID] = $detail;
    //     }

    //     $questions = $response->peme->questions->map(function ($question) use (
    //         $detailMap
    //     ) {
    //         $inputTypesWithValues = $question->types->map(function ($type) use (
    //             $question,
    //             $detailMap
    //         ) {
    //             $matchedDetail =
    //                 $detailMap[(int) $question->id][(int) $type->id] ?? null;

    //             return [
    //                 'id' => Crypt::encrypt($type->id),
    //                 'input_type' => $type->input_type,
    //                 'value' => $matchedDetail->value ?? null,
    //             ];
    //         });

    //         return [
    //             'question_id' => Crypt::encrypt($question->id),
    //             'question_text' => $question->question,
    //             'input_type' => $inputTypesWithValues,
    //         ];
    //     });

    //     $totalQuestions = $questions->count();
    //     $answeredQuestions = 0;

    //     foreach ($questions as $question) {
    //         $allAnswered = $question['input_type']->every(function (
    //             $inputType
    //         ) {
    //             return $inputType['value'] !== null &&
    //                 trim($inputType['value']) !== '';
    //         });

    //         if ($allAnswered) {
    //             $answeredQuestions++;
    //         }
    //     }

    //     $user = $response->user;
    //     $fullName =
    //         $user->first_name .
    //         ' ' .
    //         ($user->middle_name ? $user->middle_name . ' ' : '') .
    //         $user->last_name;

    //     return response()->json([
    //         'response_id' => Crypt::encrypt($response->id),
    //         'peme_id' => Crypt::encrypt($response->peme_id),
    //         'user_id' => Crypt::encrypt($response->user_id),
    //         'respondent' => $fullName,
    //         'branch' => $response->peme->user->branch->name ?? 'null',
    //         'department' => $response->peme->user->department->name ?? 'null',
    //         'status' => ucfirst($response->status),
    //         'expiry_date' => optional($response->expiry_date)->format(
    //             'Y-m-d H:i:s'
    //         ),
    //         'next_schedule' => optional($response->next_schedule)->format(
    //             'Y-m-d H:i:s'
    //         ),
    //         'response_details_id' => $response->details->pluck('id'),

    //         'progress' => [
    //             'completed' => $answeredQuestions,
    //             'total' => $totalQuestions,
    //             'percent' =>
    //             $totalQuestions > 0
    //                 ? round(($answeredQuestions / $totalQuestions) * 100)
    //                 : 0,
    //         ],
    //     ]);
    // }

    public function summary($pemeId)
    {
        $pemeId = Crypt::decrypt($pemeId);

        $counts = PemeResponse::where("peme_id", $pemeId)
            ->selectRaw("status, COUNT(*) as total")
            ->groupBy("status")
            ->pluck("total", "status");

        return response()->json([
            "peme_id" => Crypt::encrypt($pemeId),
            // "peme_id" => $pemeId,
            "summary" => $counts,
        ]);
    }

    public function destroy($id)
    {
        $id = Crypt::decrypt($id);

        $response = PemeResponse::findOrFail($id);
        $pemeId = $response->peme_id;

        $response->delete();

        $respondentsCount = PemeResponse::where('peme_id', $pemeId)
            ->distinct('user_id')
            ->count('user_id');

        Peme::where('id', $pemeId)->update([
            'respondents' => $respondentsCount,
        ]);

        return response()->json([
            "message" => "Response deleted.",
            "respondents" => $respondentsCount,
        ]);
    }

    public function getResponse($responseId)
    {

        $responseId = Crypt::decrypt($responseId);

        $pemeResponse = PemeResponse::with([
            'peme.questions.types',
            'user',
        ])
            ->where('id', $responseId)
            ->where('user_id', Auth::id())
            ->first();

        // if (!$pemeResponse) {
        //     return response()->json([
        //         'message' => 'Unauthorized access or response not found.',
        //     ], 403);
        // }

        $pemeResponse = PemeResponse::with([
            'peme.questions.types',
            'user',
        ])->findOrFail($responseId);


        $allDetails = PemeResponseDetails::where('peme_response_id', $pemeResponse->id)
            ->with(['media', 'response'])
            ->get();

        $detailMap = [];
        foreach ($allDetails as $detail) {
            $qID = (int) $detail->peme_q_item_id;
            $tID = (int) $detail->peme_q_type_id;
            $detailMap[$qID][$tID] = $detail;
        }

        $questions = $pemeResponse->peme->questions->map(function (
            $question
        ) use ($detailMap) {
            $inputTypesWithValues = $question->types->map(function ($type) use (
                $question,
                $detailMap
            ) {
                $matchedDetail =
                    $detailMap[(int) $question->id][(int) $type->id] ?? null;

                $inputTypeArray = [
                    'id' => Crypt::encrypt($type->id),
                    'input_type' => $type->input_type,
                    'value' => $matchedDetail->value ?? null,
                ];

                if ($type->input_type === 'attachment') {
                    $inputTypeArray['file_size_limit'] = $type->file_size_limit;
                }

                return $inputTypeArray;
            });

            $media = collect([]);
            if (isset($detailMap[$question->id])) {
                foreach ($detailMap[$question->id] as $detail) {
                    if ($detail->media->count() > 0) {
                        $media = $detail->media->map(function ($media) {
                            return [
                                'id' => Crypt::encrypt($media->id),
                                'file_name' => $media->file_name,
                                'url' => $media->getUrl(),
                                'size' => $media->size,
                            ];
                        });
                        break;
                    }
                }
            }

            return [
                'question_id' => Crypt::encrypt($question->id),
                'question_text' => $question->question,
                'isRequired' => $question->isRequired,
                'input_type' => $inputTypesWithValues,
                'media' => $media,
            ];
        });

        $user = $pemeResponse->user;
        $fullName =
            $user->first_name .
            ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        return response()->json([
            'peme' => $pemeResponse->peme->name,
            'peme_id' => $pemeResponse->peme->id,
            'peme_response_id' => Crypt::encrypt($pemeResponse->id),
            'user_id' => Crypt::encrypt($pemeResponse->user_id),
            'respondent' => $fullName,
            'status' => $pemeResponse->status,
            'isDraft' => $pemeResponse->isDraft,
            'expiry_date' => $pemeResponse->expiry_date,
            'next_schedule' => $pemeResponse->next_schedule,
            'details' => $questions,
        ]);
    }

    public function restore($id)
    {
        $id = Crypt::decrypt($id);

        $response = PemeResponse::withTrashed()->findOrFail($id);
        $response->restore();

        $pemeId = $response->peme_id;

        $respondentsCount = PemeResponse::where('peme_id', $pemeId)
            ->distinct('user_id')
            ->count('user_id');

        Peme::where('id', $pemeId)->update([
            'respondents' => $respondentsCount,
        ]);

        return response()->json([
            "message" => "Response restored.",
            "respondents" => $respondentsCount,
        ]);
    }
}
