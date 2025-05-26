<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $request->headers->set("Accept", "application/json");

        $validated = $request->validate([
            "peme_id" => "required|exists:peme,id",
            "question" => "required|string|max:255",
            "input_types" => "required|array|min:1",
            "input_types.*" => "in:attachment,radio,remarks,text",
        ]);

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
            PemeQType::create([
                "peme_q_item_id" => $question->id,
                "input_type" => $inputType,
            ]);
        }

        $question->load("types");

        return response()->json(
            [
                "message" => "Item saved.",
                "data" => [
                    "question" => $question,
                ],
            ],
            201
        );
    }

    public function update(Request $request, $questionId)
    {
        $request->headers->set("Accept", "application/json");

        $validated = $request->validate([
            "peme_id" => "required|exists:peme,id",
            "question" => "required|string|max:255",
            "input_types" => "required|array|min:1",
            "input_types.*" => "in:attachment,radio,remarks,text",
        ]);

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

        $question = PemeQItem::findOrFail($questionId);

        $question->update([
            "peme_id" => $validated["peme_id"],
            "question" => $validated["question"],
        ]);

        $question->types()->delete();

        foreach ($validated["input_types"] as $inputType) {
            PemeQType::create([
                "peme_q_item_id" => $question->id,
                "input_type" => $inputType,
            ]);
        }

        $question->load("types");

        return response()->json(
            [
                "message" => "Item saved.",
                "data" => [
                    "question" => $question,
                ],
            ],
            200
        );
    }

    public function getQuestionnaire($pemeId)
    {
        $peme = Peme::with(["questions.types"])->find($pemeId);

        if (!$peme) {
            return response()->json(["message" => "PEME not found."], 404);
        }

        $questions = $peme->questions->map(function ($question) {
            return [
                "question" => $question->question,
                "input_types" => $question->types->pluck("input_type")->all(),
            ];
        });

        return response()->json([
            "peme" => $peme->name,
            "questions" => $questions,
        ]);
    }

    public function destroy($questionId)
    {
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

    public function show($questionId)
    {
        $question = PemeQItem::with("types")->findOrFail($questionId);

        return response()->json([
            "question" => $question,
        ]);
    }
}
