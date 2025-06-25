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

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            'commentors' => $commentors->map(function ($evaluatee) {
                return [
                    'id' => Crypt::encrypt($evaluatee->id),
                    'user_name' => $evaluatee->user_name,
                    'last_name' => $evaluatee->last_name,
                    'first_name' => $evaluatee->first_name,
                    'middle_name' => $evaluatee->middle_name,
                    'suffix' => $evaluatee->suffix
                ];
            })
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
            'evaluatees' => $evaluatees->map(function ($evaluatee) {
                return [
                    'id' => Crypt::encrypt($evaluatee->id),
                    'user_name' => $evaluatee->user_name,
                    'last_name' => $evaluatee->last_name,
                    'first_name' => $evaluatee->first_name,
                    'middle_name' => $evaluatee->middle_name,
                    'suffix' => $evaluatee->suffix
                ];
            })
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
            'evaluators' => $evaluators->map(function ($evaluator) {
                return [
                    'id' => Crypt::encrypt($evaluator->id),
                    'user_name' => $evaluator->user_name,
                    'last_name' => $evaluator->last_name,
                    'first_name' => $evaluator->first_name,
                    'middle_name' => $evaluator->middle_name,
                    'suffix' => $evaluator->suffix
                ];
            })
        ]);
    }

    // evaluation response
 
    public function deleteEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            id: string
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

            $evaluationResponse = EvaluationResponse::find(Crypt::decrypt($request->id));

            if (!$evaluationResponse) {
                return response()->json([ 
                    'status' => 404,
                    'message' => 'Evaluation Response not found!',
                    'evaluationResponseID' => $request->id
                ]);
            }

            $evaluationResponse->deleted_at = now();
            $evaluationResponse->save();

            DB::commit();

            return response()->json([
                'status' => 200,
                'evaluationResponse' => $evaluationResponse ? [
                    'id' => Crypt::encrypt($evaluationResponse->id),
                    'creator_id' => Crypt::encrypt($evaluationResponse->creator_id),
                    'updated_at' => $evaluationResponse->updated_at,
                    'created_at' => $evaluationResponse->created_at,
                    'evaluatee_id' => Crypt::encrypt($evaluationResponse->evaluatee_id),
                    'form_id' => Crypt::encrypt($evaluationResponse->form_id),
                    'evaluatee_opened_at' => $evaluationResponse->evaluatee_opened_at,
                    'creator_signature_filepath' => $evaluationResponse->creator_signature_filepath,
                    'evaluatee_signature_filepath' => $evaluationResponse->evaluatee_signature_filepath,
                    'period_start_at' => $evaluationResponse->period_start_at,
                    'period_end_at' => $evaluationResponse->period_end_at,
                    'deleted_at' => $evaluationResponse->deleted_at
                ] : null,
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
            id: string,
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

            $request->id = Crypt::decrypt($request->id);
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
            $request->period_start_at = date('Y-m-d H:i:s', $periodStartAtSec - $periodStartAtSec % 86400 - 28800);
            $request->period_end_at = date('Y-m-d H:i:s', $periodEndAtSec - $periodEndAtSec % 86400 + 57600);
            if ($periodStartAtSec > $periodEndAtSec) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Period Start Date cannot be more than Period End Date!'
                ]);
            }

            // $conflictingEvaluationResponse = EvaluationResponse
            //     ::where('evaluatee_id', $request->evaluatee_id ?? $evaluationResponse->evaluatee_id)
            //     ->where('form_id', $request->form_id ?? $evaluationResponse->form_id)
            //     ->where('id', '!=', $request->id)
            //     ->where('period_start_at', '<', $request->period_end_at ?? $evaluationResponse->period_end_at)
            //     ->where('period_end_at', '>', $request->period_start_at ?? $evaluationResponse->period_start_at)
            //     ->first()
            // ;
            // if($conflictingEvaluationResponse) {
            //     $conflictionPeriodStart = date_format($conflictingEvaluationResponse->period_start_at, '%b %d, %Y');
            //     $conflictionPeriodEnd = date_format($conflictingEvaluationResponse->period_end_at, '%b %d, %Y');
            //     return response()->json([ 
            //         'status' => 400,
            //         'message' => "This Evaluation is in conflict with another from $conflictionPeriodStart to $conflictionPeriodEnd!",
            //         'conflictingEvaluationResponseID' => $conflictingEvaluationResponse->id
            //     ]);
            // }

            if($request->evaluatee_id !== null)
                $evaluationResponse->evaluatee_id = Crypt::decrypt($request->evaluatee_id);
            if($request->form_id !== null)
                $evaluationResponse->form_id = Crypt::decrypt($request->form_id);
            $evaluationResponse->period_end_at = $request->period_end_at;
            $evaluationResponse->period_start_at = $request->period_start_at;
            
            if ($request->hasFile('evaluatee_signature_filepath')) {
                $evaluationResponse->clearMediaCollection('evaluatee_signatures');
                $evaluationResponse
                    ->addMedia($request->file('evaluatee_signature_filepath'))
                    ->toMediaCollection('evaluatee_signatures')
                ;
            } else if($request->evaluatee_signature_filepath != null) return response()->json([ 
                'status' => 400,
                'message' => 'Invalid evaluatee signature data!',
                'evaluationResponseID' => $request->id
            ]);
            if ($request->hasFile('creator_signature_filepath')) {
                $evaluationResponse->clearMediaCollection('creator_signatures');
                $evaluationResponse
                    ->addMedia($request->file('creator_signature_filepath'))
                    ->toMediaCollection('creator_signatures')
                ;
            } else if($request->creator_signature_filepath != null) return response()->json([ 
                'status' => 400,
                'message' => 'Invalid creator signature data!',
                'evaluationResponseID' => $request->id
            ]);
            $evaluationResponse->save();

            $evaluateeSignature = $evaluationResponse->getFirstMedia('evaluatee_signatures');
            if($evaluateeSignature)
                $evaluationResponse->evaluatee_signature_filepath = $evaluateeSignature->getPath();
            $creatorSignature = $evaluationResponse->getFirstMedia('creator_signatures');
            if($creatorSignature)
                $evaluationResponse->creator_signature_filepath = $creatorSignature->getPath();
            if($evaluateeSignature || $creatorSignature) $evaluationResponse->save();

            DB::commit();

            return response()->json([
                'status' => 201,
                'message' => 'Evaluation Response successfully updated',
                'evaluationResponse' => $evaluationResponse ? [
                    'id' => Crypt::encrypt($evaluationResponse->id),
                    'evaluatee_id' => Crypt::encrypt($evaluationResponse->evaluatee_id),
                    'form_id' => Crypt::encrypt($evaluationResponse->form_id),
                    'period_start_at' => $evaluationResponse->period_start_at,
                    'period_end_at' => $evaluationResponse->period_end_at,
                    'creator_signature_filepath' => $evaluationResponse->creator_signature_filepath,
                    'evaluatee_signature_filepath' => $evaluationResponse->evaluatee_signature_filepath,
                    'created_at' => $evaluationResponse->created_at,
                    'updated_at' => $evaluationResponse->updated_at,
                    'media' => $evaluationResponse->media->map(function ($media) {
                        return [
                            'id' => Crypt::encrypt($media->id),
                            'created_at' => $media->created_at,
                            'updated_at' => $media->updated_at
                        ];
                    })
                ] : null
            ]);
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
            id: string
        */

        // returns:
        /*
            evaluationResponse: {
                id, role, evaluatee_id, creator_id,
                period_start_date, period_end_date, evaluatee_opened_at,
                created_at, updated_at,
                evaluatee: { id, response_id, last_name, first_name, middle_name, suffix },
                evaluatee_signature, evaluatee_signature_filepath
                creator_signature, creator_signature_filepath,
                evaluators: {
                    evaluator_id, response_id, last_name, first_name, middle_name, suffix,
                    comment, order, evalator_signature, signature_filepath
                }[],
                commentors: {
                    commentor_id, response_id, last_name, first_name, middle_name, suffix,
                    comment, order, commentor_signature, signature_filepath
                }[],
                form_id, creator_user_name, form: {
                    id, name, creator_id, creator_user_name,
                    sections: {
                        form_id, id, name, category, order, score, achieved_score,
                        subcategories: {
                            section_id, id, name, subcategory_type, description, required,
                            allow_other_option, linear_scale_start, linear_scale_end, order,
                            score, achieved_score,
                            options: {
                                subcategory_id, id, label, order,
                                option_answer: { id, response_id, option_id },
                                option_answer_count
                            }[],
                            percentage_answer: { id, response_id, subcategory_id, percentage, value, linear_scale_index } | null,
                            text_answer: { id, response_id, subcategory_id, answer } | null
                        }[]
                    }[]
                }
            }
            
        */

        log::info('EvaluationResponseController::getEvaluationResponse');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        if($user === null) return response()->json([ 
            'status' => 403,
            'message' => 'Unauthorized access!'
        ]);

        try {

            // 1. Fetching response raw details
            $request->id = Crypt::decrypt($request->id);
            $evaluationResponse = EvaluationResponse
                ::join('evaluation_forms', 'evaluation_forms.id', '=', 'evaluation_responses.form_id')
                ->join('users', 'users.id', '=', 'evaluation_forms.creator_id')
                ->select('evaluation_responses.id', 'evaluation_responses.evaluatee_id', 'evaluation_responses.creator_id')
                ->selectRaw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as period_start_date")
                ->selectRaw("date_format(evaluation_responses.period_end_at, '%b %d, %Y') as period_end_date")
                ->addSelect(
                    'evaluation_responses.creator_signature_filepath',
                    'evaluation_responses.evaluatee_signature_filepath',
                    'evaluation_responses.evaluatee_opened_at',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->with(['evaluatee' => fn ($evaluatee) =>
                    $evaluatee->select('id', 'last_name', 'first_name', 'middle_name', 'suffix')
                ])
                ->with(['evaluators' => fn ($evaluator) =>
                    $evaluator
                        ->join('users', 'evaluation_evaluators.evaluator_id', '=', 'users.id')
                        ->select(
                            'evaluation_evaluators.evaluator_id',
                            'evaluation_evaluators.response_id',
                            'users.last_name', 'users.first_name', 'users.middle_name', 'users.suffix',
                            'evaluation_evaluators.comment',
                            'evaluation_evaluators.order',
                            'evaluation_evaluators.opened_at',
                            'evaluation_evaluators.signature_filepath',
                            'evaluation_evaluators.updated_at'
                        )
                        ->orderBy('order')
                ])
                ->with(['commentors' => fn ($commentor) =>
                    $commentor
                        ->join('users', 'evaluation_commentors.commentor_id', '=', 'users.id')
                        ->select(
                            'evaluation_commentors.id',
                            'evaluation_commentors.commentor_id',
                            'evaluation_commentors.response_id',
                            'users.last_name', 'users.first_name', 'users.middle_name', 'users.suffix',
                            'evaluation_commentors.comment',
                            'evaluation_commentors.order',
                            'evaluation_commentors.opened_at',
                            'evaluation_commentors.signature_filepath',
                            'evaluation_commentors.updated_at'
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
                                ->select('form_id', 'id', 'name', 'category', 'order', 'score')
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
                                                        'subcategory_id', 'id', 'label', 'score', 'order', 'description'
                                                    )
                                                    ->whereNull('deleted_at')
                                                    ->with([
                                                        'optionAnswer' => fn ($optionAnswer) =>
                                                            $optionAnswer
                                                                ->select('id', 'response_id', 'option_id')
                                                                ->whereNull('deleted_at')
                                                                ->where('response_id', $request->id)
                                                    ])
                                                    ->withCount([
                                                        'optionAnswer' => fn ($optionAnswer) =>
                                                            $optionAnswer
                                                                ->whereNull('deleted_at')
                                                                ->where('response_id', $request->id)
                                                    ])
                                                    ->orderBy('order')
                                            ,
                                            'percentageAnswer' => fn ($percentageAnswer) =>
                                                $percentageAnswer
                                                    ->join('evaluation_form_subcategories', 'evaluation_percentage_answers.subcategory_id', '=', 'evaluation_form_subcategories.id')
                                                    ->select(
                                                        'evaluation_percentage_answers.id',
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
                                                    ->select('id', 'response_id', 'subcategory_id', 'answer')
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
            // 2. Fetching signatures and role
            $role = (
                $evaluationResponse->evaluatee_id == $userID ? 'Evaluatee'
                : ( $evaluationResponse->creator_id == $userID ? 'Creator'
                : null
            ));
            $evaluateeSignature = $evaluationResponse->getFirstMedia('evaluatee_signatures');
            $evaluationResponse->evaluatee_signature = (
                $evaluateeSignature ? base64_encode(file_get_contents($evaluateeSignature->getPath()))
                : null
            );
            $creatorSignature = $evaluationResponse->getFirstMedia('creator_signatures');
            $evaluationResponse->creator_signature = (
                $creatorSignature ? base64_encode(file_get_contents($creatorSignature->getPath()))
                : null
            );
            foreach ($evaluationResponse->evaluators as $index => $evaluator) {
                $evaluatorSignature = $evaluator
                    ->where('evaluator_id', $evaluator->evaluator_id)
                    ->where('response_id', $request->id)
                    ->first()
                    ->getFirstMedia('signatures')
                ;
                $evaluator->media = $evaluatorSignature ? [$evaluatorSignature] : [];
                $evaluator->evaluator_signature = (
                    $evaluatorSignature ? base64_encode(file_get_contents($evaluatorSignature->getPath()))
                    : null
                );
                if($evaluator->evaluator_id === $userID) $role = 'Evaluator';
            }
            foreach ($evaluationResponse->commentors as $index => $commentor) {
                $commentorSignature = $commentor
                    ->where('commentor_id', $commentor->commentor_id)
                    ->where('response_id', $request->id)
                    ->first()
                    ->getFirstMedia('signatures')
                ;
                $commentor->media = $commentorSignature ? [$commentorSignature] : [];
                $commentor->commentor_signature = (
                    $commentorSignature ? base64_encode(file_get_contents($commentorSignature->getPath()))
                    : null
                );
                if($commentor->commentor_id === $userID) $role = 'Commentor';
            }
            if(!$role) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);
            $evaluationResponse->role = $role;
            // 3. Calculating scores
            foreach($evaluationResponse->form->sections as $index => $section) {
                $maxSectionScore = 0;
                $achievedSectionScore = 0;
                foreach($section->subcategories as $index => $subcategory) {
                    $maxSubcategoryScore = 0;
                    $achievedSubcategoryScore = 0;
                    switch($subcategory->subcategory_type) {
                        case 'linear_scale':
                        case 'multiple_choice':
                            foreach($subcategory->options as $index => $option) {
                                if($option->score > $maxSubcategoryScore)
                                    $maxSubcategoryScore = $option->score;
                                if($option->option_answer_count)
                                    $achievedSubcategoryScore += $option->score;
                            }
                            break;
                        case 'checkbox':
                            foreach($subcategory->options as $index => $option) {
                                $maxSubcategoryScore += $option->score;
                                if($option['option_answer'])
                                    $achievedSubcategoryScore += $option->score;
                            }
                    }
                    $subcategory->score = $maxSubcategoryScore;
                    $subcategory->achieved_score = $achievedSubcategoryScore;
                    $maxSectionScore += $maxSubcategoryScore;
                    $achievedSectionScore += $achievedSubcategoryScore;
                }
                $section->achieved_score = (
                    $maxSectionScore > 0 ? $achievedSectionScore * $section->score / $maxSectionScore
                    : 0
                );
            }
            // 4. Updating opened at timestamp
            DB::beginTransaction();
            $now = date('Y-m-d H:i');
            switch($role) {
                case 'Evaluator':
                    $evaluationEvaluator = EvaluationEvaluator
                        ::where('response_id', $request->id)
                        ->where('evaluator_id', $userID)
                        ->first()
                    ;
                    $evaluationEvaluator->opened_at = $now;
                    $evaluationEvaluator->save();
                    $evaluationResponse->evaluators->where('evaluator_id', $userID)->first()->opened_at = $now;
                    break;
                case 'Commentor':
                    $evaluationCommentor = EvaluationCommentor
                        ::where('response_id', $request->id)
                        ->where('commentor_id', $userID)
                        ->first()
                    ;
                    $evaluationCommentor->opened_at = $now;
                    $evaluationCommentor->save();
                    $evaluationResponse->commentors->where('commentor_id', $userID)->first()->opened_at = $now;
                    break;
                case 'Creator': break;
                case 'Evaluatee':
                    $evaluationResponseEdit = EvaluationResponse::where('id', $request->id)->first();
                    $evaluationResponseEdit->evaluatee_opened_at = $now;
                    $evaluationResponseEdit->save();
                    $evaluationResponse->evaluatee_opened_at = $now;
            }
            DB::commit();

            $encryptedUserID = Crypt::encrypt($userID);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Response successfully retrieved.',
                'userID' => $encryptedUserID,
                'evaluationResponse' => $evaluationResponse ? [
                    'id' => Crypt::encrypt($evaluationResponse->id),
                    'evaluatee_id' => Crypt::encrypt($evaluationResponse->evaluatee_id),
                    'creator_id' => Crypt::encrypt($evaluationResponse->creator_id),
                    'period_start_date' => $evaluationResponse->period_start_date,
                    'period_end_date' => $evaluationResponse->period_end_date,
                    'creator_signature_filepath' => $evaluationResponse->creator_signature_filepath,
                    'evaluatee_signature_filepath' => $evaluationResponse->evaluatee_signature_filepath,
                    'evaluatee_opened_at' => $evaluationResponse->evaluatee_opened_at,
                    'created_at' => $evaluationResponse->created_at,
                    'updated_at' => $evaluationResponse->updated_at,
                    'form_id' => Crypt::encrypt($evaluationResponse->form_id),
                    'creator_user_name' => $evaluationResponse->creator_user_name,
                    'evaluatee_signature' => $evaluationResponse->evaluatee_signature,
                    'creator_signature' => $evaluationResponse->creator_signature,
                    'role' => $evaluationResponse->role,
                    'evaluatee' => $evaluationResponse->evaluatee ? [
                        'id' => Crypt::encrypt($evaluationResponse->evaluatee->id),
                        'last_name' => $evaluationResponse->evaluatee->last_name,
                        'first_name' => $evaluationResponse->evaluatee->first_name,
                        'middle_name' => $evaluationResponse->evaluatee->middle_name,
                        'suffix' => $evaluationResponse->evaluatee->suffix,
                        'media' => $evaluationResponse->evaluatee->media->map(function ($media) {
                            return [
                                'id' => Crypt::encrypt($media->id),
                                'created_at' => $media->created_at,
                                'updated_at' => $media->updated_at
                            ];
                        })
                    ] : null,
                    'evaluators' => $evaluationResponse->evaluators->map(function ($evaluator) use($userID, $encryptedUserID) {
                        return [
                            'evaluator_id' =>
                                ($evaluator->evaluator_id === $userID) ? $encryptedUserID
                                : Crypt::encrypt($evaluator->evaluator_id)
                            ,
                            'response_id' => Crypt::encrypt($evaluator->response_id),
                            'last_name' => $evaluator->last_name,
                            'first_name' => $evaluator->first_name,
                            'middle_name' => $evaluator->middle_name,
                            'suffix' => $evaluator->suffix,
                            'comment' => $evaluator->comment,
                            'order' => $evaluator->order,
                            'opened_at' => $evaluator->opened_at,
                            'signature_filepath' => $evaluator->signature_filepath,
                            'updated_at' => $evaluator->updated_at,
                            'media' => array_map(function ($media) {
                                return [
                                    'id' => Crypt::encrypt($media->id),
                                    'created_at' => $media->created_at,
                                    'updated_at' => $media->updated_at
                                ];
                            }, $evaluator->media),
                            'evaluator_signature' => $evaluator->evaluator_signature
                        ];
                    }),
                    'commentors' => $evaluationResponse->commentors->map(function ($commentor) use($userID, $encryptedUserID) {
                        return [
                            'commentor_id' =>
                                ($commentor->commentor_id === $userID) ? $encryptedUserID
                                : Crypt::encrypt($commentor->commentor_id)
                            ,
                            'response_id' => Crypt::encrypt($commentor->response_id),
                            'last_name' => $commentor->last_name,
                            'first_name' => $commentor->first_name,
                            'middle_name' => $commentor->middle_name,
                            'suffix' => $commentor->suffix,
                            'comment' => $commentor->comment,
                            'order' => $commentor->order,
                            'opened_at' => $commentor->opened_at,
                            'signature_filepath' => $commentor->signature_filepath,
                            'updated_at' => $commentor->updated_at,
                            'media' => array_map(function ($media) {
                                return [
                                    'id' => Crypt::encrypt($media->id),
                                    'created_at' => $media->created_at,
                                    'updated_at' => $media->updated_at
                                ];
                            }, $commentor->media),
                            'commentor_signature' => $commentor->commentor_signature
                        ];
                    }),
                    'form' => $evaluationResponse->form ? [
                        'id' => Crypt::encrypt($evaluationResponse->form->id),
                        'name' => $evaluationResponse->form->name,
                        'creator_id' => Crypt::encrypt($evaluationResponse->form->creator_id),
                        'creator_user_name' => $evaluationResponse->form->creator_user_name,
                        'sections' => $evaluationResponse->form->sections->map(function ($section) {
                            return [
                                'form_id' => Crypt::encrypt($section->form_id),
                                'id' => Crypt::encrypt($section->id),
                                'name' => $section->name,
                                'category' => $section->category,
                                'order' => $section->order,
                                'score' => $section->score,
                                'achieved_score' => $section->achieved_score,
                                'subcategories' => $section->subcategories->map(function ($subcategory) {
                                    return [
                                        'section_id' => Crypt::encrypt($subcategory->section_id),
                                        'id' => Crypt::encrypt($subcategory->id),
                                        'name' => $subcategory->name,
                                        'subcategory_type' => $subcategory->subcategory_type,
                                        'description' => $subcategory->description,
                                        'required' => $subcategory->required,
                                        'allow_other_option' => $subcategory->allow_other_option,
                                        'linear_scale_start' => $subcategory->linear_scale_start,
                                        'linear_scale_end' => $subcategory->linear_scale_end,
                                        'linear_scale_end_label' => $subcategory->linear_scale_end_label,
                                        'linear_scale_start_label' => $subcategory->linear_scale_start_label,
                                        'order' => $subcategory->order,
                                        'score' => $subcategory->score,
                                        'achieved_score' => $subcategory->achieved_score,
                                        'options' => $subcategory->options->map(function ($option) {
                                            return [
                                                'subcategory_id' => Crypt::encrypt($option->subcategory_id),
                                                'id' => Crypt::encrypt($option->id),
                                                'label' => $option->label,
                                                'score' => $option->score,
                                                'order' => $option->order,
                                                'description' => $option->description,
                                                'option_answer_count' => $option->option_answer_count,
                                                'option_answer' => $option->optionAnswer ? [
                                                    'id' => Crypt::encrypt($option->optionAnswer->id),
                                                    'response_id' => Crypt::encrypt($option->optionAnswer->response_id),
                                                    'option_id' => Crypt::encrypt($option->optionAnswer->option_id)
                                                ] : null
                                            ];
                                        }),
                                        'percentage_answer' => $subcategory->percentageAnswer ? [
                                            'id' => Crypt::encrypt($subcategory->percentageAnswer->id),
                                            'response_id' => Crypt::encrypt($subcategory->percentageAnswer->response_id),
                                            'subcategory_id' => Crypt::encrypt($subcategory->percentageAnswer->subcategory_id),
                                            'percentage' => $subcategory->percentageAnswer->percentage,
                                            'subcategory_type' => $subcategory->percentageAnswer->subcategory_type,
                                            'value' => $subcategory->percentageAnswer->value,
                                            'linear_scale_index' => $subcategory->percentageAnswer->linear_scale_index
                                        ] : null,
                                        'text_answer' => $subcategory->textAnswer ? [
                                            'id' => Crypt::encrypt($subcategory->textAnswer->id),
                                            'response_id' => Crypt::encrypt($subcategory->textAnswer->response_id),
                                            'subcategory_id' => Crypt::encrypt($subcategory->textAnswer->subcategory_id),
                                            'answer' => $subcategory->textAnswer->answer
                                        ] : null
                                    ];
                                })
                            ];
                        })
                    ] : null,
                    'media' => $evaluationResponse->media->map(function ($media) {
                        return [
                            'id' => Crypt::encrypt($media->id),
                            'created_at' => $media->created_at,
                            'updated_at' => $media->updated_at
                        ];
                    })
                ] : null
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
                ->select(
                    'evaluation_responses.id',
                    DB::raw("'Evaluatee' as role"),
                    DB::raw('null as commentor_order'),
                    'evaluatee_opened_at as opened_at',
                    'evaluatee_signature_filepath',
                    'creator_signature_filepath'
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
                    DB::raw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    'evaluation_responses.period_start_at',
                    'evaluation_responses.period_end_at'
                )
                ->whereNotNull('creator_signature_filepath')
                ->having('evaluators_unsigned_count', 0)
                ->having('commentors_unsigned_count', 0)
            ;
            $createdResponses = $user
                ->createdResponses()
                ->select(
                    'evaluation_responses.id',
                    DB::raw("'Creator' as role"),
                    DB::raw('null as commentor_order'),
                    DB::raw('null as opened_at'),
                    'evaluatee_signature_filepath',
                    'creator_signature_filepath'
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
                    DB::raw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    'evaluation_responses.period_start_at',
                    'evaluation_responses.period_end_at'
                )
            ;
            $evaluatorResponses = $user
                ->evaluatorResponses()
                ->select(
                    'evaluation_responses.id',
                    DB::raw("'Evaluator' as role"),
                    DB::raw('null as commentor_order'),
                    'opened_at',
                    'evaluatee_signature_filepath',
                    'creator_signature_filepath'
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
                    DB::raw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    'evaluation_responses.period_start_at',
                    'evaluation_responses.period_end_at'
                )
            ;
            $commentorResponses = $user
                ->commentorResponses()
                ->select(
                    'evaluation_responses.id',
                    DB::raw("'Commentor' as role"),
                    'order as commentor_order',
                    'opened_at',
                    'evaluatee_signature_filepath',
                    'creator_signature_filepath'
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
                    DB::raw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluatee_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    'evaluation_responses.period_start_at',
                    'evaluation_responses.period_end_at'
                )
                ->having('evaluators_unsigned_count', 0)
                ->having('commentor_order', '<=', DB::raw('commentors_signed_count + 1'))
            ;
            
            $evaluationResponses = $evaluateeResponses
                ->whereHas('form', function ($query) {
                    $query->whereNull('deleted_at');
                })
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
                        }]);
                }])
            ;
            if ($request->form_id !== null)
                $evaluationResponses = $evaluationResponses->where(
                    'evaluation_responses.form_id',
                    Crypt::decrypt($request->form_id)
                );
            $evaluationResponses = $evaluationResponses->get();

            // 1. Assign status
            foreach($evaluationResponses as $index => $evaluationResponse)
                switch($evaluationResponse->role) {
                    case 'Evaluator':
                        $evaluationEvaluator = $evaluationResponse->evaluators->where('evaluator_id', $userID)->first();
                        $evaluationResponse->status =
                            $evaluationResponse->evaluatee_signature_filepath ? 'Done'
                            : ($evaluationEvaluator->signature_filepath ? 'Submitted'
                            : ($evaluationEvaluator->opened_at ? 'Pending'
                            : 'New'
                        ));
                        break;
                    case 'Commentor':
                        $evaluationCommentor = $evaluationResponse->commentors->where('commentor_id', $userID)->first();
                        $evaluationResponse->status =
                            $evaluationResponse->evaluatee_signature_filepath ? 'Done'
                            : ($evaluationCommentor->signature_filepath ? 'Submitted'
                            : ($evaluationCommentor->opened_at ? 'Pending'
                            : 'New'
                        ));
                        break;
                    case 'Creator':
                        $evaluationResponse->status =
                            $evaluationResponse->evaluatee_signature_filepath ? 'Done'
                            : ($evaluationResponse->creator_signature_filepath ? 'Submitted'
                            : ((
                                $evaluationResponse->evaluators_unsigned_count === 0
                                && $evaluationResponse->commentors_unsigned_count === 0
                            ) ? 'Pending'
                            : 'Sent'
                        ));
                        break;
                    case 'Evaluatee':
                        $evaluationResponse->status =
                            $evaluationResponse->evaluatee_signature_filepath ? 'Done'
                            : ($evaluationResponse->opened_at ? 'Pending'
                            : 'New'
                        );
                }
            // 2. Searching
            if ($request->search) {
                $searchTerm = strtolower(trim($request->search));
                $evaluationResponses = $evaluationResponses->filter(function ($evaluationResponse) use ($searchTerm) {
                    $formName = strtolower($evaluationResponse->form->name ?? '');
                    $date = strtolower($evaluationResponse->date ?? '');
                    $fullName = strtolower(trim(
                        ($evaluationResponse->evaluatee->last_name ?? '') . ', ' .
                        ($evaluationResponse->evaluatee->first_name ?? '') . ' ' .
                        ($evaluationResponse->evaluatee->middle_name ?? '') . ' ' .
                        ($evaluationResponse->evaluatee->suffix ?? '')
                    ));
                    $department = strtolower($evaluationResponse->evaluatee->department->name ?? '');
                    $branch = strtolower($evaluationResponse->evaluatee->branch->name ?? '');
                    $status = strtolower($evaluationResponse->status ?? '');

                    return 
                        strpos($formName, $searchTerm) !== false ||
                        strpos($date, $searchTerm) !== false ||
                        strpos($fullName, $searchTerm) !== false ||
                        strpos($department, $searchTerm) !== false ||
                        strpos($branch, $searchTerm) !== false ||
                        strpos($status, $searchTerm) !== false;
                })->values();
            }
            // 3. Status filter
            if ($request->status && in_array($request->status, ['Sent', 'New', 'Pending', 'Submitted', 'Done'])) {
                $evaluationResponses = $evaluationResponses->filter(function ($evaluationResponse) use ($request) {
                    return $evaluationResponse->status === $request->status;
                })->values();
            }
            // 4. Sorting (multi-column, supports front-end's order_by array)
            if ($request->order_by && is_array($request->order_by)) {
                $orderByArray = $request->order_by;
                $evaluationResponses = $evaluationResponses->sort(function ($a, $b) use ($orderByArray) {
                    foreach ($orderByArray as $order) {
                        $key = $order['key'] ?? null;
                        $sortOrder = strtolower($order['sort_order'] ?? 'asc');

                        // PHP property/attribute access
                        switch ($key) {
                            case 'updated_at':
                            case 'created_at':
                                $valA = strtotime($a->$key);
                                $valB = strtotime($b->$key);
                                break;
                            case 'form_name':
                                $valA = strtolower($a->form->name ?? '');
                                $valB = strtolower($b->form->name ?? '');
                                break;
                            case 'last_name':
                            case 'first_name':
                            case 'middle_name':
                            case 'suffix':
                                $valA = strtolower($a->evaluatee->{$key} ?? '');
                                $valB = strtolower($b->evaluatee->{$key} ?? '');
                                break;
                            case 'department_name':
                                $valA = strtolower($a->evaluatee->department->name ?? '');
                                $valB = strtolower($b->evaluatee->department->name ?? '');
                                break;
                            case 'branch_name':
                                $valA = strtolower($a->evaluatee->branch->name ?? '');
                                $valB = strtolower($b->evaluatee->branch->name ?? '');
                                break;
                            case 'status':
                                $statusList = ['New', 'Pending', 'Sent', 'Submitted', 'Done', ''];
                                $valA = array_search($a->status ?? '', $statusList);
                                $valB = array_search($b->status ?? '', $statusList);
                                break;
                            default:
                                $valA = '';
                                $valB = '';
                        }

                        if ($valA == $valB) continue;
                        return ($valA < $valB ? -1 : 1) * ($sortOrder === 'asc' ? 1 : -1);
                    }
                    return -1;
                })->values();
            }
            // 5. Pagination
            $page = $request->page ?? 1;
            $limit = $request->limit ?? 10;
            $skip = ($page - 1) * $limit;

            $totalResponseCount = $evaluationResponses->count();
            $maxPageCount = ceil($totalResponseCount / $limit);
            $pageResponseCount = min($limit, max(0, $totalResponseCount - $skip));
            $evaluationResponses = $evaluationResponses->slice($skip, $limit)->values();

            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Responses successfully retrieved.',
                'evaluationResponses' => $evaluationResponses->map(function ($evaluationResponse) {
                    return [
                        'id' => Crypt::encrypt($evaluationResponse->id),
                        'role' => $evaluationResponse->role,
                        'commentor_order' => $evaluationResponse->commentor_order,
                        'opened_at' => $evaluationResponse->opened_at,
                        'evaluatee_signature_filepath' => $evaluationResponse->evaluatee_signature_filepath,
                        'creator_signature_filepath' => $evaluationResponse->creator_signature_filepath,
                        'evaluators_unsigned_count' => $evaluationResponse->evaluators_unsigned_count,
                        'commentors_unsigned_count' => $evaluationResponse->commentors_unsigned_count,
                        'commentors_signed_count' => $evaluationResponse->commentors_signed_count,
                        'date' => $evaluationResponse->date,
                        'form_id' => Crypt::encrypt($evaluationResponse->form_id),
                        'evaluatee_id' => Crypt::encrypt($evaluationResponse->evaluatee_id),
                        'created_at' => $evaluationResponse->created_at,
                        'updated_at' => $evaluationResponse->updated_at,
                        'period_start_at' => $evaluationResponse->period_start_at,
                        'period_end_at' => $evaluationResponse->period_end_at,
                        'status' => $evaluationResponse->status,
                        'form' => $evaluationResponse->form ? [
                            'id' => Crypt::encrypt($evaluationResponse->form->id),
                            'name' => $evaluationResponse->form->name
                        ] : null,
                        'evaluatee' => $evaluationResponse->evaluatee ? [
                            'id' => Crypt::encrypt($evaluationResponse->evaluatee->id),
                            'last_name' => $evaluationResponse->evaluatee->last_name,
                            'first_name' => $evaluationResponse->evaluatee->first_name,
                            'middle_name' => $evaluationResponse->evaluatee->middle_name,
                            'suffix' => $evaluationResponse->evaluatee->suffix,
                            'branch_id' => Crypt::encrypt($evaluationResponse->evaluatee->branch_id),
                            'department_id' => Crypt::encrypt($evaluationResponse->evaluatee->department_id),
                            'branch' => $evaluationResponse->evaluatee->branch ? [
                                'id' => Crypt::encrypt($evaluationResponse->evaluatee->branch->id),
                                'name' => $evaluationResponse->evaluatee->branch->name
                            ] : null,
                            'department' => $evaluationResponse->evaluatee->department ? [
                                'id' => Crypt::encrypt($evaluationResponse->evaluatee->department->id),
                                'name' => $evaluationResponse->evaluatee->department->name
                            ] : null
                        ] : null
                    ];
                }),
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
            evaluatee_id: string,
            form_id: string,
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
            $request->period_start_at = date('Y-m-d H:i:s', $periodStartAtSec - $periodStartAtSec % 86400 + 57600);
            $request->period_end_at = date('Y-m-d H:i:s', $periodEndAtSec - $periodEndAtSec % 86400 + 57600);

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
            // if($conflictingEvaluationResponse) {
            //     $conflictionPeriodStart = date_format($conflictingEvaluationResponse->period_start_at, '%b %d, %Y');
            //     $conflictionPeriodEnd = date_format($conflictingEvaluationResponse->period_end_at, '%b %d, %Y');
            //     return response()->json([ 
            //         'status' => 400,
            //         'message' => "This Evaluation is in conflict with another from $conflictionPeriodStart to $conflictionPeriodEnd!",
            //         'conflictingEvaluationResponseID' => $conflictingEvaluationResponse->id
            //     ]);
            // }

            $newEvaluationResponse = EvaluationResponse::create([
                'evaluatee_id' => Crypt::decrypt($request->evaluatee_id),
                'form_id' => $request->form_id,
                'creator_id' => $userID,
                'period_start_at' => $request->period_start_at,
                'period_end_at' => $request->period_end_at
            ]);
            foreach ($request->evaluators as $index => $evaluator_id) {
                EvaluationEvaluator::create([
                    'response_id' => $newEvaluationResponse->id,
                    'evaluator_id' => Crypt::decrypt($evaluator_id),
                    'order' => $index + 1
                ]);
            }

            foreach ($request->commentors as $index => $commentor_id) {
                EvaluationCommentor::create([
                    'response_id' => $newEvaluationResponse->id,
                    'commentor_id' => Crypt::decrypt($commentor_id),
                    'order' => $index + 1
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 201,
                'evaluationResponseID' => Crypt::encrypt($newEvaluationResponse->id),
                'message' => 'Evaluation Response successfully created'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving evaluation response: ' . $e->getMessage());
            throw $e;
        }
    }

    // evaluatee responses

    public function getEvaluateeResponses(Request $request)
    {
        // inputs:
        /*
        */

        // returns:
        /*
            evaluationResponses: {
                id, evaluatee_id, date, form_id,
                evaluators_unsigned_count, commentors_unsigned_count,
                created_at, updated_at
            }[]
            
        */

        Log::info('EvaluationResponseController::getEvaluateeResponses');

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
            
            $evaluationResponses = $user
                ->evaluateeResponses()
                ->whereHas('form', function ($query) {
                    $query->whereNull('deleted_at');
                })
                ->select('evaluation_responses.id')
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
                ->addSelect(
                    DB::raw("date_format(evaluation_responses.created_at, '%b %d, %Y') as date"),
                    'form_id',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->whereNotNull('creator_signature_filepath')
                ->whereNotNull('evaluatee_signature_filepath')
                ->having('evaluators_unsigned_count', 0)
                ->having('commentors_unsigned_count', 0)
            ;

            if ($request->form_id !== null)
                $evaluationResponses = $evaluationResponses->where(
                    'evaluation_responses.form_id',
                    Crypt::decrypt($request->form_id)
                );

            $evaluationResponses = $evaluationResponses->get();

            // --- PHP-level filtering and sorting ---
            // 1. Searching
            if ($request->search) {
                $searchTerm = strtolower(trim($request->search));
                $evaluationResponses = $evaluationResponses->filter(function ($evaluationResponse) use ($searchTerm) {
                    $formName = strtolower($evaluationResponse->form->name ?? '');
                    $date = strtolower($evaluationResponse->date ?? '');
                    $department = strtolower($evaluationResponse->evaluatee->department->name ?? '');
                    $branch = strtolower($evaluationResponse->evaluatee->branch->name ?? '');

                    return 
                        strpos($formName, $searchTerm) !== false ||
                        strpos($date, $searchTerm) !== false ||
                        strpos($department, $searchTerm) !== false ||
                        strpos($branch, $searchTerm) !== false
                    ;
                })->values();
            }

            // 2. Sorting (multi-column, supports front-end's order_by array)
            if ($request->order_by && is_array($request->order_by)) {
                $orderByArray = $request->order_by;
                $evaluationResponses = $evaluationResponses->sort(function ($a, $b) use ($orderByArray) {
                    foreach ($orderByArray as $order) {
                        $key = $order['key'] ?? null;
                        $sortOrder = strtolower($order['sort_order'] ?? 'asc');

                        // PHP property/attribute access
                        switch ($key) {
                            case 'updated_at':
                            case 'created_at':
                                $valA = strtotime($a->$key);
                                $valB = strtotime($b->$key);
                                break;
                            case 'form_name':
                                $valA = strtolower($a->form->name ?? '');
                                $valB = strtolower($b->form->name ?? '');
                                break;
                            case 'department_name':
                                $valA = strtolower($a->evaluatee->department->name ?? '');
                                $valB = strtolower($b->evaluatee->department->name ?? '');
                                break;
                            case 'branch_name':
                                $valA = strtolower($a->evaluatee->branch->name ?? '');
                                $valB = strtolower($b->evaluatee->branch->name ?? '');
                                break;
                            case 'status':
                                $statusList = ['New', 'Pending', 'Sent', 'Submitted', 'Done', ''];
                                $valA = array_search($a->status ?? '', $statusList);
                                $valB = array_search($b->status ?? '', $statusList);
                                break;
                            default:
                                $valA = '';
                                $valB = '';
                        }

                        if ($valA == $valB) continue;
                        return ($valA < $valB ? -1 : 1) * ($sortOrder === 'asc' ? 1 : -1);
                    }
                    return -1;
                })->values();
            }

            // 3. Pagination
            $page = $request->page ?? 1;
            $limit = $request->limit ?? 10;
            $skip = ($page - 1) * $limit;

            $totalResponseCount = $evaluationResponses->count();
            $maxPageCount = ceil($totalResponseCount / $limit);
            $pageResponseCount = min($limit, max(0, $totalResponseCount - $skip));

            $evaluationResponses = $evaluationResponses
                ->slice($skip, $limit)
                ->values()
            ;
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Responses successfully retrieved.',
                'evaluationResponses' => $evaluationResponses->map(function ($evaluationResponse) {
                    return [
                        'id' => Crypt::encrypt($evaluationResponse->id),
                        'evaluators_unsigned_count' => $evaluationResponse->evaluators_unsigned_count,
                        'commentors_unsigned_count' => $evaluationResponse->commentors_unsigned_count,
                        'date' => $evaluationResponse->date,
                        'form_id' => Crypt::encrypt($evaluationResponse->form_id),
                        'created_at' => $evaluationResponse->created_at,
                        'updated_at' => $evaluationResponse->updated_at
                    ];
                }),
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
    
    // evaluation evaluator

    public function deleteEvaluationEvaluator(Request $request)
    {
        // inputs:
        /*
            response_id: string,
            evaluator_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('evaluator_id', Crypt::decrypt($request->evaluator_id))
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
                'evaluationEvaluator' => $evaluationEvaluator ? [
                    'response_id' => Crypt::encrypt($evaluationEvaluator->response_id),
                    'evaluator_id' => Crypt::encrypt($evaluationEvaluator->evaluator_id),
                    'comment' => $evaluationEvaluator->comment,
                    'order' => $evaluationEvaluator->order,
                    'opened_at' => $evaluationEvaluator->opened_at,
                    'signature_filepath' => $evaluationEvaluator->signature_filepath,
                    'created_at' => $evaluationEvaluator->created_at,
                    'updated_at' => $evaluationEvaluator->updated_at,
                    'deleted_at' => $evaluationEvaluator->deleted_at,
                    'id' => Crypt::encrypt($evaluationEvaluator->id)
                ] : null
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
            response_id: string,
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
                    'id', 'response_id', 'evaluator_id', 'comment', 'order',
                    'signature_filepath', 'created_at', 'updated_at'
                )
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('evaluator_id', $userID)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationEvaluator) return response()->json([ 
                'status' => 404,
                'message' => 'You are not an evaluator in this evaluation!',
                'evaluationEvaluatorID' => $userID
            ]);

            if($request->comment !== null)
                $evaluationEvaluator->comment = $request->comment;

            if ($request->hasFile('signature_filepath')) {
                $evaluationEvaluator->clearMediaCollection('signatures');
                $evaluationEvaluator
                    ->addMedia($request->file('signature_filepath'))
                    ->toMediaCollection('signatures')
                ;
            } else if($request->signature_filepath != null) return response()->json([ 
                'status' => 400,
                'message' => 'Invalid evaluator signature data!'
            ]);
            $evaluationEvaluator->save();

            $evaluatorSignature = $evaluationEvaluator->getFirstMedia('signatures');
            if($evaluatorSignature) {
                $evaluationEvaluator->signature_filepath = $evaluatorSignature->getPath();
                $evaluationEvaluator->save();
                $evaluationEvaluator->evaluator_signature = base64_encode(file_get_contents($evaluatorSignature->getPath()));
            } else $evaluationEvaluator->evaluator_signature = null;

            DB::commit();

            return response()->json([
                'status' => 200,
                'evaluationEvaluator' => $evaluationEvaluator,
                'message' => 'Evaluation Evaluator successfully updated'
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
            response_id: string,
            evaluator_id: string,
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
                ->where('evaluation_evaluators.response_id', Crypt::decrypt($request->response_id))
                ->where('evaluation_evaluators.evaluator_id', Crypt::decrypt($request->evaluator_id))
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
                'evaluationEvaluator' => $evaluationEvaluator ? [
                    'response_id' => Crypt::encrypt($evaluationEvaluator->response_id),
                    'evaluator_id' => Crypt::encrypt($evaluationEvaluator->evaluator_id),
                    'comment' => $evaluationEvaluator->comment,
                    'order' => $evaluationEvaluator->order,
                    'signature_filepath' => $evaluationEvaluator->signature_filepath,
                    'last_name' => $evaluationEvaluator->last_name,
                    'first_name' => $evaluationEvaluator->first_name,
                    'middle_name' => $evaluationEvaluator->middle_name,
                    'suffix' => $evaluationEvaluator->suffix
                ] : null
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
            response_id: string
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
                ->where('evaluation_evaluators.response_id', Crypt::decrypt($request->response_id))
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
                'evaluationEvaluators' => $evaluationEvaluators->map(function ($evaluationEvaluator) {
                    return [
                        'response_id' => Crypt::encrypt($evaluationEvaluator->response_id),
                        'evaluator_id' => Crypt::encrypt($evaluationEvaluator->evaluator_id),
                        'last_name' => $evaluationEvaluator->last_name,
                        'first_name' => $evaluationEvaluator->first_name,
                        'middle_name' => $evaluationEvaluator->middle_name,
                        'suffix' => $evaluationEvaluator->suffix
                    ];
                })
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
            response_id: string,
            evaluator_id: string
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
                ::where('id', Crypt::decrypt($request->response_id))
                ->first()
            ;
            if(!$evaluationResponse) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Response not found!',
                'evaluationResponseID' => $request->response_id
            ]);
            if($evaluationResponse->evaluatee_id === Crypt::decrypt($request->evaluator_id))
                return response()->json([ 
                    'status' => 400,
                    'message' => 'This user has already been assigned as the evaluatee here!',
                    'evaluationResponseID' => $request->response_id,
                    'evaluationEvaluateeID' => $request->evaluator_id
                ]);
            
            $existingFormEvaluator = EvaluationEvaluator
                ::where('response_id', Crypt::decrypt($request->response_id))
                ->where('evaluator_id', Crypt::decrypt($request->evaluator_id))
                ->first()
            ;
            if($existingFormEvaluator) return response()->json([
                'status' => 409,
                'message' => 'This user has already been assigned as an evaluator here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationEvaluatorID' => $request->evaluator_id
            ]);

            $existingFormCommentor = EvaluationCommentor
                ::where('response_id', Crypt::decrypt($request->response_id))
                ->where('commentor_id', Crypt::decrypt($request->evaluator_id))
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
                EvaluationEvaluator::where(
                    'response_id', Crypt::decrypt($request->response_id)
                )->max('order') ?? 0
            ) + 1;

            $newEvaluationEvaluator = EvaluationEvaluator::create([
                'response_id' => Crypt::decrypt($request->response_id),
                'evaluator_id' => Crypt::decrypt($request->evaluator_id),
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
            response_id: string,
            commentor_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('commentor_id', Crypt::decrypt($request->commentor_id))
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
                'evaluationCommentor' => $evaluationCommentor ? [
                    'id' => Crypt::encrypt($evaluationCommentor->id),
                    'response_id' => Crypt::encrypt($evaluationCommentor->response_id),
                    'commentor_id' => Crypt::encrypt($evaluationCommentor->commentor_id),
                    'comment' => $evaluationCommentor->comment,
                    'signature_filepath' => $evaluationCommentor->signature_filepath,
                    'order' => $evaluationCommentor->order,
                    'opened_at' => $evaluationCommentor->opened_at,
                    'created_at' => $evaluationCommentor->created_at,
                    'updated_at' => $evaluationCommentor->updated_at,
                    'deleted_at' => $evaluationCommentor->deleted_at
                ] : null
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
            response_id: string,
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
                    'id', 'response_id', 'commentor_id', 'comment', 'order',
                    'signature_filepath', 'created_at', 'updated_at'
                )
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('commentor_id', $userID)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationCommentor) return response()->json([ 
                'status' => 404,
                'message' => 'You are not a commentor in this evaluation!',
                'evaluationCommentorID' => $request->commentor_id
            ]);

            if($request->comment !== null)
                $evaluationCommentor->comment = $request->comment;
            if ($request->hasFile('signature_filepath')) {
                $evaluationCommentor->clearMediaCollection('signatures');
                $evaluationCommentor
                    ->addMedia($request->file('signature_filepath'))
                    ->toMediaCollection('signatures')
                ;
            } else if($request->signature_filepath != null) return response()->json([ 
                'status' => 400,
                'message' => 'Invalid commentor signature data!'
            ]);
            $evaluationCommentor->save();

            $commentorSignature = $evaluationCommentor->getFirstMedia('signatures');
            if($commentorSignature) {
                $evaluationCommentor->signature_filepath = $commentorSignature->getPath();
                $evaluationCommentor->save();
                $evaluationCommentor->commentor_signature = base64_encode(file_get_contents($commentorSignature->getPath()));
            } else $evaluationCommentor->commentor_signature = null;

            DB::commit();

            return response()->json([
                'status' => 200,
                'evaluationCommentor' => $evaluationCommentor ? [
                    'id' => Crypt::encrypt($evaluationCommentor->id),
                    'response_id' => Crypt::encrypt($evaluationCommentor->response_id),
                    'commentor_id' => Crypt::encrypt($evaluationCommentor->commentor_id),
                    'comment' => $evaluationCommentor->comment,
                    'order' => $evaluationCommentor->order,
                    'signature_filepath' => $evaluationCommentor->signature_filepath,
                    'created_at' => $evaluationCommentor->created_at,
                    'updated_at' => $evaluationCommentor->updated_at,
                    'commentor_signature' => $evaluationCommentor->commentor_signature,
                    'media' => $evaluationCommentor->media->map(function ($media) {
                        return [
                            'id' => Crypt::encrypt($media->id),
                            'created_at' => $media->created_at,
                            'updated_at' => $media->updated_at
                        ];
                    })
                ] : null,
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
            response_id: string,
            commentor_id: string,
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
                ->where('evaluation_commentors.response_id', Crypt::decrypt($request->response_id))
                ->where('evaluation_commentors.commentor_id', Crypt::decrypt($request->commentor_id))
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
                'evaluationCommentor' => $evaluationCommentor ? [
                    'response_id' => Crypt::encrypt($evaluationCommentor->response_id),
                    'commentor_id' => Crypt::encrypt($evaluationCommentor->commentor_id),
                    'comment' => $evaluationCommentor->comment,
                    'order' => $evaluationCommentor->order,
                    'signature_filepath' => $evaluationCommentor->signature_filepath,
                    'last_name' => $evaluationCommentor->last_name,
                    'first_name' => $evaluationCommentor->first_name,
                    'middle_name' => $evaluationCommentor->middle_name,
                    'suffix' => $evaluationCommentor->suffix
                ] : null
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
            response_id: string
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
                ->where('evaluation_commentors.response_id', Crypt::decrypt($request->response_id))
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
                'evaluationCommentors' => $evaluationCommentors->map(function ($evaluationCommentor) {
                    return [
                        'response_id' => Crypt::encrypt($evaluationCommentor->response_id),
                        'commentor_id' => Crypt::encrypt($evaluationCommentor->commentor_id),
                        'last_name' => $evaluationCommentor->last_name,
                        'first_name' => $evaluationCommentor->first_name,
                        'middle_name' => $evaluationCommentor->middle_name,
                        'suffix' => $evaluationCommentor->suffix
                    ];
                })
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
            response_id: string,
            commentor_id: string
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
                ::where('id', Crypt::decrypt($request->response_id))
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
                ::where('response_id', Crypt::decrypt($request->response_id))
                ->where('commentor_id', Crypt::decrypt($request->commentor_id))
                ->first()
            ;
            if($existingFormCommentor) return response()->json([
                'status' => 409,
                'message' => 'This user has already been assigned as an commentor here!',
                'evaluationResponseID' => $request->response_id,
                'evaluationCommentorID' => $request->commentor_id
            ]);

            $existingFormEvaluator = EvaluationEvaluator
                ::where('response_id', Crypt::decrypt($request->response_id))
                ->where('evaluator_id', Crypt::decrypt($request->commentor_id))
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
                EvaluationCommentor::where(
                    'response_id',
                    Crypt::decrypt($request->response_id)
                )->max('order') ?? 0
            ) + 1;

            $newEvaluationCommentor = EvaluationCommentor::create([
                'response_id' => Crypt::decrypt($request->response_id),
                'commentor_id' => Crypt::decrypt($request->commentor_id),
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

    // evaluation form percentage answer - unused

    // public function deleteEvaluationPercentageAnswer(Request $request)
    // {
    //     // inputs:
    //     /*
    //         response_id: string,
    //         subcategory_id: string
    //     */

    //     // returns:
    //     /*
    //         evaluationPercentageAnswer: {
    //             response_id, subcategory_id, percentage, created_at, updated_at, deleted_at
    //         }
    //     */

    //     log::info('EvaluationResponseController::deleteEvaluationPercentageAnswer');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('users')->select()->where('id', $userID)->first();

    //     try {

    //         if( $user === null ) return response()->json([ 
    //             'status' => 403,
    //             'message' => 'Unauthorized access!'
    //         ]);

    //         DB::beginTransaction();

    //         $evaluationPercentageAnswer = EvaluationPercentageAnswer
    //             ::select()
    //             ->where('response_id', $request->response_id)
    //             ->where('subcategory_id', $request->subcategory_id)
    //             ->whereNull('deleted_at')
    //             ->first()
    //         ;

    //         if( !$evaluationPercentageAnswer ) return response()->json([ 
    //             'status' => 404,
    //             'message' => 'Evaluation Percentage Answer not found!',
    //             'evaluationResponseID' => $request->response_id,
    //             'evaluationSubcategoryID' => $request->subcategory_id
    //         ]);

    //         if( $evaluationPercentageAnswer->deleted_at ) return response()->json([ 
    //             'status' => 405,
    //             'message' => 'Evaluation Percentage Answer already deleted!',
    //             'evaluationResponseID' => $request->response_id,
    //             'evaluationSubcategoryID' => $request->subcategory_id
    //         ]);

    //         $now = date('Y-m-d H:i');
    //         $evaluationPercentageAnswer->deleted_at = $now;
    //         $evaluationPercentageAnswer->save();

    //         DB::commit();

    //         return response()->json([ 
    //             'status' => 200,
    //             'message' => 'Evaluation Percentage Answer successfully deleted',
    //             'evaluationPercentageAnswer' => $evaluationPercentageAnswer
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function editEvaluationPercentageAnswer(Request $request)
    // {
    //     // inputs:
    //     /*
    //         response_id: string,
    //         subcategory_id: string,
    //         percentage?: number,            // either percentage or value must be given
    //         value?: number                  // value means percentage is auto-calculated
    //     */

    //     // returns:
    //     /*
    //         evaluationPercentageAnswer: {
    //             response_id, subcategory_id, percentage, value, linear_scale_index,
    //             created_at, updated_at, deleted_at
    //         }
    //     */

    //     log::info('EvaluationResponseController::editEvaluationPercentageAnswer');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('users')->select()->where('id', $userID)->first();

    //     try {

    //         if( $user === null ) return response()->json([ 
    //             'status' => 403,
    //             'message' => 'Unauthorized access!'
    //         ]);

    //         DB::beginTransaction();

    //         $evaluationPercentageAnswer = EvaluationPercentageAnswer
    //             ::join('evaluation_form_subcategories', 'evaluation_percentage_answers.subcategory_id', '=', 'evaluation_form_subcategories.id')
    //             ->select('evaluation_percentage_answers.*')
    //             ->addSelect(DB::raw(
    //                 "round(evaluation_percentage_answers.percentage*"
    //                 ."(evaluation_form_subcategories.linear_scale_end"
    //                 ."-evaluation_form_subcategories.linear_scale_start)"
    //                 ."+evaluation_form_subcategories.linear_scale_start)"
    //                 ." as value"
    //             ))
    //             ->addSelect(DB::raw(
    //                 "round(evaluation_percentage_answers.percentage*"
    //                 ."(evaluation_form_subcategories.linear_scale_end"
    //                 ."-evaluation_form_subcategories.linear_scale_start))"
    //                 ." as linear_scale_index"
    //             ))
    //             ->where('evaluation_percentage_answers.response_id', $request->response_id)
    //             ->where('evaluation_percentage_answers.subcategory_id', $request->subcategory_id)
    //             ->whereNull('evaluation_percentage_answers.deleted_at')
    //             ->first()
    //         ;

    //         if(!$evaluationPercentageAnswer) return response()->json([ 
    //             'status' => 404,
    //             'message' => 'Evaluation Percentage Answer not found!',
    //             'evaluationPercentageAnswerID' => $request->id
    //         ]);

    //         if($request->percentage === null && $request->value === null) return response()->json([
    //             'status' => 400,
    //             'message' => 'Either Percentage or Value must be given!'
    //         ]);

    //         $subcategory = EvaluationFormSubcategory
    //             ::select('id', 'subcategory_type', 'linear_scale_start', 'linear_scale_end')
    //             ->where('id', $evaluationPercentageAnswer->subcategory_id)
    //             ->whereNull('deleted_at')
    //             ->first()
    //         ;

    //         if($subcategory->subcategory_type != 'linear_scale') return response()->json([
    //             'status' => 400,
    //             'message' => 'This subcategory does not accept percentage answers!',
    //             'evaluationFormSubcategoryID' => $subcategory->id,
    //             'subcategoryType' => $subcategory->subcategory_type
    //         ]);

    //         if(
    //             $request->percentage === null
    //             && (
    //                 $request->value < $subcategory->linear_scale_start
    //                 || $request->value > $subcategory->linear_scale_end
    //             )
    //         ) return response()->json([
    //             'status' => 400,
    //             'message' => 'Value is is not within linear scale!',
    //             'evaluationFormSubcategoryID' => $subcategory->id,
    //             'linear_scale_start' => $subcategory->linear_scale_start,
    //             'linear_scale_end' => $subcategory->linear_scale_end
    //         ]);

    //         $percentage = (
    //             $request->percentage
    //             ?? (
    //                 ($request->value - $subcategory->linear_scale_start)
    //                 / ($subcategory->linear_scale_end - $subcategory->linear_scale_start)
    //             )
    //         );

    //         $evaluationPercentageAnswer->percentage = (double) $percentage;
    //         $evaluationPercentageAnswer->save();

    //         DB::commit();

    //         return response()->json([ 
    //             'status' => 200,
    //             'evaluationPercentageAnswer' => $evaluationPercentageAnswer,
    //             'message' => 'Evaluation Percentage Answer successfully updated'
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function getEvaluationPercentageAnswer(Request $request)
    // {
    //     // inputs:
    //     /*
    //         response_id: string,
    //         subcategory_id: string,
    //     */

    //     // returns:
    //     /*
    //         evaluationPercentageAnswer: {
    //             response_id, subcategory_id, percentage, value, linear_scale_index,
    //             created_at, updated_at
    //         }
    //     */

    //     log::info('EvaluationResponseController::getEvaluationPercentageAnswer');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }
    
    //     $user = DB::table('users')->where('id', $userID)->first();

    //     try {

    //         $evaluationPercentageAnswer = EvaluationPercentageAnswer
    //             ::select(
    //                 'response_id', 'subcategory_id', 'percentage',
    //                 'created_at', 'updated_at'
    //             )
    //             ->where('response_id', $request->response_id)
    //             ->where('subcategory_id', $request->subcategory_id)
    //             ->whereNull('deleted_at')
    //             ->first()
    //         ;
    //         if( !$evaluationPercentageAnswer ) return response()->json([
    //             'status' => 404,
    //             'message' => 'Evaluation Percentage Answer not found!'
    //         ]);
    //         return response()->json([
    //             'status' => 200,
    //             'message' => 'Evaluation Percentage Answer successfully retrieved.',
    //             'evaluationPercentageAnswer' => $evaluationPercentageAnswer
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    
    // }

    // public function getEvaluationPercentageAnswers(Request $request)
    // {
    //     // inputs:
    //     /*
    //         subcategory_id: string
    //     */

    //     // returns:
    //     /*
    //         evaluationPercentageAnswers: {
    //             response_id, subcategory_id, percentage, value, linear_scale_index,
    //             created_at, updated_at
    //         }[]
    //     */

    //     log::info('EvaluationResponseController::getEvaluationPercentageAnswers');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }
    
    //     $user = DB::table('users')->where('id', $userID)->first();

    //     try {

    //         $evaluationPercentageAnswers = EvaluationPercentageAnswer
    //             ::select(
    //                 'id', 'response_id', 'subcategory_id', 'percentage',
    //                 'created_at', 'updated_at'
    //             )
    //             ->where('subcategory_id', $request->subcategory_id)
    //             ->whereNull('deleted_at')
    //             ->get()
    //         ;
    //         if( !$evaluationPercentageAnswers ) return response()->json([
    //             'status' => 404,
    //             'message' => 'Evaluation Percentage Answers not found!'
    //         ]);
    //         return response()->json([
    //             'status' => 200,
    //             'message' => 'Evaluation Percentage Answers successfully retrieved.',
    //             'evaluationPercentageAnswers' => $evaluationPercentageAnswers
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    
    // }

    // public function saveEvaluationPercentageAnswer(Request $request)
    // {
    //     // inputs:
    //     /*
    //         response_id: string,
    //         subcategory_id: string,
    //         percentage?: number,            // either percentage or value must be given
    //         value?: number                  // value means percentage is auto-calculated
    //     */

    //     // returns:
    //     /*
    //         evaluationPercentageAnswerID
    //     */

    //     log::info('EvaluationResponseController::saveEvaluationPercentageAnswer');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('users')->select()->where('id', $userID)->first();

    //     try {

    //         if( $user === null ) return response()->json([ 
    //             'status' => 403,
    //             'message' => 'Unauthorized access!'
    //         ]);

    //        if($request->percentage === null && $request->value === null) return response()->json([
    //             'status' => 400,
    //             'message' => 'Either Percentage or Value must be given!'
    //         ]);

    //         $subcategory = EvaluationFormSubcategory
    //             ::select('subcategory_type', 'linear_scale_start', 'linear_scale_end')
    //             ->where('id', $request->subcategory_id)
    //             ->whereNull('deleted_at')
    //             ->first()
    //         ;

    //         if($subcategory->subcategory_type != 'linear_scale') return response()->json([
    //             'status' => 400,
    //             'message' => 'This subcategory does not accept percentage answers!',
    //             'evaluationFormSubcategoryID' => $subcategory->id
    //         ]);
            
    //         $existingFormPercentageAnswer = EvaluationPercentageAnswer
    //             ::where('response_id', $request->response_id)
    //             ->where('subcategory_id', $request->subcategory_id)
    //             ->first()
    //         ;

    //         if($existingFormPercentageAnswer) return response()->json([ 
    //             'status' => 409,
    //             'message' => 'A percentage answer was already created for this subcategory!',
    //             'evaluationResponseID' => $request->response_id,
    //             'evaluationFormSubcategoryID' => $request->subcategory_id
    //         ]);

    //         if(
    //             $request->percentage === null
    //             && (
    //                 $request->value < $subcategory->linear_scale_start
    //                 || $request->value > $subcategory->linear_scale_end
    //             )
    //         ) return response()->json([
    //             'status' => 400,
    //             'message' => 'Value is is not within linear scale!',
    //             'evaluationFormSubcategoryID' => $subcategory->id,
    //             'linear_scale_start' => $subcategory->linear_scale_start,
    //             'linear_scale_end' => $subcategory->linear_scale_end
    //         ]);

    //         DB::beginTransaction();

    //         $percentage = (
    //             $request->percentage
    //             ?? (
    //                 ($request->value - $subcategory->linear_scale_start)
    //                 / ($subcategory->linear_scale_end - $subcategory->linear_scale_start)
    //             )
    //         );

    //         $newEvaluationPercentageAnswer = EvaluationPercentageAnswer::create([
    //             'response_id' => $request->response_id,
    //             'subcategory_id' => $request->subcategory_id,
    //             'percentage' => $percentage
    //         ]);

    //         DB::commit();

    //         return response()->json([ 
    //             'status' => 201,
    //             'message' => 'Evaluation Percentage Answer successfully created',
    //             'evaluationResponseID' => $request->response_id,
    //             'evaluationFormSubcategoryID' => $request->subcategory_id
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // evaluation form text answer

    public function deleteEvaluationTextAnswer(Request $request)
    {
        // inputs:
        /*
            response_id: string,
            subcategory_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('subcategory_id', Crypt::decrypt($request->subcategory_id))
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
                'evaluationTextAnswer' => $evaluationTextAnswer ? [
                    'id' => Crypt::encrypt($evaluationTextAnswer->id),
                    'response_id' => Crypt::encrypt($evaluationTextAnswer->response_id),
                    'subcategory_id' => Crypt::encrypt($evaluationTextAnswer->subcategory_id),
                    'answer' => $evaluationTextAnswer->answer,
                    'created_at' => $evaluationTextAnswer->created_at,
                    'updated_at' => $evaluationTextAnswer->updated_at,
                    'deleted_at' => $evaluationTextAnswer->deleted_at
                ] : null
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
            response_id: string,
            subcategory_id: string,
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('subcategory_id', Crypt::decrypt($request->subcategory_id))
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationTextAnswer) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Text Answer not found!',
                'evaluationTextAnswerID' => $request->subcategory_id
            ]);

            $subcategory = EvaluationFormSubcategory
                ::select('id', 'subcategory_type')
                ->where('id', Crypt::decrypt($request->subcategory_id))
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!in_array($subcategory->subcategory_type, ['long_answer', 'short_answer']))
                return response()->json([
                    'status' => 400,
                    'message' => 'This subcategory does not accept text answers!',
                    'evaluationFormSubcategoryID' => $request->subcategory_id
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
                'evaluationTextAnswer' => $evaluationTextAnswer ? [
                    'response_id' => Crypt::encrypt($evaluationTextAnswer->response_id),
                    'subcategory_id' => Crypt::encrypt($evaluationTextAnswer->subcategory_id),
                    'answer' => $evaluationTextAnswer->answer,
                    'created_at' => $evaluationTextAnswer->created_at,
                    'updated_at' => $evaluationTextAnswer->updated_at,
                    'deleted_at' => $evaluationTextAnswer->deleted_at,
                    'id' => Crypt::encrypt($evaluationTextAnswer->id)
                ] : null,
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
            response_id: string,
            subcategory_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('subcategory_id', Crypt::decrypt($request->subcategory_id))
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
                'evaluationTextAnswer' => $evaluationTextAnswer ? [
                    'response_id' => Crypt::encrypt($evaluationTextAnswer->response_id),
                    'subcategory_id' => Crypt::encrypt($evaluationTextAnswer->subcategory_id),
                    'answer' => $evaluationTextAnswer->answer,
                    'created_at' => $evaluationTextAnswer->created_at,
                    'updated_at' => $evaluationTextAnswer->updated_at
                ] : null
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
            subcategory_id: string
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
                ->where('subcategory_id', Crypt::decrypt($request->subcategory_id))
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
                'evaluationTextAnswers' => $evaluationTextAnswers->map(function ($evaluationTextAnswer) {
                    return [
                        'response_id' => Crypt::encrypt($evaluationTextAnswer->response_id),
                        'subcategory_id' => Crypt::encrypt($evaluationTextAnswer->subcategory_id),
                        'answer' => $evaluationTextAnswer->answer,
                        'created_at' => $evaluationTextAnswer->created_at,
                        'updated_at' => $evaluationTextAnswer->updated_at
                    ];
                })
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
            response_id: string,
            subcategory_id: string,
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
                ->where('id', Crypt::decrypt($request->subcategory_id))
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
                ::where('response_id', Crypt::decrypt($request->response_id))
                ->where('subcategory_id', Crypt::decrypt($request->subcategory_id))
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
                'response_id' => Crypt::decrypt($request->response_id),
                'subcategory_id' => Crypt::decrypt($request->subcategory_id),
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
            response_id: string,
            option_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('option_id', Crypt::decrypt($request->option_id))
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
                'evaluationResponseID' => $request->response_id,
                'evaluationSubcategoryOptionID' => $request->option_id
            ]);

            $now = date('Y-m-d H:i');
            $evaluationOptionAnswer->deleted_at = $now;
            $evaluationOptionAnswer->save();

            DB::commit();

            return response()->json([
                'status' => 200,
                'evaluationOptionAnswer' => $evaluationOptionAnswer ? [
                    'id' => Crypt::encrypt($evaluationOptionAnswer->id),
                    'response_id' => Crypt::encrypt($evaluationOptionAnswer->response_id),
                    'option_id' => Crypt::encrypt($evaluationOptionAnswer->option_id),
                    'created_at' => $evaluationOptionAnswer->created_at,
                    'updated_at' => $evaluationOptionAnswer->updated_at,
                    'deleted_at' => $evaluationOptionAnswer->deleted_at
                ] : null,
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
            response_id: string,
            option_id: string,
            new_option_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('option_id', Crypt::decrypt($request->option_id))
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
                case "long_answer":
                case "short_answer":
                    return response()->json([
                        'status' => 400,
                        'message' => 'This subcategory does not accept choice answers!',
                        'evaluationFormSubcategoryID' => Crypt::decrypt($evaluationFormSubcategory->id)
                    ]);
                    break;
                case "checkbox":
                case "linear_scale":
                case "multiple_choice":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::select('response_id', 'option_id')
                        ->where('response_id', '=', Crypt::decrypt($request->response_id))
                        ->where('option_id', '=', Crypt::decrypt($request->new_option_id))
                        ->whereNull('deleted_at')
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'The same option answer was already created for this subcategory!',
                        'evaluationResponseID' => $request->response_id,
                        'evaluationFormSubcategoryOptionID' => $request->option_id
                    ]);
            }

            $evaluationOptionAnswer->option_id = Crypt::decrypt($request->new_option_id);
            $evaluationOptionAnswer->save();

            DB::commit();

            return response()->json([
                'status' => 200,
                'evaluationOptionAnswer' => $evaluationOptionAnswer ? [
                    'id' => Crypt::encrypt($evaluationOptionAnswer->id),
                    'response_id' => Crypt::encrypt($evaluationOptionAnswer->response_id),
                    'option_id' => Crypt::encrypt($evaluationOptionAnswer->option_id),
                    'created_at' => $evaluationOptionAnswer->created_at,
                    'updated_at' => $evaluationOptionAnswer->updated_at,
                    'deleted_at' => $evaluationOptionAnswer->deleted_at
                ] : null,
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
            response_id: string,
            option_id: string
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
                ->where('response_id', Crypt::decrypt($request->response_id))
                ->where('option_id', Crypt::decrypt($request->option_id))
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
                'evaluationOptionAnswer' => $evaluationOptionAnswer ? [
                    'response_id' => Crypt::encrypt($evaluationOptionAnswer->response_id),
                    'option_id' => Crypt::encrypt($evaluationOptionAnswer->option_id),
                    'created_at' => $evaluationOptionAnswer->created_at,
                    'updated_at' => $evaluationOptionAnswer->updated_at
                ] : null
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
                    'evaluation_option_answers.response_id', Crypt::decrypt($request->response_id)
                );
            if($request->subcategory_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_form_subcategories.id', Crypt::decrypt($request->subcategory_id)
                );
            if($request->option_id)
                $evaluationOptionAnswers = $evaluationOptionAnswers->where(
                    'evaluation_option_answers.option_id', Crypt::decrypt($request->option_id)
                );
            $evaluationOptionAnswers = $evaluationOptionAnswers->get();

            if( !$evaluationOptionAnswers ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Option Answers not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Option Answers successfully retrieved.',
                'evaluationOptionAnswers' => $evaluationOptionAnswers->map(function ($evaluationOptionAnswer) {
                    return [
                        'response_id' => Crypt::encrypt($evaluationOptionAnswer->response_id),
                        'subcategory_id' => Crypt::encrypt($evaluationOptionAnswer->subcategory_id),
                        'option_id' => Crypt::encrypt($evaluationOptionAnswer->option_id),
                        'created_at' => $evaluationOptionAnswer->created_at,
                        'updated_at' => $evaluationOptionAnswer->updated_at
                    ];
                })
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
            response_id: string,
            option_id: string
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
                ->where('evaluation_form_subcategory_options.id', Crypt::decrypt($request->option_id))
                ->whereNull('evaluation_form_subcategory_options.deleted_at')
                ->first()
            ;

            switch($subcategory->subcategory_type) {
                case "long_answer":
                case "short_answer":
                    return response()->json([
                        'status' => 400,
                        'message' => 'This subcategory does not accept choice answers!',
                        'evaluationFormSubcategoryID' => Crypt::encrypt($subcategory->id)
                    ]);
                    break;
                case "checkbox":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                        ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                        ->select('evaluation_option_answers.option_id')
                        ->where('evaluation_option_answers.option_id', '=', Crypt::decrypt($request->option_id))
                        ->where('evaluation_option_answers.response_id', '=', Crypt::decrypt($request->response_id))
                        ->where('evaluation_form_subcategories.id', '=', $subcategory->id)
                        ->whereNull('evaluation_option_answers.deleted_at')
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'The same option answer was already created for this subcategory!',
                        'evaluationResponseID' =>  Crypt::encrypt($request->response_id),
                        'evaluationOptionID' => Crypt::encrypt($existingOptionAnswer->option_id)
                    ]);
                    break;
                case "linear_scale":
                case "multiple_choice":
                    $existingOptionAnswer = EvaluationOptionAnswer
                        ::join('evaluation_form_subcategory_options', 'evaluation_form_subcategory_options.id', '=', 'evaluation_option_answers.option_id')
                        ->join('evaluation_form_subcategories', 'evaluation_form_subcategories.id', '=', 'evaluation_form_subcategory_options.subcategory_id')
                        ->select('evaluation_option_answers.option_id')
                        ->where('evaluation_option_answers.response_id', '=', Crypt::decrypt($request->response_id))
                        ->where('evaluation_form_subcategories.id', '=', $subcategory->id)
                        ->whereNull('evaluation_option_answers.deleted_at')
                        ->first()
                    ;
                    if($existingOptionAnswer) return response()->json([ 
                        'status' => 409,
                        'message' => 'An option answer was already created for this subcategory!',
                        'evaluationResponseID' =>  $request->response_id,
                        'evaluationOptionID' => $request->option_id
                    ]);
                    break;
                                
            }

            DB::beginTransaction();

            $newEvaluationOptionAnswer = EvaluationOptionAnswer::create([
                'response_id' => Crypt::decrypt($request->response_id),
                'option_id' => Crypt::decrypt($request->option_id)
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
