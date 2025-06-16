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

    // evaluatees, evaluators, commentors

    public function getCommentors(Request $request)
    {
        // inputs:
        /*
            department_id?: number,
            branch_id?: number,
            exclude?: number[]
        */

        // returns:
        /*
            users: {
                id, last_name, first_name, middle_name, suffix
            }
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

        $commentors = UsersModel
            ::select('id', 'user_name', 'last_name', 'first_name', 'middle_name', 'suffix')
            ->where('client_id', $user->client_id)
            ->whereNot('id', $user->id)
            ->whereNull('deleted_at')
        ;
        if($request->department_id !== null)
            $commentors = $commentors->where('department_id', $request->department_id);
        if($request->branch_id !== null)
            $commentors = $commentors->where('branch_id', $request->branch_id);
        if($request->exclude)
            $evaluatees = $evaluatees->whereNotIn('id', $request->exclude);
        $commentors = $commentors
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('suffix')
            ->get()
        ;
        if(!$commentors) return response()->json([ 
            'status' => 404,
            'message' => 'Commentors not found!'
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'Commentors successfully retrieved.',
            'evaluatees' => $commentors
        ]);
    }

    public function getEvaluatees(Request $request)
    {
        // Ensure authentication
        if (!\Auth::check()) {
            return response()->json([
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);
        }

        $userID = \Auth::id();
        $user = \DB::table('users')->select()->where('id', $userID)->first();

        $evaluatees = \App\Models\UsersModel::select(
                'id', 'user_name', 'last_name', 'first_name', 'middle_name', 'suffix'
            )
            ->where('client_id', $user->client_id)
            ->whereNull('deleted_at');

        // Optional: filter by user_type(s) if provided
        if ($request->has('user_type')) {
            $userType = $request->user_type;
            if (is_array($userType)) {
                $evaluatees = $evaluatees->whereIn('user_type', $userType);
            } elseif (is_string($userType)) {
                $types = array_map('trim', explode(',', $userType));
                $evaluatees = $evaluatees->whereIn('user_type', $types);
            }
        }

        // Optional: filter by department and branch
        if ($request->department_id !== null) {
            $evaluatees = $evaluatees->where('department_id', $request->department_id);
        }
        if ($request->branch_id !== null) {
            $evaluatees = $evaluatees->where('branch_id', $request->branch_id);
        }
        if ($request->exclude) {
            $evaluatees = $evaluatees->whereNotIn('id', $request->exclude);
        }

        $evaluatees = $evaluatees
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('suffix')
            ->get();

        if ($evaluatees->isEmpty()) {
            return response()->json([
                'status' => 404,
                'message' => 'Evaluatees not found!',
                'evaluatees' => []
            ]);
        }
        return response()->json([
            'status' => 200,
            'message' => 'Evaluatees successfully retrieved.',
            'evaluatees' => $evaluatees
        ]);
    }

    public function getEvaluators(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);
        }
        $userID = Auth::id();
        $user = DB::table('users')->select()->where('id', $userID)->first();

        $evaluators = UsersModel
            ::select('id', 'user_name', 'last_name', 'first_name', 'middle_name', 'suffix')
            ->whereNot('id', $user->id)
            ->where('client_id', $user->client_id)
            ->whereNull('deleted_at');

        if($request->department_id !== null)
            $evaluators = $evaluators->where('department_id', $request->department_id);

        if($request->branch_id !== null)
            $evaluators = $evaluators->where('branch_id', $request->branch_id);

        // Support for flexible user_type filtering
        if ($request->has('user_type')) {
            $userType = $request->user_type;
            // Accepts either array or comma-separated string
            if (is_array($userType)) {
                $evaluators = $evaluators->whereIn('user_type', $userType);
            } elseif (is_string($userType)) {
                // Handles comma-separated string or single type
                $types = array_map('trim', explode(',', $userType));
                $evaluators = $evaluators->whereIn('user_type', $types);
            } else {
                // Fallback to both Admin and Employee if something unexpected
                $evaluators = $evaluators->whereIn('user_type', ['Admin', 'Employee']);
            }
        } else {
            // Default: both Admin and Employee
            $evaluators = $evaluators->whereIn('user_type', ['Admin', 'Employee']);
        }

        if($request->exclude)
            $evaluators = $evaluators->whereNotIn('id', $request->exclude);

        $evaluators = $evaluators
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('suffix')
            ->get();

        if($evaluators->isEmpty()) return response()->json([ 
            'status' => 404,
            'message' => 'Evaluators not found!'
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'Evaluators successfully retrieved.',
            'users' => $evaluators
        ]);
    }

    // evaluation response
 
    public function deleteEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            id: number
        */

        // returns:
        /*
            evaluationResponse: {
                id, evaluatee_id, form_id, period_start_at, period_end_at, signature_filepath,
                created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::deleteEvaluationForm');

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
            DB::beginTransaction();

            $evaluationResponse = EvaluationResponse::find($request->id);

            if (!$evaluationResponse) {
                return response()->json([ 
                    'status' => 404,
                    'message' => 'Evaluation Response not found!',
                    'evaluationResponseID' => $request->id
                ]);
            }

            if ($evaluationResponse->deleted_at) {
                return response()->json([ 
                    'status' => 405,
                    'message' => 'Evaluation Response already deleted!',
                    'evaluationResponse' => $evaluationResponse
                ]);
            }

            $evaluationResponse->deleted_at = now();
            $evaluationResponse->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationResponse' => $evaluationResponse,
                'message' => 'Evaluation Response successfully deleted'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            log::error('Error deleting evaluation response: ' . $e->getMessage());
            throw $e;
        }
    }

    public function editEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            id: number,
            evaluatee_id?: number,
            form_id?: number,
            period_start_at?: string,
            period_end_at?: string,
        */
        // output:
        /*
            evaluationResponse: {
                id, evaluatee_id, form_id, period_start_at, period_end_at, signature_filepath,
                created_at, updated_at
            }
        */

        log::info('EvaluationResponseController::editEvaluationResponse');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            if($user === null) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            DB::beginTransaction();

            $evaluationResponse = EvaluationResponse
            ::select(
                'id', 'evaluatee_id', 'form_id', 'period_start_at', 'period_end_at',
                'creator_signature_filepath', 'evaluatee_signature_filepath', 'created_at', 'updated_at'
            )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
                ->first()
            ;
            if( !$evaluationResponse ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Response not found!',
                'evaluationResponseID' => $request->id
            ]);

            $periodStartAtSec = strtotime($request->period_start_at ?? $evaluationResponse->period_start_at);
            $periodEndAtSec = strtotime($request->period_end_at ?? $evaluationResponse->period_end_at);
            $request->period_start_at = date('Y-m-d H:i:s', $periodStartAtSec - $periodStartAtSec % 82800);
            $request->period_end_at = date('Y-m-d H:i:s', $periodEndAtSec + 86400 - $periodEndAtSec % 82800);

            if ($periodStartAtSec > $periodEndAtSec) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Period Start Date cannot be more than Period End Date!'
                ]);
            }

            $conflictingEvaluationResponse = EvaluationResponse
                ::where('evaluatee_id', $request->evaluatee_id ?? $evaluationResponse->evaluatee_id)
                ->where('form_id', $request->form_id ?? $evaluationResponse->form_id)
                ->where('id', '!=', $request->id)
                ->where('period_start_at', '<', $request->period_end_at ?? $evaluationResponse->period_end_at)
                ->where('period_end_at', '>', $request->period_start_at ?? $evaluationResponse->period_start_at)
                ->first()
            ;
            if($conflictingEvaluationResponse) return response()->json([ 
                'status' => 400,
                'message' => 'This Evaluation is in conflict with another!',
                'conflictingEvaluationResponseID' => $conflictingEvaluationResponse->id
            ]);

            if($request->evaluatee_id !== null)
                $evaluationResponse->evaluatee_id = $request->evaluatee_id;
            if($request->form_id !== null)
                $evaluationResponse->form_id = $request->form_id;
            if($request->period_end_at !== null)
                $evaluationResponse->period_end_at = $request->period_end_at;
            if($request->period_start_at !== null)
                $evaluationResponse->period_start_at = $request->period_start_at;
            
            if ($request->has('creator_signature_filepath')) {
                $evaluationResponse->creator_signature_filepath = $request->creator_signature_filepath;
            }
            if ($request->has('evaluatee_signature_filepath')) {
                $evaluationResponse->evaluatee_signature_filepath = $request->evaluatee_signature_filepath;
            }

            $evaluationResponse->save();
            DB::commit();

            return response()->json([
                'status' => 201,
                'message' => 'Evaluation Response successfully updated',
                'evaluationResponse' => $evaluationResponse
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving evaluation response: ' . $e->getMessage());
            throw $e;
        }
    }

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
                evaluatee: { id, response_id, last_name, first_name, middle_name, suffix },
                evaluators: {
                    evaluator_id, response_id, last_name, first_name, middle_name, suffix, comment, order, signature_filepath
                }[],
                commentors: {
                    commentor_id, response_id, last_name, first_name, middle_name, suffix, comment, order, signature_filepath
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
                    'evaluation_responses.creator_signature_filepath',
                    'evaluation_responses.evaluatee_signature_filepath',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    DB::raw("'Pending' as status")
                )
                ->with(['evaluatee' => fn ($evaluatee) =>
                    $evaluatee->select('id', 'last_name', 'first_name', 'middle_name', 'suffix')
                ])
                ->with(['evaluators' => fn ($evaluatee) =>
                    $evaluatee
                        ->join('users', 'evaluation_evaluators.evaluator_id', '=', 'users.id')
                        ->select(
                            'evaluation_evaluators.evaluator_id',
                            'evaluation_evaluators.response_id',
                            'users.last_name', 'users.first_name', 'users.middle_name', 'users.suffix',
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
                            'users.last_name', 'users.first_name', 'users.middle_name', 'users.suffix',
                            'evaluation_commentors.comment',
                            'evaluation_commentors.order',
                            'evaluation_commentors.signature_filepath'
                        )
                        ->orderBy('order')
                ])
                ->addSelect('evaluation_responses.form_id', 'users.user_name as creator_user_name')
                ->with(['form' => fn ($evaluationForm) =>
                    $evaluationForm
                        ->join('users', 'evaluation_forms.creator_id', '=', 'users.id')
                        ->select(
                            'evaluation_forms.id',
                            'evaluation_forms.name', 
                            'evaluation_forms.creator_id',
                            'users.user_name as creator_user_name'
                        )
                        ->with(['sections' => fn ($section) =>
                            $section
                                ->select('form_id', 'id', 'name', 'category', 'order')
                                ->whereNull('deleted_at')
                                ->with(['subcategories' => fn ($subcategory) =>
                                    $subcategory
                                        ->select(
                                            'section_id', 'id',
                                            'name', 'subcategory_type', 'description',
                                            'required', 'allow_other_option',
                                            'linear_scale_start', 'linear_scale_end', 'linear_scale_end_label', 'linear_scale_start_label',
                                            'order'
                                        )
                                        ->whereNull('deleted_at')
                                        ->with([
                                            'options' => fn ($option) =>
                                                $option
                                                    ->select(
                                                        'subcategory_id', 'id', 'label', 'score', 'order'
                                                    )
                                                    ->whereNull('deleted_at')
                                                    ->with([
                                                        'optionAnswer' => fn ($optionAnswer) =>
                                                            $optionAnswer
                                                                ->select('response_id', 'option_id')
                                                                ->whereNull('deleted_at')
                                                                ->where('response_id', $request->id)
                                                    ])
                                                    ->orderBy('order')
                                                    
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
                                                    ->whereNull('evaluation_percentage_answers.deleted_at')
                                                    ->where('response_id', $request->id)
                                            ,
                                            'textAnswer' => fn ($textAnswer) =>
                                                $textAnswer
                                                    ->select('response_id', 'subcategory_id', 'answer')
                                                    ->whereNull('deleted_at')
                                                    ->where('response_id', $request->id)
                                        ])
                                        ->orderBy('order')
                                ])
                                ->orderBy('order')
                        ])
                ])
                ->whereNull('evaluation_responses.deleted_at')
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
                    'middle_name' | 'suffix' | 'department_name' | 'branch_name' |
                    'status'                    // pending first -> finished last
                ,
                sort_order: 'asc' | 'desc' = 'asc'
            }[];
        */

        // outputs:
        /*
            evaluationResponses: {
                id, role, status, commentor_order,
                evaluators_unsigned_count, commentors_unsigned_count, commentors_signed_count,
                date, form_id, evaluatee_id,
                created_at, updated_at,
                form: { id, form_name },
                evaluatee: {
                    id, last_name, first_name, middle_name, suffix,
                    branch: { id, name },
                    department: { id, name }
                },
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

            $user = UsersModel::where('id', $userID)->first();

            if($request->page === null) $request->page = 1;
            if($request->limit === null) $request->limit = 10;
            if ($request->page < 1 || $request->limit < 1)
                return response()->json([
                    'status' => 400,
                    'message' => 'Invalid page or limit!'
                ]);
            
            $evaluateeResponses = $user
                ->evaluateeResponses()
                ->whereHas('form', function ($q) {
                    $q->whereNull('evaluation_responses.deleted_at');
                })
                ->select(
                    'id',
                    DB::raw("'Evaluatee' as role"),
                    DB::raw("
                        IF(ISNULL(evaluatee_signature_filepath), 'Pending', 'Done')
                        as status
                    "),
                    DB::raw('null as commentor_order')
                )
                ->withCount([
                    'evaluators as evaluators_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_signed_count' => function ($query) {
                        $query->whereNotNull('signature_filepath');
                    }
                ])
                ->addSelect(
                    DB::raw("date_format(evaluation_responses.created_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->whereNotNull('creator_signature_filepath')
                ->having('evaluators_unsigned_count', 0)
                ->having('commentors_unsigned_count', 0)
            ;
            $createdResponses = $user
                ->createdResponses()
                ->whereHas('form', function ($q) {
                    $q->whereNull('evaluation_responses.deleted_at');
                })
                ->select(
                    'id',
                    DB::raw("'Creator' as role"),
                    DB::raw("
                        IF(ISNULL(creator_signature_filepath), 'Pending', 'Done')
                        as status
                    "),
                    DB::raw('null as commentor_order')
                )
                ->withCount([
                    'evaluators as evaluators_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_signed_count' => function ($query) {
                        $query->whereNotNull('signature_filepath');
                    }
                ])
                ->addSelect(
                    DB::raw("date_format(evaluation_responses.created_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->having('evaluators_unsigned_count', 0)
                ->having('commentors_unsigned_count', 0)
            ;
            $evaluatorResponses = $user
                ->evaluatorResponses()
                ->whereHas('form', function ($q) {
                    $q->whereNull('evaluation_responses.deleted_at');
                })
                ->select(
                    'id',
                    DB::raw("'Evaluator' as role"),
                    DB::raw("
                        IF(ISNULL(signature_filepath), 'Pending', 'Done')
                        as status
                    "),
                    DB::raw('null as commentor_order')
                )
                ->withCount([
                    'evaluators as evaluators_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_signed_count' => function ($query) {
                        $query->whereNotNull('signature_filepath');
                    }
                ])
                ->addSelect(
                    DB::raw("date_format(evaluation_responses.created_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
            ;
            $commentorResponses = $user
                ->commentorResponses()
                ->whereHas('form', function ($q) {
                    $q->whereNull('evaluation_responses.deleted_at');
                })
                ->select(
                    'id',
                    DB::raw("'Commentor' as role"),
                    DB::raw("
                        IF(ISNULL(signature_filepath), 'Pending', 'Done')
                        as status
                    "),
                    'order as commentor_order'
                )
                ->withCount([
                    'evaluators as evaluators_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_unsigned_count' => function ($query) {
                        $query->whereNull('signature_filepath');
                    }
                ])
                ->withCount([
                    'commentors as commentors_signed_count' => function ($query) {
                        $query->whereNotNull('signature_filepath');
                    }
                ])
                ->addSelect(
                    DB::raw("date_format(evaluation_responses.created_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->having('evaluators_unsigned_count', 0)
                ->having('commentor_order', '<=', DB::raw('commentors_signed_count + 1'))
            ;
            $evaluationResponses = $evaluateeResponses
                ->union($createdResponses)
                ->union($evaluatorResponses)
                ->union($commentorResponses)
                ->with(['form' => function ($form) {
                    $form->select('id', 'name');
                    
                }])
                ->with(['evaluatee' => function ($form) {
                    $form
                        ->select(
                            'id', 'last_name', 'first_name', 'middle_name', 'suffix', 'branch_id', 'department_id'
                        )
                        
                        ->with(['branch' => function ($form) {
                            $form->select('id', 'name');
                            
                        }])
                        ->with(['department' => function ($form) {
                            $form->select('id', 'name');
                        }])
                    ;
                }])
                ->orderBy('created_at', 'desc')
            ;

            // searching code here

            // if($request->search) {
            //     $evaluationResponses = $evaluationResponses
            //         ->whereHas('form', function ($query) use ($request) {
            //             // $query->where('name', 'LIKE', "%$request->search%");
            //             $query->where(DB::raw('id'), '=', 2);
            //         })
            //     ;
            // }

                // $evaluationResponses = $evaluationResponses->where(function ($query) use ($request) {
                //     $query
                //         // ->whereHas(DB::raw('form.name'), 'LIKE', "%$request->search%")
                //         ->whereHas('form', function (Builder $query) {
                //             $query->where('name', 'like', "%$request->search%");
                //         })
                //         // ->orWhere(DB::raw("date_format(evaluation_responses.updated_at, '%b %d, %Y')"), 'LIKE', "%$request->search%")
                //         // ->orWhere(
                //         //     DB::raw('CONCAT(
                //         //         evaluatees.last_name, ", ",
                //         //         evaluatees.first_name,
                //         //         IF(ISNULL(evaluatees.middle_name), "", CONCAT(" ", evaluatees.middle_name)),
                //         //         IF(ISNULL(evaluatees.suffix), "", CONCAT(" ", evaluatees.suffix))
                //         //     )'),
                //         //     'LIKE', "%$request->search%"
                //         // )
                //         // ->orWhere('departments.name', 'LIKE', "%$request->search%")
                //         // ->orWhere('branches.name', 'LIKE', "%$request->search%")
                //     ;
                // });

            if ($request->form_id !== null)
                $evaluationResponses = $evaluationResponses->where('evaluation_responses.form_id', $request->form_id);

            // if ($request->order_by) foreach ($request->order_by as $index => $order_by_param) {
            //     $sortOrder = $order_by_param['sort_order'] ?? 'asc';
            //     if ($sortOrder != 'asc' && $sortOrder != 'desc')
            //         return response()->json([
            //             'status' => 400,
            //             'message' => 'Sort order is invalid!'
            //         ]);
            //     switch ($order_by_param['key']) {
            //         case 'branch_name':
            //             $evaluationResponses = $evaluationResponses->orderBy('branches.name', $sortOrder);
            //             break;
            //         case 'department_name':
            //             $evaluationResponses = $evaluationResponses->orderBy('departments.name', $sortOrder);
            //             break;
            //         case 'last_name':
            //             $evaluationResponses = $evaluationResponses->orderBy('evaluatees.last_name', $sortOrder);
            //             break;
            //         case 'first_name':
            //             $evaluationResponses = $evaluationResponses->orderBy('evaluatees.first_name', $sortOrder);
            //             break;
            //         case 'middle_name':
            //             $evaluationResponses = $evaluationResponses->orderBy('evaluatees.middle_name', $sortOrder);
            //             break;
            //         case 'suffix':
            //             $evaluationResponses = $evaluationResponses->orderBy('evaluatees.suffix', $sortOrder);
            //             break;
            //         case 'updated_at':
            //             $evaluationResponses = $evaluationResponses->orderBy('evaluation_responses.updated_at', $sortOrder);
            //             break;
            //         default:
            //             return response()->json([
            //                 'status' => 400,
            //                 'message' => 'Order by option is invalid!'
            //             ]);
            //     }
            // }

            $evaluationResponsesCollection = $evaluationResponses->get();

        // 2. Filter in PHP if searching
        if ($request->search) {
            $searchTerm = strtolower(trim($request->search));
            $evaluationResponsesCollection = $evaluationResponsesCollection->filter(function ($row) use ($searchTerm) {
                $formName = strtolower($row->form->name ?? '');
                $date = strtolower($row->date ?? '');
                $fullName = strtolower(trim(
                    ($row->evaluatee->last_name ?? '') . ', ' .
                    ($row->evaluatee->first_name ?? '') . ' ' .
                    ($row->evaluatee->middle_name ?? '') . ' ' .
                    ($row->evaluatee->suffix ?? '')
                ));
                $department = strtolower($row->evaluatee->department->name ?? '');
                $branch = strtolower($row->evaluatee->branch->name ?? '');
                $status = strtolower($row->status ?? '');

                return 
                    strpos($formName, $searchTerm) !== false ||
                    strpos($date, $searchTerm) !== false ||
                    strpos($fullName, $searchTerm) !== false ||
                    strpos($department, $searchTerm) !== false ||
                    strpos($branch, $searchTerm) !== false ||
                    strpos($status, $searchTerm) !== false;
            })->values();
        }
        

        $page = $request->page ?? 1;
        $limit = $request->limit ?? 10;
        $skip = ($page - 1) * $limit;

        // Use the filtered collection for pagination and counts
        $totalResponseCount = $evaluationResponsesCollection->count();
        $maxPageCount = ceil($totalResponseCount / $limit);
        $pageResponseCount = min($limit, $totalResponseCount - $skip);

        $evaluationResponses = $evaluationResponsesCollection
            ->slice($skip, $limit)
            ->values(); // Laravel collection

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
        // output:
        // { evaluationResponseID }

        log::info('EvaluationResponseController::saveEvaluationResponse');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

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

            // $conflictingEvaluationResponse = EvaluationResponse::where('evaluatee_id', $request->evaluatee_id)
            //     ->where('form_id', $request->form_id)
            //     ->where('period_start_at', '<', $request->period_end_at)
            //     ->where('period_end_at', '>', $request->period_start_at)
            //     ->first()
            // ;
            // if($conflictingEvaluationResponse) return response()->json([ 
            //     'status' => 400,
            //     'message' => 'This Evaluation is in conflict with another!',
            //     'conflictingEvaluationResponseID' => $conflictingEvaluationResponse->id
            // ]);

            $conflictingEvaluationResponse = EvaluationResponse::where('evaluatee_id', $request->evaluatee_id)
                ->where('form_id', $request->form_id)
                ->where('period_start_at', '=', $request->period_start_at)
                ->where('period_end_at', '=', $request->period_end_at)
                ->first();
            if($conflictingEvaluationResponse) return response()->json([ 
                'status' => 400,
                'message' => 'This Evaluation is in conflict with another!',
                'conflictingEvaluationResponseID' => $conflictingEvaluationResponse->id
            ]);

            $newEvaluationResponse = EvaluationResponse::create([
                'evaluatee_id' => $request->evaluatee_id,
                'form_id' => $request->form_id,
                'creator_id' => $userID,
                'period_start_at' => $request->period_start_at,
                'period_end_at' => $request->period_end_at
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

    public function deleteEvaluationEvaluator(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            evaluator_id: number
        */

        // returns:
        /*
            evaluationEvaluator: {
                response_id, evaluator_id, comment, order, signature_filepath, created_at,
                updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::deleteEvaluationEvaluator');

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

            $evaluationEvaluator = EvaluationEvaluator
                ::select()
                ->where('response_id', $request->response_id)
                ->where('evaluator_id', $request->evaluator_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if( !$evaluationEvaluator ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Evaluator not found!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluatorID' => $request->evaluator_id
            ]);

            if( $evaluationEvaluator->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Evaluator already deleted!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluatorID' => $request->evaluator_id
            ]);

            $now = date('Y-m-d H:i');
            $evaluationEvaluator->deleted_at = $now;
            $evaluationEvaluator->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'message' => 'Evaluation Evaluator successfully deleted',
                'evaluationEvaluator' => $evaluationEvaluator
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationEvaluator(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            evaluator_id: number,
            comment?: string,
            signature_filepath?: string
        */

        // returns:
        /*
            evaluationEvaluator: {
                response_id, evaluator_id, comment, order, signature_filepath, created_at, updated_at
            }
        */

        log::info('EvaluationResponseController::editEvaluationEvaluator');

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

            $evaluationEvaluator = EvaluationEvaluator
                ::select(
                    'response_id', 'evaluator_id', 'comment', 'order', 'signature_filepath',
                    'created_at', 'updated_at'
                )
                ->where('response_id', $request->response_id)
                ->where('evaluator_id', $request->evaluator_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationEvaluator) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Evaluator not found!',
                'evaluationEvaluatorID' => $request->evaluator_id
            ]);

            if($request->comment !== null)
                $evaluationEvaluator->comment = $request->comment;
            if($request->signature_filepath !== null)
                $evaluationEvaluator->signature_filepath = $request->signature_filepath;
            // $request->signature_filepath = $_POST['signature_filepath'];
            // $request->signature_filepath = str_replace('data:image/png;base64,', '', $request->signature_filepath);
            // $request->signature_filepath = str_replace(' ', '+', $request->signature_filepath);
            // echo $request->signature_filepath;
            // $request->signature_filepath = base64_decode($request->signature_filepath);
            $saved = $request->hasFile('signature_filepath');
            if ($request->hasFile('signature_filepath')) {
			    $evaluationEvaluator->clearMediaCollection('signatures');
                $evaluationEvaluator->addMediaFromRequest('signature_filepath')->toMediaCollection('signatures');
            }
            $evaluationEvaluator->save();

            DB::commit();

            return response()->json([
                'status' => 200,
                'evaluationEvaluator' => $evaluationEvaluator,
                'message' => 'Evaluation Evaluator successfully updated',
                'saved' => $saved
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationEvaluator(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            evaluator_id: number,
        */

        // returns:
        /*
            evaluationEvaluator: {
                response_id, evaluator_id, last_name, first_name, middle_name, suffix,
                comment, order, signature_filepath, created_at, updated_at
            }
        */

        log::info('EvaluationResponseController::getEvaluationEvaluator');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationEvaluator = EvaluationEvaluator
                ::join('users', 'users.id', '=', 'evaluation_evaluators.evaluator_id')
                ->select(
                    'evaluation_evaluators.response_id',
                    'evaluation_evaluators.evaluator_id',
                    'evaluation_evaluators.comment',
                    'evaluation_evaluators.order',
                    'evaluation_evaluators.signature_filepath',
                    'users.last_name',
                    'users.first_name',
                    'users.middle_name',
                    'users.suffix'
                )
                ->where('evaluation_evaluators.response_id', $request->response_id)
                ->where('evaluation_evaluators.evaluator_id', $request->evaluator_id)
                ->whereNull('evaluation_evaluators.deleted_at')
                ->first()
            ;
            if( !$evaluationEvaluator ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Evaluator not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Evaluator successfully retrieved.',
                'evaluationEvaluator' => $evaluationEvaluator
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationEvaluators(Request $request)
    {
        // inputs:
        /*
            response_id: number
        */

        // returns:
        /*
            evaluationEvaluators: {
                response_id, evaluator_id, last_name, first_name, middle_name, suffix
            }[]
        */

        log::info('EvaluationResponseController::getEvaluationEvaluators');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationEvaluators = EvaluationEvaluator
                ::join('users', 'users.id', '=', 'evaluation_evaluators.evaluator_id')
                ->select(
                    'evaluation_evaluators.response_id',
                    'evaluation_evaluators.evaluator_id',
                    'users.last_name',
                    'users.first_name',
                    'users.middle_name',
                    'users.suffix'
                )
                ->where('evaluation_evaluators.response_id', $request->response_id)
                ->whereNull('evaluation_evaluators.deleted_at')
                ->get()
            ;
            if( !$evaluationEvaluators ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Evaluators not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Evaluators successfully retrieved.',
                'evaluationEvaluators' => $evaluationEvaluators
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationEvaluator(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            evaluator_id: number
        */

        // returns:
        /*
            evaluationEvaluatorID
        */

        log::info('EvaluationResponseController::saveEvaluationEvaluator');

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

            $evaluationResponse = EvaluationResponse
                ::where('id', $request->response_id)
                ->first()
            ;
            if(!$evaluationResponse) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Response not found!',
                'evaluationResponseID' => $request->response_id
            ]);
            if($evaluationResponse->evaluatee_id === $request->evaluator_id) return response()->json([ 
                'status' => 400,
                'message' => 'This user has already been assigned as the evaluatee here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluateeID' => $request->evaluator_id
            ]);
            
            $existingFormEvaluator = EvaluationEvaluator
                ::where('response_id', $request->response_id)
                ->where('evaluator_id', $request->evaluator_id)
                ->first()
            ;
            if($existingFormEvaluator) return response()->json([
                'status' => 409,
                'message' => 'This user has already been assigned as an evaluator here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluatorID' => $request->evaluator_id
            ]);

            $existingFormCommentor = EvaluationCommentor
                ::where('response_id', $request->response_id)
                ->where('commentor_id', $request->evaluator_id)
                ->first()
            ;
            if($existingFormCommentor) return response()->json([
                'status' => 409,
                'message' => 'This user has already been assigned as an commentor here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationCommentorID' => $request->evaluator_id
            ]);

            DB::beginTransaction();

            $order = (
                EvaluationEvaluator::where('response_id', $request->response_id)->max('order')
                ?? 0
            ) + 1;

            $newEvaluationEvaluator = EvaluationEvaluator::create([
                'response_id' => $request->response_id,
                'evaluator_id' => $request->evaluator_id,
                'order' => $order
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'message' => 'Evaluation Evaluator successfully created',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluatorID' => $request->evaluator_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation commentor

    public function deleteEvaluationCommentor(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            commentor_id: number
        */

        // returns:
        /*
            evaluationCommentor: {
                response_id, commentor_id, comment, order, signature_filepath, created_at,
                updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::deleteEvaluationCommentor');

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

            $evaluationCommentor = EvaluationCommentor
                ::select()
                ->where('response_id', $request->response_id)
                ->where('commentor_id', $request->commentor_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if( !$evaluationCommentor ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Commentor not found!',
                'evaluationResponseID' => $request->response_id,
                'evaluationCommentorID' => $request->commentor_id
            ]);

            if( $evaluationCommentor->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Commentor already deleted!',
                'evaluationResponseID' => $request->response_id,
                'evaluationCommentorID' => $request->commentor_id
            ]);

            $now = date('Y-m-d H:i');
            $evaluationCommentor->deleted_at = $now;
            $evaluationCommentor->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'message' => 'Evaluation Commentor successfully deleted',
                'evaluationCommentor' => $evaluationCommentor
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationCommentor(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            commentor_id: number,
            comment?: string,
            signature_filepath?: string
        */

        // returns:
        /*
            evaluationCommentor: {
                response_id, commentor_id, comment, order, signature_filepath, created_at, updated_at
            }
        */

        log::info('EvaluationResponseController::editEvaluationCommentor');

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

            $evaluationCommentor = EvaluationCommentor
                ::select(
                    'response_id', 'commentor_id', 'comment', 'order', 'signature_filepath',
                    'created_at', 'updated_at'
                )
                ->where('response_id', $request->response_id)
                ->where('commentor_id', $request->commentor_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationCommentor) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Commentor not found!',
                'evaluationCommentorID' => $request->commentor_id
            ]);

            if($request->comment !== null)
                $evaluationCommentor->comment = $request->comment;
            if($request->signature_filepath !== null)
                $evaluationCommentor->signature_filepath = $request->signature_filepath;
            $evaluationCommentor->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationCommentor' => $evaluationCommentor,
                'message' => 'Evaluation Commentor successfully updated'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationCommentor(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            commentor_id: number,
        */

        // returns:
        /*
            evaluationCommentor: {
                response_id, commentor_id, last_name, first_name, middle_name, suffix,
                comment, order, signature_filepath, created_at, updated_at
            }
        */

        log::info('EvaluationResponseController::getEvaluationCommentor');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationCommentor = EvaluationCommentor
                ::join('users', 'users.id', '=', 'evaluation_commentors.commentor_id')
                ->select(
                    'evaluation_commentors.response_id',
                    'evaluation_commentors.commentor_id',
                    'evaluation_commentors.comment',
                    'evaluation_commentors.order',
                    'evaluation_commentors.signature_filepath',
                    'users.last_name',
                    'users.first_name',
                    'users.middle_name',
                    'users.suffix'
                )
                ->where('evaluation_commentors.response_id', $request->response_id)
                ->where('evaluation_commentors.commentor_id', $request->commentor_id)
                ->whereNull('evaluation_commentors.deleted_at')
                ->first()
            ;
            if( !$evaluationCommentor ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Commentor not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Commentor successfully retrieved.',
                'evaluationCommentor' => $evaluationCommentor
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationCommentors(Request $request)
    {
        // inputs:
        /*
            response_id: number
        */

        // returns:
        /*
            evaluationCommentors: {
                response_id, commentor_id, last_name, first_name, middle_name, suffix
            }[]
        */

        log::info('EvaluationResponseController::getEvaluationCommentors');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationCommentors = EvaluationCommentor
                ::join('users', 'users.id', '=', 'evaluation_commentors.commentor_id')
                ->select(
                    'evaluation_commentors.response_id',
                    'evaluation_commentors.commentor_id',
                    'users.last_name',
                    'users.first_name',
                    'users.middle_name',
                    'users.suffix'
                )
                ->where('evaluation_commentors.response_id', $request->response_id)
                ->whereNull('evaluation_commentors.deleted_at')
                ->get()
            ;
            if( !$evaluationCommentors ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Commentors not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Commentors successfully retrieved.',
                'evaluationCommentors' => $evaluationCommentors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationCommentor(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            commentor_id: number
        */

        // returns:
        /*
            evaluationCommentorID
        */

        log::info('EvaluationResponseController::saveEvaluationCommentor');

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

            $evaluationResponse = EvaluationResponse
                ::where('id', $request->response_id)
                ->first()
            ;
            if(!$evaluationResponse) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Response not found!',
                'evaluationResponseID' => $request->response_id
            ]);
            if($evaluationResponse->evaluatee_id === $request->commentor_id) return response()->json([ 
                'status' => 400,
                'message' => 'This user has already been assigned as the evaluatee here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluateeID' => $request->commentor_id
            ]);
            
            $existingFormCommentor = EvaluationCommentor
                ::where('response_id', $request->response_id)
                ->where('commentor_id', $request->commentor_id)
                ->first()
            ;
            if($existingFormCommentor) return response()->json([
                'status' => 409,
                'message' => 'This user has already been assigned as an commentor here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationCommentorID' => $request->commentor_id
            ]);

            $existingFormEvaluator = EvaluationEvaluator
                ::where('response_id', $request->response_id)
                ->where('evaluator_id', $request->commentor_id)
                ->first()
            ;
            if($existingFormEvaluator) return response()->json([
                'status' => 409,
                'message' => 'This user has already been assigned as an commentor here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluatorID' => $request->commentor_id
            ]);

            DB::beginTransaction();

            $order = (
                EvaluationCommentor::where('response_id', $request->response_id)->max('order')
                ?? 0
            ) + 1;

            $newEvaluationCommentor = EvaluationCommentor::create([
                'response_id' => $request->response_id,
                'commentor_id' => $request->commentor_id,
                'order' => $order
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'message' => 'Evaluation Commentor successfully created',
                'evaluationResponseID' => $request->response_id,
                'evaluationCommentorID' => $request->commentor_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation form percentage answer

    public function deleteEvaluationPercentageAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            subcategory_id: number
        */

        // returns:
        /*
            evaluationPercentageAnswer: {
                response_id, subcategory_id, percentage, created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::deleteEvaluationPercentageAnswer');

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
                ::select()
                ->where('response_id', $request->response_id)
                ->where('subcategory_id', $request->subcategory_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if( !$evaluationPercentageAnswer ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Percentage Answer not found!',
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryID' => $request->subcategory_id
            ]);

            if( $evaluationPercentageAnswer->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Percentage Answer already deleted!',
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryID' => $request->subcategory_id
            ]);

            $now = date('Y-m-d H:i');
            $evaluationPercentageAnswer->deleted_at = $now;
            $evaluationPercentageAnswer->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'message' => 'Evaluation Percentage Answer successfully deleted',
                'evaluationPercentageAnswer' => $evaluationPercentageAnswer
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

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
                ->whereNull('evaluation_percentage_answers.deleted_at')
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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

        log::info('EvaluationResponseController::deleteEvaluationTextAnswer');

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
                ->whereNull('deleted_at')
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
                'evaluationTextAnswer' => $evaluationTextAnswer
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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
                ->whereNull('deleted_at')
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

    public function deleteEvaluationOptionAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            option_id: number
        */

        // returns:
        /*
            evaluationOptionAnswer: {
                response_id, option_id,
                created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationOptionAnswerController::deleteEvaluationOptionAnswer');

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

            $evaluationOptionAnswer = EvaluationOptionAnswer
                ::select()
                ->where('response_id', $request->response_id)
                ->where('option_id', $request->option_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if( !$evaluationOptionAnswer ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Option Answer not found!',
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryOptionID' => $request->option_id
            ]);

            if( $evaluationOptionAnswer->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Option Answer already deleted!',
                'evaluationOptionAnswer' => $evaluationOptionAnswer
            ]);

            $now = date('Y-m-d H:i');
            $evaluationOptionAnswer->deleted_at = $now;
            $evaluationOptionAnswer->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationOptionAnswer' => $evaluationOptionAnswer,
                'message' => 'Evaluation Option Answer successfully deleted'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationOptionAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: number,
            option_id: number,
            new_option_id: number
        */

        // returns:
        /*
            evaluationOptionAnswer: {
                response_id, option_id, created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationResponseController::editEvaluationOptionAnswer');

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

            $evaluationOptionAnswer = EvaluationOptionAnswer
                ::select()
                ->where('response_id', $request->response_id)
                ->where('option_id', $request->option_id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationOptionAnswer) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Option Answer not found!',
                'evaluationFormResponseID' => $request->response_id,
                'evaluationFormOptionID' => $request->option_id
            ]);

            $evaluationFormSubcategory = EvaluationFormSubcategoryOption
                ::join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                ->select('evaluation_form_subcategories.id', 'evaluation_form_subcategories.subcategory_type')
                ->whereNull('evaluation_form_subcategory_options.deleted_at')
                ->first()
            ;

            switch($evaluationFormSubcategory->subcategory_type) {
                case "linear_scale":
                case "long_answer":
                case "short_answer":
                    return response()->json([
                        'status' => 400,
                        'message' => 'This subcategory does not accept choice answers!',
                        'evaluationFormSubcategoryID' => $evaluationFormSubcategory->id
                    ]);
                    break;
                case "checkbox":
                case "multiple_choice":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::select('response_id', 'option_id')
                        ->where('response_id', '=', $request->response_id)
                        ->where('option_id', '=', $request->new_option_id)
                        ->whereNull('deleted_at')
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'The same option answer was already created for this subcategory!',
                        'evaluationResponseID' => $request->response_id,
                        'evaluationFormSubcategoryOptionID' => $request->option_id
                    ]);
                    break;
            }

            $evaluationOptionAnswer->option_id  = $request->new_option_id;
            $evaluationOptionAnswer->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationOptionAnswer' => $evaluationOptionAnswer,
                'message' => 'Evaluation Option Answer successfully updated'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

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
                ->whereNull('deleted_at')
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
                    'evaluation_option_answers.response_id',
                    'evaluation_form_subcategories.id as subcategory_id',
                    'evaluation_option_answers.option_id',
                    'evaluation_option_answers.created_at', 'evaluation_option_answers.updated_at'
                )
                ->whereNull('evaluation_option_answers.deleted_at')
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
                )
                ->whereNull('evaluation_option_answers.deleted_at')
            ;

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
                ->whereNull('evaluation_form_subcategory_options.deleted_at')
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
                        ->select('evaluation_option_answers.option_id')
                        ->where('evaluation_option_answers.option_id', '=', $request->option_id)
                        ->where('evaluation_option_answers.response_id', '=', $request->response_id)
                        ->where('evaluation_form_subcategories.id', '=', $subcategory->id)
                        ->whereNull('evaluation_option_answers.deleted_at')
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'The same option answer was already created for this subcategory!',
                        'evaluationResponseID' =>  $request->response_id,
                        'evaluationOptionID' => $existingOptionAnswer->option_id
                    ]);
                    break;
                case "multiple_choice":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                        ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                        ->select('evaluation_option_answers.option_id')
                        ->where('evaluation_option_answers.response_id', '=', $request->response_id)
                        ->where('evaluation_form_subcategories.id', '=', $subcategory->id)
                        ->whereNull('evaluation_option_answers.deleted_at')
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'An option answer was already created for this subcategory!',
                        'evaluationResponseID' =>  $request->response_id,
                        'evaluationOptionID' => $existingOptionAnswer->option_id
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
