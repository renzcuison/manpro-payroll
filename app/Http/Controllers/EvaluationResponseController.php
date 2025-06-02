<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EvaluationForm;
use App\Models\EvaluationFormSection;
use App\Models\EvaluationFormCategory;
use App\Models\EvaluationFormSubcategory;
use App\Models\EvaluationFormSubcategoryOption;
use App\Models\EvaluationResponse;
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

    public function editEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            id: number,
            evaluatee_id?: number,
            evaluator_id?: number,
            primary_commentor_id?: number,
            secondary_commentor_id?: number,
            form_id?: number,
            period_start_at?: string,
            period_end_at?: string
        */

        // returns:
        /*
            evaluationFormID
        */

        log::info('EvaluationResponseController::editEvaluationResponse');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select('*')->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            $periodStartAtSec = strtotime($request->period_start_at);
            $periodEndAtSec = strtotime($request->period_end_at);
            $request->period_start_at = date(
                'Y-m-d H:i:s', $periodStartAtSec - $periodStartAtSec % 82800
            );
            $request->period_end_at = date(
                'Y-m-d H:i:s', $periodEndAtSec + 86400 - $periodEndAtSec % 82800
            );
            if($periodStartAtSec>$periodEndAtSec) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Period Start Date cannot be more than Period End Date!'
            ]);

            DB::beginTransaction();

            $evaluationFormResponse = EvaluationFormResponse
                ::select(
                    'id', 'form_id', 'name', 'category', 'order', 'created_at',
                    'updated_at'
                )
                ->where('id', $request->id)
                ->first()
            ;
            
            $conflictingEvaluationResponse = EvaluationResponse
                ::where('evaluatee_id', $request->evaluatee_id)
                ->where('form_id', $request->form_id)
                ->where('period_start_at', '<', $request->period_end_at)
                ->where('period_end_at', '>', $request->period_start_at)
                ->first()
            ;
            if($conflictingEvaluationResponse) return response()->json([ 
                'status' => 400,
                'message' => 'This Evaluation is in conflict with another!',
                'evaluationFormID' => $conflictingEvaluationResponse->id
            ]);

            $newEvaluationResponse = EvaluationResponse::create([
                'evaluatee_id' => $request->evaluatee_id,
                'evaluator_id' => $request->evaluator_id,
                'primary_commentor_id' => $request->primary_commentor_id,
                'secondary_commentor_id' => $request->secondary_commentor_id,
                'form_id' => $request->form_id,
                'period_start_at' => $request->period_start_at,
                'period_end_at' => $request->period_end_at
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationResponseID' => $newEvaluationResponse->id,
                'message' => 'Evaluation Response successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

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
                id, datetime,
                evaluatee_id, evaluatee_last_name, evaluatee_first_name, evaluatee_middle_name,
                evaluator_id, evaluator_last_name, evaluator_first_name, evaluator_middle_name,
                primary_commentor_id, primary_last_name, primary_first_name, primary_middle_name,
                secondary_commentor_id, secondary_last_name, secondary_first_name, secondary_middle_name,
                period_start_date,
                period_end_date,
                signature_filepath,
                created_at, updated_at,
                status,                 // returns 'pending' always for now
                evaluationForm: {
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
                            percentage_answer: { id, response_id, subcategory_id, percentage } | null,
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
                ::join('evaluation_forms', 'evaluation_responses.form_id', '=', 'evaluation_forms.id')
                ->join('users as evaluatees', 'evaluation_responses.evaluatee_id', '=', 'evaluatees.id')
                ->join('users as evaluators', 'evaluation_responses.evaluator_id', '=', 'evaluators.id')
                ->join('users as primary_commentors', 'evaluation_responses.primary_commentor_id', '=', 'primary_commentors.id')
                ->join('users as secondary_commentors', 'evaluation_responses.secondary_commentor_id', '=', 'secondary_commentors.id')
                ->select(
                    'evaluation_responses.id',
                    'evaluation_forms.id as form_id', 'evaluation_forms.name as form_name'
                )
                ->selectRaw("date_format(evaluation_responses.updated_at, '%b %d, %Y - %h:%i %p') as datetime")
                ->addSelect(
                    'evaluatees.id as evaluatee_id',
                    'evaluatees.last_name as evaluatee_last_name',
                    'evaluatees.first_name as evaluatee_first_name',
                    'evaluatees.middle_name as evaluatee_middle_name',

                    'evaluators.id as evaluator_id',
                    'evaluators.last_name as evaluator_last_name',
                    'evaluators.first_name as evaluator_first_name',
                    'evaluators.middle_name as evaluator_middle_name',

                    'primary_commentors.id as primary_commentor_id',
                    'primary_commentors.last_name as primary_commentor_last_name',
                    'primary_commentors.first_name as primary_commentor_first_name',
                    'primary_commentors.middle_name as primary_commentor_middle_name',

                    'secondary_commentors.id as secondary_commentor_id',
                    'secondary_commentors.last_name as secondary_commentor_last_name',
                    'secondary_commentors.first_name as secondary_commentor_first_name',
                    'secondary_commentors.middle_name as secondary_commentor_middle_name'
                )
                ->selectRaw("date_format(evaluation_responses.period_start_at, '%b %d, %Y') as period_start_date")
                ->selectRaw("date_format(evaluation_responses.period_end_at, '%b %d, %Y') as period_end_date")
                ->addSelect(
                    'evaluation_responses.signature_filepath',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at',
                    DB::raw("'Pending' as status")
                )
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
                                ->orderBy('order')
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
                                                        'subcategory_id', 'id',
                                                        'label', 'order'
                                                    )
                                                    ->orderBy('order')
                                                    ->with([
                                                        'optionAnswer' => fn ($optionAnswer) =>
                                                            $optionAnswer->select('id', 'response_id', 'option_id')
                                                    ])
                                            ,
                                            'percentageAnswer' => fn ($percentageAnswer) =>
                                                $percentageAnswer->select('id', 'response_id', 'subcategory_id', 'percentage')
                                            ,
                                            'textAnswer' => fn ($textAnswer) =>
                                                $textAnswer->select('id', 'response_id', 'subcategory_id', 'answer')
                                        ])
                                        ->orderBy('order')
                                    ])
                                ->orderBy('order')
                        ])
                ])
                ->first()
            ;
            if( !$evaluationResponse ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Response not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Response successfully retrieved.',
                'evaluationResponse' => $evaluationResponse
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationResponses(Request $request)
    {

        // inputs:
        /*
            page: number = 1,                   // counting starts at 1
            limit: number = 10,
            form_id?: number,                   // gets all if none given
            evaluatee_id?: number,
            evaluator_id?: number,
            primary_commentor_id?: number,
            secondary_commentor_id?: number,
            commentor_id?: number,              // for both primary or secondary
            search: string,
                // searches for matches in:
                // updated_at (date string form), form_name, last_name, first_name,
                // middle_name, department_name, branch_name, status
            order_by: {
                key:
                    'updated_at' | 'form_name' | 'last_name' | 'first_name |
                    'middle_name' | 'department_name' |
                    'branch_name' |
                    'status'                // pending first -> finished last
                ,
                sort_order: 'asc' | 'desc' = 'asc'
            }[];
        */

        // returns:
        /*
            evaluationResponses: {
                id, form_id, form_name,
                date, evaluatee_id, last_name, first_name, middle_name,
                department_id, department_name,
                branch_id, branch_name,
                evaluator_id, primary_commentor_id, secondary_commentor_id,
                status,                             // returns 'pending' always for now
                period_start_at, period_end_at,
                created_at, updated_at
            }[],
            pageResponseCount, totalResponseCount, maxPageCount
        */

        log::info('EvaluationResponseController::getEvaluationResponses');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            if($request->page<1 || $request->limit<1) return response()->json([ 
                'status' => 404,
                'message' => 'No evaluation responses exist!'
            ]);

            $evaluationResponses = EvaluationResponse
                ::join('evaluation_forms', 'evaluation_responses.form_id', '=', 'evaluation_forms.id')
                ->join('users as evaluatees', 'evaluation_responses.evaluatee_id', '=', 'evaluatees.id')
                ->join('departments', 'evaluatees.department_id', '=', 'departments.id')
                ->join('branches', 'evaluatees.branch_id', '=', 'branches.id')
                ->join('users as evaluators', 'evaluation_responses.evaluator_id', '=', 'evaluators.id')
                ->join('users as primary_commentors', 'evaluation_responses.primary_commentor_id', '=', 'primary_commentors.id')
                ->join('users as secondary_commentors', 'evaluation_responses.secondary_commentor_id', '=', 'secondary_commentors.id')
                ->select(
                    'evaluation_responses.id',
                    'evaluation_forms.id as form_id', 'evaluation_forms.name as form_name'
                )
                ->selectRaw("date_format(evaluation_responses.updated_at, '%b %d, %Y') as date")
                ->addSelect(
                    'evaluatees.id as evaluatee_id', 'evaluatees.last_name as last_name',
                    'evaluatees.id as evaluatee_id', 'evaluatees.first_name as first_name',
                    'evaluatees.id as evaluatee_id', 'evaluatees.middle_name as middle_name',
                    'departments.id as department_id', 'departments.name as department_name',
                    'branches.id as branch_id', 'branches.name as branch_name',
                    'evaluators.id as evaluator_id',
                    'primary_commentors.id as primary_commentor_id',
                    'secondary_commentors.id as secondary_commentor_id',
                    'evaluation_responses.period_start_at',
                    'evaluation_responses.period_end_at',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->addSelect(DB::raw("'Pending' as status"))
            ;
            if($request->form_id)
                $evaluationResponses = $evaluationResponses->where('form_id', $request->form_id);
            if($request->evaluatee_id)
                $evaluationResponses = $evaluationResponses->where('evaluatee_id', $request->evaluatee_id);
            if($request->evaluator_id)
                $evaluationResponses = $evaluationResponses->where('evaluator_id', $request->evaluator_id);
            if($request->primary_commentor_id)
                $evaluationResponses = $evaluationResponses->where('primary_commentor_id', $request->primary_commentor_id);
            if($request->secondary_commentor_id)
                $evaluationResponses = $evaluationResponses->where('secondary_commentor_id', $request->secondary_commentor_id);
            if($request->commentor_id)
                $evaluationResponses = $evaluationResponses
                    ->where('primary_commentor_id', $request->commentor_id)
                    ->orWhere('secondary_commentor_id', $request->commentor_id)
                ;
            
            if($request->search)
                $evaluationResponses = $evaluationResponses
                    ->where(DB::raw("date_format(evaluation_responses.updated_at, '%b %d, %Y')"), 'LIKE', "%$request->search%")
                    ->orWhere('evaluation_forms.name', 'LIKE', "%$request->search%")
                    ->orWhere('evaluatees.last_name', 'LIKE', "%$request->search%")
                    ->orWhere('evaluatees.first_name', 'LIKE', "%$request->search%")
                    ->orWhere('evaluatees.middle_name', 'LIKE', "%$request->search%")
                    ->orWhere('departments.name', 'LIKE', "%$request->search%")
                    ->orWhere('branches.name', 'LIKE', "%$request->search%")
                    // ->orWhere('status', 'LIKE', "%$request->search%") // not working yet in searching status
                ;
            
            $sortOrder = $request->sort_order ?? 'asc';
            $sortOrderReverse = $sortOrder == 'asc' ? 'desc' : 'asc';
            if($sortOrder != 'asc' && $sortOrder != 'desc') return response()->json([ 
                'status' => 400,
                'message' => 'Sort order is invalid!'
            ]);
            if($request->order_by) foreach($request->order_by as $index => $order_by_param) {
                $sortOrder = $order_by_param['sort_order'] ?? 'asc';
                $sortOrderReverse = $sortOrder == 'asc' ? 'desc' : 'asc';
                if($sortOrder != 'asc' && $sortOrder != 'desc') return response()->json([ 
                    'status' => 400,
                    'message' => 'Sort order is invalid!'
                ]);
                switch($order_by_param['key']) {
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
            if($page > $maxPageCount) return response()->json([ 
                'status' => 404,
                'message' => 'No evaluation responses exist!'
            ]);
            $pageResponseCount =
                ($page * $limit > $totalResponseCount) ? $totalResponseCount % $limit
                : $limit
            ;
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

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationResponse(Request $request)
    {
        // inputs:
        /*
            evaluatee_id: number,
            evaluator_id: number,
            primary_commentor_id: number,
            secondary_commentor_id: number,
            form_id: number,
            period_start_at: string,
            period_end_at: string
        */

        // returns:
        /*
            evaluationFormID
        */

        log::info('EvaluationResponseController::saveEvaluationResponse');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select('*')->where('id', $userID)->first();

        try {

            if( $user === null ) return response()->json([ 
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            $periodStartAtSec = strtotime($request->period_start_at);
            $periodEndAtSec = strtotime($request->period_end_at);
            $request->period_start_at = date(
                'Y-m-d H:i:s', $periodStartAtSec - $periodStartAtSec % 82800
            );
            $request->period_end_at = date(
                'Y-m-d H:i:s', $periodEndAtSec + 86400 - $periodEndAtSec % 82800
            );
            if($periodStartAtSec>$periodEndAtSec) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Period Start Date cannot be more than Period End Date!'
            ]);

            DB::beginTransaction();
            
            $conflictingEvaluationResponse = EvaluationResponse
                ::where('evaluatee_id', $request->evaluatee_id)
                ->where('form_id', $request->form_id)
                ->where('period_start_at', '<', $request->period_end_at)
                ->where('period_end_at', '>', $request->period_start_at)
                ->first()
            ;
            if($conflictingEvaluationResponse) return response()->json([ 
                'status' => 400,
                'message' => 'This Evaluation is in conflict with another!',
                'evaluationFormID' => $conflictingEvaluationResponse->id
            ]);

            $newEvaluationResponse = EvaluationResponse::create([
                'evaluatee_id' => $request->evaluatee_id,
                'evaluator_id' => $request->evaluator_id,
                'primary_commentor_id' => $request->primary_commentor_id,
                'secondary_commentor_id' => $request->secondary_commentor_id,
                'form_id' => $request->form_id,
                'period_start_at' => $request->period_start_at,
                'period_end_at' => $request->period_end_at
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationResponseID' => $newEvaluationResponse->id,
                'message' => 'Evaluation Response successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

}
