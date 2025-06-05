<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
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
                "response_id" => Crypt::encrypt($response->id),
                "peme_id" => Crypt::encrypt($response->peme_id),
                "user_id" => Crypt::encrypt($response->user_id) ??
                    'null',
                // "response_id" => $response->id,
                // "peme_id" => $response->peme_id,
                // "user_id" => $response->user_id ?? 'null',
                "expiry_date" => $expiryDate,
                "next_schedule" => $nextSchedule,
                "status" => ucfirst($response->status),
                "branch" => $response->peme->user->branch->name ?? 'null',
                "department" => $response->peme->user->department->name ?? 'null',
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

        // if (
        //     PemeResponse::where("user_id", Auth::id())
        //     ->where("peme_id", $validated["peme_id"])
        //     ->exists()
        // ) {
        //     return response()->json(
        //         [
        //             "message" =>
        //             "You have already submitted a response for this form.",
        //         ],
        //         409
        //     );
        // }

        $response = PemeResponse::create([
            "user_id" => Auth::id(),
            "peme_id" => $validated["peme_id"],
            "expiry_date" => $validated["expiry_date"] ?? null,
            "next_schedule" => $validated["next_schedule"] ?? null,
            "status" => "pending",
        ]);

        $respondentsCount = PemeResponse::where('peme_id', $validated['peme_id'])
            ->distinct('user_id')
            ->count('user_id');

        \App\Models\Peme::where('id', $validated['peme_id'])
            ->update(['respondents' => $respondentsCount]);

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
    public function updateResponse(Request $request, $id)
    {
        $id = Crypt::decrypt($id);

        $request->merge([
            'status' => strtolower($request->input('status'))
        ]);

        $validated = $request->validate([
            'status' => 'required|in:pending,clear,rejected',
            'expiry_date' => 'nullable|date',
            'next_schedule' => 'nullable|date',
        ]);

        $response = PemeResponse::findOrFail($id);

        $response->status = $validated['status'];

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
                'expiry_date' => $response->expiry_date,
                'next_schedule' => $response->next_schedule,
            ],
        ]);
    }

    public function show($id)
    {

        $id = Crypt::decrypt($id);

        $response = PemeResponse::with([
            'peme.questions.types',
            'peme.user.branch',
            'peme.user.department',
            'user',
            'details'
        ])->findOrFail($id);

        $allDetails = \App\Models\PemeResponseDetails::whereHas('response', function ($query) use ($response) {
            $query->where('peme_id', $response->peme_id);
        })
            ->with(['media', 'response'])
            ->get();

        $detailMap = [];
        foreach ($allDetails as $detail) {
            $qID = (int) $detail->peme_q_item_id;
            $tID = (int) $detail->peme_q_type_id;
            $detailMap[$qID][$tID] = $detail;
        }

        $questions = $response->peme->questions->map(function ($question) use ($detailMap) {
            $inputTypesWithValues = $question->types->map(function ($type) use ($question, $detailMap) {
                $matchedDetail = $detailMap[(int)$question->id][(int)$type->id] ?? null;

                return [
                    'id'         => Crypt::encrypt($type->id),
                    'input_type' => $type->input_type,
                    'value'      => $matchedDetail->value ?? null,
                ];
            });

            return [
                'question_id'   => Crypt::encrypt($question->id),
                'question_text' => $question->question,
                'input_type'    => $inputTypesWithValues,
            ];
        });

        $totalQuestions = $questions->count();
        $answeredQuestions = 0;

        foreach ($questions as $question) {
            $allAnswered = $question['input_type']->every(function ($inputType) {
                return $inputType['value'] !== null && trim($inputType['value']) !== '';
            });

            if ($allAnswered) {
                $answeredQuestions++;
            }
        }

        $user = $response->user;
        $fullName = $user->first_name . ' ' . ($user->middle_name ? $user->middle_name . ' ' : '') . $user->last_name;

        return response()->json([
            'response_id' => Crypt::encrypt($response->id),
            'peme_id' => Crypt::encrypt($response->peme_id),
            'user_id' => Crypt::encrypt($response->user_id),
            'respondent' => $fullName,
            'branch' => $response->peme->user->branch->name ?? 'null',
            'department' => $response->peme->user->department->name ?? 'null',
            'status' => ucfirst($response->status),
            'expiry_date' => optional($response->expiry_date)->format('Y-m-d H:i:s'),
            'next_schedule' => optional($response->next_schedule)->format('Y-m-d H:i:s'),
            'response_details_id' => $response->details->pluck('id'),

            'progress' => [
                'completed' => $answeredQuestions,
                'total' => $totalQuestions,
                'percent' => $totalQuestions > 0 ? round(($answeredQuestions / $totalQuestions) * 100) : 0,
            ]
        ]);
    }

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

        \App\Models\Peme::where('id', $pemeId)
            ->update(['respondents' => $respondentsCount]);

        return response()->json([
            "message" => "Response deleted.",
            "respondents" => $respondentsCount,
        ]);
    }

    public function getResponse($responseId)
    {
        $responseId = Crypt::decrypt($responseId);

        $pemeResponse = PemeResponse::with(['peme.questions.types', 'user'])
            ->findOrFail($responseId);

        $allDetails = \App\Models\PemeResponseDetails::whereHas('response', function ($query) use ($pemeResponse) {
            $query->where('peme_id', $pemeResponse->peme_id);
        })
            ->with(['media', 'response'])
            ->get();

        $detailMap = [];
        foreach ($allDetails as $detail) {
            $qID = (int) $detail->peme_q_item_id;
            $tID = (int) $detail->peme_q_type_id;
            $detailMap[$qID][$tID] = $detail;
        }

        $questions = $pemeResponse->peme->questions->map(function ($question) use ($detailMap) {
            $inputTypesWithValues = $question->types->map(function ($type) use ($question, $detailMap) {
                $matchedDetail = $detailMap[(int)$question->id][(int)$type->id] ?? null;

                $inputTypeArray = [
                    'id'         => Crypt::encrypt($type->id),
                    'input_type' => $type->input_type,
                    'value'      => $matchedDetail->value ?? null,
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
                                'id'        => Crypt::encrypt($media->id),
                                'file_name' => $media->file_name,
                                'url'       => $media->getUrl(),
                                'size'      => $media->size,
                            ];
                        });
                        break;
                    }
                }
            }

            return [
                'question_id'   => Crypt::encrypt($question->id),
                'question_text' => $question->question,
                'input_type'    => $inputTypesWithValues,
                'media'         => $media,
            ];
        });

        $user = $pemeResponse->user;
        $fullName = $user->first_name . ' ' . ($user->middle_name ? $user->middle_name . ' ' : '') . $user->last_name;

        return response()->json([
            'peme_name'         => $pemeResponse->peme->name,
            'peme_response_id'  => Crypt::encrypt($pemeResponse->id),
            'user_id'           => Crypt::encrypt($pemeResponse->user_id),
            'respondent'        => $fullName,
            'status'            => $pemeResponse->status,
            'expiry_date'   => $pemeResponse->expiry_date,
            'next_schedule'     => $pemeResponse->next_schedule,
            'details'           => $questions,
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

        \App\Models\Peme::where('id', $pemeId)
            ->update(['respondents' => $respondentsCount]);

        return response()->json([
            "message" => "Response restored.",
            "respondents" => $respondentsCount,
        ]);
    }
}
