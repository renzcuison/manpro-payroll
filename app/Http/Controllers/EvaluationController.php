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
class EvaluationController extends Controller
{

    // evaluation form

        public function getEvaluationFormSections(Request $request)
    {
        $formId = $request->form_id;

        if (!$formId) {
            return response()->json([
                'status' => 400,
                'message' => 'Form ID is required',
                'sections' => []
            ]);
        }

        $sections = \App\Models\EvaluationFormSection::with(['categories' => function($query) {
                $query->whereNull('deleted_at')->orderBy('order');
            }])
            ->where('form_id', $formId)
            ->whereNull('deleted_at')
            ->orderBy('order')
            ->get();

        return response()->json([
            'status' => 200,
            'sections' => $sections
        ]);
    }
       public function getFormDetails(Request $request, $formName)
    {
        // Fetch the form details by name along with the creator's name
        $form = EvaluationForm::join('users', 'evaluation_forms.creator_id', '=', 'users.id')
            ->where('evaluation_forms.name', $formName)
            ->select('evaluation_forms.id','evaluation_forms.name', 'evaluation_forms.created_at', 'users.first_name', 'users.last_name')
            ->first();

        // If the form doesn't exist, return an error
        if (!$form) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        // Prepare the full creator name
        $creatorName = $form->first_name . ' ' . $form->last_name;

        // Return the form details along with the creator's name and creation date
        return response()->json([
            'id' => $form->id,
            'formName' => $form->name,
            'created_at' => $form->created_at,
            'creator_name' => $creatorName
        ]);
    }

    public function deleteEvaluationForm(Request $request)
    {
        log::info('EvaluationController::deleteEvaluationForm');

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
        log::info('EvaluationController::editEvaluationForm');

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

        log::info('EvaluationController::getEvaluationForms');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

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
            ;
            $getById = (bool) $request->id;
            $evaluationForm = $evaluationForm
                ->where(
                    $getById ? 'evaluation_forms.id' : 'evaluation_forms.name',
                    $getById ? $request->id : $request->name
                )
                ->with(['sections' => fn ($section) =>
                    $section
                        ->select('form_id', 'id','name', 'order')
                        ->orderBy('order')
                        ->with(['categories' => fn ($category) =>
                            $category
                                ->select('section_id', 'id','name', 'order')
                                ->with(['subcategories' => fn ($subcategory) =>
                                    $subcategory
                                        ->select(
                                            'category_id', 'id',
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
                ])
                ->first()
            ;
            if( !$evaluationForm ) return response()->json([
                'status' => 404,
                'message' => 'No Evaluation Form found.',
                'evaluationForm' => $evaluationForm
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Evaluation Form successfully retrieved.',
                'evaluationForms' => $evaluationForm
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

    public function getEvaluationForms(Request $request)
    {

        log::info('EvaluationController::getEvaluationForms');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $evaluationForms = EvaluationForm
                ::join('users', 'evaluation_forms.id', '=', 'users.id')
                ->select(
                    'evaluation_forms.id',
                    'evaluation_forms.name', 
                    'evaluation_forms.creator_id',
                    'users.user_name as creator_user_name',
                    'evaluation_forms.created_at',
                    'evaluation_forms.updated_at'
                )
            ;
            if( $request->creator_id ) {

                $creator = DB::table('users')->select('*')->where('id', $request->creator_id)->first();
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
        log::info('EvaluationController::saveEvaluationForm');

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
        log::info('EvaluationController::deleteEvaluationFormSection');

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
        log::info('EvaluationController::editEvaluationFormSection');

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
                'evaluationFormID' => $request->id
            ]);

            $isEmptyName = !$request->name;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Section Name is required!'
            ]);

            $evaluationFormSection->name = $request->name;
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

        // get evaluation form section

        // move evaluation form section

    public function saveEvaluationFormSection(Request $request)
    {
        log::info('EvaluationController::saveEvaluationFormSection');

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

            $max = EvaluationFormSection::where('form_id', $request->form_id)->max('order') ?? 0;

            $newEvaluationFormSection = EvaluationFormSection::create([
                'form_id' => $request->form_id,
                'name' => $request->name,
                'order' => $max + 1
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationSectionID' => $newEvaluationFormSection->id,
                'message' => 'Evaluation Form Section successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation form category

    public function deleteEvaluationFormCategory(Request $request)
    {
        log::info('EvaluationController::deleteEvaluationFormCategory');

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

            $evaluationFormCategory = EvaluationFormCategory
                ::select('*')
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormCategory ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Category not found!',
                'evaluationFormCategoryID' => $request->id
            ]);

            if( $evaluationFormCategory->deleted_at ) return response()->json([ 
                'status' => 405,
                'message' => 'Evaluation Form Category already deleted!',
                'evaluationFormCategory' => $evaluationFormCategory
            ]);

            $now = date('Y-m-d H:i');
            $evaluationFormCategory->deleted_at = $now;
            $evaluationFormCategory->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormCategory' => $evaluationFormCategory,
                'message' => 'Evaluation Form Category successfully deleted'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    public function editEvaluationFormCategory(Request $request)
    {
        log::info('EvaluationController::editEvaluationFormCategory');

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

            $evaluationFormCategory = EvaluationFormCategory
                ::select( 'id', 'section_id', 'name', 'order', 'created_at', 'updated_at' )
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormCategory ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Category not found!',
                'evaluationFormID' => $request->id
            ]);

            $isEmptyName = !$request->name;

            if( $isEmptyName ) return response()->json([ 
                'status' => 400,
                'message' => 'Evaluation Form Category Name is required!'
            ]);

            $evaluationFormCategory->name = $request->name;
            $evaluationFormCategory->save();

            DB::commit();

            return response()->json([ 
                'status' => 200,
                'evaluationFormCategory' => $evaluationFormCategory,
                'message' => 'Evaluation Form Category successfully updated'
            ]);


        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

        // get evaluation form category

        // move evaluation form category

    public function saveEvaluationFormCategory(Request $request)
    {
        log::info('EvaluationController::saveEvaluationFormCategory');

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
                'message' => 'Evaluation Form Category Name is required!'
            ]);

            $max = EvaluationFormCategory::where('section_id', $request->section_id)->max('order') ?? 0;

            $newEvaluationFormCategory = EvaluationFormCategory::create([
                'section_id' => $request->section_id,
                'name' => $request->name,
                'order' => $max + 1
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationCategoryID' => $newEvaluationFormCategory->id,
                'message' => 'Evaluation Form Category successfully created'
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
        log::info('EvaluationController::deleteEvaluationFormSubcategory');

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
        log::info('EvaluationController::editEvaluationFormSubcategory');

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
                    'id', 'category_id', 'name', 'description',
                    'subcategory_type', 'required', 'allow_other_option',
                    'linear_scale_start', 'linear_scale_end', 'order', 'created_at', 'updated_at'
                )
                ->where('id', $request->id)
                ->first()
            ;

            if( !$evaluationFormSubcategory ) return response()->json([ 
                'status' => 404,
                'message' => 'Evaluation Form Subcategory not found!',
                'evaluationFormID' => $request->id
            ]);

            if($request->name) $evaluationFormSubcategory->name = $request->name;
            if($request->description) $evaluationFormSubcategory->description = $request->description;
            if(is_string($request->subcategory_type)) {

                $subcategory_types = array(
                    'checkbox','dropdown','linear_scale','long_answer','multiple_choice','short_answer'
                );
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
            if(is_numeric($request->linear_scale_start) && is_numeric($request->linear_scale_end)) {

                $request->linear_scale_start = floor($request->linear_scale_start);
                $request->linear_scale_end = floor($request->linear_scale_end);
                if($request->linear_scale_start<0 || $request->linear_scale_end<0)
                    return response()->json([
                        'status' => 400,
                        'message' => 'Evaluation Form Subcategory Linear Scale Value cannot not be negative!'
                    ]);
                if($request->linear_scale_start>=$request->linear_scale_end)
                    return response()->json([
                        'status' => 400,
                        'message' => 'Evaluation Form Subcategory Linear Scale Start must be less than End!'
                    ]);
                $evaluationFormSubcategory->linear_scale_start = $request->linear_scale_start;
                $evaluationFormSubcategory->linear_scale_end = $request->linear_scale_end;

            }

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

        // get evaluation form subcategory

        // move evaluation form subcategory

    public function saveEvaluationFormSubcategory(Request $request)
    {
        log::info('EvaluationController::saveEvaluationFormSubcategory');

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

            $max = EvaluationFormSubcategory::where('category_id', $request->category_id)->max('order') ?? 0;

            $newEvaluationFormSubcategory = EvaluationFormSubcategory::create([
                'category_id' => $request->category_id,
                'name' => $request->name,
                'subcategory_type' => 'short_answer',
                'description' => $request->description,
                'required' => 1,
                'linear_scale_start' => 1,
                'linear_scale_end' => 5,
                'order' => $max + 1
            ]);

            DB::commit();

            return response()->json([ 
                'status' => 201,
                'evaluationSubcategoryID' => $newEvaluationFormSubcategory->id,
                'message' => 'Evaluation Form Subcategory successfully created'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    }

    // evaluation form subcategory option

    public function deleteEvaluationFormSubcategoryOption(Request $request)
    {
        log::info('EvaluationController::deleteEvaluationFormSubcategoryOption');

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
        log::info('EvaluationController::editEvaluationFormSubcategoryOption');

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
                'evaluationFormID' => $request->id
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

        // get evaluation form subcategory option

        // move evaluation form subcategory option

    public function saveEvaluationFormSubcategoryOption(Request $request)
    {
        log::info('EvaluationController::saveEvaluationFormSubcategoryOption');

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

            $max = (
                EvaluationFormSubcategoryOption::where('subcategory_id', $request->subcategory_id)->max('order')
                ?? 0
            );

            $newEvaluationFormSubcategoryOption = EvaluationFormSubcategoryOption::create([
                'subcategory_id' => $request->subcategory_id,
                'label' => $request->label,
                'order' => $max + 1
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
























    // old

    // public function saveEvaluation(Request $request)
    // {
    //     log::info('EvaluationController::saveEvaluation');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('users')->select('*')->where('user_id', $userID)->first();

    //     try {
    //         DB::beginTransaction();

    //         $existingEvaluation = Evaluation::where('team', $user->team)->where('name', $request->formName)->first();

    //         if ( !$existingEvaluation ) {
    //             $newEvaluation = Evaluation::create([
    //                 'name'   => $request->formName,
    //                 'creator_id' => $user->user_id,
    //             ]);

    //             DB::commit();
    
    //             return response()->json([ 
    //                 'status' => 200,
    //                 'evaluationID' => $newEvaluation->id,
    //             ]);
    //         } else {
    //             return response()->json([ 
    //                 'status' => 409,
    //                 'evaluationID' => $existingEvaluation->id,
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function editEvaluation(Request $request)
    // {
    //     log::info('EvaluationController::editEvaluation');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     try {
    //         DB::beginTransaction();

    //         $user = DB::table('users')->select('*')->where('user_id', $userID)->first();
    //         $evaluation = Evaluation::where('id', $request->id)->first();

    //         $evaluation->name = $request->name;
    //         $evaluation->save();

    //         DB::commit();

    //         return response()->json([ 
    //             'status' => 200,
    //             'evaluation' => $evaluation,
    //         ]);


    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function saveAcknowledgement(Request $request)
    // {    
    //     $evaluationForm = EvaluationForm::findOrFail($request->formId);
    
    //     try {
    //         DB::beginTransaction();
    
    //         if ($request->has('signature')) {
    //             $signatureData = $request->input('signature');
                
    //             $imageData = explode(',', $signatureData)[1];
    //             $imageData = base64_decode($imageData);
                
    //             $dateTime = now()->format('Y-m-d_H-i-s');
    //             $fileName = 'evaluation_signature_' . $evaluationForm->id . '_' . $dateTime . '.png';
                
    //             // $filePath = public_path('signatures/' . $fileName);
    //             Storage::disk('public')->put($fileName, $imageData);

    //             $evaluationForm->status = 'Acknowledged';
    //             $evaluationForm->signature = $fileName;
    //         }
    
    //         $evaluationForm->save();

    //         DB::commit();
    
    //         return response()->json([ 
    //             'status' => 200,
    //             'evaluationID' => $evaluationForm,
    //         ]);
    
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    
    //         Log::error('Error saving work shift: ' . $e->getMessage());
    
    //         throw $e;
    //     }
    // }
    
    // public function getEvaluation(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    //     $evaluation = Evaluation::findOrFail($request->evaluation);
    //     $creator = User::findOrFail($evaluation->creator_id);

    //     if ( $user->team === $evaluation->team && $user->team === $creator->team ) {
    //         return response()->json([
    //             'status' => 200,
    //             'evaluation' => $evaluation,
    //             'creator' => $creator,
    //         ]);
    //     } else {
    //         return response()->json([
    //             'status' => 401,
    //             'evaluation' => [],
    //             'creator' => [],
    //         ]);
    //     }        
    // }

    // public function getEvaluations()
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = User::where('user_id', $userID)->first();
    //     $evaluations = Evaluation::where('team', $user->team)->get();

    //     return response()->json([
    //         'status' => 200,
    //         'evaluations' => $evaluations,
    //     ]);
    // }

    // public function saveCategory(Request $request)
    // {
    //     log::info('EvaluationController::saveCategory');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    //     $evaluation = Evaluation::findOrFail($request->evaluationID);

    //     try {
    //         DB::beginTransaction();

    //         $existingCategory = EvaluationCategory::where('evaluation_id', $evaluation->id)->where('name', $request->categoryName)->first();

    //         if ( !$existingCategory ) {
    //             $newCategory = EvaluationCategory::create([
    //                 'evaluation_id'   => $evaluation->id,
    //                 'name'   => $request->categoryName,
    //             ]);

    //             DB::commit();
    
    //             return response()->json([ 
    //                 'status' => 200,
    //                 'newCategory' => $newCategory->id,
    //             ]);
    //         } else {
    //             return response()->json([ 
    //                 'status' => 409,
    //                 'newCategory' => $existingCategory->id,
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving category: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function getCategories(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    //     $evaluation = Evaluation::findOrFail($request->evaluation);
    //     $categories = EvaluationCategory::with('indicators')->where('evaluation_id', $evaluation->id)->get();
        
    //     if ( $user->team === $evaluation->team ) {
    //         return response()->json([
    //             'status' => 200,
    //             'categories' => $categories,
    //         ]);
    //     } else {
    //         return response()->json([
    //             'status' => 401,
    //             'categories' => [],
    //         ]);
    //     }
    // }

    // public function saveRating(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    //     $evaluation = Evaluation::findOrFail($request->evaluationID);

    //     try {
    //         DB::beginTransaction();

    //         $existingRatingChoice = EvaluationRatingChoices::where('evaluation_id', $evaluation->id)->where('choice', $request->choiceName)->first();

    //         if ( !$existingRatingChoice ) {
    //             $newRatingChoice = EvaluationRatingChoices::create([
    //                 'evaluation_id' => $evaluation->id,
    //                 'choice' => $request->choiceName,
    //                 'score_min' => $request->scoreMin,
    //                 'score_max' => $request->scoreMax,
    //                 'description' => $request->description,
    //             ]);

    //             DB::commit();
    
    //             return response()->json([ 
    //                 'status' => 200,
    //                 'newRatingChoice' => $newRatingChoice->id,
    //             ]);
    //         } else {
    //             return response()->json([ 
    //                 'status' => 409,
    //                 'newRatingChoice' => $existingRatingChoice->id,
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving category: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function editRating(Request $request)
    // {
    //     $rating = EvaluationRatingChoices::findOrFail($request->ratingID);

    //     try {
    //         DB::beginTransaction();

    //         if ( $rating ) {
    //             $rating->choice = $request->choiceName;
    //             $rating->score_min = $request->scoreMin;
    //             $rating->score_max = $request->scoreMax;
    //             $rating->description = $request->description;
    //             $rating->save();

    //             DB::commit();
    
    //             return response()->json([ 
    //                 'status' => 200,
    //                 'rating' => $rating,
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving category: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function getRatings(Request $request)
    // {
    //     $ratings = EvaluationRatingChoices::where('evaluation_id', $request->evaluation)->get();

    //     return response()->json([
    //         'status' => 200,
    //         'ratings' => $ratings,
    //     ]);
    // }

    // public function getRating(Request $request)
    // {
    //     $rating = EvaluationRatingChoices::findOrFail($request->ratingID);

    //     return response()->json([
    //         'status' => 200,
    //         'rating' => $rating,
    //     ]);
    // }

    // public function saveIndicator(Request $request)
    // {
    //     $existingIndicator = EvaluationIndicators::where('category_id', $request->categoryID)->where('indicator', $request->indicator)->first();

    //     try {
    //         DB::beginTransaction();

    //         if ( !$existingIndicator ) {
    //             EvaluationIndicators::create([
    //                 'category_id' => $request->categoryID,
    //                 'indicator' => $request->indicator,
    //                 'type' => $request->type,
    //                 'description' => $request->description
    //             ]);

    //             DB::commit();
    
    //             return response()->json([ 'status' => 200 ]);
    //         } else {
    //             return response()->json([ 'status' => 409 ]);
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving category: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function editIndicator(Request $request)
    // {
    //     $indicator = EvaluationIndicators::findOrFail($request->id);

    //     try {
    //         DB::beginTransaction();

    //         if ( $indicator ) {

    //             $indicator->indicator = $request->indicator;
    //             $indicator->type = $request->type;
    //             $indicator->description = $request->description;
    //             $indicator->save();

    //             DB::commit();
    
    //             return response()->json([ 'status' => 200 ]);
    //         }
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving indicator: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function saveEvaluationForm(Request $request)
    // {
    //     log::info('EvaluationController::saveEvaluation');

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

    //     try {
    //         DB::beginTransaction();

    //         $evaluationForm = EvaluationForm::create([
    //             'evaluation_id'   => $request->evaluation,
    //             'employee_id'   => $request->employee,
    //             'evaluator_id' => $request->evaluator,
    //             'date' => $request->date,
    //             'period_from' => $request->periodFrom,
    //             'period_to' => $request->periodTo,
    //             'creator_id' => $userID,
    //             'status' => 'Pending',
    //         ]);

    //         DB::commit();

    //         return response()->json([ 
    //             'status' => 200,
    //             'formId' => $evaluationForm->id,
    //         ]);
          
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving work shift: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function getEvaluationForms(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }
    
    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    
    //     $evaluationForms = EvaluationForm::with('employee')->where('evaluator_id', $user->user_id)->get();
    
    //     return response()->json([
    //         'status' => 200,
    //         'evaluationForms' => $evaluationForms
    //     ]);
    // }

    // public function getEmployeeEvaluations(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }
    
    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    
    //     $evaluationForms = EvaluationForm::with('employee')->where('employee_id', $user->user_id)->where('status', 'Reviewed')->orWhere('status', 'Acknowledged')->get();
    
    //     return response()->json([
    //         'status' => 200,
    //         'evaluationForms' => $evaluationForms
    //     ]);
    // }

    // public function getEvaluationForm(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    //     // $evaluationForm = EvaluationForm::where('evaluator_id', $user->user_id)->where('id', $request->formID)->first();
    //     $evaluationForm = EvaluationForm::where('id', $request->formID)->first();
    //     $evaluation = Evaluation::where('id', $evaluationForm->evaluation_id)->first();
    //     $employee = User::where('user_id', $evaluationForm->employee_id)->first();
    //     $evaluator = User::where('user_id', $evaluationForm->evaluator_id)->first();

    
    //     return response()->json([
    //         'status' => 200,
    //         'evaluationForm' => $evaluationForm,
    //         'evaluation' => $evaluation,
    //         'employee' => $employee,
    //         'evaluator' => $evaluator
    //     ]);
    // }
    
    // public function saveEvaluationResponse(Request $request)
    // {
    //     log::info('EvaluationController::saveEvaluationResponse');

    //     log::info( $request );

    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     try {
    //         DB::beginTransaction();

    //         $form = EvaluationForm::find($request->form_id);
    //         $form->status = 'Evaluated';
    //         $form->save();

    //         $formResponse = EvaluationResponse::create([
    //             'form_id' => $request->form_id,
    //         ]);

    //         $hasNull = false;
    //         $nullIndicators = [];

    //         foreach ($request->responses as $indicatorID => $response) {

    //             $indicator = EvaluationIndicators::find($indicatorID);

    //             if ( $response === Null) {
    //                 $hasNull = true;
    //                 $nullIndicators[] = $indicator;
    //             } else {
    //                 switch ($indicator->type) {
    //                     case 'Rating':
    //                         EvaluationIndicatorResponses::create([
    //                             'response_id' => $formResponse->id,
    //                             'indicator_id' => $indicator->id,
    //                             'rating' => $response,
    //                         ]);
    //                         break;
    //                     case 'Comment':
    //                         EvaluationIndicatorResponses::create([
    //                             'response_id' => $formResponse->id,
    //                             'indicator_id' => $indicator->id,
    //                             'comment' => $response,
    //                         ]);
    //                         break;
    //                     default:
    //                         break;
    //                 }
    //             }

    //         }

    //         if ( $hasNull ) {
    //             return response()->json([ 
    //                 'status' => 400,
    //                 'nullIndicators' => $nullIndicators,
    //             ]);
    //         } else {
    //             // dd('Stopper');
    //             DB::commit();
    //             return response()->json([ 'status' => 200 ]);
    //         }
            
    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving category: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function getEvaluationAllForms(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }
    
    //     $user = DB::table('user')->select('*')->where('user_id', $userID)->first();
    
    //     $evaluationForms = EvaluationForm::with('evaluator')->with('employee')->whereHas('evaluation', function($query) use ($user) {
    //         $query->where('team', $user->team);
    //     })->get();
    
    //     return response()->json([
    //         'status' => 200,
    //         'evaluationForms' => $evaluationForms
    //     ]);
    // }

    // public function getEvaluationResponse(Request $request)
    // {
    //     $evaluationForm = EvaluationForm::where('id', $request->formID)->first();
    //     $evaluation = $evaluationForm->evaluation;

    //     $categories = EvaluationCategory::with('indicators')->where('evaluation_id', $evaluation->id)->get();
        
    //     return response()->json([
    //         'status' => 200,
    //         'categories' => $categories,
    //     ]);

    // }

    // public function approveEvaluation(Request $request)
    // {
    //     if (Auth::check()) {
    //         $userID = Auth::id();
    //     } else {
    //         $userID = null;
    //     }

    //     try {
    //         DB::beginTransaction();

    //         $form = EvaluationForm::find($request->formId);
    //         $form->status = 'Reviewed';
    //         $form->save();
            
    //         DB::commit();

    //         return response()->json([ 
    //             'status' => 200,
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();

    //         Log::error('Error saving category: ' . $e->getMessage());

    //         throw $e;
    //     }
    // }

    // public function getCategoryResponse(Request $request)
    // {
    //     log::info('EvaluationController::getCategoryResponse');

    //     $userID = Auth::check() ? Auth::id() : null;
    //     $user = $userID ? User::findOrFail($userID) : null;

    //     $evaluationForm = EvaluationForm::findOrFail($request->formId);
    //     $evaluation = Evaluation::findOrFail($evaluationForm->evaluation_id);

    //     $categories = EvaluationCategory::with(['indicators.response' => function ($query) use ($request) {
    //         $query->whereHas('response', function ($query) use ($request) {
    //             $query->where('form_id', $request->formId);
    //         });
    //     }])->where('evaluation_id', $evaluation->id)->get();

    //     if ($user && $user->team === $evaluation->team) {
    //         return response()->json([
    //             'status' => 200,
    //             'categories' => $categories,
    //         ]);
    //     } else {
    //         return response()->json([
    //             'status' => 401,
    //             'categories' => [],
    //         ]);
    //     }
    // }

}