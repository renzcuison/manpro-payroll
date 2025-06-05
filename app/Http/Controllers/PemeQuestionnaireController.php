<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
// use Illuminate\Support\Facades\Log;
use App\Models\PemeQItem;
use App\Models\PemeQType;
use App\Models\Peme;


class PemeQuestionnaireController extends Controller
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

    public function store(Request $request)
    {

        $pemeId = Crypt::decrypt($request->peme_id);
        // $pemeId = $request->peme_id;
        $request->merge(['peme_id' => $pemeId]);

        $validated = $request->validate([
            "peme_id" => "required|exists:peme,id",
            "question" => "required|string|max:255",
            "input_types" => "required|array|min:1",
            "input_types.*" => "in:attachment,pass_fail,pos_neg,remarks,text",
            "file_size_limit" => "nullable|numeric|min:0.1|max:500",
        ]);

        if (
            in_array("attachment", $validated["input_types"]) &&
            !$request->has("file_size_limit")
        ) {
            return response()->json(
                [
                    "message" =>
                    "file_size_limit is required when using attachments.",
                ],
                422
            );
        }

        if (
            $this->isDuplicateQuestion(
                $validated["peme_id"],
                $validated["question"]
            )
        ) {
            return response()->json(
                [
                    "message" => "Duplicate item.",
                ],
                422
            );
        }

        $question = PemeQItem::create([
            "peme_id" => $validated["peme_id"],
            "question" => $validated["question"],
        ]);

        foreach ($validated["input_types"] as $inputType) {
            $data = [
                "peme_q_item_id" => $question->id,
                "input_type" => $inputType,
            ];

            if (
                $inputType === "attachment" &&
                $request->has("file_size_limit")
            ) {
                $data["file_size_limit"] = $validated["file_size_limit"];
            }

            PemeQType::create($data);
        }

        $question->load("types");

        return response()->json([
            "message" => "Item saved.",
            "data" => [
                "question" => [
                    "id" => Crypt::encrypt($question->id),
                    // "id" => $question->id,
                    "peme_id" => Crypt::encrypt($question->peme_id),
                    // "peme_id" => $question->peme_id,
                    "question" => $question->question,
                    "types" => $question->types->map(function ($type) {
                        return [
                            // "id" => Crypt::encrypt($type->id),
                            "id" => $type->id,
                            "input_type" => $type->input_type,
                            "file_size_limit" => $type->file_size_limit ?? null,
                        ];
                    }),
                ],
            ],
        ], 201);
    }

    public function update(Request $request, $pemeId, $questionId)
    {

        $pemeId = Crypt::decrypt($pemeId);
        $questionId = Crypt::decrypt($questionId);

        $validated = $request->validate([
            "question" => "required|string|max:255",
            "input_types" => "required|array|min:1",
            "input_types.*" => "in:attachment,pass_fail,pos_neg,remarks,text",
            "file_size_limit" => "nullable|numeric|min:0.1|max:100",
        ]);

        if (
            in_array("attachment", $validated["input_types"]) &&
            !$request->has("file_size_limit")
        ) {
            return response()->json(
                [
                    "message" =>
                    "file_size_limit is required when using attachments.",
                ],
                422
            );
        }

        $question = PemeQItem::where("id", $questionId)
            ->where("peme_id", $pemeId)
            ->firstOrFail();

        if (
            $this->isDuplicateQuestion(
                $pemeId,
                $validated["question"],
                $questionId
            )
        ) {
            return response()->json(
                [
                    "message" => "Duplicate item.",
                ],
                422
            );
        }

        $question->update([
            "question" => $validated["question"],
        ]);

        $question->types()->delete();

        foreach ($validated["input_types"] as $inputType) {
            $data = [
                "peme_q_item_id" => $question->id,
                "input_type" => $inputType,
            ];

            if (
                $inputType === "attachment" &&
                $request->has("file_size_limit")
            ) {
                $data["file_size_limit"] = $validated["file_size_limit"];
            }

            PemeQType::create($data);
        }

        $question->load("types");

        return response()->json(
            [
                "message" => "Item saved.",
                "data" => [
                    "question" => [
                        "id" => Crypt::encrypt($question->id),
                        // "id" => $question->id,
                        "peme_id" => Crypt::encrypt($question->peme_id),
                        // "peme_id" => $question->peme_id,
                        "question" => $question->question,
                        "types" => $question->types->map(function ($type) {
                            return [
                                "id" => Crypt::encrypt($type->id),
                                // "id" => $type->id,
                                "input_type" => $type->input_type,
                                "file_size_limit" => $type->file_size_limit ?? null,
                            ];
                        }),
                    ],
                ],
            ],
            200
        );
    }

    public function getQuestionnaire($pemeId)
    {

        $pemeId = Crypt::decrypt($pemeId);

        $peme = Peme::with(["questions.types"])->find($pemeId);

        if (!$peme) {
            return response()->json(["message" => "PEME not found."], 404);
        }

        $questions = $peme->questions->map(function ($question) {
            $inputTypes = $question->types->map(function ($type) {
                $input = [
                    "input_type" => $type->input_type,
                ];

                if ($type->input_type === "attachment") {
                    $input["file_size_limit"] = $type->file_size_limit;
                }

                return $input;
            });

            return [
                "id" => Crypt::encrypt($question->id),
                // "id" => $question->id,
                "question" => $question->question,
                "input_types" => $inputTypes,
            ];
        });

        return response()->json([
            "peme_id" => Crypt::encrypt($peme->id),
            // "peme_id" => $peme->id,
            "peme" => $peme->name,
            "questions" => $questions,
        ]);
    }

    public function destroy($questionId)
    {

        $questionId = Crypt::decrypt($questionId);

        $question = PemeQItem::findOrFail($questionId);
        $question->types()->delete();
        $question->delete();

        return response()->json([
            "message" => "Item deleted.",
        ]);
    }

    protected function isDuplicateQuestion(
        $pemeId,
        $question,
        $excludeId = null
    ) {
        $query = PemeQItem::where("peme_id", $pemeId)->whereRaw(
            "LOWER(question) = ?",
            [strtolower($question)]
        );

        if ($excludeId) {
            $query->where("id", "!=", $excludeId);
        }

        return $query->exists();
    }

    public function show($pemeId, $questionId)
    {
        $pemeId = Crypt::decrypt($pemeId);
        $questionId = Crypt::decrypt($questionId);

        $question = PemeQItem::with("types")
            ->where("id", $questionId)
            ->where("peme_id", $pemeId)
            ->firstOrFail();

        return response()->json([
            "question" => [
                "id" => Crypt::encrypt($question->id),
                // "id" => $question->id,
                "peme_id" => Crypt::encrypt($question->peme_id),
                // "peme_id" => $question->peme_id,
                "question" => $question->question,
                "types" => $question->types->map(function ($type) {
                    return [
                        "id" => Crypt::encrypt($type->id),
                        // "id" => $type->id,
                        "input_type" => $type->input_type,
                        "file_size_limit" => $type->file_size_limit ?? null,
                    ];
                }),
            ],
        ]);
    }
}
