<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\EvaluationForm;
use App\Models\EvaluationFormSection;
use App\Models\EvaluationFormCategory;
use App\Models\EvaluationFormSubcategory;
use App\Models\EvaluationFormSubcategoryOption;
use App\Models\EvaluationResponse;
use App\Models\EvaluationEvaluator;
use App\Models\EvaluationCommentor;
use App\Models\EvaluationOptionAnswer;
use App\Models\EvaluationPercentageAnswer;
use App\Models\EvaluationTextAnswer;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
class EvaluationResponseController extends Controller
{

    // evaluation response
 
        // delete evaluation response

        // edit evaluation response

    public function getEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            id: number
        */

        // returns:
        /*
            evaluationResponse: {
                id, evaluatee_id, datetime,
                period_start_date, period_end_date,
                signature_filepath,
                created_at, updated_at,
                status,                 // returns 'pending' always for now
                evaluatee: { id, response_id, last_name, first_name, middle_name },
                evaluators: {
                    evaluator_id, response_id, last_name, first_name, middle_name, comment, order, signature_filepath
                }[],
                commentors: {
                    commentor_id, response_id, last_name, first_name, middle_name, comment, order, signature_filepath
                }[],
                form_id, creator_user_name, form: {
                    id, name, creator_id, creator_user_name,
                    sections: {
                        form_id, id, name, category, order,
                        subcategories: {
                            section_id, id, name, subcategory_type, description, required,
                            allow_other_option, linear_scale_start, linear_scale_end, order,
                            options: {
                                subcategory_id, id, label, order,
                                option_answer: { id, response_id, option_id }
                            }[],
                            percentage_answer: { id, response_id, subcategory_id, percentage, value, linear_scale_index } | null,
                            text_answer: { id, response_id, subcategory_id, answer } | null
                        }[]
                    }[]
                },

            }
        */

        log::info('EvaluationResponseController::getEvaluationResponse');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationResponse = EvaluationResponse
                ::join('evaluation_forms', 'evaluation_forms.id', '=', 'evaluation_responses.form_id')
                ->join('users', 'users.id', '=', 'evaluation_forms.creator_id')
                ->select('evaluation_responses.id', 'evaluation_responses.evaluatee_id')
                ->selectRaw("date_format(evaluation_responses.updated_at, '%b %d, %Y - %h:%i %p') as datetime")
                ->selectRaw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as period_start_date")
                ->selectRaw("date_format(evaluation_responses.period_end_at, '%b %d, %Y') as period_end_date")
                ->addSelect(
                    'evaluation_responses.signature_filepath',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    DB::raw("'Pending' as status")
                )
                ->with(['evaluatee' => fn ($evaluatee) =>
                    $evaluatee->select('id', 'last_name', 'first_name', 'middle_name')
                ])
                ->with(['evaluators' => fn ($evaluatee) =>
                    $evaluatee
                        ->join('users', 'evaluation_evaluators.evaluator_id', '=', 'users.id')
                        ->select(
                            'evaluation_evaluators.evaluator_id',
                            'evaluation_evaluators.response_id',
                            'users.last_name', 'users.first_name', 'users.middle_name',
                            'evaluation_evaluators.comment',
                            'evaluation_evaluators.order',
                            'evaluation_evaluators.signature_filepath'
                        )
                        ->orderBy('order')
                ])
                ->with(['commentors' => fn ($evaluatee) =>
                    $evaluatee
                        ->join('users', 'evaluation_commentors.commentor_id', '=', 'users.id')
                        ->select(
                            'evaluation_commentors.commentor_id',
                            'evaluation_commentors.response_id',
                            'users.last_name', 'users.first_name', 'users.middle_name',
                            'evaluation_commentors.comment',
                            'evaluation_commentors.order',
                            'evaluation_commentors.signature_filepath'
                        )
                        ->orderBy('order')
                ])
                ->addSelect('evaluation_responses.form_id', 'users.user_name as creator_user_name')
                ->with(['form' => fn ($evaluationForm) =>
                    $evaluationForm
                        ->join('users', 'evaluation_forms.id', '=', 'users.id')
                        ->select(
                            'evaluation_forms.id',
                            'evaluation_forms.name', 
                            'evaluation_forms.creator_id',
                            'users.user_name as creator_user_name'
                        )
                        ->with(['sections' => fn ($section) =>
                            $section
                                ->select('form_id', 'id', 'name', 'category', 'order')
                                ->with(['subcategories' => fn ($subcategory) =>
                                    $subcategory
                                        ->select(
                                            'section_id', 'id',
                                            'name', 'subcategory_type', 'description',
                                            'required', 'allow_other_option',
                                            'linear_scale_start', 'linear_scale_end',
                                            'order'
                                        )
                                        ->with([
                                            'options' => fn ($option) =>
                                                $option
                                                    ->select(
                                                        'subcategory_id', 'label', 'score', 'order'
                                                    )
                                                    ->orderBy('order')
                                                    ->with([
                                                        'optionAnswer' => fn ($optionAnswer) =>
                                                            $optionAnswer->select('response_id', 'option_id')
                                                    ])
                                            ,
                                            'percentageAnswer' => fn ($percentageAnswer) =>
                                                $percentageAnswer
                                                ->join('evaluation_form_subcategories', 'evaluation_percentage_answers.subcategory_id', '=', 'evaluation_form_subcategories.id')
                                                ->select(
                                                    'evaluation_percentage_answers.response_id',
                                                    'evaluation_percentage_answers.subcategory_id',
                                                    'evaluation_percentage_answers.percentage',
                                                    'evaluation_form_subcategories.subcategory_type'
                                                )
                                                ->addSelect(DB::raw(
                                                    "round(evaluation_percentage_answers.percentage*"
                                                    ."(evaluation_form_subcategories.linear_scale_end"
                                                    ."-evaluation_form_subcategories.linear_scale_start)"
                                                    ."+evaluation_form_subcategories.linear_scale_start)"
                                                    ." as value"
                                                ))
                                                ->addSelect(DB::raw(
                                                    "round(evaluation_percentage_answers.percentage*"
                                                    ."(evaluation_form_subcategories.linear_scale_end"
                                                    ."-evaluation_form_subcategories.linear_scale_start))"
                                                    ." as linear_scale_index"
                                                ))
                                            ,
                                            'textAnswer' => fn ($textAnswer) =>
                                                $textAnswer->select('response_id', 'subcategory_id', 'answer')
                                        ])
                                        ->orderBy('order')
                                ])
                                ->orderBy('order')
                        ])
                ])
                ->where('evaluation_responses.id', $request->id)
                ->first()
            ;
            if( !$evaluationResponse ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Response not found!'
            ]);
            if (!$evaluationResponse) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Evaluation Response not found!'
                ]);
            }

            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Response successfully retrieved.',
                'evaluationResponse' => $evaluationResponse
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting evaluation response: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

     public function getEvaluationResponses(Request $request)
    {
         // inputs:
        /*
            page: number = 1,                   // counting starts at 1
            limit: number = 10,
            form_id?: number,                   // gets all if none given
            search: string,                     // searches for form name, date, evalautee name, department name, branch name, or status
            order_by: {
                key:
                    'updated_at' | 'form_name' | 'last_name' | 'first_name' |
                    'middle_name' | 'department_name' | 'branch_name' |
                    'status'                    // pending first -> finished last
                ,
                sort_order: 'asc' | 'desc' = 'asc'
            }[];
        */

        // outputs:
        /*
            evaluationResponses: {
                id, form_id, form_name, date, role,
                evaluatee_id, evaluatee: { id, last_name, first_name, middle_name },
                department_id, department_name, branch_id, branch_name, status,
                created_at, updated_at
            }[],
            pageResponseCount,
            totalResponseCount,
            maxPageCount
        */

        Log::info('EvaluationResponseController::getEvaluationResponses');

        try {

            if (Auth::check()) {
                $userID = Auth::id();
            } else {
                $userID = null;
            }

            $user = DB::table('users')->where('id', $userID)->first();

            if($request->page === null) $request->page = 1;
            if($request->limit === null) $request->limit = 10;
            if ($request->page < 1 || $request->limit < 1)
                return response()->json([
                    'status' => 404,
                    'message' => 'No evaluation responses exist!'
                ]);

            $evaluationResponses = EvaluationResponse
                ::join('evaluation_forms', 'evaluation_responses.form_id', '=', 'evaluation_forms.id')
                ->join('users as evaluatees', 'evaluation_responses.evaluatee_id', '=', 'evaluatees.id')
                ->join('departments', 'evaluatees.department_id', '=', 'departments.id')
                ->join('branches', 'evaluatees.branch_id', '=', 'branches.id')
                ->join('evaluation_evaluators as evaluators', 'evaluation_responses.id', '=', 'evaluators.response_id')
                ->join('evaluation_commentors as commentors', 'evaluation_responses.id', '=', 'commentors.response_id')
                ->select('evaluation_responses.id', 'evaluation_forms.id as form_id', 'evaluation_forms.name as form_name')
                ->selectRaw("date_format(evaluation_responses.updated_at, '%b %d, %Y') as date")
                ->selectRaw(
                    '
                        CASE
                            WHEN evaluation_responses.evaluatee_id = ? THEN "Evaluatee"
                            WHEN evaluators.evaluator_id = ? THEN "Evaluator"
                            WHEN commentors.commentor_id = ? THEN "Commentor"
                        ELSE "Idunno" END as role
                    ',
                    [$user->id, $user->id, $user->id]
                )
                ->addSelect('evaluatee_id')
                ->with(['evaluatee' => fn ($evaluatee) =>
                    $evaluatee->select('id', 'last_name', 'first_name', 'middle_name')
                ])
                ->addSelect(
                    'departments.id as department_id', 'departments.name as department_name',
                    'branches.id as branch_id', 'branches.name as branch_name',
                    DB::raw("'Pending' as status"),
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
            ;

            
            if($request->search)
                $evaluationResponses = $evaluationResponses->where(function ($query) use ($request) {
                    $query
                        ->where('evaluation_forms.name', 'LIKE', "%$request->search%")
                        ->orWhere(DB::raw("date_format(evaluation_responses.updated_at, '%b %d, %Y')"), 'LIKE', "%$request->search%")
                        ->orWhere(
                            DB::raw('CONCAT(
                                evaluatees.last_name, ", ",
                                evaluatees.first_name,
                                IF(ISNULL(evaluatees.middle_name), "", CONCAT(" ", evaluatees.middle_name))
                            )'),
                            'LIKE', "%$request->search%"
                        )
                        ->orWhere('departments.name', 'LIKE', "%$request->search%")
                        ->orWhere('branches.name', 'LIKE', "%$request->search%")
                        // status
                    ;
                });
            
            if ($request->form_id !== null)
                $evaluationResponses = $evaluationResponses->where('evaluation_responses.form_id', $request->form_id);
            $evaluationResponses = $evaluationResponses->where(function ($query) use ($request, $user) {
                $query
                    ->where('evaluation_responses.evaluatee_id', $user->id)
                    ->orWhere('evaluators.evaluator_id', $user->id)
                    ->orWhere('commentors.commentor_id', $user->id)
                ;
            });
            $evaluationResponses = $evaluationResponses->groupBy('evaluators.response_id', 'commentors.response_id');

            if ($request->order_by) foreach ($request->order_by as $index => $order_by_param) {
                $sortOrder = $order_by_param['sort_order'] ?? 'asc';
                $sortOrderReverse = $sortOrder == 'asc' ? 'desc' : 'asc';
                if ($sortOrder != 'asc' && $sortOrder != 'desc')
                    return response()->json([
                        'status' => 400,
                        'message' => 'Sort order is invalid!'
                    ]);
                switch ($order_by_param['key']) {
                    case 'branch_name':
                        $evaluationResponses = $evaluationResponses->orderBy('branches.name', $sortOrder);
                        break;
                    case 'department_name':
                        $evaluationResponses = $evaluationResponses->orderBy('departments.name', $sortOrder);
                        break;
                    case 'last_name':
                        $evaluationResponses = $evaluationResponses->orderBy('evaluatees.last_name', $sortOrder);
                        break;
                    case 'first_name':
                        $evaluationResponses = $evaluationResponses->orderBy('evaluatees.first_name', $sortOrder);
                        break;
                    case 'middle_name':
                        $evaluationResponses = $evaluationResponses->orderBy('evaluatees.middle_name', $sortOrder);
                        break;
                    // case 'status':
                    case 'updated_at':
                        $evaluationResponses = $evaluationResponses->orderBy('evaluation_responses.updated_at', $sortOrderReverse);
                        break;
                    default:
                        return response()->json([
                            'status' => 400,
                            'message' => 'Order by option is invalid!'
                        ]);
                }
            }

            $page = $request->page ?? 1;
            $limit = $request->limit ?? 10;
            $totalResponseCount = $evaluationResponses->count();
            $maxPageCount = ceil($totalResponseCount / $limit);
            if ($page > $maxPageCount || $totalResponseCount == 0)
                return response()->json([
                    'status' => 404,
                    'message' => 'No evaluation responses exist!'
                ]);
            $pageResponseCount =
                ($page * $limit > $totalResponseCount) ? $totalResponseCount % $limit
                : $limit;
            $skip = ($page - 1) * $limit;
            $evaluationResponses = $evaluationResponses->skip($skip)->take($limit)->get();

            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Responses successfully retrieved.',
                'evaluationResponses' => $evaluationResponses,
                'pageResponseCount' => $pageResponseCount,
                'totalResponseCount' => $totalResponseCount,
                'maxPageCount' => $maxPageCount
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error getting evaluation responses: ' . $e->getMessage());
            throw $e;
        }
    }

    public function saveEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            evaluatee_id: number,
            form_id: number,
            evaluators: number[],
            commentors: number[],
            period_start_at: string,
            period_end_at: string
        */

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        if (!Auth::check()) {
            return response()->json([
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);
        }

        $userID = Auth::id();



        try {

            if($user === null) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            if(!$request->evaluators) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluators are required!'
            ]);
            if(!$request->commentors) return response()->json([ 
                'status' => 400,
                'message' => 'Commentors are required!'
            ]);

            $periodStartAtSec = strtotime($request->period_start_at);
            $periodEndAtSec = strtotime($request->period_end_at);
            $request->period_start_at = date('Y-m-d H:i:s', $periodStartAtSec - $periodStartAtSec % 82800);
            $request->period_end_at = date('Y-m-d H:i:s', $periodEndAtSec + 86400 - $periodEndAtSec % 82800);

            if ($periodStartAtSec > $periodEndAtSec) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Period Start Date cannot be more than Period End Date!'
                ]);
            }

            DB::beginTransaction();

            $conflictingEvaluationResponse = EvaluationResponse::where('evaluatee_id', $request->evaluatee_id)
                ->where('form_id', $request->form_id)
                ->where('period_start_at', '<', $request->period_end_at)
                ->where('period_end_at', '>', $request->period_start_at)
                ->first()
            ;
            if($conflictingEvaluationResponse) return response()->json([ 
                'status' => 400,
                'message' => 'This Evaluation is in conflict with another!',
                'conflictingEvaluationResponseID' => $conflictingEvaluationResponse->id
            ]);

            $newEvaluationResponse = EvaluationResponse::create([
                'evaluatee_id' => $request->evaluatee_id,
                'form_id' => $request->form_id,
                'period_start_at' => $request->period_start_at,
                'period_end_at' => $request->period_end_at,
                'status' => 'pending',
                'current_step' => 'evaluator'
            ]);

            foreach ($request->evaluators as $index => $evaluator_id) {
                EvaluationEvaluator::create([
                    'response_id' => $newEvaluationResponse->id,
                    'evaluator_id' => $evaluator_id,
                    'order' => $index + 1
                ]);
            }

            foreach ($request->commentors as $index => $commentor_id) {
                EvaluationCommentor::create([
                    'response_id' => $newEvaluationResponse->id,
                    'commentor_id' => $commentor_id,
                    'order' => $index + 1
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 201,
                'evaluationResponseID' => $newEvaluationResponse->id,
                'message' => 'Evaluation Response successfully created'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving evaluation response: ' . $e->getMessage());
            throw $e;
        }
    }

    // evaluation evaluator

        // delete evaluation evaluator

        // edit evaluation evaluator

        // get evaluation evaluator

        // get evaluation evaluators

        // save evaluation evaluator

    // evaluation commentor

        // delete evaluation commentor

        // edit evaluation commentor

        // get evaluation commentor

        // get evaluation commentors

        // save evaluation commentor
    
    public function advanceWorkflow(Request $request, $id)
    {
        $evaluation = EvaluationResponse::find($id);
        if (!$evaluation) {
            return response()->json([
                'status' => 404,
                'message' => 'Evaluation not found'
            ]);
        }

        $userID = Auth::id();
        $now = now();

        // Advance step based on current_step
        switch ($evaluation->current_step) {
            case 'evaluator':
                if ($evaluation->evaluator_id != $userID) {
                    return response()->json(['status' => 403, 'message' => 'Not authorized']);
                }
                $evaluation->update([
                    'status' => 'for_commentor1',
                    'current_step' => 'first_commentor',
                    'evaluator_completed_at' => $now
                ]);
                break;
            case 'first_commentor':
                if ($evaluation->primary_commentor_id != $userID) {
                    return response()->json(['status' => 403, 'message' => 'Not authorized']);
                }
                $evaluation->update([
                    'status' => 'for_commentor2',
                    'current_step' => 'second_commentor',
                    'first_commentor_completed_at' => $now
                ]);
                break;
            case 'second_commentor':
                if ($evaluation->secondary_commentor_id != $userID) {
                    return response()->json(['status' => 403, 'message' => 'Not authorized']);
                }
                $evaluation->update([
                    'status' => 'for_acknowledgement',
                    'current_step' => 'evaluatee',
                    'second_commentor_completed_at' => $now
                ]);
                break;
            case 'evaluatee':
                if ($evaluation->evaluatee_id != $userID) {
                    return response()->json(['status' => 403, 'message' => 'Not authorized']);
                }
                $evaluation->update([
                    'status' => 'completed',
                    'current_step' => null,
                    'evaluatee_acknowledged_at' => $now
                ]);
                break;
            default:
                return response()->json(['status' => 400, 'message' => 'Workflow is already completed or invalid step.']);
        }

        return response()->json([
            'status' => 200,
            'message' => 'Evaluation advanced to the next step.',
            'evaluation' => $evaluation
        ]);
    }

    // evaluation form percentage answer

        // delete evaluation form percentage answer

    public function editEvaluationPercentageAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number,
            percentage?: number,            // either percentage or value must be given
            value?: number                  // value means percentage is auto-calculated
        */

        // returns:
        /*
            evaluationPercentageAnswer: {
                response_id, subcategory_id, percentage, value, linear_scale_index,
                created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::editEvaluationPercentageAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            DB::beginTransaction();

            $evaluationPercentageAnswer = EvaluationPercentageAnswer
                ::join('evaluation_form_subcategories', 'evaluation_percentage_answers.subcategory_id', '=', 'evaluation_form_subcategories.id')
                ->select('evaluation_percentage_answers.*')
                ->addSelect(DB::raw(
                    "round(evaluation_percentage_answers.percentage*"
                    ."(evaluation_form_subcategories.linear_scale_end"
                    ."-evaluation_form_subcategories.linear_scale_start)"
                    ."+evaluation_form_subcategories.linear_scale_start)"
                    ." as value"
                ))
                ->addSelect(DB::raw(
                    "round(evaluation_percentage_answers.percentage*"
                    ."(evaluation_form_subcategories.linear_scale_end"
                    ."-evaluation_form_subcategories.linear_scale_start))"
                    ." as linear_scale_index"
                ))
                ->where('evaluation_percentage_answers.response_id', $request->response_id)
                ->where('evaluation_percentage_answers.subcategory_id', $request->subcategory_id)
                ->first()
            ;

            if(!$evaluationPercentageAnswer) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Percentage Answer not found!',
                'evaluationPercentageAnswerID' => $request->id
            ]);

            if($request->percentage === null && $request->value === null) return response()->json([
                'status' => 400,
                'message' => 'Either Percentage or Value must be given!'
            ]);

            $subcategory = EvaluationFormSubcategory
                ::select('id', 'subcategory_type', 'linear_scale_start', 'linear_scale_end')
                ->where('id', $evaluationPercentageAnswer->subcategory_id)
                ->first()
            ;

            if($subcategory->subcategory_type != 'linear_scale') return response()->json([
                'status' => 400,
                'message' => 'This subcategory does not accept percentage answers!',
                'evaluationFormSubcategoryID' => $subcategory->id,
                'subcategoryType' => $subcategory->subcategory_type
            ]);

            if(
                $request->percentage === null
                && (
                    $request->value < $subcategory->linear_scale_start
                    || $request->value > $subcategory->linear_scale_end
                )
            ) return response()->json([
                'status' => 400,
                'message' => 'Value is is not within linear scale!',
                'evaluationFormSubcategoryID' => $subcategory->id,
                'linear_scale_start' => $subcategory->linear_scale_start,
                'linear_scale_end' => $subcategory->linear_scale_end
            ]);

            $percentage = (
                $request->percentage
                ?? (
                    ($request->value - $subcategory->linear_scale_start)
                    / ($subcategory->linear_scale_end - $subcategory->linear_scale_start)
                )
            );

            $evaluationPercentageAnswer->percentage = (double) $percentage;
            $evaluationPercentageAnswer->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationPercentageAnswer' => $evaluationPercentageAnswer,
                'message' => 'Evaluation Percentage Answer successfully updated'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationPercentageAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number,
        */

        // returns:
        /*
            evaluationPercentageAnswer: {
                response_id, subcategory_id, percentage, value, linear_scale_index,
                created_at, updated_at
            }
        */

        log::info('EvaluationResponseController::getEvaluationPercentageAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationPercentageAnswer = EvaluationPercentageAnswer
                ::select(
                    'response_id', 'subcategory_id', 'percentage',
                    'created_at', 'updated_at'
                )
                ->where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->first()
            ;
            if( !$evaluationPercentageAnswer ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Percentage Answer not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Percentage Answer successfully retrieved.',
                'evaluationPercentageAnswer' => $evaluationPercentageAnswer
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationPercentageAnswers(Request $request)
    {
        // inputs:
        /*
            subcategory_id: number
        */

        // returns:
        /*
            evaluationPercentageAnswers: {
                response_id, subcategory_id, percentage, value, linear_scale_index,
                created_at, updated_at
            }[]
        */

        log::info('EvaluationResponseController::getEvaluationPercentageAnswers');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationPercentageAnswers = EvaluationPercentageAnswer
                ::select(
                    'id', 'response_id', 'subcategory_id', 'percentage',
                    'created_at', 'updated_at'
                )
                ->where('subcategory_id', $request->subcategory_id)
                ->get()
            ;
            if( !$evaluationPercentageAnswers ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Percentage Answers not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Percentage Answers successfully retrieved.',
                'evaluationPercentageAnswers' => $evaluationPercentageAnswers
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationPercentageAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number,
            percentage?: number,            // either percentage or value must be given
            value?: number                  // value means percentage is auto-calculated
        */

        // returns:
        /*
            evaluationPercentageAnswerID
        */

        log::info('EvaluationResponseController::saveEvaluationPercentageAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

           if($request->percentage === null && $request->value === null) return response()->json([
                'status' => 400,
                'message' => 'Either Percentage or Value must be given!'
            ]);

            $subcategory = EvaluationFormSubcategory
                ::select('subcategory_type', 'linear_scale_start', 'linear_scale_end')
                ->where('id', $request->subcategory_id)
                ->first()
            ;

            if($subcategory->subcategory_type != 'linear_scale') return response()->json([
                'status' => 400,
                'message' => 'This subcategory does not accept percentage answers!',
                'evaluationFormSubcategoryID' => $subcategory->id
            ]);
            
            $existingFormPercentageAnswer = EvaluationPercentageAnswer
                ::where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->first()
            ;

            if($existingFormPercentageAnswer) return response()->json([ 
                'status' => 409,
                'message' => 'A percentage answer was already created for this subcategory!',
                'evaluationResponseID' => $request->response_id,
                'evaluationFormSubcategoryID' => $request->subcategory_id
            ]);

            if(
                $request->percentage === null
                && (
                    $request->value < $subcategory->linear_scale_start
                    || $request->value > $subcategory->linear_scale_end
                )
            ) return response()->json([
                'status' => 400,
                'message' => 'Value is is not within linear scale!',
                'evaluationFormSubcategoryID' => $subcategory->id,
                'linear_scale_start' => $subcategory->linear_scale_start,
                'linear_scale_end' => $subcategory->linear_scale_end
            ]);

            DB::beginTransaction();

            $percentage = (
                $request->percentage
                ?? (
                    ($request->value - $subcategory->linear_scale_start)
                    / ($subcategory->linear_scale_end - $subcategory->linear_scale_start)
                )
            );

            $newEvaluationPercentageAnswer = EvaluationPercentageAnswer::create([
                'response_id' => $request->response_id,
                'subcategory_id' => $request->subcategory_id,
                'percentage' => $percentage
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'message' => 'Evaluation Percentage Answer successfully created',
                'evaluationResponseID' => $request->response_id,
                'evaluationFormSubcategoryID' => $request->subcategory_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation form text answer

    public function deleteEvaluationTextAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number
        */

        // returns:
        /*
            evaluationTextAnswer: {
                response_id, subcategory_id, answer, created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationFormController::deleteEvaluationTextAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            DB::beginTransaction();

            $evaluationTextAnswer = EvaluationTextAnswer
                ::select()
                ->where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->first()
            ;

            if( !$evaluationTextAnswer ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Text Answer not found!',
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryID' => $request->subcategory_id
            ]);

            if( $evaluationTextAnswer->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Text Answer already deleted!',
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryID' => $request->subcategory_id
            ]);

            $now = date('Y-m-d H:i');
            $evaluationTextAnswer->deleted_at = $now;
            $evaluationTextAnswer->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'message' => 'Evaluation Text Answer successfully deleted',
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryID' => $request->subcategory_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationTextAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number,
            answer: string
        */

        // returns:
        /*
            evaluationTextAnswer: {
                response_id, subcategory_id, answer, created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::editEvaluationTextAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            DB::beginTransaction();

            $evaluationTextAnswer = EvaluationTextAnswer
                ::select()
                ->where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->first()
            ;

            if(!$evaluationTextAnswer) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Text Answer not found!',
                'evaluationTextAnswerID' => $request->id
            ]);

            $subcategory = EvaluationFormSubcategory
                ::select('id', 'subcategory_type')
                ->where('id', $request->subcategory_id)
                ->first()
            ;

            if(!in_array($subcategory->subcategory_type, ['long_answer', 'short_answer']))
                return response()->json([
                    'status' => 400,
                    'message' => 'This subcategory does not accept text answers!',
                    'evaluationFormSubcategoryID' => $subcategory->id
                ]);

            $isEmptyAnswer = !$request->answer;
            if($isEmptyAnswer) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Answer is required!'
            ]);

            $evaluationTextAnswer->answer = $request->answer;
            $evaluationTextAnswer->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationTextAnswer' => $evaluationTextAnswer,
                'message' => 'Evaluation Text Answer successfully updated'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationTextAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number
        */

        // returns:
        /*
            evaluationTextAnswer: { response_id, subcategory_id, answer, created_at, updated_at }
        */

        log::info('EvaluationResponseController::getEvaluationTextAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationTextAnswer = EvaluationTextAnswer
                ::select(
                    'response_id', 'subcategory_id', 'answer',
                    'created_at', 'updated_at'
                )
                ->where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->first()
            ;
            if( !$evaluationTextAnswer ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Text Answer not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Text Answer successfully retrieved.',
                'evaluationTextAnswer' => $evaluationTextAnswer
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationTextAnswers(Request $request)
    {
        // inputs:
        /*
            subcategory_id: number
        */

        // returns:
        /*
            evaluationTextAnswers: {
                response_id, subcategory_id, answer, created_at, updated_at
            }[]
        */

        log::info('EvaluationResponseController::getEvaluationTextAnswers');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationTextAnswers = EvaluationTextAnswer
                ::select(
                    'response_id', 'subcategory_id', 'answer',
                    'created_at', 'updated_at'
                )
                ->where('subcategory_id', $request->subcategory_id)
                ->get()
            ;
            if( !$evaluationTextAnswers ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Text Answers not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Text Answers successfully retrieved.',
                'evaluationTextAnswers' => $evaluationTextAnswers
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationTextAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number,
            answer: string
        */

        // returns:
        /*
            evaluationTextAnswerID
        */

        log::info('EvaluationResponseController::saveEvaluationTextAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            $subcategory = EvaluationFormSubcategory
                ::select('id', 'subcategory_type')
                ->where('id', $request->subcategory_id)
                ->first()
            ;

            if(!in_array($subcategory->subcategory_type, ['long_answer', 'short_answer']))
                return response()->json([
                    'status' => 400,
                    'message' => 'This subcategory does not accept text answers!',
                    'evaluationFormSubcategoryID' => $subcategory->id
                ]);

            $existingFormTextAnswer = EvaluationTextAnswer
                ::where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->first()
            ;

            if($existingFormTextAnswer) return response()->json([ 
                'status' => 409,
                'message' => 'A text answer was already created for this subcategory!',
                'evaluationResponseID' => $request->response_id,
                'evaluationFormSubcategoryID' => $request->subcategory_id
            ]);

            $isEmptyAnswer = !$request->answer;
            if($isEmptyAnswer) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Answer is required!'
            ]);

            DB::beginTransaction();

            $newEvaluationTextAnswer = EvaluationTextAnswer::create([
                'response_id' => $request->response_id,
                'subcategory_id' => $request->subcategory_id,
                'answer' => $request->answer
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'message' => 'Evaluation Text Answer successfully created',
                'evaluationResponseID' => $request->response_id,
                'evaluationFormSubcategoryID' => $request->subcategory_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation form option answer

        // delete evaluation form option answer

        // edit evaluation form option answer

    public function getEvaluationOptionAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            option_id: number
        */

        // returns:
        /*
            evaluationOptionAnswer: { response_id, option_id, answer, created_at, updated_at }
        */

        log::info('EvaluationResponseController::getEvaluationOptionAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationOptionAnswer = EvaluationOptionAnswer
                ::select('response_id', 'option_id', 'created_at', 'updated_at')
                ->where('response_id', $request->response_id)
                ->where('option_id', $request->option_id)
                ->first()
            ;
            if( !$evaluationOptionAnswer ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Option Answer not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Option Answer successfully retrieved.',
                'evaluationOptionAnswer' => $evaluationOptionAnswer
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationOptionAnswers(Request $request)
    {
        log::info('EvaluationResponseController::getEvaluationOptionAnswers');

        // inputs:
        /*
            response_id?: number,      // either response_id, subcategory_id, or option_id must be given
            subcategory_id?: number,
            option_id?: number
        */

        // returns:
        /*
            evaluationOptionAnswers: {
                response_id, option_id, created_at, updated_at
            }[]
        */

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            if(
                !$request->response_id && !$request->subcategory_id && !$request->option_id
            ) return response()->json([
                'status' => 400,
                'message' => 'Either Response ID, Subcategory ID, or Option ID must be given!'
            ]);
            
            $evaluationOptionAnswers = EvaluationOptionAnswer
                ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                ->select(
                    'evaluation_option_answers.id', 'evaluation_option_answers.response_id',
                    'evaluation_form_subcategories.id as subcategory_id',
                    'evaluation_option_answers.option_id',
                    'evaluation_option_answers.created_at', 'evaluation_option_answers.updated_at'
                )
            ;
            
            if($request->response_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_option_answers.response_id', $request->response_id
                );
            if($request->subcategory_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_form_subcategories.id', $request->subcategory_id
                );
            if($request->option_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_option_answers.option_id', $request->option_id
                );
            $evaluationOptionAnswers = $evaluationOptionAnswers->get();

            if( !$evaluationOptionAnswers ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Option Answers not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Option Answers successfully retrieved.',
                'evaluationOptionAnswers' => $evaluationOptionAnswers
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
        
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
        $user = DB::table('users')->where('id', $userID)->first();

        try {
            if (
                !$request->response_id && !$request->subcategory_id && !$request->option_id
            ) return response()->json([
                'status' => 400,
                'message' => 'Either Response ID, Subcategory ID, or Option ID must be given!'
            ]);

            $evaluationOptionAnswers = EvaluationOptionAnswer
                ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                ->select(
                    'evaluation_option_answers.response_id',
                    'evaluation_option_answers.option_id',
                    'evaluation_form_subcategories.id as subcategory_id',
                    'evaluation_option_answers.created_at',
                    'evaluation_option_answers.updated_at'
                );

            if ($request->response_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_option_answers.response_id', $request->response_id
                );
            if ($request->subcategory_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_form_subcategories.id', $request->subcategory_id
                );
            if ($request->option_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_option_answers.option_id', $request->option_id
                );
            $evaluationOptionAnswers = $evaluationOptionAnswers->get();

            if (!$evaluationOptionAnswers || $evaluationOptionAnswers->isEmpty()) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Option Answers not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Option Answers successfully retrieved.',
                'evaluationOptionAnswers' => $evaluationOptionAnswers
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error getting evaluation option answers: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function saveEvaluationOptionAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            option_id: number
        */

        // returns:
        /*
            evaluationOptionAnswerID
        */

        log::info('EvaluationResponseController::saveEvaluationOptionAnswer');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            $subcategory = EvaluationFormSubcategoryOption
                ::join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                ->select(
                    'evaluation_form_subcategories.id',
                    'evaluation_form_subcategories.subcategory_type'
                )
                ->where('evaluation_form_subcategory_options.id', $request->option_id)
                ->first()
            ;

            switch($subcategory->subcategory_type) {
                case "linear_scale":
                case "long_answer":
                case "short_answer":
                    return response()->json([
                        'status' => 400,
                        'message' => 'This subcategory does not accept choice answers!',
                        'evaluationFormSubcategoryID' => $subcategory->id
                    ]);
                    break;
                case "checkbox":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                        ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                        ->select('evaluation_option_answers.id')
                        ->where('evaluation_option_answers.option_id', '=', $request->option_id)
                        ->where('evaluation_option_answers.response_id', '=', $request->response_id)
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'The same option answer was already created for this subcategory!',
                        'evaluationOptionAnswerID' => $existingOptionAnswer->id
                    ]);
                    break;
                case "dropdown":
                case "multiple_choice":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                        ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                        ->select('evaluation_option_answers.id')
                        ->where('evaluation_option_answers.response_id', '=', $request->response_id)
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'An option answer was already created for this subcategory!',
                        'evaluationOptionAnswerID' => $existingOptionAnswer->id
                    ]);
                    break;
                
            }

            DB::beginTransaction();

            $newEvaluationOptionAnswer = EvaluationOptionAnswer::create([
                'response_id' => $request->response_id,
                'option_id' => $request->option_id
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'message' => 'Evaluation Option Answer successfully created',
                'evaluationResponseID' => $request->response_id,
                'evaluationFormSubcategoryOptionID' => $request->option_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

}
