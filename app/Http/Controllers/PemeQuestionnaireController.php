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
            if ($user->user_type == 'Admin') {
                return true;
            }
        }
        return false;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'peme_id' => 'required|exists:peme,id',
            'question' => 'required|string|max:255',
            'input_type' => 'required|in:attachment, radio, remarks, text',
        ]);

        $question = PemeQItem::create([
            'peme_id' => $validated['peme_id'],
            'question' => $validated['question'],
        ]);

        $type = PemeQType::create([
            'peme_q_item_id' => $question->id,
            'input_type' => $validated['input_type'],
        ]);

        return response()->json([
            'message' => 'Item saved.',
            'data' => [
                'question' => $question,
                'type' => $type
            ]
        ], 201);
    }

    public function getQuestionnaire($pemeId)
{
    $peme = Peme::with(['questions.type'])->find($pemeId);

    if (!$peme) {
        return response()->json(['message' => 'PEME not found.'], 404);
    }

    $questions = $peme->questions->map(function ($question) {
        return [
            'question' => $question->question,
            'input_type' => $question->type->input_type ?? 'N/A',
        ];
    });

    return response()->json([
        'peme' => $peme->name,
        'questions' => $questions,
    ]);
}

}
