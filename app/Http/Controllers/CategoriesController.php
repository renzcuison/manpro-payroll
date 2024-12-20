<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class CategoriesController extends Controller
{
    public function announcementsList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $listCategory = DB::table('categories')
                ->select('*')
                ->where('category', 'announcements')
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $listCategory = DB::table('categories')
                ->select('*')
                ->where('category', 'announcements')
                ->where('is_deleted', 0)
                ->where('team', $user->team)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $listData = [];

        foreach ($listCategory as $list) {
            $announcementData = [
                'category_id' => $list->category_id,
                'title' => $list->title,
                'description' => $list->description,
                'attached_file' => $list->attached_file,
                'author_id' => $list->author_id,
                'created_at' => $list->created_at,
            ];

            $author = DB::table('user')
                ->select('*')
                ->where('user_id', $list->author_id)
                ->first();

            if ($author) {
                $announcementData += [
                    'author_fname' => $author->fname,
                    'author_mname' => $author->mname,
                    'author_lname' => $author->lname,
                    'author_profile_pic' => $author->profile_pic,
                ];
            }

            $listData[] = $announcementData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function trainingsList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $listCategory = DB::table('categories')
                ->select('*')
                ->where('category', 'trainings')
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $listCategory = DB::table('categories')
                ->select('*')
                ->where('category', 'trainings')
                ->where('is_deleted', 0)
                ->where('team', $user->team)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $listData = [];

        foreach ($listCategory as $list) {
            if ($list->course_type === "Assessment-based training") {
                $trainingData = [
                    'category_id' => $list->category_id,
                    'title' => $list->title,
                    'description' => $list->description,
                    'attached_file' => $list->attached_file,
                    'author_id' => $list->author_id,
                    'created_at' => $list->created_at,
                    'course_type' => $list->course_type,
                    'duration' => $list->duration,
                    'date_from_val' => $list->date_from_val,
                    'date_to_val' => $list->date_to_val,
                ];
            } else {
                $trainingData = [
                    'category_id' => $list->category_id,
                    'title' => $list->title,
                    'description' => $list->description,
                    'attached_file' => $list->attached_file,
                    'author_id' => $list->author_id,
                    'created_at' => $list->created_at,
                    'course_type' => $list->course_type,
                    'duration' => $list->duration,
                    'date_from_val' => $list->date_from_val,
                    'date_to_val' => $list->date_to_val,
                    'videoLink' => $list->video_link,
                ];
            }

            $author = DB::table('user')
                ->select('*')
                ->where('user_id', $list->author_id)
                ->first();

            if ($author) {
                $trainingData += [
                    'author_fname' => $author->fname,
                    'author_mname' => $author->mname,
                    'author_lname' => $author->lname,
                    'author_profile_pic' => $author->profile_pic,
                ];
            }

            $listData[] = $trainingData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function questionsList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $listQuestions = DB::table('categories_trainings_questions')
            ->select('*')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->get();

        $listData = [];

        foreach ($listQuestions as $list) {
            $choices = array_map('trim', explode(',', $list->choice_text));
            $choices = array_filter($choices, function ($choice) {
                return !empty($choice);
            });

            $questionsData = [
                'question_id' => $list->question_id,
                'category_id' => $list->category_id,
                'author_id' => $list->author_id,
                'question_text' => $list->question_text,
                'choice_text' => $choices,
                'answer_key' => $list->answer_key,
            ];

            $listData[] = $questionsData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function evaluationList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $listCategory = DB::table('categories')
                ->select('*')
                ->where('category', 'performance evaluations')
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $listCategory = DB::table('categories')
                ->select('*')
                ->where('category', 'performance evaluations')
                ->where('is_deleted', 0)
                ->where('team', $user->team)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $listData = [];

        foreach ($listCategory as $list) {
            $evaluationData = [
                'category_id' => $list->category_id,
                'author_id' => $list->author_id,
                'created_at' => $list->created_at,
                'date_from_val' => $list->date_from_val,
                'date_to_val' => $list->date_to_val,
                'color' => $list->color,
                'employee_id' => $list->employee_id,
                'evaluator_id' => $list->evaluator_id,
                'processtype' => $list->processtype,
                'signature' => $list->signature,
                'user_type' => $user->user_type,
                'overall_rating_name' => $list->overall_rating_name,
                'overall_rating_from' => $list->overall_rating_from,
                'overall_rating_to' => $list->overall_rating_to,
            ];

            $employee = DB::table('user')
                ->select('*')
                ->where('user_id', $list->employee_id)
                ->first();

            $evaluator = DB::table('user')
                ->select('*')
                ->where('user_id', $list->evaluator_id)
                ->first();

            if ($employee) {
                $evaluationData += [
                    'employee_fname' => $employee->fname,
                    'employee_mname' => $employee->mname,
                    'employee_lname' => $employee->lname,
                    'employee_profile_pic' => $employee->profile_pic,
                    'department' => $employee->department,
                    'designation' => $employee->category,
                    'status' => $employee->status,
                ];
            }
            if ($evaluator) {
                $evaluationData += [
                    'evaluator_fname' => $evaluator->fname,
                    'evaluator_mname' => $evaluator->mname,
                    'evaluator_lname' => $evaluator->lname,
                ];
            }

            $listData[] = $evaluationData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function memberEvaluationList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $listCategory = DB::table('categories')
            ->select('*')
            ->where('category', 'performance evaluations')
            ->where('is_deleted', 0)
            ->where('team', $user->team)
            ->where(function ($query) use ($user) {
                $query->where('employee_id', $user->user_id)
                    ->orWhere('evaluator_id', $user->user_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $listData = [];

        foreach ($listCategory as $list) {
            $evaluationData = [
                'category_id' => $list->category_id,
                'author_id' => $list->author_id,
                'created_at' => $list->created_at,
                'date_from_val' => $list->date_from_val,
                'date_to_val' => $list->date_to_val,
                'color' => $list->color,
                'employee_id' => $list->employee_id,
                'evaluator_id' => $list->evaluator_id,
                'processtype' => $list->processtype,
                'signature' => $list->signature,
                'user_type' => $user->user_type,
                'overall_rating_name' => $list->overall_rating_name,
                'overall_rating_from' => $list->overall_rating_from,
                'overall_rating_to' => $list->overall_rating_to,
            ];

            $employee = DB::table('user')
                ->select('*')
                ->where('user_id', $list->employee_id)
                ->first();

            $evaluator = DB::table('user')
                ->select('*')
                ->where('user_id', $list->evaluator_id)
                ->first();

            if ($employee) {
                $evaluationData += [
                    'employee_fname' => $employee->fname,
                    'employee_mname' => $employee->mname,
                    'employee_lname' => $employee->lname,
                    'employee_profile_pic' => $employee->profile_pic,
                    'department' => $employee->department,
                    'designation' => $employee->category,
                    'status' => $employee->status,
                ];
            }
            if ($evaluator) {
                $evaluationData += [
                    'evaluator_fname' => $evaluator->fname,
                    'evaluator_mname' => $evaluator->mname,
                    'evaluator_lname' => $evaluator->lname,
                ];
            }

            $listData[] = $evaluationData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function reportsList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $listCategory = DB::table('categories')
                ->select('categories.*', 'categories_incident_form.*')
                ->join('categories_incident_form', 'categories.category_id', '=', 'categories_incident_form.category_id')
                ->where('categories.category', 'reports')
                ->where('categories.is_deleted', 0)
                ->orderBy('categories.created_at', 'desc')
                ->get();
        } else {
            $listCategory = DB::table('categories')
                ->select('categories.*', 'categories_incident_form.*')
                ->join('categories_incident_form', 'categories.category_id', '=', 'categories_incident_form.category_id')
                ->where('categories.category', 'reports')
                ->where('categories.is_deleted', 0)
                ->where('categories.team', $user->team)
                ->orderBy('categories.created_at', 'desc')
                ->get();
        }

        $listData = [];

        foreach ($listCategory as $list) {
            $incidentsData = [
                'category_id' => $list->category_id,
                'report_date' => $list->date,
                'author_id' => $list->author_id,
                'created_at' => $list->created_at,
                'employee_id' => $list->employee_id,
                'employee_role' => $list->employee_role,
                'emp_signature' => $list->signature,
                'evaluator_id' => $list->evaluator_id,
                'visor_signature' => $list->evaluator_signature,
                'processtype' => $list->processtype,
                'user_type' => $user->user_type,
                'incident_id' => $list->incident_id,
                'incident_number' => $list->incident_number,
                'incident_date' => $list->incident_date,
                'incident_time' => $list->incident_time,
                'location' => $list->location,
                'injuries' => $list->injuries,
                'action_taken' => $list->action_taken,
                'details' => $list->details,
                'role1' => $list->role1,
                'role2' => $list->role2,
                'role3' => $list->role3,
                'follow_up' => $list->follow_up,
            ];

            $employee = DB::table('user')
                ->select('*')
                ->where('user_id', $list->employee_id)
                ->first();

            $evaluator = DB::table('user')
                ->select('*')
                ->where('user_id', $list->evaluator_id)
                ->first();

            if ($employee) {
                $incidentsData += [
                    'employee_fname' => $employee->fname,
                    'employee_mname' => $employee->mname,
                    'employee_lname' => $employee->lname,
                    'employee_profile_pic' => $employee->profile_pic,
                    'department' => $employee->department,
                    'designation' => $employee->category,
                    'status' => $employee->status,
                    'address' => $employee->address,
                    'contact_number' => $employee->contact_number,
                    'email' => $employee->email,
                ];
            }
            if ($evaluator) {
                $incidentsData += [
                    'evaluator_fname' => $evaluator->fname,
                    'evaluator_mname' => $evaluator->mname,
                    'evaluator_lname' => $evaluator->lname,
                ];
            }

            $witness1 = DB::table('user')
                ->select('*')
                ->where('user_id', $list->witness1_id)
                ->first();
            $witness2 = DB::table('user')
                ->select('*')
                ->where('user_id', $list->witness2_id)
                ->first();
            $witness3 = DB::table('user')
                ->select('*')
                ->where('user_id', $list->witness3_id)
                ->first();

            if ($witness1) {
                $incidentsData += [
                    'witness1_fname' => $witness1->fname,
                    'witness1_mname' => $witness1->mname,
                    'witness1_lname' => $witness1->lname,
                    'witness1_number' => $employee->contact_number,
                ];
            }
            if ($witness2) {
                $incidentsData += [
                    'witness2_fname' => $witness2->fname,
                    'witness2_mname' => $witness2->mname,
                    'witness2_lname' => $witness2->lname,
                    'witness2_number' => $employee->contact_number,
                ];
            }
            if ($witness3) {
                $incidentsData += [
                    'witness3_fname' => $witness3->fname,
                    'witness3_mname' => $witness3->mname,
                    'witness3_lname' => $witness3->lname,
                    'witness3_number' => $employee->contact_number,
                ];
            }

            $listData[] = $incidentsData;
        }

        return response()->json([
            'listData' => $listData,
        ]);
    }

    public function memberReportsList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $listCategory = DB::table('categories')
            ->select('categories.*', 'categories_incident_form.*')
            ->join('categories_incident_form', 'categories.category_id', '=', 'categories_incident_form.category_id')
            ->where('categories.category', 'reports')
            ->where('categories.is_deleted', 0)
            ->where('categories.team', $user->team)
            ->where(function ($query) use ($user) {
                $query->where('categories.employee_id', $user->user_id)
                    ->orWhere('categories.evaluator_id', $user->user_id)
                    ->orWhere('categories.author_id', $user->user_id);
            })
            ->orderBy('categories.created_at', 'desc')
            ->get();

        $listData = [];

        foreach ($listCategory as $list) {
            $incidentsData = [
                'category_id' => $list->category_id,
                'report_date' => $list->date,
                'author_id' => $list->author_id,
                'created_at' => $list->created_at,
                'employee_id' => $list->employee_id,
                'employee_role' => $list->employee_role,
                'emp_signature' => $list->signature,
                'evaluator_id' => $list->evaluator_id,
                'visor_signature' => $list->evaluator_signature,
                'processtype' => $list->processtype,
                'user_type' => $user->user_type,
                'incident_id' => $list->incident_id,
                'incident_number' => $list->incident_number,
                'incident_date' => $list->incident_date,
                'incident_time' => $list->incident_time,
                'location' => $list->location,
                'injuries' => $list->injuries,
                'action_taken' => $list->action_taken,
                'details' => $list->details,
                'role1' => $list->role1,
                'role2' => $list->role2,
                'role3' => $list->role3,
                'follow_up' => $list->follow_up,
            ];

            $employee = DB::table('user')
                ->select('*')
                ->where('user_id', $list->employee_id)
                ->first();

            $evaluator = DB::table('user')
                ->select('*')
                ->where('user_id', $list->evaluator_id)
                ->first();

            if ($employee) {
                $incidentsData += [
                    'employee_fname' => $employee->fname,
                    'employee_mname' => $employee->mname,
                    'employee_lname' => $employee->lname,
                    'employee_profile_pic' => $employee->profile_pic,
                    'department' => $employee->department,
                    'designation' => $employee->category,
                    'status' => $employee->status,
                    'address' => $employee->address,
                    'contact_number' => $employee->contact_number,
                    'email' => $employee->email,
                ];
            }
            if ($evaluator) {
                $incidentsData += [
                    'evaluator_fname' => $evaluator->fname,
                    'evaluator_mname' => $evaluator->mname,
                    'evaluator_lname' => $evaluator->lname,
                ];
            }

            $witness1 = DB::table('user')
                ->select('*')
                ->where('user_id', $list->witness1_id)
                ->first();
            $witness2 = DB::table('user')
                ->select('*')
                ->where('user_id', $list->witness2_id)
                ->first();
            $witness3 = DB::table('user')
                ->select('*')
                ->where('user_id', $list->witness3_id)
                ->first();

            if ($witness1) {
                $incidentsData += [
                    'witness1_fname' => $witness1->fname,
                    'witness1_mname' => $witness1->mname,
                    'witness1_lname' => $witness1->lname,
                    'witness1_number' => $employee->contact_number,
                ];
            }
            if ($witness2) {
                $incidentsData += [
                    'witness2_fname' => $witness2->fname,
                    'witness2_mname' => $witness2->mname,
                    'witness2_lname' => $witness2->lname,
                    'witness2_number' => $employee->contact_number,
                ];
            }
            if ($witness3) {
                $incidentsData += [
                    'witness3_fname' => $witness3->fname,
                    'witness3_mname' => $witness3->mname,
                    'witness3_lname' => $witness3->lname,
                    'witness3_number' => $employee->contact_number,
                ];
            }

            $listData[] = $incidentsData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function addCategory(Request $request)
    {
        log::info("CategoriesController::addCategory");
        
        $today = now()->format("Y-m-d H:i:s");
        $message = '';

        $validated = $request->validate([
            'category' => 'nullable',
            'employee_id' => 'nullable',
            'evaluator_id' => 'nullable',
            'title' => 'nullable',
            'description' => 'nullable',
            'course_type' => 'nullable',
            'duration' => 'nullable',
            'date_from_val' => 'nullable',
            'date_to_val' => 'nullable',
            'videoLink' => 'nullable',
            'cover_type' => 'nullable',
            'date_now' => 'nullable',
            'color' => 'nullable',
            'employee_role' => 'nullable',
            'incident_number' => 'nullable',
            'incident_date' => 'nullable',
            'incident_time' => 'nullable',
            'location' => 'nullable',
            'injuries' => 'nullable',
            'action_taken' => 'nullable',
            'details' => 'nullable',
            'witness1_id' => 'nullable',
            'witness2_id' => 'nullable',
            'witness3_id' => 'nullable',
            'role1' => 'nullable',
            'role2' => 'nullable',
            'role3' => 'nullable',
            'follow_up' => 'nullable',
        ]);

        if ($request->input('course_type') === "Assessment-based training" && $request->input('category') === 'training') {
            $questionsData = json_decode($request->input('questions'));
        }

        if ($request->input('category') === 'performance evaluation') {
            $performanceData = json_decode($request->input('performanceData'));
            $ratingsData = json_decode($request->input('ratingsData'));
        }

        if ($validated) {
            if (Auth::check()) {
                $userID = Auth::id();
            } else {
                $userID = null;
            }

            $user = DB::table('user')
                ->select('*')
                ->where('user_id', $userID)
                ->first();

            $cover = DB::table('categories')
                ->select('*')
                ->where('cover_type', 'default')
                ->where('category', '!=', 'performance evaluations')
                ->where('team', $user->team)
                ->where('is_deleted', 0)
                ->orderByDesc('created_at')
                ->first();

            $category = $request->input('category');
            $employee_id = $request->input('employee_id');
            $evaluator_id = $request->input('evaluator_id');
            $title = $request->input('title');
            $description = $request->input('description');
            $course_type = $request->input('course_type');
            $duration = $request->input('duration');
            $date_from_val = $request->input('date_from_val');
            $date_to_val = $request->input('date_to_val');
            $videoLink = $request->input('videoLink');
            $cover_type = $request->input('cover_type');
            $date_now = $request->input('date_now');
            $color = $request->input('color');
            $employee_role = $request->input('employee_role');
            $incident_number = $request->input('incident_number');
            $incident_date = $request->input('incident_date');
            $incident_time = $request->input('incident_time');
            $location = $request->input('location');
            $injuries = $request->input('injuries');
            $action_taken = $request->input('action_taken');
            $details = $request->input('details');
            $witness1_id = $request->input('witness1_id');
            $witness2_id = $request->input('witness2_id');
            $witness3_id = $request->input('witness3_id');
            $role1 = $request->input('role1');
            $role2 = $request->input('role2');
            $role3 = $request->input('role3');
            $follow_up = $request->input('follow_up');

            $filename = '';
            if ($request->hasFile('attached_file')) {
                $file = $request->file('attached_file');
                $filename = $file->getClientOriginalName();
                $destinationPath = storage_path('app/public');
                $file->move($destinationPath, $filename);
            }

            $signature = '';
            if ($request->hasFile('signature')) {
                $file = $request->file('signature');
                $signature = $file->getClientOriginalName();
                $destinationPath = storage_path('app/public');
                $file->move($destinationPath, $signature);
            }

            $evaluator_signature = '';
            if ($request->hasFile('evaluator_signature')) {
                $file = $request->file('evaluator_signature');
                $evaluator_signature = $file->getClientOriginalName();
                $destinationPath = storage_path('app/public');
                $file->move($destinationPath, $evaluator_signature);
            }

            if ($request->input('category') !== 'performance evaluation' && $request->input('category') !== 'report') {
                if ($cover) {
                    if ($cover_type === 'template') {
                        $dataToUpdate = [
                            'category' => $category . 's',
                            'title' => $title,
                            'description' => $description,
                            'author_id' => $userID,
                            'created_at' => $today,
                            'modified_at' => $today,
                            'team' => $user->team,
                            'cover_type' => $cover_type,
                            'attached_file' => $cover->attached_file,
                        ];
                    } else {
                        $dataToUpdate = [
                            'category' => $category . 's',
                            'title' => $title,
                            'description' => $description,
                            'author_id' => $userID,
                            'created_at' => $today,
                            'modified_at' => $today,
                            'team' => $user->team,
                            'cover_type' => $cover_type,
                            'attached_file' => $filename,
                        ];
                    }
                } else {
                    $dataToUpdate = [
                        'category' => $category . 's',
                        'title' => $title,
                        'description' => $description,
                        'author_id' => $userID,
                        'created_at' => $today,
                        'modified_at' => $today,
                        'team' => $user->team,
                        'cover_type' => $cover_type,
                        'attached_file' => $filename,
                    ];
                }
            } else {
                $dataToUpdate = [
                    'category' => $category . 's',
                    'title' => null,
                    'description' => null,
                    'author_id' => $userID,
                    'created_at' => $today,
                    'modified_at' => $today,
                    'team' => $user->team,
                    'cover_type' => null,
                    'attached_file' => null,
                ];
            }

            if ($category === 'training') {
                $dataToUpdate['course_type'] = $course_type;
                $dataToUpdate['duration'] = $duration;
                $dataToUpdate['date_from_val'] = $date_from_val;
                $dataToUpdate['date_to_val'] = $date_to_val;
                $dataToUpdate['video_link'] = $videoLink;
            }

            if ($category === 'performance evaluation') {
                $dataToUpdate['employee_id'] = $employee_id;
                $dataToUpdate['evaluator_id'] = $evaluator_id;
                $dataToUpdate['date_from_val'] = $date_from_val;
                $dataToUpdate['date_to_val'] = $date_to_val;
                $dataToUpdate['date'] = $date_now;
                $dataToUpdate['color'] = $color;
            }

            if ($category === 'report') {
                $dataToUpdate['date'] = $date_now;
                $dataToUpdate['employee_id'] = $employee_id;
                $dataToUpdate['employee_role'] = $employee_role;
                $dataToUpdate['signature'] = $signature;
                $dataToUpdate['evaluator_id'] = $evaluator_id;
                $dataToUpdate['evaluator_signature'] = $evaluator_signature;
            }

            try {
                $categoryID = DB::table('categories')->insertGetId($dataToUpdate);

                if ($request->input('category') !== 'performance evaluation' && $request->input('category') !== 'report') {
                    if ($questionsData && $request->input('course_type') === "Assessment-based training" && $request->input('category') === 'training') {
                        foreach ($questionsData as $question) {
                            DB::table('categories_trainings_questions')->insert([
                                'category_id' => $categoryID,
                                'author_id' => $userID,
                                'question_text' => $question->text,
                                'choice_text' => implode(', ', $question->choices),
                                'team' => $user->team
                            ]);
                        }
                    }
                } else if ($request->input('category') === 'report') {
                    DB::table('categories_incident_form')->insert([
                        'incident_number' => $incident_number,
                        'category_id' => $categoryID,
                        'incident_date' => $incident_date,
                        'incident_time' => $incident_time,
                        'location' => $location,
                        'injuries' => $injuries,
                        'action_taken' => $action_taken,
                        'details' => $details,
                        'witness1_id' => $witness1_id,
                        'witness2_id' => $witness2_id,
                        'witness3_id' => $witness3_id,
                        'role1' => $role1,
                        'role2' => $role2,
                        'role3' => $role3,
                        'follow_up' => $follow_up,
                        'team' => $user->team,
                        'created_at' => $today
                    ]);
                } else {
                    foreach ($performanceData as $performance) {
                        log::info("insertGetId into categories_evaluation_form");

                        $evaluationID = DB::table('categories_evaluation_form')->insertGetId([
                            'category_id' => $categoryID,
                            'performance_id' => $performance->performance_id,
                            'performance_name' => $performance->performance_name,
                            'performance_type' => $performance->performance_type,
                            'team' => $user->team,
                            'created_at' => $today,
                            'modified_at' => $today
                        ]);
                        foreach ($ratingsData as $ratings) {
                            if ($performance->performance_id === $ratings->performance_id) {
                                DB::table('categories_evaluation_form_ratings')->insert([
                                    'category_id' => $categoryID,
                                    'evaluation_id' => $evaluationID,
                                    'rating_name' => $ratings->rating_name,
                                    'rating_from' => $ratings->rating_from,
                                    'rating_to' => $ratings->rating_to,
                                    'performance_id' => $ratings->performance_id,
                                    'performance_type' => $ratings->performance_type,
                                    'description' => $ratings->description,
                                    'team' => $user->team,
                                    'created_at' => $today
                                ]);
                            }
                        }
                    }
                }
            } catch (\Exception $error) {
                $message = 'Something went wrong!' . $error;
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $validated,
            'user_id' => $userID,
            'msg' => "Success"
        ]);
    }

    public function getCategory($category_id)
    {
        $categoryId = $category_id;

        $announcement = DB::table('categories')->select('*')->where('category_id', $categoryId)->first();
        
        if (!$announcement) {
            return response()->json(['error' => 'Announcement not found'], 404);
        }
        
        return response()->json(['announcement' => $announcement], 200);
    }

    public function addEvaluation(Request $request)
    {
        $formData1 = json_decode($request->input('formData1'));
        $formData2 = json_decode($request->input('formData2'));
        $formData3 = json_decode($request->input('formData3'));
        $formData4 = json_decode($request->input('formData4'));

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
        $validated = $request->validate([
            'signature' => 'nullable|file|mimes:pdf,docx,jpg,jpeg,png',
        ]);

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($validated) {
            $dataToUpdate = [
                'signature' => $request->file('signature'),
            ];

            if ($request->hasFile('signature')) {
                $path = $request->file('signature')->store('public');

                $filename = basename($path);
                $dataToUpdate['signature'] = $filename;
            }

            try {
                DB::table('categories')
                    ->where('category_id', $request->input('category_id'))
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->where('category', 'performance evaluations')
                    ->update($dataToUpdate);
            } catch (\Exception $e) {
            }
        }

        try {
            foreach ($formData1 as $data) {
                DB::table('categories_evaluation_form')
                    ->where('category_id', $data->category_id)
                    ->where('performance_id', $data->performance_id)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->where('performance_type', 1)
                    ->update([
                        'performance_name' => $data->performance_name,
                        'selected_rating_name' => $data->selected_rating_name,
                        'selected_rating_from' => $data->selected_rating_from,
                        'selected_rating_to' => $data->selected_rating_to,
                        'performance_comment' => $data->performance_comment,
                    ]);
            }

            foreach ($formData2 as $data) {
                DB::table('categories_evaluation_form')
                    ->where('category_id', $data->category_id)
                    ->where('performance_id', $data->performance_id)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->where('performance_type', 2)
                    ->update([
                        'performance_name' => $data->performance_name,
                        'selected_rating_name' => $data->selected_rating_name,
                        'selected_rating_from' => $data->selected_rating_from,
                        'selected_rating_to' => $data->selected_rating_to,
                        'performance_comment' => $data->performance_comment,
                    ]);
            }

            foreach ($formData3 as $data) {
                DB::table('categories_evaluation_form')
                    ->where('category_id', $data->category_id)
                    ->where('performance_id', $data->performance_id)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->where('performance_type', 3)
                    ->update([
                        'performance_name' => $data->performance_name,
                    ]);
            }

            foreach ($formData4 as $data) {

                DB::table('categories')
                    ->where('category_id', $data->category_id)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->where('category', 'performance evaluations')
                    ->update([
                        'overall_rating_name' => $data->selected_rating_name,
                        'overall_rating_from' => $data->selected_rating_from,
                        'overall_rating_to' => $data->selected_rating_to,
                        'overall_rating_comment' => $data->performance_comment,
                        'description' => $data->description,
                        'evaluator_comment' => $data->evaluator_comment,
                        'evaluator_date' => $data->evaluator_date,
                        'processtype' => (int)($request->input('processtype')) + 1,
                        'author_comment' => $data->author_comment,
                        'author_date' => $data->author_date,
                        'employee_date' => $data->employee_date,
                    ]);
            }
        } catch (\Exception $error) {
            $message = 'Something went wrong!' . $error;
        }

        return response()->json([
            'status' => 200,
            'user_id' => $userID,
            'msg' => "Success"
        ]);
    }

    public function addIncident(Request $request)
    {
        $validated = $request->validate([
            'signature' => 'nullable|file|mimes:pdf,docx,jpg,jpeg,png',
            'evaluator_signature' => 'nullable|file|mimes:pdf,docx,jpg,jpeg,png',
            'follow_up' => 'nullable',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $signature = DB::table('categories')
            ->select('*')
            ->where('category_id', $request->input('category_id'))
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->where('category', 'reports')
            ->first();

        if ($validated) {
            $dataToUpdate = [
                'signature' => $request->file('signature'),
                'evaluator_signature' => $request->file('evaluator_signature'),
            ];

            if ($request->hasFile('signature')) {
                $path = $request->file('signature')->store('public');

                $filename = basename($path);
                $dataToUpdate['signature'] = $filename;
            } else {
                $dataToUpdate['signature'] = $signature->signature;
            }
            if ($request->hasFile('evaluator_signature')) {
                $path = $request->file('evaluator_signature')->store('public');

                $filename = basename($path);
                $dataToUpdate['evaluator_signature'] = $filename;
            } else {
                $dataToUpdate['evaluator_signature'] = $signature->evaluator_signature;
            }

            try {
                DB::table('categories')
                    ->where('category_id', $request->input('category_id'))
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->where('category', 'reports')
                    ->update($dataToUpdate);

                DB::table('categories_incident_form')
                    ->where('category_id', $request->input('category_id'))
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->update([
                        'follow_up' => $validated['follow_up'],
                    ]);
            } catch (\Exception $e) {
            }
        }

        return response()->json([
            'status' => 200,
            'user_id' => $userID,
            'msg' => "Success"
        ]);
    }

    public function editCategory(Request $request)
    {
        $today = now()->format("Y-m-d H:i:s");
        $message = '';

        $validated = $request->validate([
            'category_id' => 'required',
            'category' => 'required',
            'title' => 'required',
            'description' => 'required',
            'course_type' => 'nullable',
            'duration' => 'nullable',
            'date_from_val' => 'nullable',
            'date_to_val' => 'nullable',
            'videoLink' => 'nullable'
        ]);

        if ($request->input('course_type') === "Assessment-based training" && $request->input('category') === 'training') {
            $prevQuestionsData = json_decode($request->input('prevQuestions'));
            $newQuestionsData = json_decode($request->input('newQuestions'));
        }

        if ($validated) {
            if (Auth::check()) {
                $userID = Auth::id();
            } else {
                $userID = null;
            }
            $user = DB::table('user')
                ->select('*')
                ->where('user_id', $userID)
                ->first();

            $category_id = $request->input('category_id');
            $category = $request->input('category');
            $title = $request->input('title');
            $description = $request->input('description');
            $course_type = $request->input('course_type');
            $duration = $request->input('duration');
            $date_from_val = $request->input('date_from_val');
            $date_to_val = $request->input('date_to_val');
            $videoLink = $request->input('videoLink');

            $filename = '';

            if ($request->hasFile('attached_file')) {
                $file = $request->file('attached_file');
                $filename = $file->getClientOriginalName();
                $destinationPath = storage_path('app/public');
                $file->move($destinationPath, $filename);
            }

            $dataToUpdate = [
                'title' => $title,
                'description' => $description,
                'modified_at' => $today,
            ];

            if ($category === 'training') {
                $dataToUpdate['duration'] = $duration;
                $dataToUpdate['date_from_val'] = $date_from_val;
                $dataToUpdate['date_to_val'] = $date_to_val;
                $dataToUpdate['video_link'] = $videoLink;
            }

            try {

                if ($filename) {
                    $dataToUpdate['attached_file'] = $filename;

                    DB::table('categories')
                        ->where('category_id', $request->input('category_id'))
                        ->where('team', $user->team)
                        ->where('is_deleted', 0)
                        ->update($dataToUpdate);
                } else {
                    DB::table('categories')
                        ->where('category_id', $request->input('category_id'))
                        ->where('team', $user->team)
                        ->where('is_deleted', 0)
                        ->update($dataToUpdate);

                    $attached_file = DB::table('categories')
                        ->select('attached_file')
                        ->where('category_id', $request->input('category_id'))
                        ->where('team', $user->team)
                        ->where('is_deleted', 0)
                        ->first();

                    $editCategories = DB::table('categories')
                        ->where('category_id', $request->input('category_id'))
                        ->where('team', $user->team)
                        ->where('is_deleted', 0)
                        ->update([
                            'attached_file' => $attached_file->attached_file,
                        ]);
                }

                if ($prevQuestionsData && $request->input('course_type') === "Assessment-based training"  && $request->input('category') === 'training') {
                    $existingQuestionIds = [];

                    foreach ($prevQuestionsData as $question) {
                        DB::table('categories_trainings_questions')
                            ->where('category_id', $request->input('category_id'))
                            ->where('question_id', $question->question_id)
                            ->where('team', $user->team)
                            ->where('is_deleted', 0)
                            ->update([
                                'question_text' => $question->question_text,
                                'choice_text' => implode(', ', $question->choice_text),
                                'team' => $user->team
                            ]);

                        $existingQuestionIds[] = $question->question_id;
                    }

                    DB::table('categories_trainings_questions')
                        ->where('category_id', $request->input('category_id'))
                        ->where('team', $user->team)
                        ->where('is_deleted', 0)
                        ->whereNotIn('question_id', $existingQuestionIds)
                        ->delete();

                    DB::table('categories_trainings_answers')
                        ->where('category_id', $request->input('category_id'))
                        ->where('team', $user->team)
                        ->where('is_deleted', 0)
                        ->update([
                            'is_deleted' => 1,
                            'deleted_by' => $user->user_id
                        ]);
                }
                if ($newQuestionsData && $request->input('course_type') === "Assessment-based training"  && $request->input('category') === 'training') {
                    foreach ($newQuestionsData as $question) {
                        DB::table('categories_trainings_questions')->insert([
                            'category_id' => $request->input('category_id'),
                            'author_id' => $userID,
                            'question_text' => $question->question_text,
                            'choice_text' => implode(', ', $question->choice_text),
                            'team' => $user->team
                        ]);
                    }
                }
            } catch (\Exception $error) {
                $message = 'Something went wrong!' . $error;
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $message
        ]);
    }

    public function deleteCategory(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $delete = $request->validate([
            'category_id' => 'required',
        ]);
        try {
            DB::table('categories')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('categories_viewers')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('categories_trainings_questions')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('categories_trainings_answers')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('categories_evaluation_form')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('categories_evaluation_form_ratings')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('categories_incident_form')->where('category_id', $delete)
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);

            $message = 'Success';
            return response()->json([
                'status' => 200,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 200,
                'message' => $e
            ]);
        }
    }

    public function readByList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $listViewers = DB::table('categories_viewers')
            ->select('category_id', 'user_id')
            ->distinct()
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->get();

        $listData = [];

        foreach ($listViewers as $list) {
            $readByData = [
                'category_id' => $list->category_id,
                'user_id' => $list->user_id,
            ];

            $author = DB::table('user')
                ->select('fname', 'mname', 'lname')
                ->where('user_id', $list->user_id)
                ->where('user_type', '!=', 'Super Admin')
                ->first();

            if ($author) {
                $readByData += [
                    'fname' => $author->fname,
                    'mname' => $author->mname,
                    'lname' => $author->lname,
                ];
            }

            $listData[] = $readByData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function takeByList()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $takeBy = DB::table('categories_trainings_answers')
            ->select(
                'category_id',
                'user_id',
                DB::raw('MAX(answer_id) as answer_id'),
                DB::raw('GROUP_CONCAT(question_id) as question_id'),
                DB::raw('GROUP_CONCAT(answer_text) as answer_text'),
                DB::raw('SUM(checking) as checking_sum'),
                DB::raw('GROUP_CONCAT(checking) as checking_result'),
                DB::raw('MAX(created_at) as created_at')
            )
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->groupBy('category_id', 'user_id')
            ->get();

        $userIds = $takeBy->pluck('user_id')->unique();
        $userDetails = DB::table('user')
            ->select('user_id', 'fname', 'mname', 'lname')
            ->whereIn('user_id', $userIds)
            ->get()
            ->keyBy('user_id');

        $listData = [];

        foreach ($takeBy as $item) {
            $takeByData = [
                'answer_id' => $item->answer_id,
                'category_id' => $item->category_id,
                'user_id' => $item->user_id,
                'question_id' => $item->question_id,
                'answer_text' => $item->answer_text,
                'checking' => $item->checking_sum,
                'checking_result' => $item->checking_result,
                'created_at' => $item->created_at,
            ];

            $userId = $item->user_id;

            if (isset($userDetails[$userId])) {
                $user = $userDetails[$userId];
                $takeByData += [
                    'fname' => $user->fname,
                    'mname' => $user->mname,
                    'lname' => $user->lname,
                ];
            }

            $listData[] = $takeByData;
        }

        return response()->json(['listData' => $listData]);
    }

    public function addViewers(Request $request)
    {
        $today = now();
        $message = '';

        $validated = $request->validate([
            'category_id' => 'required',
        ]);

        if ($validated) {
            $category_id = $request->input('category_id');
            if (Auth::check()) {
                $userID = Auth::id();
            }

            $user = DB::table('user')
                ->select('*')
                ->where('user_id', $userID)
                ->first();

            try {
                $viewer = DB::table('categories_viewers')
                    ->where('category_id', $category_id)
                    ->where('user_id', $userID)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->first();

                if (!$viewer && $user->user_type !== 'Super Admin') {
                    DB::table('categories_viewers')->insert([
                        'user_id' => $userID,
                        'category_id' => $category_id,
                        'created_at' => $today,
                        'team' => $user->team,
                    ]);
                }
            } catch (\Exception $error) {
                $message = 'Something went wrong!' . $error;
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $message,
        ]);
    }

    public function addAnswers(Request $request)
    {
        $today = now();
        $message = '';

        $selectedChoices = json_decode($request->input('selectedChoices'));

        $validated = $request->validate([
            'category_id' => 'required',
        ]);

        if ($validated) {
            $category_id = $request->input('category_id');
            if (Auth::check()) {
                $userID = Auth::id();
            }

            $user = DB::table('user')
                ->select('*')
                ->where('user_id', $userID)
                ->first();

            try {
                $answers = DB::table('categories_trainings_answers')
                    ->where('category_id', $category_id)
                    ->where('user_id', $userID)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->first();

                $question = DB::table('categories_trainings_questions')
                    ->where('category_id', $category_id)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->get();

                $x = 0;
                $questionID = [];
                foreach ($question as $key) {
                    $questionID[$x] = $key->question_id;
                    $answerKey[$x] = $key->answer_key;
                    $x++;
                }

                if (!$answers) {
                    $y = 0;
                    foreach ($selectedChoices as $answer) {
                        if ($answer) {
                            if ($answer === $answerKey[$y]) {
                                $checking = 1;
                            } else {
                                $checking = 0;
                            }
                            DB::table('categories_trainings_answers')->insert([
                                'category_id' => $request->input('category_id'),
                                'user_id' => $userID,
                                'question_id' => $questionID[$y],
                                'answer_text' => $answer,
                                'checking' => $checking,
                                'created_at' => $today,
                                'team' => $user->team,
                            ]);
                            $y++;
                        }
                    }
                }
            } catch (\Exception $error) {
                $message = 'Something went wrong!' . $error;
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $message,
        ]);
    }

    public function addAnswerKey(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $message = '';

        $selectedChoices = json_decode($request->input('selectedChoices'));

        $validated = $request->validate([
            'category_id' => 'required',
        ]);

        if ($validated) {
            $category_id = $request->input('category_id');

            try {
                $answerkey = DB::table('categories_trainings_questions')
                    ->where('category_id', $category_id)
                    ->where('team', $user->team)
                    ->where('is_deleted', 0)
                    ->get();

                $x = 0;
                $questionID = [];
                foreach ($answerkey as $key) {
                    $questionID[$x++] = $key->question_id;
                }

                $y = 0;
                foreach ($selectedChoices as $answer) {
                    if ($answer) {
                        DB::table('categories_trainings_questions')
                            ->where('question_id', $questionID[$y++])
                            ->where('team', $user->team)
                            ->where('is_deleted', 0)
                            ->update([
                                'answer_key' => $answer,
                            ]);
                    }
                }
            } catch (\Exception $error) {
                $message = 'Something went wrong!' . $error;
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $message,
        ]);
    }

    public function getCover()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $cover = DB::table('categories')
            ->select('*')
            ->where('cover_type', 'default')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->orderByDesc('created_at')
            ->first();

        return response()->json(['coverData' => $cover ? 'Yes' : 'No']);
    }

    public function addPerformance(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'performance_name' => 'nullable|string',
            'performance_type' => 'required|numeric',
            'gridData.*.rate_description' => 'nullable|string',
            'gridData.*.rate_name' => 'nullable|string',
            'gridData.*.rate_start' => 'nullable|numeric',
            'gridData.*.rate_end' => 'nullable|numeric',
        ]);

        // Retrieve the user ID
        $userID = auth()->id();

        // Retrieve the user's team
        $team = auth()->user()->team;

        if ($validatedData['performance_type'] != 4) {
            // Insert the performance category into categories_performance table
            $performanceId = DB::table('categories_performance')->insertGetId([
                'performance_name' => $validatedData['performance_name'],
                'performance_type' => $validatedData['performance_type'],
                'team' => $team,
                'created_at' => now(),
            ]);
        } else {
            $performanceId = DB::table('categories_performance')->insertGetId([
                'performance_name' => 'Overall Rating',
                'performance_type' => $validatedData['performance_type'],
                'team' => $team,
                'created_at' => now(),
            ]);
        }

        // Insert the grid data into categories_performance_rating table
        foreach ($validatedData['gridData'] as $data) {
            if ($data['rate_name'] !== null && $data['rate_start'] !== null && $data['rate_end'] !== null) {
                DB::table('categories_performance_ratings')->insert([
                    'performance_id' => $performanceId,
                    'rating_name' => $data['rate_name'],
                    'rating_from' => $data['rate_start'],
                    'rating_to' => $data['rate_end'],
                    'description' => $data['rate_description'] ? $data['rate_description'] : null,
                    'performance_type' => $validatedData['performance_type'],
                    'team' => $team,
                    'created_at' => now(),
                ]);
            }
        }

        return response()->json([
            'status' => 200,
            'message' => 'Status Added Successfully'
        ]);
    }

    public function editPerformance(Request $request)
    {
        $validatedData = $request->validate([
            'performance_id' => 'required|numeric',
            'performance_name' => 'nullable|string',
            'performance_type' => 'required|numeric',
        ]);

        $validatedgridData = [];

        if ($validatedData['performance_type'] != 3) {
            $validatedgridData = $request->validate([
                'gridData.*.rate_id' => 'nullable|numeric',
                'gridData.*.rate_description' => 'nullable|string',
                'gridData.*.rate_name' => 'nullable|string',
                'gridData.*.rate_start' => 'nullable|numeric',
                'gridData.*.rate_end' => 'nullable|numeric',
            ]);
        }

        if ($validatedData['performance_type'] != 4) {
            DB::table('categories_performance')
                ->where('performance_id', $validatedData['performance_id'])
                ->update([
                    'performance_name' => $validatedData['performance_name'],
                ]);
        }

        if ($validatedData['performance_type'] != 3) {
            foreach ($validatedgridData['gridData'] as $data) {
                if ($data['rate_name'] !== null && $data['rate_start'] !== null && $data['rate_end'] !== null) {
                    DB::table('categories_performance_ratings')
                        ->where('rate_id', $data['rate_id'])
                        ->update([
                            'rating_name' => $data['rate_name'],
                            'rating_from' => $data['rate_start'],
                            'rating_to' => $data['rate_end'],
                            'description' => $data['rate_description'] ? $data['rate_description'] : null,
                        ]);
                }
            }
        }

        return response()->json([
            'status' => 200,
            'message' => 'Status Added Successfully'
        ]);
    }

    public function getPerformance()
    {
        log::info("CategoriesController::getPerformance");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        log::info("User ID: " . $userID);

        $user = User::where('user_id', $userID)->first();

        if ($user->user_type === 'Super Admin') {
            $performance = DB::table('categories_performance')->select('*')->orderBy('performance_id', 'ASC')->get();
            $ratings = DB::table('categories_performance_ratings')->select('*')->orderBy('rate_id', 'ASC')->get();
        } else {
            $performance = DB::table('categories_performance')->select('*')->where('team', $user->team)->orderBy('performance_id', 'ASC')->get();
            $ratings = DB::table('categories_performance_ratings')->select('*')->where('team', $user->team)->orderBy('rate_id', 'ASC')->get();
        }

        log::info($user);
        log::info($performance);

        return response()->json([
            'performance' => 200,
            'performance' => $performance,
            'ratings' => 200,
            'ratings' => $ratings
        ]);
    }

    public function getIncident()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $category = DB::table('categories')
                ->select('categories.*', 'categories_incident_form.*')
                ->join('categories_incident_form', 'categories.category_id', '=', 'categories_incident_form.category_id')
                ->where('categories.category', 'reports')
                ->orderBy('categories.category_id', 'ASC')
                ->get();
        } else {
            $category = DB::table('categories')
                ->select('categories.*', 'categories_incident_form.*')
                ->join('categories_incident_form', 'categories.category_id', '=', 'categories_incident_form.category_id')
                ->where('categories.category', 'reports')
                ->where('categories.team', $user->team)
                ->orderBy('categories.category_id', 'ASC')
                ->get();
        }

        $incidentID = DB::table('categories_incident_form')->select('*')->orderBy('incident_id', 'DESC')->first();

        return response()->json([
            'category' => 200,
            'category' => $category,
            'incident_id' => $incidentID ? $incidentID->incident_id : 0
        ]);
    }

    public function deletePerformance($id)
    {
        DB::table('categories_performance')->where('performance_id', $id)->delete();
        DB::table('categories_performance_ratings')->where('performance_id', $id)->delete();
        return response()->json([
            'status' => 200,
            'message' => 'Performance category has been removed'
        ]);
    }
}
