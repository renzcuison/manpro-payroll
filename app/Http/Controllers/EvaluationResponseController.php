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

    // evaluation response

    public function deleteEvaluationForm(Request $request)
    {
        log::info('EvaluationResponseController::deleteEvaluationForm');

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

            DB::beginTransaction();

            $evaluationForm = EvaluationForm
                ::join('users', 'evaluation_forms.id', '=', 'users.id')
                ->select(
                    'evaluation_forms.id',
                    'evaluation_forms.name', 
                    'evaluation_forms.creator_id',
                    'users.user_name as creator_user_name',
                    'evaluation_forms.created_at',
                    'evaluation_forms.updated_at',
                    'evaluation_forms.deleted_at'
                )
                ->where('evaluation_forms.id', $request->id)
                ->first()
            ;

            if( !$evaluationForm ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form not found!',
                'evaluationFormID' => $request->id
            ]);

            if( $evaluationForm->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Form already deleted!',
                'evaluationForm' => $evaluationForm
            ]);

            $now = date('Y-m-d H:i');
            $evaluationForm->deleted_at = $now;
            $evaluationForm->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationForm' => $evaluationForm,
                'message' => 'Evaluation Form successfully deleted'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationForm(Request $request)
    {
        log::info('EvaluationResponseController::editEvaluationForm');

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

            DB::beginTransaction();

            $evaluationForm = EvaluationForm
                ::join('users', 'evaluation_forms.id', '=', 'users.id')
                ->select(
                    'evaluation_forms.id',
                    'evaluation_forms.name', 
                    'evaluation_forms.creator_id',
                    'users.user_name as creator_user_name',
                    'evaluation_forms.created_at',
                    'evaluation_forms.updated_at'
                )
                ->where('evaluation_forms.id', $request->id)
                ->first()
            ;

            if( !$evaluationForm ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form not found!',
                'evaluationFormID' => $request->id
            ]);

            $isEmptyName = !$request->name;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Name is required!'
            ]);

            $existingEvaluationForm =
                EvaluationForm::where('name', $request->name)->where('id', '!=', $request->id)->first()
            ;

            if( $existingEvaluationForm ) return response()->json([ 
                'status' => 409,
                'message' => 'This Evaluation Form Name is already in use!',
                'evaluationFormID' => $existingEvaluationForm->id
            ]);

            $evaluationForm->name = $request->name;
            $evaluationForm->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationForm' => $evaluationForm,
                'message' => 'Evaluation Form successfully updated'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationForm(Request $request)
    {

        log::info('EvaluationResponseController::getEvaluationResponses');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $getById = (bool) $request->id;
            if(!$getById && !$request->name) response()->json([
                'status' => 400,
                'message' => 'Either Evaluation Form ID or Name must be given!'
            ]);

            $evaluationForm = EvaluationForm
                ::join('users', 'evaluation_forms.id', '=', 'users.id')
                ->select(
                    'evaluation_forms.id',
                    'evaluation_forms.name', 
                    'evaluation_forms.creator_id',
                    'users.user_name as creator_user_name',
                    'evaluation_forms.created_at',
                    'evaluation_forms.updated_at'
                )
                ->where(
                    $getById ? 'evaluation_forms.id' : 'evaluation_forms.name',
                    $getById ? $request->id : $request->name
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
                                ->with(['options' => fn ($option) =>
                                    $option
                                        ->select(
                                            'subcategory_id', 'id',
                                            'label', 'order'
                                        )
                                        ->orderBy('order')
                                ])
                                ->orderBy('order')
                        ])
                        ->orderBy('order')
                ])
                ->first()
            ;
            if( !$evaluationForm ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Form not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Form successfully retrieved.',
                'evaluationForm' => $evaluationForm
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
            page: number = 1,
            limit: number = 10,
            form_id?: number,                   // gets all if none given
            evaluatee_id?: number,
            evaluator_id?: number,
            primary_commentor_id?: number,
            secondary_commentor_id?: number,
            search: string,
                // searches for matches in:
                // updated_at (string form), form_name, evaluatee_user_name,
                // department_name, designation_name, status
            order_by:
                'updated_at' | 'form_name' | 'evaluatee_user_name' | 'department_name' |
                'designation_name' |
                'status'                        // pending to done
            sort_order: 'asc' | 'desc' = 'asc'
        */

        // returns:
        /*
            evaluationResponses: {
                id, form_id, form_name,
                evaluatee_id, evaluatee_user_name,
                department_id, department_name,
                designation_id, designation_name,
                status,                             // returns 'pending' always for now
                period_start_at, period_end_at,
                created_at, updated_at
            }[]
        */

        log::info('EvaluationResponseController::getEvaluationResponses');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationResponses = EvaluationResponse
                ::join('users as evaluators', 'evaluation_responses.evaluator_id', '=', 'evaluators.id')
                ->join('users as evaluatees', 'evaluation_responses.evaluatee_id', '=', 'evaluatees.id')
                ->join('users as primary_commentors', 'evaluation_responses.primary_commentor_id', '=', 'primary_commentors.id')
                ->join('users as secondary_commentors', 'evaluation_responses.secondary_commentor_id', '=', 'secondary_commentors.id')
                ->join('evaluation_forms', 'evaluation_responses.form_id', '=', '')
                ->select(
                    'evaluation_responses.id',
                    'evaluatees.id as evaluatee_id', 'evaluatees.user_name as evaluatee_username',
                    'evaluators.id as evaluator_id', 'evaluators.user_name as evaluator_username',
                    'primary_commentors.id as primary_commentor_id', 'primary_commentors.user_name as primary_commentor_username',
                    'secondary_commentors.id as secondary_commentor_id', 'secondary_commentors.user_name as secondary_commentor_username',
                    'evaluation_responses.created_at',
                    'evaluation_responses.updated_at'
                )
                ->get()
            ;
            // if( $request->creator_id ) {

            //     $creator = DB::table('users')->select('*')->where('id', $request->creator_id)->first();
            //     if( !$creator ) return response()->json([ 
            //         'status' => 404,
            //         'message' => 'User creator not found!',
            //         'creatorID' => $request->creator_id
            //     ]);
            //     $evaluationFormResponses->where('evaluation_forms.creator_id', $request->creator_id);

            // }
            // $evaluationFormResponses = $evaluationFormResponses->orderBy('name')->get();
            // if( !$evaluationFormResponses->count() ) return response()->json([
            //     'status' => 200,
            //     'message' => 'No Evaluation Forms found.',
            //     'evaluationFormResponses' => $evaluationFormResponses
            // ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Responses successfully retrieved.',
                'evaluationResponses' => $evaluationResponses
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationForm(Request $request)
    {
        log::info('EvaluationResponseController::saveEvaluationForm');

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

            DB::beginTransaction();

            $isEmptyName = !$request->name;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Name is required!'
            ]);

            $existingEvaluationForm =
                EvaluationForm::where('name', $request->name)->first()
            ;

            if( $existingEvaluationForm ) return response()->json([ 
                'status' => 409,
                'message' => 'This Evaluation Form Name is already in use!',
                'evaluationFormID' => $existingEvaluationForm->id
            ]);

            $newEvaluationForm = EvaluationForm::create([
                'name' => $request->name,
                'creator_id' => $user->id
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationID' => $newEvaluationForm->id,
                'message' => 'Evaluation Form successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation form section

    public function deleteEvaluationFormSection(Request $request)
    {
        log::info('EvaluationResponseController::deleteEvaluationFormSection');

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

            DB::beginTransaction();

            $evaluationFormSection = EvaluationFormSection
                ::select('*')
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSection ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Section not found!',
                'evaluationFormSectionID' => $request->id
            ]);

            if( $evaluationFormSection->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Form Section already deleted!',
                'evaluationFormSection' => $evaluationFormSection
            ]);

            $now = date('Y-m-d H:i');
            $evaluationFormSection->deleted_at = $now;
            $evaluationFormSection->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSection' => $evaluationFormSection,
                'message' => 'Evaluation Form Section successfully deleted'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationFormSection(Request $request)
    {
        log::info('EvaluationResponseController::editEvaluationFormSection');

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

            DB::beginTransaction();

            $evaluationFormSection = EvaluationFormSection
                ::select(
                    'id', 'form_id', 'name', 'category', 'order', 'created_at',
                    'updated_at'
                )
                ->where('id', $request->id)
                ->first()
            ;

            if(!$evaluationFormSection) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Section not found!',
                'evaluationFormSectionID' => $request->id
            ]);

            $isEmptyName = $request->has('name') && !$request->name;
            if($isEmptyName) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Section Name is required!'
            ]);
            if($request->name)
                $evaluationFormSection->name = $request->name;
            if($request->category)
                $evaluationFormSection->category = $request->category;

            $evaluationFormSection->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSection' => $evaluationFormSection,
                'message' => 'Evaluation Form Section successfully updated'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationFormSection(Request $request)
    {

        log::info('EvaluationResponseController::getEvaluationFormSection');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationFormSection = EvaluationFormSection
                ::select('form_id', 'id', 'name', 'category', 'order')
                ->where('id', $request->id)
                ->with(['subcategories' => fn ($subcategory) =>
                    $subcategory
                        ->select(
                            'section_id', 'id',
                            'name', 'subcategory_type', 'description',
                            'required', 'allow_other_option',
                            'linear_scale_start', 'linear_scale_end',
                            'order'
                        )
                        ->with(['options' => fn ($option) =>
                            $option
                                ->select(
                                    'subcategory_id', 'id',
                                    'label', 'order'
                                )
                                ->orderBy('order')
                        ])
                        ->orderBy('order')
                ])
                ->orderBy('order')
                ->first()
            ;
            if( !$evaluationFormSection ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Form Section not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Form Section successfully retrieved.',
                'evaluationFormSection' => $evaluationFormSection
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }
    
    public function moveEvaluationFormSection(Request $request)
    {
        log::info('EvaluationResponseController::moveEvaluationFormSection');

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

            DB::beginTransaction();

            $evaluationFormSection = EvaluationFormSection
                ::select( 'id', 'form_id', 'name', 'order', 'created_at', 'updated_at' )
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSection ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Section not found!',
                'evaluationFormSectionID' => $request->id
            ]);

            $oldOrder = $evaluationFormSection->order;
            $newOrder = $request->order;
            $tempOrder = (
                EvaluationFormSection
                    ::where('form_id', $evaluationFormSection->form_id)
                    ->max('order')
                ?? -1
            ) + 1;
            if( $newOrder >= $tempOrder || $newOrder < 0 ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Section Order is not within valid range!',
                'evaluationFormSectionID' => $request->id
            ]);
            $evaluationFormSection->order = $tempOrder;
            $evaluationFormSection->save();
            
            $moveUp = $oldOrder < $newOrder;
            $evaluationFormSectionsToMove = EvaluationFormSection
                ::select( 'id', 'form_id', 'name', 'order', 'created_at', 'updated_at' )
                ->where('form_id', $evaluationFormSection->form_id)
                ->where('order', $moveUp ? '>' : '<', $oldOrder)
                ->where('order', $moveUp ? '<=' : '>=', $newOrder)
                ->orderBy('order', $moveUp ? 'asc' : 'desc')
                ->get()
            ;
            $curOrder = $oldOrder;
            foreach($evaluationFormSectionsToMove as $evaluationFormSectionToMove) {
                $evaluationFormSectionToMove->order = $curOrder;
                $evaluationFormSectionToMove->save();
                $curOrder += $moveUp ? 1 : -1;
            }

            $evaluationFormSection->order = $newOrder;
            $evaluationFormSection->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSection' => $evaluationFormSection,
                'message' => 'Evaluation Form Section successfully moved'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function saveEvaluationFormSection(Request $request)
    {
        log::info('EvaluationResponseController::saveEvaluationFormSection');

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

            DB::beginTransaction();

            $isEmptyName = !$request->name;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Section Name is required!'
            ]);

            $order = (
                EvaluationFormSection::where('form_id', $request->form_id)->max('order')
                ?? -1
            ) + 1;

            $newEvaluationFormSection = EvaluationFormSection::create([
                'form_id' => $request->form_id,
                'name' => $request->name,
                'category' => $request->category,
                'order' => $order
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationFormSectionID' => $newEvaluationFormSection->id,
                'message' => 'Evaluation Form Section successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationFormSubcategory(Request $request)
    {

        log::info('EvaluationResponseController::getEvaluationFormSubcategory');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationFormSubcategory = EvaluationFormSubcategory
                ::select(
                    'section_id', 'id',
                    'name', 'subcategory_type', 'description',
                    'required', 'allow_other_option',
                    'linear_scale_start', 'linear_scale_end',
                    'order'
                )
                ->where('id', $request->id)
                ->with(['options' => fn ($option) =>
                    $option
                        ->select(
                            'subcategory_id', 'id',
                            'label', 'order'
                        )
                        ->orderBy('order')
                ])
                ->first()
            ;
            if( !$evaluationFormSubcategory ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Form Subcategory not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Form Subcategory successfully retrieved.',
                'evaluationFormSubcategory' => $evaluationFormSubcategory
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function deleteEvaluationFormSubcategory(Request $request)
    {
        log::info('EvaluationResponseController::deleteEvaluationFormSubcategory');

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

            DB::beginTransaction();

            $evaluationFormSubcategory = EvaluationFormSubcategory
                ::select('*')
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSubcategory ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory not found!',
                'evaluationFormSubcategoryID' => $request->id
            ]);

            if( $evaluationFormSubcategory->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Form Subcategory already deleted!',
                'evaluationFormSubcategory' => $evaluationFormSubcategory
            ]);

            $now = date('Y-m-d H:i');
            $evaluationFormSubcategory->deleted_at = $now;
            $evaluationFormSubcategory->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSubcategory' => $evaluationFormSubcategory,
                'message' => 'Evaluation Form Subcategory successfully deleted'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationFormSubcategory(Request $request)
    {
        log::info('EvaluationResponseController::editEvaluationFormSubcategory');

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

            DB::beginTransaction();

            $evaluationFormSubcategory = EvaluationFormSubcategory
                ::select(
                    'id', 'section_id', 'name', 'description',
                    'subcategory_type', 'required', 'allow_other_option',
                    'linear_scale_start', 'linear_scale_end', 'order', 'created_at',
                    'updated_at'
                )
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSubcategory ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory not found!',
                'evaluationFormSubcategoryID' => $request->id
            ]);

            $isEmptyName = $request->has('name') && $request->name === null;
            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Name is required!'
            ]);

            $isEmptyDescription = $request->has('description') && $request->description === null;
            if( $isEmptyDescription ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Description is required!'
            ]);

            if($request->subcategory_type) {

                $subcategory_types = [
                    'short_answer', 'long_answer', 'multiple_choice',
                    'checkbox', 'linear_scale'
                ];
                if(!in_array($request->subcategory_type, $subcategory_types))
                    return response()->json([ 
                        'status' => 400,
                        'message' => 'Evaluation Form Subcategory Type is invalid!'
                    ]);
                    $evaluationFormSubcategory->subcategory_type = $request->subcategory_type;

            }
            if(is_bool($request->required) || is_numeric($request->required))
                $evaluationFormSubcategory->required = (int) $request->required;
            
             if(is_bool($request->allow_other_option) || is_numeric($request->allow_other_option))
                $evaluationFormSubcategory->allow_other_option = (int) $request->allow_other_option;
            
            if($request->linear_scale_start<0 || $request->linear_scale_end<0)
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Linear Scale Value cannot not be negative!'
                ]);
            if(is_numeric($request->linear_scale_start))
                $evaluationFormSubcategory->linear_scale_start = $request->linear_scale_start;
            if(is_numeric($request->linear_scale_end))
                $evaluationFormSubcategory->linear_scale_end = $request->linear_scale_end;
            if($evaluationFormSubcategory->linear_scale_start>=$evaluationFormSubcategory->linear_scale_end)
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Linear Scale Start must be less than End!'
                ]);
            $isEmptyLinearScaleStartLabel = $request->has('linear_scale_start_label') && $request->linear_scale_start_label === null;
            if( $isEmptyLinearScaleStartLabel ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Linear Scale Start Label is required!'
            ]);
            $isEmptyLinearScaleEndLabel = $request->has('linear_scale_end_label') && $request->linear_scale_end_label === null;
            if( $isEmptyLinearScaleEndLabel ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Linear Scale End Label is required!'
            ]);
            $evaluationFormSubcategory->linear_scale_start_label = $request->linear_scale_start_label;
            $evaluationFormSubcategory->linear_scale_end_label = $request->linear_scale_end_label;

            $evaluationFormSubcategory->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSubcategory' => $evaluationFormSubcategory,
                'message' => 'Evaluation Form Subcategory successfully updated'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

        // move evaluation form subcategory

    public function saveEvaluationFormSubcategory(Request $request)
    {
        log::info('EvaluationResponseController::saveEvaluationFormSubcategory');

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

            DB::beginTransaction();

            $isEmptyName = !$request->name;
            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Name is required!'
            ]);

            $isEmptyDescription = !$request->description;
            if( $isEmptyDescription ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Description is required!'
            ]);

            $order = (
                EvaluationFormSubcategory
                    ::where('section_id', $request->section_id)->max('order')
                ?? -1
            ) + 1;
            $subcategoryTypes = [
                'short_answer', 'long_answer', 'multiple_choice',
                'checkbox', 'linear_scale'
            ];
            if(!in_array($request->subcategory_type, $subcategoryTypes))
                return response()->json([ 
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Type is invalid!'
                ]);
            if($request->linear_scale_start<0 || $request->linear_scale_end<0)
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Linear Scale Value cannot not be negative!'
                ]);
            if(
                is_numeric($request->linear_scale_start)
                && is_numeric($request->linear_scale_end)
                && $request->linear_scale_start>=$request->linear_scale_end
            ) return response()->json([
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Linear Scale Start must be less than End!'
            ]);
            $isEmptyLinearScaleStartLabel = !$request->linear_scale_start_label;
            if( $isEmptyLinearScaleStartLabel ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Linear Scale Start Label is required!'
            ]);
            $isEmptyLinearScaleEndLabel = !$request->linear_scale_end_label;
            if( $isEmptyLinearScaleEndLabel ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Linear Scale End Label is required!'
            ]);

            $newEvaluationFormSubcategory = EvaluationFormSubcategory::create([
                'section_id' => $request->section_id,
                'name' => $request->name,
                'subcategory_type' => $request->subcategory_type,
                'description' => $request->description,
                'required' => 1,
                'allow_other_option' => $request->allow_other_option,
                'linear_scale_start' => $request->linear_scale_start,
                'linear_scale_end' => $request->linear_scale_end,
                'linear_scale_start_label' => $request->linear_scale_start_label,
                'linear_scale_end_label' => $request->linear_scale_end_label,
                'order' => $order
            ]);

            if($request->options) {
                $labels = array();
                foreach($request->options as $order => $option) {
                    $label = $option["label"];
                    $isEmptyName = !$label;
                    if( $isEmptyName ) return response()->json([ 
                        'status' => 400,
                        'message' => 'Evaluation Form Subcategory Option Labels are required!'
                    ]);

                    $isRepeated = in_array($label, $labels);
                    if($isRepeated) return response()->json([ 
                        'status' => 409,
                        'message' => 'Evaluation Form Subcategory Option Labels must be unique!'
                    ]);
                    $labels[] = $label;

                    EvaluationFormSubcategoryOption::create([
                        'subcategory_id' => $newEvaluationFormSubcategory->id,
                        'label' => $label,
                        'order' => $order
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 201,
                'evaluationFormSubcategoryID' => $newEvaluationFormSubcategory->id,
                'message' => 'Evaluation Form Subcategory successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // public function saveEvaluationFormSubcategory(Request $request)
    // {
    //     log::info('EvaluationResponseController::saveEvaluationFormSubcategory');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('users')->select('*')->where('id', $userID)->first();

    //     try {

    //         if ($user === null) return response()->json([
    //             'status' => 403,
    //             'message' => 'Unauthorized access!'
    //         ]);

    //         DB::beginTransaction();

    //         if (!$request->name) return response()->json([
    //             'status' => 400,
    //             'message' => 'Evaluation Form Subcategory Name is required!'
    //         ]);
    //         if (!$request->description) return response()->json([
    //             'status' => 400,
    //             'message' => 'Evaluation Form Subcategory Description is required!'
    //         ]);
    //         if (!$request->category_id) return response()->json([
    //             'status' => 400,
    //             'message' => 'Category ID is required!'
    //         ]);

    //         // Map frontend responseType to backend subcategory_type
    //         $typeMap = [
    //             'shortText' => 'short_answer',
    //             'longText' => 'long_answer',
    //             'multipleChoice' => 'multiple_choice',
    //             'checkbox' => 'checkbox',
    //             'linearScale' => 'linear_scale',
    //         ];
    //         $subcategory_type = $typeMap[$request->subcategory_type ?? $request->subcategoryType ?? $request->responseType] ?? 'short_answer';

    //         $max =
    //             EvaluationFormSubcategory
    //                 ::where('category_id', $request->category_id)->max('order')
    //                 ?? -1
    //         ;

    //         // Default values
    //         $linear_scale_start = 1;
    //         $linear_scale_end = 5;
    //         if ($subcategory_type == 'linear_scale') {
    //             $linear_scale_start = $request->minValue ?? 1;
    //             $linear_scale_end = $request->maxValue ?? 5;
    //         }

    //         $newEvaluationFormSubcategory = EvaluationFormSubcategory::create([
    //             'category_id' => $request->category_id,
    //             'name' => $request->name,
    //             'subcategory_type' => $subcategory_type,
    //             'description' => $request->description,
    //             'required' => 1,
    //             'linear_scale_start' => $linear_scale_start,
    //             'linear_scale_end' => $linear_scale_end,
    //             'order' => $max + 1
    //         ]);

    //         // Save options if present (for multiple choice / checkbox)
    //         if (
    //             ($subcategory_type == 'multiple_choice' || $subcategory_type == 'checkbox') &&
    //             is_array($request->options)
    //         ) {
    //             foreach ($request->options as $i => $label) {
    //                 if (!trim($label)) continue;
    //                 EvaluationFormSubcategoryOption::create([
    //                     'subcategory_id' => $newEvaluationFormSubcategory->id,
    //                     'label' => $label,
    //                     'order' => $i + 1
    //                 ]);
    //             }
    //         }

    //         DB::commit();

    //         return response()->json([
    //             'status' => 201,
    //             'evaluationFormSubcategoryID' => $newEvaluationFormSubcategory->id,
    //             'message' => 'Evaluation Form Subcategory successfully created'
    //         ]);
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // evaluation form subcategory option

    public function deleteEvaluationFormSubcategoryOption(Request $request)
    {
        log::info('EvaluationResponseController::deleteEvaluationFormSubcategoryOption');

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

            DB::beginTransaction();

            $evaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::select('*')
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSubcategoryOption ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory Option not found!',
                'evaluationFormSubcategoryOptionID' => $request->id
            ]);

            if( $evaluationFormSubcategoryOption->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Form Subcategory Option already deleted!',
                'evaluationFormSubcategoryOption' => $evaluationFormSubcategoryOption
            ]);

            $now = date('Y-m-d H:i');
            $evaluationFormSubcategoryOption->deleted_at = $now;
            $evaluationFormSubcategoryOption->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSubcategoryOption' => $evaluationFormSubcategoryOption,
                'message' => 'Evaluation Form Subcategory Option successfully deleted'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationFormSubcategoryOption(Request $request)
    {
        log::info('EvaluationResponseController::editEvaluationFormSubcategoryOption');

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

            DB::beginTransaction();

            $evaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::select( 'id', 'subcategory_id', 'label', 'order', 'created_at', 'updated_at' )
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSubcategoryOption ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory Option not found!',
                'evaluationFormSubcategoryOptionID' => $request->id
            ]);

            $isEmptyName = !$request->label;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Option Label is required!'
            ]);

            $existingEvaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::where('subcategory_id', $evaluationFormSubcategoryOption->subcategory_id)
                ->where('label', $request->label)
                ->where('id', '!=', $request->id)
                ->first()
            ;

            if( $existingEvaluationFormSubcategoryOption ) return response()->json([ 
                'status' => 409,
                'message' => 'This Evaluation Form Subcategory Option Label is already in use!',
                'evaluationFormSubcategoryOptionID' => $existingEvaluationFormSubcategoryOption->id
            ]);

            $evaluationFormSubcategoryOption->label = $request->label;
            $evaluationFormSubcategoryOption->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSubcategoryOption' => $evaluationFormSubcategoryOption,
                'message' => 'Evaluation Form Subcategory Option successfully updated'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function getEvaluationFormSubcategoryOption(Request $request)
    {

        log::info('EvaluationResponseController::getEvaluationFormSubcategoryOption');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::select(
                    'subcategory_id', 'id',
                    'label', 'order'
                )
                ->where('id', $request->id)
                ->orderBy('order')
                ->first()
            ;
            if( !$evaluationFormSubcategoryOption ) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Form Subcategory Option not found!'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Form Subcategory Option successfully retrieved.',
                'evaluationFormSubcategoryOption' => $evaluationFormSubcategoryOption
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

        // move evaluation form subcategory option

    public function saveEvaluationFormSubcategoryOption(Request $request)
    {
        log::info('EvaluationResponseController::saveEvaluationFormSubcategoryOption');

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

            DB::beginTransaction();

            $isEmptyName = !$request->label;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Option Label is required!'
            ]);

            $existingEvaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::where('subcategory_id', $request->subcategory_id)
                ->where('label', $request->label)
                ->first()
            ;

            if( $existingEvaluationFormSubcategoryOption ) return response()->json([ 
                'status' => 409,
                'message' => 'This Evaluation Form Subcategory Option Label is already in use!',
                'evaluationFormSubcategoryOptionID' => $existingEvaluationFormSubcategoryOption->id
            ]);

            $order = (
                EvaluationFormSubcategoryOption::where('subcategory_id', $request->subcategory_id)->max('order')
                ?? -1
            ) + 1;

            $newEvaluationFormSubcategoryOption = EvaluationFormSubcategoryOption::create([
                'subcategory_id' => $request->subcategory_id,
                'label' => $request->label,
                'order' => $order
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationSubcategoryOptionID' => $newEvaluationFormSubcategoryOption->id,
                'message' => 'Evaluation Form Subcategory Option successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

}
