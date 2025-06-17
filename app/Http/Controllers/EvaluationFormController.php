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
class EvaluationFormController extends Controller
{

    public function deleteEvaluationForm(Request $request)
    {
        // inputs:
        /*
            id: number
        */

        // returns:
        /*
            evaluationForm: {
                id, name, creator_id, creator_user_name,
                created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationFormController::deleteEvaluationForm');

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

            $evaluationForm = EvaluationForm::find($request->id);

            if (!$evaluationForm) {
                return response()->json([ 
                    'status' => 404,
                    'message' => 'Evaluation Form not found!',
                    'evaluationFormID' => $request->id
                ]);
            }

            if ($evaluationForm->deleted_at) {
                return response()->json([ 
                    'status' => 405,
                    'message' => 'Evaluation Form already deleted!',
                    'evaluationForm' => $evaluationForm
                ]);
            }

            $evaluationForm->deleted_at = now();
            $evaluationForm->save();

            // Get creator name for response
            $creator = \DB::table('users')->where('id', $evaluationForm->creator_id)->first();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationForm' => [
                    'id' => $evaluationForm->id,
                    'name' => $evaluationForm->name,
                    'creator_id' => $evaluationForm->creator_id,
                    'creator_user_name' => $creator ? $creator->user_name : null,
                    'created_at' => $evaluationForm->created_at,
                    'updated_at' => $evaluationForm->updated_at,
                    'deleted_at' => $evaluationForm->deleted_at,
                ],
                'message' => 'Evaluation Form successfully deleted'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            log::error('Error deleting evaluation form: ' . $e->getMessage());
            throw $e;
        }
    }

    public function editEvaluationForm(Request $request)
    {
        // inputs:
        /*
            id: number,
            name: string
        */

        // returns:
        /*
            evaluationForm: {
                id, name, creator_id, creator_user_name,
                created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationFormController::editEvaluationForm');

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
                ->whereNull('evaluation_forms.deleted_at')
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
        // inputs:
        /*
            id?: number,                        // either id or name must be given
            name?: string
        */

        // returns:
        /*
            evaluationForm: {
                id, name, creator_id, creator_user_name,
                created_at, updated_at,
                sections: {
                    form_id, id, name, category, score, order,
                    subcategories: {
                        section_id, id, name, subcategory_type, description, required,
                        allow_other_option, linear_scale_start, linear_scale_end, order,
                        options: {
                            subcategory_id, id, label, order
                        }[]
                    }[]
                }[]
            }
        */

        log::info('EvaluationFormController::getEvaluationForms');

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
                ::join('users', 'evaluation_forms.creator_id', '=', 'users.id')                
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
                ->whereNull('evaluation_forms.deleted_at')
                ->with(['sections' => fn ($section) =>
                    $section
                        ->select('form_id', 'id', 'name', 'category', 'score', 'order', 'description')
                        ->whereNull('deleted_at')
                        ->with(['subcategories' => fn ($subcategory) =>
                            $subcategory
                                ->select(
                                    'section_id', 'id',
                                    'name', 'subcategory_type', 'description',
                                    'required', 'allow_other_option',
                                    'linear_scale_start', 'linear_scale_end',
                                    'order'
                                )
                                ->whereNull('deleted_at')
                                ->with(['options' => fn ($option) =>
                                    $option
                                        ->select(
                                            'subcategory_id', 'id',
                                            'label', 'score', 'order', 'description'
                                        )
                                        ->whereNull('deleted_at')
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

    public function getEvaluationForms(Request $request)
    {
        // inputs:
        /*
            creator_id?: number
        */

        // returns:
        /*
            evaluationForms: {
                id, name, creator_id, creator_user_name, created_at, updated_at
            }[]
        */

        log::info('EvaluationFormController::getEvaluationForms');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationForms = EvaluationForm
                ::join('users', 'evaluation_forms.creator_id', '=', 'users.id')                
                ->select(
                    'evaluation_forms.id',
                    'evaluation_forms.name', 
                    'evaluation_forms.creator_id',
                    'users.user_name as creator_user_name',
                    'evaluation_forms.created_at',
                    'evaluation_forms.updated_at'
                )
                ->whereNull('evaluation_forms.deleted_at')
            ;
            if( $request->creator_id ) {

                $creator = DB::table('users')->select()->where('id', $request->creator_id)->first();
                if( !$creator ) return response()->json([ 
                    'status' => 404,
                    'message' => 'User creator not found!',
                    'creatorID' => $request->creator_id
                ]);
                $evaluationForms->where('evaluation_forms.creator_id', $request->creator_id);

            }
            $evaluationForms = $evaluationForms->orderBy('name')->get();
            if( !$evaluationForms->count() ) return response()->json([
                'status' => 200,
                'message' => 'No Evaluation Forms found.',
                'evaluationForms' => $evaluationForms
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Forms successfully retrieved.',
                'evaluationForms' => $evaluationForms
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function saveEvaluationForm(Request $request)
    {
        // inputs:
        /*
            name: string
        */

        // returns:
        /*
            evaluationFormID
        */

        log::info('EvaluationFormController::saveEvaluationForm');

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
        // inputs:
        /*
            id: number
        */

        // returns:
        /*
            evaluationFormSection: {
                id, name, order, created_at, updated_at, deleted_at
            }
        */

        log::info('EvaluationFormController::deleteEvaluationFormSection');

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

            $evaluationFormSection = EvaluationFormSection
                ::select()
                ->where('id', $request->id)
                ->whereNull('deleted_at')
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
        // inputs:
        /*
            id: number,
            name?: string,
            category?: string,
            score?: number
        */

        // returns:
        /*
            evaluationFormSection: {
                id, name, category, order, score, created_at, updated_at
            }
        */

        log::info('EvaluationFormController::editEvaluationFormSection');

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

            $evaluationFormSection = EvaluationFormSection
                ::select(
                    'id', 'form_id', 'name', 'category', 'order', 'created_at',
                    'updated_at'
                )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationFormSection) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Section not found!',
                'evaluationFormSectionID' => $request->id
            ]);

            if($request->name != null)
                $evaluationFormSection->name = $request->name;
            if($request->category != null)
                $evaluationFormSection->category = $request->category;
            if($request->score != null)
                $evaluationFormSection->score = (double) $request->score;

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
        // inputs:
        /*
            id: number
        */

        // returns:
        /*
            evaluationFormSection: {
                id, form_id, name, category, score, order, created_at, updated_at,
                subcategories: {
                    section_id, id, name, subcategory_type, description, required,
                    allow_other_option, linear_scale_start, linear_scale_end, order,
                    options: {
                        subcategory_id, id, label, order
                    }[]
                }[]
            }
        */

        log::info('EvaluationFormController::getEvaluationFormSection');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationFormSection = EvaluationFormSection
                ::select('form_id', 'id', 'name', 'category', 'score', 'order')
                ->where('id', $request->id)
                ->with(['subcategories' => fn ($subcategory) =>
                    $subcategory
                        ->whereNull('deleted_at')
                        ->select(
                            'section_id', 'id',
                            'name', 'subcategory_type', 'description',
                            'required', 'allow_other_option',
                            'linear_scale_start', 'linear_scale_end',
                            'order'
                        )
                        ->whereNull('deleted_at')
                        ->with(['options' => fn ($option) =>
                            $option
                                ->select(
                                    'subcategory_id', 'id',
                                    'label', 'score', 'order'
                                )
                                ->whereNull('deleted_at')
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
        // inputs:
        /*
            id: number,
            order: number              // counting start at 1 
        */

        // returns:
        /*
            evaluationFormSection: {
                id, name, order, created_at, updated_at
            }
        */

        log::info('EvaluationFormController::moveEvaluationFormSection');

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

            $evaluationFormSection = EvaluationFormSection
                ::select( 'id', 'form_id', 'name', 'order', 'created_at', 'updated_at' )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
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
                ?? 0
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
                ->whereNull('deleted_at')
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
        // inputs:
        /*
            form_id: number,
            name: string,
            category: string,
            score: number
        */

        // returns:
        /*
            evaluationFormSectionID
        */

        log::info('EvaluationFormController::saveEvaluationFormSection');

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

            $isEmptyName = !$request->name;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Section Name is required!'
            ]);

            $order = (
                EvaluationFormSection::where('form_id', $request->form_id)->max('order')
                ?? 0
            ) + 1;

            $newEvaluationFormSection = EvaluationFormSection::create([
                'form_id' => $request->form_id,
                'name' => $request->name,
                'category' => $request->category,
                'order' => $order,
                'score' => (double) $request->score
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

    // evaluation form subcategory

    public function deleteEvaluationFormSubcategory(Request $request)
    {
        log::info('EvaluationFormController::deleteEvaluationFormSubcategory');

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

            $evaluationFormSubcategory = EvaluationFormSubcategory
                ::select()
                ->where('id', $request->id)
                ->whereNull('deleted_at')
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
        log::info('EvaluationFormController::editEvaluationFormSubcategory');

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

            $evaluationFormSubcategory = EvaluationFormSubcategory
                ::select(
                    'id', 'section_id', 'name', 'description',
                    'subcategory_type', 'required', 'allow_other_option',
                    'linear_scale_start', 'linear_scale_end', 'order', 'created_at',
                    'updated_at'
                )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
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

    public function getEvaluationFormSubcategory(Request $request)
    {
        log::info('EvaluationFormController::getEvaluationFormSubcategory');

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
                    'linear_scale_start_label', 'linear_scale_end_label',
                    'order'
                )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
                ->with(['options' => function ($option) {
                    $option
                        ->select(
                            'subcategory_id', 'id',
                            'label', 'score', 'order', 'description'
                        )
                        ->whereNull('deleted_at')
                        ->orderBy('order');
                }])
                ->first();

            if (!$evaluationFormSubcategory) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Evaluation Form Subcategory not found!'
                ]);
            }
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Form Subcategory successfully retrieved.',
                'evaluationFormSubcategory' => $evaluationFormSubcategory
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error retrieving evaluation form subcategory: ' . $e->getMessage());
            throw $e;
        }
    }

    public function moveEvaluationFormSubcategory(Request $request)
    {
        // inputs:
        /*
            id: number,
            order: number              // counting start at 1 
        */

        // returns:
        /*
            evaluationFormSubcategory: {
                id, section_id, name, order, created_at, updated_at
            }
        */

        log::info('EvaluationFormController::moveEvaluationFormSubcategory');

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

            $evaluationFormSubcategory = EvaluationFormSubcategory
                ::select( 'id', 'section_id', 'name', 'order', 'created_at', 'updated_at' )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if( !$evaluationFormSubcategory ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory not found!',
                'evaluationFormSubcategoryID' => $request->id
            ]);

            $oldOrder = $evaluationFormSubcategory->order;
            $newOrder = $request->order;
            $tempOrder = (
                EvaluationFormSubcategory
                    ::where('section_id', $evaluationFormSubcategory->section_id)
                    ->max('order')
                ?? 0
            ) + 1;
            if( $newOrder >= $tempOrder || $newOrder < 0 ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Order is not within valid range!',
                'evaluationFormSubcategoryID' => $request->id
            ]);
            $evaluationFormSubcategory->order = $tempOrder;
            $evaluationFormSubcategory->save();
            
            $moveUp = $oldOrder < $newOrder;
            $evaluationFormSubcategoriesToMove = EvaluationFormSubcategory
                ::select('id', 'section_id', 'order')
                ->where('section_id', $evaluationFormSubcategory->section_id)
                ->whereNull('deleted_at')
                ->where('order', $moveUp ? '>' : '<', $oldOrder)
                ->where('order', $moveUp ? '<=' : '>=', $newOrder)
                ->orderBy('order', $moveUp ? 'asc' : 'desc')
                ->get()
            ;
            $curOrder = $oldOrder;
            foreach($evaluationFormSubcategoriesToMove as $evaluationFormSubcategoryToMove) {
                $evaluationFormSubcategoryToMove->order = $curOrder;
                $evaluationFormSubcategoryToMove->save();
                $curOrder += $moveUp ? 1 : -1;
            }

            $evaluationFormSubcategory->order = $newOrder;
            $evaluationFormSubcategory->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSubcategory' => $evaluationFormSubcategory,
                'oldOrder' => $oldOrder,
                'newOrder' => $newOrder,
                'message' => 'Evaluation Form Subcategory successfully moved'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function saveEvaluationFormSubcategory(Request $request)
    {
        \Log::info('EvaluationFormController::saveEvaluationFormSubcategory');

        $userID = Auth::check() ? Auth::id() : null;
        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {
            if ($user === null) {
                return response()->json([
                    'status' => 403,
                    'message' => 'Unauthorized access!'
                ]);
            }

            DB::beginTransaction();

            // Validate required fields
            if (!$request->name) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Name is required!'
                ]);
            }
            if (!$request->description) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Description is required!'
                ]);
            }

            $subcategoryTypes = [
                'short_answer', 'long_answer', 'multiple_choice', 'checkbox', 'linear_scale'
            ];
            if (!in_array($request->subcategory_type, $subcategoryTypes)) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Evaluation Form Subcategory Type is invalid!'
                ]);
            }

            // ---- UPDATE LOGIC ----
            if ($request->id) {
                $subcategory = \App\Models\EvaluationFormSubcategory::find($request->id);
                if (!$subcategory) {
                    return response()->json([
                        'status' => 404,
                        'message' => 'Subcategory not found!'
                    ]);
                }
                $subcategory->name = $request->name;
                $subcategory->subcategory_type = $request->subcategory_type;
                $subcategory->description = $request->description;
                $subcategory->required = 1;
                $subcategory->allow_other_option = $request->allow_other_option ?? 0;

                // Only handle linear scale fields if type is linear_scale
                if ($request->subcategory_type === 'linear_scale') {
                    if ($request->linear_scale_start < 0 || $request->linear_scale_end < 0) {
                        return response()->json([
                            'status' => 400,
                            'message' => 'Linear Scale Value cannot be negative!'
                        ]);
                    }
                    if (
                        is_numeric($request->linear_scale_start)
                        && is_numeric($request->linear_scale_end)
                        && $request->linear_scale_start >= $request->linear_scale_end
                    ) {
                        return response()->json([
                            'status' => 400,
                            'message' => 'Linear Scale Start must be less than End!'
                        ]);
                    }
                    if (!$request->linear_scale_start_label) {
                        return response()->json([
                            'status' => 400,
                            'message' => 'Linear Scale Start Label is required!'
                        ]);
                    }
                    if (!$request->linear_scale_end_label) {
                        return response()->json([
                            'status' => 400,
                            'message' => 'Linear Scale End Label is required!'
                        ]);
                    }
                    $subcategory->linear_scale_start = $request->linear_scale_start;
                    $subcategory->linear_scale_end = $request->linear_scale_end;
                    $subcategory->linear_scale_start_label = $request->linear_scale_start_label;
                    $subcategory->linear_scale_end_label = $request->linear_scale_end_label;
                } else {
                    $subcategory->linear_scale_start = null;
                    $subcategory->linear_scale_end = null;
                    $subcategory->linear_scale_start_label = null;
                    $subcategory->linear_scale_end_label = null;
                }

                $subcategory->save();

                // ---- BATCH REPLACE OPTIONS ----
                if (in_array($request->subcategory_type, ['multiple_choice', 'checkbox'])) {
                    // Remove ALL existing options
                    \App\Models\EvaluationFormSubcategoryOption::where('subcategory_id', $subcategory->id)->delete();
                    // Add all new options
                    if ($request->options && is_array($request->options)) {
                        $labels = [];
                        foreach ($request->options as $optionOrder => $option) {
                            $label = $option["label"] ?? null;
                            if (!$label) {
                                return response()->json([
                                    'status' => 400,
                                    'message' => 'Option Labels are required!'
                                ]);
                            }
                            if (in_array($label, $labels)) {
                                return response()->json([
                                    'status' => 409,
                                    'message' => 'Option Labels must be unique!'
                                ]);
                            }
                            $labels[] = $label;
                            \App\Models\EvaluationFormSubcategoryOption::create([
                                'subcategory_id' => $subcategory->id,
                                'label' => $label,
                                'score' => (isset($option['score']) && is_numeric($option['score']) ? (double) $option['score'] : 1),
                                'order' => $optionOrder + 1,
                                'description' => $option['description'] ?? null,
                                
                            ]);
                        }
                    }
                } else {
                    // For other types, ensure all options are removed
                    \App\Models\EvaluationFormSubcategoryOption::where('subcategory_id', $subcategory->id)->delete();
                }

                DB::commit();

                return response()->json([
                    'status' => 200,
                    'evaluationFormSubcategoryID' => $subcategory->id,
                    'message' => 'Evaluation Form Subcategory successfully updated'
                ]);
            }

            // ---- CREATE LOGIC (your original code, unchanged) ----
            $order = (
                \App\Models\EvaluationFormSubcategory::where('section_id', $request->section_id)->max('order') ?? 0
            ) + 1;
            $data = [
                'section_id' => $request->section_id,
                'name' => $request->name,
                'subcategory_type' => $request->subcategory_type,
                'description' => $request->description,
                'required' => 1,
                'allow_other_option' => $request->allow_other_option ?? 0,
                'order' => $order,
                'linear_scale_start' => $request->subcategory_type === 'linear_scale' ? $request->linear_scale_start : null,
                'linear_scale_end' => $request->subcategory_type === 'linear_scale' ? $request->linear_scale_end : null,
                'linear_scale_start_label' => $request->subcategory_type === 'linear_scale' ? $request->linear_scale_start_label : null,
                'linear_scale_end_label' => $request->subcategory_type === 'linear_scale' ? $request->linear_scale_end_label : null,
            ];
            $newEvaluationFormSubcategory = \App\Models\EvaluationFormSubcategory::create($data);

            if (in_array($request->subcategory_type, ['multiple_choice', 'checkbox'])) {
                if ($request->options && is_array($request->options)) {
                    $labels = [];
                    foreach ($request->options as $optionOrder => $option) {
                        $label = $option["label"] ?? null;
                        if (!$label) {
                            return response()->json([
                                'status' => 400,
                                'message' => 'Option Labels are required!'
                            ]);
                        }
                        if (in_array($label, $labels)) {
                            return response()->json([
                                'status' => 409,
                                'message' => 'Option Labels must be unique!'
                            ]);
                        }
                        $labels[] = $label;
                        \App\Models\EvaluationFormSubcategoryOption::create([
                            'subcategory_id' => $newEvaluationFormSubcategory->id,
                            'label' => $label,
                            'score' => (isset($option['score']) && is_numeric($option['score']) ? (double) $option['score'] : 1),
                            'order' => $optionOrder + 1,
                            'description' => $option['description'] ?? null,
                        ]);
                    }
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
            \Log::error('Error saving evaluation form subcategory: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteEvaluationFormSubcategoryOption(Request $request)
    {
        log::info('EvaluationFormController::deleteEvaluationFormSubcategoryOption');

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

            $evaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::select()
                ->where('id', $request->id)
                ->whereNull('deleted_at')
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
        log::info('EvaluationFormController::editEvaluationFormSubcategoryOption');

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

            $evaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::select('id', 'subcategory_id', 'label', 'description', 'score', 'order', 'created_at', 'updated_at')
                ->where('id', $request->id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if( !$evaluationFormSubcategoryOption ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory Option not found!',
                'evaluationFormSubcategoryOptionID' => $request->id
            ]);

            if($request->has('label')) {
                $isEmptyName = ($request->label === "");
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
            }
            if($request->has('score'))
                $evaluationFormSubcategoryOption->score = (double) $request->score;
            
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

        log::info('EvaluationFormController::getEvaluationFormSubcategoryOption');

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
                    'label', 'score', 'order', 'description'
                )
                ->where('id', $request->id)
                ->whereNull('deleted_at')
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

    public function moveEvaluationFormSubcategoryOption(Request $request)
    {
        // inputs:
        /*
            id: number,
            order: number              // counting start at 1 
        */

        // returns:
        /*
            evaluationFormSubcategoryOption: {
                id, subcategory_id, label, order, created_at, updated_at
            }
        */

        log::info('EvaluationFormController::moveEvaluationFormSubcategoryOption');

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

            $evaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::select('id', 'subcategory_id', 'label', 'score', 'order', 'created_at', 'updated_at')
                ->where('id', $request->id)
                ->whereNull('deleted_at')
                ->first()
            ;

            if(!$evaluationFormSubcategoryOption) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form SubcategoryOption not found!',
                'evaluationFormSubcategoryOptionID' => $request->id
            ]);

            $oldOrder = $evaluationFormSubcategoryOption->order;
            $newOrder = $request->order;
            $tempOrder = (
                EvaluationFormSubcategoryOption
                    ::where('subcategory_id', $evaluationFormSubcategoryOption->subcategory_id)
                    ->max('order')
                ?? 0
            ) + 1;
            if($newOrder >= $tempOrder || $newOrder < 0) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Option Order is not within valid range!',
                'evaluationFormSubcategoryOptionID' => $request->id
            ]);
            $evaluationFormSubcategoryOption->order = $tempOrder;
            $evaluationFormSubcategoryOption->save();
            
            $moveUp = $oldOrder < $newOrder;
            $evaluationFormSubcategoriesToMove = EvaluationFormSubcategoryOption
                ::select('id', 'subcategory_id', 'order')
                ->where('subcategory_id', $evaluationFormSubcategoryOption->subcategory_id)
                ->whereNull('deleted_at')
                ->where('order', $moveUp ? '>' : '<', $oldOrder)
                ->where('order', $moveUp ? '<=' : '>=', $newOrder)
                ->orderBy('order', $moveUp ? 'asc' : 'desc')
                ->get()
            ;
            $curOrder = $oldOrder;
            foreach($evaluationFormSubcategoriesToMove as $evaluationFormSubcategoryOptionToMove) {
                $evaluationFormSubcategoryOptionToMove->order = $curOrder;
                $evaluationFormSubcategoryOptionToMove->save();
                $curOrder += $moveUp ? 1 : -1;
            }

            $evaluationFormSubcategoryOption->order = $newOrder;
            $evaluationFormSubcategoryOption->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormSubcategoryOption' => $evaluationFormSubcategoryOption,
                'oldOrder' => $oldOrder,
                'newOrder' => $newOrder,
                'message' => 'Evaluation Form Subcategory Option successfully moved'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function saveEvaluationFormSubcategoryOption(Request $request)
    {
        \Log::info('EvaluationFormController::saveEvaluationFormSubcategoryOption');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('users')->select()->where('id', $userID)->first();

        try {
            if ($user === null) return response()->json([
                'status' => 403,
                'message' => 'Unauthorized access!'
            ]);

            DB::beginTransaction();

            $isEmptyName = !$request->label;
            if ($isEmptyName) return response()->json([
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Option Label is required!'
            ]);

            // Fetch the subcategory to check its type
            $subcategory = EvaluationFormSubcategory::where('id', $request->subcategory_id)->first();
            if (!$subcategory) return response()->json([
                'status' => 404,
                'message' => 'Evaluation Form Subcategory not found!'
            ]);

            // Only allow options for multiple_choice and checkbox types
            if (!in_array($subcategory->subcategory_type, ['multiple_choice', 'checkbox'])) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Options can only be added to Multiple Choice or Checkbox subcategories.'
                ]);
            }

            $existingEvaluationFormSubcategoryOption = EvaluationFormSubcategoryOption
                ::where('subcategory_id', $request->subcategory_id)
                ->where('label', $request->label)
                ->first();

            if ($existingEvaluationFormSubcategoryOption) return response()->json([
                'status' => 409,
                'message' => 'This Evaluation Form Subcategory Option Label is already in use!',
                'evaluationFormSubcategoryOptionID' => $existingEvaluationFormSubcategoryOption->id
            ]);

            $isEmptyScore = !$request->has('score');
            if ($isEmptyScore) return response()->json([
                'status' => 400,
                'message' => 'Evaluation Form Subcategory Option Score is required!'
            ]);

            $order = (
                EvaluationFormSubcategoryOption::where('subcategory_id', $request->subcategory_id)->max('order')
                ?? 0
            ) + 1;

            $newEvaluationFormSubcategoryOption = EvaluationFormSubcategoryOption::create([

                
                'subcategory_id' => $request->subcategory_id,
                'label' => $request->label,
                'score' => (is_numeric($request->score) ? (double) $request->score : 1),
                'order' => $order,
                'description' => $request->description,
            ]);

            DB::commit();

            return response()->json([
                'status' => 201,
                'evaluationSubcategoryOptionID' => $newEvaluationFormSubcategoryOption->id,
                'message' => 'Evaluation Form Subcategory Option successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error saving evaluation form subcategory option: ' . $e->getMessage());

            throw $e;
        }
    }
    
}