<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\TrainingsModel;
use App\Models\TrainingContentModel;
use App\Models\TrainingViewsModel;
use App\Models\TrainingMediaModel;
use App\Models\TrainingFormsModel;
use App\Models\TrainingFormItemsModel;
use App\Models\TrainingFormChoicesModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;


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

                $uniqueCode = $this->generateRandomCode(16);
                while (TrainingsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                }

                $training = TrainingsModel::create([
                    'unique_code' => $uniqueCode,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'duration' => $request->input('duration'),
                    'client_id' => $user->client_id,
                    'created_by' => $user->id,
                ]);

                if ($request->hasFile('cover_image')) {
                    $training->addMedia($request->file('cover_image'))
                        ->toMediaCollection('covers');
                }

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

                $training->title = $request->input('title');
                $training->description = $request->input('description');
                $training->start_date = $request->input('start_date');
                $training->end_date = $request->input('end_date');
                $training->duration = $request->input('duration');

                if ($request->hasFile('cover_image')) {
                    $training->addMedia($request->file('cover_image'))
                        ->toMediaCollection('covers');
                }
                $training->save();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                return response()->json(['status' => 500, 'message' => 'Failed to update training: ' . $e->getMessage()], 500);
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

            $training->cover = null;
            $training->cover_name = null;
            $media = $training->getFirstMedia('covers');
            if ($media) {
                $training->cover = base64_encode(file_get_contents($media->getPath()));
                $training->cover_name = $media->file_name;
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
        $trainingIds = $request->input('training_ids', []);
        $trainings = TrainingsModel::whereIn('id', $trainingIds)->get();

        $covers = array_fill_keys($trainingIds, null);
        foreach ($trainings as $training) {
            $coverMedia = $training->getMedia('covers')->first();
            if ($coverMedia) {
                $covers[$training->id] = base64_encode(file_get_contents($coverMedia->getPath()));
            }
        }

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
