<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\TrainingsModel;
use App\Models\TrainingContentModel;
use App\Models\TrainingFormAnswersModel;
use App\Models\TrainingViewsModel;
use App\Models\TrainingMediaModel;
use App\Models\TrainingFormsModel;
use App\Models\TrainingFormItemsModel;
use App\Models\TrainingFormChoicesModel;
use App\Models\TrainingFormResponsesModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use Carbon\Carbon;

class TrainingsController extends Controller
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

    // Training List ---------------------------------------------------------------- /
    public function getTrainings()
    {
        //Log::info("TrainingsController::getTrainings");
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                $trainings = TrainingsModel::where('client_id', $user->client_id)
                    ->select('trainings.*')
                    ->addSelect([
                        // Combined Content Type Check
                        'content_types' => function ($query) {
                            $query->selectRaw('JSON_OBJECT(
                            "has_video", SUM(CASE WHEN training_media.type = "Video" THEN 1 ELSE 0 END),
                            "has_image", SUM(CASE WHEN training_media.type = "Image" THEN 1 ELSE 0 END),
                            "has_attachment", SUM(CASE WHEN training_media.type IN ("Document", "PowerPoint") THEN 1 ELSE 0 END),
                            "has_form", SUM(CASE WHEN training_content.training_form_id IS NOT NULL THEN 1 ELSE 0 END)
                        )')
                                ->from('training_content')
                                ->leftJoin('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                                ->whereColumn('training_content.training_id', 'trainings.id');
                        },
                    ])
                    ->get()
                    ->map(function ($training) {
                        // Parse content types
                        $contentTypes = json_decode($training->content_types, true);
                        $training->video = (bool) ($contentTypes['has_video'] ?? 0);
                        $training->image = (bool) ($contentTypes['has_image'] ?? 0);
                        $training->attachment = (bool) ($contentTypes['has_attachment'] ?? 0);
                        $training->form = (bool) ($contentTypes['has_form'] ?? 0);

                        // Response Cleanup
                        unset($training->content_types);

                        return $training;
                    });

                return response()->json(['status' => 200, 'trainings' => $trainings]);
            } catch (\Exception $e) {
                Log::error("Error retrieving trainings: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error retrieving trainings'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }
    public function getEmployeeTrainings()
    {
        //Log::info("TrainingsController::getEmployeeTrainings");
        $user = Auth::user();

        try {
            $trainings = TrainingsModel::where('client_id', $user->client_id)
                ->where('status', 'Active')
                ->where('start_date', "<=", now())
                ->where('end_date', ">=", now())
                ->select('trainings.*')
                ->addSelect([
                    // Content Type Checks
                    'content_types' => function ($query) {
                        $query->selectRaw('JSON_OBJECT(
                        "has_video", SUM(CASE WHEN training_media.type = "Video" THEN 1 ELSE 0 END),
                        "has_image", SUM(CASE WHEN training_media.type = "Image" THEN 1 ELSE 0 END),
                        "has_attachment", SUM(CASE WHEN training_media.type IN ("Document", "PowerPoint") THEN 1 ELSE 0 END),
                        "has_form", SUM(CASE WHEN training_content.training_form_id IS NOT NULL THEN 1 ELSE 0 END)
                    )')
                            ->from('training_content')
                            ->leftJoin('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                            ->whereColumn('training_content.training_id', 'trainings.id');
                    }
                ])
                ->get()
                ->map(function ($training) use ($user) {
                    $totalContents = TrainingContentModel::where('training_id', $training->id)->count();

                    // View Trackers
                    $hasViews = TrainingContentModel::where('training_id', $training->id)
                        ->whereHas('views', function ($query) use ($user) {
                            $query->where('user_id', $user->id);
                        })
                        ->exists();
                    $completedContents = TrainingContentModel::where('training_id', $training->id)
                        ->whereHas('views', function ($query) use ($user) {
                            $query->where('user_id', $user->id)->where('status', 'Finished');
                        })
                        ->count();

                    // Appended Data
                    $contentTypes = json_decode($training->content_types, true);
                    $training->video = (bool) ($contentTypes['has_video'] ?? 0);
                    $training->image = (bool) ($contentTypes['has_image'] ?? 0);
                    $training->attachment = (bool) ($contentTypes['has_attachment'] ?? 0);
                    $training->form = (bool) ($contentTypes['has_form'] ?? 0);
                    $training->completed = $totalContents == $completedContents;
                    $training->viewed = $hasViews;

                    unset($training->content_types);

                    return $training;
                });

            return response()->json(['status' => 200, 'trainings' => $trainings]);
        } catch (\Exception $e) {
            Log::error("Error retrieving trainings: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error retrieving trainings'], 500);
        }
    }

    // Training CRUD ---------------------------------------------------------------- /
    public function saveTraining(Request $request)
    {
        //Log::info("TrainingsController::saveTraining");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $dateTime = now()->format('YmdHis');

                if ($request->hasFile('cover_image')) {
                    $cover = $request->file('cover_image');
                    $coverName = pathinfo($cover->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $cover->getClientOriginalExtension();
                    $coverPath = $cover->storeAs('trainings/covers', $coverName, 'public');
                }

                $uniqueCode = $this->generateRandomCode(16);
                while (TrainingsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                }

                TrainingsModel::create([
                    'unique_code' => $uniqueCode,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'cover_photo' => $coverPath ?? null,
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'duration' => $request->input('duration'),
                    'client_id' => $user->client_id,
                    'created_by' => $user->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editTraining(Request $request)
    {
        //Log::info("TrainingsController::editTraining");
        //Log::info($request);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $request->input('unique_code'))->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {

            try {
                DB::beginTransaction();

                $dateTime = now()->format('YmdHis');

                $training->title = $request->input('title');
                $training->description = $request->input('description');
                $training->start_date = $request->input('start_date');
                $training->end_date = $request->input('end_date');
                $training->duration = $request->input('duration');

                if ($request->hasFile('cover_image')) {
                    $oldCover = $training->cover_photo;

                    $cover = $request->file('cover_image');
                    $coverName = pathinfo($cover->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $cover->getClientOriginalExtension();
                    $coverPath = $cover->storeAs('trainings/covers', $coverName, 'public');

                    $training->cover_photo = $coverPath;

                    if ($oldCover && Storage::disk('public')->exists($oldCover)) {
                        Storage::disk('public')->delete($oldCover);
                    }
                }

                $training->save();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function updateTrainingStatus(Request $request)
    {
        //Log::info("TrainingsController::editTraining");
        //Log::info($request);

        $user = Auth::user();
        $training = TrainingsModel::where('unique_code', $request->input('code'))->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            try {
                DB::beginTransaction();


                $training->status = $request->input('status');
                $training->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => "Training status updated successfully"]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Content CRUD ----------------------------------------------------------------- /
    public function saveContent(Request $request)
    {
        //Log::info("TrainingsController::saveContent");
        //Log::info($request);

        $user = Auth::user();
        $training = TrainingsModel::where('unique_code', $request->input('unique_code'))
            ->select('id', 'client_id')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            $contentCount = TrainingContentModel::where('training_id', $training->id)->count();
            $nextOrder = $contentCount + 1;

            try {
                DB::beginTransaction();
                $contentType = $request->input('content_type');
                $dateTime = now()->format('YmdHis');

                $trainingMediaId = null;
                $trainingFormId = null;
                $source = null;

                switch ($contentType) {
                    case 'Video':
                        $source = $request->input('link');
                        if (!$source) {
                            return response()->json(['status' => 400, 'message' => 'Video link is required'], 400);
                        }
                        $contentData = TrainingMediaModel::create([
                            'type' => $contentType,
                            'source' => $source
                        ]);
                        $trainingMediaId = $contentData->id;
                        break;

                    case 'Image':
                    case 'Document':
                    case 'PowerPoint':
                        if (!$request->hasFile('file')) {
                            return response()->json(['status' => 400, 'message' => 'File is required'], 400);
                        }
                        $file = $request->file('file');
                        $location = 'trainings/' . strtolower($contentType) . 's';
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $source = $file->storeAs($location, $fileName, 'public');
                        $contentData = TrainingMediaModel::create([
                            'type' => $contentType,
                            'source' => $source
                        ]);
                        $trainingMediaId = $contentData->id;
                        break;

                    case 'Form':
                        $contentData = TrainingFormsModel::create([
                            'require_pass' => $request->input('attempt_policy') == "passing-required",
                            'passing_score' => $request->input('passing_score'),
                            'attempts_allowed' => $request->input('attempt_policy') == "limited-attempts" ? $request->input('attempts') : null,
                        ]);
                        $trainingFormId = $contentData->id;
                        break;

                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                TrainingContentModel::create([
                    'training_id' => $training->id,
                    'training_media_id' => $trainingMediaId,
                    'training_form_id' => $trainingFormId,
                    'order' => $nextOrder,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'duration' => $request->input('duration'),
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content saved successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving content: " . $e->getMessage());
                if (isset($source) && $contentType !== 'Video' && $contentType !== 'Form' && Storage::disk('public')->exists($source)) {
                    Storage::disk('public')->delete($source);
                }
                if (isset($trainingMediaId)) {
                    TrainingMediaModel::where('id', $trainingMediaId)->delete();
                }
                if (isset($trainingFormId)) {
                    TrainingFormsModel::where('id', $trainingFormId)->delete();
                }
                return response()->json(['status' => 500, 'message' => 'Error saving content'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editContent(Request $request)
    {
        Log::info("TrainingsController::editContent");
        Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            $content = TrainingContentModel::find($request->input('id'));

            if (!$content) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            try {
                DB::beginTransaction();

                $content->title = $request->input('title', $content->title);
                $content->description = $request->input('description', $content->description);
                $content->order = $request->input('order', $content->order);
                $content->duration = $request->input('duration');

                $relatedContent = null;
                $contentType = null;
                if ($content->training_media_id) {
                    $relatedContent = $content->media;
                    $contentType = $relatedContent ? $relatedContent->type : null;
                } elseif ($content->training_form_id) {
                    $relatedContent = $content->form;
                    $contentType = 'Form';
                }

                if (!$relatedContent) {
                    return response()->json(['status' => 400, 'message' => 'Related content not found'], 400);
                }

                $dateTime = now()->format('YmdHis');
                $newSource = null;

                switch ($contentType) {
                    case 'Video':
                        $newSource = $request->input('link');
                        if ($newSource && $newSource !== $relatedContent->source) {
                            $relatedContent->source = $newSource;
                            $relatedContent->save();
                        }
                        break;

                    case 'Image':
                    case 'Document':
                    case 'PowerPoint':
                        //Log::info($request->input('newFile'));
                        if ($request->hasFile('file') && $request->input('newFile') == "true") {
                            //Log::info("Replacing File");
                            $file = $request->file('file');
                            $location = 'trainings/' . strtolower($contentType) . 's';
                            $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                            $newSource = $file->storeAs($location, $fileName, 'public');

                            if ($relatedContent->source && $relatedContent->source !== $newSource && Storage::disk('public')->exists($relatedContent->source)) {
                                Storage::disk('public')->delete($relatedContent->source);
                            }

                            $relatedContent->source = $newSource;
                            $relatedContent->save();
                        }
                        break;

                    case 'Form':
                        $relatedContent->require_pass = $request->input('attempt_policy') == 'passing-required';
                        $relatedContent->attempts_allowed = $request->input('attempts');
                        $relatedContent->passing_score = $request->input('passing_score');
                        $relatedContent->save();
                        break;

                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                $content->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating content ID {$request->input('id')}: " . $e->getMessage());
                if (isset($newSource) && $contentType !== 'Video' && $contentType !== 'Form' && Storage::disk('public')->exists($newSource)) {
                    Storage::disk('public')->delete($newSource);
                }

                return response()->json(['status' => 500, 'message' => 'Error updating content'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function removeContent(Request $request)
    {
        // Log::info("TrainingsController::removeContent");
        // Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $content = TrainingContentModel::find($request->input('id'));
                if (!$content) {
                    return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
                }

                $deletedOrder = $content->order;
                $content->order = null;
                $content->save();
                $content->delete();

                TrainingContentModel::where('order', '>', $deletedOrder)
                    ->where('training_id', $content->training_id)
                    ->decrement('order', 1);

                // Training Media Soft Delete
                if ($content->training_media_id) {
                    $media = TrainingMediaModel::find($content->training_media_id);
                    $media->delete();
                }

                // Training Form Soft Delete
                if ($content->training_form_id) {
                    $formId = $content->training_form_id;

                    //Form Removal, Pending addition of SoftDeletes();
                    //$form = TrainingFormsModel::find($formId);
                    //$form->delete();

                    $formItems = TrainingFormItemsModel::where('form_id', $formId)->get();
                    if ($formItems->isNotEmpty()) {
                        $formItemIds = $formItems->pluck('id')->toArray();
                        TrainingFormChoicesModel::whereIn('form_item_id', $formItemIds)->delete();
                    }
                    TrainingFormItemsModel::where('form_id', $formId)->delete();
                }

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

    public function saveContentSettings(Request $request)
    {
        //Log::info("TrainingsController::saveContentSettings");
        //Log::info($request);

        $user = Auth::user();
        $order = $request->input('new_order');

        $training = TrainingsModel::where('unique_code', $request->input('unique_code'))
            ->with('contents')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            try {
                DB::beginTransaction();

                $training->sequential = $request->input('in_order');
                $training->save();

                $orderMap = [];
                foreach ($order as $ord) {
                    $orderMap[$ord['id']] = $ord['order'];
                }

                $training->contents()->update([
                    'order' => DB::raw("CASE id " . implode(' ', array_map(function ($id) use ($orderMap) {
                        return "WHEN $id THEN " . $orderMap[$id];
                    }, array_keys($orderMap))) . " END")
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content order updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error updating content order: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error updating content order'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Training, Content Details ---------------------------------------------------- /
    public function getTrainingDetails($code)
    {
        //Log::info("TrainingsController::getTrainingDetails");
        //Log::info($code);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->with('user')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            $author = $training->user;

            $training->author_name = implode(' ', array_filter([
                $author->first_name ?? null,
                $author->middle_name ?? null,
                $author->last_name ?? null,
                $author->suffix ?? null
            ]));
            $training->author_title = $author->jobTitle->name;

            if ($training->cover_photo && Storage::disk('public')->exists($training->cover_photo)) {
                $training->cover = base64_encode(Storage::disk('public')->get($training->cover_photo));
                $training->cover_name = basename($training->cover_photo);
            } else {
                $training->cover = null;
                $training->cover_name = null;
            }

            $trainingData = $training->toArray();
            unset($trainingData['user']);

            return response()->json(['status' => 200, 'training' => $trainingData]);
        } else {
            return response()->json(['status' => 200, 'training' => null]);
        }
    }

    public function getTrainingContent($code)
    {
        //Log::info("TrainingsController::getTrainingContent");
        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->select('id', 'client_id')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {

            $content = TrainingContentModel::with(['form', 'media'])
                ->where('training_id', $training->id)
                ->orderBy('order', 'asc')
                ->get()
                ->map(function ($cont) {
                    if ($cont->training_media_id) {
                        $cont->content = $cont->media;
                    } elseif ($cont->training_form_id) {
                        $formData = $cont->form;
                        $cont->content = $formData;
                        $cont->empty_form = $formData->items->count() == 0;
                    } else {
                        $cont->content = null;
                        $cont->empty_form = false;
                    }

                    if ($cont->training_media_id && $cont->media && $cont->media->type === 'Image') {
                        $filePath = $cont->media->source;
                        $fullPath = storage_path('app/public/' . $filePath);
                        if (Storage::disk('public')->exists($filePath)) {
                            $cont->image = base64_encode(Storage::disk('public')->get($filePath));
                            $cont->mime = mime_content_type($fullPath);
                        } else {
                            $cont->image = null;
                            $cont->mime = null;
                        }
                    } else {
                        $cont->image = null;
                        $cont->mime = null;
                    }

                    unset($cont->form, $cont->media);
                    return $cont;
                });

            return response()->json(['status' => 200, 'content' => $content]);
        } else {
            return response()->json(['status' => 200, 'content' => null]);
        }
    }

    public function getContentDetails($id)
    {
        // Log::info("TrainingsController::getContentDetails");

        $user = Auth::user();

        if ($this->checkUser()) {
            $content = TrainingContentModel::with(['form', 'media', 'views'])->find($id);

            if (!$content) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            // View Check
            $content->view_count = $content->views->where('status', 'Viewed')->count();
            $content->finished_count = $content->views->where('status', 'Finished')->count();

            $viewedUserIds = $content->views->pluck('user_id')->toArray();
            $content->no_view_count = UsersModel::where('client_id', $user->client_id)
                ->where('user_type', 'Employee')
                ->whereNotIn('id', $viewedUserIds)
                ->count();

            // Add latest views with user details
            $content->latest_views = $content->views()
                ->with('user')
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($view) {
                    $view->user_first_name = $view->user->first_name ?? 'N/A';
                    $view->user_last_name = $view->user->last_name ?? 'N/A';
                    unset($view->user);
                    return $view;
                });

            // Content Constructor
            if ($content->training_media_id) {
                $content->content = $content->media;
            } elseif ($content->training_form_id) {
                $formData = $content->form;
                $content->content = $formData;
                $content->content->type = "Form";
                $content->item_count = $formData->items->count();
                $content->total_points = $formData->items->sum('value') ?? 0;
            } else {
                $content->content = null;
            }

            $content->file = null;
            $content->file_mime = null;
            $content->file_size = null;

            // File -> Blob Conversion
            if ($content->training_media_id && $content->media && $content->media->type !== 'Video') {
                try {
                    $filePath = $content->media->source;
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (Storage::disk('public')->exists($filePath)) {
                        $content->file = base64_encode(Storage::disk('public')->get($filePath));
                        $content->file_mime = mime_content_type($fullPath);
                        $content->file_size = filesize($fullPath);
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to convert file to blob: " . $e->getMessage());
                }
            }

            unset($content->form, $content->media);

            return response()->json(['status' => 200, 'content' => $content]);
        } else {
            return response()->json(['status' => 403, 'content' => null]);
        }
    }

    public function getEmployeeTrainingDetails($code)
    {
        //Log::info("TrainingsController::getEmployeeTrainingDetails");
        //Log::info($code);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->where('client_id', $user->client_id)
            ->with('user')
            ->firstOrFail();

        $author = $training->user;

        $training->author_name = implode(' ', array_filter([
            $author->first_name ?? null,
            $author->middle_name ?? null,
            $author->last_name ?? null,
            $author->suffix ?? null
        ]));
        $training->author_title = $author->jobTitle->name;

        if ($training->cover_photo && Storage::disk('public')->exists($training->cover_photo)) {
            $training->cover = base64_encode(Storage::disk('public')->get($training->cover_photo));
            $training->cover_name = basename($training->cover_photo);
            $training->cover_mime =  mime_content_type(storage_path('app/public/' . $training->cover_photo));
        } else {
            $training->cover = null;
            $training->cover_name = null;
            $training->cover_mime = null;
        }

        $trainingData = $training->toArray();
        unset($trainingData['user']);

        return response()->json(['status' => 200, 'training' => $trainingData]);
    }

    public function getEmployeeTrainingContent($code)
    {
        // Log::info("TrainingsController::getEmployeeTrainingContent");
        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->where('client_id', $user->client_id)
            ->select('id')
            ->firstOrFail();

        $content = TrainingContentModel::with(['form', 'media', 'views' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
            ->where('training_id', $training->id)
            ->orderBy('order', 'asc')
            ->get()
            ->map(function ($contentItem) {
                $view = $contentItem->views->first();

                $contentItem->has_viewed = !is_null($view);
                $contentItem->viewed_at = $view ? $view->created_at : null;

                $contentItem->is_finished = false;
                $contentItem->completed_at = null;
                if ($view && $view->status === 'Finished') {
                    $contentItem->is_finished = true;
                    $contentItem->completed_at = $view->completed_at;
                }

                // Content Constructor
                if ($contentItem->training_media_id) {
                    $contentItem->content = $contentItem->media;
                } elseif ($contentItem->training_form_id) {
                    $contentItem->content = $contentItem->form;
                } else {
                    $contentItem->content = null;
                }

                if ($contentItem->training_media_id && $contentItem->media && $contentItem->media->type === 'Image') {
                    $filePath = $contentItem->media->source;
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (Storage::disk('public')->exists($filePath)) {
                        $contentItem->image = base64_encode(Storage::disk('public')->get($filePath));
                        $contentItem->mime = mime_content_type($fullPath);
                    } else {
                        $contentItem->image = null;
                        $contentItem->mime = null;
                    }
                } else {
                    $contentItem->image = null;
                    $contentItem->mime = null;
                }

                unset($contentItem->views, $contentItem->form, $contentItem->media);

                return $contentItem;
            });

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getEmployeeContentDetails($id)
    {
        // Log::info("TrainingsController::getEmployeeContentDetails");

        $user = Auth::user();

        $content = TrainingContentModel::with(['form', 'media', 'views' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }])->find($id);

        if (!$content) {
            return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
        }

        // View Check
        $view = $content->views->first();
        $content->has_viewed = !is_null($view);
        $content->is_finished = $view && $view->status === 'Finished';

        unset($content->views);

        // Content Constructor
        if ($content->training_media_id) {
            $content->content = $content->media;
        } elseif ($content->training_form_id) {
            $content->content = $content->form;
            $content->content->type = "Form";
        } else {
            $content->content = null;
        }

        $content->file = null;
        $content->file_mime = null;
        $content->file_size = null;

        // File -> Blob Conversion
        if ($content->training_media_id && $content->media && $content->media->type !== 'Video') {
            try {
                $filePath = $content->media->source;
                $fullPath = storage_path('app/public/' . $filePath);
                if (Storage::disk('public')->exists($filePath)) {
                    $content->file = base64_encode(Storage::disk('public')->get($filePath));
                    $content->file_mime = mime_content_type($fullPath);
                    $content->file_size = filesize($fullPath);
                }
            } catch (\Exception $e) {
                Log::error("Failed to convert file to blob: " . $e->getMessage());
            }
        }

        unset($content->form, $content->media);

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getPageCovers(Request $request)
    {
        //Log::info("TrainingsController::getPageCovers");

        $user = Auth::user();

        $trainingIds = $request->input('training_ids', []);

        $covers = array_fill_keys($trainingIds, null);

        $coverFiles = TrainingsModel::whereIn('id', $trainingIds)
            ->where('client_id', $user->client_id)
            ->select('id', 'cover_photo')
            ->get();

        $coverFiles->each(function ($file) use (&$covers) {
            if (Storage::disk('public')->exists($file->cover_photo)) {
                $covers[$file->id] = base64_encode(Storage::disk('public')->get($file->cover_photo));
            }
        });

        return response()->json(['status' => 200, 'covers' => array_values($covers)]);
    }

    public function getSource($id)
    {
        //Log::info("TrainingsController:getSource");
        //Log::info($id);

        try {
            $content = TrainingContentModel::with('media')->find($id);
            if (!$content || !$content->media->source) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            $filePath = $content->media->source;
            $fileContents = Storage::disk('public')->get($filePath);
            $base64 = base64_encode($fileContents);

            $mimeType = mime_content_type(storage_path('app/public/' . $filePath));
            $fileName = basename($filePath);

            return response()->json([
                'status' => 200,
                'file' => [
                    'data' => "data:{$mimeType};base64,{$base64}",
                    'name' => $fileName,
                    'size' => Storage::disk('public')->size($filePath),
                    'type' => $mimeType
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching file for content ID {$id}: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error fetching file'], 500);
        }
    }

    // Training Views --------------------------------------------------------------- /
    public function handleTrainingViews(Request $request)
    {
        // Log::info("TrainingsController:handleTrainingViews");
        // Log::info($request);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            $training = TrainingsModel::where('unique_code', $request->input('code'))->select('id')->firstOrFail();
            $content = TrainingContentModel::find($request->input('id'));

            $existing = TrainingViewsModel::with(['form', 'media'])
                ->where('training_content_id', $content->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($request->input("finished")) {
                if ($content->media && $content->media->type == "Image") {
                    if (!$existing) {
                        TrainingViewsModel::create([
                            'user_id' => $user->id,
                            'training_id' => $training->id,
                            'training_content_id' => $content->id,
                            'status' => "Finished",
                            'completed_at' => Carbon::now(),
                        ]);
                    }
                } else {
                    $view = TrainingViewsModel::where('training_content_id', $content->id)
                        ->where('user_id', $user->id)
                        ->firstOrFail();
                    $view->status = "Finished";
                    $view->completed_at = Carbon::now();
                    $view->save();
                }
            } else {
                if (!$existing) {
                    TrainingViewsModel::create([
                        'user_id' => $user->id,
                        'training_id' => $training->id,
                        'training_content_id' => $content->id,
                    ]);
                }
            }

            DB::commit();

            return response()->json(['status' => 200, 'message' => "Progress recorded successfully"]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 500, 'message' => "Failed to record user progress"]);
        }
    }

    public function getTrainingViews($id)
    {
        // Log::info("TrainingsController:getTrainingViews");
        // Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            $views = TrainingViewsModel::with('user')
                ->where('training_content_id', $id)
                ->orderBy('created_at', 'desc')
                ->get();

            $viewedIds = $views->pluck('user_id')->toArray();

            $views = $views->map(function ($view) {
                $emp = $view->user;
                return [
                    'emp_id' => $emp->id,
                    'emp_first_name' => $emp->first_name,
                    'emp_middle_name' => $emp->middle_name ?? '',
                    'emp_last_name' => $emp->last_name,
                    'emp_suffix' => $emp->suffix ?? '',
                    'emp_profile_pic' => $emp->profile_pic ?? null,
                    'status' => $view->status,
                    'viewed_at' => $view->created_at,
                    'completed_at' => $view->completed_at ?? null,
                ];
            })->all();

            $noViews = UsersModel::where('client_id', $user->client_id)
                ->where('user_type', 'Employee')
                ->whereNotIn('id', $viewedIds)
                ->get()
                ->map(function ($emp) {
                    return [
                        'emp_id' => $emp->id,
                        'emp_first_name' => $emp->first_name,
                        'emp_middle_name' => $emp->middle_name ?? '',
                        'emp_last_name' => $emp->last_name,
                        'emp_suffix' => $emp->suffix ?? '',
                        'emp_profile_pic' => $emp->profile_pic ?? null,
                    ];
                })->all();

            return response()->json(['status' => 200, 'views' => $views, 'no_views' => $noViews]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
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
        //Log::info("TrainingsController:getFormAnalytics");
        //Log::info($id);

        $user = Auth::user();

        if ($this->checkUser()) {
            $analytics = null;

            return response()->json(['status' => 200, 'analytics' => $analytics]);
        } else {
            return response()->json(['status' => 403, 'analytics' => null]);
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
                'choices' => $item->choices->map(function ($choice) {
                    return [
                        'id' => $choice->id,
                        'item_id' => $choice->form_item_id,
                        'description' => $choice->description,
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

            DB::commit();
            return response()->json(['status' => 200, 'message' => 'Form submitted successfully', 'passed' => $passed]);
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
        foreach ($items as $itemId => $item) {
            if (!isset($answers[$itemId])) {
                $evaluation[$itemId] = [null => 0];
            }
        }

        // Log::info("Evaluated Responses: ", $evaluation);
        return [
            'total_points' => (int) $totalPoints,
            'passing_score' => (int) $passingScore,
            'scores' => $evaluation,
        ];
    }

    // Others ----------------------------------------------------------------------- /
    function generateRandomCode($length)
    {
        // log::info("TrainingsController::generateRandomCode");
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }
}
