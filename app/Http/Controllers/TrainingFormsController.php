<?php

namespace App\Http\Controllers;

use App\Models\TrainingContentModel;
use App\Models\TrainingFormAnswersModel;
use App\Models\TrainingViewsModel;
use App\Models\TrainingFormsModel;
use App\Models\TrainingFormItemsModel;
use App\Models\TrainingFormChoicesModel;
use App\Models\TrainingFormResponsesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;

class TrainingFormsController extends Controller
{
    public function checkUser()
    {
        // Log::info("TrainingController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    // Training Forms (Admin) ------------------------------------------------------- /
    public function saveFormItem(Request $request)
    {
        //Log::info("TrainingsController:saveFormItem");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {

            $form = TrainingFormsModel::find($request->input('form_id'));

            try {
                DB::beginTransaction();

                $itemCount = TrainingFormItemsModel::where('form_id', $form->id)->count();
                $nextOrder = $itemCount + 1;

                $item = TrainingFormItemsModel::create([
                    'form_id' => $form->id,
                    'type' => $request->input('item_type'),
                    'description' => $request->input('description'),
                    'order' => $nextOrder,
                    'value' => $request->input('points')
                ]);

                if ($request->input('item_type') === 'FillInTheBlank' && $request->has('answer')) {
                    // Fill In The Blank
                    $answer = $request->input('answer');
                    TrainingFormChoicesModel::create([
                        'form_item_id' => $item->id,
                        'description' => $answer,
                        'is_correct' => true,
                    ]);
                } else {
                    // Choice, Multi Selection
                    $choices = $request->input('choices', []);
                    if (is_array($choices) && !(count($choices) === 1 && $choices[0] === 'null')) {
                        foreach ($choices as $index => $choice) {
                            TrainingFormChoicesModel::create([
                                'form_item_id' => $item->id,
                                'description' => $choice,
                                'is_correct' => in_array($index, $request->input('correctItems', [])),
                            ]);
                        }
                    }
                }

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Item saved successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving content: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error saving item'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editFormItem(Request $request)
    {
        //Log::info("TrainingsController:editFormItem");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                // Form Item
                $item = TrainingFormItemsModel::findOrFail($request->input('item_id'));
                $oldType = $item->type;
                $item->type = $request->input('item_type');
                $item->description = $request->input('description');
                $item->value = $request->input('points');
                $item->save();

                // Choice Handling Prep
                $choices = $request->input('choices', []);
                $correctItems = $request->input('correctItems', []);
                $deletedChoices = $request->input('deletedChoices', []);

                if ($request->input('item_type') == "FillInTheBlank") {
                    // Fill In The Blank
                    $answer = $request->input('answer');
                    TrainingFormChoicesModel::where('form_item_id', $item->id)->delete();

                    TrainingFormChoicesModel::create([
                        'form_item_id' => $item->id,
                        'description' => $answer,
                        'is_correct' => true,
                    ]);
                } else {
                    if ($oldType == "FillInTheBlank") {
                        TrainingFormChoicesModel::where('form_item_id', $item->id)->delete();
                    }
                    // Choice Deletion
                    if (!empty($deletedChoices)) {
                        TrainingFormChoicesModel::where('form_item_id', $item->id)
                            ->whereIn('id', $deletedChoices)
                            ->delete();
                    }
                    // Choice Updaters
                    if (is_array($choices) && !(count($choices) === 1 && $choices[0] === 'null')) {
                        foreach ($choices as $index => $choice) {
                            $isCorrect = in_array((string) $index, $correctItems);

                            if ($choice['id'] === 'null') {
                                // Create New Choice
                                TrainingFormChoicesModel::create([
                                    'form_item_id' => $item->id,
                                    'description' => $choice['text'],
                                    'is_correct' => $isCorrect,
                                ]);
                            } else {
                                // Update Existing Choice
                                TrainingFormChoicesModel::where('id', $choice['id'])
                                    ->where('form_item_id', $item->id)
                                    ->update([
                                        'description' => $choice['text'],
                                        'is_correct' => $isCorrect,
                                    ]);
                            }
                        }
                    }
                }

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Item updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['status' => 500, 'message' => 'Error updating item'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function removeFormItem(Request $request)
    {
        // Log::info("TrainingsController::removeFormItem");
        // Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $item = TrainingFormItemsModel::find($request->input('id'));
                if (!$item) {
                    return response()->json(['status' => 404, 'message' => 'Item not found'], 404);
                }

                $deletedOrder = $item->order;
                $item->order = null;
                $item->save();
                $item->delete();

                TrainingFormItemsModel::where('order', '>', $deletedOrder)
                    ->where('form_id', $item->form_id)
                    ->decrement('order', 1);

                TrainingFormChoicesModel::where('form_item_id', $item->id)->delete();

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content removed successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error removing content: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error removing content'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function getFormItems($id)
    {
        //Log::info("TrainingsController:getFormItems");
        //Log::info($id);

        $user = Auth::user();

        if ($this->checkUser()) {
            $itemData = TrainingFormItemsModel::with('choices')
                ->where('form_id', $id)
                ->orderBy('order', 'asc')
                ->get();

            return response()->json(['status' => 200, 'items' => $itemData]);
        } else {
            return response()->json(['status' => 403, 'items' => null]);
        }
    }

    public function saveFormItemSettings(Request $request)
    {
        // Log::info("TrainingsController:saveFormItemSettings");
        // Log::info($request);

        $user = Auth::user();
        $order = $request->input('new_order');

        $form = TrainingFormsModel::with('items')->find($request->input('form_id'));

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $orderMap = [];
                foreach ($order as $ord) {
                    $orderMap[$ord['id']] = $ord['order'];
                }

                $form->items()->update([
                    'order' => DB::raw("CASE id " . implode(' ', array_map(function ($id) use ($orderMap) {
                        return "WHEN $id THEN " . $orderMap[$id];
                    }, array_keys($orderMap))) . " END")
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Item order updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error updating content order: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error updating item order'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function getFormAnalytics($id)
    {
        // Log::info("TrainingsController:getFormAnalytics");
        // Log::info($id);

        $user = Auth::user();

        if ($this->checkUser()) {
            $analytics = new \stdClass();

            $content = TrainingContentModel::with([
                'views.responses.answers',
                'form.items' => function ($query) {
                    $query->orderBy('order', 'asc');
                },
                'form.items.choices'
            ])->find($id);

            if (!$content) {
                return response()->json(['status' => 404, 'analytics' => null, 'message' => 'Content not found']);
            }

            // Respondent Count
            $analytics->respondent_count = $content->views->filter(function ($view) {
                return $view->responses->isNotEmpty();
            })->count();
            // Total Attempts
            $analytics->total_attempts = $content->views->sum(function ($view) {
                return $view->responses->count();
            });
            $analytics->avg_attempt_count = $analytics->respondent_count ? $analytics->total_attempts / $analytics->respondent_count : 0;

            $responses = $content->views->flatMap->responses;
            // Scores
            $analytics->avg_score = $responses->avg('score') ?? 0;
            $analytics->hi_score = $responses->max('score') ?? 0;
            $analytics->lo_score = $responses->min('score') ?? 0;

            // Durations
            $analytics->avg_duration = $responses->avg('duration') ?? 0;
            $analytics->fastest_attempt = $responses->min('duration') ?? 0;
            $analytics->slowest_attempt = $responses->max('duration') ?? 0;

            // Total Points
            $totalPoints = $content->form->items->sum('value') ?? 100;
            $analytics->total_points = $totalPoints;

            // Passing Rate
            $passingScore = $content->form->passing_score;
            $passingResponses = $responses->filter(function ($response) use ($passingScore, $totalPoints) {
                return ($response->score / $totalPoints) * 100 >= $passingScore;
            })->count();

            $analytics->passing_rate = $responses->isEmpty()
                ? 0
                : round(($passingResponses / $responses->count()) * 100, 2);

            // Item-Specific Analytics
            $analytics->items = $content->form->items->map(function ($item) use ($responses) {
                $itemData = new \stdClass();
                $itemData->type = $item->type;
                $itemData->id = $item->id;
                $itemData->description = $item->description;
                $itemData->order = $item->order;

                $answerCount = 0;
                $correctCount = 0;
                $incorrectCount = 0;
                $unAnsweredCount = 0;
                $selectionCount = 0;
                $responseCount = $responses->count();

                if ($item->type == 'FillInTheBlank') {
                    /*
                        Retrieves the FF: 
                        [1] Correct Answer for Item
                        [2] No. of Correct Answers
                        [3] No. of Incorrect, Empty Answers
                        [4] Frequent Incorrect Answers
                    */
                    //[1]
                    $correctAnswer = strtolower(trim($item->choices->first()->description));
                    $itemData->correct_answer = $correctAnswer;

                    $itemAnswers = $responses->flatMap->answers->where('form_item_id', $item->id);
                    $answerCount = $itemAnswers->count();

                    //[2]
                    $correctCount = $itemAnswers->filter(function ($answer) use ($correctAnswer) {
                        return strtolower(trim($answer->description)) === $correctAnswer;
                    })->count();

                    //[3]
                    $incorrectCount = $answerCount - $correctCount;
                    $unAnsweredCount = $responseCount - $answerCount;

                    //[4]
                    $incorrectAnswers = $itemAnswers->filter(function ($answer) use ($correctAnswer) {
                        return strtolower(trim($answer->description)) !== $correctAnswer;
                    })->groupBy(function ($answer) {
                        return strtolower(trim($answer->description));
                    })->map(function ($group) {
                        return [
                            'description' => $group->first()->description,
                            'count' => $group->count(),
                        ];
                    })->sortByDesc('count')->take(5)->values();

                    $itemData->common_incorrects = $incorrectAnswers;
                }
                if ($item->type == 'Choice') {
                    /*
                        Retrieves the FF: 
                        [1] Choice metadata
                        [2] Answer Rate Per Choice
                        [3] No. of Correct Answers
                        [4] No. of Incorrect, Empty Answers
                    */
                    $itemData->choices = $item->choices->map(function ($choice) use ($responses) {
                        $choiceData = new \stdClass();
                        //[1]
                        $choiceData->id = $choice->id;
                        $choiceData->description = $choice->description;
                        $choiceData->is_correct = $choice->is_correct;

                        //[2]
                        $choiceAnswers = $responses->flatMap->answers->where('form_choice_id', $choice->id);
                        $choiceData->answer_rate = $choiceAnswers->count();

                        return $choiceData;
                    });

                    //[3]
                    $answerCount = $responses->flatMap->answers->where('form_item_id', $item->id)->count();
                    $correctCount = $itemData->choices->sum(function ($choice) use ($responses) {
                        return $choice->is_correct ? $responses->flatMap->answers->where('form_choice_id', $choice->id)->count() : 0;
                    });

                    //[4]
                    $incorrectCount = $answerCount - $correctCount;
                    $unAnsweredCount = $responseCount - $answerCount;
                }
                if ($item->type == 'MultiSelect') {
                    /*
                        Retrieves the FF: 
                        [1] Choice metadata
                        [2] Answer Rate Per Choice
                        [3] No. of Correct Selections (per choice)
                        [4] No. of Incorrect Selections (per choice)
                        [5] Average Score 
                    */
                    $itemData->choices = $item->choices->map(function ($choice) use ($responses, $item, $responseCount) {
                        $choiceData = new \stdClass();
                        //[1]
                        $choiceData->id = $choice->id;
                        $choiceData->description = $choice->description;
                        $choiceData->is_correct = $choice->is_correct;

                        //[2]
                        $choiceAnswers = $responses->flatMap->answers->where('form_choice_id', $choice->id);
                        $choiceData->answer_rate = $choiceAnswers->count();

                        return $choiceData;
                    });

                    //[3,4]
                    $selectionCount = $responses->flatMap->answers->where('form_item_id', $item->id)->count();
                    $correctCount = $itemData->choices->sum(function ($choice) use ($responses) {
                        return $choice->is_correct ? $responses->flatMap->answers->where('form_choice_id', $choice->id)->count() : 0;
                    });
                    $incorrectCount = $selectionCount - $correctCount;

                    //[5]
                    $answerCount = $responses->filter(function ($response) use ($item) {
                        return $response->answers->where('form_item_id', $item->id)->isNotEmpty();
                    })->count();
                    $itemData->avg_score = $responses->map(function ($response) use ($item) {
                        $correctAnswers = $response->answers->where('form_item_id', $item->id)
                            ->filter(function ($answer) use ($item) {
                                return $item->choices->where('id', $answer->form_choice_id)->where('is_correct', true)->isNotEmpty();
                            })->count();
                        return $correctAnswers;
                    })->avg() ?? 0;

                    $unAnsweredCount = $responseCount - $answerCount;
                }

                if ($item->type == 'MultiSelect') {
                    $itemData->correct_rate = $selectionCount ? round(($correctCount / $selectionCount) * 100, 2) : 0;
                    $itemData->incorrect_rate = $selectionCount ? round(($incorrectCount / $selectionCount) * 100, 2) : 0;
                } else {
                    $itemData->correct_rate = $responseCount ? round(($correctCount / $responseCount) * 100, 2) : 0;
                    $itemData->incorrect_rate = $responseCount ? round(($incorrectCount / $responseCount) * 100, 2) : 0;
                }
                $itemData->unanswered_count = $unAnsweredCount;
                $itemData->unanswered_rate = $responseCount ? round(($unAnsweredCount / $responseCount) * 100, 2) : 0;

                return $itemData;
            });

            return response()->json(['status' => 200, 'analytics' => $analytics]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }
    // Training Forms (Employee) ---------------------------------------------------- /
    public function getEmployeeFormDetails($id)
    {
        //Log::info("TrainingsController:getFormDetails");
        //Log::info($id);

        $user = Auth::user();
        $content = TrainingContentModel::with([
            'form',
            'form.items' => function ($query) {
                $query->orderBy('order', 'ASC');
            },
            'form.items.choices'
        ])->find($id);

        if (!$content || !$content->form) {
            Log::warning("Form not found for training content ID: {$id}");
            return response()->json(['error' => 'Form not found'], 404);
        }

        // Form Items
        $items = $content->form->items->map(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'order' => $item->order,
                'value' => $item->value,
                'form_id' => $item->form_id,
                'description' => $item->description,
                'choices' => $item->choices->map(function ($choice) use ($item) {
                    return [
                        'id' => $choice->id,
                        'item_id' => $choice->form_item_id,
                        'description' => $item->type != 'FillInTheBlank' ? $choice->description : '',
                    ];
                })->toArray(),
            ];
        })->toArray();

        $totalPoints = array_sum(array_column($items, 'value'));

        // Form Responses
        $view = TrainingViewsModel::with('responses')
            ->where('training_content_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if ($view) {
            $responses = $view->responses;
            $responseCount = $responses->count();

            $view->average_duration = $responseCount > 0 ? $responses->avg('duration') : 0;
            $view->average_score = $responseCount > 0 ? $responses->avg('score') : 0;
            $view->response_count = $responseCount;

            foreach ($responses as $response) {
                $scorePercentage = ($response->score / $totalPoints) * 100;
                $response->passed = $scorePercentage >= $content->form->passing_score;
            }
        }

        $attemptData = $view;

        return response()->json([
            'status' => 200,
            'items' => $items,
            'attempt_data' => $attemptData ? $attemptData->toArray() : null,
        ]);
    }

    public function saveEmployeeFormSubmission(Request $request)
    {
        // Log::info("TrainingsController:saveEmployeeFormSubmission");
        // Log::info($request);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Validate and decode answers
            $answersJson = $request->input('answers');
            $answers = json_decode($answersJson, true);
            if (!is_array($answers)) {
                Log::error("Failed to decode answers JSON: " . $answersJson);
                throw new \Exception("Invalid answers format");
            }
            // Log::info("Decoded Answers: ", $answers);

            // Attempt Data
            $contentId = $request->input('content_id');
            $formId = $request->input('form_id');
            $duration = ($request->input('duration') * 60) - $request->input('remaining_time');

            // Evaluate responses
            $evaluation = $this->evaluateFormResponse($formId, $answers);
            $totalScore = array_sum(array_map(fn($itemScores) => array_sum($itemScores), $evaluation['scores']));
            $passingScore = $evaluation['passing_score'];
            $totalPoints = $evaluation['total_points'];
            Log::info($evaluation);

            // Log::info($totalScore);
            // Log::info($passingScore);
            // Log::info($totalPoints);

            $scorePercentage = ($totalScore / $totalPoints) * 100;
            $passed = $scorePercentage >= $passingScore;

            // Log::info("Your Score:      " . $scorePercentage . "%");
            // Log::info("Passing Score:   " . $passingScore . "%");
            // Log::info($passed);

            // Training View
            $view = TrainingViewsModel::where('user_id', $user->id)
                ->where('training_content_id', $contentId)->first();

            // Response Data
            $response = TrainingFormResponsesModel::create([
                'training_view_id' => $view->id,
                'score' => $totalScore,
                'start_time' => Carbon::parse($request->input('attempt_start_time')),
                'duration' => $duration,
            ]);

            // Answer Processing
            foreach ($answers as $itemId => $answer) {
                if (is_string($answer)) { // Fill In The Blank Items
                    TrainingFormAnswersModel::create([
                        'form_response_id' => $response->id,
                        'form_item_id' => $itemId,
                        'form_choice_id' => null,
                        'description' => $answer,
                        'score' => $evaluation['scores'][$itemId][null] ?? 0,
                    ]);
                } elseif (is_array($answer)) { // Choice, Multiple Select Items
                    foreach ($answer as $choiceId) {
                        TrainingFormAnswersModel::create([
                            'form_response_id' => $response->id,
                            'form_item_id' => $itemId,
                            'form_choice_id' => $choiceId,
                            'description' => null,
                            'score' => $evaluation['scores'][$itemId][$choiceId] ?? 0,
                        ]);
                    }
                } else {
                    Log::warning("Unexpected answer type for item {$itemId}: " . json_encode($answer));
                }
            }

            $results = new \stdClass();
            $results->total_score = $totalScore;
            $results->score_percentage = $scorePercentage;
            $results->total_points = $totalPoints;
            $results->passed = $passed;
            $results->duration = $duration;
            $results->submission_date = $response->created_at;
            $results->empty_answers = $evaluation['empty_answers'];
            $results->reviewer_num = $response->id;

            DB::commit();
            return response()->json(['status' => 200, 'message' => 'Form submitted successfully', 'results' => $results]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error saving form response: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error saving form response: ' . $e->getMessage()], 500);
        }
    }

    public function evaluateFormResponse($formId, $answers)
    {
        // Log::info("TrainingsController:evaluateFormResponse");
        // Log::info([
        //     'form_id' => $formId,
        //     'answers' => $answers,
        // ]);

        // Items
        $items = TrainingFormItemsModel::with('choices')
            ->where('form_id', $formId)
            ->get()
            ->keyBy('id');

        $evaluation = [];
        $totalPoints = $items->sum('value');
        $passingScore = TrainingFormsModel::where('id', $formId)->value('passing_score');

        // Evaluators
        foreach ($answers as $itemId => $userAnswer) {
            $item = $items[$itemId] ?? null;

            if (!$item) {
                Log::warning("Item {$itemId} not found in form {$formId}");
                $evaluation[$itemId] = [null => 0];
                continue;
            }

            switch ($item->type) {
                case 'FillInTheBlank':
                    $correctChoice = $item->choices->first();
                    $evaluation[$itemId] = [
                        null => ($correctChoice && is_string($userAnswer) &&
                            trim(strtolower($userAnswer)) === trim(strtolower($correctChoice->description)))
                            ? $item->value : 0
                    ];
                    break;

                case 'Choice':
                    $choiceId = is_array($userAnswer) && count($userAnswer) === 1 ? $userAnswer[0] : null;
                    $selectedChoice = $choiceId ? $item->choices->firstWhere('id', $choiceId) : null;
                    $evaluation[$itemId] = [
                        $choiceId => $selectedChoice && $selectedChoice->is_correct ? $item->value : 0
                    ];
                    break;

                case 'MultiSelect':
                    if (!is_array($userAnswer)) {
                        $evaluation[$itemId] = [$userAnswer => 0];
                        break;
                    }
                    $choicesById = $item->choices->pluck('is_correct', 'id')->all();
                    $scores = array_map(
                        fn($choiceId) => isset($choicesById[$choiceId]) && $choicesById[$choiceId] ? 1 : 0,
                        $userAnswer
                    );
                    $evaluation[$itemId] = array_combine($userAnswer, $scores);
                    break;

                default:
                    Log::warning("Unknown item type for item {$itemId}: " . $item->type);
                    $evaluation[$itemId] = [null => 0];
                    break;
            }
        }

        // Unanswered Items
        $emptyAnswers = 0;
        foreach ($items as $itemId => $item) {
            if (!isset($answers[$itemId])) {
                $evaluation[$itemId] = [null => 0];
                $emptyAnswers++;
            }
        }

        // Log::info("Evaluated Responses: ", $evaluation);
        return [
            'total_points' => (int) $totalPoints,
            'passing_score' => (int) $passingScore,
            'scores' => $evaluation,
            'empty_answers' => $emptyAnswers,
        ];
    }

    public function getEmployeeFormReviewer(Request $request)
    {
        //Log::info("TrainingsController:getEmployeeFormReviewer");
        //Log::info($request);

        $user = Auth::user();
        $reviewData = new \stdClass();
        $formInfo = TrainingFormsModel::with(['items' => function ($query) {
            $query->orderBy('order', 'asc');
        }, 'items.choices'])->find($request->input('form_id'));
        $attemptInfo = TrainingFormResponsesModel::with('answers.choice', 'view')->find($request->input('attempt_id'));

        if (!$formInfo) {
            return response()->json(['error' => 'Form not found'], 404);
        }
        if (!$attemptInfo) {
            return response()->json(['error' => 'Form Response not found'], 404);
        }
        if ($attemptInfo->view->user_id != $user->id) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        unset($attemptInfo->view);

        $itemAnswers = collect($attemptInfo->answers)->groupBy('form_item_id');

        $reviewData->score = $attemptInfo->score;
        $reviewData->submit_time = $attemptInfo->created_at;
        $reviewData->duration = $attemptInfo->duration;
        $reviewData->items = $formInfo->items->map(function ($item) use ($itemAnswers) {
            $itemData = $item->toArray();

            $answers = $itemAnswers->get($item->id);
            if (!$answers) {
                $itemData['answer'] = $item->type == 'FillInTheBlank' ? null : [];
                return $itemData;
            }

            if ($item->type == 'FillInTheBlank') {
                $description = $answers->firstWhere('description')->description ?? null;
                $itemData['answer'] = $description;
            } else {
                $itemData['answer'] = $answers->pluck('form_choice_id')->toArray();
            }

            return $itemData;
        })->values()->toArray();

        return response()->json(['status' => 200, 'review_data' => $reviewData]);
    }
}
